'use client';

import { useEffect, useRef } from 'react';
import type { Language } from '@/lib/i18n';
import { content } from '@/lib/i18n';
import SacredBackground from '@/components/SacredBackground';

interface HeroSectionProps {
  lang: Language;
}

export default function HeroSection({ lang }: HeroSectionProps) {
  const t = content[lang].hero;
  const isHindi = lang === 'hi';
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const x = (e.clientX / window.innerWidth  - 0.5) * 15;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      containerRef.current.querySelectorAll('[data-parallax]').forEach((el) => {
        const d = parseFloat((el as HTMLElement).dataset.parallax ?? '1');
        (el as HTMLElement).style.transform = `translate(${x * d}px, ${y * d}px)`;
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      ref={containerRef}
      id="darshan"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'var(--c-bg)',
      }}
    >
      {/* ── Lotus sacred background ── */}
      <SacredBackground variant="lotus" intensity="soft" />

      {/* Emerald atmospheric glow — parallax */}
      <div data-parallax="0.3"
        className="absolute inset-0 pointer-events-none transition-transform duration-700 ease-out"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(26,92,53,0.22) 0%, transparent 70%)' }}
      />
      {/* Gold sunrise glow — parallax */}
      <div data-parallax="0.2"
        className="absolute pointer-events-none transition-transform duration-700 ease-out"
        style={{ top: '-10%', left: '15%', right: '15%', height: '55%',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.1) 0%, transparent 65%)' }}
      />

      {/* Sacred grid */}
      <div className="absolute inset-0 pointer-events-none sacred-grid-bg" style={{ opacity: 0.35 }} />

      {/* ── Hero Content — fully centered ── */}
      <div
        style={{
          position: 'relative', zIndex: 10,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center',
          width: '100%', maxWidth: '800px',
          margin: '0 auto',
          paddingTop: '7rem', paddingBottom: '5rem',
          paddingLeft: 'clamp(1.25rem, 4vw, 2rem)',
          paddingRight: 'clamp(1.25rem, 4vw, 2rem)',
        }}
      >
        {/* Eyebrow pill */}
        <div className="pill mb-8"
          style={{ animation: 'fadeIn 0.8s ease forwards', animationDelay: '0.1s', opacity: 0 }}>
          <span className={isHindi ? 'font-hindi' : ''} style={{ fontSize: isHindi ? '0.8rem' : '0.7rem' }}>
            {t.eyebrow}
          </span>
        </div>

        {/* Main heading */}
        <h1
          className={`text-shimmer ${isHindi ? 'font-hindi' : 'font-serif'}`}
          style={{
            fontSize: isHindi ? 'clamp(3.5rem, 12vw, 8rem)' : 'clamp(3rem, 10vw, 7.5rem)',
            fontWeight: isHindi ? 700 : 300,
            lineHeight: isHindi ? 1.16 : 1.05,
            marginBottom: '1.75rem',
            paddingTop: isHindi ? '0.12em' : 0,
            paddingBottom: isHindi ? '0.04em' : 0,
            animation: 'fadeInUp 1s ease forwards',
            animationDelay: '0.2s',
            opacity: 0,
            width: '100%',
            textAlign: 'center',
          }}
        >
          {t.heading}
        </h1>

        {/* Gold ornament */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem', animation: 'fadeIn 1s ease forwards', animationDelay: '0.4s', opacity: 0 }}>
          <div style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, transparent, var(--c-gold))', opacity: 0.35 }} />
          <span style={{ color: 'var(--c-gold)', fontSize: '1.1rem', opacity: 0.55, animation: 'glowPulse 3s ease-in-out infinite' }}>◈</span>
          <div style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, var(--c-gold), transparent)', opacity: 0.35 }} />
        </div>

        {/* Subtext */}
        <p
          className={isHindi ? 'font-hindi' : 'font-serif'}
          style={{
            fontSize: isHindi ? 'clamp(1rem, 2.5vw, 1.3rem)' : 'clamp(1.05rem, 2.2vw, 1.35rem)',
            fontWeight: isHindi ? 400 : 300,
            color: 'var(--c-ivdim)',
            maxWidth: '600px',
            lineHeight: isHindi ? 2 : 1.75,
            fontStyle: isHindi ? 'normal' : 'italic',
            marginBottom: '3rem',
            animation: 'fadeInUp 1s ease forwards',
            animationDelay: '0.5s',
            opacity: 0,
            textAlign: 'center',
            width: '100%',
          }}
        >
          {t.subtext}
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', alignItems: 'center', animation: 'fadeInUp 1s ease forwards', animationDelay: '0.7s', opacity: 0 }}>

          {/* Primary */}
          <a href="#sadhana"
            className={`transition-premium ${isHindi ? 'font-hindi' : ''}`}
            style={{
              position: 'relative', overflow: 'hidden',
              padding: '0.9rem 2rem', borderRadius: '4px',
              background: 'var(--c-gold)', color: 'var(--c-bg)',
              fontWeight: 600, fontSize: isHindi ? '0.95rem' : '0.875rem',
              textDecoration: 'none', display: 'inline-flex',
              alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 0 30px rgba(212,168,67,0.25)',
              transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#e8c060'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--c-gold)'; }}
          >
            <span style={{ position: 'relative', zIndex: 1 }}>{t.cta1}</span>
            <span style={{ position: 'relative', zIndex: 1, fontSize: '1.1em' }}>→</span>
          </a>

          {/* Secondary */}
          <a href="/library"
            className={`transition-premium ${isHindi ? 'font-hindi' : ''}`}
            style={{
              position: 'relative', overflow: 'hidden',
              padding: '0.9rem 2rem', borderRadius: '4px',
              border: '1px solid rgba(212,168,67,0.3)',
              background: 'rgba(212,168,67,0.06)', color: 'var(--c-ivory)',
              fontWeight: 500, fontSize: isHindi ? '0.95rem' : '0.875rem',
              textDecoration: 'none', display: 'inline-flex',
              alignItems: 'center', gap: '0.5rem',
              transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(212,168,67,0.12)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(212,168,67,0.06)'; }}
          >
            <span style={{ color: 'var(--c-gold)', fontSize: '1.1em' }}>✦</span>
            <span>{isHindi ? 'पुस्तकालय' : 'Library'}</span>
          </a>

          {/* Tertiary */}
          <a href="#guidance"
            className={`transition-premium ${isHindi ? 'font-hindi' : ''}`}
            style={{
              padding: '0.9rem 2rem', borderRadius: '4px',
              border: '1px solid rgba(245,237,216,0.12)',
              background: 'transparent', color: 'var(--c-ivdim)',
              fontWeight: 400, fontSize: isHindi ? '0.95rem' : '0.875rem',
              textDecoration: 'none', display: 'inline-flex',
              alignItems: 'center', gap: '0.5rem',
            }}
          >
            {t.cta3}
          </a>
        </div>

        {/* Scroll indicator */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '4rem', animation: 'fadeIn 1s ease forwards', animationDelay: '1.2s', opacity: 0 }}>
          <span style={{
            fontSize: '0.65rem', letterSpacing: '0.22em',
            color: 'var(--c-ivdim)', opacity: 0.35, textTransform: 'uppercase',
          }}>
            {t.scroll}
          </span>
          <div style={{
            width: '1px', height: '40px',
            background: 'linear-gradient(180deg, var(--c-gold), transparent)',
            opacity: 0.3, animation: 'float 2s ease-in-out infinite',
          }} />
        </div>
      </div>

      {/* Bottom fade */}
      <div
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, pointerEvents: 'none',
          height: '200px', background: 'linear-gradient(180deg, transparent, var(--c-bg))' }} />
    </section>
  );
}
