#!/usr/bin/env node
// Checks every language of Nirvan Sutra against the Hindi source: the same stages, items (ids, option counts, stage tags), UI keys, questions, weeks
// and prompts. A language may be missing a whole file (the fallback chain covers it) but a file that exists must be complete and well-formed.
//   node scripts/nirvan-sutra/check-locales.mjs
import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'src', 'course', 'nirvan-sutra', 'locales');
const read = (l, f) => { const p = path.join(dir, l, f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null; };
const hi = { ui: read('hi', 'ui.json'), stages: read('hi', 'stages.json'), assess: read('hi', 'assessments.json'), program: read('hi', 'program.json') };
const src = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'course', 'nirvan-sutra', 'content', 'source.json'), 'utf8'));
const qids = src.stages.flatMap((s) => s.questions.map((q) => q.id));
const problems = [];
const report = [];
const P = (l, m) => problems.push(`${l}: ${m}`);
const items = (a) => [...Object.values(a.checkpoints).flatMap((c) => c.items), ...a.final.items];
const sameItem = (l, ref, it) => {
  if (!it) return P(l, `missing item ${ref.id}`);
  if (it.options.length !== ref.options.length) P(l, `${ref.id}: ${it.options.length} options, Hindi has ${ref.options.length}`);
  if ((it.stage ?? null) !== (ref.stage ?? null)) P(l, `${ref.id}: stage tag ${it.stage} vs ${ref.stage}`);
  for (const k of ['prompt', 'explanation']) if (!String(it[k] ?? '').trim()) P(l, `${ref.id}: empty ${k}`);
  if (it.options.some((o) => !String(o).trim())) P(l, `${ref.id}: empty option`);
};

for (const l of fs.readdirSync(dir).filter((d) => d !== 'hi')) {
  const have = [];
  const ui = read(l, 'ui.json');
  if (ui) { have.push('ui'); for (const k of Object.keys(hi.ui.strings)) if (k !== 'reducedMotionNote' && !String(ui.strings[k] ?? '').length) P(l, `ui missing ${k}`); for (const k of Object.keys(ui.strings)) { const ph = (s) => (String(s).match(/\{\w+\}/g) ?? []).sort().join(); if (hi.ui.strings[k] !== undefined && ph(ui.strings[k]) !== ph(hi.ui.strings[k])) P(l, `ui ${k}: placeholders differ`); } }
  const st = read(l, 'stages.json');
  if (st) {
    have.push('stages');
    for (const [id, ref] of Object.entries(hi.stages.stages)) {
      const s = st.stages[id];
      if (!s) { P(l, `stage ${id} missing`); continue; }
      for (const f of ['title', 'subtitle', 'centralInquiry', 'objective', 'essence', 'reflectionPrompt']) if (!String(s[f] ?? '').trim()) P(l, `${id}.${f} empty`);
      if ((s.pointers ?? []).length !== ref.pointers.length) P(l, `${id}: ${s.pointers?.length} pointers vs ${ref.pointers.length}`);
      if ((s.distinctions ?? []).length !== ref.distinctions.length) P(l, `${id}: distinctions count`);
      if ((s.observation?.steps ?? []).length !== ref.observation.steps.length) P(l, `${id}: observation steps`);
      if (!s.misconception?.myth || !s.misconception?.truth) P(l, `${id}: misconception`);
      for (const r of ref.check) sameItem(l, r, (s.check ?? []).find((x) => x.id === r.id));
    }
  }
  const a = read(l, 'assessments.json');
  if (a) { have.push('assessments'); for (const r of items(hi.assess)) sameItem(l, r, items(a).find((x) => x.id === r.id)); }
  const q = read(l, 'questions.json');
  if (q) { have.push('questions'); for (const id of qids) if (!String(q.questions[id] ?? '').trim()) P(l, `question ${id} missing`); }
  const pr = read(l, 'program.json');
  if (pr) {
    have.push('program');
    for (const m of ['M1', 'M2', 'M3', 'M4']) if (!pr.movements?.[m]?.title) P(l, `movement ${m}`);
    if (pr.nididhyasana?.weeks?.length !== 12) P(l, 'nididhyasana weeks');
    if (pr.finalReflection?.prompts?.length !== hi.program.finalReflection.prompts.length) P(l, 'final reflection prompts');
    if (pr.glossary?.terms?.length !== hi.program.glossary.terms.length) P(l, 'glossary terms');
  }
  report.push(`${l}: ${have.join(', ') || '(nothing — full fallback)'}`);
}
console.log(report.join('\n'));
if (problems.length) { console.error(`\n${problems.length} problem(s):\n${problems.slice(0, 80).join('\n')}`); process.exit(1); }
console.log('\nall present locale files are complete');
