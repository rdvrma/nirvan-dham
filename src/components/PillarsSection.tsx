'use client';

import Link from 'next/link';
import type { Language } from '@/lib/i18n';
import SacredBackground from '@/components/SacredBackground';
import { content } from '@/lib/i18n';

interface PillarsSectionProps {
  lang: Language;
}

const PILLAR_GLOWS = [
  'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(212,168,67,0.12) 0%, transparent 70%)',
  'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(42,102,64,0.2) 0%, transparent 70%)',
  'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(212,168,67,0.1) 0%, transparent 70%)',
];

export default function PillarsSection({ lang }: PillarsSectionProps) {
  const t = content[lang].pillars;
  const isHindi = lang === 'hi';
  const pillarLinks = ['/samvad/bodhgaya', '', '/samvad/online'];

  return (
    <section
      id="darshan"
      className="section-pad relative overflow-hidden"
      style={{ background: 'var(--c-mist, #122418)' }}
    >
      {/* Chakra sacred background */}
      <SacredBackground variant="chakra" intensity="soft" />
      {/* Background emerald atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 100% 60% at 50% 50%, rgba(13,31,16,0.6) 0%, transparent 70%)',
        }}
      />
      <div className="absolute inset-0 sacred-grid-bg pointer-events-none" style={{ opacity: 0.3 }} />

      <div className="nd-container" style={{ position: 'relative', zIndex: 10 }}>
        {/* Section header */}
        <div className="nd-section-header">
          <p
            className="pill mx-auto mb-5"
            style={{ width: 'fit-content' }}
          >
            {isHindi ? 'तीन मार्ग' : 'The Three Paths'}
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
            className={isHindi ? '' : 'font-hindi'}
            style={{
              fontSize: 'clamp(0.875rem, 2vw, 1.05rem)',
              color: 'var(--c-ivdim)',
              opacity: 0.6,
              letterSpacing: '0.05em',
            }}
          >
            {t.subheading}
          </p>
        </div>

        {/* Gold divider */}
        <div className="gold-divider mb-16" />

        {/* Three pillar cards */}
        <div className="nd-grid-3">
          {t.items.map((pillar, i) => (
            <div
              key={pillar.title}
              className="group relative overflow-hidden transition-premium"
              style={{
                borderRadius: '8px',
                border: '1px solid rgba(212,168,67,0.1)',
                background: 'rgba(13,31,16,0.6)',
                backdropFilter: 'blur(12px)',
                padding: '2.5rem 2rem',
                cursor: pillarLinks[i] ? 'pointer' : 'default',
                animationDelay: `${i * 0.15}s`,
                transitionDuration: '0.4s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,67,0.25)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 48px rgba(0,0,0,0.4), 0 0 24px rgba(212,168,67,0.08)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,67,0.1)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {/* Bottom glow */}
              <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: PILLAR_GLOWS[i] }}
              />

              {/* Icon */}
              <div
                className="mb-6"
                style={{
                  fontSize: '2.5rem',
                  color: 'var(--c-gold)',
                  filter: 'drop-shadow(0 0 12px rgba(212,168,67,0.3))',
                  lineHeight: 1,
                }}
              >
                {pillar.icon}
              </div>

              {/* Sanskrit + Title */}
              <div className="mb-4">
                <p
                  className="font-hindi"
                  style={{
                    fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                    fontWeight: 600,
                    color: 'var(--c-gold)',
                    lineHeight: 1,
                    marginBottom: '0.25rem',
                    opacity: 0.9,
                  }}
                >
                  {pillar.sanskrit}
                </p>
                <p
                  className="font-serif"
                  style={{
                    fontSize: '0.8rem',
                    letterSpacing: '0.25em',
                    color: 'var(--c-ivdim)',
                    textTransform: 'uppercase',
                    opacity: 0.5,
                  }}
                >
                  {pillar.title}
                </p>
              </div>

              {/* Divider */}
              <div
                style={{
                  height: '1px',
                  width: '40px',
                  background: 'var(--c-gold)',
                  opacity: 0.25,
                  marginBottom: '1rem',
                }}
              />

              {/* Description */}
              <p
                className={isHindi ? 'font-hindi' : ''}
                style={{
                  fontSize: isHindi ? '0.95rem' : '0.9rem',
                  color: 'var(--c-ivdim)',
                  lineHeight: isHindi ? 1.9 : 1.75,
                  opacity: 0.8,
                }}
              >
                {pillar.desc}
              </p>

              {/* Corner accent */}
              <div
                className="absolute top-0 right-0"
                style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(225deg, rgba(212,168,67,0.06), transparent)',
                  borderBottomLeftRadius: '60px',
                }}
              />
              {pillarLinks[i] && (
                <Link
                  href={pillarLinks[i]}
                  aria-label={
                    i === 0
                      ? lang === 'hi'
                        ? 'बोधगया संवाद खोलें'
                        : 'Open Bodhgaya Samvad'
                      : lang === 'hi'
                        ? 'ऑनलाइन संवाद खोलें'
                        : 'Open Online Samvad'
                  }
                  className="absolute inset-0 z-20"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
