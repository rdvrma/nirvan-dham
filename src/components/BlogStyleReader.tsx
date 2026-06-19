'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { EBook } from '@/lib/library-data';
import { getBookManuscript } from '@/lib/book-manuscripts';
import type { BookManuscript, ManuscriptSection } from '@/lib/book-manuscripts';
import Header from '@/components/Header';
import { getSavedLanguage, saveLanguage } from '@/lib/i18n';
import type { Language } from '@/lib/i18n';

type Theme = 'light' | 'dark';

interface BlogStyleReaderProps {
  book: EBook;
}

const FONT_SIZES = [14, 16, 18, 20, 22, 26];

// ── Palette ────────────────────────────────────────────────
function getPalette(theme: Theme) {
  if (theme === 'light') {
    return {
      bg: '#faf8f3',
      pageBg: '#ffffff',
      text: '#1a150e',
      muted: 'rgba(26,21,14,0.5)',
      border: 'rgba(180,145,60,0.18)',
      gold: '#8a6520',
      goldBg: 'rgba(180,145,60,0.08)',
      nav: 'rgba(250,248,243,0.95)',
      chapterBg: '#f5f0e8',
      chapterText: '#1a150e',
      highlight: 'rgba(180,145,60,0.12)',
      sidebar: '#f0ece2',
      sidebarActive: 'rgba(180,145,60,0.14)',
      divider: 'rgba(180,145,60,0.2)',
    };
  }
  return {
    bg: '#0b130d',
    pageBg: '#111a13',
    text: '#e8dfc8',
    muted: 'rgba(232,223,200,0.48)',
    border: 'rgba(212,168,67,0.14)',
    gold: '#d4a843',
    goldBg: 'rgba(212,168,67,0.08)',
    nav: 'rgba(11,19,13,0.96)',
    chapterBg: '#0d1a0f',
    chapterText: '#e8dfc8',
    highlight: 'rgba(212,168,67,0.07)',
    sidebar: '#0d1a0f',
    sidebarActive: 'rgba(212,168,67,0.1)',
    divider: 'rgba(212,168,67,0.1)',
  };
}

// ── Section renderer ────────────────────────────────────────
function SectionView({ section, p, fontSizePx, isHindi }: {
  section: ManuscriptSection;
  p: ReturnType<typeof getPalette>;
  fontSizePx: number;
  isHindi: boolean;
}) {
  const fontFamily = isHindi ? 'var(--font-hind)' : 'var(--font-inter)';
  const isChapter = section.type === 'chapter';

  return (
    <article
      id={`section-${section.id}`}
      style={{
        borderBottom: `1px solid ${p.divider}`,
        paddingBottom: '3rem',
        marginBottom: '3rem',
      }}
    >
      {/* Chapter header */}
      <div style={{
        background: p.chapterBg,
        borderRadius: '12px',
        padding: 'clamp(1.5rem,4vw,2.5rem)',
        marginBottom: '2rem',
        border: `1px solid ${p.border}`,
      }}>
        {isChapter && section.number != null && (
          <p style={{
            fontSize: '0.65rem',
            letterSpacing: '0.28em',
            color: p.gold,
            textTransform: 'uppercase',
            fontWeight: 700,
            marginBottom: '0.6rem',
            fontFamily: 'var(--font-inter)',
          }}>
            {isHindi ? `अध्याय ${section.number}` : `Chapter ${section.number}`}
          </p>
        )}
        <h2 style={{
          fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
          fontSize: isHindi ? 'clamp(1.5rem,3.5vw,2.2rem)' : 'clamp(1.6rem,3.5vw,2.4rem)',
          fontWeight: isHindi ? 600 : 400,
          fontStyle: isHindi ? 'normal' : 'italic',
          color: p.chapterText,
          lineHeight: 1.25,
          margin: 0,
          paddingBottom: isHindi ? '0.08em' : 0,
        }}>
          {section.title}
        </h2>
        {section.subtitle && (
          <p style={{
            marginTop: '0.6rem',
            color: p.muted,
            fontFamily,
            fontSize: '0.95rem',
            lineHeight: 1.7,
          }}>
            {section.subtitle}
          </p>
        )}
      </div>

      {/* Blocks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1em' }}>
        {section.blocks.map((block, i) => {
          if (block.type === 'heading') {
            return (
              <h3 key={i} style={{
                fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
                fontSize: isHindi ? `${fontSizePx + 4}px` : `${fontSizePx + 6}px`,
                fontWeight: isHindi ? 600 : 400,
                fontStyle: isHindi ? 'normal' : 'italic',
                color: p.text,
                lineHeight: 1.3,
                marginTop: '0.5em',
                paddingBottom: isHindi ? '0.1em' : 0,
              }}>
                {block.text}
              </h3>
            );
          }
          return (
            <p key={i} style={{
              fontFamily,
              fontSize: `${fontSizePx}px`,
              lineHeight: isHindi ? 2.0 : 1.9,
              color: p.text,
              margin: 0,
              textAlign: 'justify',
            }}>
              {block.text}
            </p>
          );
        })}
      </div>
    </article>
  );
}

// ── Main component ──────────────────────────────────────────
export default function BlogStyleReader({ book }: BlogStyleReaderProps) {
  const [lang, setLang] = useState<Language>('hi');
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [fontSizeIndex, setFontSizeIndex] = useState(2); // 18px default
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const observersRef = useRef<IntersectionObserver[]>([]);

  const manuscript: BookManuscript | null = getBookManuscript(book.slug);
  const p = getPalette(theme);
  const fontSizePx = FONT_SIZES[fontSizeIndex];
  const hi = lang === 'hi';
  const isHindi = manuscript?.language === 'hi';
  const title = hi && book.titleHindi ? book.titleHindi : book.titleEnglish;

  useEffect(() => {
    setLang(getSavedLanguage());
    setMounted(true);
  }, []);

  // Intersection observer — track active section for TOC highlight
  useEffect(() => {
    if (!manuscript) return;
    observersRef.current.forEach(obs => obs.disconnect());
    observersRef.current = [];

    manuscript.sections.forEach((section, index) => {
      const el = document.getElementById(`section-${section.id}`);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(index);
        },
        { rootMargin: '-20% 0px -60% 0px' }
      );
      obs.observe(el);
      observersRef.current.push(obs);
    });

    return () => observersRef.current.forEach(obs => obs.disconnect());
  }, [manuscript, mounted]);

  const scrollToSection = useCallback((index: number) => {
    const section = manuscript?.sections[index];
    if (!section) return;
    const el = document.getElementById(`section-${section.id}`);
    if (!el) return;
    const navHeight = 64;
    const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 16;
    window.scrollTo({ top, behavior: 'smooth' });
    setSidebarOpen(false);
  }, [manuscript]);

  if (!manuscript) {
    return (
      <div style={{ minHeight: '100vh', background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: p.muted, fontFamily: 'var(--font-inter)' }}>
          Blog reader is not available for this book.{' '}
          <Link href={`/library/${book.slug}/read`} style={{ color: p.gold }}>Open Book Reader</Link>
        </p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: p.bg,
      color: p.text,
      opacity: mounted ? 1 : 0,
      transition: 'opacity 0.2s ease',
    }}>
      {/* ── Sticky Top Nav ── */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: p.nav,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${p.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(1rem,4vw,2.5rem)',
        height: '56px',
        gap: '0.75rem',
      }}>
        {/* Left — back + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
          <Link href={`/library/${book.slug}`} style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            color: p.muted, textDecoration: 'none',
            fontSize: '0.8rem', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            ← {hi ? 'वापस' : 'Back'}
          </Link>
          <p style={{
            fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
            fontSize: isHindi ? '0.88rem' : '1rem',
            fontStyle: isHindi ? 'normal' : 'italic',
            color: p.text,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            margin: 0,
          }}>
            {title}
          </p>
        </div>

        {/* Right — controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          {/* Font size */}
          <button
            onClick={() => setFontSizeIndex(i => Math.max(0, i - 1))}
            disabled={fontSizeIndex === 0}
            title="Decrease font size"
            style={controlBtn(p, fontSizeIndex === 0)}
          >A−</button>
          <span style={{ fontSize: '0.7rem', color: p.muted, minWidth: '30px', textAlign: 'center' }}>
            {fontSizePx}
          </span>
          <button
            onClick={() => setFontSizeIndex(i => Math.min(FONT_SIZES.length - 1, i + 1))}
            disabled={fontSizeIndex === FONT_SIZES.length - 1}
            title="Increase font size"
            style={controlBtn(p, fontSizeIndex === FONT_SIZES.length - 1)}
          >A+</button>

          <div style={{ width: '1px', height: '20px', background: p.border, margin: '0 0.2rem' }} />

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            style={{
              ...controlBtn(p, false),
              minWidth: '36px',
              fontSize: '1rem',
            }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          <div style={{ width: '1px', height: '20px', background: p.border, margin: '0 0.2rem' }} />

          {/* TOC toggle */}
          <button
            onClick={() => setSidebarOpen(s => !s)}
            title={hi ? 'सामग्री सूची' : 'Table of Contents'}
            style={{
              ...controlBtn(p, false),
              background: sidebarOpen ? p.goldBg : 'transparent',
              border: `1px solid ${sidebarOpen ? p.gold : p.border}`,
              color: sidebarOpen ? p.gold : p.muted,
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {hi ? '≡ सूची' : '≡ TOC'}
          </button>

          {/* Book style link */}
          <Link href={`/library/${book.slug}/read`} style={{
            ...controlBtn(p, false),
            textDecoration: 'none',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: p.gold,
            border: `1px solid ${p.border}`,
            borderRadius: '6px',
            padding: '0.32rem 0.7rem',
            background: p.goldBg,
            display: 'flex', alignItems: 'center',
          }}>
            📖 {hi ? 'बुक व्यू' : 'Book View'}
          </Link>
        </div>
      </div>

      {/* ── Table of Contents Drawer ── */}
      {sidebarOpen && (
        <div style={{
          position: 'fixed',
          top: '56px',
          right: 0,
          bottom: 0,
          width: 'min(320px, 88vw)',
          background: p.sidebar,
          borderLeft: `1px solid ${p.border}`,
          overflowY: 'auto',
          zIndex: 90,
          padding: '1.25rem',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.18)',
        }}>
          <p style={{
            fontSize: '0.6rem', letterSpacing: '0.24em', color: p.gold,
            textTransform: 'uppercase', fontWeight: 800, marginBottom: '1rem',
            fontFamily: 'var(--font-inter)',
          }}>
            {hi ? 'सामग्री सूची' : 'Contents'}
          </p>
          {manuscript.sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(index)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: activeSection === index ? p.sidebarActive : 'transparent',
                border: 'none',
                borderRadius: '8px',
                padding: '0.7rem 0.85rem',
                marginBottom: '0.3rem',
                cursor: 'pointer',
                color: activeSection === index ? p.gold : p.muted,
                fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
                fontSize: isHindi ? '0.88rem' : '0.82rem',
                lineHeight: 1.45,
                transition: 'all 0.2s',
              }}
            >
              {section.number != null && (
                <span style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.18em', marginBottom: '0.15rem', opacity: 0.6 }}>
                  {isHindi ? `अध्याय ${section.number}` : `Chapter ${section.number}`}
                </span>
              )}
              {section.title}
            </button>
          ))}
        </div>
      )}

      {/* ── Main content ── */}
      <main
        ref={contentRef}
        style={{
          maxWidth: '780px',
          margin: '0 auto',
          padding: 'clamp(2rem,5vw,4rem) clamp(1.25rem,5vw,2.5rem)',
        }}
      >
        {/* Book title block */}
        <div style={{
          textAlign: 'center',
          padding: 'clamp(2rem,5vw,4rem) 1rem clamp(2.5rem,6vw,5rem)',
          borderBottom: `1px solid ${p.divider}`,
          marginBottom: '3rem',
        }}>
          {(manuscript.series || manuscript.bookNumber) && (
            <p style={{
              fontSize: '0.65rem', letterSpacing: '0.28em', color: p.gold,
              textTransform: 'uppercase', fontWeight: 700, marginBottom: '1rem',
              fontFamily: 'var(--font-inter)',
            }}>
              {manuscript.series}{manuscript.bookNumber ? ` · ${manuscript.bookNumber}` : ''}
            </p>
          )}
          <h1 style={{
            fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
            fontSize: isHindi ? 'clamp(2.2rem,6vw,3.8rem)' : 'clamp(2.4rem,6vw,4rem)',
            fontWeight: isHindi ? 600 : 300,
            fontStyle: isHindi ? 'normal' : 'italic',
            color: p.text,
            lineHeight: isHindi ? 1.2 : 1.05,
            paddingBottom: isHindi ? '0.1em' : 0,
            margin: '0 0 0.75rem',
          }}>
            {manuscript.title}
          </h1>
          {manuscript.subtitle && (
            <p style={{
              fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
              fontSize: isHindi ? '1.05rem' : '1rem',
              color: p.muted,
              lineHeight: 1.8,
              margin: '0 0 1.25rem',
            }}>
              {manuscript.subtitle}
            </p>
          )}
          <p style={{ fontSize: '0.82rem', color: p.gold, opacity: 0.7 }}>
            — {manuscript.authorDevanagari || manuscript.author}
          </p>

          {/* Quick actions */}
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.75rem' }}>
            <a href={book.pdf} download style={{
              padding: '0.6rem 1.2rem',
              background: p.goldBg,
              border: `1px solid ${p.border}`,
              borderRadius: '8px',
              color: p.gold,
              fontSize: '0.8rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}>
              ↓ {hi ? 'PDF डाउनलोड' : 'Download PDF'}
            </a>
            <Link href={`/library/${book.slug}/read`} style={{
              padding: '0.6rem 1.2rem',
              background: 'transparent',
              border: `1px solid ${p.border}`,
              borderRadius: '8px',
              color: p.muted,
              fontSize: '0.8rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}>
              📖 {hi ? 'बुक स्टाइल में पढ़ें' : 'Read in Book Style'}
            </Link>
          </div>
        </div>

        {/* Sections */}
        {manuscript.sections.map((section, index) => (
          <SectionView
            key={section.id}
            section={section}
            p={p}
            fontSizePx={fontSizePx}
            isHindi={isHindi}
          />
        ))}

        {/* End of book */}
        <div style={{ textAlign: 'center', padding: '3rem 0 2rem' }}>
          <div style={{
            display: 'inline-block',
            width: '40px', height: '1px',
            background: `linear-gradient(90deg, transparent, ${p.gold}, transparent)`,
            marginBottom: '1.25rem',
          }} />
          <p style={{
            fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
            fontStyle: isHindi ? 'normal' : 'italic',
            fontSize: isHindi ? '1rem' : '1.1rem',
            color: p.muted,
            marginBottom: '1.5rem',
          }}>
            {hi ? '॥ इति ॥' : '∿ End ∿'}
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/library" style={{
              padding: '0.65rem 1.35rem',
              background: p.goldBg,
              border: `1px solid ${p.border}`,
              borderRadius: '8px',
              color: p.gold, fontSize: '0.82rem', fontWeight: 700,
              textDecoration: 'none',
            }}>
              {hi ? '← पुस्तकालय' : '← Library'}
            </Link>
            <a href={book.pdf} download style={{
              padding: '0.65rem 1.35rem',
              background: 'transparent',
              border: `1px solid ${p.border}`,
              borderRadius: '8px',
              color: p.muted, fontSize: '0.82rem', fontWeight: 600,
              textDecoration: 'none',
            }}>
              ↓ PDF
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Shared control button style ─────────────────────────────
function controlBtn(p: ReturnType<typeof getPalette>, disabled: boolean): React.CSSProperties {
  return {
    background: 'transparent',
    border: `1px solid ${p.border}`,
    borderRadius: '6px',
    padding: '0.32rem 0.62rem',
    color: disabled ? p.muted : p.text,
    fontSize: '0.75rem',
    fontWeight: 700,
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    fontFamily: 'var(--font-inter)',
    transition: 'all 0.2s',
  };
}
