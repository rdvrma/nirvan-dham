'use client';

import Link from 'next/link';
import type { Language } from '@/lib/i18n';
import SacredBackground from '@/components/SacredBackground';
import { content } from '@/lib/i18n';

interface YouTubeSectionProps {
  lang: Language;
}

export default function YouTubeSection({ lang }: YouTubeSectionProps) {
  const t = content[lang].youtube;
  const isHindi = lang === 'hi';

  const channels = [
    { ...t.channels[0], url: 'https://youtube.com/@theonenessproject' },
    { ...t.channels[1], url: 'https://youtube.com/@dhamnirvan' },
  ];

  return (
    <section
      id="darshan-source"
      className="section-pad relative overflow-hidden"
      style={{ background: 'var(--c-bg)' }}
    >
      <SacredBackground variant="cosmos" intensity="soft" />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(13,31,16,0.8) 0%, transparent 70%)',
      }} />

      {/* Container */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: '900px',
        marginLeft: 'auto', marginRight: 'auto',
        paddingLeft: 'clamp(1.25rem, 4vw, 3rem)',
        paddingRight: 'clamp(1.25rem, 4vw, 3rem)',
      }}>

        {/* Header — centered */}
        <div style={{ textAlign: 'center', marginBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p className="pill" style={{ marginBottom: '1.25rem' }}>
            {isHindi ? 'ज्ञान का स्रोत' : 'Source of Wisdom'}
          </p>
          <h2
            className={isHindi ? 'font-hindi' : 'font-serif'}
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: isHindi ? 600 : 300,
              color: 'var(--c-ivory)',
              marginBottom: '0.75rem',
              textAlign: 'center',
            }}
          >
            {t.heading}
          </h2>
          <p
            className={isHindi ? 'font-hindi' : 'font-serif'}
            style={{
              fontSize: '0.9rem',
              color: 'var(--c-ivdim)',
              opacity: 0.6,
              fontStyle: isHindi ? 'normal' : 'italic',
              textAlign: 'center',
            }}
          >
            {t.subheading}
          </p>
        </div>

        {/* AI learning note — centered */}
        <div style={{
          maxWidth: '560px',
          marginLeft: 'auto', marginRight: 'auto',
          marginBottom: '3rem',
          padding: '1.25rem 1.5rem',
          borderRadius: '8px',
          background: 'rgba(26,92,53,0.12)',
          border: '1px solid rgba(61,138,88,0.2)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🧠</div>
          <p
            className={isHindi ? 'font-hindi' : ''}
            style={{
              fontSize: isHindi ? '0.9rem' : '0.875rem',
              color: 'var(--c-ivdim)',
              lineHeight: isHindi ? 1.9 : 1.7,
              opacity: 0.85,
            }}
          >
            {t.desc}
          </p>
          <Link
            href="/nirvan-sutra"
            className={isHindi ? 'font-hindi' : ''}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '1.1rem',
              padding: '0.72rem 1rem',
              borderRadius: '4px',
              border: '1px solid rgba(212,168,67,0.32)',
              background: 'rgba(212,168,67,0.08)',
              color: 'var(--c-gold)',
              textDecoration: 'none',
              fontSize: isHindi ? '0.9rem' : '0.82rem',
              fontWeight: 700,
              letterSpacing: isHindi ? '0' : '0.06em',
            }}
          >
            {isHindi ? 'शिक्षाएँ देखें' : 'Open Teachings'} →
          </Link>
        </div>

        {/* Channel cards — 2-column grid pure CSS */}
        <div className="nd-grid-2">
          {channels.map((ch, i) => (
            <a
              key={i}
              href={ch.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                borderRadius: '10px',
                border: '1px solid rgba(255,68,68,0.12)',
                background: 'rgba(13,31,16,0.6)',
                backdropFilter: 'blur(12px)',
                padding: '1.75rem',
                textDecoration: 'none',
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,68,68,0.3)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,68,68,0.12)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {/* YouTube play icon */}
              <div style={{
                width: '44px', height: '44px', borderRadius: '10px',
                background: 'rgba(255,68,68,0.12)', border: '1px solid rgba(255,68,68,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1rem', fontSize: '1.2rem', color: 'rgba(255,68,68,0.8)',
              }}>▶</div>

              <p style={{
                fontSize: '0.72rem', letterSpacing: '0.15em',
                color: 'rgba(255,68,68,0.65)', marginBottom: '0.25rem',
                textTransform: 'uppercase',
              }}>
                {ch.handle}
              </p>

              <p
                className={`font-serif ${isHindi ? 'font-hindi' : ''}`}
                style={{
                  fontSize: '1.1rem',
                  fontWeight: isHindi ? 500 : 400,
                  color: 'var(--c-ivory)',
                  marginBottom: '0.75rem',
                  fontStyle: isHindi ? 'normal' : 'italic',
                }}
              >
                {ch.name}
              </p>

              <p
                className={isHindi ? 'font-hindi' : ''}
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--c-ivdim)',
                  opacity: 0.7,
                  lineHeight: isHindi ? 1.8 : 1.6,
                }}
              >
                {ch.desc}
              </p>

              <div style={{
                position: 'absolute', bottom: '1rem', right: '1rem',
                color: 'rgba(255,68,68,0.5)', fontSize: '1.1rem',
                opacity: 0,
                transition: 'opacity 0.3s',
              }}>↗</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
