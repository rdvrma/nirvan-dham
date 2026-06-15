'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Language } from '@/lib/i18n';
import { getSavedLanguage, saveLanguage } from '@/lib/i18n';
import Header from '@/components/Header';

type ChannelKey = 'hi' | 'en';

interface TeachingVideo {
  id: string;
  title: string;
  link: string;
  published: string;
  channel: string;
  handle: string;
  thumbnail: string;
  description: string;
}

const CHANNELS = {
  hi: {
    name: 'Nirvan Dham',
    handle: '@dhamnirvan',
    channelUrl: 'https://www.youtube.com/@dhamnirvan',
    playlistId: 'UUusQ7u0Axad_X0HJ1Mo1Itw',
  },
  en: {
    name: 'The Oneness Project',
    handle: '@TheOnenessProject',
    channelUrl: 'https://www.youtube.com/@TheOnenessProject',
    playlistId: 'UUig7X3vdCgsNPnFzo6gbVnQ',
  },
} as const;

const copy = {
  hi: {
    back: '← निर्वाण धाम',
    phone: '+91 93343 25558',
    eyebrow: 'निर्वाण धाम की शिक्षाएँ',
    title: 'शिक्षाएँ',
    lead: 'आदिसत्व की शिक्षाओं का संग्रह — हिंदी और अंग्रेज़ी दोनों धाराओं में।',
    hindi: 'हिंदी शिक्षाएँ',
    english: 'English Teachings',
    hindiDesc: 'निर्वाण धाम के हिंदी सत्संग, उपनिषद, ध्यान और जागरूकता की श्रृंखला।',
    englishDesc: 'Non-duality, Advaita, self-inquiry and direct seeing from The Oneness Project.',
    openChannel: 'YouTube चैनल खोलें',
    latest: 'नवीनतम शिक्षाएँ',
    playlist: 'पूर्ण प्लेलिस्ट',
    featured: 'मुख्य प्लेयर',
    recent: 'हाल की शिक्षाएँ',
    chooseVideo: 'किसी वीडियो को चुनें या पूरी प्लेलिस्ट देखें।',
    playingPlaylist: 'पूरी प्लेलिस्ट चल रही है',
    home: 'निर्वाण धाम',
  },
  en: {
    back: '← Nirvan Dham',
    phone: '+91 93343 25558',
    eyebrow: 'Teachings of Nirvan Dham',
    title: 'Teachings',
    lead: 'A dedicated space for Aadisatv’s Hindi and English teachings.',
    hindi: 'Hindi Teachings',
    english: 'English Teachings',
    hindiDesc: 'Hindi satsang, Upanishad reflections, meditation and awareness from Nirvan Dham.',
    englishDesc: 'Non-duality, Advaita, self-inquiry and direct seeing from The Oneness Project.',
    openChannel: 'Open YouTube Channel',
    latest: 'Latest Teachings',
    playlist: 'Full Playlist',
    featured: 'Featured Player',
    recent: 'Recent Teachings',
    chooseVideo: 'Choose a video below, or play the complete uploads playlist.',
    playingPlaylist: 'Playing complete playlist',
    home: 'Nirvan Dham',
  },
} as const;

export default function TeachingsPage() {
  const [lang, setLang] = useState<Language>('hi');
  const [selected, setSelected] = useState<ChannelKey>('hi');
  const [videos, setVideos] = useState<TeachingVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<TeachingVideo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.setTimeout(() => {
      const saved = getSavedLanguage();
      setLang(saved);
      setSelected(saved);
    }, 0);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const CHANNEL_IDS: Record<ChannelKey, string> = {
      hi: 'UCusQ7u0Axad_X0HJ1Mo1Itw',
      en: 'UCig7X3vdCgsNPnFzo6gbVnQ',
    };

    Promise.resolve()
      .then(() => {
        if (!cancelled) setLoading(true);
        return fetch(`/api/teachings?channel=${selected}`);
      })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setVideos(data.videos || []);
        setSelectedVideo(null);
      })
      .catch(() => {
        if (!cancelled) setVideos([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selected]);

  function selectLanguage(next: Language) {
    setLang(next);
    setSelected(next);
    saveLanguage(next);
  }

  function selectChannel(channel: ChannelKey) {
    setSelected(channel);
    setSelectedVideo(null);
  }

  const c = copy[lang];
  const active = CHANNELS[selected];
  const playlistUrl = `https://www.youtube-nocookie.com/embed/videoseries?list=${active.playlistId}&rel=0&modestbranding=1`;
  const embedUrl = useMemo(() => (
    selectedVideo
      ? `https://www.youtube-nocookie.com/embed/${selectedVideo.id}?rel=0&modestbranding=1`
      : playlistUrl
  ), [playlistUrl, selectedVideo]);

  return (
    <div className="teachings-page">
      <div className="teachings-grid-bg" />
      <div className="teachings-mandala" aria-hidden="true" />

      {/* Site-wide header with language toggle */}
      <Header lang={lang} onLangChange={selectLanguage} />

      <main className="teachings-main">
        <section className="teachings-hero">
          <span className="teachings-symbol">☸</span>
          <p>{c.eyebrow}</p>
          <h1>{c.title}</h1>
          <span className="teachings-line" />
          <p className="teachings-lead">{c.lead}</p>
        </section>

        <section className="nirvan-sutra-pillar" style={{ marginBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="teachings-card" style={{ padding: 'clamp(2rem, 5vw, 4rem)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {lang === 'hi' ? (
              <>
                <h2 style={{ color: 'var(--c-ivory)', fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, marginBottom: '0.5rem' }}>निर्वाण सूत्र क्या है?</h2>
                <p style={{ color: 'var(--c-ivdim)', lineHeight: 1.8, fontSize: '1.05rem', fontFamily: 'var(--font-hindi)' }}>निर्वाण सूत्र, निर्वाण धाम की वह जीवंत अभिव्यक्ति है जो अद्वैत (Non-duality), आत्म-जिज्ञासा (Self-inquiry), और विशुद्ध जागरूकता (Pure awareness) के माध्यम से आपको स्वयं के सत्य तक ले जाती है। आदिसत्व के सान्निध्य में, यह कोई सिद्धांत नहीं, बल्कि सत्य को सीधे देखने का मार्ग है।</p>
                
                <h3 style={{ color: 'var(--c-gold)', fontSize: '1.2rem', marginTop: '1rem', fontWeight: 500 }}>गहराई में उतरें</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                  <a href="/about-aadisatv" style={{ border: '1px solid rgba(212,168,67,0.3)', padding: '1rem', borderRadius: '8px', color: 'var(--c-ivory)', textDecoration: 'none', background: 'rgba(212,168,67,0.05)' }}>
                    <strong style={{ display: 'block', color: 'var(--c-gold)', marginBottom: '0.25rem' }}>आदिसत्व के बारे में</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--c-ivdim)' }}>जानें कि आदिसत्व कौन हैं और उनका मार्गदर्शन कैसे काम करता है।</span>
                  </a>
                  <a href="/online-samvad" style={{ border: '1px solid rgba(212,168,67,0.3)', padding: '1rem', borderRadius: '8px', color: 'var(--c-ivory)', textDecoration: 'none', background: 'rgba(212,168,67,0.05)' }}>
                    <strong style={{ display: 'block', color: 'var(--c-gold)', marginBottom: '0.25rem' }}>ऑनलाइन संवाद</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--c-ivdim)' }}>विश्व में कहीं से भी आदिसत्व के साथ 1-on-1 संवाद करें।</span>
                  </a>
                  <a href="/bodhgaya-samvad" style={{ border: '1px solid rgba(212,168,67,0.3)', padding: '1rem', borderRadius: '8px', color: 'var(--c-ivory)', textDecoration: 'none', background: 'rgba(212,168,67,0.05)' }}>
                    <strong style={{ display: 'block', color: 'var(--c-gold)', marginBottom: '0.25rem' }}>बोधगया संवाद</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--c-ivdim)' }}>बोधगया की पावन भूमि पर व्यक्तिगत मार्गदर्शन प्राप्त करें।</span>
                  </a>
                  <a href="/guided-meditation" style={{ border: '1px solid rgba(212,168,67,0.3)', padding: '1rem', borderRadius: '8px', color: 'var(--c-ivory)', textDecoration: 'none', background: 'rgba(212,168,67,0.05)' }}>
                    <strong style={{ display: 'block', color: 'var(--c-gold)', marginBottom: '0.25rem' }}>ध्यान मार्गदर्शन</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--c-ivdim)' }}>भीतर की शांति का अनुभव करने के लिए गाइडेड मेडिटेशन।</span>
                  </a>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ color: 'var(--c-ivory)', fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, marginBottom: '0.5rem' }}>What is Nirvan Sutra?</h2>
                <p style={{ color: 'var(--c-ivdim)', lineHeight: 1.8, fontSize: '1.05rem' }}>Nirvan Sutra is the living expression of Nirvan Dham. It guides seekers toward the ultimate truth of who they are through Advaita (Non-duality), Self-inquiry, and pure awareness. Under the guidance of Aadisatv, it is not a set of beliefs, but a direct pointing to reality.</p>
                
                <h3 style={{ color: 'var(--c-gold)', fontSize: '1.2rem', marginTop: '1rem', fontWeight: 500 }}>Explore the Path</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                  <a href="/about-aadisatv" style={{ border: '1px solid rgba(212,168,67,0.3)', padding: '1rem', borderRadius: '8px', color: 'var(--c-ivory)', textDecoration: 'none', background: 'rgba(212,168,67,0.05)' }}>
                    <strong style={{ display: 'block', color: 'var(--c-gold)', marginBottom: '0.25rem' }}>About Aadisatv</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--c-ivdim)' }}>Learn about the pure awareness at the heart of Nirvan Dham.</span>
                  </a>
                  <a href="/online-samvad" style={{ border: '1px solid rgba(212,168,67,0.3)', padding: '1rem', borderRadius: '8px', color: 'var(--c-ivory)', textDecoration: 'none', background: 'rgba(212,168,67,0.05)' }}>
                    <strong style={{ display: 'block', color: 'var(--c-gold)', marginBottom: '0.25rem' }}>Online Samvad</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--c-ivdim)' }}>Connect 1-on-1 with Aadisatv from anywhere in the world.</span>
                  </a>
                  <a href="/bodhgaya-samvad" style={{ border: '1px solid rgba(212,168,67,0.3)', padding: '1rem', borderRadius: '8px', color: 'var(--c-ivory)', textDecoration: 'none', background: 'rgba(212,168,67,0.05)' }}>
                    <strong style={{ display: 'block', color: 'var(--c-gold)', marginBottom: '0.25rem' }}>Bodhgaya Samvad</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--c-ivdim)' }}>Receive direct guidance in the sacred land of Bodhgaya.</span>
                  </a>
                  <a href="/guided-meditation" style={{ border: '1px solid rgba(212,168,67,0.3)', padding: '1rem', borderRadius: '8px', color: 'var(--c-ivory)', textDecoration: 'none', background: 'rgba(212,168,67,0.05)' }}>
                    <strong style={{ display: 'block', color: 'var(--c-gold)', marginBottom: '0.25rem' }}>Guided Meditation</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--c-ivdim)' }}>Audio sadhanas to help you rest in your true nature.</span>
                  </a>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="teachings-card">
          <div className="teachings-tabs">
            <button type="button" className={selected === 'hi' ? 'active' : ''} onClick={() => selectChannel('hi')}>
              <span>ॐ</span>
              <strong>{c.hindi}</strong>
              <small>{CHANNELS.hi.handle}</small>
            </button>
            <button type="button" className={selected === 'en' ? 'active' : ''} onClick={() => selectChannel('en')}>
              <span>∞</span>
              <strong>{c.english}</strong>
              <small>{CHANNELS.en.handle}</small>
            </button>
          </div>

          <div className="teachings-player-shell">
            <div className="teachings-player-area">
              <div className="teachings-player-topline">
                <span>{c.featured}</span>
                <button type="button" onClick={() => setSelectedVideo(null)}>
                  {c.playlist}
                </button>
              </div>
              <div className="teachings-player">
                <iframe
                  key={selectedVideo?.id ?? active.playlistId}
                  src={embedUrl}
                  title={selectedVideo?.title ?? `${active.name} ${c.latest}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>

            <aside className="teachings-channel">
              <p>{selected === 'hi' ? c.hindi : c.english}</p>
              <h2>{active.name}</h2>
              <span>{active.handle}</span>
              <p className="teachings-channel-desc">{selected === 'hi' ? c.hindiDesc : c.englishDesc}</p>
              <div className="teachings-actions">
                <a href={active.channelUrl} target="_blank" rel="noopener noreferrer">
                  {c.openChannel} →
                </a>
                <button type="button" onClick={() => setSelectedVideo(null)}>
                  {c.playlist}
                </button>
              </div>
            </aside>
          </div>
        </section>

        <section className="teachings-library">
          <div className="teachings-library-heading">
            <div>
              <p>{active.handle}</p>
              <h2>{c.recent}</h2>
            </div>
            <span>{selectedVideo ? selectedVideo.title : c.playingPlaylist}</span>
          </div>

          {loading ? (
            <div className="teachings-video-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <div className="video-skeleton" key={index} />
              ))}
            </div>
          ) : (
            <div className="teachings-video-grid">
              {videos.map((video) => (
                <button
                  key={video.id}
                  type="button"
                  className={selectedVideo?.id === video.id ? 'video-card active' : 'video-card'}
                  onClick={() => setSelectedVideo(video)}
                >
                  <span className="video-thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={video.thumbnail} alt="" loading="lazy" />
                    <span className="play-mark">▶</span>
                  </span>
                  <span className="video-meta">
                    <small>{video.published || active.handle}</small>
                    <strong>{video.title}</strong>
                    {video.description && <em>{video.description}</em>}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      <style jsx>{`
        .teachings-page {
          min-height: 100vh;
          background: var(--c-bg);
          color: var(--c-text);
          position: relative;
          overflow-x: hidden;
          font-family: var(--font-hind);
        }

        .teachings-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 78% 58% at 50% -10%, rgba(26,92,53,.34), transparent 68%),
            radial-gradient(ellipse 58% 48% at 82% 92%, rgba(61,138,88,.14), transparent 62%),
            radial-gradient(ellipse 45% 42% at 18% 80%, rgba(212,168,67,.08), transparent 64%),
            linear-gradient(180deg, var(--c-bg), var(--c-surface) 52%, var(--c-bg));
          pointer-events: none;
        }

        .teachings-grid-bg {
          position: fixed;
          inset: 0;
          opacity: .16;
          background-image:
            linear-gradient(rgba(212,168,67,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,168,67,.025) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        .teachings-mandala {
          position: fixed;
          width: min(880px, 116vw);
          aspect-ratio: 1;
          top: 48%;
          left: 50%;
          transform: translate(-50%, -50%);
          border: 1px solid rgba(212,168,67,.08);
          border-radius: 999px;
          pointer-events: none;
          opacity: .9;
        }

        .teachings-mandala::before,
        .teachings-mandala::after {
          content: '';
          position: absolute;
          inset: 14%;
          border: 1px solid rgba(212,168,67,.08);
          border-radius: 999px;
        }

        .teachings-mandala::after {
          inset: 28%;
        }


        .teachings-main {
          position: relative;
          z-index: 2;
          width: min(1240px, calc(100% - 2rem));
          margin: 0 auto;
          padding-top: 1rem;
          padding-bottom: 5rem;
        }

        .teachings-hero {
          text-align: center;
          padding: clamp(4rem, 8vw, 7rem) 0 clamp(2rem, 5vw, 3.5rem);
        }

        .teachings-symbol {
          display: block;
          color: var(--c-gold);
          font-size: clamp(2.4rem, 6vw, 4rem);
          margin-bottom: 1rem;
          filter: drop-shadow(0 0 28px rgba(212,168,67,.32));
        }

        .teachings-hero > p:first-of-type,
        .teachings-library-heading p,
        .teachings-player-topline span {
          color: rgba(212,168,67,.7);
          text-transform: uppercase;
          letter-spacing: .24em;
          font-size: .72rem;
          font-family: var(--font-inter);
          font-weight: 700;
        }

        .teachings-hero h1 {
          color: var(--c-ivory);
          font-family: var(--font-cormorant);
          font-weight: 300;
          font-size: clamp(3.2rem, 10vw, 7rem);
          line-height: .95;
          margin: .8rem 0 1.3rem;
        }

        .teachings-line {
          display: block;
          width: 140px;
          height: 1px;
          margin: 0 auto 1.5rem;
          background: linear-gradient(90deg, transparent, rgba(212,168,67,.5), transparent);
        }

        .teachings-lead {
          max-width: 700px;
          margin: 0 auto;
          color: var(--c-ivdim);
          line-height: 1.85;
          font-size: clamp(1rem, 2vw, 1.16rem);
        }

        .teachings-card,
        .teachings-library {
          border: 1px solid rgba(212,168,67,.15);
          background: rgba(13,31,16,.72);
          backdrop-filter: blur(14px);
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(0,0,0,.35), 0 0 50px rgba(26,92,53,.14);
        }

        .teachings-tabs {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          border-bottom: 1px solid rgba(212,168,67,.12);
        }

        .teachings-tabs button {
          border: 0;
          border-bottom: 2px solid transparent;
          background: transparent;
          color: var(--c-ivdim);
          padding: 1.2rem 1rem;
          cursor: pointer;
          display: grid;
          gap: .25rem;
          font-family: inherit;
        }

        .teachings-tabs span {
          color: var(--c-gold);
          font-size: 1.5rem;
        }

        .teachings-tabs strong {
          color: inherit;
          font-size: 1rem;
        }

        .teachings-tabs small {
          color: rgba(196,184,154,.68);
          letter-spacing: .08em;
        }

        .teachings-tabs .active {
          color: var(--c-goldhov);
          border-bottom-color: var(--c-gold);
          background: rgba(212,168,67,.08);
        }

        .teachings-player-shell {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 330px;
        }

        .teachings-player-area {
          padding: clamp(1rem, 2vw, 1.4rem);
        }

        .teachings-player-topline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: .9rem;
        }

        .teachings-player-topline button,
        .teachings-actions button {
          color: var(--c-gold);
          border: 1px solid rgba(212,168,67,.25);
          border-radius: 999px;
          padding: .45rem .8rem;
          background: rgba(212,168,67,.06);
        }

        .teachings-player {
          aspect-ratio: 16 / 9;
          background: #000;
          min-height: 420px;
          border: 1px solid rgba(212,168,67,.18);
          border-radius: 8px;
          overflow: hidden;
        }

        .teachings-player iframe {
          width: 100%;
          height: 100%;
          border: 0;
          display: block;
        }

        .teachings-channel {
          padding: clamp(1.4rem, 3vw, 2rem);
          border-left: 1px solid rgba(212,168,67,.12);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .teachings-channel > p:first-child {
          color: rgba(212,168,67,.7);
          text-transform: uppercase;
          letter-spacing: .18em;
          font-size: .68rem;
          font-weight: 700;
          margin-bottom: .75rem;
        }

        .teachings-channel h2,
        .teachings-library-heading h2 {
          color: var(--c-ivory);
          font-family: var(--font-cormorant);
          font-size: clamp(1.8rem, 3vw, 2.5rem);
          font-weight: 300;
          line-height: 1.05;
          margin-bottom: .35rem;
        }

        .teachings-channel span {
          color: var(--c-gold);
          letter-spacing: .08em;
          font-size: .82rem;
          margin-bottom: 1.2rem;
        }

        .teachings-channel-desc {
          color: var(--c-ivdim);
          line-height: 1.75;
          font-size: .92rem;
          margin-bottom: 1.5rem;
        }

        .teachings-actions {
          display: grid;
          gap: .75rem;
        }

        .teachings-actions a {
          display: inline-flex;
          justify-content: center;
          border: 1px solid rgba(212,168,67,.36);
          background: rgba(212,168,67,.08);
          color: var(--c-goldhov);
          text-decoration: none;
          border-radius: 6px;
          padding: .85rem 1rem;
          font-weight: 700;
        }

        .teachings-library {
          margin-top: 1.5rem;
          padding: clamp(1rem, 3vw, 1.5rem);
        }

        .teachings-library-heading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }

        .teachings-library-heading > span {
          max-width: 420px;
          color: var(--c-ivdim);
          font-size: .86rem;
          line-height: 1.5;
          text-align: right;
        }

        .teachings-video-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }

        .video-card,
        .video-skeleton {
          min-height: 100%;
          border: 1px solid rgba(212,168,67,.12);
          background: rgba(8,15,10,.45);
          border-radius: 8px;
        }

        .video-card {
          color: inherit;
          display: grid;
          grid-template-columns: 132px minmax(0, 1fr);
          gap: .85rem;
          padding: .75rem;
          text-align: left;
          cursor: pointer;
          font-family: inherit;
          transition: border-color .25s, background .25s, transform .25s;
        }

        .video-card:hover,
        .video-card.active {
          border-color: rgba(212,168,67,.36);
          background: rgba(212,168,67,.07);
          transform: translateY(-2px);
        }

        .video-thumb {
          position: relative;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border-radius: 6px;
          background: #000;
        }

        .video-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .play-mark {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          color: white;
          background: rgba(0,0,0,.22);
          text-shadow: 0 2px 10px rgba(0,0,0,.6);
        }

        .video-meta {
          min-width: 0;
          display: grid;
          align-content: start;
          gap: .35rem;
        }

        .video-meta small {
          color: rgba(212,168,67,.68);
          letter-spacing: .08em;
          font-size: .68rem;
        }

        .video-meta strong {
          color: var(--c-ivory);
          font-size: .88rem;
          line-height: 1.35;
        }

        .video-meta em {
          color: var(--c-ivdim);
          font-style: normal;
          font-size: .78rem;
          line-height: 1.45;
          opacity: .72;
        }

        .video-skeleton {
          min-height: 116px;
          background: linear-gradient(90deg, rgba(13,31,16,.7), rgba(212,168,67,.08), rgba(13,31,16,.7));
          background-size: 200% 100%;
          animation: shimmerTeachings 1.4s infinite;
        }

        @keyframes shimmerTeachings {
          from { background-position: 100% 0; }
          to { background-position: -100% 0; }
        }

        @media (max-width: 1080px) {
          .teachings-player-shell {
            grid-template-columns: 1fr;
          }

          .teachings-channel {
            border-left: 0;
            border-top: 1px solid rgba(212,168,67,.12);
          }

          .teachings-player {
            min-height: 0;
          }

          .teachings-video-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .teachings-nav {
            height: auto;
            gap: .8rem;
            padding-top: 1rem;
            padding-bottom: 1rem;
          }

          .teachings-tabs,
          .teachings-video-grid {
            grid-template-columns: 1fr;
          }

          .teachings-lang {
            position: absolute;
            top: 86px;
          }

          .teachings-library-heading {
            display: grid;
            align-items: start;
          }

          .teachings-library-heading > span {
            text-align: left;
          }

          .video-card {
            grid-template-columns: 120px minmax(0, 1fr);
          }
        }

        @media (max-width: 460px) {
          .video-card {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
