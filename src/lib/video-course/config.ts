// Video course configuration: the feature flag, the per-chapter lesson config and the player settings.
// Everything here is plain data + pure functions so it can be unit-tested and read from server and client components.
//
// NEXT_PUBLIC_VIDEO_COURSE            "1" | "true" turns the video-lesson experience on. Default OFF: the site then behaves exactly as before.
// NEXT_PUBLIC_VIDEO_COURSE_ENGLISH    "1" additionally enables the English track everywhere (it is an unreviewed machine translation, hidden by default).
// VIDEO_COURSE_PUBLIC_PREVIEW         "1" (server only) opens /video-preview/<chapter> without sign-in, for preview deployments and the e2e tests.

export type TrackLanguage = 'hi' | 'en';
export type CourseLanguage = 'hi' | 'en' | 'hl';
export type UnlockMode = 'sequential' | 'open';

export interface LessonConfig {
  chapter: number;
  /** URL of the manifest (a path under /public or an absolute URL). Media paths inside it are resolved against this URL. */
  manifest: string;
  /** poster frame shown before play (local source) */
  poster?: string;
  /** YouTube video id per audio language; null until the owner fills it in. A null id means the local proxy is used for that language. */
  youtubeIds: Record<TrackLanguage, string | null>;
  /** Languages learners may choose. English stays out until it is reviewed. */
  enabledLanguages: TrackLanguage[];
}

export const LESSONS: Record<number, LessonConfig> = {
  1: {
    chapter: 1,
    manifest: '/course-fixture/ch1/manifest.json',
    poster: '/course-fixture/ch1/poster.jpg',
    youtubeIds: { hi: null, en: null },
    enabledLanguages: ['hi'],
  },
};

export const PLAYER_CONFIG = {
  unlockMode: 'sequential' as UnlockMode,
  /** seconds before the reflection can be skipped without writing an answer */
  reflectionSkipDelaySec: 10,
  /** how often the player's clock is read */
  pollIntervalMs: 200,
  /** a jump forward of more than this many seconds between two polls is a seek, not playback */
  seekJumpSec: 1.5,
  /** the 95th percentile of the clock deviation above which captions fall back to sentence level */
  captionJitterLimitMs: 250,
  /** positions closer than this to the end count as finished */
  endToleranceSec: 1,
};

export function isVideoCourseEnabled(value: string | undefined = process.env.NEXT_PUBLIC_VIDEO_COURSE): boolean {
  return value === '1' || value === 'true';
}

export function isEnglishForcedOn(value: string | undefined = process.env.NEXT_PUBLIC_VIDEO_COURSE_ENGLISH): boolean {
  return value === '1' || value === 'true';
}

export function isPublicPreviewEnabled(value: string | undefined = process.env.VIDEO_COURSE_PUBLIC_PREVIEW): boolean {
  return value === '1' || value === 'true';
}

export function getLessonConfig(chapter: number): LessonConfig | null {
  return LESSONS[chapter] ?? null;
}

/** Languages a learner may pick for this lesson: the lesson's own list, plus English when it is forced on. */
export function enabledLanguagesFor(config: LessonConfig, forceEnglish: boolean = isEnglishForcedOn()): TrackLanguage[] {
  const set = new Set<TrackLanguage>(config.enabledLanguages);
  if (forceEnglish) set.add('en');
  if (set.size === 0) set.add('hi');
  return [...set];
}

/**
 * The site's language choice (hi / en / hl = Hinglish) mapped to a caption/audio language that exists AND is enabled.
 * Hinglish has no track of its own: it uses the Hindi track. English only when enabled.
 */
export function trackLanguageFor(courseLang: string, enabled: TrackLanguage[]): TrackLanguage {
  if (courseLang === 'en' && enabled.includes('en')) return 'en';
  return enabled.includes('hi') ? 'hi' : enabled[0] ?? 'hi';
}

/** Which experience a chapter page shows. Flag off, no config, or the learner asked to read: the existing reading flow. */
export function chooseChapterExperience(args: { flagOn: boolean; chapter: number; view?: string | null }): 'video' | 'reading' {
  if (!args.flagOn) return 'reading';
  if (args.view === 'read') return 'reading';
  return getLessonConfig(args.chapter) ? 'video' : 'reading';
}
