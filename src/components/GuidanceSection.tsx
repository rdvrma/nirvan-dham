'use client';

import type { Language } from '@/lib/i18n';
import SacredBackground from '@/components/SacredBackground';
import { content } from '@/lib/i18n';

interface GuidanceSectionProps {
  lang: Language;
}

export default function GuidanceSection({ lang }: GuidanceSectionProps) {
  const t = content[lang].guidance;
  const isHindi = lang === 'hi';

  return (
    <section
      id="guidance"
      className="section-pad relative overflow-hidden"
      style={{ background: 'var(--c-mist, #122418)' }}
    >
      {/* River energy lines sacred background */}
      <SacredBackground variant="river" intensity="soft" />
      {/* Atmospheric emerald glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(26,92,53,0.2) 0%, transparent 70%)',
        }}
      />

      {/* Sacred geometry ring — large, very subtle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          style={{
            width: 'min(100vw, 800px)',
            height: 'min(100vw, 800px)',
            borderRadius: '50%',
            border: '1px solid rgba(212,168,67,0.04)',
            animation: 'sacredSpin 80s linear infinite',
          }}
        />
      </div>

      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: '860px',
        marginLeft: 'auto', marginRight: 'auto',
        paddingLeft: 'clamp(1.25rem, 4vw, 3rem)',
        paddingRight: 'clamp(1.25rem, 4vw, 3rem)',
        textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        {/* Om symbol floating */}
        <div
          className="mx-auto mb-8"
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            color: 'var(--c-gold)',
            filter: 'drop-shadow(0 0 20px rgba(212,168,67,0.3))',
            animation: 'float 6s ease-in-out infinite',
            lineHeight: 1,
          }}
        >
          ॐ
        </div>

        <p className="pill mx-auto mb-6" style={{ width: 'fit-content' }}>
          {t.heading}
        </p>

        <h2
          className={`font-serif ${isHindi ? 'font-hindi' : ''}`}
          style={{
            fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
            fontWeight: isHindi ? 600 : 300,
            color: 'var(--c-ivory)',
            lineHeight: 1.1,
            marginBottom: '0.5rem',
          }}
        >
          {t.heading}
        </h2>

        <p
          className={`font-serif ${isHindi ? 'font-hindi' : ''}`}
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
            fontWeight: 300,
            color: 'var(--c-gold)',
            fontStyle: isHindi ? 'normal' : 'italic',
            marginBottom: '2rem',
            opacity: 0.8,
          }}
        >
          {t.subheading}
        </p>

        {/* Divider */}
        <div className="gold-divider max-w-xs mx-auto mb-8" />

        <p
          className={`mx-auto mb-6 ${isHindi ? 'font-hindi' : 'font-serif'}`}
          style={{
            fontSize: isHindi ? '1rem' : '1.1rem',
            color: 'var(--c-ivdim)',
            lineHeight: isHindi ? 2 : 1.8,
            maxWidth: '560px',
            fontStyle: isHindi ? 'normal' : 'italic',
            opacity: 0.85,
          }}
        >
          {t.desc}
        </p>

        {/* Donation note */}
        <div
          className="inline-flex items-center gap-2 mb-10"
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '9999px',
            border: '1px solid rgba(212,168,67,0.15)',
            background: 'rgba(212,168,67,0.04)',
          }}
        >
          <span style={{ color: 'var(--c-gold)', fontSize: '0.85rem' }}>◈</span>
          <p
            className={isHindi ? 'font-hindi' : ''}
            style={{
              fontSize: isHindi ? '0.85rem' : '0.8rem',
              color: 'var(--c-ivdim)',
              opacity: 0.7,
              letterSpacing: isHindi ? '0' : '0.04em',
            }}
          >
            {t.note}
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="https://wa.me/919334325558"
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative overflow-hidden transition-premium ${isHindi ? 'font-hindi' : ''}`}
            style={{
              padding: '1rem 2.25rem',
              borderRadius: '4px',
              background: 'var(--c-gold)',
              color: 'var(--c-bg)',
              fontWeight: 600,
              fontSize: isHindi ? '0.95rem' : '0.875rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 0 30px rgba(212,168,67,0.2)',
            }}
          >
            <span style={{ fontSize: '1.1em' }}>💬</span>
            <span>{t.cta}</span>
          </a>

          <a
            href="mailto:aadisatv@gmail.com"
            className={`group transition-premium ${isHindi ? 'font-hindi' : ''}`}
            style={{
              padding: '1rem 2.25rem',
              borderRadius: '4px',
              border: '1px solid rgba(212,168,67,0.25)',
              background: 'rgba(212,168,67,0.06)',
              color: 'var(--c-ivory)',
              fontWeight: 400,
              fontSize: isHindi ? '0.95rem' : '0.875rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span style={{ fontSize: '1.1em' }}>✉</span>
            <span>{t.emailCta}</span>
          </a>
        </div>

        {/* Location tags */}
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          {t.locationTags.map((tag) => (
            <span
              key={tag}
              className={isHindi ? 'font-hindi' : ''}
              style={{
                padding: '0.35rem 1rem',
                borderRadius: '9999px',
                border: '1px solid rgba(245,237,216,0.1)',
                background: 'rgba(245,237,216,0.03)',
                fontSize: isHindi ? '0.85rem' : '0.8rem',
                color: 'var(--c-ivdim)',
                opacity: 0.7,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
