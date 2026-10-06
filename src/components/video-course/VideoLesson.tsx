'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  PLAYER_CONFIG, enabledLanguagesFor, trackLanguageFor, type LessonConfig, type TrackLanguage,
} from '@/lib/video-course/config';
import {
  availableLanguages, captionTrackFor, parseManifest, parseWordTiming, resolveMedia, type Manifest,
} from '@/lib/video-course/manifest';
import {
  JitterMeter, buildCues, buildPauseStops, clampResume, evaluateTick, formatClock, isSegmentUnlocked, parseVtt, segmentIndexAt, unlockedLimitSec,
  type CaptionCue, type PauseStop,
} from '@/lib/video-course/logic';
import { noopGuideAdapter, type GuideAdapter, type ProgressAdapter } from '@/lib/video-course/progress';
import { createSource, type PlayerState, type VideoSource } from '@/lib/video-course/sources';
import { COPY } from './copy';
import { CaptionOverlay, type CaptionMode } from './CaptionOverlay';
import { ProgressRail } from './ProgressRail';
import { ReflectionPanel } from './ReflectionPanel';

const GOLD = '#d4a843';
const IVORY = 'rgba(245,237,216,1)';
const MUTED = 'rgba(245,237,216,0.58)';

export interface VideoLessonProps {
  lesson: LessonConfig;
  /** the course language of the URL: hi | en | hl (Hinglish uses the Hindi track) */
  courseLang: string;
  adapter: ProgressAdapter;
  guide?: GuideAdapter;
  backHref: string;
  /** link to the old reading flow for this chapter */
  readHref?: string;
  poster?: string;
  /** test hooks and settings overrides */
  settings?: Partial<typeof PLAYER_CONFIG>;
}

declare global {
  interface Window {
    __nirvanVideoDiag?: Record<string, unknown>;
  }
}

export default function VideoLesson({ lesson, courseLang, adapter, guide = noopGuideAdapter, backHref, readHref, poster, settings }: VideoLessonProps) {
  const cfg = { ...PLAYER_CONFIG, ...settings };
  const enabled = useMemo(() => enabledLanguagesFor(lesson), [lesson]);
  const initialLang = trackLanguageFor(courseLang, enabled);
  const siteLang: 'hi' | 'en' = initialLang === 'en' ? 'en' : 'hi';
  const uiLang: TrackLanguage = siteLang;
  const copy = COPY[uiLang];

  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [audioLang, setAudioLang] = useState<TrackLanguage>(initialLang);
  const [captionLang, setCaptionLang] = useState<TrackLanguage | 'off'>(initialLang);
  const [cueState, setCueState] = useState<{ key: string | null; cues: CaptionCue[] | null }>({ key: null, cues: null });
  const [wordLevel, setWordLevel] = useState(true);
  const [jitterFallback, setJitterFallback] = useState(false);
  const [time, setTime] = useState(0);
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [completed, setCompleted] = useState<string[]>([]);
  const [activeStop, setActiveStop] = useState<PauseStop | null>(null);
  const [savedAnswers, setSavedAnswers] = useState<Record<string, string[]>>({});
  const [finished, setFinished] = useState(false);
  const [guideMsg, setGuideMsg] = useState('');
  const [sourceKind, setSourceKind] = useState<'youtube' | 'local'>('local');
  const [resumeAt, setResumeAt] = useState(0);

  const hostRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<VideoSource | null>(null);
  const prevTimeRef = useRef<number | null>(null);
  const completedRef = useRef<Set<string>>(new Set());
  const activeStopRef = useRef<PauseStop | null>(null);
  const resumeRef = useRef(0);
  const progressLoaded = useRef(false);
  const jitter = useRef(new JitterMeter());
  const timeRef = useRef(0);

  const stops = useMemo(() => (manifest ? buildPauseStops(manifest) : []), [manifest]);
  const stopsRef = useRef<PauseStop[]>([]);
  useEffect(() => { stopsRef.current = stops; }, [stops]);

  // ── manifest ─────────────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(lesson.manifest, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`the manifest answered ${res.status}`);
        const parsed = parseManifest(await res.json());
        if (!parsed.ok) throw new Error(parsed.message);
        const saved = await adapter.load(parsed.value.id).catch(() => null);
        const done = new Set(saved?.completedPauseIds ?? []);
        const answers = await adapter.listAnswers(parsed.value.id).catch(() => []);
        if (!alive) return;
        completedRef.current = done;
        setCompleted([...done]);
        const bag: Record<string, string[]> = {};
        for (const a of answers) (bag[a.pauseId] ??= [])[a.promptIndex] = a.answer;
        setSavedAnswers(bag);
        const limit = unlockedLimitSec(buildPauseStops(parsed.value), done, cfg.unlockMode, parsed.value.durationSec);
        resumeRef.current = clampResume(saved?.positionSec ?? 0, limit, parsed.value.durationSec, cfg.endToleranceSec);
        setResumeAt(resumeRef.current);
        progressLoaded.current = true;
        setManifest(parsed.value);
        setPhase('ready');
      } catch (e) {
        if (!alive) return;
        setErrorMsg(e instanceof Error ? e.message : String(e));
        setPhase('error');
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.manifest, adapter, attempt]);

  const audioOptions = useMemo(() => (manifest ? enabled.filter((l) => manifest.audio.some((a) => a.lang === l)) : [initialLang]), [manifest, enabled, initialLang]);
  const captionOptions = useMemo(() => (manifest ? enabled.filter((l) => availableLanguages(manifest).includes(l) || captionTrackFor(manifest, l)) : [initialLang]), [manifest, enabled, initialLang]);

  // ── captions: word timing first, WebVTT as the fallback ──────────────────────────────────────────
  // loaded cues are stored with the track they belong to: after a language switch no cues show (never the old language's) until the new file has arrived
  const trackKey = manifest && captionLang !== 'off' && captionTrackFor(manifest, captionLang) ? `${manifest.id}:${captionLang}` : null;
  const cues = cueState.key === trackKey ? cueState.cues : null;
  useEffect(() => {
    if (!manifest || captionLang === 'off' || !trackKey) return;
    const track = captionTrackFor(manifest, captionLang);
    if (!track) return;
    let alive = true;
    const done = (c: CaptionCue[] | null, word: boolean) => { if (alive) { setCueState({ key: trackKey, cues: c }); setWordLevel(word); } };
    (async () => {
      try {
        if (track.wordTiming) {
          const res = await fetch(resolveMedia(lesson.manifest, track.wordTiming));
          const parsed = parseWordTiming(await res.json());
          if (parsed.ok && parsed.value.words.length) { done(buildCues(parsed.value.words), true); return; }
        }
      } catch { /* fall through to the VTT */ }
      try {
        if (track.vtt) {
          const res = await fetch(resolveMedia(lesson.manifest, track.vtt));
          const parsed = parseVtt(await res.text());
          done(parsed, parsed.some((c) => c.words.length > 1 && c.words[1].start > c.words[0].start));
          return;
        }
      } catch { /* captions are optional: the lesson still plays */ }
      done(null, true);
    })();
    return () => { alive = false; };
  }, [manifest, captionLang, trackKey, lesson.manifest]);

  // ── the video source ─────────────────────────────────────────────────────────────────────────────
  const saveProgress = useCallback(async (pos?: number) => {
    if (!manifest) return;
    const p = pos ?? timeRef.current;
    await adapter.save({ lessonId: manifest.id, positionSec: Math.max(0, p), completedPauseIds: [...completedRef.current], updatedAt: new Date().toISOString() }).catch(() => undefined);
  }, [adapter, manifest]);

  useEffect(() => {
    if (!manifest || phase !== 'ready' || !hostRef.current) return;
    const host = hostRef.current;
    const source = createSource({ lesson, manifest, manifestUrl: lesson.manifest, ctx: { audioLang, siteLang }, poster: poster ?? lesson.poster });
    sourceRef.current = source;
    setSourceKind(source.kind);
    jitter.current.reset();
    let alive = true;
    const start = timeRef.current > 1 ? timeRef.current : resumeRef.current;
    source.mount(host, {
      onState: (s) => { if (alive) { setPlayerState(s); if (s === 'ended') setFinished(true); else if (s === 'playing') setFinished(false); } },
      onError: (m) => { if (alive) { setErrorMsg(m); setPhase('error'); } },
    }).then(() => {
      if (!alive) return;
      if (start > 0) { source.seekTo(start); prevTimeRef.current = start; setTime(start); timeRef.current = start; }
    }).catch((e) => { if (alive) { setErrorMsg(e instanceof Error ? e.message : String(e)); setPhase('error'); } });
    return () => { alive = false; source.destroy(); sourceRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manifest, phase, audioLang, lesson]);

  // ── the clock: read every 200 ms; pauses, seek-back guard, jitter, captions ──────────────────────
  const openStop = useCallback((stop: PauseStop) => {
    activeStopRef.current = stop;
    setActiveStop(stop);
  }, []);

  useEffect(() => {
    if (!manifest || phase !== 'ready') return;
    const id = setInterval(() => {
      const src = sourceRef.current;
      if (!src) return;
      const t = src.getCurrentTime();
      const st = src.getState();
      timeRef.current = t;
      setTime(t);
      jitter.current.push(t, performance.now(), st === 'playing', src.getRate());
      // hysteresis: sentence level when the clock is above the limit over a full window, back to words once it is clearly steady again
      if (!jitterFallback && jitter.current.exceeds(cfg.captionJitterLimitMs, 30)) {
        setJitterFallback(true);
        console.info(`[video-course] caption clock jitter p95 ${Math.round(jitter.current.percentile(95))} ms is above ${cfg.captionJitterLimitMs} ms: captions fall back to sentence level`);
      } else if (jitterFallback && jitter.current.samples >= 30 && jitter.current.percentile(95) < cfg.captionJitterLimitMs * 0.6) {
        setJitterFallback(false);
        console.info('[video-course] caption clock is steady again: word highlight restored');
      }
      window.__nirvanVideoDiag = { jitterP95Ms: Math.round(jitter.current.percentile(95)), jitterSamples: jitter.current.samples, captionMode: jitterFallback || !wordLevel ? 'sentence' : 'word', wordLevel, jitterFallback, sourceKind: src.kind, time: t };
      if (activeStopRef.current) { prevTimeRef.current = t; return; }
      const act = evaluateTick({ prev: prevTimeRef.current, cur: t, stops: stopsRef.current, completed: completedRef.current, mode: cfg.unlockMode, seekJumpSec: cfg.seekJumpSec });
      prevTimeRef.current = t;
      if (act.type === 'pause') {
        src.pause();
        openStop(act.stop);
      } else if (act.type === 'seekBack') {
        src.seekTo(act.to);
        src.pause();
        prevTimeRef.current = act.to;
        openStop(act.stop);
      }
    }, cfg.pollIntervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manifest, phase, jitterFallback, wordLevel, openStop]);

  // save the position every 5 s while playing, and when the page is left
  useEffect(() => {
    if (!manifest || phase !== 'ready') return;
    const id = setInterval(() => { if (sourceRef.current?.getState() === 'playing') void saveProgress(); }, 5000);
    const leave = () => { void saveProgress(); };
    window.addEventListener('pagehide', leave);
    return () => { clearInterval(id); window.removeEventListener('pagehide', leave); leave(); };
  }, [manifest, phase, saveProgress]);

  // ── actions ──────────────────────────────────────────────────────────────────────────────────────
  const completedSet = useMemo(() => new Set(completed), [completed]);

  async function onContinue(answers: string[]) {
    const stop = activeStopRef.current;
    if (!stop || !manifest) return;
    const now = new Date().toISOString();
    await Promise.all(answers.map((a, i) => (a.trim() ? adapter.saveAnswer({ lessonId: manifest.id, pauseId: stop.id, segmentId: stop.segmentId, promptIndex: i, promptText: stop.prompts[i]?.hi ?? '', answer: a.trim(), updatedAt: now }).catch(() => undefined) : Promise.resolve())));
    setSavedAnswers((s) => ({ ...s, [stop.id]: answers }));
    completedRef.current.add(stop.id);
    setCompleted([...completedRef.current]);
    activeStopRef.current = null;
    setActiveStop(null);
    await saveProgress(stop.atSec);
    prevTimeRef.current = sourceRef.current?.getCurrentTime() ?? stop.atSec;
    sourceRef.current?.play();
  }

  function seekToSegment(i: number) {
    if (!manifest || activeStopRef.current) return;
    const seg = manifest.segments[i];
    const src = sourceRef.current;
    if (!seg || !src) return;
    src.seekTo(seg.startSec);
    prevTimeRef.current = seg.startSec;
    src.play();
  }

  function changeAudio(l: TrackLanguage) {
    if (l === audioLang) return;
    timeRef.current = sourceRef.current?.getCurrentTime() ?? timeRef.current;
    setAudioLang(l);
  }

  async function askGuide() {
    if (!manifest) return;
    const r = await guide.ask({ lessonId: manifest.id, segmentId: manifest.segments[segmentIndexAt(manifest, time)]?.id ?? '', timeSec: time, captionLanguage: captionLang });
    setGuideMsg(r.message || copy.guideSoon);
  }

  // ── render ───────────────────────────────────────────────────────────────────────────────────────
  const title = manifest?.chapter?.title ? (uiLang === 'en' && manifest.chapter.title.en ? manifest.chapter.title.en : manifest.chapter.title.hi) : '';
  const segs = manifest?.segments ?? [];
  const unlocked = segs.map((_, i) => isSegmentUnlocked(stops, i, completedSet, cfg.unlockMode));
  const segDone = segs.map((s, i) => { const ss = stops.filter((x) => x.segmentIndex === i); return ss.length > 0 && ss.every((x) => completedSet.has(x.id)); });
  const current = manifest ? segmentIndexAt(manifest, time) : 0;
  const captionMode: CaptionMode = jitterFallback || !wordLevel ? 'sentence' : 'word';
  const buffering = sourceKind === 'local' && (playerState === 'buffering' || phase === 'loading');
  const bodyFont = 'var(--font-hind), var(--font-inter), system-ui, sans-serif';

  return (
    <main style={{ minHeight: '100vh', background: '#050e07', color: IVORY, fontFamily: bodyFont }} data-testid="video-lesson" data-source={sourceKind} data-phase={phase}>
      <style>{PLAYER_CSS}</style>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0 clamp(1rem, 4vw, 2.5rem)', height: '54px', borderBottom: '1px solid rgba(212,168,67,0.1)' }}>
        <Link href={backHref} style={{ color: MUTED, textDecoration: 'none', fontFamily: 'var(--font-inter), system-ui, sans-serif', fontSize: '0.8rem', padding: '0.6rem 0.2rem' }}>← {copy.back}</Link>
        {readHref && <Link href={readHref} style={{ color: 'rgba(212,168,67,0.75)', textDecoration: 'none', fontFamily: 'var(--font-inter), system-ui, sans-serif', fontSize: '0.78rem', padding: '0.6rem 0.2rem' }}>{copy.readText}</Link>}
      </nav>

      <div style={{ maxWidth: '980px', margin: '0 auto', padding: 'clamp(1rem, 3vw, 2rem) clamp(0.75rem, 4vw, 2rem) 4rem' }}>
        {title && <h1 style={{ margin: '0 0 1rem', fontFamily: 'var(--font-cormorant), serif', fontWeight: 400, fontSize: 'clamp(1.7rem, 5vw, 2.6rem)', lineHeight: 1.15, color: IVORY }}>{title}</h1>}

        {phase === 'error' ? (
          <div role="alert" style={{ padding: '1.5rem', border: '1px solid rgba(212,168,67,0.25)', borderRadius: '12px', background: 'rgba(12,24,14,0.9)' }}>
            <p style={{ margin: '0 0 0.6rem', fontSize: '1.05rem' }}>{copy.loadError}</p>
            {errorMsg && <p style={{ margin: '0 0 1rem', color: MUTED, fontSize: '0.8rem', fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>{errorMsg}</p>}
            <button type="button" onClick={() => { setPhase('loading'); setAttempt((a) => a + 1); }} style={{ border: 0, borderRadius: '8px', padding: '0.7rem 1.2rem', background: GOLD, color: '#061008', fontWeight: 700, cursor: 'pointer', minHeight: '44px' }}>{copy.retry}</button>
          </div>
        ) : (
          <>
            <div role="region" aria-label={copy.playerRegion} style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', background: '#000', border: '1px solid rgba(212,168,67,0.18)', borderRadius: '10px', overflow: 'hidden' }} data-testid="player-frame">
              <div ref={hostRef} data-testid="player-host" style={{ position: 'absolute', inset: 0 }} />
              <CaptionOverlay cues={cues} time={time} lang={captionLang === 'off' ? audioLang : captionLang} mode={captionMode} clearOfControls={sourceKind === 'youtube'} />
              {buffering && <div data-testid="buffering" role="status" aria-live="polite" style={{ position: 'absolute', top: '0.6rem', left: '0.6rem', zIndex: 3, padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'rgba(5,14,7,0.7)', color: MUTED, fontSize: '0.72rem', fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>{phase === 'loading' ? copy.loading : copy.buffering}</div>}
            </div>

            {phase === 'ready' && resumeAt > 0 && playerState !== 'playing' && time <= resumeAt + 1 && !activeStop && (
              <p style={{ margin: '0.6rem 0 0', color: MUTED, fontSize: '0.78rem', fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>{copy.resumeAt(formatClock(resumeAt))}</p>
            )}

            {activeStop && manifest && (
              <ReflectionPanel
                key={activeStop.id}
                prompts={activeStop.prompts}
                lang={captionLang === 'off' ? audioLang : captionLang}
                copy={copy}
                skipDelaySec={cfg.reflectionSkipDelaySec}
                initialAnswers={savedAnswers[activeStop.id]}
                onContinue={onContinue}
              />
            )}

            {finished && !activeStop && (
              <section role="status" data-testid="lesson-finished" style={{ marginTop: '1rem', padding: '1.4rem', border: '1px solid rgba(212,168,67,0.22)', borderRadius: '12px', background: 'rgba(12,24,14,0.9)' }}>
                <h2 style={{ margin: '0 0 0.4rem', fontFamily: 'var(--font-cormorant), serif', fontWeight: 500, fontSize: '1.6rem' }}>{copy.finishedTitle}</h2>
                <p style={{ margin: '0 0 1rem', color: MUTED, lineHeight: 1.6 }}>{copy.finishedBody}</p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {readHref && <Link href={readHref} style={{ color: '#061008', background: GOLD, borderRadius: '8px', padding: '0.7rem 1.1rem', textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}>{copy.readText}</Link>}
                  <Link href={backHref} style={{ color: IVORY, border: '1px solid rgba(212,168,67,0.3)', borderRadius: '8px', padding: '0.7rem 1.1rem', textDecoration: 'none', fontSize: '0.88rem', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}>{copy.backToCourse}</Link>
                </div>
              </section>
            )}

            {manifest && <ProgressRail segments={segs} unlocked={unlocked} completedSegments={segDone} currentIndex={current} time={time} onSeek={seekToSegment} copy={copy} />}

            {manifest && (
              <div style={{ marginTop: '1.1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.25rem', alignItems: 'center', fontFamily: 'var(--font-inter), system-ui, sans-serif', fontSize: '0.8rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: MUTED }}>
                  {copy.audio}
                  <select aria-label={copy.audio} data-testid="audio-select" value={audioLang} onChange={(e) => changeAudio(e.target.value as TrackLanguage)} disabled={audioOptions.length < 2} style={selectStyle}>
                    {audioOptions.map((l) => <option key={l} value={l}>{copy.languageName[l]}</option>)}
                  </select>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: MUTED }}>
                  {copy.captions}
                  <select aria-label={copy.captions} data-testid="caption-select" value={captionLang} onChange={(e) => setCaptionLang(e.target.value as TrackLanguage | 'off')} style={selectStyle}>
                    {captionOptions.map((l) => <option key={l} value={l}>{copy.languageName[l]}</option>)}
                    <option value="off">{copy.captionsOff}</option>
                  </select>
                </label>
                <button type="button" onClick={askGuide} data-testid="ask-guide" style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid rgba(212,168,67,0.35)', color: GOLD, borderRadius: '8px', padding: '0.55rem 1rem', cursor: 'pointer', minHeight: '44px', fontWeight: 600 }}>{copy.askGuide}</button>
              </div>
            )}
            {guideMsg && <p role="status" data-testid="guide-message" style={{ margin: '0.7rem 0 0', color: MUTED, fontSize: '0.84rem', lineHeight: 1.6 }}>{guideMsg}</p>}
          </>
        )}
      </div>
    </main>
  );
}

// keyboard focus is always visible; learners who ask for reduced motion get none (the player only fades colours, but it respects the setting)
const PLAYER_CSS = `
[data-testid="video-lesson"] a:focus-visible, [data-testid="video-lesson"] button:focus-visible, [data-testid="video-lesson"] select:focus-visible, [data-testid="video-lesson"] textarea:focus-visible, [data-testid="video-lesson"] video:focus-visible { outline: 2px solid #ffe89a; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { [data-testid="video-lesson"] *, [data-testid="video-lesson"] *::before, [data-testid="video-lesson"] *::after { transition: none !important; animation: none !important; scroll-behavior: auto !important; } }
`;

const selectStyle = { background: 'rgba(4,12,6,0.9)', color: IVORY, border: '1px solid rgba(212,168,67,0.3)', borderRadius: '8px', padding: '0.5rem 0.6rem', minHeight: '44px', fontFamily: 'inherit', fontSize: '0.85rem' } as const;
