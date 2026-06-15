'use client';

import Link from 'next/link';
import type { Language } from '@/lib/i18n';
import SacredBackground from '@/components/SacredBackground';
import { content } from '@/lib/i18n';

interface PathSectionProps {
  lang: Language;
}

const STAGE_COLORS = [
  { accent: '#d4a843', bg: 'rgba(212,168,67,0.05)', ring: 'rgba(212,168,67,0.25)' },
  { accent: '#3d8a58', bg: 'rgba(61,138,88,0.05)',  ring: 'rgba(61,138,88,0.2)'  },
  { accent: '#8b6cc8', bg: 'rgba(139,108,200,0.05)', ring: 'rgba(139,108,200,0.2)' },
];

const STAGE_NUMBERS = ['01', '02', '03'];

export default function PathSection({ lang }: PathSectionProps) {
  const t = content[lang].path;
  const isHindi = lang === 'hi';

  return (
    <section
      id="sadhana"
      className="section-pad relative overflow-hidden"
      style={{ background: 'var(--c-bg)' }}
    >
      {/* Sri Yantra sacred background */}
      <SacredBackground variant="sri-yantra" intensity="soft" />
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 80%, rgba(26,92,53,0.1) 0%, transparent 70%)',
        }}
      />

      <div className="nd-container" style={{ position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div className="nd-section-header">
          <p className="pill mx-auto mb-5" style={{ width: 'fit-content' }}>
            {isHindi ? 'आंतरिक यात्रा' : 'Inner Journey'}
          </p>
          <h2
            className={`font-serif ${isHindi ? 'font-hindi' : ''}`}
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: isHindi ? 600 : 300,
              color: 'var(--c-ivory)',
              marginBottom: '0.5rem',
              lineHeight: 1.1,
            }}
          >
            {t.heading}
          </h2>
          <p
            className={!isHindi ? 'font-hindi' : ''}
            style={{
              fontSize: 'clamp(0.875rem, 2vw, 1.05rem)',
              color: 'var(--c-ivdim)',
              opacity: 0.6,
            }}
          >
            {t.subheading}
          </p>
        </div>

        {/* Path cards — vertical journey feel */}
        <div className="relative">
          {/* Connecting line */}
          <div
            className="absolute hidden lg:block"
            style={{
              left: '50%',
              top: 0,
              bottom: 0,
              width: '1px',
              background: 'linear-gradient(180deg, transparent, rgba(212,168,67,0.15), rgba(212,168,67,0.15), transparent)',
              transform: 'translateX(-50%)',
            }}
          />

          <div className="nd-grid-3">
            {t.cards.map((card, i) => {
              const color = STAGE_COLORS[i];
              const num = STAGE_NUMBERS[i];
              return (
                <div
                  key={card.level}
                  className="group relative transition-premium"
                  style={{
                    borderRadius: '12px',
                    border: `1px solid ${card.available ? color.ring : 'rgba(212,168,67,0.06)'}`,
                    background: `rgba(13,31,16,0.5)`,
                    backdropFilter: 'blur(12px)',
                    overflow: 'hidden',
                    opacity: card.available ? 1 : 0.7,
                    transitionDuration: '0.4s',
                  }}
                  onMouseEnter={(e) => {
                    if (!card.available) return;
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 48px rgba(0,0,0,0.5), 0 0 30px ${color.bg}`;
                    (e.currentTarget as HTMLElement).style.borderColor = color.accent;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    (e.currentTarget as HTMLElement).style.borderColor = card.available ? color.ring : 'rgba(212,168,67,0.06)';
                  }}
                >
                  {/* Top accent bar */}
                  <div
                    style={{
                      height: '3px',
                      background: card.available
                        ? `linear-gradient(90deg, transparent, ${color.accent}, transparent)`
                        : 'rgba(212,168,67,0.08)',
                    }}
                  />

                  <div style={{ padding: '2rem 1.75rem 2.25rem' }}>
                    {/* Stage number + availability tag */}
                    <div className="flex items-start justify-between mb-5">
                      <span
                        className="font-serif"
                        style={{
                          fontSize: '3rem',
                          fontWeight: 300,
                          color: color.accent,
                          opacity: 0.2,
                          lineHeight: 1,
                          fontStyle: 'italic',
                        }}
                      >
                        {num}
                      </span>
                      <span
                        style={{
                          padding: '0.2rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          background: card.available
                            ? `${color.accent}22`
                            : 'rgba(212,168,67,0.05)',
                          color: card.available ? color.accent : 'var(--c-ivdim)',
                          border: `1px solid ${card.available ? color.accent + '44' : 'rgba(212,168,67,0.1)'}`,
                        }}
                      >
                        {card.tag}
                      </span>
                    </div>

                    {/* Level labels */}
                    <div className="mb-3">
                      <p
                        className={`font-hindi`}
                        style={{
                          fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)',
                          fontWeight: 600,
                          color: 'var(--c-ivory)',
                          lineHeight: 1.2,
                        }}
                      >
                        {card.level}
                      </p>
                      <p
                        className={!isHindi ? 'font-hindi' : ''}
                        style={{
                          fontSize: '0.75rem',
                          color: color.accent,
                          opacity: 0.7,
                          letterSpacing: '0.05em',
                          marginTop: '2px',
                        }}
                      >
                        {card.label}
                      </p>
                    </div>

                    {/* Card title */}
                    <p
                      className={`font-serif ${isHindi ? 'font-hindi' : ''}`}
                      style={{
                        fontSize: isHindi ? '1.1rem' : '1.15rem',
                        fontWeight: isHindi ? 500 : 400,
                        color: 'var(--c-ivory)',
                        fontStyle: isHindi ? 'normal' : 'italic',
                        marginBottom: '1rem',
                        lineHeight: 1.3,
                      }}
                    >
                      {card.title}
                    </p>

                    {/* Divider */}
                    <div
                      style={{
                        height: '1px',
                        background: `linear-gradient(90deg, ${color.accent}33, transparent)`,
                        marginBottom: '1rem',
                      }}
                    />

                    {/* Description */}
                    <p
                      className={isHindi ? 'font-hindi' : ''}
                      style={{
                        fontSize: isHindi ? '0.9rem' : '0.875rem',
                        color: 'var(--c-ivdim)',
                        lineHeight: isHindi ? 1.9 : 1.75,
                        opacity: 0.75,
                      }}
                    >
                      {card.desc}
                    </p>

                    {/* CTA */}
                    {card.available && (
                      <Link
                        href="/guided-meditation"
                        className={`mt-6 block transition-premium w-full text-center ${isHindi ? 'font-hindi' : ''}`}
                        style={{
                          padding: '0.75rem 1.5rem',
                          borderRadius: '4px',
                          border: `1px solid ${color.accent}55`,
                          background: `${color.accent}11`,
                          color: color.accent,
                          fontWeight: 500,
                          fontSize: isHindi ? '0.9rem' : '0.8rem',
                          letterSpacing: isHindi ? '0' : '0.04em',
                          textDecoration: 'none',
                          display: 'block',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = `${color.accent}22`;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = `${color.accent}11`;
                        }}
                      >
                        {isHindi ? 'प्रारंभ करें →' : 'Begin Journey →'}
                      </Link>
                    )}
                  </div>

                  {/* Unavailable overlay pattern */}
                  {!card.available && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(0,0,0,0.04) 8px, rgba(0,0,0,0.04) 9px)',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
