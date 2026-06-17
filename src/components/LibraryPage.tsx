'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import type { Language } from '@/lib/i18n';
import { getSavedLanguage, saveLanguage } from '@/lib/i18n';
import Header from '@/components/Header';
import { EBOOKS, AUDIOBOOKS, MAGAZINES } from '@/lib/library-data';
import type { EBook } from '@/lib/library-data';

// Lazy-load reader so PDF.js only loads when needed
const EbookReader = dynamic(() => import('@/components/EbookReader'), { ssr: false });

// ── Countdown timer for Muktibodh ───────────────────────
function useCountdown(targetDate: string) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const end = new Date(targetDate).getTime();
    function tick() { setDiff(Math.max(0, end - Date.now())); }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { days, hrs, mins, secs, launched: diff === 0 };
}

// ── Book Card ────────────────────────────────────────────
function BookCard({ book, hi, onRead, onDownload }: {
  book: EBook;
  hi: boolean;
  onRead: (book: EBook) => void;
  onDownload: (book: EBook) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const title = hi && book.titleHindi ? book.titleHindi : book.titleEnglish;
  const subtitle = hi && book.subtitleHindi ? book.subtitleHindi : book.subtitle;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column',
        background: 'rgba(13,31,16,0.6)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${hovered ? 'rgba(212,168,67,0.35)' : 'rgba(212,168,67,0.1)'}`,
        borderRadius: '14px', overflow: 'hidden',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? '0 20px 60px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.25)',
      }}
    >
      {/* Book Cover */}
      <div style={{ position: 'relative', aspectRatio: '2/3', background: '#0d1f10', overflow: 'hidden' }}>
        {book.cover ? (
          <Image
            src={book.cover} alt={title}
            fill sizes="(max-width:640px) 50vw, 220px"
            style={{ objectFit: 'cover', transition: 'transform 0.5s ease', transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
          />
        ) : (
          // Placeholder cover
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(160deg, #0d2818 0%, #1a3d22 50%, #0d2818 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.35 }}>📖</div>
            <p style={{
              fontFamily: 'var(--font-cormorant)', fontStyle: 'italic',
              color: 'rgba(212,168,67,0.5)', fontSize: '1rem', lineHeight: 1.4,
            }}>{title}</p>
            <div style={{
              marginTop: '1rem', padding: '0.3rem 0.75rem',
              border: '1px solid rgba(212,168,67,0.2)', borderRadius: '999px',
              fontSize: '0.6rem', letterSpacing: '0.18em', color: 'rgba(212,168,67,0.4)',
              textTransform: 'uppercase',
            }}>
              {hi ? 'शीघ्र प्रकाश्य' : 'Coming Soon'}
            </div>
          </div>
        )}

        {/* Language badge */}
        <div style={{
          position: 'absolute', top: '0.6rem', right: '0.6rem',
          background: 'rgba(8,12,9,0.85)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(212,168,67,0.25)',
          borderRadius: '999px', padding: '0.2rem 0.6rem',
          fontSize: '0.58rem', letterSpacing: '0.12em',
          color: '#d4a843', fontWeight: 700,
        }}>
          {book.lang === 'hi' ? 'हिंदी' : 'EN'}
        </div>

        {/* Placeholder badge */}
        {book.isPlaceholder && (
          <div style={{
            position: 'absolute', bottom: '0.6rem', left: '0.6rem',
            background: 'rgba(212,168,67,0.12)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(212,168,67,0.2)',
            borderRadius: '6px', padding: '0.25rem 0.6rem',
            fontSize: '0.58rem', letterSpacing: '0.1em',
            color: 'rgba(212,168,67,0.6)',
          }}>
            {hi ? 'शीघ्र प्रकाश्य' : 'Coming Soon'}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <h3 style={{
          fontFamily: hi && book.titleHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
          fontSize: hi && book.titleHindi ? '1rem' : '1.05rem',
          fontWeight: hi && book.titleHindi ? 600 : 400,
          fontStyle: hi && book.titleHindi ? 'normal' : 'italic',
          color: 'var(--c-ivory)', lineHeight: 1.25, margin: 0,
        }}>{title}</h3>
        {subtitle && (
          <p style={{
            fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.5, margin: 0,
            fontFamily: hi && book.subtitleHindi ? 'var(--font-hind)' : 'var(--font-inter)',
          }}>{subtitle}</p>
        )}
        <p style={{ fontSize: '0.65rem', color: '#d4a843', opacity: 0.7, letterSpacing: '0.08em', margin: 0, marginTop: '0.2rem' }}>
          — {book.author}
        </p>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.75rem' }}>
          {!book.isPlaceholder ? (
            <>
              <button
                onClick={() => onRead(book)}
                style={{
                  flex: 1, padding: '0.55rem 0',
                  background: 'rgba(212,168,67,0.14)',
                  border: '1px solid rgba(212,168,67,0.35)',
                  borderRadius: '8px', color: '#d4a843',
                  fontSize: '0.75rem', fontWeight: 700,
                  cursor: 'pointer', letterSpacing: '0.04em',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,168,67,0.25)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(212,168,67,0.14)')}
              >
                {hi ? '📖 पढ़ें' : '📖 Read'}
              </button>
              <a
                href={book.pdf}
                download
                onClick={(e) => e.stopPropagation()}
                style={{
                  flex: 1, padding: '0.55rem 0', textAlign: 'center',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', color: 'rgba(255,255,255,0.55)',
                  fontSize: '0.75rem', fontWeight: 600,
                  cursor: 'pointer', textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              >
                {hi ? '↓ डाउनलोड' : '↓ Download'}
              </a>
            </>
          ) : (
            <div style={{
              flex: 1, padding: '0.55rem 0', textAlign: 'center',
              border: '1px solid rgba(212,168,67,0.1)',
              borderRadius: '8px', color: 'rgba(212,168,67,0.35)',
              fontSize: '0.72rem', letterSpacing: '0.06em',
            }}>
              {hi ? 'जल्द आ रही है…' : 'Coming soon…'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Audio Card ────────────────────────────────────────────
function AudioCard({ book, hi }: { book: typeof AUDIOBOOKS[0]; hi: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(13,31,16,0.55)',
        border: `1px solid ${hovered ? 'rgba(212,168,67,0.3)' : 'rgba(212,168,67,0.08)'}`,
        borderRadius: '14px', padding: '1.5rem',
        transition: 'all 0.3s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        cursor: 'default',
      }}
    >
      {/* Waveform visual */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '1rem', height: '32px' }}>
        {[4,7,12,8,14,6,10,13,5,9,11,7,4,8,12].map((h, i) => (
          <div key={i} style={{
            width: '3px', borderRadius: '2px',
            height: `${h * 2}px`,
            background: `rgba(212,168,67,${0.2 + (i % 3) * 0.12})`,
            transition: 'height 0.3s',
          }} />
        ))}
      </div>

      <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: '#d4a843', opacity: 0.6, marginBottom: '0.4rem', textTransform: 'uppercase' }}>
        {book.duration}
      </p>
      <h3 style={{
        fontFamily: 'var(--font-cormorant)', fontStyle: 'italic',
        fontSize: '1.05rem', color: 'var(--c-ivory)',
        marginBottom: '0.3rem', lineHeight: 1.3,
      }}>
        {hi && book.titleHindi ? book.titleHindi : book.title}
      </h3>
      <p style={{ fontSize: '0.65rem', color: '#d4a843', opacity: 0.6 }}>— {book.author}</p>

      <div style={{
        marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
        padding: '0.5rem 0.9rem',
        background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.12)',
        borderRadius: '8px', width: 'fit-content',
        color: 'rgba(212,168,67,0.4)', fontSize: '0.72rem',
      }}>
        <span>▶</span>
        <span>{hi ? 'शीघ्र प्रकाश्य' : 'Coming Soon'}</span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function LibraryPage() {
  const [lang, setLang] = useState<Language>('hi');
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'hi' | 'en'>('hi');
  const [activeSection, setActiveSection] = useState<'ebooks' | 'audio' | 'magazine'>('ebooks');
  const [openBook, setOpenBook] = useState<EBook | null>(null);

  const mag = MAGAZINES[0];
  const countdown = useCountdown(mag.launchDate);

  useEffect(() => {
    setLang(getSavedLanguage());
    setMounted(true);
  }, []);

  function handleLangChange(l: Language) {
    setLang(l);
    saveLanguage(l);
  }

  const hi = mounted ? lang === 'hi' : true;
  const filteredBooks = EBOOKS.filter((b) => b.lang === activeTab);

  if (!mounted) return null;

  return (
    <>
      {/* Reader overlay */}
      {openBook && (
        <EbookReader
          pdfUrl={openBook.pdf}
          title={hi && openBook.titleHindi ? openBook.titleHindi : openBook.titleEnglish}
          author={openBook.author}
          downloadUrl={openBook.pdf}
          onClose={() => setOpenBook(null)}
        />
      )}

      <div style={{ minHeight: '100vh', background: 'var(--c-bg)', color: 'var(--c-ivory)' }}>
        <Header lang={lang} onLangChange={handleLangChange} />

        {/* ── Hero ── */}
        <section style={{
          position: 'relative', overflow: 'hidden',
          padding: 'clamp(7rem,14vw,11rem) clamp(1.5rem,5vw,5rem) clamp(4rem,8vw,7rem)',
          background: 'linear-gradient(to bottom, #080f0a, #0d1f10)',
          textAlign: 'center',
        }}>
          {/* Mandala bg */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <svg width="min(700px,80vw)" height="min(700px,80vw)" viewBox="0 0 700 700" fill="none"
              style={{ opacity: 0.04, animation: 'sacredSpin 120s linear infinite' }}>
              {[320,280,240,200,160,120,80].map(r => (
                <circle key={r} cx="350" cy="350" r={r} stroke="#d4a843" strokeWidth="0.5" />
              ))}
            </svg>
          </div>

          <div style={{ position: 'relative', zIndex: 2 }}>
            <p style={{
              fontSize: '0.68rem', letterSpacing: '0.25em', color: '#d4a843',
              fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem',
              fontFamily: 'var(--font-inter)',
            }}>
              {hi ? 'निर्वाण धाम' : 'Nirvan Dham'}
            </p>
            <h1 style={{
              fontFamily: hi ? 'var(--font-hind)' : 'var(--font-cormorant)',
              fontSize: 'clamp(2.5rem,6vw,5rem)',
              fontWeight: hi ? 600 : 300,
              color: 'var(--c-ivory)', lineHeight: 1.1,
              marginBottom: '0.75rem',
            }}>
              {hi ? 'डिजिटल पुस्तकालय' : 'Digital Library'}
            </h1>
            <p style={{
              fontSize: 'clamp(0.88rem,1.8vw,1rem)',
              color: 'rgba(255,255,255,0.45)',
              maxWidth: '520px', margin: '0 auto',
              fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
              lineHeight: 1.8,
            }}>
              {hi
                ? 'आदिसत्व की शिक्षाएँ — ईबुक, ऑडियोबुक और मासिक पत्रिका'
                : 'Teachings of Aadisatv — eBooks, Audiobooks & Monthly Magazine'}
            </p>

            {/* Section tabs */}
            <div style={{
              display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '2.5rem', flexWrap: 'wrap',
            }}>
              {([
                { key: 'ebooks', labelHi: 'ईबुक', labelEn: 'eBooks', icon: '📚' },
                { key: 'audio', labelHi: 'ऑडियोबुक', labelEn: 'Audiobooks', icon: '🎧' },
                { key: 'magazine', labelHi: 'पत्रिका', labelEn: 'Magazine', icon: '📰' },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveSection(tab.key)}
                  style={{
                    padding: '0.6rem 1.4rem',
                    background: activeSection === tab.key ? 'rgba(212,168,67,0.18)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${activeSection === tab.key ? 'rgba(212,168,67,0.45)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '999px',
                    color: activeSection === tab.key ? '#d4a843' : 'rgba(255,255,255,0.45)',
                    fontSize: '0.82rem', cursor: 'pointer',
                    fontWeight: activeSection === tab.key ? 700 : 400,
                    transition: 'all 0.25s',
                    fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
                  }}
                >
                  {tab.icon} {hi ? tab.labelHi : tab.labelEn}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ══ EBOOKS ══ */}
        {activeSection === 'ebooks' && (
          <section style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,5rem)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              {/* Hindi / English lang tabs */}
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2.5rem', borderBottom: '1px solid rgba(212,168,67,0.1)', paddingBottom: '1rem' }}>
                {(['hi', 'en'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setActiveTab(l)}
                    style={{
                      padding: '0.5rem 1.5rem',
                      background: activeTab === l ? 'rgba(212,168,67,0.15)' : 'transparent',
                      border: 'none', borderBottom: `2px solid ${activeTab === l ? '#d4a843' : 'transparent'}`,
                      color: activeTab === l ? '#d4a843' : 'rgba(255,255,255,0.35)',
                      fontSize: '0.85rem', cursor: 'pointer', fontWeight: activeTab === l ? 700 : 400,
                      transition: 'all 0.2s',
                    }}
                  >
                    {l === 'hi' ? '🇮🇳 हिंदी' : '🌐 English'}
                  </button>
                ))}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1.5rem',
              }}>
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.slug}
                    book={book}
                    hi={hi}
                    onRead={(b) => setOpenBook(b)}
                    onDownload={(b) => { /* handled in card */ }}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══ AUDIOBOOKS ══ */}
        {activeSection === 'audio' && (
          <section style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,5rem)' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
              <div style={{ marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.68rem', letterSpacing: '0.2em', color: '#d4a843', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {hi ? 'ऑडियोबुक' : 'Audiobooks'}
                </p>
                <h2 style={{
                  fontFamily: hi ? 'var(--font-hind)' : 'var(--font-cormorant)',
                  fontSize: 'clamp(1.6rem,3vw,2.4rem)',
                  fontWeight: hi ? 600 : 300,
                  color: 'var(--c-ivory)',
                }}>
                  {hi ? 'सुनकर सीखें' : 'Learn by Listening'}
                </h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                {AUDIOBOOKS.map((ab) => <AudioCard key={ab.slug} book={ab} hi={hi} />)}
              </div>
            </div>
          </section>
        )}

        {/* ══ MAGAZINE ══ */}
        {activeSection === 'magazine' && (
          <section style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,5rem)' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(13,31,16,0.8), rgba(26,50,30,0.6))',
                border: '1px solid rgba(212,168,67,0.2)',
                borderRadius: '20px', overflow: 'hidden',
              }}>
                {/* Top banner */}
                <div style={{
                  background: 'linear-gradient(to right, rgba(212,168,67,0.15), rgba(212,168,67,0.05))',
                  borderBottom: '1px solid rgba(212,168,67,0.15)',
                  padding: '1rem 2rem',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                }}>
                  <span style={{ fontSize: '1.5rem' }}>📰</span>
                  <div>
                    <p style={{ fontSize: '0.62rem', letterSpacing: '0.2em', color: '#d4a843', opacity: 0.7, textTransform: 'uppercase', fontWeight: 700 }}>
                      {hi ? 'मासिक पत्रिका' : 'Monthly Magazine'}
                    </p>
                    <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem' }}>
                      Nirvan Dham
                    </p>
                  </div>
                </div>

                <div style={{ padding: 'clamp(2rem,5vw,4rem)', textAlign: 'center' }}>
                  {/* Magazine name */}
                  <h2 style={{
                    fontFamily: hi ? 'var(--font-hind)' : 'var(--font-cormorant)',
                    fontSize: 'clamp(3rem,8vw,6rem)',
                    fontWeight: hi ? 700 : 300,
                    color: '#d4a843', lineHeight: 1,
                    marginBottom: '0.5rem',
                    textShadow: '0 0 40px rgba(212,168,67,0.25)',
                  }}>
                    {hi ? mag.nameHindi : mag.name}
                  </h2>
                  <p style={{
                    fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
                    fontSize: '0.8rem', letterSpacing: '0.15em',
                    color: 'rgba(212,168,67,0.55)', marginBottom: '1.5rem',
                  }}>
                    {mag.issue}
                  </p>

                  <p style={{
                    fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
                    fontSize: hi ? '1rem' : '0.95rem',
                    color: 'rgba(255,255,255,0.5)', lineHeight: 1.8,
                    maxWidth: '500px', margin: '0 auto 2.5rem',
                  }}>
                    {hi ? mag.descriptionHindi : mag.description}
                  </p>

                  {/* Countdown */}
                  <div style={{ marginBottom: '2rem' }}>
                    <p style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(212,168,67,0.5)', textTransform: 'uppercase', marginBottom: '1rem' }}>
                      {countdown.launched ? (hi ? 'अब उपलब्ध' : 'Now Available') : (hi ? 'लॉन्च होने में' : 'Launching in')}
                    </p>
                    {!countdown.launched && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(0.75rem,3vw,2rem)', flexWrap: 'wrap' }}>
                        {[
                          { val: countdown.days, label: hi ? 'दिन' : 'Days' },
                          { val: countdown.hrs, label: hi ? 'घंटे' : 'Hours' },
                          { val: countdown.mins, label: hi ? 'मिनट' : 'Mins' },
                          { val: countdown.secs, label: hi ? 'सेकंड' : 'Secs' },
                        ].map(({ val, label }) => (
                          <div key={label} style={{ textAlign: 'center', minWidth: '60px' }}>
                            <div style={{
                              fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 700,
                              color: '#d4a843', fontVariantNumeric: 'tabular-nums',
                              fontFamily: 'var(--font-cormorant)',
                              textShadow: '0 0 20px rgba(212,168,67,0.3)',
                            }}>
                              {String(val).padStart(2, '0')}
                            </div>
                            <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em' }}>
                              {label}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Placeholder cover */}
                  <div style={{
                    maxWidth: '280px', margin: '0 auto',
                    aspectRatio: '3/4',
                    background: 'linear-gradient(145deg, #0d2818, #1a3d22)',
                    border: '1px solid rgba(212,168,67,0.2)',
                    borderRadius: '8px',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.4), 4px 0 16px rgba(0,0,0,0.3)',
                  }}>
                    <p style={{ fontFamily: 'var(--font-hind)', fontSize: '2.5rem', color: '#d4a843', fontWeight: 700, marginBottom: '0.25rem' }}>
                      मुक्तिबोध
                    </p>
                    <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', color: 'rgba(212,168,67,0.5)', fontSize: '1.1rem', marginBottom: '1rem' }}>
                      Muktibodh
                    </p>
                    <div style={{ width: '40px', height: '1px', background: 'rgba(212,168,67,0.3)', marginBottom: '0.75rem' }} />
                    <p style={{ fontSize: '0.7rem', letterSpacing: '0.12em', color: 'rgba(212,168,67,0.4)' }}>Issue 01 · June 2026</p>
                    <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginTop: '1.5rem', letterSpacing: '0.1em' }}>Nirvan Dham</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Footer spacer */}
        <div style={{ height: '4rem' }} />
      </div>
    </>
  );
}
