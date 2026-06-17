'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import Header from '@/components/Header';
import ContactSection from '@/components/ContactSection';
import type { EBook } from '@/lib/library-data';
import type { Language } from '@/lib/i18n';
import { getSavedLanguage, saveLanguage } from '@/lib/i18n';

interface BookDetailPageProps {
  book: EBook;
}

export default function BookDetailPage({ book }: BookDetailPageProps) {
  const [lang, setLang] = useState<Language>('hi');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLang(getSavedLanguage());
  }, []);

  const hi = lang === 'hi';
  const title = hi && book.titleHindi ? book.titleHindi : book.titleEnglish;
  const subtitle = hi && book.subtitleHindi ? book.subtitleHindi : book.subtitle;
  const shareText = copied ? (hi ? 'Link copied' : 'Link copied') : (hi ? 'Share Book' : 'Share Book');
  const stats = useMemo(() => {
    return [
      { label: hi ? 'Format' : 'Format', value: 'Premium Web Book' },
      { label: hi ? 'Reader' : 'Reader', value: hi ? 'Flip + Grid' : 'Flip + Grid' },
      { label: hi ? 'Theme' : 'Theme', value: hi ? 'Dark / Light' : 'Dark / Light' },
    ];
  }, [hi]);

  async function shareBook() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: subtitle || title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', color: 'var(--c-text)' }}>
      <Header lang={lang} onLangChange={(l) => { setLang(l); saveLanguage(l); }} />

      <main>
        <section style={{
          position: 'relative',
          overflow: 'hidden',
          padding: 'clamp(7rem,12vw,9rem) clamp(1.25rem,5vw,5rem) clamp(3rem,6vw,5rem)',
          background: 'linear-gradient(180deg,#050906 0%,#0c1a0f 56%,#08110a 100%)',
        }}>
          <div className="sacred-grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.28 }} />
          <div style={{
            position: 'absolute',
            inset: '10% 12% auto auto',
            width: 'min(42vw,480px)',
            aspectRatio: '1',
            borderRadius: '50%',
            border: '1px solid rgba(212,168,67,0.07)',
            opacity: 0.8,
            pointerEvents: 'none',
          }} />

          <div style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '1180px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(220px,340px) minmax(0,1fr)',
            gap: 'clamp(2rem,6vw,5rem)',
            alignItems: 'center',
          }} className="book-detail-hero">
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                position: 'relative',
                width: 'min(76vw,330px)',
                aspectRatio: '2/3',
                borderRadius: '8px 18px 18px 8px',
                overflow: 'hidden',
                background: 'linear-gradient(145deg,#132216,#071009)',
                border: '1px solid rgba(212,168,67,0.22)',
                boxShadow: '24px 28px 80px rgba(0,0,0,0.64), inset 10px 0 20px rgba(0,0,0,0.28)',
              }}>
                {book.cover ? (
                  <Image src={book.cover} alt={title} fill priority sizes="(max-width: 700px) 76vw, 330px" style={{ objectFit: 'cover' }} />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', padding: '2rem', textAlign: 'center', color: '#d4a843' }}>
                    {title}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Link href="/library" style={{
                display: 'inline-flex',
                color: 'rgba(212,168,67,0.72)',
                textDecoration: 'none',
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '1.25rem',
              }}>
                Back to Library
              </Link>

              <p style={{
                color: '#d4a843',
                fontSize: '0.7rem',
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                marginBottom: '0.9rem',
              }}>
                Nirvan Dham Digital Granth
              </p>

              <h1 style={{
                fontFamily: hi && book.titleHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
                fontSize: 'clamp(2.5rem,7vw,5.4rem)',
                fontWeight: hi && book.titleHindi ? 600 : 300,
                lineHeight: 0.98,
                color: 'var(--c-ivory)',
                maxWidth: '760px',
              }}>
                {title}
              </h1>

              {subtitle && (
                <p style={{
                  marginTop: '1.25rem',
                  maxWidth: '620px',
                  color: 'rgba(245,237,216,0.58)',
                  fontSize: hi && book.subtitleHindi ? '1rem' : '1.1rem',
                  lineHeight: 1.8,
                  fontFamily: hi && book.subtitleHindi ? 'var(--font-hind)' : 'var(--font-inter)',
                }}>
                  {subtitle}
                </p>
              )}

              <p style={{ marginTop: '1rem', color: '#d4a843', opacity: 0.72, fontSize: '0.9rem' }}>
                by {book.author}
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '2rem' }}>
                <Link href={`/library/${book.slug}/read`} style={primaryAction}>
                  Enter Premium Reader
                </Link>
                <a href={book.pdf} download style={secondaryAction}>
                  Download PDF
                </a>
                <button type="button" onClick={shareBook} style={secondaryButton}>
                  {shareText}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.25rem,5vw,5rem)' }}>
          <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: '1rem' }} className="book-detail-stats">
              {stats.map((item) => (
                <div key={item.label} style={{
                  border: '1px solid rgba(212,168,67,0.12)',
                  background: 'rgba(13,31,16,0.44)',
                  borderRadius: '8px',
                  padding: '1.25rem',
                }}>
                  <p style={{ color: 'rgba(212,168,67,0.56)', fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    {item.label}
                  </p>
                  <p style={{ color: 'var(--c-ivory)', fontSize: '1.05rem' }}>{item.value}</p>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '1.25rem',
              border: '1px solid rgba(212,168,67,0.12)',
              background: 'linear-gradient(135deg,rgba(13,31,16,0.7),rgba(7,13,8,0.8))',
              borderRadius: '8px',
              padding: 'clamp(1.4rem,4vw,2rem)',
            }}>
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 300, color: 'var(--c-ivory)', marginBottom: '0.75rem' }}>
                A reading experience, not just a file
              </h2>
              <p style={{ color: 'rgba(245,237,216,0.54)', lineHeight: 1.9, maxWidth: '780px' }}>
                This book opens inside a native Nirvan Dham reader with page flip, grid overview, theme control, font sizing, current-page sharing, and direct PDF download. The first version reads the PDF text into a premium web-book surface; later, each page can be enhanced with designed sections, imagery, audio, or video.
              </p>
            </div>
          </div>
        </section>
      </main>

      <ContactSection lang={lang} />

      <style jsx>{`
        @media (max-width: 840px) {
          .book-detail-hero {
            grid-template-columns: 1fr !important;
            text-align: center;
          }

          .book-detail-hero a,
          .book-detail-hero button {
            justify-content: center;
          }

          .book-detail-stats {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

const primaryAction: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '44px',
  padding: '0.78rem 1.25rem',
  borderRadius: '8px',
  border: '1px solid rgba(212,168,67,0.42)',
  background: 'linear-gradient(135deg,rgba(212,168,67,0.24),rgba(212,168,67,0.1))',
  color: '#f7dfa0',
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: '0.86rem',
};

const secondaryAction: CSSProperties = {
  ...primaryAction,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'rgba(245,237,216,0.72)',
};

const secondaryButton: CSSProperties = {
  ...secondaryAction,
  cursor: 'pointer',
  fontFamily: 'var(--font-inter)',
};
