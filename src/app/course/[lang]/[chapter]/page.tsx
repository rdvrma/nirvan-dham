// src/app/course/[lang]/[chapter]/page.tsx
// Server component — reads JSON from project-bundled content (works on Vercel)

import fs from 'fs';
import path from 'path';
import Link from 'next/link';

// ── Types ──────────────────────────────────────────────────────
interface HindiSection { heading?: string; markdown?: string; }
interface HindiKhand { title?: string; sections?: HindiSection[]; }
interface HindiChapter { title?: string; subtitle?: string; khands?: HindiKhand[]; }
interface HinglishElement { type: string; text: string; }
interface HinglishSection { section_title?: string; elements?: HinglishElement[]; }
interface HinglishChapter { metadata?: { chapter_title?: string; subtitle?: string }; sections?: HinglishSection[]; }

// ── File paths — project-relative (works on Vercel) ───────────
const EBOOK_BASE = path.join(process.cwd(), 'src', 'content', 'course-ebooks');

function getLangDir(lang: string): string {
  if (lang === 'hi') return path.join(EBOOK_BASE, 'hi');
  if (lang === 'en') return path.join(EBOOK_BASE, 'en');
  return path.join(EBOOK_BASE, 'hl');
}

function loadChapterRaw(lang: string, chapterNum: number): unknown | null {
  try {
    const filePath = path.join(getLangDir(lang), `${chapterNum}.json`);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch { return null; }
}

function renderMarkdownLite(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>');
}

interface PageProps { params: Promise<{ lang: string; chapter: string }>; }

export default async function ChapterPage({ params }: PageProps) {
  const { lang, chapter } = await params;
  const chapterNum = parseInt(chapter, 10);
  const totalChapters = 8;
  const isHindi = lang === 'hi';
  const isEnglish = lang === 'en';
  const isHinglish = lang === 'hl';
  const bodyFont = isHindi ? 'var(--font-hind)' : 'var(--font-inter)';

  // ── Load & parse content ──────────────────────────────────────
  let chapterTitle = '';
  let chapterSubtitle = '';
  let sections: Array<{ heading: string | null; paragraphs: string[] }> = [];
  let loadError = false;

  const raw = loadChapterRaw(lang, chapterNum);

  if (!raw) {
    loadError = true;
  } else if (isHinglish) {
    const data = raw as HinglishChapter;
    chapterTitle = data.metadata?.chapter_title ?? `Chapter ${chapterNum}`;
    chapterSubtitle = data.metadata?.subtitle ?? '';
    sections = (data.sections ?? []).map(sec => ({
      heading: sec.section_title ?? null,
      paragraphs: (sec.elements ?? [])
        .filter(el => el.type === 'paragraph' || el.type === 'text' || el.type === 'p')
        .map(el => el.text),
    }));
  } else {
    const data = raw as HindiChapter;
    chapterTitle = data.title ?? (isHindi ? `अध्याय ${chapterNum}` : `Chapter ${chapterNum}`);
    chapterSubtitle = data.subtitle ?? '';
    sections = (data.khands ?? []).flatMap(khand =>
      (khand.sections ?? []).map(sec => ({
        heading: sec.heading ?? null,
        paragraphs: (sec.markdown ?? '').split('\n\n').map(p => p.trim()).filter(Boolean),
      }))
    );
  }

  const nextChapterUrl = `/course/${lang}/${chapterNum}/practice`;
  const backUrl = chapterNum === 1 ? '/course' : `/course/${lang}/${chapterNum - 1}`;
  const langLabel = lang === 'hi' ? 'हिंदी' : lang === 'en' ? 'English' : 'Hinglish';
  const progress = Math.round((chapterNum / totalChapters) * 100);

  return (
    <div style={{ minHeight: '100vh', background: '#061008', color: 'rgba(245,237,216,1)' }}>

      {/* ── Sticky top nav ──────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(6,16,8,0.97)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(212,168,67,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(1rem,4vw,2.5rem)', height: '56px', gap: '1rem',
      }}>
        <Link href={backUrl} style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          color: 'rgba(245,237,216,0.5)', textDecoration: 'none',
          fontFamily: 'var(--font-inter)', fontSize: '0.78rem', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          ←&nbsp;{chapterNum === 1
            ? (isHindi ? 'पाठ्यक्रम' : 'Course')
            : (isHindi ? `अध्याय ${chapterNum - 1}` : `Ch. ${chapterNum - 1}`)}
        </Link>

        {/* Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flex: 1, maxWidth: '280px' }}>
          <span style={{ fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)', fontSize: '0.7rem', color: '#d4a843', fontWeight: 600, letterSpacing: '0.05em' }}>
            {isHindi ? `अध्याय ${chapterNum} / ${totalChapters}` : `Chapter ${chapterNum} / ${totalChapters}`}
          </span>
          <div style={{ width: '100%', height: '2px', background: 'rgba(212,168,67,0.12)', borderRadius: '1px' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #d4a843, #ffe89a)', borderRadius: '1px', transition: 'width 0.6s ease' }} />
          </div>
        </div>

        <div style={{ padding: '0.2rem 0.65rem', border: '1px solid rgba(212,168,67,0.18)', borderRadius: '6px', color: '#d4a843', fontFamily: 'var(--font-inter)', fontSize: '0.68rem', fontWeight: 700, flexShrink: 0 }}>
          {langLabel}
        </div>
      </nav>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: 'clamp(2.5rem,6vw,5rem) clamp(1.25rem,5vw,2.5rem) clamp(3rem,6vw,7rem)' }}>

        {/* Chapter header */}
        <header style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          {/* Om symbol */}
          <div style={{ fontSize: '1.5rem', color: 'rgba(212,168,67,0.35)', marginBottom: '1rem', letterSpacing: '0.1em' }}>ॐ</div>

          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.6rem', letterSpacing: '0.3em', color: '#d4a843', textTransform: 'uppercase', fontWeight: 700, marginBottom: '1.2rem' }}>
            {isHindi ? `श्रवण · अध्याय ${chapterNum}` : `Shravana · Chapter ${chapterNum}`}
          </p>

          <h1 style={{
            fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
            fontSize: isHindi ? 'clamp(2rem,5vw,3rem)' : 'clamp(2.2rem,5vw,3.5rem)',
            fontWeight: isHindi ? 700 : 300, fontStyle: isHindi ? 'normal' : 'italic',
            color: 'rgba(245,237,216,1)', lineHeight: 1.15, marginBottom: '0.75rem',
          }}>
            {loadError ? (isHindi ? `अध्याय ${chapterNum}` : `Chapter ${chapterNum}`) : chapterTitle}
          </h1>

          {chapterSubtitle && (
            <p style={{ fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)', fontStyle: isHindi ? 'normal' : 'italic', fontSize: isHindi ? '1.1rem' : '1.2rem', color: 'rgba(245,237,216,0.5)', marginBottom: '1.5rem' }}>
              {chapterSubtitle}
            </p>
          )}

          {/* Decorative divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem' }}>
            <div style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.4))' }} />
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#d4a843', opacity: 0.6 }} />
            <div style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, rgba(212,168,67,0.4), transparent)' }} />
          </div>
        </header>

        {/* Error state */}
        {loadError && (
          <div style={{ padding: '3rem', textAlign: 'center', border: '1px solid rgba(212,168,67,0.1)', borderRadius: '16px', background: '#0d1a0f', marginBottom: '3rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.3 }}>📖</div>
            <p style={{ fontFamily: 'var(--font-hind)', fontSize: '1.05rem', color: 'rgba(245,237,216,0.5)', marginBottom: '0.5rem' }}>
              {isHindi ? 'अध्याय सामग्री उपलब्ध नहीं है।' : 'Chapter content unavailable.'}
            </p>
          </div>
        )}

        {/* Content sections */}
        {!loadError && sections.map((sec, sIdx) => (
          <article key={sIdx} style={{ marginBottom: '3.5rem', paddingBottom: '3.5rem', borderBottom: sIdx < sections.length - 1 ? '1px solid rgba(212,168,67,0.08)' : 'none' }}>

            {/* Section heading */}
            {sec.heading && (
              <div style={{ position: 'relative', marginBottom: '2rem' }}>
                <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '3px', height: '100%', background: 'linear-gradient(180deg, #d4a843, transparent)', borderRadius: '2px' }} />
                <h2 style={{
                  fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
                  fontSize: isHindi ? 'clamp(1.3rem,3vw,1.65rem)' : 'clamp(1.5rem,3.5vw,2rem)',
                  fontWeight: isHindi ? 600 : 400, fontStyle: isHindi ? 'normal' : 'italic',
                  color: 'rgba(245,237,216,0.92)', lineHeight: 1.3, margin: 0,
                  paddingLeft: '1.25rem',
                }}>
                  {sec.heading}
                </h2>
              </div>
            )}

            {/* Paragraphs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35em' }}>
              {sec.paragraphs.map((para, pIdx) => {
                if (para.startsWith('#')) {
                  const headingText = para.replace(/^#+\s*/, '');
                  return (
                    <h3 key={pIdx} style={{
                      fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
                      fontSize: isHindi ? '1.18rem' : '1.4rem', fontWeight: isHindi ? 700 : 400,
                      fontStyle: isHindi ? 'normal' : 'italic', color: '#d4a843',
                      marginTop: '0.5em', lineHeight: 1.35,
                    }}>
                      {headingText}
                    </h3>
                  );
                }
                if (para.startsWith('>')) {
                  return (
                    <blockquote key={pIdx} style={{
                      borderLeft: '3px solid #d4a843', margin: '0.5em 0',
                      background: 'rgba(212,168,67,0.04)',
                      borderRadius: '0 12px 12px 0', padding: '1rem 1.5rem',
                    }}>
                      <p style={{
                        fontFamily: bodyFont, fontSize: isHindi ? '1.05rem' : '1rem',
                        lineHeight: isHindi ? 2.1 : 1.9, color: 'rgba(245,237,216,0.7)',
                        margin: 0, fontStyle: 'italic',
                      }} dangerouslySetInnerHTML={{ __html: renderMarkdownLite(para.replace(/^>\s*/, '')) }} />
                    </blockquote>
                  );
                }
                return (
                  <p key={pIdx} style={{
                    fontFamily: bodyFont,
                    fontSize: isHindi ? '1.08rem' : '1.02rem',
                    lineHeight: isHindi ? 2.15 : 1.95,
                    color: 'rgba(245,237,216,0.9)', margin: 0,
                    textAlign: isEnglish ? 'justify' : 'left',
                  }} dangerouslySetInnerHTML={{ __html: renderMarkdownLite(para) }} />
                );
              })}
            </div>
          </article>
        ))}

        {/* ── End of chapter ───────────────────────────────────── */}
        {!loadError && (
          <>
            <div style={{ textAlign: 'center', padding: '2rem 0 3rem' }}>
              <p style={{ fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)', fontStyle: isHindi ? 'normal' : 'italic', fontSize: isHindi ? '1rem' : '1.1rem', color: 'rgba(212,168,67,0.35)' }}>
                {isHindi ? '॥ अध्याय समाप्त ॥' : isHinglish ? '॥ Adhyay Samaapt ॥' : '∿ End of Chapter ∿'}
              </p>
            </div>

            {/* CTA card */}
            <div style={{
              padding: 'clamp(2rem,4vw,3rem)',
              border: '1px solid rgba(212,168,67,0.15)',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(13,26,15,0.9), rgba(18,36,20,0.6))',
              textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem',
              boxShadow: '0 0 60px rgba(212,168,67,0.04), inset 0 1px 0 rgba(212,168,67,0.08)',
            }}>
              <div style={{ fontSize: '2rem' }}>🙏</div>
              <p style={{ fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)', fontStyle: isHindi ? 'normal' : 'italic', fontSize: isHindi ? '1rem' : '1.15rem', color: 'rgba(245,237,216,0.6)', maxWidth: '420px', lineHeight: 1.7 }}>
                {isHindi
                  ? 'अध्याय पूर्ण हुआ। अब इन शिक्षाओं को अभ्यास प्रश्नों के माध्यम से जाँचें।'
                  : isHinglish
                  ? 'Adhyay poora hua. Ab in shiksha ko practice questions ke zariye janchen.'
                  : 'Chapter complete. Now test your understanding through practice questions.'}
              </p>
              <a href={nextChapterUrl} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                padding: '1rem 2.5rem',
                background: '#d4a843', color: '#061008',
                borderRadius: '14px', fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
                fontSize: '1rem', fontWeight: 700, textDecoration: 'none',
                boxShadow: '0 4px 24px rgba(212,168,67,0.35)',
                letterSpacing: isHindi ? '0.02em' : '0.01em',
              }}>
                {isHindi ? 'अभ्यास प्रश्नों पर जाएं →' : isHinglish ? 'Practice Questions par Jaayein →' : 'Go to Practice Questions →'}
              </a>

              {chapterNum < totalChapters && (
                <a href={`/course/${lang}/${chapterNum + 1}`} style={{ fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)', fontSize: '0.78rem', color: 'rgba(245,237,216,0.35)', textDecoration: 'none' }}>
                  {isHindi ? `सीधे अध्याय ${chapterNum + 1} पर जाएं →` : `Skip to Chapter ${chapterNum + 1} →`}
                </a>
              )}
            </div>
          </>
        )}

        {/* Chapter dots nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', padding: '1.25rem 0', borderTop: '1px solid rgba(212,168,67,0.07)' }}>
          <a href={backUrl} style={{ fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)', fontSize: '0.8rem', color: 'rgba(245,237,216,0.4)', textDecoration: 'none' }}>
            {chapterNum === 1 ? (isHindi ? '← पाठ्यक्रम' : '← Course') : isHindi ? `← अध्याय ${chapterNum - 1}` : `← Chapter ${chapterNum - 1}`}
          </a>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {Array.from({ length: totalChapters }).map((_, i) => (
              <a key={i} href={`/course/${lang}/${i + 1}`} style={{
                width: i + 1 === chapterNum ? '22px' : '7px', height: '7px', borderRadius: '4px',
                background: i + 1 === chapterNum ? '#d4a843' : i + 1 < chapterNum ? 'rgba(212,168,67,0.4)' : 'rgba(212,168,67,0.12)',
                transition: 'all 0.25s ease', display: 'block',
              }} title={`Chapter ${i + 1}`} />
            ))}
          </div>
          {chapterNum < totalChapters ? (
            <a href={`/course/${lang}/${chapterNum + 1}`} style={{ fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)', fontSize: '0.8rem', color: 'rgba(245,237,216,0.4)', textDecoration: 'none' }}>
              {isHindi ? `अध्याय ${chapterNum + 1} →` : `Chapter ${chapterNum + 1} →`}
            </a>
          ) : <span style={{ width: '80px' }} />}
        </div>
      </main>
    </div>
  );
}
