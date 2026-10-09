// The progression rules of Nirvan Sutra, as pure functions of the learner's progress (tested in tests/nirvan-sutra-engine.test.ts).
// Completing a stage means the curriculum of that stage is done — never an attainment.
import type { Progress, LocaleCode, AssessmentAttempt } from './types';
import { PROGRAM, STAGE_IDS, CHECKPOINTS, stageNumber, stageId, questionIdsOf, MOVEMENTS, writtenKey } from './structure';

export type StageState = 'locked' | 'current' | 'available' | 'completed';

export function newProgress(learnerId: string, now = new Date()): Progress {
  const at = now.toISOString();
  return {
    learnerId, name: null, locale: null, enrolledAt: at, updatedAt: at, lastVisited: null,
    mainViewed: [], stageChecks: {}, written: {}, stagesCompleted: [], questionsViewed: [], reflections: {},
    checkpoints: {}, final: [], nididhyasana: { startedAt: null, weeks: {} }, finalReflection: null,
  };
}

export const isStageCompleted = (p: Progress, stage: string) => p.stagesCompleted.includes(stage);
export const isStageUnlocked = (p: Progress, stage: string) => stageNumber(stage) === 1 || isStageCompleted(p, stageId(stageNumber(stage) - 1));
/** The first stage not yet completed (null when all 17 are). */
export const currentStage = (p: Progress) => STAGE_IDS.find((s) => !isStageCompleted(p, s)) ?? null;

export function stageState(p: Progress, stage: string): StageState {
  if (isStageCompleted(p, stage)) return 'completed';
  if (!isStageUnlocked(p, stage)) return 'locked';
  return currentStage(p) === stage ? 'current' : 'available';
}

/** Own-words answers were given (there is no right or wrong in them; giving them is the requirement). */
export const writtenDone = (p: Progress, key: string) => (p.written?.[key]?.answers.length ?? 0) > 0;
/** The stage check is the three own-words answers of the stage. */
export const stageWritten = (p: Progress, stage: string) => writtenDone(p, writtenKey('stage', stage));

/** What a stage still needs before it can be completed. */
export function stageRequirements(p: Progress, stage: string) {
  return { mainViewed: p.mainViewed.includes(stage), written: stageWritten(p, stage) };
}
export const canCompleteStage = (p: Progress, stage: string) => {
  const r = stageRequirements(p, stage);
  return isStageUnlocked(p, stage) && r.mainViewed && r.written;
};

export const questionsViewedIn = (p: Progress, stage: string) => questionIdsOf(stage).filter((q) => p.questionsViewed.includes(q)).length;

// ── checkpoints and the final assessment ─────────────────────────────────────
export const checkpointUnlocked = (p: Progress, id: string) => { const c = CHECKPOINTS.find((x) => x.id === id); return !!c && isStageCompleted(p, stageId(c.afterStage)); };
/** A checkpoint is done when it was taken: its questions answered and its own-words answers given (no pass mark). */
export const checkpointDone = (p: Progress, id: string) => (p.checkpoints[id]?.length ?? 0) > 0 && writtenDone(p, writtenKey('checkpoint', id));
export const allStagesCompleted = (p: Progress) => STAGE_IDS.every((s) => isStageCompleted(p, s));
export const allCheckpointsDone = (p: Progress) => CHECKPOINTS.every((c) => checkpointDone(p, c.id));
export const finalUnlocked = (p: Progress) => allStagesCompleted(p);
export const bestFinal = (p: Progress): AssessmentAttempt | null => p.final.reduce<AssessmentAttempt | null>((b, a) => (!b || a.score / a.total > b.score / b.total ? a : b), null);
/** The final: the objective part at the threshold and the own-words answers given. */
export const finalPassed = (p: Progress) => { const b = bestFinal(p); return !!b && b.score / b.total >= PROGRAM.finalThreshold && writtenDone(p, writtenKey('final')); };

// ── the two phases ───────────────────────────────────────────────────────────
/** Phase I (ज्ञान-यात्रा) is complete: 17 stages, every stage check, the four checkpoints and the final assessment at the threshold. */
export const phase1Complete = (p: Progress) => allStagesCompleted(p) && allCheckpointsDone(p) && finalPassed(p);
export const nididhyasanaUnlocked = phase1Complete;

const DAY = 86400000;
/** The current week of the 12-week period (1..12, or 13 when it has run its course); null before it starts. */
export function nididhyasanaWeek(p: Progress, now = new Date()): number | null {
  if (!p.nididhyasana.startedAt) return null;
  const days = Math.floor((now.getTime() - new Date(p.nididhyasana.startedAt).getTime()) / DAY);
  return Math.min(PROGRAM.nididhyasana.weeks + 1, Math.max(1, Math.floor(days / 7) + 1));
}
export function participation(p: Progress) {
  const weeks = Object.values(p.nididhyasana.weeks);
  return { attended: weeks.filter((w) => w.attended).length, reflections: weeks.filter((w) => (w.reflection ?? '').trim().length > 0).length };
}
export function nididhyasanaComplete(p: Progress, now = new Date()) {
  const week = nididhyasanaWeek(p, now);
  const part = participation(p);
  return week !== null && week > PROGRAM.nididhyasana.weeks && part.attended >= PROGRAM.nididhyasana.minWeeksAttended && part.reflections >= PROGRAM.nididhyasana.minWeeklyReflections;
}
export const finalReflectionUnlocked = (p: Progress, now = new Date()) => nididhyasanaUnlocked(p) && nididhyasanaComplete(p, now);

/** The certificate rules, each one named so the learner sees exactly what is left. */
export function certificateChecklist(p: Progress, now = new Date()) {
  return [
    { key: 'stages', done: allStagesCompleted(p) },
    { key: 'stageChecks', done: STAGE_IDS.every((s) => stageWritten(p, s)) },
    { key: 'checkpoints', done: allCheckpointsDone(p) },
    { key: 'final', done: finalPassed(p) },
    { key: 'nididhyasana', done: nididhyasanaComplete(p, now) },
    { key: 'finalReflection', done: !!p.finalReflection },
  ];
}
export const certificateEligible = (p: Progress, now = new Date()) => certificateChecklist(p, now).every((c) => c.done);

/** Changing the language never touches progress. */
export const withLocale = (p: Progress, locale: LocaleCode): Progress => ({ ...p, locale, updatedAt: new Date().toISOString() });

// ── assessment scoring (server side) ─────────────────────────────────────────
/** A stable shuffle of an item's options (same order for every learner and language), so the right answer is never always in the same place. */
export function optionOrder(itemId: string, n: number): number[] {
  let h = 2166136261;
  for (const ch of itemId) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) { h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; const j = h % (i + 1); [order[i], order[j]] = [order[j], order[i]]; }
  return order;
}
/** Grades answers given as DISPLAYED positions. keys: item id -> authored right index. */
export function grade(items: { id: string; options: unknown[] }[], answers: Record<string, number>, keys: Record<string, number>) {
  const result = items.map((it) => {
    const order = optionOrder(it.id, it.options.length);
    const chosen = answers[it.id];
    const correct = typeof chosen === 'number' && order[chosen] === keys[it.id];
    return { id: it.id, correct, rightPosition: order.indexOf(keys[it.id]) };
  });
  return { result, score: result.filter((r) => r.correct).length, total: items.length, wrong: result.filter((r) => !r.correct).map((r) => r.id) };
}

/** For the review path below the threshold: the stages whose items were missed most. */
export function weakestStages(items: { id: string; stage?: string; concept?: string }[], wrong: string[], limit = 4) {
  const count = new Map<string, { stage: string; misses: number; concepts: Set<string> }>();
  for (const it of items.filter((x) => wrong.includes(x.id) && x.stage)) {
    const c = count.get(it.stage!) ?? { stage: it.stage!, misses: 0, concepts: new Set<string>() };
    c.misses++; if (it.concept) c.concepts.add(it.concept);
    count.set(it.stage!, c);
  }
  return [...count.values()].sort((a, b) => b.misses - a.misses || a.stage.localeCompare(b.stage)).slice(0, limit).map((c) => ({ stage: c.stage, misses: c.misses, concepts: [...c.concepts] }));
}

export const movementProgress = (p: Progress) => MOVEMENTS.map((m) => ({ id: m.id, done: m.stages.filter((n) => isStageCompleted(p, stageId(n))).length, total: m.stages.length }));
