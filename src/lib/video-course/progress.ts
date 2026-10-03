// Progress and answers: the ProgressAdapter contract, the localStorage adapter and the Supabase adapter (which degrades to localStorage).
// Reflection answers are personal: see docs/video-course/privacy.md. They are never read by any admin or analytics code.

export interface LessonProgress {
  lessonId: string;
  positionSec: number;
  completedPauseIds: string[];
  updatedAt: string;
}

export interface LessonAnswer {
  lessonId: string;
  pauseId: string;
  segmentId: string;
  promptIndex: number;
  promptText: string;
  answer: string;
  updatedAt: string;
}

/**
 * The contract every adapter keeps (tested in progress.test.ts against both implementations):
 *  - load returns null when nothing was saved; save is last-write-wins per lesson;
 *  - saveAnswer replaces the answer for the same (lesson, pause, prompt) and never touches other answers;
 *  - listAnswers returns only the current learner's answers for the lesson, ordered by pause id then prompt index;
 *  - no method throws for a missing backend: an adapter that cannot reach its store falls back or resolves quietly.
 */
export interface ProgressAdapter {
  readonly name: string;
  load(lessonId: string): Promise<LessonProgress | null>;
  save(progress: LessonProgress): Promise<void>;
  saveAnswer(answer: LessonAnswer): Promise<void>;
  listAnswers(lessonId: string): Promise<LessonAnswer[]>;
}

const sortAnswers = (a: LessonAnswer, b: LessonAnswer) => (a.pauseId === b.pauseId ? a.promptIndex - b.promptIndex : a.pauseId.localeCompare(b.pauseId));

// ── localStorage ───────────────────────────────────────────────────────────────────────────────────

const PREFIX = 'nirvan-video-course:v1';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function safeLocalStorage(): StorageLike | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export class LocalStorageProgressAdapter implements ProgressAdapter {
  readonly name = 'localStorage';
  private readonly storage: StorageLike | null;
  constructor(storage?: StorageLike | null) {
    this.storage = storage === undefined ? safeLocalStorage() : storage;
  }

  private read<T>(key: string, fallback: T): T {
    try {
      const raw = this.storage?.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }
  private write(key: string, value: unknown) {
    try {
      this.storage?.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or blocked: the lesson still plays */
    }
  }

  async load(lessonId: string) {
    return this.read<LessonProgress | null>(`${PREFIX}:progress:${lessonId}`, null);
  }
  async save(p: LessonProgress) {
    this.write(`${PREFIX}:progress:${p.lessonId}`, p);
  }
  async saveAnswer(a: LessonAnswer) {
    const key = `${PREFIX}:answers:${a.lessonId}`;
    const all = this.read<LessonAnswer[]>(key, []).filter((x) => !(x.pauseId === a.pauseId && x.promptIndex === a.promptIndex));
    all.push(a);
    this.write(key, all);
  }
  async listAnswers(lessonId: string) {
    return this.read<LessonAnswer[]>(`${PREFIX}:answers:${lessonId}`, []).sort(sortAnswers);
  }
}

// ── Supabase ───────────────────────────────────────────────────────────────────────────────────────

/** The part of the site's EXISTING Supabase client (src/utils/supabase/client.ts) that the adapter uses. */
export interface SupabaseLike {
  auth: { getUser(): Promise<{ data: { user: { id: string } | null } }> };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from(table: string): any;
}

const TABLE_MISSING = /42P01|PGRST205|PGRST204|does not exist|could not find the table|schema cache/i;

/**
 * Stores progress and answers in video_lesson_progress / video_lesson_answers with the learner's own session (row level security does the rest).
 * Degrades gracefully: no signed-in user, a missing table (the migration is not applied yet) or any error -> the localStorage adapter takes over, so the preview works
 * before any migration. Answers are kept on the device only in that degraded mode.
 */
export class SupabaseProgressAdapter implements ProgressAdapter {
  readonly name = 'supabase';
  private degraded = false;
  private readonly fallback: ProgressAdapter;
  constructor(private readonly client: SupabaseLike, fallback?: ProgressAdapter) {
    this.fallback = fallback ?? new LocalStorageProgressAdapter();
  }

  get isDegraded() {
    return this.degraded;
  }

  private async userId(): Promise<string | null> {
    if (this.degraded) return null;
    try {
      const { data } = await this.client.auth.getUser();
      return data.user?.id ?? null;
    } catch {
      return null;
    }
  }
  private failed(error: { code?: string; message?: string } | null | undefined): boolean {
    if (!error) return false;
    if (TABLE_MISSING.test(`${error.code ?? ''} ${error.message ?? ''}`)) this.degraded = true;
    return true;
  }

  async load(lessonId: string): Promise<LessonProgress | null> {
    const uid = await this.userId();
    if (uid) {
      const { data, error } = await this.client.from('video_lesson_progress').select('lesson_id, position_sec, completed_pause_ids, updated_at').eq('user_id', uid).eq('lesson_id', lessonId).maybeSingle();
      if (!this.failed(error) && data) return { lessonId, positionSec: Number(data.position_sec) || 0, completedPauseIds: data.completed_pause_ids ?? [], updatedAt: data.updated_at };
    }
    return this.fallback.load(lessonId);
  }

  async save(p: LessonProgress): Promise<void> {
    const uid = await this.userId();
    if (uid) {
      const { error } = await this.client
        .from('video_lesson_progress')
        .upsert({ user_id: uid, lesson_id: p.lessonId, position_sec: p.positionSec, completed_pause_ids: p.completedPauseIds, updated_at: p.updatedAt }, { onConflict: 'user_id,lesson_id' });
      if (!this.failed(error)) {
        await this.fallback.save(p); // the position is not sensitive: a device copy lets the lesson resume at once
        return;
      }
    }
    await this.fallback.save(p);
  }

  async saveAnswer(a: LessonAnswer): Promise<void> {
    const uid = await this.userId();
    if (uid) {
      const { error } = await this.client
        .from('video_lesson_answers')
        .upsert(
          { user_id: uid, lesson_id: a.lessonId, pause_id: a.pauseId, segment_id: a.segmentId, prompt_index: a.promptIndex, prompt_text: a.promptText, answer: a.answer, updated_at: a.updatedAt },
          { onConflict: 'user_id,lesson_id,pause_id,prompt_index' },
        );
      if (!this.failed(error)) return; // stored in the learner's own rows only: no copy on the device
    }
    await this.fallback.saveAnswer(a);
  }

  async listAnswers(lessonId: string): Promise<LessonAnswer[]> {
    const uid = await this.userId();
    if (uid) {
      const { data, error } = await this.client.from('video_lesson_answers').select('lesson_id, pause_id, segment_id, prompt_index, prompt_text, answer, updated_at').eq('user_id', uid).eq('lesson_id', lessonId);
      if (!this.failed(error) && Array.isArray(data)) {
        return data
          .map((r: Record<string, unknown>) => ({
            lessonId: String(r.lesson_id),
            pauseId: String(r.pause_id),
            segmentId: String(r.segment_id ?? ''),
            promptIndex: Number(r.prompt_index),
            promptText: String(r.prompt_text ?? ''),
            answer: String(r.answer ?? ''),
            updatedAt: String(r.updated_at ?? ''),
          }))
          .sort(sortAnswers);
      }
    }
    return this.fallback.listAnswers(lessonId);
  }
}

/** The Ask-the-Guide hook. The AI behind it is parked: the default adapter answers nothing and the UI says the Guide is not connected yet. */
export interface GuideContext {
  lessonId: string;
  segmentId: string;
  timeSec: number;
  captionLanguage: string;
}
export interface GuideAdapter {
  ask(context: GuideContext): Promise<{ message: string }> | { message: string };
}
export const noopGuideAdapter: GuideAdapter = { ask: () => ({ message: '' }) };
