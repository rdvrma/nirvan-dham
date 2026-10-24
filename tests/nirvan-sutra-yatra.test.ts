// Nirvan Sutra v2 (the 17-stage journey): the critical learner flows, run against the real content and the server actions with an in-memory store.
//   npx tsx --test tests/nirvan-sutra-yatra.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { MemoryProgressStore, setProgressStore, progressStore } from '../src/course/nirvan-sutra/server/store';
import { handleAction } from '../src/course/nirvan-sutra/server/actions';
import { answerKeys, itemsForGrading, stageView, videoAsset, questionView, checkpointView, finalView, source, writtenPrompts } from '../src/course/nirvan-sutra/server/content';
import { demoProgress } from '../src/course/nirvan-sutra/server/demo';
import * as E from '../src/course/nirvan-sutra/engine';
import { STAGE_IDS, CHECKPOINTS, stageId, writtenKey } from '../src/course/nirvan-sutra/structure';
import { LOCALES } from '../src/course/nirvan-sutra/locales';
import { MockTTSProvider, SarvamTTSProvider } from '../src/course/nirvan-sutra/tts';

setProgressStore(new MemoryProgressStore());
let n = 0;
const learner = () => `test-learner-${String(++n).padStart(4, '0')}`;
const keys = answerKeys();
/** the displayed position of the right option of an item */
const rightPos = (id: string, count: number) => E.optionOrder(id, count).indexOf(keys[id]);
const wrongPos = (id: string, count: number) => (rightPos(id, count) + 1) % count;
const get = async (id: string) => (await (await progressStore()).get(id))!;

/** own-words answers: anything honest of a few characters is enough */
const own = (n: number) => Array.from({ length: n }, (_, i) => `मेरे अपने शब्दों में उत्तर ${i + 1}`);
async function passStage(id: string, stage: string) {
  await handleAction(id, 'main-viewed', { stage });
  await handleAction(id, 'written', { stage, answers: own(3) });
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
  assert.equal((await (await progressStore()).get(id)), null);
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
  assert.deepEqual(after.written, before.written);
});

test('stage unlock order, and a locked stage refuses every action', async () => {
  const id = learner();
  await handleAction(id, 'enroll', { locale: 'hi' });
  const p = await get(id);
  assert.equal(E.stageState(p, 'S01'), 'current');
  assert.equal(E.stageState(p, 'S02'), 'locked');
  await assert.rejects(() => handleAction(id, 'main-viewed', { stage: 'S02' }), /locked/);
  await assert.rejects(() => handleAction(id, 'written', { stage: 'S02', answers: own(3) }), /locked/);
  await assert.rejects(() => handleAction(id, 'question-viewed', { id: 'NS-S02-Q01' }), /locked/);
  await passStage(id, 'S01');
  const q = await get(id);
  assert.equal(E.stageState(q, 'S01'), 'completed');
  assert.equal(E.stageState(q, 'S02'), 'current');
});

test('a stage completes only after its main film and the seeker’s own words for all three check questions', async () => {
  const id = learner();
  await handleAction(id, 'enroll', { locale: 'hi' });
  await assert.rejects(() => handleAction(id, 'complete-stage', { stage: 'S01' }), /requirements/);
  await handleAction(id, 'main-viewed', { stage: 'S01' });
  await assert.rejects(() => handleAction(id, 'complete-stage', { stage: 'S01' }), /requirements/);
  // every question needs an answer of at least a few characters; there is no right or wrong
  await assert.rejects(() => handleAction(id, 'written', { stage: 'S01', answers: own(2) }), /every question/);
  await assert.rejects(() => handleAction(id, 'written', { stage: 'S01', answers: ['हाँ', 'ठीक', 'नहीं'] }), /every question/);
  await assert.rejects(() => handleAction(id, 'complete-stage', { stage: 'S01' }), /requirements/);
  await handleAction(id, 'written', { stage: 'S01', answers: own(3) });
  assert.deepEqual(await handleAction(id, 'complete-stage', { stage: 'S01' }), { ok: true, next: 'S02' });
});

test('own-words answers are saved with the questions in the seeker’s language and sent on once per submission; never graded', async () => {
  const id = learner();
  await handleAction(id, 'enroll', { locale: 'ta', name: 'Meera' });
  const sent: { part: string; prompts: string[]; promptsHi?: string[]; answers: string[]; locale: string; learner: { name: string | null }; objective?: unknown }[] = [];
  const notify = async (n: (typeof sent)[number]) => { sent.push(n); return true; };
  const r = await handleAction(id, 'written', { stage: 'S01', answers: own(3) }, { notify }) as { ok: boolean; sent: boolean };
  assert.deepEqual(r, { ok: true, sent: true });
  const p = await get(id);
  const w = p.written[writtenKey('stage', 'S01')];
  assert.deepEqual(w.answers, own(3));
  assert.equal(w.locale, 'ta');
  assert.deepEqual(w.prompts, writtenPrompts('ta', 'stage', 'S01').prompts);
  assert.equal(sent.length, 1);
  assert.match(sent[0].part, /^Stage S01 — /);
  assert.equal(sent[0].learner.name, 'Meera');
  assert.equal(sent[0].objective, undefined);
  // the email carries each Tamil question with its Hindi beside it, then the answer
  const { formspreeBody } = await import('../src/course/nirvan-sutra/server/notify');
  const body = formspreeBody({ ...sent[0], objective: undefined, locale: 'ta', learner: { id, name: 'Meera', email: 'meera@example.test' } });
  const hi = writtenPrompts('hi', 'stage', 'S01').prompts;
  assert.deepEqual(Object.keys(body).filter((k) => k.startsWith('Q') || k.startsWith('A')), ['Q1', 'Q1 (हिन्दी)', 'A1', 'Q2', 'Q2 (हिन्दी)', 'A2', 'Q3', 'Q3 (हिन्दी)', 'A3']);
  assert.equal(body['Q1'], writtenPrompts('ta', 'stage', 'S01').prompts[0]);
  assert.equal(body['Q1 (हिन्दी)'], hi[0]);
  assert.equal(body.email, 'meera@example.test');
  // a Hindi seeker's email has no duplicate Hindi line
  const hiBody = formspreeBody({ part: 'x', learner: { id, name: null, email: null }, locale: 'hi', prompts: hi, promptsHi: hi, answers: own(3) });
  assert.equal(Object.keys(hiBody).some((k) => k.includes('हिन्दी')), false);
  // sending again replaces the answers (and sends once more)
  await handleAction(id, 'written', { stage: 'S01', answers: own(3).reverse() }, { notify });
  assert.deepEqual((await get(id)).written[writtenKey('stage', 'S01')].answers, own(3).reverse());
  assert.equal(sent.length, 2);
  // a client cannot send a score: the assessment action only takes answers
  await assert.rejects(() => handleAction(id, 'assessment', { kind: 'final', answers: {}, written: own(3), score: 40 }), /locked/);
});

test('the options are shown in a stable shuffled order, the same for every language, and never reveal the answer', () => {
  const hi = checkpointView('hi', 'CP2').items[0], en = checkpointView('en', 'CP2').items[0];
  assert.equal(hi.id, en.id);
  assert.deepEqual(E.optionOrder(hi.id, 4), E.optionOrder(hi.id, 4));
  assert.ok(!('explanation' in hi) && !('answer' in hi));
  const positions = new Set(itemsForGrading('final').map((it) => rightPos(it.id, it.options.length)));
  assert.ok(positions.size >= 3, 'the right answer is not always in the same place');
});

test('section checkpoints open after their movement; the final assessment after all 17 stages', async () => {
  const id = learner();
  await handleAction(id, 'enroll', { locale: 'hi' });
  await assert.rejects(() => handleAction(id, 'assessment', { kind: 'checkpoint', id: 'CP1', answers: {} }), /locked/);
  for (const s of ['S01', 'S02', 'S03', 'S04']) await passStage(id, s);
  // a checkpoint has both parts: its objective questions and two questions in the seeker's own words
  await assert.rejects(() => handleAction(id, 'assessment', { kind: 'checkpoint', id: 'CP1', answers: allRight('checkpoint', 'CP1') }), /every question/);
  const r = await handleAction(id, 'assessment', { kind: 'checkpoint', id: 'CP1', answers: allRight('checkpoint', 'CP1'), written: own(2) }) as { score: number; total: number; weakest: unknown[] };
  assert.equal(r.score, r.total);
  assert.equal(r.weakest.length, 0);
  assert.ok(E.checkpointDone(await get(id), 'CP1'));
  assert.deepEqual((await get(id)).written[writtenKey('checkpoint', 'CP1')].answers, own(2));
  await assert.rejects(() => handleAction(id, 'assessment', { kind: 'final', answers: {} }), /locked/);
  assert.equal(E.finalUnlocked(await get(id)), false);
});

test('below the threshold: no fail screen, the weakest stages and concepts to revisit, and a retry', async () => {
  const id = learner();
  await (await progressStore()).save({ ...demoProgress(id, 'final-ready', 'hi'), learnerId: id });
  const items = itemsForGrading('final');
  const answers = allRight('final');
  const weak = ['S09', 'S12', 'S14', 'S17'];
  for (const it of items.filter((x) => weak.includes(x.stage!))) answers[it.id] = wrongPos(it.id, it.options.length);
  const r = await handleAction(id, 'assessment', { kind: 'final', answers, written: own(3) }) as { passed: boolean; weakest: { stage: string; concepts: string[] }[]; score: number; total: number };
  assert.equal(r.passed, false);
  assert.ok(r.score / r.total < 0.8);
  assert.deepEqual(r.weakest.map((w) => w.stage).sort(), weak);
  assert.ok(r.weakest[0].concepts.length > 0);
  assert.equal(E.phase1Complete(await get(id)), false);
  const again = await handleAction(id, 'assessment', { kind: 'final', answers: allRight('final'), written: own(3) }) as { passed: boolean; phase1Complete: boolean };
  assert.equal(again.passed, true);
  assert.equal(again.phase1Complete, true);
});

test('Phase I → Nididhyasana: only after the whole Phase I; weeks open one by one', async () => {
  const id = learner();
  await (await progressStore()).save({ ...demoProgress(id, 'final-ready', 'hi'), learnerId: id });
  await assert.rejects(() => handleAction(id, 'nididhyasana', { op: 'start' }), /after Phase I/);
  await handleAction(id, 'assessment', { kind: 'final', answers: allRight('final'), written: own(3) });
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
  await (await progressStore()).save(p);
  await assert.rejects(() => handleAction(id, 'final-reflection', { answers: ['x'.repeat(30)] }, { at }), /opens after/);
  assert.equal(E.certificateEligible(await get(id), at), false);
  // the twelve weeks pass with enough participation
  const done = { ...demoProgress(id, 'completed', 'hi', at), learnerId: id, finalReflection: null };
  await (await progressStore()).save(done);
  const late = new Date(at.getTime() + 60_000);
  await assert.rejects(() => handleAction(id, 'final-reflection', { answers: ['short'] }, { at: late }), /every prompt/);
  await handleAction(id, 'final-reflection', { answers: Array.from({ length: 9 }, () => 'अब “मैं” को एक विचार की तरह आते-जाते देखता हूँ।') }, { at: late });
  const q = await get(id);
  const list = E.certificateChecklist(q, late);
  assert.deepEqual(list.map((c) => c.done), [true, true, true, true, true, true]);
  assert.equal(E.certificateEligible(q, late), true);
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

test('all 17 main films and 170 public question films resolve', () => {
  for (let n = 1; n <= 17; n++) {
    const main = videoAsset(`NS-S${String(n).padStart(2, '0')}-MAIN`);
    assert.equal(main.videoProvider, 'youtube');
    assert.ok(main.videoId && main.durationSec! > 600, `main film ${n}`);
  }
  const real = videoAsset('NS-S01-MAIN');
  assert.equal(real.videoProvider, 'youtube');
  assert.equal(real.videoId, 'E0U-Toeq5lY');
  assert.deepEqual(real.youtubeAudioLocales, ['hi', 'en', 'bn']);
  assert.equal(real.publishStatus, 'published');
  assert.equal(videoAsset('NS-S01-Q01').videoId, 'ksmxFMQrPus');
  assert.equal(videoAsset('NS-S01-Q02').videoId, 'j67ybgmrFV8');
  assert.equal(videoAsset('NS-S01-Q03').videoId, 'BlyFDzJpmnY');
  assert.equal(videoAsset('NS-S01-Q06').videoId, 'deFJlduE83E');
  assert.equal(videoAsset('NS-S11-Q01').videoId, 'H2ZViLiG-nM');
  assert.equal(videoAsset('NS-S07-Q02').videoId, 'IJMrhi3Q5Ws');
  assert.equal(videoAsset('NS-S17-Q01').videoId, 'u0Zyvrw4_wk');
  assert.equal(videoAsset('NS-S04-Q04').videoId, 'M3vWXGPqLUs');
  assert.equal(videoAsset('NS-S14-Q04').videoId, 'SKGeHVblji0');
  assert.equal(videoAsset('NS-S17-Q04').videoId, 'ATpVqcAlRDM');
  assert.equal(videoAsset('NS-S05-Q09').videoId, 'Sfsq1mfHjNs');
  assert.equal(videoAsset('NS-S06-Q10').videoId, 'Tbd65OV3u4Y');
  assert.equal(videoAsset('NS-S07-Q10').videoId, 'MlG8fGefZUg');
  assert.equal(videoAsset('NS-S08-Q09').videoId, 'rdpwXHW47-U');
  assert.equal(videoAsset('NS-S09-Q10').videoId, 'm_D6dQggzFw');
  assert.equal(videoAsset('NS-S10-Q10').videoId, 'q9vyVMKAel4');
  assert.equal(videoAsset('NS-S11-Q10').videoId, '-QUPka0c41k');
  assert.equal(videoAsset('NS-S12-Q10').videoId, 'harZNN9UVzE');
  assert.equal(videoAsset('NS-S13-Q10').videoId, '4UBYI18O-sA');
  assert.equal(videoAsset('NS-S14-Q09').videoId, 'DVkYVgsNtxY');
  assert.equal(videoAsset('NS-S01-Q04').videoId, 'oxmMKrPgHEk');
  assert.equal(videoAsset('NS-S17-Q10').videoId, '0bxtiBcllF4');
  assert.equal(videoAsset('NS-S03-Q04').videoId, '2ITxHI-6rWM');
  assert.equal(videoAsset('NS-S04-Q05').videoId, 'ag0r5xeMTGg');
  assert.equal(videoAsset('NS-S05-Q04').videoId, 'kytvEOP8dVw');
  assert.equal(videoAsset('NS-S06-Q04').videoId, 'anaM0NKAhZU');
  assert.equal(videoAsset('NS-S07-Q04').videoId, 'cADG0Nj1ImY');
  assert.equal(videoAsset('NS-S08-Q04').videoId, '6tykS2y1j_Q');
  assert.equal(videoAsset('NS-S09-Q05').videoId, 'u4ah4AEYuGU');
  assert.equal(videoAsset('NS-S01-Q07').videoId, 'subWwlCd_7g');
  assert.equal(videoAsset('NS-S17-Q07').videoId, 'um_HWv_SGc0');
  assert.equal(videoAsset('NS-S01-Q08').videoId, 'LVMzDx1V7gI');
  assert.equal(videoAsset('NS-S17-Q08').videoId, 'dXlPBDVysJA');
  assert.equal(videoAsset('NS-S12-Q09').videoId, 'qztuftoWzb0');
  assert.equal(videoAsset('NS-S16-Q09').videoId, 'r9VNxrxJdCs');
  assert.equal(videoAsset('NS-S17-Q09').videoId, 'QvRWmPueIgE');
  assert.equal(videoAsset('NS-S11-Q09').videoId, 'qbwJV282S1g');
  assert.equal(Object.keys(source().lessons).filter((id) => id.includes('-Q') && videoAsset(id).publishStatus === 'published').length, 170);
});

test('every language resolves every stage, question and assessment (its own text or the fallback chain)', () => {
  for (const l of LOCALES) {
    for (const s of STAGE_IDS) { const v = stageView(l.code, s); assert.ok(v.text.title && v.text.centralInquiry && v.checkItems.length === 3, `${l.code} ${s}`); }
    assert.ok(questionView(l.code, 'NS-S17-Q10').text.length > 10);
    for (const c of CHECKPOINTS) assert.ok(checkpointView(l.code, c.id).items.length >= 6);
    assert.ok(finalView(l.code).items.length >= 40);
    // the own-words questions: three per stage, two per checkpoint, three in the final
    for (const s of STAGE_IDS) assert.equal(writtenPrompts(l.code, 'stage', s).prompts.length, 3, `${l.code} ${s}`);
    for (const c of CHECKPOINTS) assert.equal(writtenPrompts(l.code, 'checkpoint', c.id).prompts.length, 2, `${l.code} ${c.id}`);
    assert.equal(writtenPrompts(l.code, 'final').prompts.length, 3);
    assert.equal(writtenPrompts(l.code, 'final').fallback, false);
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
  assert.equal(E.certificateEligible(demoProgress('demo-done-001', 'completed', 'hi', at), at), true);
  assert.equal(stageId(17), 'S17');
});

test('guide desk: weekly session links (https only), a note per learner per week, doubts visible, reflections stay private', async () => {
  const { MemoryGuideStore, setGuideStore } = await import('../src/course/nirvan-sutra/server/guide');
  const { handleGuideAction, guideView } = await import('../src/course/nirvan-sutra/server/guide-actions');
  const g = new MemoryGuideStore();
  setGuideStore(g);
  const at = new Date();
  const p = demoProgress('guide-learner-01', 'nididhyasana', 'ta', at);
  g.l = [p];
  await handleGuideAction('guide-0001', 'week', { week: 2, liveSessionUrl: 'https://meet.example.org/ns', recordingUrl: '', sessionNote: 'सत्र शाम 7 बजे' });
  await assert.rejects(() => handleGuideAction('guide-0001', 'week', { week: 3, liveSessionUrl: 'http://insecure.example.org' }), /https/);
  await assert.rejects(() => handleGuideAction('guide-0001', 'week', { week: 13 }), /1–12/);
  await handleGuideAction('guide-0001', 'note', { learnerId: p.learnerId, week: 2, note: 'साक्षी को खोजना नहीं है — देखिए कि खोज किसमें उठती है।' });
  assert.equal((await g.weeks())[2].liveSessionUrl, 'https://meet.example.org/ns');
  assert.equal((await g.notesFor(p.learnerId))[2].startsWith('साक्षी'), true);
  const v = await guideView(at);
  const l = v.learners[0];
  assert.equal(l.currentWeek, 5);
  assert.equal(l.weeks[1].doubts.length, 1);
  assert.equal(l.weeks[1].note.startsWith('साक्षी'), true);
  // the guide sees whether a reflection was written, never its text
  assert.equal(JSON.stringify(v).includes(p.nididhyasana.weeks[1].reflection!), false);
  await handleGuideAction('guide-0001', 'note', { learnerId: p.learnerId, week: 2, note: '' });
  assert.equal((await g.notesFor(p.learnerId))[2], undefined);
  setGuideStore(null);
});
