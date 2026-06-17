'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Language } from '@/lib/i18n';
import { getSavedLanguage, saveLanguage } from '@/lib/i18n';
import Header from '@/components/Header';
import ContactSection from '@/components/ContactSection';
import { EBOOKS, AUDIOBOOKS, MAGAZINES } from '@/lib/library-data';
import type { EBook } from '@/lib/library-data';

// ── FOUC-safe countdown (always starts from 0, updates after mount) ──
function useCountdown(targetDate: string) {
  const [diff, setDiff] = useState<number | null>(null);
  useEffect(() => {
    const end = new Date(targetDate).getTime();
    const tick = () => setDiff(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  if (diff === null) return { days: 0, hrs: 0, mins: 0, secs: 0, launched: false, ready: false };
  return {
    days: Math.floor(diff / 86400000),
    hrs: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
    launched: diff === 0,
    ready: true,
  };
}

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
        background: 'rgba(10,24,12,0.7)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${hovered ? 'rgba(212,168,67,0.4)' : 'rgba(212,168,67,0.08)'}`,
        borderRadius: '18px', overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'translateY(-10px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hovered
          ? '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,168,67,0.12), 0 0 40px rgba(212,168,67,0.06)'
          : '0 4px 24px rgba(0,0,0,0.35)',
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
              background: 'linear-gradient(135deg, rgba(212,168,67,0.12) 0%, transparent 60%)',
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
          background: 'rgba(5,8,6,0.85)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(212,168,67,0.25)', borderRadius: '999px',
          padding: '0.2rem 0.6rem', fontSize: '0.55rem',
          letterSpacing: '0.1em', color: '#d4a843', fontWeight: 700,
        }}>{book.lang === 'hi' ? 'हिंदी' : 'EN'}</div>

        {/* Bottom gradient for text readability */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
          background: 'linear-gradient(to top, rgba(7,12,9,0.7), transparent)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Info */}
      <div style={{ padding: '1rem 1.1rem 1.1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontFamily: hi && book.titleHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
          fontStyle: hi && book.titleHindi ? 'normal' : 'italic',
          fontSize: hi && book.titleHindi ? '0.95rem' : '1.05rem',
          fontWeight: hi && book.titleHindi ? 600 : 400,
          color: 'var(--c-ivory)', lineHeight: 1.25, margin: 0, marginBottom: '0.3rem',
        }}>{title}</h3>
        {subtitle && (
          <p style={{
            fontSize: '0.67rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.55, margin: '0 0 0.3rem',
            fontFamily: hi && book.subtitleHindi ? 'var(--font-hind)' : 'var(--font-inter)',
          }}>{subtitle}</p>
        )}
        <p style={{ fontSize: '0.6rem', color: '#d4a843', opacity: 0.58, margin: 0 }}>— {book.author}</p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '0.45rem', marginTop: 'auto', paddingTop: '0.9rem' }}>
          {!book.isPlaceholder ? (
            <>
              <Link
                href={`/library/${book.slug}`}
                style={{
                  flex: 1, padding: '0.55rem 0', textAlign: 'center',
                  background: hovered ? 'rgba(212,168,67,0.24)' : 'rgba(212,168,67,0.12)',
                  border: '1px solid rgba(212,168,67,0.35)', borderRadius: '10px',
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
                  flex: 1, padding: '0.55rem 0', textAlign: 'center',
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
              flex: 1, padding: '0.55rem 0', textAlign: 'center',
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

// ── Muktibodh Banner ──────────────────────────────────────
function MuktibodBanner({ hi, launchDate, nextIssueDate, pdf, slug }: {
  hi: boolean; launchDate: string; nextIssueDate: string; pdf?: string; slug: string;
}) {
  // Count DOWN to launchDate if not launched, else count to nextIssueDate
  const now = Date.now();
  const launchTime = new Date(launchDate).getTime();
  const hasLaunched = now >= launchTime;
  const countdown = useCountdown(hasLaunched ? nextIssueDate : launchDate);

  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(145deg, #060e08 0%, #0d2014 35%, #071009 100%)',
      borderTop: '1px solid rgba(212,168,67,0.15)',
      borderBottom: '1px solid rgba(212,168,67,0.1)',
    }}>
      {/* Animated gold shimmer lines */}
      {[15, 40, 65, 88].map((pct, i) => (
        <div key={pct} style={{
          position: 'absolute', top: 0, bottom: 0, left: `${pct}%`, width: '1px',
          background: `linear-gradient(to bottom, transparent 0%, rgba(212,168,67,${0.04 + i * 0.02}) 50%, transparent 100%)`,
          animation: `shimmerLine ${3 + i * 0.8}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.4}s`,
        }} />
      ))}
      <style>{`@keyframes shimmerLine { from { opacity: 0.4; } to { opacity: 1; } }`}</style>

      {/* Radial glow center */}
      <div style={{
        position: 'absolute', top: '50%', left: '35%', transform: 'translate(-50%,-50%)',
        width: '600px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(212,168,67,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,5rem)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(3rem,6vw,6rem)', alignItems: 'center' }}>

          {/* Left — Text */}
          <div>
            <p style={{
              fontSize: '0.62rem', letterSpacing: '0.32em', color: '#d4a843',
              fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem',
              fontFamily: 'var(--font-inter)', opacity: 0.75,
            }}>
              {hi
                ? (hasLaunched ? 'मासिक पत्रिका · प्रथम अंक उपलब्ध' : 'मासिक पत्रिका · प्रथम अंक')
                : (hasLaunched ? 'Monthly Magazine · Issue 01 Available' : 'Monthly Magazine · Issue 01')}
            </p>

            {/* Big name */}
            <h2 style={{
              fontFamily: 'var(--font-hind)',
              fontSize: 'clamp(3.5rem,8vw,6.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              paddingBottom: '0.08em',
              color: '#d4a843',
              textShadow: '0 0 60px rgba(212,168,67,0.35), 0 0 120px rgba(212,168,67,0.15)',
              marginBottom: '0.3rem',
              letterSpacing: '-0.01em',
              display: 'block',
            }}>
              मुक्तिबोध
            </h2>
            <p style={{
              fontFamily: 'var(--font-cormorant)', fontStyle: 'italic',
              color: 'rgba(212,168,67,0.38)', fontSize: '1.3rem',
              marginBottom: '1.75rem', letterSpacing: '0.04em',
            }}>
              Muktibodh
            </p>

            <p style={{
              fontSize: hi ? '0.95rem' : '0.9rem',
              color: 'rgba(255,255,255,0.42)', lineHeight: 1.9,
              maxWidth: '400px', marginBottom: '2.25rem',
              fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
            }}>
              {hi
                ? 'चेतना, अद्वैत और निर्वाण धाम की जीवंत शिक्षाओं की मासिक पत्रिका। हर अंक में — आदिसत्व के संवाद, ध्यान-विधि, और साधक-अनुभव।'
                : "A monthly journal of consciousness, non-duality and the living teachings of Nirvan Dham — featuring Aadisatv's conversations, meditation guidance, and seeker experiences."}
            </p>

            {/* Countdown block */}
            <div style={{ marginBottom: '2rem' }}>
              <p style={{
                fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase',
                color: 'rgba(212,168,67,0.45)', marginBottom: '1rem',
              }}>
                {hasLaunched
                  ? (hi ? 'अगला अंक आने में' : 'Next issue in')
                  : (hi ? '21 जून 2026 को लॉन्च · उलटी गिनती' : 'Launching 21 June 2026 · Countdown')}
              </p>

              {countdown.ready ? (
                <div style={{ display: 'flex', gap: 'clamp(0.6rem,2vw,1.5rem)' }}>
                  {[
                    { v: countdown.days, l: hi ? 'दिन' : 'Days' },
                    { v: countdown.hrs, l: hi ? 'घंटे' : 'Hrs' },
                    { v: countdown.mins, l: hi ? 'मिनट' : 'Min' },
                    { v: countdown.secs, l: hi ? 'सेकंड' : 'Sec' },
                  ].map(({ v, l }) => (
                    <div key={l} style={{ textAlign: 'center', minWidth: '52px' }}>
                      <div style={{
                        fontSize: 'clamp(1.8rem,4.5vw,3rem)',
                        fontWeight: 700, fontFamily: 'var(--font-cormorant)',
                        fontVariantNumeric: 'tabular-nums',
                        color: '#d4a843',
                        textShadow: '0 0 20px rgba(212,168,67,0.4)',
                      }}>
                        {String(v).padStart(2, '0')}
                      </div>
                      <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '0.2rem' }}>{l}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  {['--', '--', '--', '--'].map((v, i) => (
                    <div key={i} style={{ textAlign: 'center', minWidth: '52px' }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'rgba(212,168,67,0.2)', fontFamily: 'var(--font-cormorant)' }}>{v}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTA Buttons — always visible */}
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              <Link href={`/library/magazine/${slug}/read`} style={{
                padding: '0.9rem 1.75rem',
                background: 'rgba(212,168,67,0.14)',
                border: '1px solid rgba(212,168,67,0.45)',
                borderRadius: '8px', color: '#d4a843',
                fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.04em',
                fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
                textDecoration: 'none', transition: 'all 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,168,67,0.24)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(212,168,67,0.14)')}
              >
                {hi ? '📖 पढ़ें — अंक 01' : '📖 Read Issue 01'}
              </Link>
              {pdf && (
                <a href={pdf} download style={{
                  padding: '0.9rem 1.35rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.85rem', fontWeight: 600,
                  fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
                  textDecoration: 'none',
                }}>
                  ↓ {hi ? 'PDF डाउनलोड' : 'Download PDF'}
                </a>
              )}
            </div>

          </div>

          {/* Right — Stylized magazine cover */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative' }}>
              {/* Glow halo */}
              <div style={{
                position: 'absolute', inset: '-30px',
                background: 'radial-gradient(ellipse, rgba(212,168,67,0.12), transparent 65%)',
                filter: 'blur(24px)', pointerEvents: 'none', borderRadius: '50%',
              }} />

              {/* Cover card */}
              <div style={{
                width: 'clamp(220px,26vw,295px)',
                aspectRatio: '3/4',
                background: 'linear-gradient(150deg, #0a1e0d 0%, #163220 45%, #091508 100%)',
                border: '1px solid rgba(212,168,67,0.22)',
                borderRadius: '4px 14px 14px 4px',
                boxShadow: '12px 16px 56px rgba(0,0,0,0.7), -2px 0 10px rgba(0,0,0,0.5), inset 0 0 60px rgba(212,168,67,0.03)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '2rem 1.5rem',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Inner fine border */}
                <div style={{ position: 'absolute', inset: '10px', border: '1px solid rgba(212,168,67,0.1)', borderRadius: '2px 12px 12px 2px', pointerEvents: 'none' }} />

                {/* Sacred geometry watermark */}
                <svg width="160" height="160" viewBox="0 0 160 160" fill="none"
                  style={{ opacity: 0.05, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
                  {[70, 52, 34, 16].map(r => <circle key={r} cx="80" cy="80" r={r} stroke="#d4a843" strokeWidth="0.5" />)}
                  {[0, 60, 120, 180, 240, 300].map(a => {
                    const rad = a * Math.PI / 180;
                    return <line key={a} x1={80 + 16 * Math.cos(rad)} y1={80 + 16 * Math.sin(rad)} x2={80 + 70 * Math.cos(rad)} y2={80 + 70 * Math.sin(rad)} stroke="#d4a843" strokeWidth="0.4" />;
                  })}
                </svg>

                {/* Top label */}
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.52rem', letterSpacing: '0.3em', color: 'rgba(212,168,67,0.4)', textTransform: 'uppercase', marginBottom: '0.6rem', position: 'relative' }}>
                  NIRVAN DHAM
                </p>
                <div style={{ width: '28px', height: '1px', background: 'rgba(212,168,67,0.25)', marginBottom: '1.1rem', position: 'relative' }} />

                {/* Main title */}
                <p style={{
                  fontFamily: 'var(--font-hind)', fontSize: '1.85rem', fontWeight: 800,
                  color: '#d4a843',
                  textShadow: '0 0 20px rgba(212,168,67,0.4)',
                  textAlign: 'center', lineHeight: 1.2, position: 'relative',
                  paddingBottom: '0.05em',
                }}>मुक्तिबोध</p>
                <p style={{
                  fontFamily: 'var(--font-cormorant)', fontStyle: 'italic',
                  color: 'rgba(212,168,67,0.35)', fontSize: '0.8rem', marginTop: '0.25rem', position: 'relative',
                }}>Muktibodh</p>

                <div style={{ width: '28px', height: '1px', background: 'rgba(212,168,67,0.18)', margin: '1rem 0', position: 'relative' }} />

                <p style={{ fontSize: '0.56rem', color: 'rgba(212,168,67,0.32)', letterSpacing: '0.14em', textAlign: 'center', position: 'relative' }}>
                  Issue 01 · June 2026
                </p>
                <p style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.15)', marginTop: '1.5rem', letterSpacing: '0.1em', position: 'relative' }}>
                  Aadisatv
                </p>

                {/* Spine */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: '7px',
                  background: 'linear-gradient(to right, rgba(212,168,67,0.22), rgba(212,168,67,0.06))',
                  borderRadius: '4px 0 0 4px',
                }} />
              </div>

              {/* Page stack shadow */}
              <div style={{
                position: 'absolute', top: '4px', right: '-6px', bottom: '-4px',
                width: 'clamp(220px,26vw,295px)', borderRadius: '0 14px 14px 0',
                background: 'rgba(0,0,0,0.3)', zIndex: -1,
              }} />
            </div>
          </div>
        </div>
      </div>
    </section>
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

  const mag = MAGAZINES[0];

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
              ? 'आदिसत्व की शिक्षाएँ — ईबुक, ऑडियोबुक और मासिक पत्रिका मुक्तिबोध'
              : 'Teachings of Aadisatv — eBooks, Audiobooks & the monthly Muktibodh Magazine'}
          </p>

          {/* Section tabs */}
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { key: 'ebooks' as const, hi: 'ईबुक', en: 'eBooks', icon: '📚' },
              { key: 'audio' as const, hi: 'ऑडियोबुक', en: 'Audiobooks', icon: '🎧' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setSection(tab.key)} style={{
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
              }}>
                {tab.icon} {hi ? tab.hi : tab.en}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MUKTIBODH BANNER ══ */}
      <MuktibodBanner
        hi={hi}
        launchDate={mag.launchDate}
        nextIssueDate={mag.nextIssueDate}
        pdf={mag.pdf}
        slug={mag.slug}
      />

      {/* ══ EBOOKS ══ */}
      {section === 'ebooks' && (
        <section style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,5rem)', maxWidth: '1320px', margin: '0 auto' }}>
          {/* Lang tabs */}
          <div style={{ display: 'flex', marginBottom: '2.5rem', borderBottom: '1px solid rgba(212,168,67,0.1)' }}>
            {(['hi', 'en'] as const).map((k) => (
              <button key={k} onClick={() => setEbookTab(k)} style={{
                padding: '0.65rem 1.75rem 0.85rem',
                background: 'none', border: 'none',
                borderBottom: `2px solid ${ebookTab === k ? '#d4a843' : 'transparent'}`,
                color: ebookTab === k ? '#d4a843' : 'rgba(255,255,255,0.3)',
                fontSize: '0.85rem', fontWeight: ebookTab === k ? 700 : 400,
                cursor: 'pointer', transition: 'all 0.2s',
                fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
              }}>
                {k === 'hi' ? '🇮🇳 हिंदी' : '🌐 English'}
              </button>
            ))}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))',
            gap: '1.4rem',
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
      <ContactSection lang={lang} />
    </div>
  );
}
