'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ── Design tokens ───────────────────────────────────────────────
const GOLD = '#d4a843';
const BG = '#061008';
const IVORY = 'rgba(245,237,216,1)';
const MUTED = 'rgba(245,237,216,0.55)';
const DIMMED = 'rgba(245,237,216,0.3)';
const SURFACE = 'rgba(13,26,15,0.9)';
const BORDER = 'rgba(212,168,67,0.15)';

const STAGES = [
  {
    icon: '📖',
    sanskrit: 'श्रवण',
    roman: 'Shravana',
    desc: '8 गहरे अध्याय',
    descEn: '8 Profound Chapters',
    tag: 'सुनना · पढ़ना · समझना',
    tagEn: 'Read · Absorb · Understand',
    locked: false,
    color: GOLD,
  },
  {
    icon: '🧘',
    sanskrit: 'मनन',
    roman: 'Manana',
    desc: 'उन्नत ध्यान साधना',
    descEn: 'Advanced Meditation',
    tag: 'श्रवण पूर्ण होने के बाद',
    tagEn: 'After completing Shravana',
    locked: true,
    color: 'rgba(212,168,67,0.35)',
  },
  {
    icon: '🕉',
    sanskrit: 'निदिध्यासन',
    roman: 'Nididhyasana',
    desc: '4 माह गुरु मार्गदर्शन',
    descEn: '4-Month Guru Guidance',
    tag: 'मनन पश्चात् · व्यक्तिगत',
    tagEn: 'Post-Manana · Private',
    locked: true,
    color: 'rgba(212,168,67,0.25)',
  },
];

const LANGUAGES = [
  { code: 'hi', label: 'हिंदी', sub: 'देवनागरी', desc: 'मूल भाषा में पढ़ें' },
  { code: 'en', label: 'English', sub: 'Roman', desc: 'Read in English' },
  { code: 'hl', label: 'Hinglish', sub: 'Roman Hindi', desc: 'Roman lipi mein padhen' },
];

const STEPS = [
  { num: '०१', hi: 'भाषा चुनें', en: 'Choose Language', icon: '🌐' },
  { num: '०२', hi: '8 अध्याय पढ़ें', en: 'Read 8 Chapters', icon: '📖' },
  { num: '०३', hi: 'अभ्यास प्रश्न करें', en: 'Practice Questions', icon: '✍️' },
  { num: '०४', hi: 'अंतिम परीक्षा दें', en: 'Final Assessment', icon: '🎓' },
  { num: '०५', hi: 'मनन में प्रवेश', en: 'Enter Manana', icon: '🕉' },
];

export default function CourseLandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hoveredLang, setHoveredLang] = useState<string | null>(null);
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);
  const [selectedLang, setSelectedLang] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Resume saved progress
    const saved = localStorage.getItem('course-lang');
    if (saved) setSelectedLang(saved);
  }, []);

  function handleLangSelect(code: string) {
    setSelectedLang(code);
    localStorage.setItem('course-lang', code);
    setTimeout(() => router.push(`/course/${code}/1`), 300);
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: BG,
        color: IVORY,
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.4s ease',
        overflowX: 'hidden',
      }}
    >
      {/* ── Ambient background glow ──────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,168,67,0.06) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(212,168,67,0.03) 0%, transparent 60%)',
        }}
      />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative', zIndex: 1,
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 'clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,3rem) clamp(3rem,6vw,5rem)',
          textAlign: 'center',
        }}
      >
        {/* Series badge */}
        <div style={{ marginBottom: '2rem' }}>
          <span style={{
            display: 'inline-block',
            padding: '0.35rem 1.1rem',
            border: `1px solid ${BORDER}`,
            borderRadius: '100px',
            fontFamily: 'var(--font-inter)',
            fontSize: '0.62rem', letterSpacing: '0.28em',
            color: GOLD, textTransform: 'uppercase', fontWeight: 600,
            background: 'rgba(212,168,67,0.04)',
          }}>
            निर्वाण धाम · आध्यात्मिक पाठ्यक्रम
          </span>
        </div>

        {/* Main title */}
        <h1 style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 'clamp(3.5rem,12vw,8rem)',
          fontWeight: 300, fontStyle: 'italic',
          background: `linear-gradient(145deg, ${GOLD} 0%, #ffe89a 45%, ${GOLD} 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1.0, marginBottom: '1.25rem',
          letterSpacing: '-0.01em',
        }}>
          निर्वाण सूत्र
        </h1>

        <p style={{
          fontFamily: 'var(--font-hind)', fontSize: 'clamp(1.1rem,2.5vw,1.35rem)',
          color: MUTED, marginBottom: '0.5rem', fontWeight: 400, letterSpacing: '0.02em',
        }}>
          एक पूर्ण आध्यात्मिक यात्रा
        </p>
        <p style={{
          fontFamily: 'var(--font-cormorant)', fontStyle: 'italic',
          fontSize: 'clamp(1rem,2vw,1.15rem)', color: 'rgba(212,168,67,0.5)',
          marginBottom: '3rem',
        }}>
          A Complete Spiritual Journey
        </p>

        {/* Three stages strip */}
        <div style={{
          display: 'flex', gap: 'clamp(0.75rem,2vw,1.25rem)',
          marginBottom: '4rem', flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {STAGES.map((stage, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredStage(i)}
              onMouseLeave={() => setHoveredStage(null)}
              style={{
                padding: '1.25rem 1.75rem',
                border: `1px solid ${stage.locked ? 'rgba(212,168,67,0.08)' : BORDER}`,
                borderRadius: '16px',
                background: hoveredStage === i && !stage.locked
                  ? 'rgba(212,168,67,0.06)'
                  : stage.locked ? 'rgba(13,26,15,0.4)' : SURFACE,
                transition: 'all 0.3s ease',
                textAlign: 'center', minWidth: '130px',
                opacity: stage.locked ? 0.5 : 1,
                filter: stage.locked ? 'saturate(0.3)' : 'none',
                position: 'relative',
                cursor: stage.locked ? 'default' : 'default',
              }}
            >
              {stage.locked && (
                <div style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', fontSize: '0.6rem', opacity: 0.5 }}>🔒</div>
              )}
              <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{stage.icon}</div>
              <div style={{ fontFamily: 'var(--font-hind)', fontSize: '1.1rem', fontWeight: 600, color: stage.color, marginBottom: '0.15rem' }}>{stage.sanskrit}</div>
              <div style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '0.85rem', color: 'rgba(212,168,67,0.5)' }}>{stage.roman}</div>
            </div>
          ))}
        </div>

        {/* Language selector */}
        <div style={{ width: '100%', maxWidth: '680px' }}>
          <p style={{ fontFamily: 'var(--font-hind)', fontSize: '0.85rem', color: MUTED, marginBottom: '1.25rem', letterSpacing: '0.04em' }}>
            अपनी भाषा चुनें · Choose Your Language
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {LANGUAGES.map(lang => {
              const isActive = selectedLang === lang.code;
              const isHovered = hoveredLang === lang.code;
              return (
                <button
                  key={lang.code}
                  id={`lang-${lang.code}`}
                  onClick={() => handleLangSelect(lang.code)}
                  onMouseEnter={() => setHoveredLang(lang.code)}
                  onMouseLeave={() => setHoveredLang(null)}
                  style={{
                    padding: '1.5rem 1rem',
                    border: `1px solid ${isActive || isHovered ? GOLD : BORDER}`,
                    borderRadius: '16px',
                    background: isActive ? 'rgba(212,168,67,0.1)' : isHovered ? 'rgba(212,168,67,0.05)' : SURFACE,
                    cursor: 'pointer', textAlign: 'center',
                    transition: 'all 0.25s ease',
                    transform: isHovered ? 'translateY(-3px)' : 'none',
                    boxShadow: isHovered ? '0 8px 30px rgba(212,168,67,0.12)' : 'none',
                    color: IVORY,
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-hind)', fontSize: 'clamp(1.2rem,3vw,1.5rem)', fontWeight: 700, color: isActive ? GOLD : IVORY, marginBottom: '0.25rem', transition: 'color 0.25s ease' }}>
                    {lang.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.7rem', color: GOLD, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                    {lang.sub}
                  </div>
                  <div style={{ fontFamily: 'var(--font-hind)', fontSize: '0.75rem', color: MUTED }}>
                    {lang.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', animation: 'float 2.5s ease-in-out infinite', opacity: 0.35 }}>
          <div style={{ width: '24px', height: '40px', border: '1px solid rgba(212,168,67,0.4)', borderRadius: '12px', display: 'flex', justifyContent: 'center', paddingTop: '6px' }}>
            <div style={{ width: '3px', height: '8px', background: GOLD, borderRadius: '2px', animation: 'scrollDot 2.5s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* ── Three Stages detail section ──────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,3rem)', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.6rem', letterSpacing: '0.3em', color: GOLD, textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.75rem' }}>
            The Three Stages
          </p>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 300, color: IVORY }}>
            तीन चरणों की यात्रा
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[
            {
              icon: '📖', num: '01',
              title: 'श्रवण', subtitle: 'Shravana — Listening',
              desc: '8 गहरे अध्यायों के माध्यम से आत्म-जिज्ञासा की यात्रा। प्रत्येक अध्याय के बाद 50 अभ्यास प्रश्न और अंत में 21 प्रश्नों की लिखित परीक्षा।',
              descEn: 'Journey of self-inquiry through 8 profound chapters. 50 practice MCQs after each chapter, culminating in a 21-question written assessment.',
              open: true,
              details: ['8 अध्याय · 3 भाषाएं', '50 MCQ प्रति अध्याय', 'अंतिम लिखित परीक्षा'],
            },
            {
              icon: '🧘', num: '02',
              title: 'मनन', subtitle: 'Manana — Contemplation',
              desc: 'उन्नत और विशेषज्ञ ध्यान साधनाएं। श्रवण पूर्ण होने के पश्चात् व्यक्तिगत रूप से आमंत्रित किया जाता है।',
              descEn: 'Advanced and expert meditation practices. Personally invited after completing Shravana.',
              open: false,
              details: ['उन्नत ध्यान', 'विशेषज्ञ साधना', 'व्यक्तिगत प्रवेश'],
            },
            {
              icon: '🕉', num: '03',
              title: 'निदिध्यासन', subtitle: 'Nididhyasana — Integration',
              desc: '4 माह तक गुरु के सानिध्य में निजी सत्संग और व्यक्तिगत मार्गदर्शन। यह स्थायी जागरण की ओर अंतिम चरण है।',
              descEn: '4 months of private satsang and personal guidance in the Guru\'s presence. The final step toward enduring awakening.',
              open: false,
              details: ['4 माह सत्संग', 'व्यक्तिगत मार्गदर्शन', 'निजी समूह'],
            },
          ].map((stage, i) => (
            <div
              key={i}
              style={{
                padding: 'clamp(2rem,3vw,2.5rem)',
                border: `1px solid ${stage.open ? BORDER : 'rgba(212,168,67,0.07)'}`,
                borderRadius: '20px',
                background: stage.open ? SURFACE : 'rgba(9,19,10,0.5)',
                opacity: stage.open ? 1 : 0.55,
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Stage number */}
              <div style={{ position: 'absolute', top: '1.25rem', right: '1.5rem', fontFamily: 'var(--font-cormorant)', fontSize: '3.5rem', fontWeight: 300, color: 'rgba(212,168,67,0.06)', lineHeight: 1 }}>
                {stage.num}
              </div>

              {!stage.open && (
                <div style={{ position: 'absolute', top: '1rem', left: '1.25rem', padding: '0.2rem 0.6rem', border: '1px solid rgba(212,168,67,0.15)', borderRadius: '6px', fontFamily: 'var(--font-inter)', fontSize: '0.58rem', color: 'rgba(212,168,67,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  🔒 Locked
                </div>
              )}

              <div style={{ fontSize: '2rem', marginBottom: '1rem', marginTop: stage.open ? 0 : '1.5rem' }}>{stage.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-hind)', fontSize: '1.5rem', fontWeight: 700, color: stage.open ? GOLD : 'rgba(212,168,67,0.4)', marginBottom: '0.2rem' }}>{stage.title}</h3>
              <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '0.95rem', color: MUTED, marginBottom: '1.25rem' }}>{stage.subtitle}</p>

              <p style={{ fontFamily: 'var(--font-hind)', fontSize: '0.9rem', lineHeight: 1.9, color: stage.open ? MUTED : DIMMED, marginBottom: '1.5rem' }}>
                {stage.desc}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {stage.details.map((d, di) => (
                  <div key={di} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: stage.open ? GOLD : 'rgba(212,168,67,0.25)', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-hind)', fontSize: '0.82rem', color: stage.open ? 'rgba(245,237,216,0.65)' : DIMMED }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: 'clamp(4rem,8vw,6rem) clamp(1.5rem,5vw,3rem)', borderTop: '1px solid rgba(212,168,67,0.07)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.6rem', letterSpacing: '0.3em', color: GOLD, textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.75rem' }}>
            How It Works
          </p>
          <h2 style={{ fontFamily: 'var(--font-hind)', fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 700, color: IVORY, marginBottom: '3rem' }}>
            यात्रा का मार्ग
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {STEPS.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', textAlign: 'left', position: 'relative', paddingBottom: i < STEPS.length - 1 ? '2rem' : 0 }}>
                {/* Vertical connector */}
                {i < STEPS.length - 1 && (
                  <div style={{ position: 'absolute', left: '28px', top: '56px', width: '1px', height: 'calc(100% - 20px)', background: 'linear-gradient(180deg, rgba(212,168,67,0.25), rgba(212,168,67,0.05))' }} />
                )}
                {/* Step icon */}
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: `1px solid ${BORDER}`, background: 'rgba(13,26,15,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.3rem' }}>
                  {step.icon}
                </div>
                <div style={{ paddingTop: '0.75rem' }}>
                  <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.6rem', color: GOLD, letterSpacing: '0.2em', marginBottom: '0.25rem' }}>{step.num}</div>
                  <p style={{ fontFamily: 'var(--font-hind)', fontSize: '1rem', fontWeight: 600, color: IVORY, marginBottom: '0.15rem' }}>{step.hi}</p>
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '0.9rem', color: MUTED }}>{step.en}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,3rem)', textAlign: 'center', borderTop: '1px solid rgba(212,168,67,0.07)' }}>
        <div style={{ maxWidth: '580px', margin: '0 auto' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>🙏</div>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 300, color: IVORY, marginBottom: '1rem' }}>
            यात्रा अभी शुरू करें
          </h2>
          <p style={{ fontFamily: 'var(--font-hind)', fontSize: '1rem', color: MUTED, lineHeight: 1.9, marginBottom: '2.5rem' }}>
            निर्वाण सूत्र एक ऐसी यात्रा है जो आपको स्वयं की गहराइयों में ले जाती है। पहला अध्याय अभी शुरू करें।
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleLangSelect(lang.code)}
                style={{
                  padding: '0.85rem 2rem', border: `1px solid ${BORDER}`,
                  borderRadius: '12px', background: 'rgba(212,168,67,0.06)',
                  color: GOLD, cursor: 'pointer',
                  fontFamily: 'var(--font-hind)', fontSize: '0.95rem', fontWeight: 600,
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,168,67,0.12)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,168,67,0.06)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'none';
                }}
              >
                {lang.label} में शुरू करें
              </button>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes float { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-6px); } }
        @keyframes scrollDot { 0%,100% { opacity: 1; transform: translateY(0); } 50% { opacity: 0.3; transform: translateY(8px); } }
      `}</style>
    </div>
  );
}
