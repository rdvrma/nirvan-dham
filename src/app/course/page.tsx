'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// ── Constants (dark theme — landing is always dark/cinematic) ─────────────────
const GOLD = '#d4a843';
const GOLD_LIGHT = '#c49832';
const BG = '#050e07';
const SURFACE = 'rgba(12,24,14,0.9)';
const BORDER = 'rgba(212,168,67,0.15)';
const IVORY = 'rgba(245,237,216,1)';
const MUTED = 'rgba(245,237,216,0.52)';
const DIM = 'rgba(245,237,216,0.28)';

const LANGUAGES = [
  { code: 'hi', script: 'हिंदी', label: 'Hindi', sub: 'देवनागरी', desc: 'मूल भाषा में पढ़ें' },
  { code: 'en', script: 'English', label: 'English', sub: 'Roman Script', desc: 'Read in English' },
  { code: 'hl', script: 'Hinglish', label: 'Hinglish', sub: 'Roman Hindi', desc: 'Roman lipi mein padhen' },
];

const STAGES = [
  { icon: '📖', sa: 'श्रवण', ro: 'Shravana', desc: '8 Adhyay · 3 Bhashaein', locked: false },
  { icon: '🧘', sa: 'मनन', ro: 'Manana', desc: 'Advanced Dhyan Sadhana', locked: true },
  { icon: '🕉', sa: 'निदिध्यासन', ro: 'Nididhyasana', desc: '4 Maah Guru Margdarshan', locked: true },
];

const STEPS = [
  { num: '01', icon: '🌐', hi: 'भाषा चुनें', en: 'Choose your language' },
  { num: '02', icon: '📖', hi: '8 अध्याय पढ़ें', en: 'Read all 8 chapters' },
  { num: '03', icon: '✍️', hi: 'अभ्यास प्रश्न करें', en: '50 MCQ per chapter' },
  { num: '04', icon: '🎓', hi: 'अंतिम परीक्षा', en: '21-question final test' },
  { num: '05', icon: '🕉', hi: 'मनन में प्रवेश', en: 'Enter Manana stage' },
];

// ── Rotating mandala SVG ───────────────────────────────────────────────────────
function Mandala({ size = 480, opacity = 0.07 }: { size?: number; opacity?: number }) {
  const r = size / 2;
  const petals = 12;
  const paths: string[] = [];
  for (let i = 0; i < petals; i++) {
    const angle = (i / petals) * Math.PI * 2;
    const x1 = r + Math.cos(angle) * r * 0.4;
    const y1 = r + Math.sin(angle) * r * 0.4;
    const x2 = r + Math.cos(angle + 0.3) * r * 0.85;
    const y2 = r + Math.sin(angle + 0.3) * r * 0.85;
    const x3 = r + Math.cos(angle - 0.3) * r * 0.85;
    const y3 = r + Math.sin(angle - 0.3) * r * 0.85;
    paths.push(`M ${r} ${r} Q ${x2} ${y2} ${x1} ${y1} Q ${x3} ${y3} ${r} ${r}`);
  }

  // Concentric circles
  const circles = [0.15, 0.28, 0.42, 0.56, 0.7, 0.85].map(f => r * f);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ opacity }}>
      {circles.map((cr, i) => (
        <circle key={i} cx={r} cy={r} r={cr} fill="none" stroke={GOLD} strokeWidth="0.5" />
      ))}
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={GOLD} strokeWidth="0.6" />
      ))}
      {/* 6-pointed star */}
      {[0, 60, 120].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const rad2 = ((deg + 60) * Math.PI) / 180;
        const R = r * 0.5;
        return (
          <line key={`star-${i}`}
            x1={r + Math.cos(rad) * R} y1={r + Math.sin(rad) * R}
            x2={r + Math.cos(rad + Math.PI) * R} y2={r + Math.sin(rad + Math.PI) * R}
            stroke={GOLD} strokeWidth="0.7"
          />
        );
      })}
      {/* Outer lotus petals */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const a2 = ((i + 0.5) / 8) * Math.PI * 2;
        const x1 = r + Math.cos(a) * r * 0.88;
        const y1 = r + Math.sin(a) * r * 0.88;
        const x2 = r + Math.cos(a2) * r * 0.95;
        const y2 = r + Math.sin(a2) * r * 0.95;
        return <path key={`petal-${i}`} d={`M ${r} ${r} L ${x1} ${y1} Q ${x2} ${y2} ${r + Math.cos(a + Math.PI / 8) * r * 0.88} ${r + Math.sin(a + Math.PI / 8) * r * 0.88} Z`} fill="none" stroke={GOLD} strokeWidth="0.5" />;
      })}
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CourseLandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hoveredLang, setHoveredLang] = useState<string | null>(null);
  const [savedLang, setSavedLang] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setSavedLang(localStorage.getItem('course-lang'));
  }, []);

  // Route to Lexicon first, then chapters
  function handleStart(code: string) {
    setSelecting(code);
    localStorage.setItem('course-lang', code);
    setTimeout(() => router.push(`/course/${code}/lexicon`), 280);
  }

  return (
    <div style={{
      minHeight: '100vh', background: BG, color: IVORY, overflowX: 'hidden',
      opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease',
    }}>

      {/* ── Background mandala ─────────────────────────────────── */}
      <div aria-hidden style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none', zIndex: 0,
        animation: 'slowSpin 120s linear infinite',
      }}>
        <Mandala size={700} opacity={0.03} />
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* CINEMATIC HERO                                            */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(6rem,10vw,9rem) clamp(1.5rem,5vw,3rem) clamp(4rem,7vw,6rem)',
        textAlign: 'center', overflow: 'hidden',
      }}>
        {/* Cinematic background video */}
        <video
          autoPlay muted loop playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45, zIndex: 0 }}
          src="/course-videos/hero.mp4"
        />
        {/* Dark gradient overlays */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to bottom, rgba(5,14,7,0.5) 0%, rgba(5,14,7,0.2) 40%, rgba(5,14,7,0.7) 80%, rgba(5,14,7,1) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'radial-gradient(ellipse 80% 50% at 50% 50%, transparent 40%, rgba(5,14,7,0.6) 100%)' }} />


        {/* All hero content above the video overlays */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Small mandala above title */}
        <div style={{ marginBottom: '1.5rem', animation: 'slowSpin 60s linear infinite' }}>
          <Mandala size={80} opacity={0.5} />
        </div>


        {/* Badge */}
        <div style={{ marginBottom: '1.75rem' }}>
          <span style={{
            display: 'inline-block', padding: '0.35rem 1.2rem',
            border: `1px solid ${BORDER}`, borderRadius: '100px',
            fontFamily: 'var(--font-inter)', fontSize: '0.58rem',
            letterSpacing: '0.3em', color: GOLD, textTransform: 'uppercase', fontWeight: 600,
            background: 'rgba(212,168,67,0.04)',
          }}>
            निर्वाण धाम · आध्यात्मिक पाठ्यक्रम
          </span>
        </div>

        {/* Main title — FIXED: enough top space so it doesn't clip */}
        <h1 style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 'clamp(4rem,13vw,9rem)',
          fontWeight: 300, fontStyle: 'italic',
          background: `linear-gradient(150deg, #c49a32 0%, #ffe89a 40%, #d4a843 70%, #b8852a 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1.05,
          marginBottom: '1.25rem',
          letterSpacing: '-0.01em',
          padding: '0.1em 0.05em', // prevents clipping
        }}>
          निर्वाण सूत्र
        </h1>

        <p style={{ fontFamily: 'var(--font-hind)', fontSize: 'clamp(1rem,2.2vw,1.25rem)', color: MUTED, marginBottom: '0.4rem', fontWeight: 400 }}>
          एक पूर्ण आध्यात्मिक यात्रा
        </p>
        <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: 'clamp(0.95rem,1.8vw,1.1rem)', color: 'rgba(212,168,67,0.45)', marginBottom: '3rem' }}>
          A Complete Spiritual Journey
        </p>

        {/* Three stage pills */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '3.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {STAGES.map((s, i) => (
            <div key={i} style={{
              padding: '0.85rem 1.5rem',
              border: `1px solid ${s.locked ? 'rgba(212,168,67,0.07)' : BORDER}`,
              borderRadius: '14px', background: s.locked ? 'rgba(12,24,14,0.4)' : SURFACE,
              opacity: s.locked ? 0.45 : 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '0.2rem', minWidth: '110px',
              position: 'relative',
            }}>
              {s.locked && <span style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', fontSize: '0.55rem', opacity: 0.4 }}>🔒</span>}
              <span style={{ fontSize: '1.25rem' }}>{s.icon}</span>
              <span style={{ fontFamily: 'var(--font-hind)', fontSize: '1rem', fontWeight: 700, color: s.locked ? 'rgba(212,168,67,0.3)' : GOLD }}>{s.sa}</span>
              <span style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '0.75rem', color: 'rgba(212,168,67,0.4)' }}>{s.ro}</span>
            </div>
          ))}
        </div>

        {/* ── Language selector ──────────────────────────────────── */}
        <div style={{ width: '100%', maxWidth: '640px' }}>
          <p style={{ fontFamily: 'var(--font-hind)', fontSize: '0.8rem', color: MUTED, marginBottom: '1rem', letterSpacing: '0.06em' }}>
            अपनी भाषा चुनें · Choose Your Language
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.9rem' }}>
            {LANGUAGES.map(lang => {
              const active = savedLang === lang.code;
              const hovered = hoveredLang === lang.code;
              const loading = selecting === lang.code;
              return (
                <button
                  key={lang.code}
                  id={`lang-${lang.code}`}
                  onClick={() => handleStart(lang.code)}
                  onMouseEnter={() => setHoveredLang(lang.code)}
                  onMouseLeave={() => setHoveredLang(null)}
                  style={{
                    padding: '1.4rem 0.75rem',
                    border: `1px solid ${active || hovered ? GOLD : BORDER}`,
                    borderRadius: '16px',
                    background: active ? 'rgba(212,168,67,0.09)' : hovered ? 'rgba(212,168,67,0.05)' : SURFACE,
                    cursor: 'pointer', textAlign: 'center', color: IVORY,
                    transition: 'all 0.25s ease',
                    transform: hovered ? 'translateY(-4px)' : 'none',
                    boxShadow: hovered ? '0 10px 35px rgba(212,168,67,0.1)' : 'none',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-hind)', fontSize: 'clamp(1.1rem,3vw,1.4rem)', fontWeight: 700, color: active || hovered ? GOLD : IVORY, marginBottom: '0.2rem', transition: 'color 0.25s' }}>
                    {lang.script}
                  </div>
                  <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.62rem', color: GOLD, letterSpacing: '0.1em', marginBottom: '0.4rem' }}>{lang.sub}</div>
                  <div style={{ fontFamily: 'var(--font-hind)', fontSize: '0.72rem', color: MUTED }}>{lang.desc}</div>
                  {active && !loading && (
                    <div style={{ marginTop: '0.5rem', fontFamily: 'var(--font-inter)', fontSize: '0.58rem', color: GOLD, letterSpacing: '0.1em' }}>
                      ● Resume
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        </div> {/* end zIndex:2 content wrapper */}

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', opacity: 0.3, animation: 'bobFloat 3s ease-in-out infinite', zIndex: 3 }}>
          <div style={{ width: '22px', height: '36px', border: '1px solid rgba(212,168,67,0.5)', borderRadius: '11px', display: 'flex', justifyContent: 'center', paddingTop: '5px' }}>
            <div style={{ width: '3px', height: '7px', background: GOLD, borderRadius: '2px', animation: 'scrollDot 3s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* THREE STAGES DEEP DIVE                                    */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,3rem)', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Section heading */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'inline-block', marginBottom: '1rem', opacity: 0.4 }}>
            <Mandala size={40} opacity={1} />
          </div>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.58rem', letterSpacing: '0.3em', color: GOLD, textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.75rem' }}>
            The Three Stages
          </p>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 300, color: IVORY }}>
            तीन चरणों की यात्रा
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px,1fr))', gap: '1.5rem' }}>
          {[
            {
              num: '01', icon: '📖', title: 'श्रवण', sub: 'Shravana — Listening',
              open: true,
              body: '8 गहरे अध्यायों के माध्यम से आत्म-जिज्ञासा की यात्रा। प्रत्येक अध्याय के बाद 50 अभ्यास प्रश्न और अंत में 21 प्रश्नों की लिखित परीक्षा।',
              bullets: ['8 अध्याय · 3 भाषाएं', '50 MCQ प्रति अध्याय', 'अंतिम लिखित परीक्षा', 'PDF डाउनलोड'],
            },
            {
              num: '02', icon: '🧘', title: 'मनन', sub: 'Manana — Contemplation',
              open: false,
              body: 'उन्नत और विशेषज्ञ ध्यान साधनाएं। श्रवण पूर्ण होने के पश्चात् व्यक्तिगत रूप से आमंत्रित किया जाता है।',
              bullets: ['उन्नत ध्यान साधना', 'विशेषज्ञ मार्गदर्शन', 'व्यक्तिगत प्रवेश'],
            },
            {
              num: '03', icon: '🕉', title: 'निदिध्यासन', sub: 'Nididhyasana — Integration',
              open: false,
              body: '4 माह तक गुरु के सानिध्य में निजी सत्संग और व्यक्तिगत मार्गदर्शन।',
              bullets: ['4 माह सत्संग', 'व्यक्तिगत मार्गदर्शन', 'निजी समूह'],
            },
          ].map((stage, i) => (
            <div key={i} style={{
              padding: 'clamp(1.75rem,3vw,2.5rem)',
              border: `1px solid ${stage.open ? BORDER : 'rgba(212,168,67,0.06)'}`,
              borderRadius: '20px',
              background: stage.open ? SURFACE : 'rgba(8,18,9,0.6)',
              opacity: stage.open ? 1 : 0.5, position: 'relative', overflow: 'hidden',
            }}>
              {/* Number watermark */}
              <div style={{ position: 'absolute', top: '1rem', right: '1.25rem', fontFamily: 'var(--font-cormorant)', fontSize: '4rem', fontWeight: 300, color: 'rgba(212,168,67,0.05)', lineHeight: 1 }}>
                {stage.num}
              </div>

              {!stage.open && (
                <span style={{ position: 'absolute', top: '1rem', left: '1.25rem', padding: '0.2rem 0.6rem', border: '1px solid rgba(212,168,67,0.15)', borderRadius: '6px', fontFamily: 'var(--font-inter)', fontSize: '0.55rem', color: 'rgba(212,168,67,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  🔒 Locked
                </span>
              )}

              <div style={{ fontSize: '2rem', marginBottom: '1rem', marginTop: stage.open ? 0 : '1.75rem' }}>{stage.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-hind)', fontSize: '1.5rem', fontWeight: 700, color: stage.open ? GOLD : 'rgba(212,168,67,0.35)', marginBottom: '0.2rem' }}>{stage.title}</h3>
              <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '0.9rem', color: MUTED, marginBottom: '1.25rem' }}>{stage.sub}</p>
              <p style={{ fontFamily: 'var(--font-hind)', fontSize: '0.88rem', lineHeight: 1.9, color: stage.open ? MUTED : DIM, marginBottom: '1.5rem' }}>{stage.body}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {stage.bullets.map((b, bi) => (
                  <div key={bi} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: stage.open ? GOLD : 'rgba(212,168,67,0.2)', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-hind)', fontSize: '0.8rem', color: stage.open ? 'rgba(245,237,216,0.6)' : DIM }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS — vertical timeline                          */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, padding: 'clamp(4rem,8vw,6rem) clamp(1.5rem,5vw,3rem)', borderTop: '1px solid rgba(212,168,67,0.06)' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.58rem', letterSpacing: '0.3em', color: GOLD, textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.75rem' }}>
              How It Works
            </p>
            <h2 style={{ fontFamily: 'var(--font-hind)', fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 700, color: IVORY }}>
              यात्रा का मार्ग
            </h2>
          </div>

          {STEPS.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', paddingBottom: i < STEPS.length - 1 ? '2rem' : 0, position: 'relative' }}>
              {i < STEPS.length - 1 && (
                <div style={{ position: 'absolute', left: '27px', top: '56px', width: '1px', height: 'calc(100% - 20px)', background: 'linear-gradient(180deg, rgba(212,168,67,0.2), rgba(212,168,67,0.04))' }} />
              )}
              <div style={{ width: '54px', height: '54px', borderRadius: '50%', border: `1px solid ${BORDER}`, background: 'rgba(12,24,14,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.25rem' }}>
                {step.icon}
              </div>
              <div style={{ paddingTop: '0.7rem' }}>
                <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.55rem', color: GOLD, letterSpacing: '0.2em', marginBottom: '0.2rem' }}>{step.num}</div>
                <p style={{ fontFamily: 'var(--font-hind)', fontSize: '0.98rem', fontWeight: 700, color: IVORY, marginBottom: '0.1rem' }}>{step.hi}</p>
                <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '0.88rem', color: MUTED }}>{step.en}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* FINAL CTA                                                  */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,3rem)', textAlign: 'center', borderTop: '1px solid rgba(212,168,67,0.06)' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <Mandala size={60} opacity={0.45} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 300, color: IVORY, marginBottom: '1rem' }}>
            यात्रा अभी शुरू करें
          </h2>
          <p style={{ fontFamily: 'var(--font-hind)', fontSize: '0.95rem', color: MUTED, lineHeight: 2, marginBottom: '2.5rem' }}>
            निर्वाण सूत्र एक ऐसी यात्रा है जो आपको स्वयं की गहराइयों में ले जाती है।
          </p>
          <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleStart(lang.code)}
                style={{
                  padding: '0.85rem 1.75rem', border: `1px solid ${BORDER}`,
                  borderRadius: '12px', background: 'rgba(212,168,67,0.05)',
                  color: GOLD, cursor: 'pointer',
                  fontFamily: 'var(--font-hind)', fontSize: '0.9rem', fontWeight: 600,
                  transition: 'all 0.25s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,168,67,0.1)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,168,67,0.05)'; (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}
              >
                {lang.script} में →
              </button>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes slowSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bobFloat { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-6px); } }
        @keyframes scrollDot { 0%,100% { opacity:1; transform:translateY(0); } 50% { opacity:0.3; transform:translateY(8px); } }
      `}</style>
    </div>
  );
}
