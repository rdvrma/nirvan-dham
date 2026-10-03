// The video source abstraction. The player never talks to YouTube or to a <video> element directly: it talks to a VideoSource, so a CDN source
// (for gated lessons, later) can be added without touching the player. Two implementations exist: YouTubeSource and LocalSource.
import type { TrackLanguage } from '../config';

export type PlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'buffering' | 'ended';

export interface SourceEvents {
  onState?: (state: PlayerState) => void;
  onError?: (message: string) => void;
  onReady?: () => void;
}

export interface VideoSource {
  readonly kind: 'youtube' | 'local';
  /** Builds the player inside `host`. Resolves when the player can be controlled. */
  mount(host: HTMLElement, events: SourceEvents): Promise<void>;
  play(): void;
  pause(): void;
  seekTo(sec: number): void;
  /** Seconds on the lesson timeline. Cheap: it is read every ~200 ms. */
  getCurrentTime(): number;
  getDuration(): number;
  getState(): PlayerState;
  getRate(): number;
  /** Switches the audio language (a different YouTube video, or a different audio file) and continues from `resumeAt`. */
  setAudioLanguage(lang: TrackLanguage, resumeAt: number): Promise<void>;
  destroy(): void;
}

export interface SourceContext {
  /** the language of the audio the learner chose */
  audioLang: TrackLanguage;
  /** the site language, used for YouTube's interface language (hl) */
  siteLang: 'hi' | 'en';
}
