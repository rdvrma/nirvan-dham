'use client';

import Link from 'next/link';
import type { Language } from '@/lib/i18n';

interface PathSectionProps {
  lang: Language;
}

export default function PathSection({ lang }: PathSectionProps) {
  const hi = lang === 'hi';

  return (
    <section id="sadhana" style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
      <video
        autoPlay
        muted
        loop
        playsInline
        src="/course-videos/hero.mp4"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(4,10,6,0.97) 0%, rgba(6,16,8,0.78) 40%, rgba(12,28,14,0.88) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 80% 50%, rgba(212,168,67,0.08) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent 0%, #d4a843 30%, #ffe89a 50%, #d4a843 70%, transparent 100%)' }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', padding: 'clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
          <div style={{ width: '36px', height: '1px', background: 'linear-gradient(90deg, transparent, #d4a843)' }} />
          <span style={{ fontSize: '0.58rem', letterSpacing: '0.32em', color: '#d4a843', textTransform: 'uppercase', fontFamily: 'var(--font-inter)', fontWeight: 700 }}>
            {hi ? 'श्रवण · प्रमुख पाठ्यक्रम' : 'FLAGSHIP COURSE · SHRAVANA'}
          </span>
          <div style={{ width: '36px', height: '1px', background: 'linear-gradient(90deg, #d4a843, transparent)' }} />
        </div>

        <div className="home-course-highlight-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(2rem,6vw,6rem)', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-block', padding: '0.4rem 1rem', border: '1px solid rgba(212,168,67,0.35)', borderRadius: '999px', background: 'rgba(212,168,67,0.08)', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.62rem', color: '#d4a843', letterSpacing: '0.15em', fontFamily: 'var(--font-inter)' }}>
                {hi ? 'पाठ्यक्रम · निर्वाण सूत्र' : 'COURSE · NIRVAN SUTRA'}
              </span>
            </div>

            <h2 style={{
              fontFamily: hi ? 'var(--font-hind)' : 'var(--font-cormorant)',
              fontWeight: hi ? 700 : 300,
              fontSize: 'clamp(3.2rem,6vw,5.5rem)',
              lineHeight: 1,
              color: 'var(--c-ivory)',
              marginBottom: '1.5rem',
              fontStyle: hi ? 'normal' : 'italic',
              letterSpacing: hi ? 0 : '-0.02em',
            }}>
              {hi ? 'आप कौन हैं?' : 'Who are you?'}
            </h2>

            <p style={{ color: 'rgba(245,237,216,0.6)', lineHeight: 1.95, fontSize: 'clamp(0.95rem,1.6vw,1.05rem)', marginBottom: '2.5rem', maxWidth: '480px', fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)' }}>
              {hi
                ? 'निर्वाण सूत्र पाठ्यक्रम साधक को जागरूकता, आत्म-जांच, अद्वैत और सत्य के प्रत्यक्ष दर्शन की ओर ले जाता है। 8 अध्याय। 3 भाषाएं। एक यात्रा।'
                : 'The Nirvan Sutra Course guides the seeker through awareness, self-inquiry, non-duality and direct seeing of truth. 8 Chapters. 3 Languages. One Journey.'}
            </p>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
              {[
                { num: '8', label: hi ? 'अध्याय' : 'Chapters' },
                { num: '3', label: hi ? 'भाषाएं' : 'Languages' },
                { num: '40%', label: hi ? 'उत्तीर्ण मानदंड' : 'Pass Criteria' },
              ].map((stat) => (
                <div key={stat.num}>
                  <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2.8rem', fontWeight: 300, color: '#d4a843', lineHeight: 1 }}>{stat.num}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(245,237,216,0.45)', letterSpacing: '0.08em', fontFamily: 'var(--font-inter)', marginTop: '0.25rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <Link
              href="/course"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '1.1rem 2.5rem', borderRadius: '6px',
                background: 'linear-gradient(135deg, #d4a843 0%, #ffe89a 50%, #c49832 100%)', color: '#061008', textDecoration: 'none',
                fontWeight: 800, fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)', fontSize: '1rem', letterSpacing: '0.04em',
                boxShadow: '0 8px 40px rgba(212,168,67,0.35), 0 2px 12px rgba(212,168,67,0.2)', transition: 'all 0.3s',
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.transform = 'translateY(-3px)';
                event.currentTarget.style.boxShadow = '0 16px 60px rgba(212,168,67,0.5)';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform = 'translateY(0)';
                event.currentTarget.style.boxShadow = '0 8px 40px rgba(212,168,67,0.35)';
              }}
            >
              {hi ? 'पाठ्यक्रम शुरू करें' : 'Start the Course'} →
            </Link>
          </div>

          <div className="home-course-mandala-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: '-24px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,67,0.14) 0%, transparent 70%)', filter: 'blur(14px)', pointerEvents: 'none' }} />
              <svg viewBox="0 0 220 220" width="260" height="260" style={{ display: 'block', opacity: 0.88 }} aria-hidden="true">
                <defs>
                  <radialGradient id="home-course-gold-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffe89a" stopOpacity="0.95" />
                    <stop offset="55%" stopColor="#d4a843" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#c49832" stopOpacity="0" />
                  </radialGradient>
                  <filter id="home-course-soft-blur"><feGaussianBlur stdDeviation="2.5" /></filter>
                </defs>
                <circle cx="110" cy="110" r="98" fill="url(#home-course-gold-glow)" filter="url(#home-course-soft-blur)" />
                {[98, 82, 62, 40, 20].map((radius, index) => <circle key={radius} cx="110" cy="110" r={radius} fill="none" stroke={index === 2 ? '#ffe89a' : '#d4a843'} strokeWidth={index === 0 ? '0.5' : '0.4'} strokeOpacity={0.2 + index * 0.03} />)}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
                  const radians = angle * Math.PI / 180;
                  return <line key={angle} x1={110 + Math.cos(radians) * 22} y1={110 + Math.sin(radians) * 22} x2={110 + Math.cos(radians) * 98} y2={110 + Math.sin(radians) * 98} stroke="#d4a843" strokeWidth="0.3" strokeOpacity="0.18" />;
                })}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                  const radians = angle * Math.PI / 180;
                  const cx = 110 + Math.cos(radians) * 64;
                  const cy = 110 + Math.sin(radians) * 64;
                  return <ellipse key={angle} cx={cx} cy={cy} rx="17" ry="28" transform={`rotate(${angle + 90}, ${cx}, ${cy})`} fill="none" stroke="#d4a843" strokeWidth="0.7" strokeOpacity="0.42" />;
                })}
                {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle) => {
                  const radians = angle * Math.PI / 180;
                  const cx = 110 + Math.cos(radians) * 38;
                  const cy = 110 + Math.sin(radians) * 38;
                  return <ellipse key={angle} cx={cx} cy={cy} rx="10" ry="18" transform={`rotate(${angle + 90}, ${cx}, ${cy})`} fill="none" stroke="#ffe89a" strokeWidth="0.6" strokeOpacity="0.48" />;
                })}
                <circle cx="110" cy="110" r="6" fill="#d4a843" fillOpacity="0.75" />
                <circle cx="110" cy="110" r="3" fill="#ffe89a" fillOpacity="0.95" />
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.62rem', letterSpacing: '0.25em', color: 'rgba(212,168,67,0.7)', textTransform: 'uppercase', fontFamily: 'var(--font-inter)', marginBottom: '0.5rem' }}>
                {hi ? '८ अध्याय · ३ भाषाएं · एक यात्रा' : '8 Chapters · 3 Languages · One Journey'}
              </p>
              <p style={{ fontSize: '0.82rem', color: 'rgba(245,237,216,0.38)', fontFamily: hi ? 'var(--font-hind)' : 'var(--font-cormorant)', fontStyle: hi ? 'normal' : 'italic', letterSpacing: '0.04em' }}>
                {hi ? 'सत्य की खोज में एक पूर्ण यात्रा' : 'A complete journey into truth'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(212,168,67,0.4) 50%, transparent 100%)' }} />

      <style>{`
        @media (max-width: 768px) {
          .home-course-highlight-grid { grid-template-columns: 1fr !important; }
          .home-course-mandala-col { display: none !important; }
        }
      `}</style>
    </section>
  );
}
