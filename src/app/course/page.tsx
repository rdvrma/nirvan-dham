'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ── Design tokens ───────────────────────────────────────────────
const GOLD = '#d4a843';
const BG = '#061008';
const SURFACE = '#0d1a0f';
const BORDER = 'rgba(212,168,67,0.14)';
const MUTED = 'rgba(245,237,216,0.55)';
const IVORY = 'rgba(245,237,216,1)';

type Lang = 'hi' | 'en' | 'hl';

const LANG_CARDS: { lang: Lang; label: string; sub: string }[] = [
  { lang: 'hi', label: 'हिंदी', sub: 'Hindi' },
  { lang: 'en', label: 'English', sub: 'अंग्रेज़ी' },
  { lang: 'hl', label: 'Hinglish', sub: 'हिंग्लिश' },
];

const STAGES = [
  {
    num: '01',
    hi: 'श्रवण',
    en: 'Shravana',
    desc: '8 गहरे अध्याय · अभ्यास प्रश्न · ज्ञान परीक्षण',
    locked: false,
    color: GOLD,
  },
  {
    num: '02',
    hi: 'मनन',
    en: 'Manana',
    desc: 'उन्नत ध्यान साधना',
    locked: true,
    color: 'rgba(212,168,67,0.35)',
  },
  {
    num: '03',
    hi: 'निदिध्यासन',
    en: 'Nididhyasana',
    desc: '4 माह गुरु मार्गदर्शन',
    locked: true,
    color: 'rgba(212,168,67,0.25)',
  },
];

const HOW_STEPS = [
  {
    num: '1',
    icon: '📖',
    title: 'अध्याय पढ़ें',
    desc: 'प्रत्येक अध्याय को शांत मन से पढ़ें। गहरे विचारों को आत्मसात् करें।',
  },
  {
    num: '2',
    icon: '✍️',
    title: 'अभ्यास करें',
    desc: 'हर अध्याय के बाद 50 बहुविकल्पीय प्रश्नों से अपनी समझ जाँचें।',
  },
  {
    num: '3',
    icon: '📝',
    title: 'अंतिम परीक्षा',
    desc: '8 अध्याय पूर्ण करने पर 21 लिखित प्रश्नों की परीक्षा दें।',
  },
  {
    num: '4',
    icon: '🌸',
    title: 'मनन की ओर',
    desc: 'श्रवण पूर्ण होने पर आप मनन स्तर की साधना की ओर बढ़ेंगे।',
  },
];

export default function CourseLandingPage() {
  const [mounted, setMounted] = useState(false);
  const [hoveredLang, setHoveredLang] = useState<Lang | null>(null);
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  function selectLanguage(lang: Lang) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('course-lang', lang);
    }
    router.push(`/course/${lang}/1`);
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: BG,
        color: IVORY,
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.3s ease',
        overflowX: 'hidden',
      }}
    >
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(5rem,10vw,8rem) clamp(1.25rem,5vw,3rem) clamp(3rem,6vw,5rem)',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Radial glow background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(212,168,67,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        {/* Sacred grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(212,168,67,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,67,0.025) 1px, transparent 1px)',
            backgroundSize: '70px 70px',
            pointerEvents: 'none',
          }}
        />

        {/* Overline label */}
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '0.65rem',
            letterSpacing: '0.28em',
            color: GOLD,
            textTransform: 'uppercase',
            fontWeight: 700,
            marginBottom: '1.5rem',
            position: 'relative',
          }}
        >
          निर्वाण धाम · आध्यात्मिक पाठ्यक्रम
        </p>

        {/* Main heading */}
        <h1
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(3.5rem,10vw,7rem)',
            fontWeight: 300,
            fontStyle: 'italic',
            color: GOLD,
            lineHeight: 1,
            marginBottom: '1rem',
            position: 'relative',
            background: `linear-gradient(135deg, ${GOLD} 0%, #ffe89a 50%, ${GOLD} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          निर्वाण सूत्र
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: 'var(--font-hind)',
            fontSize: 'clamp(1.1rem,2.5vw,1.5rem)',
            color: MUTED,
            marginBottom: '0.75rem',
            position: 'relative',
          }}
        >
          एक पूर्ण आध्यात्मिक यात्रा
        </p>
        <p
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontStyle: 'italic',
            fontSize: 'clamp(1rem,2vw,1.25rem)',
            color: 'rgba(212,168,67,0.55)',
            marginBottom: '3rem',
            position: 'relative',
          }}
        >
          A Complete Spiritual Journey
        </p>

        {/* Gold divider */}
        <div
          style={{
            width: 'min(200px,40vw)',
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
            marginBottom: '3rem',
            position: 'relative',
            opacity: 0.5,
          }}
        />

        {/* Stage pills */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: '4rem',
            position: 'relative',
          }}
        >
          {STAGES.map((s) => (
            <div
              key={s.num}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.85rem 1.75rem',
                border: `1px solid ${s.locked ? 'rgba(212,168,67,0.12)' : BORDER}`,
                borderRadius: '12px',
                background: s.locked
                  ? 'rgba(13,26,15,0.4)'
                  : 'rgba(212,168,67,0.06)',
                opacity: s.locked ? 0.45 : 1,
                position: 'relative',
              }}
            >
              {s.locked && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    fontSize: '0.75rem',
                    background: SURFACE,
                    border: `1px solid ${BORDER}`,
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  🔒
                </span>
              )}
              <span
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontStyle: 'italic',
                  fontSize: '0.65rem',
                  color: s.color,
                  letterSpacing: '0.15em',
                }}
              >
                {s.num}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-hind)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: s.locked ? MUTED : IVORY,
                }}
              >
                {s.hi}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.7rem',
                  color: s.color,
                  letterSpacing: '0.05em',
                }}
              >
                {s.en}
              </span>
            </div>
          ))}
        </div>

        {/* Language selector heading */}
        <h2
          style={{
            fontFamily: 'var(--font-hind)',
            fontSize: 'clamp(1.1rem,2.5vw,1.35rem)',
            fontWeight: 600,
            color: IVORY,
            marginBottom: '1.25rem',
            position: 'relative',
          }}
        >
          अपनी भाषा चुनें · Choose Your Language
        </h2>

        {/* Language cards */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {LANG_CARDS.map(({ lang, label, sub }) => (
            <button
              key={lang}
              onClick={() => selectLanguage(lang)}
              onMouseEnter={() => setHoveredLang(lang)}
              onMouseLeave={() => setHoveredLang(null)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1.5rem 2.5rem',
                border: `1px solid ${hoveredLang === lang ? GOLD : BORDER}`,
                borderRadius: '16px',
                background:
                  hoveredLang === lang
                    ? 'rgba(212,168,67,0.1)'
                    : 'rgba(13,26,15,0.6)',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                transform: hoveredLang === lang ? 'translateY(-4px)' : 'none',
                boxShadow:
                  hoveredLang === lang
                    ? `0 12px 40px rgba(212,168,67,0.15)`
                    : 'none',
              }}
            >
              <span
                style={{
                  fontFamily:
                    lang === 'hi'
                      ? 'var(--font-hind)'
                      : 'var(--font-cormorant)',
                  fontStyle:
                    lang === 'en' || lang === 'hl' ? 'italic' : 'normal',
                  fontSize:
                    lang === 'hi'
                      ? '1.6rem'
                      : 'clamp(1.4rem,3vw,1.8rem)',
                  fontWeight: lang === 'hi' ? 600 : 400,
                  color: hoveredLang === lang ? GOLD : IVORY,
                  transition: 'color 0.25s ease',
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontFamily:
                    lang === 'hi' ? 'var(--font-inter)' : 'var(--font-hind)',
                  fontSize: '0.75rem',
                  color: MUTED,
                }}
              >
                {sub}
              </span>
              {hoveredLang === lang && (
                <span
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '0.7rem',
                    color: GOLD,
                    marginTop: '0.25rem',
                    letterSpacing: '0.05em',
                  }}
                >
                  आरंभ करें →
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── Three Stage Deep-Dive ────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,5vw,3rem)',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
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
            तीन चरण
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontStyle: 'italic',
              fontSize: 'clamp(2rem,5vw,3rem)',
              fontWeight: 300,
              color: IVORY,
              marginBottom: '0.75rem',
            }}
          >
            The Sacred Triad
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-hind)',
              fontSize: '1.05rem',
              color: MUTED,
            }}
          >
            श्रवण → मनन → निदिध्यासन
          </p>
        </div>

        {/* Stage cards grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {STAGES.map((stage, i) => (
            <div
              key={stage.num}
              onMouseEnter={() => setHoveredStage(i)}
              onMouseLeave={() => setHoveredStage(null)}
              style={{
                position: 'relative',
                padding: '2rem',
                borderRadius: '20px',
                border: stage.locked
                  ? `1px solid rgba(212,168,67,0.08)`
                  : `1px solid ${hoveredStage === i ? GOLD : 'rgba(212,168,67,0.2)'}`,
                background: stage.locked
                  ? 'rgba(13,26,15,0.3)'
                  : hoveredStage === i
                  ? 'rgba(212,168,67,0.07)'
                  : 'rgba(13,26,15,0.6)',
                opacity: stage.locked ? 0.5 : 1,
                transition: 'all 0.25s ease',
                transform:
                  !stage.locked && hoveredStage === i
                    ? 'translateY(-6px)'
                    : 'none',
                boxShadow:
                  !stage.locked && hoveredStage === i
                    ? `0 20px 60px rgba(212,168,67,0.12)`
                    : 'none',
              }}
            >
              {/* Stage number */}
              <div
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontStyle: 'italic',
                  fontSize: '4rem',
                  fontWeight: 300,
                  color: stage.color,
                  opacity: 0.3,
                  lineHeight: 1,
                  marginBottom: '1rem',
                }}
              >
                {stage.num}
              </div>

              {/* Lock overlay */}
              {stage.locked && (
                <div
                  style={{
                    position: 'absolute',
                    top: '1.25rem',
                    right: '1.25rem',
                    fontSize: '1.25rem',
                    opacity: 0.5,
                  }}
                >
                  🔒
                </div>
              )}

              <h3
                style={{
                  fontFamily: 'var(--font-hind)',
                  fontSize: '1.75rem',
                  fontWeight: 600,
                  color: stage.locked ? MUTED : IVORY,
                  marginBottom: '0.35rem',
                }}
              >
                {stage.hi}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontStyle: 'italic',
                  fontSize: '1rem',
                  color: stage.color,
                  marginBottom: '1rem',
                }}
              >
                {stage.en}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-hind)',
                  fontSize: '0.9rem',
                  color: MUTED,
                  lineHeight: 1.8,
                }}
              >
                {stage.desc}
              </p>

              {/* Open / locked badge */}
              {!stage.locked ? (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginTop: '1.5rem',
                    padding: '0.35rem 0.9rem',
                    borderRadius: '999px',
                    background: 'rgba(26,92,53,0.3)',
                    border: '1px solid rgba(26,140,80,0.4)',
                    color: '#4ade80',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-inter)',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                  }}
                >
                  ● OPEN
                </div>
              ) : (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginTop: '1.5rem',
                    padding: '0.35rem 0.9rem',
                    borderRadius: '999px',
                    background: 'rgba(13,26,15,0.6)',
                    border: `1px solid ${BORDER}`,
                    color: MUTED,
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-inter)',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                  }}
                >
                  🔒 जल्द आएगा
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,5vw,3rem)',
          background: SURFACE,
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
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
              प्रक्रिया
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-hind)',
                fontSize: 'clamp(1.75rem,4vw,2.5rem)',
                fontWeight: 600,
                color: IVORY,
              }}
            >
              कैसे काम करता है?
            </h2>
          </div>

          {/* Steps */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem',
            }}
          >
            {HOW_STEPS.map((step, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '1rem',
                  padding: '2rem 1.5rem',
                  borderRadius: '16px',
                  background: 'rgba(6,16,8,0.6)',
                  border: `1px solid ${BORDER}`,
                  position: 'relative',
                }}
              >
                {/* Connector line */}
                {i < HOW_STEPS.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: 'calc(-1.5rem - 8px)',
                      width: '1.5rem',
                      height: '1px',
                      background: `linear-gradient(90deg, ${GOLD}, transparent)`,
                      opacity: 0.3,
                      display: 'none', // Hidden on mobile
                    }}
                  />
                )}

                <div style={{ fontSize: '2rem' }}>{step.icon}</div>
                <div
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontStyle: 'italic',
                    fontSize: '0.75rem',
                    color: GOLD,
                    letterSpacing: '0.15em',
                  }}
                >
                  चरण {step.num}
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-hind)',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: IVORY,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-hind)',
                    fontSize: '0.88rem',
                    color: MUTED,
                    lineHeight: 1.9,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,5vw,3rem)',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontStyle: 'italic',
            fontSize: 'clamp(1.25rem,3vw,1.75rem)',
            color: MUTED,
            marginBottom: '1.25rem',
          }}
        >
          यात्रा आरंभ करने के लिए ऊपर अपनी भाषा चुनें
        </p>
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '0.85rem',
            color: 'rgba(212,168,67,0.4)',
          }}
        >
          ॥ सत्यम् शिवम् सुन्दरम् ॥
        </p>

        <div
          style={{
            marginTop: '2rem',
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/"
            style={{
              padding: '0.75rem 2rem',
              border: `1px solid ${BORDER}`,
              borderRadius: '10px',
              color: MUTED,
              fontFamily: 'var(--font-inter)',
              fontSize: '0.85rem',
              textDecoration: 'none',
              background: 'transparent',
            }}
          >
            ← मुख्य पृष्ठ
          </Link>
          <button
            onClick={() => selectLanguage('hi')}
            style={{
              padding: '0.75rem 2rem',
              border: `1px solid ${GOLD}`,
              borderRadius: '10px',
              color: '#061008',
              background: GOLD,
              fontFamily: 'var(--font-hind)',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            हिंदी में आरंभ करें →
          </button>
        </div>
      </section>

      {/* ── Footer note ─────────────────────────────────────── */}
      <div
        style={{
          padding: '1.5rem',
          textAlign: 'center',
          borderTop: `1px solid ${BORDER}`,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '0.72rem',
            color: 'rgba(212,168,67,0.25)',
          }}
        >
          © Nirvan Dham · nirvandham.in
        </p>
      </div>
    </div>
  );
}
