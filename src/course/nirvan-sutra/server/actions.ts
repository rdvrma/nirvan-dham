// SERVER ONLY: every change a learner can make, in one place (the API route is a thin wrapper; the tests call this directly).
// The server decides: scores come from grading here, unlocks from the engine — a client can only send answers and texts.
import type { LocaleCode, Progress } from '../types';
import { isLocale } from '../locales';
import { PROGRAM, CHECKPOINTS, isStageId, isQuestionId, isCheckpointId, stageNumber } from '../structure';
import * as E from '../engine';
import { update, loadOrCreate } from './store';
import { answerKeys, itemsForGrading, checkItemFull, stageItemIds, checkpointView, finalView } from './content';
import { demoProgress, DEMO_STATES, type DemoState } from './demo';

export class ActionError extends Error { constructor(msg: string, public status = 400) { super(msg); } }
const text = (v: unknown, max = 8000) => { if (typeof v !== 'string') throw new ActionError('text expected'); const s = v.trim(); if (s.length > max) throw new ActionError('text too long'); return s; };
const now = () => new Date().toISOString();

export async function handleAction(learnerId: string, action: string, body: Record<string, unknown>, opts: { dev?: boolean; at?: Date } = {}) {
  const at = opts.at ?? new Date();
  switch (action) {
    case 'enroll': {
      if (!isLocale(body.locale)) throw new ActionError('unknown language');
      const name = body.name ? text(body.name, 80) || null : null;
      const p = await update(learnerId, (p) => { p.locale = body.locale as LocaleCode; if (name) p.name = name; });
      return { ok: true, locale: p.locale };
    }
    case 'locale': {
      if (!isLocale(body.locale)) throw new ActionError('unknown language');
      const p = await update(learnerId, (p) => E.withLocale(p, body.locale as LocaleCode));
      return { ok: true, locale: p.locale };
    }
    case 'name': { const name = text(body.name, 80); await update(learnerId, (p) => { p.name = name || null; }); return { ok: true }; }
    case 'visit': {
      const kind = String(body.kind), id = String(body.id);
      if (!['stage', 'question', 'checkpoint', 'final', 'nididhyasana'].includes(kind)) throw new ActionError('bad visit');
      await update(learnerId, (p) => { p.lastVisited = { kind: kind as NonNullable<Progress['lastVisited']>['kind'], id, at: now() }; });
      return { ok: true };
    }
    case 'main-viewed': {
      const stage = String(body.stage);
      const p0 = await loadOrCreate(learnerId);
      if (!isStageId(stage) || !E.isStageUnlocked(p0, stage)) throw new ActionError('stage locked', 403);
      await update(learnerId, (p) => { if (!p.mainViewed.includes(stage)) p.mainViewed.push(stage); });
      return { ok: true };
    }
    case 'check': {
      // one answer of a stage check, graded here; unlimited retries
      const stage = String(body.stage), itemId = String(body.itemId), answer = Number(body.answer);
      const p0 = await loadOrCreate(learnerId);
      if (!isStageId(stage) || !E.isStageUnlocked(p0, stage)) throw new ActionError('stage locked', 403);
      const item = itemsForGrading('stage', stage).find((i) => i.id === itemId);
      if (!item || !Number.isInteger(answer) || answer < 0 || answer >= item.options.length) throw new ActionError('bad answer');
      const g = E.grade([item], { [itemId]: answer }, answerKeys());
      const correct = g.result[0].correct;
      const p = await update(learnerId, (p) => {
        const c = p.stageChecks[stage] ?? { correct: [], tries: 0 };
        c.tries++;
        if (correct && !c.correct.includes(itemId)) c.correct.push(itemId);
        p.stageChecks[stage] = c;
      });
      const full = checkItemFull(p.locale ?? 'hi', itemId)!;
      return { correct, rightPosition: correct ? g.result[0].rightPosition : null, explanation: full.explanation, revisit: full.revisit ?? null, passed: E.checkPassed(p, stage, stageItemIds(stage)) };
    }
    case 'complete-stage': {
      const stage = String(body.stage);
      const p0 = await loadOrCreate(learnerId);
      if (!isStageId(stage)) throw new ActionError('bad stage');
      if (!E.canCompleteStage(p0, stage, stageItemIds(stage))) throw new ActionError('the stage still has requirements', 409);
      await update(learnerId, (p) => { if (!p.stagesCompleted.includes(stage)) p.stagesCompleted.push(stage); });
      return { ok: true, next: stageNumber(stage) < PROGRAM.stageCount ? `S${String(stageNumber(stage) + 1).padStart(2, '0')}` : null };
    }
    case 'question-viewed': {
      const id = String(body.id);
      const p0 = await loadOrCreate(learnerId);
      if (!isQuestionId(id) || !E.isStageUnlocked(p0, id.slice(3, 6))) throw new ActionError('question locked', 403);
      await update(learnerId, (p) => { if (!p.questionsViewed.includes(id)) p.questionsViewed.push(id); });
      return { ok: true };
    }
    case 'reflection': {
      const key = String(body.key);
      if (!/^(S(0[1-9]|1[0-7])|NS-S(0[1-9]|1[0-7])-Q(0[1-9]|10))$/.test(key)) throw new ActionError('bad reflection key');
      const t = text(body.text);
      await update(learnerId, (p) => { if (t) p.reflections[key] = { text: t, at: now() }; else delete p.reflections[key]; });
      return { ok: true };
    }
    case 'assessment': {
      const kind = String(body.kind), id = String(body.id ?? 'final');
      const answers = (body.answers ?? {}) as Record<string, number>;
      const p0 = await loadOrCreate(learnerId);
      if (kind === 'checkpoint' && (!isCheckpointId(id) || !E.checkpointUnlocked(p0, id))) throw new ActionError('checkpoint locked', 403);
      if (kind === 'final' && !E.finalUnlocked(p0)) throw new ActionError('final assessment locked', 403);
      if (kind !== 'checkpoint' && kind !== 'final') throw new ActionError('bad assessment');
      const items = itemsForGrading(kind, id);
      const g = E.grade(items, answers, answerKeys());
      const attempt = { at: now(), score: g.score, total: g.total, wrong: g.wrong };
      const p = await update(learnerId, (p) => { if (kind === 'checkpoint') (p.checkpoints[id] ??= []).push(attempt); else p.final.push(attempt); });
      const locale = p.locale ?? 'hi';
      const view = kind === 'checkpoint' ? checkpointView(locale, id) : finalView(locale);
      const results = g.result.map((r) => ({ ...r, explanation: checkItemFull(locale, r.id)?.explanation ?? '' }));
      return {
        score: g.score, total: g.total, results,
        weakest: E.weakestStages(view.items, g.wrong),
        clarity: [...new Set(view.items.filter((i) => !g.wrong.includes(i.id)).map((i) => i.concept).filter(Boolean))],
        passed: kind === 'final' ? g.score / g.total >= PROGRAM.finalThreshold : true,
        phase1Complete: E.phase1Complete(p),
      };
    }
    case 'nididhyasana': {
      const p0 = await loadOrCreate(learnerId);
      if (!E.nididhyasanaUnlocked(p0)) throw new ActionError('Nididhyasana opens after Phase I', 403);
      const op = String(body.op);
      if (op === 'start') { await update(learnerId, (p) => { p.nididhyasana.startedAt ??= at.toISOString(); }); return { ok: true }; }
      const week = Number(body.week);
      const current = E.nididhyasanaWeek(p0, at);
      if (!current || !Number.isInteger(week) || week < 1 || week > Math.min(PROGRAM.nididhyasana.weeks, current)) throw new ActionError('that week has not begun', 403);
      await update(learnerId, (p) => {
        const w = (p.nididhyasana.weeks[week] ??= { attended: false, reflection: null, doubts: [] });
        if (op === 'attend') w.attended = true;
        else if (op === 'reflect') w.reflection = text(body.text) || null;
        else if (op === 'doubt') { const t = text(body.text, 2000); if (t) w.doubts.push({ text: t, at: now() }); }
        else throw new ActionError('bad op');
      });
      return { ok: true };
    }
    case 'final-reflection': {
      const p0 = await loadOrCreate(learnerId);
      if (!E.finalReflectionUnlocked(p0, at)) throw new ActionError('the final reflection opens after the twelve weeks', 403);
      const answers = Array.isArray(body.answers) ? body.answers.map((a) => text(a)) : [];
      if (!answers.length || answers.some((a) => a.length < PROGRAM.finalReflectionMinChars)) throw new ActionError('every prompt needs an answer', 422);
      await update(learnerId, (p) => { p.finalReflection = { answers, submittedAt: now() }; });
      return { ok: true };
    }
    case 'demo': {
      if (!opts.dev) throw new ActionError('not available', 404);
      const state = String(body.state) as DemoState;
      if (!DEMO_STATES.includes(state)) throw new ActionError('bad state');
      const p0 = await loadOrCreate(learnerId);
      await update(learnerId, () => demoProgress(learnerId, state, p0.locale, at));
      return { ok: true };
    }
    default: throw new ActionError('unknown action', 404);
  }
}

/** The checkpoints a learner can take now (for the dashboard). */
export const openCheckpoints = (p: Progress) => CHECKPOINTS.filter((c) => E.checkpointUnlocked(p, c.id));
