// Mechanical QA of the machine transcreations (a native reader still has to review the language itself):
//  - every string is in the locale's own script (the danda । is shared punctuation) (no stray Hindi/other-script text), except the Sanskrit glossary terms and known loanwords;
//  - no empty strings; {placeholders} match Hindi; the length stays within a sane ratio of the Hindi source.
//   node scripts/nirvan-sutra/qa-locales.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = path.join(process.cwd(), 'src', 'course', 'nirvan-sutra');
const SCRIPT = { hi: /[ऀ-ॿ]/, mr: /[ऀ-ॿ]/, bn: /[ঀ-৿]/, pa: /[਀-੿]/, gu: /[઀-૿]/, or: /[଀-୿]/, ta: /[஀-௿]/, te: /[ఀ-౿]/, kn: /[ಀ-೿]/, ml: /[ഀ-ൿ]/, en: /[A-Za-z]/ };
const ALL_INDIC = /[ऀ-ൿ]/g;
const ALLOW_LATIN = /\b(dissociation|https?|DEV|ID)\b/g;
const files = ['ui.json', 'stages.json', 'assessments.json', 'questions.json', 'program.json'];

function walk(o, at, out) {
  if (typeof o === 'string') out.push([at, o]);
  else if (Array.isArray(o)) o.forEach((v, i) => walk(v, `${at}[${i}]`, out));
  else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) if (!k.startsWith('$') && !['locale', 'status', 'id', 'stage', 'term'].includes(k)) walk(v, `${at}.${k}`, out);
  return out;
}
const load = (loc, f) => { const p = path.join(root, 'locales', loc, f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null; };
const hiMap = Object.fromEntries(files.flatMap((f) => { const d = load('hi', f); return d ? walk(d, f, []) : []; }));
const placeholders = (s) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');

let problems = 0;
for (const loc of Object.keys(SCRIPT).filter((l) => l !== 'hi')) {
  const own = SCRIPT[loc];
  const issues = [];
  for (const f of files) {
    const d = load(loc, f);
    if (!d) continue;
    for (const [at, s] of walk(d, f, [])) {
      if (!s.trim()) { issues.push(`${at}: empty`); continue; }
      const stripped = s.replace(/\{\w+\}/g, '').replace(ALLOW_LATIN, '').replace(/[।॥]/g, ''); // placeholders; the danda is shared punctuation
      const foreignIndic = (stripped.match(ALL_INDIC) ?? []).filter((c) => !own.test(c));
      if (foreignIndic.length) issues.push(`${at}: other-script letters "${foreignIndic.slice(0, 6).join('')}"`);
      if (loc !== 'en' && /[A-Za-z]{3,}/.test(stripped) && !/^\{?\w+\}?$/.test(s)) issues.push(`${at}: Latin text "${stripped.match(/[A-Za-z]{3,}/)[0]}"`);
      const hiAt = hiMap[at];
      if (hiAt != null) {
        if (placeholders(hiAt) !== placeholders(s)) issues.push(`${at}: placeholders ${placeholders(s) || '—'} vs hi ${placeholders(hiAt) || '—'}`);
        const r = s.length / Math.max(1, hiAt.length);
        if (hiAt.length > 30 && (r < 0.45 || r > 2.6)) issues.push(`${at}: length ratio ${r.toFixed(2)} vs Hindi`);
      }
    }
  }
  problems += issues.length;
  console.log(`${loc}: ${issues.length ? `${issues.length} issue(s)` : 'clean'}`);
  for (const i of issues.slice(0, 25)) console.log(`   ${i}`);
}
console.log(problems ? `\n${problems} issue(s) to look at` : '\nall machine transcreations pass the mechanical checks');
process.exitCode = problems ? 1 : 0;
