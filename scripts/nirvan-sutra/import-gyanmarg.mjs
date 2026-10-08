#!/usr/bin/env node
// Imports the APPROVED ज्ञानमार्ग teaching source (nirvan-video-pipeline, branch gyanmarg-design: 17 topics, 170 questions, 187 approved scripts) into the Nirvan Sutra course.
// Everything written here is approved teaching (status "approved"): the topic and question wording, the spoken narration of every film (its transcript) and the
// on-screen cards and verse cards. Nothing is invented here. Run it again whenever the approved scripts change.
//   node scripts/nirvan-sutra/import-gyanmarg.mjs [path to nirvan-video-pipeline]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const src = process.argv[2] ?? 'C:/Users/pc/nirvan-video-pipeline';
const out = join(process.cwd(), 'src', 'course', 'nirvan-sutra', 'content');
const g = (...p) => JSON.parse(readFileSync(join(src, 'series', 'gyanmarg', ...p), 'utf8'));
let commit = null;
try { commit = execFileSync('git', ['-C', src, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim(); } catch { /* not a git checkout */ }

const questions = g('questions.json').topics;
const approved = g('approved.json').topics;
const pad = (n) => String(n).padStart(2, '0');
export const lessonIdOf = (filmId) => { const m = /^gm-t(\d\d)-(main|q(\d\d))$/.exec(filmId); return m[2] === 'main' ? `NS-S${m[1]}-MAIN` : `NS-S${m[1]}-Q${m[3]}`; };

mkdirSync(join(out, 'transcripts', 'hi'), { recursive: true });
const stages = [];
const lessons = {};
for (const t of questions) {
  const topic = `t${pad(t.n)}`;
  if (!approved[topic]) throw new Error(`${topic} is not approved`);
  stages.push({ n: t.n, id: `S${pad(t.n)}`, topicId: topic, title: { hi: t.hi, en: t.en }, questions: t.questions.map((text, i) => ({ id: `NS-S${pad(t.n)}-Q${pad(i + 1)}`, n: i + 1, text: { hi: text } })) });
  for (const filmId of [`gm-${topic}-main`, ...t.questions.map((_, i) => `gm-${topic}-q${pad(i + 1)}`)]) {
    const pf = g('prompts', topic, `${filmId}.json`);
    const id = lessonIdOf(filmId);
    const spoken = pf.shots.filter((s) => s.type !== 'silence' && s.text?.trim());
    // the blocks of the film become its chapters; a block's first card names it
    const blocks = [];
    for (const s of pf.shots) {
      let b = blocks.at(-1);
      if (!b || b.block !== s.block) { b = { block: s.block, lines: [], card: null }; blocks.push(b); }
      if (s.type !== 'silence' && s.text?.trim()) b.lines.push(s.text.trim());
      if (!b.card && (s.type === 'card' || s.type === 'verse') && s.card) b.card = s.card.replace(/\s+—\s+[^—]+\(verified\)\s*$/, '').trim();
    }
    const cards = pf.shots.filter((s) => s.type === 'card' && s.card).map((s) => s.card.trim());
    const verses = pf.shots.filter((s) => s.type === 'verse' && s.verseRef).map((s) => ({ ref: s.verseRef, text: s.card.replace(/\s+—\s+[^—]+$/, '').trim() }));
    lessons[id] = { id, filmId, kind: pf.video.kind, title: pf.video.title.split(' · ').slice(1).join(' · '), question: pf.video.question ?? null, estSec: pf.video.estSec, words: pf.video.words, approvalSha: approved[topic].scripts[filmId].sha256, cards, verses };
    writeFileSync(join(out, 'transcripts', 'hi', `${id}.json`), JSON.stringify({ id, filmId, status: 'approved', language: 'hi', source: 'approved narration (the spoken text of the film)', blocks: blocks.filter((b) => b.lines.length).map((b) => ({ block: b.block, title: b.card, lines: b.lines })), lineCount: spoken.length }, null, 1) + '\n');
  }
}
const verses = g('verses.json').verses.map((v) => ({ ref: v.ref, text: v.text, quoted: v.quoted, checkedAgainst: v.checkedAgainst }));
writeFileSync(join(out, 'source.json'), JSON.stringify({ $comment: 'APPROVED teaching source, imported by scripts/nirvan-sutra/import-gyanmarg.mjs. Do not edit by hand: change the approved scripts and import again.', provenance: { repo: 'rdvrma/nirvan-video-pipeline', branch: 'gyanmarg-design', commit, importedAt: new Date().toISOString() }, status: 'approved', stages, lessons, verses }, null, 1) + '\n');
console.log(`imported ${stages.length} stages, ${Object.keys(lessons).length} lessons, ${verses.length} verses from ${src}${commit ? ` @ ${commit}` : ''}`);
if (!existsSync(join(out, 'transcripts', 'hi', 'NS-S17-Q10.json'))) process.exit(1);
