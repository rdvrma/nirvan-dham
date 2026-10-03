// Manifest parsing for the video lessons (schema nirvan-lesson-manifest/2 and /3, see docs/video-course/manifest-schema.md).
// Validated at runtime with zod; unknown fields are ignored so the pipeline can add fields later; errors come back as plain sentences.
import { z } from 'zod';

const num = z.number().finite();
const Text2 = z.object({ hi: z.string(), en: z.string().optional() });

// The pipeline's source flags on prompts (`source`, `reviewed`, ...) are deliberately not part of this schema: they are never shown to learners.
export const PromptSchema = z.object({ hi: z.string().min(1), en: z.string().optional() });

export const SegmentSchema = z.object({
  id: z.string().min(1),
  label: z.string().optional(),
  startSec: num,
  endSec: num,
  durationSec: num.optional(),
  sentences: z.array(z.string()).default([]),
  pauseMarker: z.object({ atSec: num, durationSec: num }).optional(),
  interaction: z.object({ prompts: z.array(PromptSchema).default([]) }).default({ prompts: [] }),
});

export const PausePointSchema = z.object({
  id: z.string().min(1),
  kind: z.string(),
  segment: z.string().optional(),
  atSec: num.min(0),
  durationSec: num.min(0),
  autoResume: z.boolean().optional(),
});

export const AudioSchema = z.object({ lang: z.string(), file: z.string().min(1), default: z.boolean().optional(), role: z.string().optional() });
export const CaptionTrackSchema = z.object({ lang: z.string(), vtt: z.string().optional(), wordTiming: z.string().optional(), status: z.string().optional() });

export const ManifestSchema = z.object({
  schema: z.string().regex(/^nirvan-lesson-manifest\/[23]$/, 'is not a lesson manifest version this player knows (nirvan-lesson-manifest/2 or /3)'),
  id: z.string().min(1),
  durationSec: num.positive(),
  chapter: z.object({ number: z.number().int().optional(), title: Text2.optional(), subtitle: Text2.optional() }).optional(),
  video: z.object({ master: z.string().min(1), hls: z.string().nullable().optional(), width: num.optional(), height: num.optional() }),
  audio: z.array(AudioSchema).min(1),
  captions: z.array(CaptionTrackSchema).default([]),
  segments: z.array(SegmentSchema).min(1),
  pausePoints: z.array(PausePointSchema).default([]),
});

export type Manifest = z.infer<typeof ManifestSchema>;
export type Segment = z.infer<typeof SegmentSchema>;
export type PausePoint = z.infer<typeof PausePointSchema>;
export type Prompt = z.infer<typeof PromptSchema>;

export const WordSchema = z.object({ sentence: z.string().optional(), cue: z.string().optional(), i: z.number().optional(), text: z.string(), start: num, end: num });
export const WordTimingSchema = z.object({ language: z.string().optional(), method: z.string().optional(), words: z.array(WordSchema) });
export type WordTiming = z.infer<typeof WordTimingSchema>;
export type TimedWord = z.infer<typeof WordSchema>;

export type ParseResult<T> = { ok: true; value: T } | { ok: false; message: string; issues: string[] };

function friendly(error: z.ZodError, what: string): { message: string; issues: string[] } {
  const issues = error.issues.map((i) => `${i.path.length ? i.path.join('.') : '(root)'}: ${i.message}`);
  return { message: `The ${what} could not be read (${issues.length} problem${issues.length === 1 ? '' : 's'}). First: ${issues[0] ?? 'unknown'}`, issues };
}

export function parseManifest(input: unknown): ParseResult<Manifest> {
  const r = ManifestSchema.safeParse(input);
  return r.success ? { ok: true, value: r.data } : { ok: false, ...friendly(r.error, 'lesson manifest') };
}

export function parseWordTiming(input: unknown): ParseResult<WordTiming> {
  const r = WordTimingSchema.safeParse(input);
  return r.success ? { ok: true, value: r.data } : { ok: false, ...friendly(r.error, 'caption timing file') };
}

/** Resolves a path written in the manifest (relative to the manifest file) to an absolute URL string. */
export function resolveMedia(manifestUrl: string, path: string, base: string = 'http://localhost'): string {
  const abs = new URL(manifestUrl, base);
  const out = new URL(path, abs);
  return out.origin === new URL(base).origin && !/^https?:/i.test(manifestUrl) ? out.pathname + out.search : out.toString();
}

export function audioFileFor(manifest: Manifest, lang: string): string | null {
  return manifest.audio.find((a) => a.lang === lang)?.file ?? null;
}

export function captionTrackFor(manifest: Manifest, lang: string) {
  return manifest.captions.find((c) => c.lang === lang) ?? null;
}

/** Languages that have BOTH an audio file and a caption track in the manifest. */
export function availableLanguages(manifest: Manifest): string[] {
  return manifest.audio.map((a) => a.lang).filter((l) => manifest.captions.some((c) => c.lang === l));
}
