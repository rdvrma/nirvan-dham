'use client';

import Image from 'next/image';
import type { Language } from '@/lib/i18n';
import SacredBackground from '@/components/SacredBackground';
import { content } from '@/lib/i18n';

interface AppSectionProps {
  lang: Language;
}

export default function AppSection({ lang }: AppSectionProps) {
  const t = content[lang].app;
  const isHindi = lang === 'hi';

  return (
    <section
      id="app"
      className="section-pad relative overflow-hidden"
      style={{ background: 'var(--c-bg)' }}
    >
      {/* Sacred background */}
      <SacredBackground variant="seed" intensity="soft" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(26,92,53,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="nd-container">

        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="pill mx-auto mb-5" style={{ width: 'fit-content' }}>
            {t.pill}
          </p>
          <h2
            className={isHindi ? 'font-hindi' : 'font-serif'}
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: isHindi ? 600 : 300,
              color: 'var(--c-ivory)',
              marginBottom: '0.75rem',
            }}
          >
            {t.heading}
          </h2>
          <p
            className={isHindi ? 'font-hindi' : 'font-serif'}
            style={{
              fontSize: isHindi ? '1rem' : '1.05rem',
              color: 'var(--c-ivdim)',
              fontStyle: isHindi ? 'normal' : 'italic',
              opacity: 0.7,
              maxWidth: '500px',
              margin: '0 auto',
              lineHeight: isHindi ? 1.9 : 1.7,
            }}
          >
            {t.desc}
          </p>
        </div>

        {/* Main layout — screenshots + info */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem' }}
          className="lg-row">

          {/* ── Phone Screenshots ── */}
          <div
            className="phone-mockup-wrapper"
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: 'clamp(1rem, 3vw, 2.5rem)',
              position: 'relative',
          }}>

            {/* Glow behind phones */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 80%, rgba(212,168,67,0.08) 0%, transparent 70%)',
              zIndex: 0,
            }} />

            {/* Phone 1 — Splash screen */}
            <div style={{
              position: 'relative',
              zIndex: 1,
              transform: 'translateY(16px) rotate(-3deg)',
              filter: 'drop-shadow(0 24px 40px rgba(0,0,0,0.55))',
              transition: 'transform 0.5s ease',
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(4px) rotate(-1deg) scale(1.03)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(16px) rotate(-3deg)'; }}
            >
              <div style={{
                width: 'clamp(190px, 25vw, 260px)',
                borderRadius: '32px',
                border: '2px solid rgba(212,168,67,0.25)',
                overflow: 'hidden',
                background: '#1a0f08',
                boxShadow: '0 0 0 1px rgba(212,168,67,0.08), inset 0 0 0 1px rgba(255,255,255,0.04)',
              }}>
                <div style={{
                  background: '#1a0f08',
                  height: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 14px',
                }}>
                  <span style={{ fontSize: '8px', color: '#c4966a', fontWeight: 700 }}>13:53</span>
                  <div style={{ width: '36px', height: '6px', borderRadius: '3px', background: '#3a2010' }} />
                </div>
                <Image
                  src="/app-screenshots/app-splash.png"
                  alt="Nirvan Sutra App Splash Screen"
                  width={260}
                  height={520}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  priority
                />
              </div>
              <p style={{
                textAlign: 'center', fontSize: '0.65rem',
                color: 'var(--c-gold)', opacity: 0.45,
                marginTop: '0.75rem', letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                {t.splashLabel}
              </p>
            </div>

            {/* Phone 2 — Home screen (in front, straight) */}
            <div style={{
              position: 'relative',
              zIndex: 2,
              filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.7))',
              transition: 'transform 0.5s ease',
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px) scale(1.03)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              {/* Phone frame — same width as splash */}
              <div style={{
                width: 'clamp(190px, 25vw, 260px)',
                borderRadius: '32px',
                border: '2px solid rgba(212,168,67,0.4)',
                overflow: 'hidden',
                background: '#fff',
                boxShadow: '0 0 0 1px rgba(212,168,67,0.15), 0 0 40px rgba(212,168,67,0.08), inset 0 0 0 1px rgba(255,255,255,0.06)',
              }}>
                {/* Status bar */}
                <div style={{
                  background: '#fff',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 12px',
                }}>
                  <span style={{ fontSize: '8px', fontWeight: 700, color: '#333' }}>13:54</span>
                  <div style={{ width: '40px', height: '6px', borderRadius: '3px', background: '#ddd' }} />
                </div>
                <Image
                  src="/app-screenshots/app-home.jpg"
                  alt="Nirvan Sutra App Home Screen"
                  width={260}
                  height={520}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  priority
                />
              </div>
              {/* Gold glow ring around featured phone */}
              <div style={{
                position: 'absolute',
                inset: '-8px',
                borderRadius: '38px',
                border: '1px solid rgba(212,168,67,0.15)',
                pointerEvents: 'none',
                animation: 'glowPulse 4s ease-in-out infinite',
              }} />
              {/* Label */}
              <p style={{
                textAlign: 'center',
                fontSize: '0.65rem',
                color: 'var(--c-gold)',
                opacity: 0.6,
                marginTop: '0.75rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                {t.homeLabel}
              </p>
            </div>
          </div>

          {/* ── Info Side ── */}
          <div className="flex-1 text-center lg:text-left">

            {/* Coming Soon badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              background: 'rgba(61,138,88,0.12)',
              border: '1px solid rgba(61,138,88,0.3)',
              marginBottom: '1.5rem',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3d8a58', animation: 'glowPulse 2s ease-in-out infinite', display: 'inline-block' }} />
              <span className={isHindi ? 'font-hindi' : ''} style={{ fontSize: '0.75rem', color: 'var(--c-sage)', letterSpacing: '0.08em', fontWeight: 500 }}>
                {t.status}
              </span>
            </div>

            {/* App name */}
            <h3 className="font-serif" style={{
              fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)',
              fontWeight: 300,
              color: 'var(--c-ivory)',
              marginBottom: '0.25rem',
              fontStyle: 'italic',
            }}>
              Nirvan Sutra
            </h3>
            <p className="font-hindi" style={{
              fontSize: '1rem',
              color: 'var(--c-gold)',
              opacity: 0.7,
              marginBottom: '1.5rem',
              letterSpacing: '0.05em',
            }}>
              निर्वाण सूत्र
            </p>

            <p className={isHindi ? 'font-hindi' : ''} style={{
              fontSize: isHindi ? '0.95rem' : '0.9rem',
              color: 'var(--c-ivdim)',
              lineHeight: isHindi ? 2 : 1.75,
              marginBottom: '2rem',
              opacity: 0.8,
            }}>
              {t.detail}
            </p>

            {/* Feature list */}
            <div className="flex flex-col gap-3 mb-8">
              {['🎧', '📖', '🤖', '📈'].map((icon, index) => (
                <div key={t.features[index]} className="flex items-center gap-3 justify-center lg:justify-start">
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{icon}</span>
                  <span
                    className={isHindi ? 'font-hindi' : ''}
                    style={{ fontSize: isHindi ? '0.9rem' : '0.85rem', color: 'var(--c-ivdim)', opacity: 0.85 }}
                  >
                    {t.features[index]}
                  </span>
                </div>
              ))}
            </div>

            {/* Notify button */}
            <button
              className={`transition-premium ${isHindi ? 'font-hindi' : ''}`}
              style={{
                padding: '0.85rem 2rem',
                borderRadius: '4px',
                border: '1px solid rgba(212,168,67,0.35)',
                background: 'rgba(212,168,67,0.08)',
                color: 'var(--c-gold)',
                fontWeight: 600,
                fontSize: isHindi ? '0.9rem' : '0.85rem',
                cursor: 'pointer',
                letterSpacing: isHindi ? '0' : '0.04em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(212,168,67,0.18)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(212,168,67,0.08)'; }}
            >
              🔔 {t.cta}
            </button>

            {/* Platform tags */}
            <div className="flex gap-2 flex-wrap justify-center lg:justify-start mt-4">
              {['Android', 'iOS'].map((p) => (
                <span key={p} style={{
                  padding: '0.2rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.7rem',
                  color: 'var(--c-ivdim)',
                  background: 'rgba(245,237,216,0.04)',
                  border: '1px solid rgba(245,237,216,0.08)',
                  opacity: 0.6,
                  letterSpacing: '0.05em',
                }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
