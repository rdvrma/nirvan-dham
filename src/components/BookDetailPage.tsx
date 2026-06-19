'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import Header from '@/components/Header';
import ContactSection from '@/components/ContactSection';
import type { EBook } from '@/lib/library-data';
import type { Language } from '@/lib/i18n';
import { getSavedLanguage, saveLanguage } from '@/lib/i18n';
import { hasBookManuscript } from '@/lib/book-manuscripts';

interface BookDetailPageProps {
  book: EBook;
}

export default function BookDetailPage({ book }: BookDetailPageProps) {
  const [lang, setLang] = useState<Language>('hi');
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLang(getSavedLanguage());
    setMounted(true);
  }, []);

  const hi = lang === 'hi';
  const title = hi && book.titleHindi ? book.titleHindi : book.titleEnglish;
  const subtitle = hi && book.subtitleHindi ? book.subtitleHindi : book.subtitle;
  const description = hi && book.descriptionHindi ? book.descriptionHindi : book.description;
  const shareText = copied ? '✓ Link Copied' : (hi ? 'साझा करें' : 'Share');

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
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--c-bg)',
        color: 'var(--c-text)',
        // FOUC fix — fade in after mount
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.25s ease',
      }}
    >
      <Header lang={lang} onLangChange={(l) => { setLang(l); saveLanguage(l); }} />

      <main>
        {/* ── Hero ── */}
        <section style={{
          position: 'relative',
          overflow: 'hidden',
          padding: 'clamp(7rem,12vw,9rem) clamp(1.25rem,5vw,5rem) clamp(3rem,6vw,5rem)',
          background: 'linear-gradient(180deg,#050906 0%,#0c1a0f 56%,#08110a 100%)',
        }}>
          {/* Background decorative circle */}
          <div style={{
            position: 'absolute', inset: '8% 10% auto auto',
            width: 'min(44vw,500px)', aspectRatio: '1',
            borderRadius: '50%',
            border: '1px solid rgba(212,168,67,0.06)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: '15%', right: '8%',
            width: 'min(28vw,320px)', aspectRatio: '1',
            borderRadius: '50%',
            border: '1px solid rgba(212,168,67,0.04)',
            pointerEvents: 'none',
          }} />

          <div style={{
            position: 'relative', zIndex: 2,
            maxWidth: '1180px', margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(200px, 320px) minmax(0, 1fr)',
            gap: 'clamp(2rem, 6vw, 5rem)',
            alignItems: 'start',
          }} className="book-detail-hero">

            {/* Book Cover */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                position: 'relative',
                width: 'min(76vw, 300px)',
                aspectRatio: '2/3',
                borderRadius: '6px 16px 16px 6px',
                overflow: 'hidden',
                background: 'linear-gradient(145deg,#132216,#071009)',
                border: '1px solid rgba(212,168,67,0.2)',
                boxShadow: '20px 24px 72px rgba(0,0,0,0.65), -3px 0 12px rgba(0,0,0,0.4), inset 8px 0 16px rgba(0,0,0,0.25)',
              }}>
                {book.cover ? (
                  <Image
                    src={book.cover} alt={title}
                    fill priority
                    sizes="(max-width: 700px) 76vw, 300px"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: '2rem', textAlign: 'center', gap: '1rem',
                  }}>
                    <div style={{ fontSize: '2.5rem', opacity: 0.2 }}>📖</div>
                    <p style={{
                      fontFamily: hi && book.titleHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
                      color: '#d4a843', fontSize: '1rem', lineHeight: 1.4,
                    }}>{title}</p>
                  </div>
                )}
                {/* Spine */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px',
                  background: 'linear-gradient(to right, rgba(212,168,67,0.18), rgba(212,168,67,0.06))',
                }} />
              </div>
            </div>

            {/* Book Info */}
            <div>
              {/* Back link */}
              <Link href="/library" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                color: 'rgba(212,168,67,0.65)', textDecoration: 'none',
                fontSize: '0.73rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                marginBottom: '1.5rem',
                fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
              }}>
                ← {hi ? 'पुस्तकालय' : 'Library'}
              </Link>

              {/* Tag */}
              <p style={{
                color: '#d4a843', fontSize: '0.64rem',
                letterSpacing: '0.26em', textTransform: 'uppercase',
                marginBottom: '0.9rem', opacity: 0.75,
              }}>
                {hi ? 'निर्वाण धाम · डिजिटल ग्रंथ' : 'Nirvan Dham · Digital Granth'}
              </p>

              {/* Title */}
              <h1 style={{
                fontFamily: hi && book.titleHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
                fontSize: 'clamp(2.2rem, 6vw, 4.5rem)',
                fontWeight: hi && book.titleHindi ? 600 : 300,
                lineHeight: hi && book.titleHindi ? 1.2 : 1.05,
                paddingBottom: hi && book.titleHindi ? '0.1em' : '0',
                color: 'var(--c-ivory)',
                marginBottom: '0',
              }}>
                {title}
              </h1>

              {/* Subtitle */}
              {subtitle && (
                <p style={{
                  marginTop: '1rem',
                  color: 'rgba(245,237,216,0.52)',
                  fontSize: hi && book.subtitleHindi ? '1rem' : '1.05rem',
                  lineHeight: 1.75,
                  fontFamily: hi && book.subtitleHindi ? 'var(--font-hind)' : 'var(--font-inter)',
                  maxWidth: '560px',
                }}>
                  {subtitle}
                </p>
              )}

              {/* Author */}
              <p style={{ marginTop: '0.85rem', color: '#d4a843', opacity: 0.7, fontSize: '0.88rem' }}>
                — {book.author}
              </p>

              {/* CTA Buttons */}
              <div style={{ marginTop: '2.25rem' }}>
                {hasBookManuscript(book.slug) ? (
                  // ── Two reading mode cards ──────────────────
                  <div>
                    <p style={{
                      fontSize: '0.62rem', letterSpacing: '0.22em', color: 'rgba(212,168,67,0.6)',
                      textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.85rem',
                      fontFamily: 'var(--font-inter)',
                    }}>
                      {hi ? 'पढ़ने का तरीका चुनें' : 'Choose how to read'}
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {/* Book Style */}
                      <Link
                        href={`/library/${book.slug}/read`}
                        style={readModeCard('book')}
                      >
                        <span style={{ fontSize: '1.6rem', display: 'block', marginBottom: '0.5rem' }}>📖</span>
                        <strong style={{ display: 'block', fontSize: '0.88rem', marginBottom: '0.25rem', fontWeight: 700 }}>
                          {hi ? 'बुक स्टाइल' : 'Book Style'}
                        </strong>
                        <span style={{ fontSize: '0.72rem', opacity: 0.62, lineHeight: 1.5 }}>
                          {hi ? 'पन्ने पलटते हुए पढ़ें' : 'Flip pages like a real book'}
                        </span>
                      </Link>

                      {/* Blog Style */}
                      <Link
                        href={`/library/${book.slug}/read?mode=blog`}
                        style={readModeCard('blog')}
                      >
                        <span style={{ fontSize: '1.6rem', display: 'block', marginBottom: '0.5rem' }}>📄</span>
                        <strong style={{ display: 'block', fontSize: '0.88rem', marginBottom: '0.25rem', fontWeight: 700 }}>
                          {hi ? 'ब्लॉग स्टाइल' : 'Blog Style'}
                        </strong>
                        <span style={{ fontSize: '0.72rem', opacity: 0.62, lineHeight: 1.5 }}>
                          {hi ? 'स्क्रॉल करें · लाइट/डार्क · फ़ॉन्ट साइज़' : 'Scroll · Light/Dark · Font size'}
                        </span>
                      </Link>
                    </div>

                    {/* PDF download — secondary row */}
                    <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
                      <a href={book.pdf} download style={secondaryAction}>
                        {hi ? '↓ PDF डाउनलोड' : '↓ Download PDF'}
                      </a>
                      <button type="button" onClick={shareBook} style={secondaryButton}>
                        {shareText}
                      </button>
                    </div>
                  </div>
                ) : (
                  // ── Single read button (no manuscript) ─────
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <Link href={`/library/${book.slug}/read`} style={primaryAction}>
                      {hi ? '📖 पुस्तक पढ़ें' : '📖 Read Book'}
                    </Link>
                    <a href={book.pdf} download style={secondaryAction}>
                      {hi ? '↓ PDF डाउनलोड' : '↓ Download PDF'}
                    </a>
                    <button type="button" onClick={shareBook} style={secondaryButton}>
                      {shareText}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Book Summary ── */}
        {(description || subtitle) && (
          <section style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.25rem,5vw,5rem)' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <p style={{
                fontSize: '0.64rem', letterSpacing: '0.24em', color: '#d4a843',
                textTransform: 'uppercase', fontWeight: 700, opacity: 0.75, marginBottom: '1.25rem',
              }}>
                {hi ? 'पुस्तक के बारे में' : 'About This Book'}
              </p>

              <div style={{
                border: '1px solid rgba(212,168,67,0.1)',
                background: 'linear-gradient(135deg, rgba(13,31,16,0.65), rgba(7,13,8,0.75))',
                borderRadius: '12px',
                padding: 'clamp(1.5rem, 4vw, 2.5rem)',
              }}>
                {description ? (
                  <p style={{
                    color: 'rgba(245,237,216,0.62)',
                    lineHeight: 1.95,
                    fontSize: hi ? '1rem' : '0.95rem',
                    fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
                  }}>
                    {description}
                  </p>
                ) : (
                  <p style={{
                    color: 'rgba(245,237,216,0.5)',
                    lineHeight: 1.95,
                    fontSize: hi ? '1rem' : '0.95rem',
                    fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
                  }}>
                    {subtitle}
                  </p>
                )}

                {/* Read CTA inside summary */}
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(212,168,67,0.08)', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {hasBookManuscript(book.slug) ? (
                    <>
                      <Link href={`/library/${book.slug}/read`} style={primaryAction}>
                        {hi ? '📖 बुक स्टाइल' : '📖 Book Style'}
                      </Link>
                      <Link href={`/library/${book.slug}/read?mode=blog`} style={secondaryAction}>
                        {hi ? '📄 ब्लॉग स्टाइल' : '📄 Blog Style'}
                      </Link>
                    </>
                  ) : (
                    <Link href={`/library/${book.slug}/read`} style={primaryAction}>
                      {hi ? '📖 अभी पढ़ें' : '📖 Read Now'}
                    </Link>
                  )}
                  <a href={book.pdf} download style={secondaryAction}>
                    {hi ? '↓ PDF' : '↓ PDF'}
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <ContactSection lang={lang} />

      <style>{`
        @media (max-width: 860px) {
          .book-detail-hero {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .book-detail-hero > div:first-child {
            justify-content: center;
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
  minHeight: '46px',
  padding: '0.8rem 1.5rem',
  borderRadius: '8px',
  border: '1px solid rgba(212,168,67,0.45)',
  background: 'rgba(212,168,67,0.15)',
  color: '#f7dfa0',
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: '0.88rem',
  cursor: 'pointer',
  transition: 'background 0.2s',
};

const secondaryAction: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '46px',
  padding: '0.8rem 1.25rem',
  borderRadius: '8px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(245,237,216,0.65)',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
};

const secondaryButton: CSSProperties = {
  ...secondaryAction,
  fontFamily: 'inherit',
};

function readModeCard(mode: 'book' | 'blog'): CSSProperties {
  const isBook = mode === 'book';
  return {
    display: 'block',
    flex: '1 1 140px',
    minWidth: '140px',
    maxWidth: '200px',
    padding: '1.1rem 1.2rem',
    borderRadius: '12px',
    border: isBook
      ? '1px solid rgba(212,168,67,0.38)'
      : '1px solid rgba(255,255,255,0.1)',
    background: isBook
      ? 'rgba(212,168,67,0.1)'
      : 'rgba(255,255,255,0.04)',
    color: isBook ? '#f7dfa0' : 'rgba(245,237,216,0.75)',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.25s',
    textAlign: 'left' as const,
  };
}
