// SERVER ONLY: reads the course content (approved source, locale texts, media registry) and resolves every text through the language fallback chain,
// recording when a text is not yet in the learner's language so the page can say so. Answer keys never leave this folder except through grading.
import fs from 'node:fs';
import path from 'node:path';
import type { LocaleCode, StageText, CheckItem, VideoAsset, ContentStatus, MovementId } from '../types';
import { fallbackChain, SOURCE_LOCALE } from '../locales';
import { STAGE_IDS, questionIdsOf, mainLessonId, stageNumber, CHECKPOINTS, movementOf } from '../structure';
import { optionOrder } from '../engine';

const ROOT = path.join(process.cwd(), 'src', 'course', 'nirvan-sutra');
const cache = new Map<string, unknown>();
function readJson<T>(rel: string): T | null {
  if (cache.has(rel) && process.env.NODE_ENV === 'production') return cache.get(rel) as T;
  const f = path.join(ROOT, rel);
  if (!fs.existsSync(f)) return null;
  const v = JSON.parse(fs.readFileSync(f, 'utf8')) as T;
  cache.set(rel, v);
  return v;
}

// ── raw files ────────────────────────────────────────────────────────────────
interface SourceLesson { id: string; filmId: string; kind: 'main' | 'question'; title: string; question: string | null; estSec: number; words: number; approvalSha: string; cards: string[]; verses: { ref: string; text: string }[] }
interface Source { provenance: { repo: string; branch: string; commit: string | null; importedAt: string }; stages: { n: number; id: string; topicId: string; title: { hi: string; en: string }; questions: { id: string; n: number; text: { hi: string } }[] }[]; lessons: Record<string, SourceLesson>; verses: { ref: string; text: string; quoted: string; checkedAgainst: string }[] }
export const source = () => readJson<Source>('content/source.json')!;
type StagesFile = { stages: Record<string, Partial<StageText> & { approvedFields?: string[] }> };
type AssessFile = { status: ContentStatus; checkpoints: Record<string, { title: string; items: CheckItem[] }>; final: { items: CheckItem[] } };
type ProgramFile = { status: ContentStatus; movements: Record<MovementId, { title: string; subtitle: string }>; nididhyasana: { status: ContentStatus; weeks: { n: number; theme: string; pointer: string; reflectionPrompt: string }[] }; finalReflection: { status: ContentStatus; prompts: string[] }; glossary: { status: ContentStatus; terms: { term: string; gloss: string }[] } };
type QuestionsFile = { status: ContentStatus; questions: Record<string, string> };
type UiFile = { status: ContentStatus; strings: Record<string, string> };
const stagesOf = (l: LocaleCode) => readJson<StagesFile>(`locales/${l}/stages.json`);
const assessOf = (l: LocaleCode) => readJson<AssessFile>(`locales/${l}/assessments.json`);
const programOf = (l: LocaleCode) => readJson<ProgramFile>(`locales/${l}/program.json`);
const questionsOf = (l: LocaleCode) => readJson<QuestionsFile>(`locales/${l}/questions.json`);
const uiOf = (l: LocaleCode) => readJson<UiFile>(`locales/${l}/ui.json`);
export const answerKeys = () => readJson<Record<string, number>>('server/answer-keys.json')!;

/** A resolved text: the value, the language it came from, and whether that is the learner's language. */
export interface Resolved<T> { value: T; from: LocaleCode; fallback: boolean }
function resolve<T>(locale: LocaleCode, pick: (l: LocaleCode) => T | undefined | null): Resolved<T> | null {
  for (const l of fallbackChain(locale)) { const v = pick(l); if (v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0) && v !== '') return { value: v, from: l, fallback: l !== locale }; }
  return null;
}

// ── UI strings ───────────────────────────────────────────────────────────────
/** The UI dictionary of a language, filled from the fallback chain (a serialisable object for client components). */
export function uiStrings(locale: LocaleCode): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of [...fallbackChain(locale)].reverse()) Object.assign(out, uiOf(l)?.strings ?? {});
  return out;
}

// ── stages ───────────────────────────────────────────────────────────────────
const FIELDS = ['title', 'subtitle', 'centralInquiry', 'objective', 'essence', 'pointers', 'distinctions', 'observation', 'misconception', 'reflectionPrompt'] as const;
export interface StageView {
  id: string; n: number; movement: MovementId; topicId: string;
  text: { [K in (typeof FIELDS)[number]]: StageText[K] };
  /** fields shown from another language than the learner's */
  fallbackFields: string[];
  approvedFields: string[];
  status: ContentStatus;
  checkItems: PublicItem[];
  questionIds: string[];
  mainLessonId: string;
}
export interface PublicItem { id: string; prompt: string; options: string[]; stage?: string; concept?: string; fallback: boolean }

/** An assessment item as the learner sees it: the options in their shuffled display order, no answer, no explanation. */
function publicItem(item: CheckItem, fallback: boolean): PublicItem {
  const order = optionOrder(item.id, item.options.length);
  return { id: item.id, prompt: item.prompt, options: order.map((i) => item.options[i]), stage: item.stage, concept: item.concept, fallback };
}

export function stageView(locale: LocaleCode, stage: string): StageView {
  const src = source().stages.find((s) => s.id === stage)!;
  const text: Record<string, unknown> = {};
  const fallbackFields: string[] = [];
  for (const f of FIELDS) {
    const r = resolve(locale, (l) => {
      const v = stagesOf(l)?.stages?.[stage]?.[f];
      if (v !== undefined) return v;
      if (f === 'title' && (l === 'hi' || l === 'en')) return src.title[l];   // the approved topic names
      return undefined;
    });
    text[f] = r?.value ?? null;
    if (r?.fallback) fallbackFields.push(f);
  }
  const hi = stagesOf(SOURCE_LOCALE)!.stages[stage];
  const check = resolve(locale, (l) => stagesOf(l)?.stages?.[stage]?.check);
  const movement = movementOf(stage);
  return {
    id: stage, n: stageNumber(stage), movement, topicId: src.topicId, text: text as StageView['text'], fallbackFields,
    approvedFields: locale === SOURCE_LOCALE ? (hi.approvedFields ?? []) : [], status: (stagesOf(locale)?.stages?.[stage]?.status as ContentStatus) ?? 'draft',
    checkItems: (check?.value ?? []).map((i) => publicItem(i, !!check?.fallback)), questionIds: questionIdsOf(stage), mainLessonId: mainLessonId(stage),
  };
}
export const allStages = (locale: LocaleCode) => STAGE_IDS.map((s) => stageView(locale, s));
export const stageItemIds = (stage: string) => (stagesOf(SOURCE_LOCALE)!.stages[stage].check ?? []).map((c) => c.id);

/** The full item (with explanation and revisit hint) in the learner's language — only after an answer was graded. */
export function checkItemFull(locale: LocaleCode, itemId: string): CheckItem | null {
  const pick = (l: LocaleCode): CheckItem | undefined => {
    const st = stagesOf(l)?.stages ?? {};
    for (const s of Object.values(st)) { const it = s.check?.find((c) => c.id === itemId); if (it) return it; }
    const a = assessOf(l);
    for (const c of Object.values(a?.checkpoints ?? {})) { const it = c.items.find((x) => x.id === itemId); if (it) return it; }
    return a?.final.items.find((x) => x.id === itemId);
  };
  return resolve(locale, pick)?.value ?? null;
}

// ── questions (the 170 deep-inquiry lessons) ─────────────────────────────────
export interface QuestionView { id: string; stage: string; n: number; text: string; status: ContentStatus; fallback: boolean; prev: string | null; next: string | null }
export function questionView(locale: LocaleCode, id: string): QuestionView {
  const stage = id.slice(3, 6);
  const s = source().stages.find((x) => x.id === stage)!;
  const q = s.questions.find((x) => x.id === id)!;
  const r = resolve<string>(locale, (l) => (l === 'hi' ? q.text.hi : questionsOf(l)?.questions?.[id]));
  const ids = s.questions.map((x) => x.id);
  const i = ids.indexOf(id);
  return { id, stage, n: q.n, text: r!.value, status: r!.from === 'hi' ? 'approved' : (questionsOf(r!.from)?.status ?? 'machine'), fallback: r!.fallback, prev: ids[i - 1] ?? null, next: ids[i + 1] ?? null };
}

// ── assessments ──────────────────────────────────────────────────────────────
export function checkpointView(locale: LocaleCode, id: string) {
  const r = resolve(locale, (l) => assessOf(l)?.checkpoints?.[id]);
  const cp = CHECKPOINTS.find((c) => c.id === id)!;
  return { id, movement: cp.movement, afterStage: cp.afterStage, title: r!.value.title, items: r!.value.items.map((i) => publicItem(i, r!.fallback)), fallback: r!.fallback };
}
export function finalView(locale: LocaleCode) {
  const r = resolve(locale, (l) => assessOf(l)?.final?.items);
  return { items: r!.value.map((i) => publicItem(i, r!.fallback)), fallback: r!.fallback };
}
/** The authored items (any language; the ids and option counts are the same everywhere) used for grading. */
export function itemsForGrading(kind: 'stage' | 'checkpoint' | 'final', id?: string): CheckItem[] {
  if (kind === 'stage') return stagesOf(SOURCE_LOCALE)!.stages[id!].check ?? [];
  const a = assessOf(SOURCE_LOCALE)!;
  return kind === 'checkpoint' ? a.checkpoints[id!].items : a.final.items;
}

// ── program texts ────────────────────────────────────────────────────────────
export function programView(locale: LocaleCode) {
  const pick = <K extends keyof ProgramFile>(k: K) => resolve(locale, (l) => programOf(l)?.[k] as ProgramFile[K] | undefined);
  const movements = pick('movements')!, nid = pick('nididhyasana')!, fr = pick('finalReflection')!, gl = pick('glossary')!;
  return { movements: movements.value, nididhyasana: nid.value, finalReflection: fr.value, glossary: gl.value, fallback: { movements: movements.fallback, nididhyasana: nid.fallback, finalReflection: fr.fallback, glossary: gl.fallback } };
}

// ── media ────────────────────────────────────────────────────────────────────
type VideoRegistry = { lessons: Record<string, Partial<VideoAsset>> };
/** The media of a lesson: the placeholder by default; content/videos.json overrides it field by field (publishing a film = editing that file). */
export function videoAsset(lessonId: string): VideoAsset {
  const l = source().lessons[lessonId];
  const t = transcript('hi', lessonId);
  let at = 0;
  const words = l?.words ?? 1;
  const chapters = (t?.blocks ?? []).filter((b) => b.title).map((b) => { const c = { atSec: Math.round(at), title: b.title! }; at += (b.lines.join(' ').split(/\s+/).length / words) * (l?.estSec ?? 0); return c; });
  const base: VideoAsset = { videoId: null, videoProvider: 'placeholder', videoUrl: null, poster: null, durationSec: l?.estSec ?? null, chapters, audio: {}, subtitles: {}, revision: 0, publishStatus: 'in-production' };
  const over = readJson<VideoRegistry>('content/videos.json')?.lessons?.[lessonId] ?? {};
  return { ...base, ...over };
}

export interface Transcript { id: string; status: ContentStatus; language: LocaleCode; blocks: { block: string; title: string | null; lines: string[] }[] }
/** The film's narration in the learner's language when the dub has delivered it, else the approved Hindi narration. */
export function transcript(locale: LocaleCode, lessonId: string): (Transcript & { fallback: boolean }) | null {
  for (const l of [locale, SOURCE_LOCALE]) { const t = readJson<Transcript>(`content/transcripts/${l}/${lessonId}.json`); if (t) return { ...t, fallback: l !== locale }; }
  return null;
}
export const lessonMeta = (lessonId: string) => source().lessons[lessonId] ?? null;
export const provenance = () => source().provenance;
