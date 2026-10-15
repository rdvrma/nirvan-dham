// SERVER ONLY, development: ready-made learner states to walk through the whole product quickly (a hidden panel; refused in production).
import type { Progress, LocaleCode } from '../types';
import { newProgress } from '../engine';
import { STAGE_IDS, CHECKPOINTS, questionIdsOf, writtenKey } from '../structure';
import { writtenPrompts } from './content';

export const DEMO_STATES = ['new', 'mid', 'final-ready', 'nididhyasana', 'completed'] as const;
export type DemoState = (typeof DEMO_STATES)[number];

const DAY = 86400000;
export function demoProgress(learnerId: string, state: DemoState, locale: LocaleCode | null, now = new Date()): Progress {
  const p = newProgress(learnerId, now);
  p.name = 'साधक';
  p.locale = state === 'new' ? null : locale ?? 'hi';
  const own = (kind: 'stage' | 'checkpoint' | 'final', id?: string) => { const prompts = writtenPrompts(p.locale ?? 'hi', kind, id).prompts; return { prompts, answers: prompts.map(() => 'जो देखा, उसे अपने शब्दों में लिखा।'), locale: p.locale ?? 'hi', at: now.toISOString() }; };
  const complete = (n: number) => {
    for (const s of STAGE_IDS.slice(0, n)) {
      p.mainViewed.push(s);
      p.written[writtenKey('stage', s)] = own('stage', s);
      p.stagesCompleted.push(s);
      p.questionsViewed.push(...questionIdsOf(s).slice(0, 3));
      p.reflections[s] = { text: 'आज देखा कि जो मैं अपने बारे में मानता था, उसका बहुत-सा हिस्सा सीखा हुआ था।', at: now.toISOString() };
    }
  };
  const at = (daysAgo: number) => new Date(now.getTime() - daysAgo * DAY).toISOString();
  if (state === 'mid') { complete(7); p.checkpoints.CP1 = [{ at: at(10), score: 7, total: 8, wrong: ['CP1-04'] }]; p.written[writtenKey('checkpoint', 'CP1')] = own('checkpoint', 'CP1'); p.lastVisited = { kind: 'stage', id: 'S08', at: at(0) }; }
  if (state === 'final-ready' || state === 'nididhyasana' || state === 'completed') {
    complete(17);
    for (const c of CHECKPOINTS) { p.checkpoints[c.id] = [{ at: at(40), score: 8, total: 10, wrong: [] }]; p.written[writtenKey('checkpoint', c.id)] = own('checkpoint', c.id); }
  }
  if (state === 'final-ready') p.lastVisited = { kind: 'final', id: 'final', at: at(0) };
  if (state === 'nididhyasana' || state === 'completed') {
    p.final = [{ at: at(40), score: 36, total: 40, wrong: ['F-14', 'F-23', 'F-31', 'F-33'] }];
    p.written[writtenKey('final')] = own('final');
    const weeksAgo = state === 'nididhyasana' ? 4 : 13;
    p.nididhyasana.startedAt = at(weeksAgo * 7 + 1);
    for (let w = 1; w <= Math.min(12, weeksAgo); w++) p.nididhyasana.weeks[w] = { attended: w !== 3, reflection: 'इस सप्ताह भेद कई बार साफ़ दिखा, कई बार नहीं।', doubts: w === 2 ? [{ text: 'क्या साक्षी को खोजना भी एक प्रयास है?', at: at(20) }] : [] };
    p.lastVisited = { kind: 'nididhyasana', id: `week-${Math.min(12, weeksAgo + 1)}`, at: at(0) };
  }
  if (state === 'completed') p.finalReflection = { answers: Array.from({ length: 9 }, () => 'अब “मैं” को एक विचार की तरह आते-जाते देखता हूँ; जो देख रहा है, वह आता-जाता नहीं दिखता।'), submittedAt: at(1) };
  return p;
}
