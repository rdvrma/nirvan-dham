'use client';
// The teaching-film player. One component for every lesson: while a film is in production it shows an intentional placeholder in exactly the
// footprint (16:9, controls strip, chapters) the real film will use; when content/videos.json gives a provider and url, the same component plays it —
// with the learner's language as a separate synced audio track when the dub has delivered it. No page changes are needed to publish a film.
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LOCALES } from '@/course/nirvan-sutra/locales';
import type { VideoAsset, LocaleCode } from '@/course/nirvan-sutra/types';
import { newWatchProgress, pauseWatchProgress, recordWatchSample } from '@/course/nirvan-sutra/watch-progress';
import { FilmGeometry } from './Graphics';
import { act } from './api';
import { useCourse } from './CourseShell';

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

interface YouTubeInstance {
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  playVideo(): void;
  pauseVideo(): void;
  getPlaybackRate(): number;
  mute(): void;
  destroy(): void;
}
interface YouTubeApi {
  Player: new (element: HTMLElement, options: {
    videoId: string;
    host: string;
    width: string;
    height: string;
    playerVars: Record<string, string | number>;
    events: { onReady: () => void; onStateChange: (event: { data: number }) => void; onPlaybackRateChange: () => void; onError: () => void };
  }) => YouTubeInstance;
}
type YouTubeWindow = Window & { YT?: YouTubeApi; onYouTubeIframeAPIReady?: () => void };
let youtubeApiPromise: Promise<YouTubeApi> | null = null;
function youtubeApi(): Promise<YouTubeApi> {
  const w = window as YouTubeWindow;
  if (w.YT?.Player) return Promise.resolve(w.YT);
  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve, reject) => {
      const previous = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => { previous?.(); if (w.YT?.Player) resolve(w.YT); };
      const existing = document.querySelector('script[data-ns-youtube-api]');
      if (!existing) {
        const script = document.createElement('script');
        script.dataset.nsYoutubeApi = 'true';
        script.src = 'https://www.youtube.com/iframe_api';
        script.onerror = () => { script.remove(); youtubeApiPromise = null; reject(new Error('YouTube player could not load')); };
        document.head.appendChild(script);
      }
    });
  }
  return youtubeApiPromise;
}

function YouTubeFilm({ videoId, locale, dubUrl, playLabel, control, onTime, onWatched }: {
  videoId: string; locale: LocaleCode; dubUrl?: string; playLabel: string;
  control: React.RefObject<YouTubeInstance | null>;
  onTime: (seconds: number) => void; onWatched: () => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const callbacks = useRef({ onTime, onWatched });
  useEffect(() => { callbacks.current = { onTime, onWatched }; }, [onTime, onWatched]);

  useEffect(() => {
    let disposed = false;
    const root = container.current;
    let interval: ReturnType<typeof setInterval> | null = null;
    const progress = newWatchProgress();
    let player: YouTubeInstance | null = null;
    const stop = () => { if (interval) clearInterval(interval); interval = null; audio.current?.pause(); pauseWatchProgress(progress); };
    const sample = () => {
      if (!player) return;
      const time = player.getCurrentTime();
      const duration = player.getDuration();
      callbacks.current.onTime(time);
      if (dubUrl && audio.current && Math.abs(audio.current.currentTime - time) > 0.4) audio.current.currentTime = time;
      if (recordWatchSample(progress, time, duration, performance.now())) callbacks.current.onWatched();
    };
    youtubeApi().then((api) => {
      if (disposed || !root) return;
      const mount = document.createElement('div');
      root.appendChild(mount);
      player = new api.Player(mount, {
        videoId, host: 'https://www.youtube-nocookie.com', width: '100%', height: '100%',
        playerVars: { rel: 0, playsinline: 1, origin: window.location.origin, hl: locale, cc_lang_pref: locale },
        events: {
          onReady: () => { if (player && !disposed) { control.current = player; if (dubUrl) player.mute(); setReady(true); } },
          onStateChange: ({ data }) => {
            if (disposed || !player) return;
            if (data === 1) {
              if (dubUrl) {
                player.mute();
                if (audio.current) {
                  audio.current.volume = 1;
                  audio.current.currentTime = player.getCurrentTime();
                  audio.current.playbackRate = player.getPlaybackRate();
                  void audio.current.play().then(() => { setStarted(true); setAudioBlocked(false); }).catch(() => {
                    player?.pauseVideo(); setStarted(false); setAudioBlocked(true);
                  });
                }
              }
              pauseWatchProgress(progress);
              sample();
              if (!interval) interval = setInterval(sample, 1000);
            } else if (data === 3) {
              // Keep the click-initiated audio play request alive while YouTube buffers.
              // Pausing it here aborts play() on the first tap in some browsers.
              if (audio.current) audio.current.volume = 0;
              if (interval) clearInterval(interval);
              interval = null;
              pauseWatchProgress(progress);
            } else {
              if (data === 0) sample();
              stop();
            }
          },
          onPlaybackRateChange: () => { if (player && audio.current) audio.current.playbackRate = player.getPlaybackRate(); },
          onError: () => { if (!disposed) setLoadFailed(true); },
        },
      });
    }).catch(() => { if (!disposed) setLoadFailed(true); });
    return () => { disposed = true; stop(); if (control.current === player) control.current = null; player?.destroy(); root?.replaceChildren(); };
  }, [videoId, locale, dubUrl, control]);

  const startTogether = () => {
    const player = control.current;
    const track = audio.current;
    if (!player || !track || !dubUrl) return;
    player.mute();
    track.currentTime = player.getCurrentTime();
    track.playbackRate = player.getPlaybackRate();
    // Both calls happen inside this one tap, so browsers can grant audio playback.
    const playback = track.play();
    player.playVideo();
    void playback.then(() => { setStarted(true); setAudioBlocked(false); }).catch(() => {
      player.pauseVideo(); setStarted(false); setAudioBlocked(true);
    });
  };

  return <><div ref={container} className="ns-youtube-frame" />
    {dubUrl && !started && !loadFailed && <div className="ns-dub-start">
      <button type="button" disabled={!ready} onClick={startTogether} aria-label={playLabel}>{playLabel}</button>
      {audioBlocked && <p role="alert">{locale === 'hi' ? 'आवाज़ शुरू नहीं हुई। फिर से चलाएँ।' : 'Audio did not start. Tap play again.'}</p>}
    </div>}
    {loadFailed && <a className="ns-youtube-fallback" href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">▶ YouTube ↗</a>}
    <audio ref={audio} src={dubUrl} preload="metadata" onError={() => {
      if (dubUrl) { control.current?.pauseVideo(); setStarted(false); setAudioBlocked(true); }
    }} />
  </>;
}

export default function VideoPlayer({ asset, title, eyebrow, stageN, watchKey, watched: initialWatched, transcript }: {
  asset: VideoAsset; title: string; eyebrow: string; stageN: number;
  watchKey: { kind: 'main'; stage: string } | { kind: 'question'; id: string };
  watched: boolean;
  transcript: { blocks: { title: string | null; lines: string[] }[]; fallback: boolean } | null;
}) {
  const { ui, locale, toast } = useCourse();
  const router = useRouter();
  const [watched, setWatched] = useState(initialWatched);
  const [watchReady, setWatchReady] = useState(initialWatched);
  const marking = useRef(false);
  const watchProgress = useRef(newWatchProgress());
  const video = useRef<HTMLVideoElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const youtube = useRef<YouTubeInstance | null>(null);
  const [t, setT] = useState(0);
  const isPlaceholder = asset.videoProvider === 'placeholder' || !asset.videoUrl && !asset.videoId;
  const dub = asset.audio[locale as LocaleCode]?.status === 'published' ? asset.audio[locale as LocaleCode] : undefined;
  const missingDub = locale !== 'hi' && asset.videoProvider === 'youtube' && asset.publishStatus === 'published' && !dub;
  const total = asset.durationSec ?? 0;

  const markWatched = async (verified = false) => {
    if (watched || marking.current || (!watchReady && !verified)) return;
    marking.current = true;
    setWatched(true);
    try { await act(watchKey.kind === 'main' ? 'main-viewed' : 'question-viewed', watchKey.kind === 'main' ? { stage: watchKey.stage } : { id: watchKey.id }); toast(ui.watched); router.refresh(); } catch { setWatched(false); } finally { marking.current = false; }
  };
  // a separate dubbed track follows the film: same clock, the film muted
  useEffect(() => {
    const v = video.current, a = audio.current;
    if (!v || !a) return;
    const sync = () => { if (Math.abs(a.currentTime - v.currentTime) > 0.25) a.currentTime = v.currentTime; };
    const play = () => { sync(); a.play().catch(() => {}); }, pause = () => a.pause();
    v.addEventListener('play', play); v.addEventListener('pause', pause); v.addEventListener('seeked', sync); v.addEventListener('timeupdate', sync);
    return () => { v.removeEventListener('play', play); v.removeEventListener('pause', pause); v.removeEventListener('seeked', sync); v.removeEventListener('timeupdate', sync); };
  }, [dub?.url]);
  const seek = (s: number) => {
    if (youtube.current) { youtube.current.seekTo(s, true); youtube.current.playVideo(); }
    else if (video.current) { video.current.currentTime = s; video.current.play().catch(() => {}); }
  };

  return (
    <div className="ns-stack">
      <div className="ns-video">
        {isPlaceholder ? (
          <div className="ns-ph" role="img" aria-label={`${title} — ${ui.filmInProduction}`}>
            <FilmGeometry n={stageN} />
            <div className="ns-ph-inner">
              <div className="ns-eyebrow">{eyebrow}</div>
              <div className="ns-ph-title">{title}</div>
              <div className="ns-ph-status"><i aria-hidden="true" />{ui.filmInProduction}</div>
            </div>
            <div className="ns-ctrl" aria-hidden="true">
              <button className="ns-ctrl-btn" disabled tabIndex={-1}><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z" /></svg></button>
              <div className="ns-ctrl-track">{asset.chapters.map((c) => <span key={c.atSec} className="ns-ctrl-mark" style={{ left: `${total ? (c.atSec / total) * 100 : 0}%` }} />)}</div>
              <span className="ns-ctrl-time">0:00 / {clock(total)}</span>
            </div>
          </div>
        ) : missingDub ? (
          <div className="ns-ph" role="status">
            <div className="ns-ph-inner"><div className="ns-ph-title">{title}</div><p>{ui.youtubeAudioMissing}</p></div>
          </div>
        ) : asset.videoProvider === 'youtube' && asset.videoId ? (
          <YouTubeFilm key={`${asset.videoId}:${locale}:${dub?.url ?? ''}`} videoId={asset.videoId} locale={locale} dubUrl={dub?.url} playLabel={ui.play} control={youtube} onTime={setT} onWatched={() => { setWatchReady(true); void markWatched(true); }} />
        ) : (
          <>
            <video ref={video} src={asset.videoUrl ?? undefined} poster={asset.poster ?? undefined} controls preload="metadata" playsInline muted={!!dub}
              onPlay={(e) => { const v = e.currentTarget; recordWatchSample(watchProgress.current, v.currentTime, v.duration, performance.now()); }}
              onPause={() => pauseWatchProgress(watchProgress.current)}
              onTimeUpdate={(e) => { const v = e.currentTarget; setT(v.currentTime); if (recordWatchSample(watchProgress.current, v.currentTime, v.duration, performance.now())) { setWatchReady(true); void markWatched(true); } }}>
              {asset.subtitles[locale as LocaleCode] && <track kind="subtitles" src={asset.subtitles[locale as LocaleCode]!.url} srcLang={locale} label={locale} default />}
            </video>
            {dub && <audio ref={audio} src={dub.url} preload="auto" />}
          </>
        )}
      </div>
      {isPlaceholder && <p className="ns-small ns-muted">{ui.filmPlaceholderNote}</p>}
      {asset.videoProvider === 'youtube' && !isPlaceholder && (
        <p className="ns-small ns-muted" role="status">
          {dub ? ui.externalAudioSelected : locale === 'hi' ? ui.youtubeAudioOriginal : ui.youtubeAudioMissing}
        </p>
      )}
      <div className="ns-row" style={{ justifyContent: 'space-between' }}>
        {!isPlaceholder && <button className={`ns-btn ${watched ? 'ns-btn-quiet' : ''}`} onClick={() => void markWatched()} disabled={watched || !watchReady} aria-pressed={watched}>
          {watched ? <><Tick /> {ui.watched}</> : ui.markWatched}
        </button>}
        {dub && <span className="ns-chip">{ui.audioLanguage?.replace('{lang}', LOCALES.find((l) => l.code === locale)?.native ?? locale)}</span>}
      </div>
      {asset.chapters.length > 0 && (
        <details className="ns-disclose">
          <summary>{ui.chapters}</summary>
          <div>
            <ol className="ns-chapters">
              {asset.chapters.map((c) => (
                <li key={c.atSec}><button onClick={() => !isPlaceholder && seek(c.atSec)} aria-disabled={isPlaceholder} aria-current={!isPlaceholder && t >= c.atSec ? 'step' : undefined}><time>{clock(c.atSec)}</time><span>{c.title}</span></button></li>
              ))}
            </ol>
          </div>
        </details>
      )}
      {transcript && (
        <details className="ns-disclose">
          <summary>{ui.transcript}</summary>
          <div>
            {transcript.fallback && <p className="ns-notice" style={{ marginBottom: 12 }}>{ui.transcriptHindiNote}</p>}
            <div className="ns-transcript" lang={transcript.fallback ? 'hi' : locale} tabIndex={0}>
              {transcript.blocks.map((b, i) => <div key={i}>{b.title && <h4>{b.title}</h4>}{b.lines.map((l, j) => <p key={j}>{l}</p>)}</div>)}
            </div>
          </div>
        </details>
      )}
    </div>
  );
}

export function Tick() {
  return <svg className="ns-tick" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="rgba(143,181,154,0.5)" /><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#8fb59a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
