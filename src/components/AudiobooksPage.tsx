'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import ContactSection from '@/components/ContactSection';
import { getSavedLanguage, saveLanguage, type Language } from '@/lib/i18n';
import { ENGLISH_AUDIOBOOKS, HINDI_AUDIOBOOKS } from '@/lib/audiobook-data';

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export default function AudiobooksPage() {
  const [lang, setLang] = useState<Language>('hi');
  const [mounted, setMounted] = useState(false);
  const [channel, setChannel] = useState<'hi' | 'en'>('hi');
  const [channelTouched, setChannelTouched] = useState(false);
  const [activeBookIndex, setActiveBookIndex] = useState(0);
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.86);
  const [rate, setRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const saved = getSavedLanguage();
    setLang(saved);
    setChannel(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    const queryLang = new URLSearchParams(window.location.search).get('lang');
    if (queryLang !== 'hi' && queryLang !== 'en') return;
    setLang(queryLang);
    saveLanguage(queryLang);
    if (!channelTouched) setChannel(queryLang);
  }, [channelTouched]);

  const hi = lang === 'hi';
  const audioHi = channel === 'hi';
  const activeBooks = audioHi ? HINDI_AUDIOBOOKS : ENGLISH_AUDIOBOOKS;
  const activeBook = activeBooks[activeBookIndex] || activeBooks[0];
  const activeTrack = activeBook.tracks[activeTrackIndex] || activeBook.tracks[0];
  const progress = duration ? (currentTime / duration) * 100 : 0;

  const totalTracks = useMemo(
    () => HINDI_AUDIOBOOKS.reduce((sum, book) => sum + book.tracks.length, 0) + ENGLISH_AUDIOBOOKS.reduce((sum, book) => sum + book.tracks.length, 0),
    []
  );

  useEffect(() => {
    setActiveBookIndex((index) => Math.min(index, activeBooks.length - 1));
    setActiveTrackIndex(0);
    setCurrentTime(0);
    setDuration(0);
    setPlaying(false);
  }, [activeBooks.length, channel]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.playbackRate = rate;
  }, [rate, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !mounted) return;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    if (playing) {
      audio.play().catch(() => setPlaying(false));
    }
  }, [activeTrack.src, mounted, playing]);

  function chooseTrack(bookIndex: number, trackIndex: number, autoPlay = true) {
    setActiveBookIndex(bookIndex);
    setActiveTrackIndex(trackIndex);
    setPlaying(autoPlay);
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }

  function goNext() {
    const nextTrack = activeTrackIndex + 1;
    if (nextTrack < activeBook.tracks.length) {
      chooseTrack(activeBookIndex, nextTrack);
      return;
    }
    const nextBook = (activeBookIndex + 1) % activeBooks.length;
    chooseTrack(nextBook, 0);
  }

  function goPrev() {
    if (currentTime > 4) {
      if (audioRef.current) audioRef.current.currentTime = 0;
      return;
    }
    const prevTrack = activeTrackIndex - 1;
    if (prevTrack >= 0) {
      chooseTrack(activeBookIndex, prevTrack);
      return;
    }
    const prevBook = activeBookIndex === 0 ? activeBooks.length - 1 : activeBookIndex - 1;
    chooseTrack(prevBook, activeBooks[prevBook].tracks.length - 1);
  }

  function seek(value: number) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = (value / 100) * duration;
  }

  return (
    <main className="audio-page" style={{ opacity: mounted ? 1 : 0 }}>
      <Header lang={lang} onLangChange={(next) => { setLang(next); saveLanguage(next); if (!channelTouched) setChannel(next); }} />

      <section className="audio-hero">
        <video
          className="audio-hero-video"
          src="/library/audiobooks/nirvan-sutra-audiobook-hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        <div className="audio-hero-veil" />
        <div className="audio-hero-inner">
          <Link href="/library" className="audio-back">
            {hi ? 'पुस्तकालय' : 'Library'}
          </Link>
          <p className="audio-kicker">{hi ? 'निर्वाण धाम श्रवण साधना' : 'Nirvan Dham Listening Sadhana'}</p>
          <h1>{hi ? 'ऑडियोबुक अनुभव' : 'Audiobook Experience'}</h1>
          <p className="audio-lead">
            {hi
              ? 'जब शब्द कानों से भीतर उतरते हैं, तो वे केवल जानकारी नहीं रहते। वे धीरे-धीरे देखने की एक विधि बन जाते हैं। इन ऑडियोबुक्स को भागकर सुनने के लिए नहीं, ठहरकर सुनने के लिए बनाया गया है।'
              : 'These audiobooks are designed for slow listening. Let each chapter become a quiet sitting, a mirror for attention, and a companion for the inward path.'}
          </p>
          <div className="audio-hero-stats">
            <span><strong>{HINDI_AUDIOBOOKS.length}</strong>{hi ? ' हिंदी पुस्तकें' : ' Hindi books'}</span>
            <span><strong>{totalTracks}</strong>{hi ? ' अध्याय' : ' chapters'}</span>
            <span><strong>{ENGLISH_AUDIOBOOKS.length}</strong>{hi ? ' अंग्रेजी पुस्तकें' : ' English books'}</span>
          </div>
        </div>
      </section>

      <section className="audio-shell">
        <div className="audio-tabs">
          <button type="button" className={channel === 'hi' ? 'active' : ''} onClick={() => { setChannel('hi'); setChannelTouched(true); }}>
            हिंदी श्रवण
          </button>
          <button type="button" className={channel === 'en' ? 'active' : ''} onClick={() => { setChannel('en'); setChannelTouched(true); }}>
            English Listening
          </button>
        </div>

        {activeBook && activeTrack && (
          <div className="audio-grid">
            <aside className="audio-books">
              <p className="section-label">{audioHi ? 'श्रृंखला' : 'Series'}</p>
              {activeBooks.map((book, bookIndex) => (
                <button
                  key={book.slug}
                  type="button"
                  className={bookIndex === activeBookIndex ? 'book-row active' : 'book-row'}
                  onClick={() => chooseTrack(bookIndex, 0, false)}
                  style={{ '--accent': book.accent } as CSSProperties}
                >
                  <span className="book-num">{String(bookIndex + 1).padStart(2, '0')}</span>
                  <span>
                    <strong>{audioHi ? book.titleHindi : book.titleEnglish}</strong>
                    <small>{audioHi ? book.subtitleHindi : book.subtitleEnglish}</small>
                  </span>
                </button>
              ))}
            </aside>

            <section className="audio-player-card" style={{ '--accent': activeBook.accent } as CSSProperties}>
              <div className="player-top">
                <div>
                  <p className="section-label">{audioHi ? activeBook.moodHindi : activeBook.moodEnglish}</p>
                  <h2>{audioHi ? activeBook.titleHindi : activeBook.titleEnglish}</h2>
                  <p>{audioHi ? activeBook.subtitleHindi : activeBook.subtitleEnglish}</p>
                </div>
                <a className="download-current" href={activeTrack.src} download>
                  {audioHi ? 'डाउनलोड' : 'Download'}
                </a>
              </div>

              <div className="now-playing">
                <div className="pulse-disc">
                  <span />
                  <span />
                  <span />
                  <button type="button" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
                    {playing ? 'II' : '▶'}
                  </button>
                </div>
                <div className="track-main">
                  <p>{audioHi ? 'अब चल रहा है' : 'Now playing'}</p>
                  <h3>{activeTrack.title}</h3>
                  <div className="wave-bars" aria-hidden>
                    {Array.from({ length: 44 }, (_, index) => (
                      <span key={index} style={{ height: `${18 + ((index * 17) % 42)}px` }} />
                    ))}
                  </div>
                </div>
              </div>

              <audio
                ref={audioRef}
                src={activeTrack.src}
                onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
                onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime || 0)}
                onEnded={goNext}
              />

              <div className="seek-row">
                <span>{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={progress}
                  onChange={(event) => seek(Number(event.target.value))}
                  aria-label="Seek audio"
                />
                <span>{formatTime(duration)}</span>
              </div>

              <div className="player-controls">
                <button type="button" onClick={goPrev}>{audioHi ? 'पिछला' : 'Prev'}</button>
                <button type="button" className="primary" onClick={togglePlay}>{playing ? (audioHi ? 'रोकें' : 'Pause') : (audioHi ? 'चलाएं' : 'Play')}</button>
                <button type="button" onClick={goNext}>{audioHi ? 'अगला' : 'Next'}</button>
                <label>
                  {audioHi ? 'गति' : 'Speed'}
                  <select value={rate} onChange={(event) => setRate(Number(event.target.value))}>
                    {[0.85, 1, 1.15, 1.25, 1.5].map((value) => <option key={value} value={value}>{value}x</option>)}
                  </select>
                </label>
                <label>
                  {audioHi ? 'ध्वनि' : 'Volume'}
                  <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(event) => setVolume(Number(event.target.value))} />
                </label>
              </div>

              <div className="chapter-list">
                {activeBook.tracks.map((track, trackIndex) => (
                  <button
                    key={track.id}
                    type="button"
                    className={trackIndex === activeTrackIndex ? 'chapter active' : 'chapter'}
                    onClick={() => chooseTrack(activeBookIndex, trackIndex)}
                  >
                    <span>{String(trackIndex + 1).padStart(2, '0')}</span>
                    <strong>{track.title}</strong>
                    <a href={track.src} download onClick={(event) => event.stopPropagation()}>
                      MP3
                    </a>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
      </section>

      <ContactSection lang={lang} />

      <style jsx>{`
        .audio-page {
          min-height: 100vh;
          background: #061008;
          color: var(--c-ivory);
          transition: opacity 0.2s ease;
        }

        .audio-hero {
          min-height: min(760px, 86vh);
          position: relative;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-bottom: 1px solid rgba(212,168,67,0.14);
        }

        .audio-hero-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          filter: saturate(0.88) brightness(0.58);
          transform: scale(1.03);
        }

        .audio-hero-veil {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 50% 42%, rgba(212,168,67,0.1), transparent 34%),
            linear-gradient(90deg, rgba(6,16,8,0.86), rgba(6,16,8,0.5), rgba(6,16,8,0.86)),
            linear-gradient(180deg, rgba(6,16,8,0.24), #061008 100%);
        }

        .audio-hero-inner {
          position: relative;
          z-index: 1;
          width: min(960px, calc(100% - 2rem));
          padding-top: 5rem;
          text-align: center;
        }

        .audio-back {
          display: inline-flex;
          margin-bottom: 2rem;
          padding: 0.5rem 0.9rem;
          border: 1px solid rgba(212,168,67,0.22);
          border-radius: 999px;
          color: rgba(245,237,216,0.72);
          text-decoration: none;
          font-size: 0.78rem;
        }

        .audio-kicker,
        .section-label {
          color: #d4a843;
          font-size: 0.66rem;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          font-weight: 800;
        }

        .audio-hero h1 {
          margin: 1rem 0 1.25rem;
          font-family: var(--font-hind);
          font-size: clamp(3.4rem, 9vw, 7rem);
          line-height: 1.03;
          text-shadow: 0 0 70px rgba(212,168,67,0.18);
        }

        .audio-lead {
          width: min(760px, 100%);
          margin: 0 auto;
          color: rgba(245,237,216,0.58);
          font-family: ${hi ? 'var(--font-hind)' : 'var(--font-inter)'};
          font-size: clamp(0.98rem, 1.8vw, 1.16rem);
          line-height: 1.95;
        }

        .audio-hero-stats {
          margin: 2rem auto 0;
          display: flex;
          justify-content: center;
          gap: 0.8rem;
          flex-wrap: wrap;
        }

        .audio-hero-stats span {
          min-width: 132px;
          padding: 0.78rem 1rem;
          border: 1px solid rgba(212,168,67,0.14);
          border-radius: 8px;
          background: rgba(6,16,8,0.52);
          color: rgba(245,237,216,0.56);
        }

        .audio-hero-stats strong {
          display: block;
          color: #d4a843;
          font-family: var(--font-cormorant);
          font-size: 1.8rem;
          line-height: 1;
        }

        .audio-shell {
          width: min(1320px, calc(100% - 2rem));
          margin: 0 auto;
          padding: clamp(3rem, 6vw, 5rem) 0;
        }

        .audio-tabs {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .audio-tabs button,
        .player-controls button,
        .book-row,
        .chapter {
          cursor: pointer;
          font: inherit;
        }

        .audio-tabs button {
          border: 1px solid rgba(212,168,67,0.14);
          border-radius: 999px;
          padding: 0.72rem 1.3rem;
          background: rgba(255,255,255,0.04);
          color: rgba(245,237,216,0.48);
          font-weight: 800;
        }

        .audio-tabs button.active {
          background: rgba(212,168,67,0.17);
          border-color: rgba(212,168,67,0.45);
          color: #d4a843;
        }

        .audio-grid {
          display: grid;
          grid-template-columns: minmax(260px, 0.78fr) minmax(0, 1.8fr);
          gap: 1.1rem;
          align-items: start;
        }

        .audio-books,
        .audio-player-card,
        .english-panel {
          border: 1px solid rgba(212,168,67,0.12);
          background: linear-gradient(145deg, rgba(11,27,14,0.82), rgba(6,14,8,0.92));
          border-radius: 10px;
          box-shadow: 0 28px 80px rgba(0,0,0,0.38);
          backdrop-filter: blur(18px);
        }

        .audio-books {
          padding: 1rem;
          position: sticky;
          top: 88px;
        }

        .book-row {
          width: 100%;
          display: grid;
          grid-template-columns: 42px 1fr;
          gap: 0.8rem;
          text-align: left;
          border: 1px solid transparent;
          border-radius: 8px;
          background: transparent;
          color: rgba(245,237,216,0.68);
          padding: 0.9rem;
          margin-top: 0.55rem;
        }

        .book-row.active {
          border-color: color-mix(in srgb, var(--accent) 52%, transparent);
          background: color-mix(in srgb, var(--accent) 10%, rgba(255,255,255,0.03));
        }

        .book-num {
          color: var(--accent);
          font-family: var(--font-cormorant);
          font-size: 1.35rem;
        }

        .book-row strong,
        .book-row small {
          display: block;
        }

        .book-row small {
          margin-top: 0.2rem;
          color: rgba(245,237,216,0.36);
          line-height: 1.45;
        }

        .audio-player-card {
          padding: clamp(1.1rem, 3vw, 2rem);
          position: relative;
          overflow: hidden;
        }

        .audio-player-card::before {
          content: "";
          position: absolute;
          inset: -30% 18% auto auto;
          width: 360px;
          aspect-ratio: 1;
          border-radius: 50%;
          background: radial-gradient(circle, color-mix(in srgb, var(--accent) 18%, transparent), transparent 68%);
          pointer-events: none;
        }

        .player-top {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: start;
          margin-bottom: 1.6rem;
        }

        .player-top h2,
        .english-panel h2 {
          margin: 0.45rem 0 0.4rem;
          font-family: var(--font-hind);
          font-size: clamp(2rem, 4vw, 3.5rem);
          line-height: 1.1;
        }

        .player-top p:not(.section-label),
        .english-panel > p {
          color: rgba(245,237,216,0.46);
          line-height: 1.8;
        }

        .download-current {
          white-space: nowrap;
          border: 1px solid color-mix(in srgb, var(--accent) 42%, transparent);
          border-radius: 8px;
          padding: 0.7rem 0.95rem;
          color: var(--accent);
          text-decoration: none;
          font-weight: 800;
          background: color-mix(in srgb, var(--accent) 9%, transparent);
        }

        .now-playing {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 132px 1fr;
          gap: 1.4rem;
          align-items: center;
          padding: clamp(1rem, 3vw, 1.5rem);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          background: rgba(255,255,255,0.04);
        }

        .pulse-disc {
          position: relative;
          width: 118px;
          aspect-ratio: 1;
          display: grid;
          place-items: center;
        }

        .pulse-disc span {
          position: absolute;
          inset: 0;
          border: 1px solid color-mix(in srgb, var(--accent) 36%, transparent);
          border-radius: 50%;
          animation: pulseAudio 2.4s ease-out infinite;
        }

        .pulse-disc span:nth-child(2) { animation-delay: 0.55s; }
        .pulse-disc span:nth-child(3) { animation-delay: 1.1s; }

        .pulse-disc button {
          position: relative;
          z-index: 1;
          width: 70px;
          aspect-ratio: 1;
          border-radius: 50%;
          border: 1px solid color-mix(in srgb, var(--accent) 62%, transparent);
          background: color-mix(in srgb, var(--accent) 18%, #071009);
          color: var(--accent);
          font-weight: 900;
          box-shadow: 0 0 34px color-mix(in srgb, var(--accent) 20%, transparent);
          cursor: pointer;
        }

        @keyframes pulseAudio {
          from { transform: scale(0.65); opacity: 0.8; }
          to { transform: scale(1.18); opacity: 0; }
        }

        .track-main p {
          color: var(--accent);
          font-size: 0.68rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 900;
          margin-bottom: 0.4rem;
        }

        .track-main h3 {
          font-family: var(--font-hind);
          font-size: clamp(1.2rem, 2.8vw, 2rem);
          line-height: 1.35;
          margin-bottom: 1rem;
        }

        .wave-bars {
          height: 58px;
          display: flex;
          align-items: center;
          gap: 4px;
          overflow: hidden;
        }

        .wave-bars span {
          width: 4px;
          border-radius: 999px;
          background: linear-gradient(180deg, var(--accent), rgba(245,237,216,0.18));
          opacity: 0.55;
          animation: waveListen 1.6s ease-in-out infinite alternate;
        }

        .wave-bars span:nth-child(3n) { animation-delay: 0.25s; }
        .wave-bars span:nth-child(4n) { animation-delay: 0.45s; }

        @keyframes waveListen {
          from { transform: scaleY(0.45); opacity: 0.35; }
          to { transform: scaleY(1); opacity: 0.82; }
        }

        .seek-row {
          display: grid;
          grid-template-columns: 52px 1fr 52px;
          gap: 0.8rem;
          align-items: center;
          margin: 1.2rem 0;
          color: rgba(245,237,216,0.52);
          font-size: 0.78rem;
          font-variant-numeric: tabular-nums;
        }

        input[type="range"] {
          width: 100%;
          accent-color: var(--accent);
        }

        .player-controls {
          display: flex;
          gap: 0.65rem;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 1.2rem;
        }

        .player-controls button,
        .player-controls select {
          border: 1px solid rgba(212,168,67,0.18);
          background: rgba(255,255,255,0.045);
          color: rgba(245,237,216,0.72);
          border-radius: 8px;
          padding: 0.68rem 0.9rem;
          font-weight: 800;
        }

        .player-controls button.primary {
          color: var(--accent);
          border-color: color-mix(in srgb, var(--accent) 50%, transparent);
          background: color-mix(in srgb, var(--accent) 13%, transparent);
        }

        .player-controls label {
          display: inline-flex;
          gap: 0.5rem;
          align-items: center;
          color: rgba(245,237,216,0.46);
          font-size: 0.78rem;
        }

        .chapter-list {
          display: grid;
          gap: 0.5rem;
          max-height: 430px;
          overflow: auto;
          padding-right: 0.25rem;
        }

        .chapter {
          display: grid;
          grid-template-columns: 42px 1fr auto;
          gap: 0.8rem;
          align-items: center;
          text-align: left;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.025);
          color: rgba(245,237,216,0.7);
          border-radius: 8px;
          padding: 0.72rem 0.82rem;
        }

        .chapter.active {
          border-color: color-mix(in srgb, var(--accent) 50%, transparent);
          background: color-mix(in srgb, var(--accent) 9%, transparent);
        }

        .chapter span {
          color: var(--accent);
          font-family: var(--font-cormorant);
          font-size: 1.2rem;
        }

        .chapter a {
          color: rgba(245,237,216,0.42);
          text-decoration: none;
          font-size: 0.72rem;
          font-weight: 900;
        }

        .english-panel {
          padding: clamp(1.4rem, 4vw, 3rem);
          text-align: center;
        }

        .placeholder-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
          gap: 0.9rem;
          margin-top: 1.8rem;
        }

        .placeholder-grid article {
          border: 1px solid rgba(212,168,67,0.12);
          border-radius: 8px;
          padding: 1.2rem;
          background: rgba(255,255,255,0.035);
          text-align: left;
        }

        .placeholder-grid span {
          color: #d4a843;
          font-family: var(--font-cormorant);
          font-size: 1.4rem;
        }

        .placeholder-grid h3 {
          margin: 0.65rem 0 0.4rem;
          font-family: var(--font-cormorant);
          font-size: 1.35rem;
        }

        .placeholder-grid p {
          color: rgba(245,237,216,0.42);
          line-height: 1.65;
          font-size: 0.9rem;
        }

        @media (max-width: 900px) {
          .audio-grid {
            grid-template-columns: 1fr;
          }

          .audio-books {
            position: static;
          }

          .now-playing {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .pulse-disc {
            margin: 0 auto;
          }
        }

        @media (max-width: 620px) {
          .audio-hero {
            min-height: 720px;
          }

          .player-top {
            flex-direction: column;
          }

          .chapter {
            grid-template-columns: 34px 1fr;
          }

          .chapter a {
            grid-column: 2;
          }
        }
      `}</style>
    </main>
  );
}
