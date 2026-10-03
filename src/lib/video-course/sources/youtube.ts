// YouTubeSource: the YouTube IFrame Player API with the privacy-enhanced domain. Native YouTube controls stay ON; nothing of ours is ever drawn over the player
// (captions are the only overlay and the player keeps clear of the control bar, see CaptionOverlay); the reflection panel opens BELOW the player.
import type { TrackLanguage } from '../config';
import type { PlayerState, SourceContext, SourceEvents, VideoSource } from './types';

export const YOUTUBE_EMBED_HOST = 'https://www.youtube-nocookie.com';
export const YOUTUBE_API_SRC = 'https://www.youtube.com/iframe_api';

/** The player parameters. `rel=0` limits related videos to the same channel, `cc_load_policy=0` keeps YouTube's own captions off (ours are drawn by the page). */
export function buildPlayerVars(siteLang: 'hi' | 'en', origin: string): Record<string, string | number> {
  return { enablejsapi: 1, rel: 0, playsinline: 1, hl: siteLang, cc_load_policy: 0, controls: 1, fs: 1, iv_load_policy: 3, origin };
}

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(sec: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  getPlaybackRate(): number;
  loadVideoById(arg: { videoId: string; startSeconds?: number }): void;
  destroy(): void;
}
interface YTNamespace {
  Player: new (el: HTMLElement, opts: Record<string, unknown>) => YTPlayer;
  PlayerState?: Record<string, number>;
}
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;

/** Loads https://www.youtube.com/iframe_api once. Only called when a lesson actually has a YouTube id. */
export function loadYouTubeApi(): Promise<YTNamespace> {
  if (typeof window === 'undefined') return Promise.reject(new Error('YouTube API needs a browser'));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<YTNamespace>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error('YouTube API loaded without a Player'));
    };
    const tag = document.createElement('script');
    tag.src = YOUTUBE_API_SRC;
    tag.async = true;
    tag.onerror = () => {
      apiPromise = null;
      reject(new Error('The YouTube player could not be loaded (network or blocker).'));
    };
    document.head.appendChild(tag);
  });
  return apiPromise;
}

const STATE: Record<number, PlayerState> = { [-1]: 'idle', 0: 'ended', 1: 'playing', 2: 'paused', 3: 'buffering', 5: 'paused' };

export class YouTubeSource implements VideoSource {
  readonly kind = 'youtube' as const;
  private player: YTPlayer | null = null;
  private state: PlayerState = 'idle';
  private events: SourceEvents = {};
  private ids: Record<TrackLanguage, string | null>;
  private audioLang: TrackLanguage;
  private readonly siteLang: 'hi' | 'en';
  private mountEl: HTMLElement | null = null;

  constructor(ids: Record<TrackLanguage, string | null>, ctx: SourceContext) {
    this.ids = ids;
    this.audioLang = ctx.audioLang;
    this.siteLang = ctx.siteLang;
  }

  async mount(host: HTMLElement, events: SourceEvents): Promise<void> {
    this.events = events;
    const id = this.ids[this.audioLang];
    if (!id) throw new Error(`no YouTube id for ${this.audioLang}`);
    const YT = await loadYouTubeApi();
    const el = document.createElement('div');
    host.appendChild(el);
    this.mountEl = el;
    await new Promise<void>((resolve, reject) => {
      this.player = new YT.Player(el, {
        host: YOUTUBE_EMBED_HOST,
        videoId: id,
        width: '100%',
        height: '100%',
        playerVars: buildPlayerVars(this.siteLang, window.location.origin),
        events: {
          onReady: () => {
            this.state = 'paused';
            events.onReady?.();
            resolve();
          },
          onStateChange: (e: { data: number }) => {
            this.state = STATE[e.data] ?? 'paused';
            events.onState?.(this.state);
          },
          onError: (e: { data: number }) => {
            const msg = `The video could not be played (YouTube error ${e.data}).`;
            events.onError?.(msg);
            reject(new Error(msg));
          },
        },
      });
    });
  }

  play() { this.player?.playVideo(); }
  pause() { this.player?.pauseVideo(); }
  seekTo(sec: number) { this.player?.seekTo(sec, true); }
  getCurrentTime() { return this.player?.getCurrentTime?.() ?? 0; }
  getDuration() { return this.player?.getDuration?.() ?? 0; }
  getState() { return this.state; }
  getRate() { return this.player?.getPlaybackRate?.() ?? 1; }

  async setAudioLanguage(lang: TrackLanguage, resumeAt: number): Promise<void> {
    const id = this.ids[lang];
    if (!id) throw new Error(`no YouTube id for ${lang}`);
    this.audioLang = lang;
    this.player?.loadVideoById({ videoId: id, startSeconds: resumeAt });
  }

  destroy() {
    try { this.player?.destroy(); } catch { /* the iframe may already be gone */ }
    this.mountEl?.remove();
    this.player = null;
    this.mountEl = null;
  }
}
