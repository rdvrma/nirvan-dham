'use client';
// The teaching-film player. One component for every lesson: while a film is in production it shows an intentional placeholder in exactly the
// footprint (16:9, controls strip, chapters) the real film will use; when content/videos.json gives a provider and url, the same component plays it —
// with the learner's language as a separate synced audio track when the dub has delivered it. No page changes are needed to publish a film.
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LOCALES } from '@/course/nirvan-sutra/locales';
import type { VideoAsset, LocaleCode } from '@/course/nirvan-sutra/types';
import { FilmGeometry } from './Graphics';
import { act } from './api';
import { useCourse } from './CourseShell';

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export default function VideoPlayer({ asset, title, eyebrow, stageN, watchKey, watched: initialWatched, transcript }: {
  asset: VideoAsset; title: string; eyebrow: string; stageN: number;
  watchKey: { kind: 'main'; stage: string } | { kind: 'question'; id: string };
  watched: boolean;
  transcript: { blocks: { title: string | null; lines: string[] }[]; fallback: boolean } | null;
}) {
  const { ui, locale, toast } = useCourse();
  const router = useRouter();
  const [watched, setWatched] = useState(initialWatched);
  const video = useRef<HTMLVideoElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const [t, setT] = useState(0);
  const isPlaceholder = asset.videoProvider === 'placeholder' || !asset.videoUrl && !asset.videoId;
  const dub = asset.audio[locale as LocaleCode];
  const total = asset.durationSec ?? 0;

  const markWatched = async () => {
    if (watched) return;
    setWatched(true);
    try { await act(watchKey.kind === 'main' ? 'main-viewed' : 'question-viewed', watchKey.kind === 'main' ? { stage: watchKey.stage } : { id: watchKey.id }); toast(ui.watched); router.refresh(); } catch { setWatched(false); }
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
  const seek = (s: number) => { if (video.current) { video.current.currentTime = s; video.current.play().catch(() => {}); } };

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
        ) : asset.videoProvider === 'youtube' ? (
          <iframe src={`https://www.youtube-nocookie.com/embed/${asset.videoId}?rel=0&modestbranding=1&cc_lang_pref=${locale}&hl=${locale}`} title={title} allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen loading="lazy" />
        ) : (
          <>
            <video ref={video} src={asset.videoUrl ?? undefined} poster={asset.poster ?? undefined} controls preload="metadata" playsInline muted={!!dub}
              onTimeUpdate={(e) => { const v = e.currentTarget; setT(v.currentTime); if (v.duration && v.currentTime / v.duration > 0.9) markWatched(); }}>
              {asset.subtitles[locale as LocaleCode] && <track kind="subtitles" src={asset.subtitles[locale as LocaleCode]!.url} srcLang={locale} label={locale} default />}
            </video>
            {dub && <audio ref={audio} src={dub.url} preload="auto" />}
          </>
        )}
      </div>
      {isPlaceholder && <p className="ns-small ns-muted">{ui.filmPlaceholderNote}</p>}
      <div className="ns-row" style={{ justifyContent: 'space-between' }}>
        <button className={`ns-btn ${watched ? 'ns-btn-quiet' : ''}`} onClick={markWatched} disabled={watched} aria-pressed={watched}>
          {watched ? <><Tick /> {ui.watched}</> : ui.markWatched}
        </button>
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
