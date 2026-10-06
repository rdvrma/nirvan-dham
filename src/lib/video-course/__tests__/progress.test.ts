import { beforeEach, describe, expect, it } from 'vitest';
import { LocalStorageProgressAdapter, SupabaseProgressAdapter, type LessonAnswer, type LessonProgress, type ProgressAdapter, type StorageLike, type SupabaseLike } from '../progress';

// ── test doubles ───────────────────────────────────────────────────────────────────────────────────

class MemoryStorage implements StorageLike {
  data = new Map<string, string>();
  getItem(k: string) { return this.data.get(k) ?? null; }
  setItem(k: string, v: string) { this.data.set(k, v); }
}

type Row = Record<string, unknown>;

/** A mocked Supabase client: in-memory tables, row level security by user id, the real error shape for a missing table. */
function mockSupabase(opts: { userId: string | null; tables?: boolean; store?: Record<string, Row[]> }): SupabaseLike & { store: Record<string, Row[]>; calls: string[] } {
  const store = opts.store ?? { video_lesson_progress: [], video_lesson_answers: [] };
  const calls: string[] = [];
  const exists = opts.tables ?? true;
  const missing = (t: string) => ({ data: null, error: { code: 'PGRST205', message: `Could not find the table 'public.${t}' in the schema cache` } });
  return {
    store,
    calls,
    auth: { async getUser() { return { data: { user: opts.userId ? { id: opts.userId } : null } }; } },
    from(table: string) {
      calls.push(table);
      const filters: [string, unknown][] = [];
      const q = {
        select() { return q; },
        eq(col: string, val: unknown) { filters.push([col, val]); return q; },
        async maybeSingle() {
          if (!exists) return missing(table);
          const rows = (store[table] ?? []).filter((r) => r.user_id === opts.userId && filters.every(([c, v]) => r[c] === v));
          return { data: rows[0] ?? null, error: null };
        },
        then(resolve: (v: unknown) => unknown) {
          if (!exists) return resolve(missing(table));
          const rows = (store[table] ?? []).filter((r) => r.user_id === opts.userId && filters.every(([c, v]) => r[c] === v));
          return resolve({ data: rows, error: null });
        },
        async upsert(row: Row, o: { onConflict: string }) {
          if (!exists) return missing(table);
          if (row.user_id !== opts.userId) return { data: null, error: { code: '42501', message: 'new row violates row-level security policy' } };
          const keys = o.onConflict.split(',');
          const list = (store[table] ??= []);
          const i = list.findIndex((r) => keys.every((k) => r[k] === row[k]));
          if (i >= 0) list[i] = { ...list[i], ...row }; else list.push({ ...row });
          return { data: null, error: null };
        },
      };
      return q;
    },
  };
}

const progress = (over: Partial<LessonProgress> = {}): LessonProgress => ({ lessonId: 'lesson-1', positionSec: 61.5, completedPauseIds: ['p-g1'], updatedAt: '2026-10-03T10:00:00.000Z', ...over });
const answer = (over: Partial<LessonAnswer> = {}): LessonAnswer => ({ lessonId: 'lesson-1', pauseId: 'p-g1', segmentId: 'g1', promptIndex: 0, promptText: 'q', answer: 'a', updatedAt: '2026-10-03T10:00:00.000Z', ...over });

// ── the contract, run against every adapter ────────────────────────────────────────────────────────

function contract(name: string, make: () => ProgressAdapter) {
  describe(`ProgressAdapter contract: ${name}`, () => {
    let a: ProgressAdapter;
    beforeEach(() => { a = make(); });

    it('load returns null when nothing was saved', async () => {
      expect(await a.load('lesson-1')).toBeNull();
    });

    it('save then load round-trips, last write wins', async () => {
      await a.save(progress());
      await a.save(progress({ positionSec: 99, completedPauseIds: ['p-g1', 'p-g2'] }));
      expect(await a.load('lesson-1')).toMatchObject({ positionSec: 99, completedPauseIds: ['p-g1', 'p-g2'] });
    });

    it('lessons are separate', async () => {
      await a.save(progress({ lessonId: 'a', positionSec: 1 }));
      await a.save(progress({ lessonId: 'b', positionSec: 2 }));
      expect((await a.load('a'))?.positionSec).toBe(1);
      expect((await a.load('b'))?.positionSec).toBe(2);
    });

    it('saveAnswer replaces the same (pause, prompt) and keeps the others; listAnswers is ordered', async () => {
      await a.saveAnswer(answer({ pauseId: 'p-g2', promptIndex: 0, answer: 'two' }));
      await a.saveAnswer(answer({ pauseId: 'p-g1', promptIndex: 1, answer: 'one-b' }));
      await a.saveAnswer(answer({ pauseId: 'p-g1', promptIndex: 0, answer: 'one-a' }));
      await a.saveAnswer(answer({ pauseId: 'p-g1', promptIndex: 0, answer: 'one-a2' }));
      const list = await a.listAnswers('lesson-1');
      expect(list.map((x) => `${x.pauseId}/${x.promptIndex}/${x.answer}`)).toEqual(['p-g1/0/one-a2', 'p-g1/1/one-b', 'p-g2/0/two']);
    });

    it('listAnswers is empty for another lesson', async () => {
      await a.saveAnswer(answer());
      expect(await a.listAnswers('other')).toEqual([]);
    });
  });
}

contract('localStorage', () => new LocalStorageProgressAdapter(new MemoryStorage()));
contract('supabase (signed in, tables present)', () => new SupabaseProgressAdapter(mockSupabase({ userId: 'u1' }), new LocalStorageProgressAdapter(new MemoryStorage())));
contract('supabase (tables missing: degrades to the device)', () => new SupabaseProgressAdapter(mockSupabase({ userId: 'u1', tables: false }), new LocalStorageProgressAdapter(new MemoryStorage())));
contract('supabase (no signed-in user: degrades to the device)', () => new SupabaseProgressAdapter(mockSupabase({ userId: null }), new LocalStorageProgressAdapter(new MemoryStorage())));

// ── Supabase specifics ─────────────────────────────────────────────────────────────────────────────

describe('SupabaseProgressAdapter (mocked client)', () => {
  it('writes only the signed-in learner\'s rows to the two tables and no answer to the device', async () => {
    const db = mockSupabase({ userId: 'u1' });
    const dev = new MemoryStorage();
    const a = new SupabaseProgressAdapter(db, new LocalStorageProgressAdapter(dev));
    await a.saveAnswer(answer({ answer: 'private words' }));
    await a.save(progress());
    expect(db.store.video_lesson_answers).toHaveLength(1);
    expect(db.store.video_lesson_answers[0]).toMatchObject({ user_id: 'u1', lesson_id: 'lesson-1', pause_id: 'p-g1', answer: 'private words' });
    expect(db.store.video_lesson_progress[0]).toMatchObject({ user_id: 'u1', position_sec: 61.5, completed_pause_ids: ['p-g1'] });
    expect([...dev.data.keys()].some((k) => k.includes(':answers:'))).toBe(false); // answers are not copied to the device while the database works
    expect(new Set(db.calls)).toEqual(new Set(['video_lesson_answers', 'video_lesson_progress']));
  });

  it('never returns another learner\'s rows (RLS-like filtering by the session user)', async () => {
    const store = { video_lesson_progress: [], video_lesson_answers: [{ user_id: 'someone-else', lesson_id: 'lesson-1', pause_id: 'p-g1', segment_id: 'g1', prompt_index: 0, prompt_text: '', answer: 'theirs', updated_at: 'x' }] } as Record<string, Row[]>;
    const a = new SupabaseProgressAdapter(mockSupabase({ userId: 'u1', store }), new LocalStorageProgressAdapter(new MemoryStorage()));
    expect(await a.listAnswers('lesson-1')).toEqual([]);
  });

  it('after a missing-table error it stops calling the database and keeps working on the device (the preview works before any migration)', async () => {
    const db = mockSupabase({ userId: 'u1', tables: false });
    const a = new SupabaseProgressAdapter(db, new LocalStorageProgressAdapter(new MemoryStorage()));
    await a.save(progress());
    expect(a.isDegraded).toBe(true);
    const before = db.calls.length;
    await a.saveAnswer(answer());
    await a.listAnswers('lesson-1');
    expect(db.calls.length).toBe(before);
    expect((await a.listAnswers('lesson-1'))[0].answer).toBe('a');
  });

  it('a thrown auth error is not fatal', async () => {
    const db = mockSupabase({ userId: 'u1' });
    db.auth.getUser = async () => { throw new Error('network'); };
    const a = new SupabaseProgressAdapter(db, new LocalStorageProgressAdapter(new MemoryStorage()));
    await expect(a.save(progress())).resolves.toBeUndefined();
    expect((await a.load('lesson-1'))?.positionSec).toBe(61.5);
  });
});

describe('LocalStorageProgressAdapter robustness', () => {
  it('survives a broken value and a storage that refuses writes', async () => {
    const s = new MemoryStorage();
    s.setItem('nirvan-video-course:v1:progress:lesson-1', '{not json');
    const a = new LocalStorageProgressAdapter(s);
    expect(await a.load('lesson-1')).toBeNull();
    const refusing: StorageLike = { getItem: () => null, setItem: () => { throw new Error('quota'); } };
    await expect(new LocalStorageProgressAdapter(refusing).save(progress())).resolves.toBeUndefined();
    await expect(new LocalStorageProgressAdapter(null).save(progress())).resolves.toBeUndefined();
  });
});
