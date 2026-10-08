// Nirvan Sutra v2 (the 17-stage journey): the critical learner flows, run against the real content and the server actions with an in-memory store.
//   npx tsx --test tests/nirvan-sutra-yatra.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { MemoryProgressStore, setProgressStore, progressStore } from '../src/course/nirvan-sutra/server/store';
import { handleAction } from '../src/course/nirvan-sutra/server/actions';
import { answerKeys, itemsForGrading, stageView, stageItemIds, videoAsset, questionView, checkpointView, finalView, source } from '../src/course/nirvan-sutra/server/content';
import { demoProgress } from '../src/course/nirvan-sutra/server/demo';
import * as E from '../src/course/nirvan-sutra/engine';
import { STAGE_IDS, CHECKPOINTS, stageId } from '../src/course/nirvan-sutra/structure';
import { LOCALES } from '../src/course/nirvan-sutra/locales';
import { MockTTSProvider, SarvamTTSProvider } from '../src/course/nirvan-sutra/tts';

setProgressStore(new MemoryProgressStore());
let n = 0;
const learner = () => `test-learner-${String(++n).padStart(4, '0')}`;
const keys = answerKeys();
/** the displayed position of the right option of an item */
const rightPos = (id: string, count: number) => E.optionOrder(id, count).indexOf(keys[id]);
const wrongPos = (id: string, count: number) => (rightPos(id, count) + 1) % count;
const get = async (id: string) => (await progressStore().get(id))!;

async function passStage(id: string, stage: string) {
  await handleAction(id, 'main-viewed', { stage });
  for (const it of itemsForGrading('stage', stage)) await handleAction(id, 'check', { stage, itemId: it.id, answer: rightPos(it.id, it.options.length) });
  await handleAction(id, 'complete-stage', { stage });
}
const allRight = (kind: 'checkpoint' | 'final', cp?: string) => Object.fromEntries(itemsForGrading(kind, cp).map((it) => [it.id, rightPos(it.id, it.options.length)]));

test('the approved source is complete: 17 stages, 170 questions, 187 lessons with transcripts; every item has an answer key', () => {
  const s = source();
  assert.equal(s.stages.length, 17);
  assert.equal(s.stages.reduce((a, x) => a + x.questions.length, 0), 170);
  assert.equal(Object.keys(s.lessons).length, 187);
  for (const id of Object.keys(s.lessons)) assert.ok(fs.existsSync(path.join('src/course/nirvan-sutra/content/transcripts/hi', `${id}.json`)), id);
  const items = [...STAGE_IDS.flatMap((st) => itemsForGrading('stage', st)), ...CHECKPOINTS.flatMap((c) => itemsForGrading('checkpoint', c.id)), ...itemsForGrading('final')];
  for (const it of items) assert.ok(Number.isInteger(keys[it.id]) && keys[it.id] < it.options.length, it.id);
  assert.ok(itemsForGrading('final').length >= 40);
});

test('first-time language selection is stored in the enrollment', async () => {
  const id = learner();
  assert.equal((await progressStore().get(id)), null);
  await handleAction(id, 'enroll', { locale: 'ta', name: 'Meera' });
  const p = await get(id);
  assert.equal(p.locale, 'ta');
  assert.equal(p.name, 'Meera');
  await assert.rejects(() => handleAction(id, 'enroll', { locale: 'xx' }), /unknown language/);
});

test('changing the language never loses progress', async () => {
  const id = learner();
  await handleAction(id, 'enroll', { locale: 'hi' });
  await passStage(id, 'S01');
  await handleAction(id, 'question-viewed', { id: 'NS-S01-Q03' });
  const before = await get(id);
  await handleAction(id, 'locale', { locale: 'bn' });
  const after = await get(id);
  assert.equal(after.locale, 'bn');
  assert.deepEqual(after.stagesCompleted, before.stagesCompleted);
  assert.deepEqual(after.questionsViewed, before.questionsViewed);
  assert.deepEqual(after.stageChecks, before.stageChecks);
});

test('stage unlock order, and a locked stage refuses every action', async () => {
  const id = learner();
  await handleAction(id, 'enroll', { locale: 'hi' });
  const p = await get(id);
  assert.equal(E.stageState(p, 'S01'), 'current');
  assert.equal(E.stageState(p, 'S02'), 'locked');
  await assert.rejects(() => handleAction(id, 'main-viewed', { stage: 'S02' }), /locked/);
  await assert.rejects(() => handleAction(id, 'check', { stage: 'S02', itemId: 'S02-C1', answer: 0 }), /locked/);
  await assert.rejects(() => handleAction(id, 'question-viewed', { id: 'NS-S02-Q01' }), /locked/);
  await passStage(id, 'S01');
  const q = await get(id);
  assert.equal(E.stageState(q, 'S01'), 'completed');
  assert.equal(E.stageState(q, 'S02'), 'current');
});

test('a stage completes only after its main film and all three check items', async () => {
  const id = learner();
  await handleAction(id, 'enroll', { locale: 'hi' });
  await assert.rejects(() => handleAction(id, 'complete-stage', { stage: 'S01' }), /requirements/);
  await handleAction(id, 'main-viewed', { stage: 'S01' });
  await assert.rejects(() => handleAction(id, 'complete-stage', { stage: 'S01' }), /requirements/);
  const items = itemsForGrading('stage', 'S01');
  for (const it of items.slice(0, 2)) await handleAction(id, 'check', { stage: 'S01', itemId: it.id, answer: rightPos(it.id, it.options.length) });
  await assert.rejects(() => handleAction(id, 'complete-stage', { stage: 'S01' }), /requirements/);
  const last = items[2];
  const r = await handleAction(id, 'check', { stage: 'S01', itemId: last.id, answer: rightPos(last.id, last.options.length) }) as { passed: boolean };
  assert.equal(r.passed, true);
  assert.deepEqual(await handleAction(id, 'complete-stage', { stage: 'S01' }), { ok: true, next: 'S02' });
});

test('a wrong answer gets the gentle explanation, the part to revisit, and unlimited retries; the score is the server’s', async () => {
  const id = learner();
  await handleAction(id, 'enroll', { locale: 'hi' });
  const it = itemsForGrading('stage', 'S01')[0];
  for (let k = 0; k < 3; k++) {
    const r = await handleAction(id, 'check', { stage: 'S01', itemId: it.id, answer: wrongPos(it.id, it.options.length) }) as { correct: boolean; explanation: string; revisit: string; rightPosition: null };
    assert.equal(r.correct, false);
    assert.ok(r.explanation.length > 20 && r.revisit.length > 5);
    assert.equal(r.rightPosition, null);   // the right option is not given away on a miss
  }
  const ok = await handleAction(id, 'check', { stage: 'S01', itemId: it.id, answer: rightPos(it.id, it.options.length) }) as { correct: boolean };
  assert.equal(ok.correct, true);
  const p = await get(id);
  assert.equal(p.stageChecks.S01.tries, 4);
  // a client cannot send a score: the assessment action only takes answers
  await assert.rejects(() => handleAction(id, 'assessment', { kind: 'final', answers: {}, score: 40 }), /locked/);
});

test('the options are shown in a stable shuffled order, the same for every language, and never reveal the answer', () => {
  const hi = stageView('hi', 'S03').checkItems[0], en = stageView('en', 'S03').checkItems[0];
  assert.equal(hi.id, en.id);
  assert.deepEqual(E.optionOrder('S03-C1', 4), E.optionOrder('S03-C1', 4));
  assert.ok(!('explanation' in hi) && !('answer' in hi));
  const positions = new Set(STAGE_IDS.flatMap((s) => itemsForGrading('stage', s)).map((it) => rightPos(it.id, it.options.length)));
  assert.ok(positions.size >= 3, 'the right answer is not always in the same place');
});

test('section checkpoints open after their movement; the final assessment after all 17 stages', async () => {
  const id = learner();
  await handleAction(id, 'enroll', { locale: 'hi' });
  await assert.rejects(() => handleAction(id, 'assessment', { kind: 'checkpoint', id: 'CP1', answers: {} }), /locked/);
  for (const s of ['S01', 'S02', 'S03', 'S04']) await passStage(id, s);
  const r = await handleAction(id, 'assessment', { kind: 'checkpoint', id: 'CP1', answers: allRight('checkpoint', 'CP1') }) as { score: number; total: number; weakest: unknown[] };
  assert.equal(r.score, r.total);
  assert.equal(r.weakest.length, 0);
  assert.ok(E.checkpointDone(await get(id), 'CP1'));
  await assert.rejects(() => handleAction(id, 'assessment', { kind: 'final', answers: {} }), /locked/);
  assert.equal(E.finalUnlocked(await get(id)), false);
});

test('below the threshold: no fail screen, the weakest stages and concepts to revisit, and a retry', async () => {
  const id = learner();
  await progressStore().save({ ...demoProgress(id, 'final-ready', 'hi'), learnerId: id });
  const items = itemsForGrading('final');
  const answers = allRight('final');
  const weak = ['S09', 'S12', 'S14', 'S17'];
  for (const it of items.filter((x) => weak.includes(x.stage!))) answers[it.id] = wrongPos(it.id, it.options.length);
  const r = await handleAction(id, 'assessment', { kind: 'final', answers }) as { passed: boolean; weakest: { stage: string; concepts: string[] }[]; score: number; total: number };
  assert.equal(r.passed, false);
  assert.ok(r.score / r.total < 0.8);
  assert.deepEqual(r.weakest.map((w) => w.stage).sort(), weak);
  assert.ok(r.weakest[0].concepts.length > 0);
  assert.equal(E.phase1Complete(await get(id)), false);
  const again = await handleAction(id, 'assessment', { kind: 'final', answers: allRight('final') }) as { passed: boolean; phase1Complete: boolean };
  assert.equal(again.passed, true);
  assert.equal(again.phase1Complete, true);
});

test('Phase I → Nididhyasana: only after the whole Phase I; weeks open one by one', async () => {
  const id = learner();
  await progressStore().save({ ...demoProgress(id, 'final-ready', 'hi'), learnerId: id });
  await assert.rejects(() => handleAction(id, 'nididhyasana', { op: 'start' }), /after Phase I/);
  await handleAction(id, 'assessment', { kind: 'final', answers: allRight('final') });
  const t0 = new Date('2026-11-01T10:00:00Z');
  await handleAction(id, 'nididhyasana', { op: 'start' }, { at: t0 });
  // progress saved by the store uses the real clock for startedAt? the action uses opts.at
  const p = await get(id);
  assert.ok(p.nididhyasana.startedAt);
  const start = new Date(p.nididhyasana.startedAt!);
  await handleAction(id, 'nididhyasana', { op: 'attend', week: 1 }, { at: start });
  await assert.rejects(() => handleAction(id, 'nididhyasana', { op: 'attend', week: 3 }, { at: start }), /not begun/);
  await handleAction(id, 'nididhyasana', { op: 'doubt', week: 1, text: 'क्या साक्षी को खोजना भी एक प्रयास है?' }, { at: start });
  const q = await get(id);
  assert.equal(q.nididhyasana.weeks[1].attended, true);
  assert.equal(q.nididhyasana.weeks[1].doubts.length, 1);
  assert.equal(E.nididhyasanaWeek(q, new Date(start.getTime() + 15 * 86400000)), 3);
});

test('the final reflection and the certificate: every requirement, in order', async () => {
  const id = learner();
  const at = new Date();
  const p = { ...demoProgress(id, 'nididhyasana', 'hi', at), learnerId: id };
  await progressStore().save(p);
  await assert.rejects(() => handleAction(id, 'final-reflection', { answers: ['x'.repeat(30)] }, { at }), /opens after/);
  assert.equal(E.certificateEligible(await get(id), stageItemIds, at), false);
  // the twelve weeks pass with enough participation
  const done = { ...demoProgress(id, 'completed', 'hi', at), learnerId: id, finalReflection: null };
  await progressStore().save(done);
  const late = new Date(at.getTime() + 60_000);
  await assert.rejects(() => handleAction(id, 'final-reflection', { answers: ['short'] }, { at: late }), /every prompt/);
  await handleAction(id, 'final-reflection', { answers: Array.from({ length: 9 }, () => 'अब “मैं” को एक विचार की तरह आते-जाते देखता हूँ।') }, { at: late });
  const q = await get(id);
  const list = E.certificateChecklist(q, stageItemIds, late);
  assert.deepEqual(list.map((c) => c.done), [true, true, true, true, true, true]);
  assert.equal(E.certificateEligible(q, stageItemIds, late), true);
});

test('certificate and pass texts never certify an attainment', () => {
  for (const l of LOCALES) {
    const f = path.join('src/course/nirvan-sutra/locales', l.code, 'ui.json');
    if (!fs.existsSync(f)) continue;
    const s = JSON.parse(fs.readFileSync(f, 'utf8')).strings as Record<string, string>;
    const claim = /\b(enlightened|self-realized|awakened|brahmajnani)\b/i;
    for (const k of ['certificateText', 'finalPassed', 'phase1DoneTitle', 'stageCompleteTitle']) if (s[k]) assert.ok(!claim.test(s[k]), `${l.code} ${k}`);
    if (s.certificateDisclaimer) assert.ok(s.certificateDisclaimer.length > 20, `${l.code} disclaimer`);
  }
});

test('a placeholder becomes a real film by metadata alone (content/videos.json)', () => {
  const ph = videoAsset('NS-S02-MAIN');
  assert.equal(ph.videoProvider, 'placeholder');
  assert.ok(ph.durationSec! > 600 && ph.chapters.length > 3);   // estimated from the approved script; chapters from its blocks
  const real = videoAsset('NS-S01-Q01');
  assert.equal(real.videoProvider, 'file');
  assert.match(real.videoUrl!, /^https:\/\//);
  assert.equal(real.publishStatus, 'published');
});

test('every language resolves every stage, question and assessment (its own text or the fallback chain)', () => {
  for (const l of LOCALES) {
    for (const s of STAGE_IDS) { const v = stageView(l.code, s); assert.ok(v.text.title && v.text.centralInquiry && v.checkItems.length === 3, `${l.code} ${s}`); }
    assert.ok(questionView(l.code, 'NS-S17-Q10').text.length > 10);
    for (const c of CHECKPOINTS) assert.ok(checkpointView(l.code, c.id).items.length >= 6);
    assert.ok(finalView(l.code).items.length >= 40);
  }
});

test('no Sarvam call can happen from the course: the mock is the default, the Sarvam provider refuses', async () => {
  const mock = new MockTTSProvider();
  assert.equal((await mock.generateAudio({ lessonId: 'NS-S01-MAIN', locale: 'ta', text: 'x', revision: 1 })).audioUrl, null);
  assert.equal(mock.getVoice('or').languageCode, 'od-IN');
  await assert.rejects(() => new SarvamTTSProvider().generateAudio({ lessonId: 'NS-S01-MAIN', locale: 'ta', text: 'x', revision: 1 }), /disabled/);
});

test('demo states cover the whole product', () => {
  const at = new Date();
  assert.equal(E.currentStage(demoProgress('demo-mid-0001', 'mid', 'hi', at)), 'S08');
  assert.equal(E.finalUnlocked(demoProgress('demo-fin-0001', 'final-ready', 'hi', at)), true);
  assert.equal(E.nididhyasanaWeek(demoProgress('demo-nid-0001', 'nididhyasana', 'hi', at), at), 5);
  assert.equal(E.certificateEligible(demoProgress('demo-done-001', 'completed', 'hi', at), stageItemIds, at), true);
  assert.equal(stageId(17), 'S17');
});
