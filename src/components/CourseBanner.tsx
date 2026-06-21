'use client';

import Link from 'next/link';

interface CourseBannerProps {
  lang?: 'hi' | 'en';
  variant?: 'full' | 'strip';
}

// ── Lotus Mandala SVG ──────────────────────────────────────
function LotusMandala() {
  return (
    <svg
      viewBox="0 0 200 200"
      width="200"
      height="200"
      style={{ display: 'block', opacity: 0.85 }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="cb-gold-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe89a" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#d4a843" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#c49832" stopOpacity="0" />
        </radialGradient>
        <filter id="cb-blur">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Glow halo */}
      <circle cx="100" cy="100" r="88" fill="url(#cb-gold-glow)" filter="url(#cb-blur)" />

      {/* Outer ring */}
      <circle cx="100" cy="100" r="88" fill="none" stroke="#d4a843" strokeWidth="0.6" strokeOpacity="0.35" />
      <circle cx="100" cy="100" r="72" fill="none" stroke="#d4a843" strokeWidth="0.4" strokeOpacity="0.25" />
      <circle cx="100" cy="100" r="54" fill="none" stroke="#d4a843" strokeWidth="0.5" strokeOpacity="0.3" />

      {/* Radial spokes */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
        const r = (angle * Math.PI) / 180;
        return (
          <line
            key={angle}
            x1={100 + Math.cos(r) * 20}
            y1={100 + Math.sin(r) * 20}
            x2={100 + Math.cos(r) * 88}
            y2={100 + Math.sin(r) * 88}
            stroke="#d4a843"
            strokeWidth="0.35"
            strokeOpacity="0.2"
          />
        );
      })}

      {/* 8 Lotus petals outer */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const r = (angle * Math.PI) / 180;
        const cx = 100 + Math.cos(r) * 58;
        const cy = 100 + Math.sin(r) * 58;
        return (
          <ellipse
            key={angle}
            cx={cx}
            cy={cy}
            rx="16"
            ry="26"
            transform={`rotate(${angle + 90}, ${cx}, ${cy})`}
            fill="none"
            stroke="#d4a843"
            strokeWidth="0.7"
            strokeOpacity="0.45"
          />
        );
      })}

      {/* 8 Inner petals */}
      {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle) => {
        const r = (angle * Math.PI) / 180;
        const cx = 100 + Math.cos(r) * 34;
        const cy = 100 + Math.sin(r) * 34;
        return (
          <ellipse
            key={angle}
            cx={cx}
            cy={cy}
            rx="9"
            ry="17"
            transform={`rotate(${angle + 90}, ${cx}, ${cy})`}
            fill="none"
            stroke="#ffe89a"
            strokeWidth="0.6"
            strokeOpacity="0.5"
          />
        );
      })}

      {/* Centre dot */}
      <circle cx="100" cy="100" r="5" fill="#d4a843" fillOpacity="0.7" />
      <circle cx="100" cy="100" r="2.5" fill="#ffe89a" fillOpacity="0.9" />
    </svg>
  );
}

// ── Full Banner (for Library page) ────────────────────────
function FullBanner({ hi }: { hi: boolean }) {
  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #050e07 0%, #0a1c0d 40%, #061008 100%)',
      }}
    >
      {/* Gold shimmer top border */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent, #d4a843 25%, #ffe89a 50%, #d4a843 75%, transparent)',
      }} />

      {/* Gold shimmer bottom border */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.4) 50%, transparent)',
      }} />

      {/* Background radial glows */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 80% at 80% 50%, rgba(212,168,67,0.06) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 40% 60% at 15% 50%, rgba(42,102,64,0.12) 0%, transparent 70%)',
      }} />

      <div style={{
        position: 'relative', zIndex: 2,
        maxWidth: '1180px', margin: '0 auto',
        padding: 'clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,4rem)',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 'clamp(2rem,5vw,5rem)',
        alignItems: 'center',
      }}
        className="cb-full-grid"
      >
        {/* LEFT — text */}
        <div>
          {/* Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ width: '32px', height: '1px', background: 'linear-gradient(90deg, transparent, #d4a843)' }} />
            <span style={{
              fontSize: '0.56rem', letterSpacing: '0.35em', color: '#d4a843',
              textTransform: 'uppercase', fontFamily: 'var(--font-inter)', fontWeight: 700,
            }}>
              {hi ? 'श्रवण · प्रमुख पाठ्यक्रम' : 'SHRAVANA · FLAGSHIP COURSE'}
            </span>
            <div style={{ width: '32px', height: '1px', background: 'linear-gradient(90deg, #d4a843, transparent)' }} />
          </div>

          {/* Headline */}
          <h2 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(2.4rem, 5vw, 4.5rem)',
            fontWeight: hi ? 600 : 300,
            fontStyle: hi ? 'normal' : 'italic',
            lineHeight: 1.05,
            color: 'var(--c-ivory)',
            marginBottom: '1.25rem',
            fontFamily: hi ? 'var(--font-hind)' : 'var(--font-cormorant)',
          } as React.CSSProperties}>
            {hi ? 'आप कौन हैं?' : 'Who are you?'}
          </h2>

          {/* Body */}
          <p style={{
            color: 'rgba(245,237,216,0.58)',
            fontSize: 'clamp(0.95rem, 1.6vw, 1.05rem)',
            lineHeight: 1.9,
            maxWidth: '520px',
            marginBottom: '2.5rem',
            fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
          }}>
            {hi
              ? 'पुस्तकें पढ़ी, ध्यान किया — अब सीधे जागरूकता में प्रवेश करें। निर्वाण सूत्र पाठ्यक्रम 8 अध्यायों में अद्वैत, आत्म-जांच और मुक्ति की यात्रा है।'
              : 'You\'ve read the books. Now enter the living teaching. The Nirvan Sutra Course is an 8-chapter journey through Advaita, self-inquiry and direct seeing of truth.'}
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '2.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {[
              { num: '8', label: hi ? 'अध्याय' : 'Chapters' },
              { num: '3', label: hi ? 'भाषाएं' : 'Languages' },
              { num: '∞', label: hi ? 'निःशुल्क' : 'Free Access' },
            ].map(s => (
              <div key={s.num}>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2.8rem', fontWeight: 300, color: '#d4a843', lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(245,237,216,0.4)', letterSpacing: '0.08em', fontFamily: 'var(--font-inter)', marginTop: '0.2rem' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/course"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
              padding: '1.1rem 2.75rem', borderRadius: '6px',
              background: 'linear-gradient(135deg, #d4a843 0%, #ffe89a 50%, #c49832 100%)',
              color: '#061008', textDecoration: 'none', fontWeight: 800,
              fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
              fontSize: '1rem', letterSpacing: '0.04em',
              boxShadow: '0 8px 48px rgba(212,168,67,0.38), 0 2px 12px rgba(212,168,67,0.22)',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 18px 64px rgba(212,168,67,0.55)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 48px rgba(212,168,67,0.38)';
            }}
          >
            {hi ? 'पाठ्यक्रम शुरू करें' : 'Begin the Course'} →
          </Link>
        </div>

        {/* RIGHT — Lotus Mandala */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem',
          opacity: 0.9,
        }} className="cb-mandala-col">
          <LotusMandala />
          <p style={{
            fontSize: '0.62rem', letterSpacing: '0.22em', color: 'rgba(212,168,67,0.6)',
            textTransform: 'uppercase', fontFamily: 'var(--font-inter)', textAlign: 'center',
          }}>
            {hi ? '८ अध्याय · ३ भाषाएं · एक यात्रा' : '8 Chapters · 3 Languages · One Journey'}
          </p>
        </div>
      </div>

      <style>{`
        @media(max-width:768px) {
          .cb-full-grid { grid-template-columns: 1fr !important; }
          .cb-mandala-col { display: none !important; }
        }
      `}</style>
    </section>
  );
}

// ── Strip Banner (for EbookReader last-page) ──────────────
function StripBanner({ hi }: { hi: boolean }) {
  return (
    <div style={{
      position: 'relative',
      margin: '2rem 0 0',
      borderRadius: '12px',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, rgba(5,14,7,0.98) 0%, rgba(12,28,14,0.95) 100%)',
      border: '1px solid rgba(212,168,67,0.22)',
      boxShadow: '0 8px 48px rgba(0,0,0,0.5), inset 0 0 40px rgba(212,168,67,0.03)',
    }}>
      {/* Top gold line */}
      <div style={{
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #d4a843 30%, #ffe89a 50%, #d4a843 70%, transparent)',
      }} />

      <div style={{
        padding: 'clamp(1.75rem,4vw,2.5rem) clamp(1.25rem,4vw,2.5rem)',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '1.5rem',
        alignItems: 'center',
      }} className="cb-strip-inner">

        {/* LEFT */}
        <div>
          <p style={{
            fontSize: '0.56rem', letterSpacing: '0.3em', color: '#d4a843',
            textTransform: 'uppercase', fontFamily: 'var(--font-inter)', fontWeight: 700,
            marginBottom: '0.75rem', opacity: 0.8,
          }}>
            {hi ? 'आगे का मार्ग · निर्वाण सूत्र पाठ्यक्रम' : 'What\'s Next · Nirvan Sutra Course'}
          </p>

          <h3 style={{
            fontFamily: hi ? 'var(--font-hind)' : 'var(--font-cormorant)',
            fontSize: 'clamp(1.4rem,3vw,2rem)',
            fontWeight: hi ? 600 : 300,
            fontStyle: hi ? 'normal' : 'italic',
            color: 'var(--c-ivory)',
            marginBottom: '0.75rem',
            lineHeight: 1.15,
          }}>
            {hi ? 'पुस्तक समाप्त — यात्रा अभी बाकी है' : 'The book ends. The journey begins.'}
          </h3>

          <p style={{
            fontSize: 'clamp(0.85rem,1.4vw,0.95rem)',
            color: 'rgba(245,237,216,0.55)',
            lineHeight: 1.8,
            marginBottom: '1.25rem',
            fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
            maxWidth: '460px',
          }}>
            {hi
              ? 'इस ग्रंथ की अनुभूति को जीवंत अनुभव में बदलें। निर्वाण सूत्र पाठ्यक्रम में 8 अध्यायों की सीधी आत्म-जांच शुरू करें।'
              : 'Take this book\'s insight into lived experience. Begin 8 chapters of direct self-inquiry in the Nirvan Sutra Course.'}
          </p>

          <Link
            href="/course"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.85rem 2rem', borderRadius: '6px',
              background: 'linear-gradient(135deg, #d4a843 0%, #ffe89a 50%, #c49832 100%)',
              color: '#061008', textDecoration: 'none', fontWeight: 800,
              fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
              fontSize: '0.9rem', letterSpacing: '0.04em',
              boxShadow: '0 6px 32px rgba(212,168,67,0.3)',
              transition: 'all 0.25s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 48px rgba(212,168,67,0.48)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 32px rgba(212,168,67,0.3)'; }}
          >
            {hi ? 'पाठ्यक्रम में प्रवेश करें' : 'Enter the Course'} →
          </Link>
        </div>

        {/* RIGHT — mini stats */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '0.85rem',
          borderLeft: '1px solid rgba(212,168,67,0.12)',
          paddingLeft: '1.5rem',
        }} className="cb-strip-stats">
          {[
            { num: '8', label: hi ? 'अध्याय' : 'Chapters' },
            { num: '3', label: hi ? 'भाषाएं' : 'Languages' },
            { num: '∞', label: hi ? 'निःशुल्क' : 'Free' },
          ].map(s => (
            <div key={s.num} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, color: '#d4a843', lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(245,237,216,0.4)', letterSpacing: '0.06em', fontFamily: 'var(--font-inter)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media(max-width:600px) {
          .cb-strip-inner { grid-template-columns: 1fr !important; }
          .cb-strip-stats { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────
export default function CourseBanner({ lang = 'hi', variant = 'full' }: CourseBannerProps) {
  const hi = lang === 'hi';
  return variant === 'strip' ? <StripBanner hi={hi} /> : <FullBanner hi={hi} />;
}
