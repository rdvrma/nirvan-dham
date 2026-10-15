// SERVER ONLY: what a guide can do (the API route /api/nirvan-sutra-guide/[action] is a thin wrapper; tests call this directly),
// and the view of learners a guide sees. Weekly reflections and the final reflection are not shown — only that they were written.
import * as E from '../engine';
import type { LocaleCode } from '../types';
import { guideStore, isGuide, cleanUrl, type GuideWeek } from './guide';

export class GuideError extends Error { constructor(msg: string, public status = 400) { super(msg); } }
const weekNo = (v: unknown) => { const n = Number(v); if (!Number.isInteger(n) || n < 1 || n > 12) throw new GuideError('week must be 1–12'); return n; };
const text = (v: unknown, max: number) => { if (v == null) return ''; if (typeof v !== 'string') throw new GuideError('text expected'); const s = v.trim(); if (s.length > max) throw new GuideError('text too long'); return s; };
const url = (v: unknown) => { try { return cleanUrl(v); } catch (e) { throw new GuideError((e as Error).message); } };

export async function handleGuideAction(guideId: string | null, action: string, body: Record<string, unknown>) {
  if (!(await isGuide())) throw new GuideError('guides only', 403);
  const g = await guideStore();
  switch (action) {
    case 'week': {
      const w: GuideWeek = { week: weekNo(body.week), liveSessionUrl: url(body.liveSessionUrl), recordingUrl: url(body.recordingUrl), sessionNote: text(body.sessionNote, 1500) || null };
      await g.saveWeek(w);
      return { ok: true, week: w };
    }
    case 'note': {
      const learnerId = String(body.learnerId ?? '');
      if (!/^[a-zA-Z0-9-]{8,64}$/.test(learnerId)) throw new GuideError('bad learner');
      await g.saveNote(learnerId, weekNo(body.week), text(body.note, 4000), guideId);
      return { ok: true };
    }
    default: throw new GuideError('unknown action', 404);
  }
}

export interface GuideLearnerView {
  id: string; name: string | null; locale: LocaleCode | null; stagesCompleted: number; inNididhyasana: boolean; currentWeek: number | null;
  attended: number; reflections: number; weeks: { n: number; attended: boolean; wroteReflection: boolean; doubts: { text: string; at: string }[]; note: string }[];
  finalReflectionDone: boolean; updatedAt: string;
}

export async function guideView(now = new Date()) {
  const g = await guideStore();
  const [weeks, learners, notes] = await Promise.all([g.weeks(), g.learners(), g.allNotes()]);
  const view: GuideLearnerView[] = learners.map((p) => {
    const part = E.participation(p);
    const n = notes[p.learnerId] ?? {};
    return {
      id: p.learnerId, name: p.name, locale: p.locale, stagesCompleted: p.stagesCompleted.length, inNididhyasana: !!p.nididhyasana.startedAt,
      currentWeek: p.nididhyasana.startedAt ? E.nididhyasanaWeek(p, now) : null, attended: part.attended, reflections: part.reflections,
      weeks: Array.from({ length: 12 }, (_, i) => { const w = p.nididhyasana.weeks[i + 1]; return { n: i + 1, attended: !!w?.attended, wroteReflection: !!w?.reflection, doubts: w?.doubts ?? [], note: n[i + 1] ?? '' }; }),
      finalReflectionDone: !!p.finalReflection, updatedAt: p.updatedAt,
    };
  }).sort((a, b) => Number(b.inNididhyasana) - Number(a.inNididhyasana) || b.updatedAt.localeCompare(a.updatedAt));
  return { weeks, learners: view };
}
