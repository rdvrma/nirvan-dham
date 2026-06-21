'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Language } from '@/lib/i18n';
import { getSavedLanguage, saveLanguage } from '@/lib/i18n';
import Header from '@/components/Header';
import ContactSection from '@/components/ContactSection';
import MuktibodhMagazineSection from '@/components/MuktibodhMagazineSection';
import CourseBanner from '@/components/CourseBanner';
import { EBOOKS, AUDIOBOOKS, MAGAZINES } from '@/lib/library-data';
import type { EBook } from '@/lib/library-data';

// ── Waveform bars ────────────────────────────────────────
function Waveform() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '32px' }}>
      {[4, 8, 14, 10, 18, 7, 12, 16, 9, 13, 17, 8, 5, 10, 14].map((h, i) => (
        <div key={i} style={{
          width: '3px', borderRadius: '2px',
          height: `${h * 2}px`,
          background: `rgba(212,168,67,${0.15 + (i % 4) * 0.12})`,
          animation: `wavePulse ${1.2 + (i % 3) * 0.4}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.06}s`,
        }} />
      ))}
      <style>{`@keyframes wavePulse { from { transform: scaleY(0.6); } to { transform: scaleY(1); } }`}</style>
    </div>
  );
}

// ── Floating particle for hero ───────────────────────────
function Particles() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {[...Array(18)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: `${2 + (i % 3)}px`, height: `${2 + (i % 3)}px`,
          borderRadius: '50%',
          background: `rgba(212,168,67,${0.15 + (i % 4) * 0.08})`,
          left: `${(i * 37 + 11) % 100}%`,
          top: `${(i * 53 + 7) % 100}%`,
          animation: `floatUp ${8 + (i % 6) * 2}s ease-in-out infinite`,
          animationDelay: `${i * 0.7}s`,
        }} />
      ))}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 0.6; }
          100% { transform: translateY(-80px) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ── Book Card ─────────────────────────────────────────────
function BookCard({ book, hi }: { book: EBook; hi: boolean }) {
  const [hovered, setHovered] = useState(false);
  const title = hi && book.titleHindi ? book.titleHindi : book.titleEnglish;
  const subtitle = hi && book.subtitleHindi ? book.subtitleHindi : book.subtitle;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column',
        background: hovered ? 'rgba(12,28,15,0.95)' : 'rgba(10,22,12,0.7)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${hovered ? 'rgba(212,168,67,0.45)' : 'rgba(212,168,67,0.1)'}`,
        borderRadius: '18px', overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hovered
          ? '0 36px 90px rgba(0,0,0,0.65), 0 0 0 1px rgba(212,168,67,0.14), 0 0 50px rgba(212,168,67,0.07)'
          : '0 6px 28px rgba(0,0,0,0.4)',
      }}
    >
      {/* Cover */}
      <div style={{ position: 'relative', aspectRatio: '2/3', background: 'linear-gradient(145deg,#071209,#0f2012)', flexShrink: 0, overflow: 'hidden' }}>
        {book.cover ? (
          <>
            <Image
              src={book.cover} alt={title}
              fill sizes="(max-width:640px) 45vw, 220px"
              style={{ objectFit: 'cover', transition: 'transform 0.7s cubic-bezier(0.4,0,0.2,1)', transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
            />
            {/* Overlay shine on hover */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(212,168,67,0.14) 0%, transparent 60%)',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.4s',
            }} />
          </>
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '1.25rem', textAlign: 'center',
            background: 'repeating-linear-gradient(135deg,rgba(212,168,67,0.025) 0,rgba(212,168,67,0.025) 1px,transparent 0,transparent 50%) 0 0 / 14px 14px',
          }}>
            <div style={{ fontSize: '2.2rem', opacity: 0.15, marginBottom: '0.75rem' }}>📖</div>
            <p style={{
              fontFamily: hi && book.titleHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
              fontStyle: hi && book.titleHindi ? 'normal' : 'italic',
              color: 'rgba(212,168,67,0.35)', fontSize: '0.88rem', lineHeight: 1.4,
            }}>{title}</p>
            <span style={{
              display: 'inline-block', marginTop: '0.85rem', padding: '0.22rem 0.7rem',
              border: '1px solid rgba(212,168,67,0.14)', borderRadius: '999px',
              fontSize: '0.56rem', letterSpacing: '0.16em',
              color: 'rgba(212,168,67,0.32)', textTransform: 'uppercase',
            }}>
              {hi ? 'शीघ्र प्रकाश्य' : 'Coming Soon'}
            </span>
          </div>
        )}

        {/* Language badge */}
        <div style={{
          position: 'absolute', top: '0.6rem', right: '0.6rem',
          background: 'rgba(5,8,6,0.88)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(212,168,67,0.28)', borderRadius: '999px',
          padding: '0.22rem 0.65rem', fontSize: '0.55rem',
          letterSpacing: '0.1em', color: '#d4a843', fontWeight: 700,
        }}>{book.lang === 'hi' ? 'हिंदी' : 'EN'}</div>

        {/* Bottom gradient for text readability */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
          background: 'linear-gradient(to top, rgba(7,12,9,0.85), transparent)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Info */}
      <div style={{ padding: '1rem 1.15rem 1.15rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontFamily: hi && book.titleHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
          fontStyle: hi && book.titleHindi ? 'normal' : 'italic',
          fontSize: hi && book.titleHindi ? '0.95rem' : '1.08rem',
          fontWeight: hi && book.titleHindi ? 600 : 400,
          color: 'var(--c-ivory)', lineHeight: 1.3, margin: 0, marginBottom: '0.3rem',
        }}>{title}</h3>
        {subtitle && (
          <p style={{
            fontSize: '0.67rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.55, margin: '0 0 0.3rem',
            fontFamily: hi && book.subtitleHindi ? 'var(--font-hind)' : 'var(--font-inter)',
          }}>{subtitle}</p>
        )}
        <p style={{ fontSize: '0.6rem', color: '#d4a843', opacity: 0.6, margin: 0 }}>— {book.author}</p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '0.45rem', marginTop: 'auto', paddingTop: '0.9rem' }}>
          {!book.isPlaceholder ? (
            <>
              <Link
                href={`/library/${book.slug}`}
                style={{
                  flex: 1, padding: '0.58rem 0', textAlign: 'center',
                  background: hovered ? 'rgba(212,168,67,0.26)' : 'rgba(212,168,67,0.13)',
                  border: '1px solid rgba(212,168,67,0.38)', borderRadius: '10px',
                  color: '#d4a843', fontSize: '0.73rem', fontWeight: 700,
                  letterSpacing: '0.02em', textDecoration: 'none', transition: 'background 0.2s',
                  fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
                }}
              >
                {hi ? '📖 पढ़ें' : '📖 Read'}
              </Link>
              <a
                href={book.pdf} download
                style={{
                  flex: 1, padding: '0.58rem 0', textAlign: 'center',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
                  color: 'rgba(255,255,255,0.42)', fontSize: '0.73rem', fontWeight: 600,
                  textDecoration: 'none', transition: 'all 0.2s',
                  fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              >
                ↓ PDF
              </a>
            </>
          ) : (
            <div style={{
              flex: 1, padding: '0.58rem 0', textAlign: 'center',
              border: '1px dashed rgba(212,168,67,0.1)', borderRadius: '10px',
              color: 'rgba(212,168,67,0.25)', fontSize: '0.7rem',
              fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
            }}>
              {hi ? 'जल्द आ रहा है' : 'Coming soon'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Audio Card ─────────────────────────────────────────────
function AudioCard({ book, hi }: { book: typeof AUDIOBOOKS[0]; hi: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(14,33,17,0.9)' : 'rgba(10,24,12,0.65)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${hov ? 'rgba(212,168,67,0.28)' : 'rgba(212,168,67,0.07)'}`,
        borderRadius: '16px', padding: '1.5rem',
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        transform: hov ? 'translateY(-5px)' : 'none',
        boxShadow: hov ? '0 24px 56px rgba(0,0,0,0.5)' : '0 2px 12px rgba(0,0,0,0.2)',
      }}
    >
      <Waveform />
      <p style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: '#d4a843', opacity: 0.55, textTransform: 'uppercase', margin: '0.9rem 0 0.4rem' }}>
        {book.duration}
      </p>
      <h3 style={{
        fontFamily: 'var(--font-cormorant)', fontStyle: 'italic',
        fontSize: '1.08rem', color: 'var(--c-ivory)', marginBottom: '0.25rem', lineHeight: 1.3,
      }}>
        {hi && book.titleHindi ? book.titleHindi : book.title}
      </h3>
      <p style={{ fontSize: '0.6rem', color: '#d4a843', opacity: 0.5, marginBottom: '1.1rem' }}>— {book.author}</p>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.4rem 0.95rem',
        background: 'rgba(212,168,67,0.05)', border: '1px solid rgba(212,168,67,0.1)',
        borderRadius: '8px', color: 'rgba(212,168,67,0.32)', fontSize: '0.7rem',
      }}>
        ▶ {hi ? 'शीघ्र प्रकाश्य' : 'Coming Soon'}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function LibraryPage() {
  // FOUC fix: start with 'hi' (matches server), update after mount
  const [lang, setLang] = useState<Language>('hi');
  const [mounted, setMounted] = useState(false);
  const [ebookTab, setEbookTab] = useState<'hi' | 'en'>('hi');
  const [section, setSection] = useState<'ebooks' | 'audio'>('ebooks');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const saved = getSavedLanguage();
    setLang(saved);
    setMounted(true);
    // Ensure video plays
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const hi = lang === 'hi'; // No need to guard with mounted — initial 'hi' matches server
  const filteredBooks = EBOOKS.filter(b => b.lang === ebookTab);

  return (
    <div
      style={{
        minHeight: '100vh', background: 'var(--c-bg)',
        // Fade in to prevent FOUC
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.2s ease',
      }}
    >
      <Header lang={lang} onLangChange={(l) => { setLang(l); saveLanguage(l); }} />

      {/* ══ CINEMATIC HERO WITH VIDEO ══ */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        minHeight: 'clamp(480px, 75vh, 720px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Background video */}
        <video
          ref={videoRef}
          src="/library-hero.mp4"
          autoPlay muted loop playsInline
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.22) saturate(0.6)',
          }}
        />

        {/* Dark gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(4,8,5,0.55) 0%, rgba(6,14,8,0.75) 60%, var(--c-bg) 100%)',
        }} />

        {/* Particles */}
        <Particles />

        {/* Mandala watermark */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <svg width="min(700px,90vw)" height="min(700px,90vw)" viewBox="0 0 700 700" fill="none"
            style={{ opacity: 0.04, animation: 'sacredSpin 120s linear infinite' }}>
            {[320, 280, 240, 200, 160, 120, 80, 40].map(r => (
              <circle key={r} cx="350" cy="350" r={r} stroke="#d4a843" strokeWidth="0.5" />
            ))}
          </svg>
        </div>

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: 'clamp(7rem,14vw,10rem) clamp(1.5rem,5vw,4rem) clamp(4rem,7vw,6rem)', maxWidth: '720px', margin: '0 auto' }}>
          <p style={{
            fontSize: '0.64rem', letterSpacing: '0.35em', color: '#d4a843',
            fontWeight: 700, textTransform: 'uppercase', marginBottom: '1.1rem',
            fontFamily: 'var(--font-inter)', opacity: 0.9,
          }}>
            निर्वाण धाम · Nirvan Dham
          </p>

          <h1 style={{
            fontFamily: hi ? 'var(--font-hind)' : 'var(--font-cormorant)',
            fontSize: 'clamp(3rem,8vw,6rem)',
            fontWeight: hi ? 600 : 300,
            lineHeight: hi ? 1.15 : 1.05,
            marginBottom: '1.1rem',
            paddingBottom: hi ? '0.12em' : '0',
            color: '#f5f0e8',
            textShadow: '0 2px 40px rgba(255,255,255,0.08)',
          }}>
            {hi ? 'डिजिटल पुस्तकालय' : 'Digital Library'}
          </h1>

          <p style={{
            fontSize: 'clamp(0.88rem,1.8vw,1.05rem)',
            color: 'rgba(255,255,255,0.38)', lineHeight: 1.85, marginBottom: '3rem',
            fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
          }}>
            {hi
              ? 'निर्वाण धाम की शिक्षाएँ — ईबुक, ऑडियोबुक और मासिक पत्रिका मुक्तिबोध'
              : 'Teachings of Nirvan Dham — eBooks, Audiobooks & the monthly Muktibodh Magazine'}
          </p>

          {/* Section tabs */}
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { key: 'ebooks' as const, hi: 'ईबुक', en: 'eBooks', icon: '📚' },
              { key: 'audio' as const, hi: 'ऑडियोबुक', en: 'Audiobooks', icon: '🎧' },
            ].map(tab => {
              const tabStyle = {
                padding: '0.65rem 1.6rem',
                background: section === tab.key
                  ? 'rgba(212,168,67,0.18)'
                  : 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${section === tab.key ? 'rgba(212,168,67,0.5)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '999px',
                color: section === tab.key ? '#d4a843' : 'rgba(255,255,255,0.4)',
                fontSize: '0.82rem', cursor: 'pointer',
                fontWeight: section === tab.key ? 700 : 400,
                transition: 'all 0.3s',
                fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
                textDecoration: 'none',
              };

              return tab.key === 'audio' ? (
                <Link key={tab.key} href="/library/audiobooks" style={tabStyle}>
                  {tab.icon} {hi ? tab.hi : tab.en}
                </Link>
              ) : (
                <button key={tab.key} onClick={() => setSection(tab.key)} style={tabStyle}>
                  {tab.icon} {hi ? tab.hi : tab.en}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ MUKTIBODH BANNER ══ */}
      <MuktibodhMagazineSection hi={hi} issues={MAGAZINES} />

      {/* ══ EBOOKS ══ */}
      {section === 'ebooks' && (
        <section style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,5rem)', maxWidth: '1320px', margin: '0 auto' }}>
          {/* Lang tabs */}
          <div style={{ display: 'flex', marginBottom: '2.5rem', borderBottom: '1px solid rgba(212,168,67,0.1)', gap: '0.25rem' }}>
            {(['hi', 'en'] as const).map((k) => {
              const count = EBOOKS.filter(b => b.lang === k && !b.isPlaceholder).length;
              return (
                <button key={k} onClick={() => setEbookTab(k)} style={{
                  position: 'relative',
                  padding: '0.65rem 1.75rem 0.85rem',
                  background: 'none', border: 'none',
                  borderBottom: `2px solid ${ebookTab === k ? '#d4a843' : 'transparent'}`,
                  color: ebookTab === k ? '#d4a843' : 'rgba(255,255,255,0.3)',
                  fontSize: '0.88rem', fontWeight: ebookTab === k ? 700 : 400,
                  cursor: 'pointer', transition: 'all 0.25s',
                  fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                  {k === 'hi' ? '🇮🇳 हिंदी' : '🌐 English'}
                  <span style={{
                    background: ebookTab === k ? 'rgba(212,168,67,0.2)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${ebookTab === k ? 'rgba(212,168,67,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '999px',
                    padding: '0.05rem 0.5rem',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: ebookTab === k ? '#d4a843' : 'rgba(255,255,255,0.25)',
                    transition: 'all 0.25s',
                  }}>{count}</span>
                </button>
              );
            })}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1.6rem',
          }}>
            {filteredBooks.map(book => (
              <BookCard key={book.slug} book={book} hi={hi} />
            ))}
          </div>
        </section>
      )}

      {/* ══ AUDIOBOOKS ══ */}
      {section === 'audio' && (
        <section style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,5rem)', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <p style={{ fontSize: '0.64rem', letterSpacing: '0.24em', color: '#d4a843', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem', opacity: 0.78 }}>
              {hi ? 'ऑडियोबुक' : 'Audiobooks'}
            </p>
            <h2 style={{
              fontFamily: hi ? 'var(--font-hind)' : 'var(--font-cormorant)',
              fontSize: 'clamp(1.8rem,3.5vw,2.8rem)',
              fontWeight: hi ? 600 : 300, color: 'var(--c-ivory)',
            }}>
              {hi ? 'सुनकर अनुभव करें' : 'Listen & Experience'}
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: '1.15rem' }}>
            {AUDIOBOOKS.map(ab => <AudioCard key={ab.slug} book={ab} hi={hi} />)}
          </div>
        </section>
      )}

      <div style={{ height: '4rem' }} />
      <CourseBanner lang={lang} variant="full" />
      <ContactSection lang={lang} />
    </div>
  );
}
