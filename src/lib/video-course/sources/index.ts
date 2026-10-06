import type { LessonConfig, TrackLanguage } from '../config';
import { audioFileFor, resolveMedia, type Manifest } from '../manifest';
import { LocalSource } from './local';
import type { SourceContext, VideoSource } from './types';
import { YouTubeSource } from './youtube';

export type { PlayerState, SourceContext, SourceEvents, VideoSource } from './types';

/** YouTube when the lesson has an id for the chosen audio language, otherwise the local proxy (the preview, and any language without an upload yet). */
export function createSource(args: { lesson: LessonConfig; manifest: Manifest; manifestUrl: string; ctx: SourceContext; poster?: string }): VideoSource {
  const { lesson, manifest, manifestUrl, ctx } = args;
  if (lesson.youtubeIds[ctx.audioLang]) return new YouTubeSource(lesson.youtubeIds, ctx);
  const embedded = (manifest.audio.find((a) => a.default)?.lang ?? 'hi') as TrackLanguage;
  const audio: Partial<Record<TrackLanguage, string>> = {};
  for (const l of ['hi', 'en'] as const) {
    const f = audioFileFor(manifest, l);
    if (f) audio[l] = resolveMedia(manifestUrl, f);
  }
  return new LocalSource(
    { mp4: resolveMedia(manifestUrl, manifest.video.master), hls: manifest.video.hls ? resolveMedia(manifestUrl, manifest.video.hls) : null, poster: args.poster, embeddedLang: embedded, audio },
    ctx,
  );
}
