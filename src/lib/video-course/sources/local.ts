// LocalSource: the committed 540p MP4 proxy (or an HLS playlist when the manifest has one, via hls.js loaded on demand). Used by the preview and whenever the lesson
// config has no YouTube id for the chosen audio language. The browser's native controls are used.
// Audio: the MP4 carries the master's own audio (Hindi). When the learner picks another audio language the video is muted and the manifest's audio file for that
// language plays in a hidden <audio> element, kept in step with the video (play, pause, seek, rate, drift correction).
import type { TrackLanguage } from '../config';
import type { PlayerState, SourceContext, SourceEvents, VideoSource } from './types';

export interface LocalMedia {
  /** URL of the MP4 (always present: the fallback) */
  mp4: string;
  /** URL of an HLS playlist, if the manifest has one */
  hls?: string | null;
  poster?: string;
  /** the language of the audio inside the MP4 */
  embeddedLang: TrackLanguage;
  /** separate audio files by language */
  audio: Partial<Record<TrackLanguage, string>>;
}

export class LocalSource implements VideoSource {
  readonly kind = 'local' as const;
  private video: HTMLVideoElement | null = null;
  private audio: HTMLAudioElement | null = null;
  private state: PlayerState = 'idle';
  private events: SourceEvents = {};
  private hlsInstance: { destroy(): void } | null = null;
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private audioLang: TrackLanguage;

  constructor(private readonly media: LocalMedia, ctx: SourceContext) {
    this.audioLang = ctx.audioLang;
  }

  async mount(host: HTMLElement, events: SourceEvents): Promise<void> {
    this.events = events;
    const v = document.createElement('video');
    v.setAttribute('playsinline', '');
    v.controls = true;
    v.preload = 'metadata';
    if (this.media.poster) v.poster = this.media.poster;
    v.style.cssText = 'width:100%;height:100%;display:block;background:#000;';
    v.setAttribute('aria-label', 'Lesson video');
    host.appendChild(v);
    this.video = v;

    const set = (s: PlayerState) => {
      this.state = s;
      events.onState?.(s);
    };
    v.addEventListener('playing', () => { set('playing'); this.audio?.play().catch(() => undefined); });
    v.addEventListener('pause', () => { if (!v.ended) set('paused'); this.audio?.pause(); });
    v.addEventListener('ended', () => { set('ended'); this.audio?.pause(); });
    v.addEventListener('waiting', () => { set('buffering'); this.audio?.pause(); });
    v.addEventListener('seeking', () => this.syncAudio(true));
    v.addEventListener('seeked', () => this.syncAudio(true));
    v.addEventListener('ratechange', () => { if (this.audio) this.audio.playbackRate = v.playbackRate; });
    v.addEventListener('error', () => events.onError?.('The video could not be loaded.'));

    await this.attachVideo(v);
    this.applyAudio();
    this.syncTimer = setInterval(() => this.syncAudio(false), 400);
    await new Promise<void>((resolve) => {
      if (v.readyState >= 1) resolve();
      else v.addEventListener('loadedmetadata', () => resolve(), { once: true });
      setTimeout(resolve, 4000); // a slow connection must not block the page
    });
    set('paused');
    events.onReady?.();
  }

  private async attachVideo(v: HTMLVideoElement) {
    const { hls, mp4 } = this.media;
    if (hls) {
      if (v.canPlayType('application/vnd.apple.mpegurl')) { v.src = hls; return; }
      try {
        const mod = await import('hls.js');
        const Hls = mod.default;
        if (Hls.isSupported()) {
          const h = new Hls({ enableWorker: true, lowLatencyMode: false });
          h.loadSource(hls);
          h.attachMedia(v);
          this.hlsInstance = h;
          return;
        }
      } catch { /* fall through to the MP4 */ }
    }
    v.src = mp4;
  }

  /** Muted video + separate audio file when the chosen language is not the one inside the MP4. */
  private applyAudio() {
    const v = this.video;
    if (!v) return;
    const file = this.audioLang === this.media.embeddedLang ? undefined : this.media.audio[this.audioLang];
    if (!file) {
      v.muted = false;
      this.audio?.pause();
      this.audio = null;
      return;
    }
    if (!this.audio) {
      this.audio = document.createElement('audio');
      this.audio.preload = 'auto';
      this.audio.setAttribute('aria-hidden', 'true');
    }
    if (this.audio.getAttribute('data-src') !== file) {
      this.audio.src = file;
      this.audio.setAttribute('data-src', file);
    }
    v.muted = true;
    this.syncAudio(true);
    if (!v.paused) this.audio.play().catch(() => undefined);
  }

  private syncAudio(force: boolean) {
    const v = this.video;
    const a = this.audio;
    if (!v || !a) return;
    a.playbackRate = v.playbackRate;
    if (force || Math.abs(a.currentTime - v.currentTime) > 0.25) {
      try { a.currentTime = v.currentTime; } catch { /* metadata not loaded yet */ }
    }
  }

  play() { void this.video?.play(); }
  pause() { this.video?.pause(); }
  seekTo(sec: number) { if (this.video) this.video.currentTime = sec; }
  getCurrentTime() { return this.video?.currentTime ?? 0; }
  getDuration() { return this.video && Number.isFinite(this.video.duration) ? this.video.duration : 0; }
  getState() { return this.state; }
  getRate() { return this.video?.playbackRate ?? 1; }

  async setAudioLanguage(lang: TrackLanguage, resumeAt: number): Promise<void> {
    this.audioLang = lang;
    this.applyAudio();
    this.seekTo(resumeAt);
  }

  destroy() {
    if (this.syncTimer) clearInterval(this.syncTimer);
    this.hlsInstance?.destroy();
    this.audio?.pause();
    this.video?.pause();
    this.video?.remove();
    this.audio = null;
    this.video = null;
  }
}
