// src/app/course/[lang]/lexicon/page.tsx
// Terminology Lexicon — opens before Chapter 1

import fs from 'fs';
import path from 'path';
import Link from 'next/link';

interface LexiconTerm {
  id: number;
  term: string;
  transliteration?: string;
  meaning_in_course: string;
  scriptural_note?: string;
  relationship?: string;
}

interface Distinction {
  title: string;
  body: string;
}

interface LexiconData {
  title?: string;
  purpose?: string;
  terms: LexiconTerm[];
  important_distinctions?: Distinction[];
  final_reminder?: string;
}

const LEXICON_BASE = path.join(process.cwd(), 'src', 'content', 'course-lexicon');

function loadLexicon(lang: string): LexiconData | null {
  try {
    const raw = fs.readFileSync(path.join(LEXICON_BASE, `${lang}.json`), 'utf-8');
    return JSON.parse(raw) as LexiconData;
  } catch { return null; }
}

interface PageProps { params: Promise<{ lang: string }> }

export default async function LexiconPage({ params }: PageProps) {
  const { lang } = await params;
  const data = loadLexicon(lang);
  const isHindi = lang === 'hi';
  const isHinglish = lang === 'hl';

  const langLabel = isHindi ? 'हिंदी' : isHinglish ? 'Hinglish' : 'English';
  const bodyFont = isHindi ? 'var(--font-hind)' : 'var(--font-inter)';
  const pdfPath = `/course-pdfs/lexicon-${lang}.pdf`;

  const title = data?.title ?? (isHindi ? 'शब्द और परिभाषाएं' : isHinglish ? 'Shabd aur Paribhashayein' : 'Terminology & Definitions');
  const purpose = data?.purpose;

  return (
    <div className={`course-theme`} style={{ minHeight: '100vh' }}>

      {/* ── Sticky Nav ─────────────────────────────────────────── */}
      <nav className="course-nav">
        <Link href="/course" className="course-nav-back">
          ← {isHindi ? 'पाठ्यक्रम' : 'Course'}
        </Link>

        <div className="course-nav-center">
          <span className="course-nav-label">
            {isHindi ? 'शब्द-कोश' : isHinglish ? 'Shabd-Kosh' : 'Lexicon'} · {langLabel}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          {/* PDF Download — prominent */}
          <a href={pdfPath} download className="pdf-btn-prominent">
            <span className="pdf-icon">⬇</span>
            <span>{isHindi ? 'PDF डाउनलोड' : isHinglish ? 'PDF Download' : 'Download PDF'}</span>
          </a>
          {/* Language Switcher */}
          <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(212,168,67,0.06)', borderRadius: '8px', padding: '0.2rem', border: '1px solid rgba(212,168,67,0.12)' }}>
            {[{ code: 'hi', label: 'हिं' }, { code: 'en', label: 'En' }, { code: 'hl', label: 'Hl' }].map(l => (
              <Link
                key={l.code}
                href={`/course/${l.code}/lexicon`}
                style={{
                  padding: '0.25rem 0.55rem',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.03em',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  background: lang === l.code ? 'rgba(212,168,67,0.18)' : 'transparent',
                  color: lang === l.code ? '#d4a843' : 'rgba(245,237,216,0.35)',
                  border: lang === l.code ? '1px solid rgba(212,168,67,0.3)' : '1px solid transparent',
                }}
              >{l.label}</Link>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <div className="lexicon-hero">
        <div className="lexicon-hero-glow" />
        <div className="lexicon-hero-content">
          <div className="lexicon-om">ॐ</div>
          <div className="breadcrumb-pill">
            <span className="breadcrumb-dot" />
            {isHindi ? 'श्रवण · प्रारंभ' : isHinglish ? 'Shravana · Shuruat' : 'Shravana · Begin'}
          </div>
          <h1 className="lexicon-title">{title}</h1>
          {purpose && <p className="lexicon-purpose">{purpose}</p>}
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="lexicon-main">

        {/* Terms grid */}
        {data?.terms && data.terms.length > 0 && (
          <section className="lexicon-section">
            <div className="section-divider">
              <div className="divider-line" />
              <span className="divider-label">
                {isHindi ? 'मुख्य शब्द' : isHinglish ? 'Mukhya Shabd' : 'Core Terms'}
              </span>
              <div className="divider-line" />
            </div>

            <div className="terms-grid">
              {data.terms.map((term) => (
                <div key={term.id} className="term-card">
                  <div className="term-header">
                    <div>
                      <div className="term-word" style={{ fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)' }}>
                        {term.term}
                      </div>
                      {term.transliteration && (
                        <div className="term-transliteration">{term.transliteration}</div>
                      )}
                    </div>
                    <div className="term-num">{String(term.id).padStart(2, '0')}</div>
                  </div>

                  <p className="term-meaning" style={{ fontFamily: bodyFont }}>
                    {term.meaning_in_course}
                  </p>

                  {term.scriptural_note && (
                    <blockquote className="term-note" style={{ fontFamily: bodyFont }}>
                      {term.scriptural_note}
                    </blockquote>
                  )}

                  {term.relationship && (
                    <p className="term-relation" style={{ fontFamily: bodyFont }}>
                      <span className="relation-label">
                        {isHindi ? 'संबंध: ' : isHinglish ? 'Sambandh: ' : 'Relation: '}
                      </span>
                      {term.relationship}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Important distinctions */}
        {data?.important_distinctions && data.important_distinctions.length > 0 && (
          <section className="lexicon-section" style={{ marginTop: '3rem' }}>
            <div className="section-divider">
              <div className="divider-line" />
              <span className="divider-label">
                {isHindi ? 'महत्वपूर्ण अंतर' : isHinglish ? 'Mahatvapurn Antar' : 'Important Distinctions'}
              </span>
              <div className="divider-line" />
            </div>

            <div className="distinctions-list">
              {data.important_distinctions.map((d, i) => (
                <div key={i} className="distinction-card">
                  <h3 className="distinction-title">{d.title}</h3>
                  <p className="distinction-body" style={{ fontFamily: bodyFont }}>{d.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Final reminder */}
        {data?.final_reminder && (
          <div className="final-reminder">
            <div className="reminder-icon">🙏</div>
            <p className="reminder-text" style={{ fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)' }}>
              {data.final_reminder}
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="lexicon-cta">
          <div className="cta-card">
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📖</div>
            <h3 className="cta-heading" style={{ fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)' }}>
              {isHindi ? 'अब अध्ययन शुरू करें' : isHinglish ? 'Ab Adhyayan Shuru Karein' : 'Begin Your Study'}
            </h3>
            <p className="cta-sub" style={{ fontFamily: bodyFont }}>
              {isHindi ? 'इन शब्दों को ध्यान में रखते हुए पहले अध्याय की ओर बढ़ें।' :
               isHinglish ? 'In shabdon ko dhyan mein rakhte hue pehle adhyay ki or badhein.' :
               'Keep these terms in mind as you begin the first chapter.'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <a href={pdfPath} download className="pdf-btn-cta">
                ⬇ {isHindi ? 'शब्दकोश PDF सहेजें' : isHinglish ? 'Lexicon PDF Saachein' : 'Save Lexicon PDF'}
              </a>
              <a href={`/course/${lang}/1`} className="next-btn-cta">
                {isHindi ? 'अध्याय 1 शुरू करें →' : isHinglish ? 'Adhyay 1 Shuru Karein →' : 'Start Chapter 1 →'}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="bottom-nav">
          <Link href="/course" className="bottom-nav-link">← {isHindi ? 'पाठ्यक्रम' : 'Course'}</Link>
          <a href={`/course/${lang}/1`} className="bottom-nav-link">
            {isHindi ? 'अध्याय 1 →' : isHinglish ? 'Adhyay 1 →' : 'Chapter 1 →'}
          </a>
        </div>
      </main>

      <style>{`
        /* ── Theme Variables ─────────────────────────────────── */
        :root {
          --c-bg: #f7f4ee;
          --c-surface: #ffffff;
          --c-surface2: #f0ece3;
          --c-border: rgba(160,120,40,0.18);
          --c-gold: #b8860b;
          --c-gold-light: rgba(184,134,11,0.12);
          --c-text: #1a1208;
          --c-text-muted: rgba(26,18,8,0.55);
          --c-text-dim: rgba(26,18,8,0.35);
          --c-nav-bg: rgba(247,244,238,0.96);
          --c-nav-border: rgba(160,120,40,0.12);
          --shadow-card: 0 2px 20px rgba(0,0,0,0.06);
        }
        .dark-theme {
          --c-bg: #050e07;
          --c-surface: rgba(12,24,14,0.9);
          --c-surface2: rgba(20,40,22,0.7);
          --c-border: rgba(212,168,67,0.15);
          --c-gold: #d4a843;
          --c-gold-light: rgba(212,168,67,0.08);
          --c-text: rgba(245,237,216,1);
          --c-text-muted: rgba(245,237,216,0.55);
          --c-text-dim: rgba(245,237,216,0.28);
          --c-nav-bg: rgba(5,14,7,0.96);
          --c-nav-border: rgba(212,168,67,0.1);
          --shadow-card: 0 4px 30px rgba(0,0,0,0.3);
        }

        /* ── Base ───────────────────────────────────────────── */
        .course-theme { background: var(--c-bg); color: var(--c-text); transition: background 0.3s, color 0.3s; }

        /* ── Nav ─────────────────────────────────────────────── */
        .course-nav {
          position: sticky; top: 0; z-index: 50;
          background: var(--c-nav-bg); backdrop-filter: blur(28px);
          border-bottom: 1px solid var(--c-nav-border);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 clamp(1rem,4vw,2.5rem); height: 58px; gap: 1rem;
        }
        .course-nav-back {
          color: var(--c-text-dim); text-decoration: none;
          font-family: var(--font-inter); font-size: 0.76rem;
          white-space: nowrap; flex-shrink: 0;
          transition: color 0.2s;
        }
        .course-nav-back:hover { color: var(--c-gold); }
        .course-nav-center { flex: 1; display: flex; justify-content: center; }
        .course-nav-label {
          font-family: var(--font-inter); font-size: 0.62rem;
          letter-spacing: 0.16em; color: var(--c-gold); font-weight: 700;
          text-transform: uppercase;
        }
        .lang-pill {
          padding: 0.25rem 0.7rem; border: 1px solid var(--c-border);
          border-radius: 6px; color: var(--c-gold);
          font-family: var(--font-inter); font-size: 0.65rem; font-weight: 700;
        }

        /* ── PDF Button — Prominent ──────────────────────────── */
        .pdf-btn-prominent {
          display: inline-flex; align-items: center; gap: 0.45rem;
          padding: 0.48rem 1.1rem;
          background: var(--c-gold); color: #050e07;
          border-radius: 8px; text-decoration: none;
          font-family: var(--font-inter); font-size: 0.78rem; font-weight: 700;
          box-shadow: 0 2px 12px rgba(184,134,11,0.3);
          transition: all 0.2s; white-space: nowrap;
        }
        .pdf-btn-prominent:hover { transform: translateY(-1px); box-shadow: 0 4px 18px rgba(184,134,11,0.4); }
        .pdf-icon { font-size: 0.9rem; }

        /* ── Hero ────────────────────────────────────────────── */
        .lexicon-hero {
          position: relative; padding: clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,3rem) clamp(3.5rem,6vw,5rem);
          text-align: center; overflow: hidden;
          border-bottom: 1px solid var(--c-border);
        }
        .lexicon-hero-glow {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse 70% 60% at 50% 0%, rgba(184,134,11,0.08) 0%, transparent 70%);
        }
        .dark-theme .lexicon-hero-glow {
          background: radial-gradient(ellipse 70% 60% at 50% 0%, rgba(212,168,67,0.1) 0%, transparent 70%);
        }
        .lexicon-hero-content { position: relative; z-index: 1; }
        .lexicon-om {
          font-family: var(--font-hind); font-size: 2.5rem;
          color: var(--c-gold); opacity: 0.4; margin-bottom: 1.25rem;
          line-height: 1;
        }
        .breadcrumb-pill {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.28rem 1rem; border-radius: 100px;
          border: 1px solid var(--c-border);
          background: var(--c-gold-light);
          font-family: var(--font-inter); font-size: 0.58rem;
          letter-spacing: 0.22em; color: var(--c-gold); font-weight: 600;
          text-transform: uppercase; margin-bottom: 1.5rem;
        }
        .breadcrumb-dot {
          width: 4px; height: 4px; border-radius: 50%; background: var(--c-gold);
        }
        .lexicon-title {
          font-family: var(--font-cormorant); font-style: italic;
          font-size: clamp(2.2rem,6vw,3.8rem); font-weight: 300;
          color: var(--c-text); line-height: 1.1; margin-bottom: 1rem;
        }
        .lexicon-purpose {
          font-family: var(--font-inter); font-size: clamp(0.85rem,1.5vw,1rem);
          color: var(--c-text-muted); max-width: 600px; margin: 0 auto;
          line-height: 1.8;
        }

        /* ── Main layout ─────────────────────────────────────── */
        .lexicon-main { max-width: 900px; margin: 0 auto; padding: clamp(2.5rem,5vw,4rem) clamp(1.25rem,4vw,2.5rem) clamp(4rem,8vw,7rem); }
        .lexicon-section {}

        /* ── Divider ─────────────────────────────────────────── */
        .section-divider {
          display: flex; align-items: center; gap: 1rem;
          margin-bottom: 2.5rem;
        }
        .divider-line { flex: 1; height: 1px; background: var(--c-border); }
        .divider-label {
          font-family: var(--font-inter); font-size: 0.58rem;
          letter-spacing: 0.26em; color: var(--c-gold); font-weight: 700;
          text-transform: uppercase; white-space: nowrap;
        }

        /* ── Term Cards ──────────────────────────────────────── */
        .terms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px,1fr)); gap: 1.25rem; }
        .term-card {
          padding: 1.75rem; border: 1px solid var(--c-border);
          border-radius: 16px; background: var(--c-surface);
          box-shadow: var(--shadow-card);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .term-card:hover { transform: translateY(-2px); box-shadow: 0 6px 30px rgba(0,0,0,0.1); }
        .dark-theme .term-card:hover { box-shadow: 0 6px 30px rgba(0,0,0,0.4); }
        .term-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.85rem; }
        .term-word {
          font-size: clamp(1.25rem,2.5vw,1.5rem); font-style: italic;
          font-weight: 400; color: var(--c-text); line-height: 1.2;
        }
        .term-transliteration {
          font-family: var(--font-inter); font-size: 0.7rem;
          color: var(--c-gold); letter-spacing: 0.08em;
          margin-top: 0.2rem; font-weight: 600;
        }
        .term-num {
          font-family: var(--font-cormorant); font-size: 2rem; font-weight: 300;
          color: var(--c-gold); opacity: 0.2; line-height: 1; flex-shrink: 0;
        }
        .term-meaning {
          font-size: 0.9rem; line-height: 1.85; color: var(--c-text-muted);
          margin-bottom: 0.85rem;
        }
        .term-note {
          margin: 0 0 0.75rem; padding: 0.85rem 1.1rem;
          border-left: 2px solid var(--c-gold);
          background: var(--c-gold-light); border-radius: 0 8px 8px 0;
          font-size: 0.82rem; font-style: italic; color: var(--c-text-muted);
          line-height: 1.75;
        }
        .term-relation {
          font-size: 0.8rem; color: var(--c-text-dim); margin: 0; line-height: 1.6;
        }
        .relation-label { color: var(--c-gold); font-weight: 600; }

        /* ── Distinctions ────────────────────────────────────── */
        .distinctions-list { display: flex; flex-direction: column; gap: 1rem; }
        .distinction-card {
          padding: 1.5rem 1.75rem; border: 1px solid var(--c-border);
          border-radius: 14px; background: var(--c-surface2);
        }
        .distinction-title {
          font-family: var(--font-cormorant); font-style: italic;
          font-size: 1.25rem; font-weight: 400; color: var(--c-gold);
          margin-bottom: 0.65rem;
        }
        .distinction-body { font-size: 0.9rem; line-height: 1.9; color: var(--c-text-muted); margin: 0; }

        /* ── Final reminder ──────────────────────────────────── */
        .final-reminder {
          margin: 3rem 0; text-align: center; padding: 2.5rem;
          border: 1px solid var(--c-border); border-radius: 20px;
          background: var(--c-gold-light);
        }
        .reminder-icon { font-size: 1.75rem; margin-bottom: 1rem; }
        .reminder-text {
          font-size: clamp(1rem,2vw,1.2rem); font-style: italic; font-weight: 300;
          color: var(--c-text-muted); line-height: 1.85; max-width: 600px;
          margin: 0 auto;
        }

        /* ── CTA ─────────────────────────────────────────────── */
        .lexicon-cta { margin-top: 3.5rem; text-align: center; }
        .cta-card {
          display: inline-flex; flex-direction: column; align-items: center;
          padding: clamp(2rem,4vw,3rem) clamp(2rem,6vw,4rem);
          border: 1px solid var(--c-border); border-radius: 24px;
          background: var(--c-surface); box-shadow: var(--shadow-card);
          gap: 0.75rem; max-width: 520px; width: 100%;
        }
        .cta-heading {
          font-size: clamp(1.3rem,3vw,1.7rem); font-style: italic; font-weight: 300;
          color: var(--c-text); margin: 0;
        }
        .cta-sub { font-size: 0.88rem; color: var(--c-text-muted); line-height: 1.75; margin: 0; }
        .pdf-btn-cta {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.85rem 1.75rem; border: 1px solid var(--c-gold);
          background: var(--c-gold-light); color: var(--c-gold);
          border-radius: 12px; font-family: var(--font-inter);
          font-size: 0.88rem; font-weight: 600; text-decoration: none;
          transition: all 0.2s;
        }
        .pdf-btn-cta:hover { background: var(--c-gold); color: #050e07; }
        .next-btn-cta {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.85rem 2rem; background: var(--c-gold); color: #050e07;
          border-radius: 12px; font-family: var(--font-inter);
          font-size: 0.95rem; font-weight: 700; text-decoration: none;
          box-shadow: 0 4px 20px rgba(184,134,11,0.35); transition: all 0.2s;
        }
        .next-btn-cta:hover { transform: translateY(-2px); box-shadow: 0 6px 28px rgba(184,134,11,0.45); }

        /* ── Bottom nav ──────────────────────────────────────── */
        .bottom-nav {
          display: flex; justify-content: space-between; margin-top: 3rem;
          padding-top: 1.5rem; border-top: 1px solid var(--c-border);
        }
        .bottom-nav-link {
          font-family: var(--font-inter); font-size: 0.78rem;
          color: var(--c-text-dim); text-decoration: none; transition: color 0.2s;
        }
        .bottom-nav-link:hover { color: var(--c-gold); }

        @media (max-width: 600px) {
          .terms-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
