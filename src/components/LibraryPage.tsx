'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Language } from '@/lib/i18n';
import { getSavedLanguage, saveLanguage } from '@/lib/i18n';
import Header from '@/components/Header';
import ContactSection from '@/components/ContactSection';
import { EBOOKS, AUDIOBOOKS, MAGAZINES } from '@/lib/library-data';
import type { EBook, Magazine } from '@/lib/library-data';

// ── Countdown ────────────────────────────────────────────
function useCountdown(targetDate: string) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const end = new Date(targetDate).getTime();
    const tick = () => setDiff(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return {
    days: Math.floor(diff / 86400000),
    hrs: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
    launched: diff === 0,
  };
}

// ── Waveform SVG ─────────────────────────────────────────
function Waveform() {
  const heights = [4, 8, 14, 10, 18, 7, 12, 16, 9, 13, 17, 8, 5, 10, 14];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '30px' }}>
      {heights.map((h, i) => (
        <div key={i} style={{
          width: '3px', borderRadius: '2px',
          height: `${h * 2}px`,
          background: `rgba(212,168,67,${0.18 + (i % 4) * 0.1})`,
        }} />
      ))}
    </div>
  );
}

// ── Book Card ────────────────────────────────────────────
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
        background: hovered ? 'rgba(16,38,20,0.85)' : 'rgba(13,31,16,0.55)',
        border: `1px solid ${hovered ? 'rgba(212,168,67,0.32)' : 'rgba(212,168,67,0.1)'}`,
        borderRadius: '16px', overflow: 'hidden',
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered ? 'translateY(-8px) scale(1.01)' : 'translateY(0) scale(1)',
        boxShadow: hovered
          ? '0 28px 72px rgba(0,0,0,0.55), 0 0 0 1px rgba(212,168,67,0.08)'
          : '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Cover */}
      <div style={{ position: 'relative', aspectRatio: '2/3', background: 'linear-gradient(145deg,#0a1e0d,#142814)', flexShrink: 0 }}>
        {book.cover ? (
          <Image
            src={book.cover} alt={title}
            fill sizes="(max-width:640px) 45vw, 220px"
            style={{ objectFit: 'cover', transition: 'transform 0.6s ease', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '1.25rem', textAlign: 'center',
            background: 'repeating-linear-gradient(135deg,rgba(212,168,67,0.02) 0,rgba(212,168,67,0.02) 1px,transparent 0,transparent 50%) 0 0 / 14px 14px',
          }}>
            <div style={{ fontSize: '2rem', opacity: 0.18, marginBottom: '0.75rem' }}>📖</div>
            <p style={{
              fontFamily: hi && book.titleHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
              fontStyle: hi && book.titleHindi ? 'normal' : 'italic',
              color: 'rgba(212,168,67,0.38)', fontSize: '0.9rem', lineHeight: 1.4,
            }}>{title}</p>
            <span style={{
              display: 'inline-block', marginTop: '0.85rem',
              padding: '0.2rem 0.65rem',
              border: '1px solid rgba(212,168,67,0.15)', borderRadius: '999px',
              fontSize: '0.58rem', letterSpacing: '0.16em',
              color: 'rgba(212,168,67,0.35)', textTransform: 'uppercase',
            }}>
              {hi ? 'शीघ्र प्रकाश्य' : 'Coming Soon'}
            </span>
          </div>
        )}
        {/* Language badge */}
        <div style={{
          position: 'absolute', top: '0.55rem', right: '0.55rem',
          background: 'rgba(6,10,7,0.82)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(212,168,67,0.22)', borderRadius: '999px',
          padding: '0.18rem 0.55rem', fontSize: '0.56rem',
          letterSpacing: '0.1em', color: '#d4a843', fontWeight: 700,
        }}>{book.lang === 'hi' ? 'हिंदी' : 'EN'}</div>
      </div>

      {/* Info */}
      <div style={{ padding: '0.9rem 1rem 1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontFamily: hi && book.titleHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
          fontStyle: hi && book.titleHindi ? 'normal' : 'italic',
          fontSize: hi && book.titleHindi ? '0.95rem' : '1rem',
          fontWeight: hi && book.titleHindi ? 600 : 400,
          color: 'var(--c-ivory)', lineHeight: 1.25, margin: 0, marginBottom: '0.3rem',
        }}>{title}</h3>
        {subtitle && (
          <p style={{
            fontSize: '0.68rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.55, margin: 0, marginBottom: '0.35rem',
            fontFamily: hi && book.subtitleHindi ? 'var(--font-hind)' : 'var(--font-inter)',
          }}>{subtitle}</p>
        )}
        <p style={{ fontSize: '0.62rem', color: '#d4a843', opacity: 0.6, margin: 0 }}>— {book.author}</p>

        <div style={{ display: 'flex', gap: '0.45rem', marginTop: 'auto', paddingTop: '0.85rem' }}>
          {!book.isPlaceholder ? (
            <>
              <Link
                href={`/library/${book.slug}`}
                style={{
                  flex: 1, padding: '0.5rem 0',
                  background: hovered ? 'rgba(212,168,67,0.22)' : 'rgba(212,168,67,0.12)',
                  border: '1px solid rgba(212,168,67,0.32)', borderRadius: '9px',
                  color: '#d4a843', fontSize: '0.73rem', fontWeight: 700, cursor: 'pointer',
                  transition: 'background 0.2s', letterSpacing: '0.02em',
                  fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
                  textDecoration: 'none', textAlign: 'center',
                }}
              >
                {hi ? '📖 पढ़ें' : '📖 Read'}
              </Link>
              <a
                href={book.pdf} download
                style={{
                  flex: 1, padding: '0.5rem 0', textAlign: 'center',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9px',
                  color: 'rgba(255,255,255,0.45)', fontSize: '0.73rem', fontWeight: 600,
                  textDecoration: 'none', transition: 'all 0.2s',
                  fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              >
                {hi ? '↓ PDF' : '↓ PDF'}
              </a>
            </>
          ) : (
            <div style={{
              flex: 1, padding: '0.5rem', textAlign: 'center',
              border: '1px solid rgba(212,168,67,0.08)', borderRadius: '9px',
              color: 'rgba(212,168,67,0.28)', fontSize: '0.7rem',
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

// ── Magazine Banner ───────────────────────────────────────
function MuktibodBanner({
  hi,
  magazine,
  countdown,
}: {
  hi: boolean;
  magazine: Magazine;
  countdown: ReturnType<typeof useCountdown>;
}) {
  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, #0a1e0d 0%, #142216 40%, #0d2818 100%)',
      borderTop: '1px solid rgba(212,168,67,0.12)',
      borderBottom: '1px solid rgba(212,168,67,0.12)',
    }}>
      {/* Gold shimmer lines */}
      {[20, 45, 70].map((pct) => (
        <div key={pct} style={{
          position: 'absolute', top: 0, bottom: 0, left: `${pct}%`, width: '1px',
          background: 'linear-gradient(to bottom, transparent, rgba(212,168,67,0.06), transparent)',
          pointerEvents: 'none',
        }} />
      ))}

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(3rem,7vw,6rem) clamp(1.5rem,5vw,5rem)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(2rem,5vw,5rem)', alignItems: 'center' }}>

          {/* Text side */}
          <div>
            <p style={{
              fontSize: '0.65rem', letterSpacing: '0.28em', color: '#d4a843',
              fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem',
              fontFamily: 'var(--font-inter)', opacity: 0.8,
            }}>
              {hi ? 'मासिक पत्रिका · प्रथम अंक' : 'Monthly Magazine · Issue 01'}
            </p>

            <h2 style={{
              fontFamily: hi ? 'var(--font-hind)' : 'var(--font-cormorant)',
              fontSize: 'clamp(3rem,7vw,5.5rem)',
              fontWeight: hi ? 700 : 300,
              color: '#d4a843', lineHeight: 0.95,
              textShadow: '0 0 60px rgba(212,168,67,0.2)',
              marginBottom: '0.4rem',
            }}>
              {hi ? 'मुक्तिबोध' : 'Muktibodh'}
            </h2>
            {hi && (
              <p style={{
                fontFamily: 'var(--font-cormorant)', fontStyle: 'italic',
                color: 'rgba(212,168,67,0.45)', fontSize: '1.1rem', marginBottom: '1.25rem',
              }}>Muktibodh</p>
            )}

            <p style={{
              fontSize: hi ? '0.95rem' : '0.9rem',
              color: 'rgba(255,255,255,0.45)', lineHeight: 1.85, marginBottom: '2rem',
              fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
              maxWidth: '420px',
            }}>
              {hi
                ? 'चेतना, अद्वैत और निर्वाण धाम की जीवंत शिक्षाओं की मासिक पत्रिका। हर अंक में — आदिसत्व के संवाद, ध्यान-विधि, और साधक-अनुभव।'
                : 'A monthly journal of consciousness, non-duality and the living teachings of Nirvan Dham — featuring Aadisatv\'s conversations, meditation guidance, and seeker experiences.'}
            </p>

            {/* Live issue + next edition countdown */}
            <div>
              <p style={{ fontSize: '0.62rem', letterSpacing: '0.2em', color: 'rgba(212,168,67,0.5)', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
                {hi ? 'अंक 01 उपलब्ध है · अगला अंक 21 जुलाई 2026' : 'Issue 01 is live · Next issue 21 July 2026'}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.65rem' }}>
                <Link
                  href={`/library/magazine/${magazine.slug}/read`}
                  style={{
                    padding: '0.85rem 1.35rem',
                    background: 'rgba(212,168,67,0.16)',
                    border: '1px solid rgba(212,168,67,0.42)',
                    borderRadius: '8px',
                    color: '#d4a843',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
                    textDecoration: 'none',
                  }}
                >
                  {hi ? 'पढ़ें अंक 01' : 'Read Issue 01'}
                </Link>
                {magazine.pdf && (
                  <a
                    href={magazine.pdf}
                    download
                    style={{
                      padding: '0.85rem 1.15rem',
                      background: 'rgba(255,255,255,0.045)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: 'rgba(255,255,255,0.68)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      letterSpacing: '0.03em',
                      fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
                      textDecoration: 'none',
                    }}
                  >
                    {hi ? 'PDF डाउनलोड' : 'Download PDF'}
                  </a>
                )}
              </div>
              <p style={{ fontSize: '0.62rem', letterSpacing: '0.2em', color: 'rgba(212,168,67,0.42)', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
                {hi ? 'अगले अंक की उलटी गिनती' : 'Countdown to next issue'}
              </p>
              <div style={{ display: 'flex', gap: 'clamp(0.75rem,2.5vw,1.75rem)', flexWrap: 'wrap' }}>
                {[
                  { v: countdown.days, l: hi ? 'दिन' : 'Days' },
                  { v: countdown.hrs, l: hi ? 'घंटे' : 'Hrs' },
                  { v: countdown.mins, l: hi ? 'मिनट' : 'Min' },
                  { v: countdown.secs, l: hi ? 'सेकंड' : 'Sec' },
                ].map(({ v, l }) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 700,
                      color: '#d4a843', fontFamily: 'var(--font-cormorant)',
                      fontVariantNumeric: 'tabular-nums',
                      textShadow: '0 0 24px rgba(212,168,67,0.3)',
                      minWidth: '56px', display: 'block',
                    }}>
                      {String(v).padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Magazine cover placeholder */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative' }}>
              {/* Glow */}
              <div style={{
                position: 'absolute', inset: '-20px',
                background: 'radial-gradient(ellipse, rgba(212,168,67,0.1), transparent 70%)',
                filter: 'blur(20px)', pointerEvents: 'none',
              }} />
              {/* Cover */}
              <div style={{
                width: 'clamp(220px,28vw,300px)',
                aspectRatio: '3/4',
                background: 'linear-gradient(150deg, #0d2818 0%, #1a3d22 50%, #0a1a0d 100%)',
                border: '1px solid rgba(212,168,67,0.25)',
                borderRadius: '6px 12px 12px 6px',
                boxShadow: '8px 12px 40px rgba(0,0,0,0.6), -2px 0 8px rgba(0,0,0,0.4)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '2rem 1.5rem',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Inner decorative border */}
                <div style={{
                  position: 'absolute', inset: '12px',
                  border: '1px solid rgba(212,168,67,0.12)',
                  borderRadius: '4px', pointerEvents: 'none',
                }} />
                {/* Sacred geometry watermark */}
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" style={{ opacity: 0.06, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
                  {[50,38,26,14].map(r => <circle key={r} cx="60" cy="60" r={r} stroke="#d4a843" strokeWidth="0.5" />)}
                </svg>

                <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.58rem', letterSpacing: '0.25em', color: 'rgba(212,168,67,0.45)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  NIRVAN DHAM
                </p>
                <div style={{ width: '30px', height: '1px', background: 'rgba(212,168,67,0.3)', marginBottom: '1rem' }} />
                <p style={{
                  fontFamily: 'var(--font-hind)', fontSize: '2rem', fontWeight: 700,
                  color: '#d4a843', textAlign: 'center', lineHeight: 1.1,
                  textShadow: '0 0 20px rgba(212,168,67,0.25)',
                }}>मुक्तिबोध</p>
                <p style={{
                  fontFamily: 'var(--font-cormorant)', fontStyle: 'italic',
                  color: 'rgba(212,168,67,0.4)', fontSize: '0.88rem', marginTop: '0.3rem',
                }}>Muktibodh</p>
                <div style={{ width: '30px', height: '1px', background: 'rgba(212,168,67,0.2)', margin: '1rem 0' }} />
                <p style={{ fontSize: '0.6rem', color: 'rgba(212,168,67,0.35)', letterSpacing: '0.12em', textAlign: 'center' }}>
                  Issue 01 · June 2026
                </p>
                <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.18)', marginTop: '1.25rem', letterSpacing: '0.08em' }}>
                  Aadisatv
                </p>
                {/* Spine */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px',
                  background: 'linear-gradient(to right, rgba(212,168,67,0.2), rgba(212,168,67,0.08))',
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Audio Card ────────────────────────────────────────────
function AudioCard({ book, hi }: { book: typeof AUDIOBOOKS[0]; hi: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(16,38,20,0.8)' : 'rgba(13,31,16,0.5)',
        border: `1px solid ${hov ? 'rgba(212,168,67,0.25)' : 'rgba(212,168,67,0.07)'}`,
        borderRadius: '14px', padding: '1.4rem',
        transition: 'all 0.3s', transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? '0 20px 48px rgba(0,0,0,0.45)' : 'none',
      }}
    >
      <Waveform />
      <p style={{ fontSize: '0.62rem', letterSpacing: '0.14em', color: '#d4a843', opacity: 0.55, textTransform: 'uppercase', margin: '0.85rem 0 0.35rem' }}>
        {book.duration}
      </p>
      <h3 style={{
        fontFamily: 'var(--font-cormorant)', fontStyle: 'italic',
        fontSize: '1.05rem', color: 'var(--c-ivory)', marginBottom: '0.25rem',
      }}>
        {hi && book.titleHindi ? book.titleHindi : book.title}
      </h3>
      <p style={{ fontSize: '0.62rem', color: '#d4a843', opacity: 0.55, marginBottom: '1rem' }}>— {book.author}</p>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.4rem 0.9rem',
        background: 'rgba(212,168,67,0.05)', border: '1px solid rgba(212,168,67,0.1)',
        borderRadius: '8px', color: 'rgba(212,168,67,0.35)', fontSize: '0.72rem',
      }}>
        ▶ {hi ? 'शीघ्र प्रकाश्य' : 'Coming Soon'}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function LibraryPage() {
  const [lang, setLang] = useState<Language>('hi');
  const [mounted, setMounted] = useState(false);
  const [ebookTab, setEbookTab] = useState<'hi' | 'en'>('hi');
  const [section, setSection] = useState<'ebooks' | 'audio'>('ebooks');

  const mag = MAGAZINES[0];
  const countdown = useCountdown(mag.nextIssueDate);

  useEffect(() => { setLang(getSavedLanguage()); setMounted(true); }, []);
  const hi = mounted ? lang === 'hi' : true;

  if (!mounted) return null;

  const filteredBooks = EBOOKS.filter(b => b.lang === ebookTab);

  return (
    <>
      <div style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>
        <Header lang={lang} onLangChange={(l) => { setLang(l); saveLanguage(l); }} />

        {/* ── HERO ── */}
        <section style={{
          position: 'relative', overflow: 'hidden',
          padding: 'clamp(7rem,14vw,10rem) clamp(1.5rem,5vw,5rem) clamp(3rem,6vw,5rem)',
          background: 'linear-gradient(to bottom, #060d08 0%, #0d1f10 100%)',
        }}>
          {/* Mandala bg */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <svg width="min(680px,90vw)" height="min(680px,90vw)" viewBox="0 0 680 680" fill="none"
              style={{ opacity: 0.035, animation: 'sacredSpin 100s linear infinite' }}>
              {[320, 280, 240, 200, 160, 120, 80, 40].map(r => (
                <circle key={r} cx="340" cy="340" r={r} stroke="#d4a843" strokeWidth="0.5" />
              ))}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => {
                const rad = a * Math.PI / 180;
                return <line key={a} x1={340 + 40 * Math.cos(rad)} y1={340 + 40 * Math.sin(rad)} x2={340 + 320 * Math.cos(rad)} y2={340 + 320 * Math.sin(rad)} stroke="#d4a843" strokeWidth="0.3" />;
              })}
            </svg>
          </div>

          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '680px', margin: '0 auto' }}>
            <p style={{
              fontSize: '0.66rem', letterSpacing: '0.3em', color: '#d4a843',
              fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem',
              fontFamily: 'var(--font-inter)', opacity: 0.85,
            }}>
              {hi ? 'निर्वाण धाम' : 'Nirvan Dham'}
            </p>
            <h1 style={{
              fontFamily: hi ? 'var(--font-hind)' : 'var(--font-cormorant)',
              fontSize: 'clamp(2.8rem,7vw,5.5rem)',
              fontWeight: hi ? 600 : 300,
              color: 'var(--c-ivory)', lineHeight: 1.05, marginBottom: '1rem',
            }}>
              {hi ? 'डिजिटल पुस्तकालय' : 'Digital Library'}
            </h1>
            <p style={{
              fontSize: 'clamp(0.88rem,1.8vw,1rem)',
              color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, marginBottom: '2.5rem',
              fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
            }}>
              {hi
                ? 'आदिसत्व की शिक्षाएँ — ईबुक, ऑडियोबुक और मासिक पत्रिका'
                : 'Teachings of Aadisatv — eBooks, Audiobooks & Monthly Magazine'}
            </p>

            {/* Section tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { key: 'ebooks' as const, hi: 'ईबुक', en: 'eBooks', icon: '📚' },
                { key: 'audio' as const, hi: 'ऑडियोबुक', en: 'Audiobooks', icon: '🎧' },
              ].map(tab => (
                <button key={tab.key} onClick={() => setSection(tab.key)} style={{
                  padding: '0.6rem 1.5rem',
                  background: section === tab.key ? 'rgba(212,168,67,0.16)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${section === tab.key ? 'rgba(212,168,67,0.42)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '999px',
                  color: section === tab.key ? '#d4a843' : 'rgba(255,255,255,0.38)',
                  fontSize: '0.82rem', cursor: 'pointer', fontWeight: section === tab.key ? 700 : 400,
                  transition: 'all 0.25s',
                  fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
                }}>
                  {tab.icon} {hi ? tab.hi : tab.en}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Muktibodh Banner ── */}
        <MuktibodBanner hi={hi} magazine={mag} countdown={countdown} />

        {/* ── eBooks ── */}
        {section === 'ebooks' && (
          <section style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,5rem)', maxWidth: '1300px', margin: '0 auto' }}>
            {/* Lang sub-tabs */}
            <div style={{ display: 'flex', gap: '0', marginBottom: '2.5rem', borderBottom: '1px solid rgba(212,168,67,0.1)' }}>
              {([['hi', '🇮🇳 हिंदी', 'Hindi'], ['en', '🌐 English', 'English']] as const).map(([k, labelHi, labelEn]) => (
                <button key={k} onClick={() => setEbookTab(k)} style={{
                  padding: '0.6rem 1.75rem',
                  background: 'none', border: 'none',
                  borderBottom: `2px solid ${ebookTab === k ? '#d4a843' : 'transparent'}`,
                  color: ebookTab === k ? '#d4a843' : 'rgba(255,255,255,0.32)',
                  fontSize: '0.85rem', fontWeight: ebookTab === k ? 700 : 400,
                  cursor: 'pointer', transition: 'all 0.2s', paddingBottom: '0.85rem',
                  fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
                }}>
                  {hi ? labelHi : labelEn}
                </button>
              ))}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '1.25rem',
            }}>
              {filteredBooks.map(book => (
                <BookCard key={book.slug} book={book} hi={hi} />
              ))}
            </div>
          </section>
        )}

        {/* ── Audiobooks ── */}
        {section === 'audio' && (
          <section style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,5rem)', maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2.5rem' }}>
              <p style={{ fontSize: '0.66rem', letterSpacing: '0.22em', color: '#d4a843', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem', opacity: 0.8 }}>
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

        <div style={{ height: '3rem' }} />
        <ContactSection lang={lang} />
      </div>
    </>
  );
}
