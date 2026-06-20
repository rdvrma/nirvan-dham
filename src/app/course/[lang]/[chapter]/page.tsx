// src/app/course/[lang]/[chapter]/page.tsx
// Server component — reads project-bundled ebooks (works on Vercel)

import fs from 'fs';
import path from 'path';
import Link from 'next/link';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Section { heading: string | null; paragraphs: string[] }

interface HindiKhand { title?: string; sections?: { heading?: string; markdown?: string }[] }
interface HindiChapter { title?: string; subtitle?: string; author?: string; khands?: HindiKhand[] }

// English JSON has SAME structure as Hinglish: { metadata, sections: [{section_title, elements}] }
interface ElementNode { type: string; text?: string; content?: string }
interface HinglishSection { section_title?: string; heading?: string; title?: string; content?: string; elements?: ElementNode[]; blocks?: string[] }
interface HinglishChapter { metadata?: { chapter_title?: string; subtitle?: string; title?: string }; sections?: HinglishSection[] }

// ── Constants ─────────────────────────────────────────────────────────────────
const EBOOK_BASE = path.join(process.cwd(), 'src', 'content', 'course-ebooks');
const TOTAL_CHAPTERS = 8;

// Chapter names for display
const CHAPTER_NAMES: Record<string, Record<number, string>> = {
  hi: {
    1: 'स्वयं की खोज', 2: 'मन की परतें', 3: 'साक्षी बोध',
    4: 'अहंकार की जड़', 5: 'माया का खेल', 6: 'ध्यान का द्वार',
    7: 'मुक्ति की राह', 8: 'निर्वाण सूत्र'
  },
  en: {
    1: 'The Discovery of Self', 2: 'Layers of the Mind', 3: 'Witness Awareness',
    4: 'The Root of Ego', 5: 'The Play of Maya', 6: 'Gateway of Meditation',
    7: 'Path of Liberation', 8: 'Nirvan Sutra'
  },
  hl: {
    1: 'Swayam Ki Khoj', 2: 'Mann Ki Partein', 3: 'Sakshi Bodh',
    4: 'Ahankar Ki Jad', 5: 'Maya Ka Khel', 6: 'Dhyan Ka Dwar',
    7: 'Mukti Ki Raah', 8: 'Nirvan Sutra'
  }
};

function loadChapter(lang: string, num: number): { title: string; subtitle: string; sections: Section[] } | null {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(EBOOK_BASE, lang, `${num}.json`), 'utf-8'));

    // Hindi: has khands array with nested sections
    if (lang === 'hi' && raw.khands) {
      const d = raw as HindiChapter;
      return {
        title: d.title ?? `अध्याय ${num}`,
        subtitle: d.subtitle ?? '',
        sections: (d.khands ?? []).flatMap(k =>
          (k.sections ?? []).map(s => ({
            heading: s.heading ?? null,
            paragraphs: (s.markdown ?? '').split('\n\n').map(p => p.trim()).filter(Boolean),
          }))
        ),
      };
    }

    // English & Hinglish & some Hindi chapters: { metadata, sections: [{section_title/heading/title, elements/content/blocks}] }
    const d = raw as HinglishChapter;
    const fallbackTitle = lang === 'en'
      ? `Chapter ${num}`
      : `Adhyay ${num}`;
    return {
      title: d.metadata?.chapter_title ?? d.metadata?.title ?? raw.title ?? fallbackTitle,
      subtitle: d.metadata?.subtitle ?? raw.subtitle ?? '',
      sections: (d.sections ?? []).map(s => ({
        heading: s.section_title ?? s.heading ?? s.title ?? null,
        paragraphs: s.blocks
          ? s.blocks
          : s.elements 
            ? s.elements
                .filter(el => ['paragraph', 'text', 'p', 'body'].includes(el.type))
                .map(el => (el.text ?? el.content ?? '').trim())
                .filter(Boolean)
            : s.content
                ? s.content.split('\n\n').map(p => p.trim()).filter(Boolean)
                : [],
      })),
    };
  } catch {
    return null;
  }
}

function renderMd(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>');
}

// ── Page ──────────────────────────────────────────────────────────────────────
interface PageProps { params: Promise<{ lang: string; chapter: string }> }

export default async function ChapterPage({ params }: PageProps) {
  const { lang, chapter } = await params;
  const chapterNum = parseInt(chapter, 10);

  const isHindi = lang === 'hi';
  const isHinglish = lang === 'hl';
  const langLabel = lang === 'hi' ? 'हिंदी' : lang === 'en' ? 'English' : 'Hinglish';
  const bodyFont = isHindi ? 'var(--font-hind)' : 'var(--font-inter)';

  const data = loadChapter(lang, chapterNum);
  const loadError = !data || data.sections.length === 0;
  const chapterTitle = data?.title ?? CHAPTER_NAMES[lang]?.[chapterNum] ?? `Chapter ${chapterNum}`;
  const chapterSubtitle = data?.subtitle ?? '';
  const sections = data?.sections ?? [];

  const backUrl = chapterNum === 1 ? '/course' : `/course/${lang}/${chapterNum - 1}`;
  const practiceUrl = `/course/${lang}/${chapterNum}/practice`;
  const pdfPath = `/course-pdfs/${lang}-${chapterNum}.pdf`;
  const videoPath = `/course-videos/chapter-${chapterNum}.mp4`;
  const progress = Math.round((chapterNum / TOTAL_CHAPTERS) * 100);

  const chapterLabel = isHindi
    ? `अध्याय ${chapterNum}`
    : isHinglish
    ? `Adhyay ${chapterNum}`
    : `Chapter ${chapterNum}`;

  return (
    <div style={{ minHeight: '100vh', background: '#050e07', color: 'rgba(245,237,216,1)' }}>

      {/* ── Sticky nav ───────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(5,14,7,0.96)', backdropFilter: 'blur(28px)',
        borderBottom: '1px solid rgba(212,168,67,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(1rem,4vw,2.5rem)', height: '54px', gap: '1rem',
      }}>
        <Link href={backUrl} style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          color: 'rgba(245,237,216,0.45)', textDecoration: 'none',
          fontFamily: 'var(--font-inter)', fontSize: '0.76rem', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          ←&nbsp;{chapterNum === 1
            ? (isHindi ? 'पाठ्यक्रम' : isHinglish ? 'Course' : 'Course')
            : (isHindi ? `अध्याय ${chapterNum - 1}` : `Ch. ${chapterNum - 1}`)}
        </Link>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1, maxWidth: '260px' }}>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.65rem', color: '#d4a843', fontWeight: 600, letterSpacing: '0.08em' }}>
            {chapterLabel} / {TOTAL_CHAPTERS}
          </span>
          <div style={{ width: '100%', height: '2px', background: 'rgba(212,168,67,0.1)', borderRadius: '1px' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#d4a843,#ffe89a)', borderRadius: '1px' }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {/* Lexicon quick link */}
          <a href={`/course/${lang}/lexicon`} style={{
            padding: '0.3rem 0.7rem', border: '1px solid rgba(212,168,67,0.2)', borderRadius: '7px',
            color: 'rgba(212,168,67,0.6)', fontFamily: 'var(--font-inter)', fontSize: '0.62rem',
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem',
            whiteSpace: 'nowrap',
          }}>
            📖 {isHindi ? 'शब्दकोश' : isHinglish ? 'Lexicon' : 'Lexicon'}
          </a>
          {/* PDF download — prominent */}
          <a href={pdfPath} download style={{
            padding: '0.42rem 1rem', borderRadius: '8px',
            background: '#d4a843', color: '#050e07',
            fontFamily: 'var(--font-inter)', fontSize: '0.75rem', fontWeight: 700,
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem',
            boxShadow: '0 2px 10px rgba(212,168,67,0.3)', whiteSpace: 'nowrap',
          }}>
            ⬇ PDF
          </a>
          <div style={{ padding: '0.28rem 0.65rem', border: '1px solid rgba(212,168,67,0.2)', borderRadius: '7px', color: '#d4a843', fontFamily: 'var(--font-inter)', fontSize: '0.65rem', fontWeight: 700 }}>
            {langLabel}
          </div>
        </div>
      </nav>

      {/* ── Hero Video Banner ─────────────────────────────────────── */}
      <div style={{ position: 'relative', height: 'clamp(280px,45vw,520px)', overflow: 'hidden' }}>
        <video
          autoPlay muted loop playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }}
          src={videoPath}
        />
        {/* Deep gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(5,14,7,0.2) 0%, rgba(5,14,7,0.1) 40%, rgba(5,14,7,0.85) 80%, rgba(5,14,7,1) 100%)',
        }} />
        {/* Side vignette */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(5,14,7,0.6) 0%, transparent 30%, transparent 70%, rgba(5,14,7,0.6) 100%)' }} />

        {/* Hero text centered in video */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          padding: '2rem',
        }}>
          {/* Chapter label */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.3rem 1rem', borderRadius: '100px',
            border: '1px solid rgba(212,168,67,0.3)',
            background: 'rgba(5,14,7,0.5)', backdropFilter: 'blur(8px)',
            marginBottom: '1.5rem',
          }}>
            <span style={{ display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', background: '#d4a843' }} />
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.6rem', letterSpacing: '0.28em', color: '#d4a843', textTransform: 'uppercase', fontWeight: 600 }}>
              {isHindi ? 'श्रवण · ' : 'Shravana · '}{chapterLabel}
            </span>
          </div>

          <h1 style={{
            fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
            fontSize: isHindi ? 'clamp(2rem,6vw,3.5rem)' : 'clamp(2.2rem,6vw,4rem)',
            fontWeight: isHindi ? 700 : 300, fontStyle: isHindi ? 'normal' : 'italic',
            color: 'rgba(245,237,216,1)', lineHeight: 1.1, marginBottom: '0.75rem',
            textShadow: '0 2px 20px rgba(0,0,0,0.5)',
          }}>
            {loadError ? chapterLabel : chapterTitle}
          </h1>

          {chapterSubtitle && (
            <p style={{
              fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
              fontStyle: isHindi ? 'normal' : 'italic',
              fontSize: 'clamp(0.9rem,2vw,1.15rem)', color: 'rgba(245,237,216,0.6)',
            }}>
              {chapterSubtitle}
            </p>
          )}
        </div>
      </div>

      {/* ── Reading area ──────────────────────────────────────────── */}
      <main style={{ maxWidth: '780px', margin: '0 auto', padding: 'clamp(3rem,6vw,5rem) clamp(1.25rem,5vw,2.5rem) clamp(4rem,8vw,8rem)' }}>

        {/* Golden divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.25))' }} />
          <span style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '1.1rem', color: 'rgba(212,168,67,0.5)' }}>ॐ</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(212,168,67,0.25), transparent)' }} />
        </div>

        {/* Error fallback */}
        {loadError && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'rgba(245,237,216,0.35)' }}>
            <p style={{ fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)', fontSize: '1rem' }}>
              {isHindi ? 'सामग्री लोड नहीं हो सकी।' : 'Content could not be loaded.'}
            </p>
          </div>
        )}

        {/* Content sections — blog style */}
        {!loadError && sections.map((sec, sIdx) => (
          <article key={sIdx} style={{
            marginBottom: '3.5rem', paddingBottom: '3.5rem',
            borderBottom: sIdx < sections.length - 1 ? '1px solid rgba(212,168,67,0.07)' : 'none',
          }}>
            {sec.heading && (
              <h2 style={{
                fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
                fontSize: isHindi ? 'clamp(1.3rem,3vw,1.6rem)' : 'clamp(1.6rem,3.5vw,2.1rem)',
                fontWeight: isHindi ? 700 : 400, fontStyle: isHindi ? 'normal' : 'italic',
                color: 'rgba(245,237,216,0.92)', lineHeight: 1.3, marginBottom: '1.75rem',
                paddingLeft: '1rem', borderLeft: '3px solid #d4a843',
              }}>
                {sec.heading}
              </h2>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5em' }}>
              {sec.paragraphs.map((para, pIdx) => {
                const cleaned = para.replace(/^#+\s*/, '');
                if (para.startsWith('#')) {
                  return (
                    <h3 key={pIdx} style={{
                      fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
                      fontSize: isHindi ? '1.2rem' : '1.45rem',
                      fontWeight: isHindi ? 600 : 400, fontStyle: isHindi ? 'normal' : 'italic',
                      color: '#d4a843', lineHeight: 1.4, marginTop: '0.5em',
                    }}>
                      {cleaned}
                    </h3>
                  );
                }
                if (para.startsWith('>')) {
                  return (
                    <blockquote key={pIdx} style={{
                      margin: '1em 0', padding: '1.25rem 1.75rem',
                      borderLeft: '3px solid rgba(212,168,67,0.5)',
                      background: 'rgba(212,168,67,0.04)',
                      borderRadius: '0 12px 12px 0',
                    }}>
                      <p style={{
                        fontFamily: bodyFont, fontSize: isHindi ? '1.05rem' : '1.05rem',
                        lineHeight: isHindi ? 2.1 : 1.9, color: 'rgba(245,237,216,0.65)',
                        margin: 0, fontStyle: 'italic',
                      }} dangerouslySetInnerHTML={{ __html: renderMd(para.replace(/^>\s*/, '')) }} />
                    </blockquote>
                  );
                }
                return (
                  <p key={pIdx} style={{
                    fontFamily: bodyFont,
                    fontSize: isHindi ? '1.1rem' : '1.05rem',
                    lineHeight: isHindi ? 2.2 : 1.95,
                    color: 'rgba(245,237,216,0.88)', margin: 0,
                    textAlign: lang === 'en' ? 'justify' : 'left',
                    letterSpacing: isHindi ? '0.01em' : '0',
                  }} dangerouslySetInnerHTML={{ __html: renderMd(para) }} />
                );
              })}
            </div>
          </article>
        ))}

        {/* End of chapter */}
        {!loadError && (
          <>
            <div style={{ textAlign: 'center', padding: '2rem 0 3.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                <div style={{ height: '1px', width: '50px', background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.3))' }} />
                <p style={{
                  fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
                  fontStyle: isHindi ? 'normal' : 'italic', fontSize: '1rem',
                  color: 'rgba(212,168,67,0.3)', margin: 0,
                }}>
                  {isHindi ? '॥ अध्याय समाप्त ॥' : isHinglish ? '॥ Adhyay Samaapt ॥' : '∿ End of Chapter ∿'}
                </p>
                <div style={{ height: '1px', width: '50px', background: 'linear-gradient(90deg, rgba(212,168,67,0.3), transparent)' }} />
              </div>
            </div>

            {/* PDF + Practice CTA card */}
            <div style={{
              padding: 'clamp(2rem,4vw,3rem)',
              border: '1px solid rgba(212,168,67,0.12)',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(13,26,15,0.95), rgba(20,40,22,0.7))',
              boxShadow: '0 0 80px rgba(212,168,67,0.04), inset 0 1px 0 rgba(212,168,67,0.08)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '1.25rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: '2rem' }}>🙏</div>

              <h3 style={{
                fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
                fontStyle: isHindi ? 'normal' : 'italic',
                fontSize: isHindi ? '1.2rem' : '1.4rem',
                fontWeight: isHindi ? 700 : 400, color: 'rgba(245,237,216,0.9)', margin: 0,
              }}>
                {isHindi ? 'अध्याय पूर्ण हुआ' : isHinglish ? 'Adhyay Poora Hua' : 'Chapter Complete'}
              </h3>

              <p style={{
                fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
                fontStyle: isHindi ? 'normal' : 'italic',
                fontSize: isHindi ? '0.95rem' : '1.05rem',
                color: 'rgba(245,237,216,0.5)', maxWidth: '380px', lineHeight: 1.8, margin: 0,
              }}>
                {isHindi
                  ? 'इन शिक्षाओं को अभ्यास प्रश्नों द्वारा गहरा करें।'
                  : isHinglish
                  ? 'In shiksha ko practice questions ke zariye gehra karein.'
                  : 'Deepen these teachings through practice questions.'}
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.25rem' }}>
                {/* PDF Download */}
                <a href={pdfPath} download style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.8rem 1.5rem',
                  border: '1px solid rgba(212,168,67,0.25)',
                  background: 'rgba(212,168,67,0.06)',
                  borderRadius: '12px',
                  color: 'rgba(212,168,67,0.8)',
                  fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
                  fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none',
                }}>
                  ↓ {isHindi ? 'PDF डाउनलोड करें' : isHinglish ? 'PDF Download Karein' : 'Download PDF'}
                </a>

                {/* Practice CTA */}
                <a href={practiceUrl} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.85rem 2rem',
                  background: '#d4a843', color: '#050e07',
                  borderRadius: '12px',
                  fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
                  fontSize: '0.95rem', fontWeight: 700, textDecoration: 'none',
                  boxShadow: '0 4px 20px rgba(212,168,67,0.3)',
                }}>
                  {isHindi ? 'अभ्यास प्रश्न →' : isHinglish ? 'Practice Questions →' : 'Practice Questions →'}
                </a>
              </div>

              {chapterNum < TOTAL_CHAPTERS && (
                <a href={`/course/${lang}/${chapterNum + 1}`} style={{
                  fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
                  fontSize: '0.75rem', color: 'rgba(245,237,216,0.3)', textDecoration: 'none',
                }}>
                  {isHindi ? `सीधे अध्याय ${chapterNum + 1} पर →` : `Skip to Chapter ${chapterNum + 1} →`}
                </a>
              )}
            </div>
          </>
        )}

        {/* Chapter dots nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(212,168,67,0.06)' }}>
          <a href={backUrl} style={{ fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)', fontSize: '0.78rem', color: 'rgba(245,237,216,0.35)', textDecoration: 'none' }}>
            {chapterNum === 1
              ? (isHindi ? '← पाठ्यक्रम' : '← Course')
              : (isHindi ? `← अध्याय ${chapterNum - 1}` : `← Ch. ${chapterNum - 1}`)}
          </a>

          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            {Array.from({ length: TOTAL_CHAPTERS }).map((_, i) => (
              <a key={i} href={`/course/${lang}/${i + 1}`} style={{
                width: i + 1 === chapterNum ? '22px' : '7px', height: '7px', borderRadius: '4px',
                background: i + 1 === chapterNum ? '#d4a843' : i + 1 < chapterNum ? 'rgba(212,168,67,0.4)' : 'rgba(212,168,67,0.1)',
                transition: 'all 0.3s', display: 'block',
              }} title={`Chapter ${i + 1}`} />
            ))}
          </div>

          {chapterNum < TOTAL_CHAPTERS
            ? <a href={`/course/${lang}/${chapterNum + 1}`} style={{ fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)', fontSize: '0.78rem', color: 'rgba(245,237,216,0.35)', textDecoration: 'none' }}>
                {isHindi ? `अध्याय ${chapterNum + 1} →` : `Ch. ${chapterNum + 1} →`}
              </a>
            : <span style={{ width: '60px' }} />}
        </div>
      </main>
    </div>
  );
}
