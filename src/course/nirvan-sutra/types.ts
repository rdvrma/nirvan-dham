// Nirvan Sutra (v2, the 17-stage ज्ञानमार्ग journey): the shared types of the content, the progress and the media.
// Every piece of learner-facing teaching carries a status so draft wording can never pass for approved teaching.

export type LocaleCode = 'hi' | 'en' | 'bn' | 'ta' | 'te' | 'gu' | 'kn' | 'ml' | 'mr' | 'pa' | 'or';

/** approved: the owner's approved teaching (imported, never edited here). draft: written for the course, awaiting review. machine: a translation not yet reviewed. placeholder: UI filler. */
export type ContentStatus = 'approved' | 'draft' | 'machine' | 'placeholder';
export type PublishStatus = 'placeholder' | 'in-production' | 'published';

export type MovementId = 'M1' | 'M2' | 'M3' | 'M4';
export type StageId = `S${string}`;
export type LessonId = string; // NS-S01-MAIN, NS-S01-Q01 ...

export interface Choice { prompt: string; options: string[]; explanation: string; revisit?: string }
export interface CheckItem extends Choice { id: string; stage?: string; concept?: string }

export interface StageText {
  status: ContentStatus;
  title: string;
  subtitle: string;
  centralInquiry: string;
  objective: string;
  essence: string;
  pointers: string[];
  distinctions: { left: string; right: string; note: string }[];
  observation: { title: string; steps: string[] };
  misconception: { myth: string; truth: string };
  reflectionPrompt: string;
  check: CheckItem[];
}

export interface LocaleCourse {
  locale: LocaleCode;
  status: ContentStatus;
  movements: Record<MovementId, { title: string; subtitle: string }>;
  stages: Record<string, StageText>;
  questions: Record<LessonId, { text: string; status: ContentStatus }>;
  checkpoints: Record<string, { title: string; items: CheckItem[] }>;
  final: { items: CheckItem[] };
  nididhyasana: { status: ContentStatus; weeks: { n: number; theme: string; pointer: string; reflectionPrompt: string }[] };
  finalReflection: { status: ContentStatus; prompts: string[] };
  glossary: { status: ContentStatus; terms: { term: string; gloss: string }[] };
}

/** The media of one lesson in one language. Publishing a final film = editing these fields in content/videos.json; no component changes. */
export interface VideoAsset {
  videoId: string | null;
  videoProvider: 'placeholder' | 'youtube' | 'file' | 'bunny' | 'vimeo';
  videoUrl: string | null;
  poster: string | null;
  durationSec: number | null;
  chapters: { atSec: number; title: string }[];
  audio: Partial<Record<LocaleCode, { url: string; status: PublishStatus }>>;
  subtitles: Partial<Record<LocaleCode, { url: string; status: PublishStatus }>>;
  /** Audio tracks verified as published on the same YouTube video. The IFrame API cannot select them; viewers use the player's Audio track menu. */
  youtubeAudioLocales?: LocaleCode[];
  revision: number;
  publishStatus: PublishStatus;
}

export interface AssessmentAttempt { at: string; score: number; total: number; wrong: string[] }
/** Answers a seeker wrote in their own words (no grading): the prompts as they were shown, in the seeker's language. */
export interface WrittenEntry { prompts: string[]; answers: string[]; locale: LocaleCode; at: string }

export interface Progress {
  learnerId: string;
  name: string | null;
  locale: LocaleCode | null;
  enrolledAt: string;
  updatedAt: string;
  lastVisited: { kind: 'stage' | 'question' | 'checkpoint' | 'final' | 'nididhyasana'; id: string; at: string } | null;
  mainViewed: string[];          // stage ids whose main film was watched (or marked watched)
  stageChecks: Record<string, { correct: string[]; tries: number }>;   // legacy: the multiple-choice stage check that the written answers replaced (kept so older rows still load)
  written: Record<string, WrittenEntry>; // 'stage:S01' | 'checkpoint:CP1' | 'final' -> the seeker's own-words answers
  stagesCompleted: string[];
  questionsViewed: string[];     // NS-Sxx-Qyy
  reflections: Record<string, { text: string; at: string }>;
  checkpoints: Record<string, AssessmentAttempt[]>;
  final: AssessmentAttempt[];
  nididhyasana: {
    startedAt: string | null;
    weeks: Record<number, { attended: boolean; reflection: string | null; doubts: { text: string; at: string }[] }>;
  };
  finalReflection: { answers: string[]; submittedAt: string } | null;
}
