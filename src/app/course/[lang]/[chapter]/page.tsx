// src/app/course/[lang]/[chapter]/page.tsx
// Server component — reads JSON files from disk and renders chapter content

import fs from 'fs';
import path from 'path';
import Link from 'next/link';

// ── Types ──────────────────────────────────────────────────────
interface HindiSection {
  heading?: string;
  markdown?: string;
}
interface HindiKhand {
  sections?: HindiSection[];
}
interface HindiChapter {
  title?: string;
  khands?: HindiKhand[];
}

interface HinglishElement {
  type: string;
  text: string;
}
interface HinglishSection {
  section_title?: string;
  elements?: HinglishElement[];
}
interface HinglishChapter {
  metadata?: { chapter_title?: string };
  sections?: HinglishSection[];
}

// ── File paths ────────────────────────────────────────────────
const EBOOK_BASE = 'D:/Nirvana sutra course/Ebooks';

function getLangDir(lang: string): string {
  if (lang === 'hi') return path.join(EBOOK_BASE, 'Hindi');
  if (lang === 'en') return path.join(EBOOK_BASE, 'English');
  return path.join(EBOOK_BASE, 'Hinglish');
}

// ── JSON loaders ──────────────────────────────────────────────
function loadHindiChapter(chapterNum: number): HindiChapter | null {
  try {
    const filePath = path.join(getLangDir('hi'), `${chapterNum}.json`);
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function loadEnglishChapter(chapterNum: number): HindiChapter | null {
  try {
    const filePath = path.join(getLangDir('en'), `${chapterNum}.json`);
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function loadHinglishChapter(chapterNum: number): HinglishChapter | null {
  try {
    const filePath = path.join(getLangDir('hl'), `${chapterNum}.json`);
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ── Design tokens ─────────────────────────────────────────────
const GOLD = '#d4a843';
const BG = '#061008';
const SURFACE = '#0d1a0f';
const BORDER = 'rgba(212,168,67,0.14)';
const MUTED = 'rgba(245,237,216,0.55)';
const IVORY = 'rgba(245,237,216,1)';
const DIVIDER = 'rgba(212,168,67,0.1)';

// ── Render helpers ─────────────────────────────────────────────
function renderMarkdownLite(text: string): string {
  // Very light markdown — bold only
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>');
}

// ── Page component ─────────────────────────────────────────────
interface PageProps {
  params: Promise<{ lang: string; chapter: string }>;
}

export default async function ChapterPage({ params }: PageProps) {
  const { lang, chapter } = await params;
  const chapterNum = parseInt(chapter, 10);
  const totalChapters = 8;
  const isHindi = lang === 'hi';
  const isHinglish = lang === 'hl';
  const isEnglish = lang === 'en';

  const bodyFont = isHindi ? 'var(--font-hind)' : 'var(--font-inter)';

  // ── Load content ─────────────────────────────────────────────
  let chapterTitle = '';
  let sections: Array<{ heading: string | null; paragraphs: string[] }> = [];
  let loadError = false;

  if (isHinglish) {
    const data = loadHinglishChapter(chapterNum);
    if (!data) {
      loadError = true;
    } else {
      chapterTitle = data.metadata?.chapter_title ?? `Chapter ${chapterNum}`;
      sections = (data.sections ?? []).map((sec) => ({
        heading: sec.section_title ?? null,
        paragraphs: (sec.elements ?? [])
          .filter((el) => el.type === 'paragraph' || el.type === 'text')
          .map((el) => el.text),
      }));
    }
  } else if (isEnglish) {
    const data = loadEnglishChapter(chapterNum);
    if (!data) {
      loadError = true;
    } else {
      chapterTitle = data.title ?? `Chapter ${chapterNum}`;
      sections = (data.khands ?? []).flatMap((khand) =>
        (khand.sections ?? []).map((sec) => ({
          heading: sec.heading ?? null,
          paragraphs: (sec.markdown ?? '')
            .split('\n\n')
            .map((p) => p.trim())
            .filter(Boolean),
        }))
      );
    }
  } else {
    // Hindi
    const data = loadHindiChapter(chapterNum);
    if (!data) {
      loadError = true;
    } else {
      chapterTitle = data.title ?? `अध्याय ${chapterNum}`;
      sections = (data.khands ?? []).flatMap((khand) =>
        (khand.sections ?? []).map((sec) => ({
          heading: sec.heading ?? null,
          paragraphs: (sec.markdown ?? '')
            .split('\n\n')
            .map((p) => p.trim())
            .filter(Boolean),
        }))
      );
    }
  }

  const prevChapter = chapterNum > 1 ? chapterNum - 1 : null;
  const nextChapterUrl = `/course/${lang}/${chapterNum}/practice`;
  const backUrl = chapterNum === 1 ? '/course' : `/course/${lang}/${chapterNum - 1}`;

  const langLabel =
    lang === 'hi' ? 'हिंदी' : lang === 'en' ? 'English' : 'Hinglish';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: BG,
        color: IVORY,
      }}
    >
      {/* ── Top sticky nav bar ──────────────────────────────── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(6,16,8,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${BORDER}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 clamp(1rem,4vw,2.5rem)',
          height: '56px',
          gap: '1rem',
        }}
      >
        {/* Left — back */}
        <Link
          href={backUrl}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: MUTED,
            textDecoration: 'none',
            fontFamily: 'var(--font-inter)',
            fontSize: '0.8rem',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          ← {chapterNum === 1 ? (isHindi ? 'पाठ्यक्रम' : 'Course') : (isHindi ? 'पिछला अध्याय' : 'Prev Chapter')}
        </Link>

        {/* Center — progress */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            flex: 1,
            maxWidth: '300px',
          }}
        >
          <span
            style={{
              fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
              fontSize: '0.75rem',
              color: GOLD,
              fontWeight: 600,
            }}
          >
            {isHindi
              ? `अध्याय ${chapterNum}/${totalChapters}`
              : `Chapter ${chapterNum}/${totalChapters}`}
          </span>
          {/* Progress bar */}
          <div
            style={{
              width: '100%',
              height: '2px',
              background: 'rgba(212,168,67,0.15)',
              borderRadius: '1px',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${(chapterNum / totalChapters) * 100}%`,
                background: `linear-gradient(90deg, ${GOLD}, #ffe89a)`,
                borderRadius: '1px',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>

        {/* Right — lang badge */}
        <div
          style={{
            padding: '0.25rem 0.7rem',
            border: `1px solid ${BORDER}`,
            borderRadius: '6px',
            color: GOLD,
            fontFamily: 'var(--font-inter)',
            fontSize: '0.7rem',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {langLabel}
        </div>
      </nav>

      {/* ── Main content ────────────────────────────────────── */}
      <main
        style={{
          maxWidth: '780px',
          margin: '0 auto',
          padding: 'clamp(2.5rem,6vw,5rem) clamp(1.25rem,5vw,2.5rem) clamp(3rem,6vw,6rem)',
        }}
      >
        {/* Chapter header */}
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.62rem',
              letterSpacing: '0.28em',
              color: GOLD,
              textTransform: 'uppercase',
              fontWeight: 700,
              marginBottom: '1rem',
            }}
          >
            {isHindi ? `अध्याय ${chapterNum}` : `Chapter ${chapterNum}`}
          </p>
          <h1
            style={{
              fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
              fontSize: isHindi
                ? 'clamp(1.8rem,5vw,2.8rem)'
                : 'clamp(2rem,5vw,3.2rem)',
              fontWeight: isHindi ? 600 : 300,
              fontStyle: isHindi ? 'normal' : 'italic',
              color: IVORY,
              lineHeight: 1.2,
              marginBottom: '1.5rem',
            }}
          >
            {loadError ? (isHindi ? `अध्याय ${chapterNum}` : `Chapter ${chapterNum}`) : chapterTitle}
          </h1>
          {/* Gold divider */}
          <div
            style={{
              width: '80px',
              height: '1px',
              background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
              margin: '0 auto',
              opacity: 0.5,
            }}
          />
        </header>

        {/* Error state */}
        {loadError && (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              border: `1px solid ${BORDER}`,
              borderRadius: '16px',
              background: SURFACE,
              marginBottom: '3rem',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-hind)',
                fontSize: '1.1rem',
                color: MUTED,
                marginBottom: '1rem',
              }}
            >
              {isHindi
                ? 'अध्याय सामग्री उपलब्ध नहीं है।'
                : 'Chapter content not available.'}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '0.8rem',
                color: 'rgba(212,168,67,0.4)',
              }}
            >
              {`Looking for: ${getLangDir(lang)}/${chapterNum}.json`}
            </p>
          </div>
        )}

        {/* Content sections */}
        {!loadError &&
          sections.map((sec, sIdx) => (
            <article
              key={sIdx}
              style={{
                marginBottom: '3rem',
                paddingBottom: '3rem',
                borderBottom:
                  sIdx < sections.length - 1 ? `1px solid ${DIVIDER}` : 'none',
              }}
            >
              {/* Section heading */}
              {sec.heading && (
                <div
                  style={{
                    background: SURFACE,
                    borderRadius: '12px',
                    padding: 'clamp(1.25rem,3vw,1.75rem)',
                    marginBottom: '1.75rem',
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <h2
                    style={{
                      fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
                      fontSize: isHindi
                        ? 'clamp(1.35rem,3vw,1.7rem)'
                        : 'clamp(1.5rem,3.5vw,2rem)',
                      fontWeight: isHindi ? 600 : 400,
                      fontStyle: isHindi ? 'normal' : 'italic',
                      color: IVORY,
                      lineHeight: 1.3,
                      margin: 0,
                    }}
                  >
                    {sec.heading}
                  </h2>
                </div>
              )}

              {/* Paragraphs */}
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '1.15em' }}
              >
                {sec.paragraphs.map((para, pIdx) => {
                  // If paragraph starts with # treat as sub-heading
                  if (para.startsWith('#')) {
                    const headingText = para.replace(/^#+\s*/, '');
                    return (
                      <h3
                        key={pIdx}
                        style={{
                          fontFamily: isHindi
                            ? 'var(--font-hind)'
                            : 'var(--font-cormorant)',
                          fontSize: isHindi ? '1.2rem' : '1.4rem',
                          fontWeight: isHindi ? 600 : 400,
                          fontStyle: isHindi ? 'normal' : 'italic',
                          color: GOLD,
                          marginTop: '0.5em',
                          lineHeight: 1.35,
                        }}
                      >
                        {headingText}
                      </h3>
                    );
                  }

                  // Blockquote style for lines starting with >
                  if (para.startsWith('>')) {
                    const quoteText = para.replace(/^>\s*/, '');
                    return (
                      <blockquote
                        key={pIdx}
                        style={{
                          borderLeft: `3px solid ${GOLD}`,
                          paddingLeft: '1.25rem',
                          margin: '0.5em 0',
                          background: 'rgba(212,168,67,0.04)',
                          borderRadius: '0 8px 8px 0',
                          padding: '0.85rem 1.25rem',
                        }}
                      >
                        <p
                          style={{
                            fontFamily: bodyFont,
                            fontSize: isHindi ? '1.05rem' : '1rem',
                            lineHeight: isHindi ? 2.0 : 1.9,
                            color: MUTED,
                            margin: 0,
                            fontStyle: 'italic',
                          }}
                          dangerouslySetInnerHTML={{
                            __html: renderMarkdownLite(quoteText),
                          }}
                        />
                      </blockquote>
                    );
                  }

                  return (
                    <p
                      key={pIdx}
                      style={{
                        fontFamily: bodyFont,
                        fontSize: isHindi ? '1.05rem' : '1rem',
                        lineHeight: isHindi ? 2.1 : 1.9,
                        color: IVORY,
                        margin: 0,
                        textAlign: isHindi ? 'left' : 'justify',
                      }}
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdownLite(para),
                      }}
                    />
                  );
                })}
              </div>
            </article>
          ))}

        {/* ── End of chapter divider ──────────────────────── */}
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <p
            style={{
              fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
              fontStyle: isHindi ? 'normal' : 'italic',
              fontSize: '1rem',
              color: 'rgba(212,168,67,0.35)',
              marginBottom: '2.5rem',
            }}
          >
            {isHindi ? '॥ अध्याय समाप्त ॥' : '∿ End of Chapter ∿'}
          </p>
        </div>

        {/* ── CTA Button ──────────────────────────────────── */}
        <div
          style={{
            padding: '2.5rem',
            border: `1px solid ${BORDER}`,
            borderRadius: '20px',
            background: 'rgba(212,168,67,0.04)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <p
            style={{
              fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
              fontSize: '0.88rem',
              color: MUTED,
            }}
          >
            {isHindi
              ? 'अध्याय पूर्ण हुआ? अब अभ्यास प्रश्नों पर जाएं।'
              : 'Chapter complete? Head to the practice questions.'}
          </p>

          {/* Client-side CTA — we use a plain anchor to avoid needing 'use client' */}
          <a
            href={nextChapterUrl}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '1rem 2.5rem',
              background: GOLD,
              color: '#061008',
              borderRadius: '12px',
              fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
              fontSize: '1rem',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.25s ease',
              boxShadow: `0 4px 20px rgba(212,168,67,0.3)`,
            }}
          >
            {isHindi
              ? 'अध्याय पूर्ण किया — अभ्यास प्रश्नों पर जाएं →'
              : `Chapter Complete — Go to Practice →`}
          </a>

          {/* Next chapter shortcut */}
          {chapterNum < totalChapters && (
            <a
              href={`/course/${lang}/${chapterNum + 1}`}
              style={{
                fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
                fontSize: '0.8rem',
                color: MUTED,
                textDecoration: 'none',
              }}
            >
              {isHindi
                ? `अगले अध्याय पर सीधे जाएं →`
                : `Skip to Chapter ${chapterNum + 1} →`}
            </a>
          )}
        </div>

        {/* Chapter nav */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '2rem',
            padding: '1rem 0',
            borderTop: `1px solid ${DIVIDER}`,
          }}
        >
          <a
            href={backUrl}
            style={{
              fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
              fontSize: '0.82rem',
              color: MUTED,
              textDecoration: 'none',
            }}
          >
            {chapterNum === 1
              ? (isHindi ? '← पाठ्यक्रम' : '← Course')
              : isHindi
              ? `← अध्याय ${chapterNum - 1}`
              : `← Chapter ${chapterNum - 1}`}
          </a>

          {/* Chapter dots */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {Array.from({ length: totalChapters }).map((_, i) => (
              <a
                key={i}
                href={`/course/${lang}/${i + 1}`}
                style={{
                  width: i + 1 === chapterNum ? '20px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background:
                    i + 1 === chapterNum
                      ? GOLD
                      : i + 1 < chapterNum
                      ? 'rgba(212,168,67,0.4)'
                      : BORDER,
                  transition: 'all 0.25s ease',
                  display: 'block',
                }}
                title={`Chapter ${i + 1}`}
              />
            ))}
          </div>

          {chapterNum < totalChapters ? (
            <a
              href={`/course/${lang}/${chapterNum + 1}`}
              style={{
                fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
                fontSize: '0.82rem',
                color: MUTED,
                textDecoration: 'none',
              }}
            >
              {isHindi ? `अध्याय ${chapterNum + 1} →` : `Chapter ${chapterNum + 1} →`}
            </a>
          ) : (
            <span style={{ width: '80px' }} />
          )}
        </div>
      </main>
    </div>
  );
}
