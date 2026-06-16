'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { getTatvBySlug, TATV_MEMBERS } from '@/lib/tatv-data';
import type { Language } from '@/lib/i18n';
import { content, getSavedLanguage, saveLanguage } from '@/lib/i18n';

// ── Pre-computed mandala SVG component ──
function ElementMandala({ tatv, accent }: { tatv: string; accent: string }) {
  const style: React.CSSProperties = { position: 'absolute', pointerEvents: 'none', zIndex: 2 };

  switch (tatv) {
    case 'Aakash':
      return (
        <div style={{ ...style, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '5%' }}>
          <svg width="min(700px, 55vw)" height="min(700px, 55vw)" viewBox="0 0 700 700" fill="none" style={{ opacity: 0.06, animation: 'sacredSpin 80s linear infinite' }}>
            {[320, 280, 240, 200, 160, 120, 80, 40].map((r, i) => <circle key={r} cx="350" cy="350" r={r} stroke={accent} strokeWidth={i % 2 === 0 ? '0.8' : '0.4'} />)}
            {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => {
              const rad = a * Math.PI / 180;
              return <line key={a} x1={350 + 40 * Math.cos(rad)} y1={350 + 40 * Math.sin(rad)} x2={350 + 320 * Math.cos(rad)} y2={350 + 320 * Math.sin(rad)} stroke={accent} strokeWidth="0.4" />;
            })}
            <circle cx="350" cy="350" r="8" stroke={accent} strokeWidth="1.5" fill="none" />
            <circle cx="350" cy="350" r="3" fill={accent} opacity="0.8" />
          </svg>
        </div>
      );
    case 'Jal':
      return (
        <div style={{ ...style, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '5%' }}>
          <svg width="min(600px, 50vw)" height="min(600px, 50vw)" viewBox="0 0 600 600" fill="none" style={{ opacity: 0.06, animation: 'sacredSpinRev 90s linear infinite' }}>
            {[260, 210, 160, 110, 60].map(r => <circle key={r} cx="300" cy="300" r={r} stroke={accent} strokeWidth="0.6" strokeDasharray="4 6" />)}
            {[0, 60, 120, 180, 240, 300].map(a => {
              const rad = a * Math.PI / 180;
              return <circle key={a} cx={300 + 160 * Math.cos(rad)} cy={300 + 160 * Math.sin(rad)} r="60" stroke={accent} strokeWidth="0.5" />;
            })}
            <circle cx="300" cy="300" r="260" stroke={accent} strokeWidth="1" />
          </svg>
        </div>
      );
    case 'Agni':
      return (
        <div style={{ ...style, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '5%' }}>
          <svg width="min(580px, 48vw)" height="min(580px, 48vw)" viewBox="0 0 580 580" fill="none" style={{ opacity: 0.06, animation: 'sacredSpin 60s linear infinite' }}>
            {[4,3,2,1].map((n, i) => {
              const e = 240 - 50 * i;
              return (
                <g key={n} transform={`translate(290,290) rotate(${15 * i})`}>
                  <polygon points={`0,${-e} ${0.866*e},${0.5*e} ${-(0.866*e)},${0.5*e}`} stroke={accent} strokeWidth="0.7" fill="none" />
                  <polygon points={`0,${e} ${0.866*e},${-(0.5*e)} ${-(0.866*e)},${-(0.5*e)}`} stroke={accent} strokeWidth="0.7" fill="none" />
                </g>
              );
            })}
            <circle cx="290" cy="290" r="260" stroke={accent} strokeWidth="0.5" />
            <circle cx="290" cy="290" r="240" stroke={accent} strokeWidth="0.3" strokeDasharray="3 5" />
          </svg>
        </div>
      );
    case 'Vayu':
      return (
        <div style={{ ...style, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '5%' }}>
          <svg width="min(620px, 52vw)" height="min(620px, 52vw)" viewBox="0 0 620 620" fill="none" style={{ opacity: 0.06, animation: 'sacredSpinRev 100s linear infinite' }}>
            {[280, 230, 180, 130, 80].map(r => <circle key={r} cx="310" cy="310" r={r} stroke={accent} strokeWidth="0.5" strokeDasharray="2 8" />)}
            {[0,45,90,135,180,225,270,315].map(a => {
              const rad = a * Math.PI / 180;
              return <line key={a} x1={310 + 80 * Math.cos(rad)} y1={310 + 80 * Math.sin(rad)} x2={310 + 280 * Math.cos(rad)} y2={310 + 280 * Math.sin(rad)} stroke={accent} strokeWidth="0.4" />;
            })}
            <circle cx="310" cy="310" r="280" stroke={accent} strokeWidth="0.8" />
          </svg>
        </div>
      );
    case 'Prithvi':
      return (
        <div style={{ ...style, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '5%' }}>
          <svg width="min(640px, 53vw)" height="min(640px, 53vw)" viewBox="0 0 640 640" fill="none" style={{ opacity: 0.06, animation: 'sacredSpin 120s linear infinite' }}>
            {[280, 230, 180, 130].map(r => <rect key={r} x={320 - r} y={320 - r} width={r * 2} height={r * 2} stroke={accent} strokeWidth="0.6" fill="none" />)}
            {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => {
              const rad = a * Math.PI / 180;
              return <line key={a} x1={320 + 130 * Math.cos(rad)} y1={320 + 130 * Math.sin(rad)} x2={320 + 280 * Math.cos(rad)} y2={320 + 280 * Math.sin(rad)} stroke={accent} strokeWidth="0.3" />;
            })}
            <circle cx="320" cy="320" r="280" stroke={accent} strokeWidth="0.5" strokeDasharray="4 6" />
          </svg>
        </div>
      );
    default:
      return null;
  }
}

export default function TatvDetailClient() {
  const params = useParams();
  const router = useRouter();
  const slug = (Array.isArray(params.slug) ? params.slug[0] : params.slug) ?? '';
  const member = getTatvBySlug(slug);
  const memberIndex = TATV_MEMBERS.findIndex((m) => m.slug === slug);

  const [formState, setFormState] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [activeVideo, setActiveVideo] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [lang, setLang] = useState<Language>(() => getSavedLanguage());
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    saveLanguage(lang);
    // Trigger hero fade-in
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, [lang]);

  function toggleLang() {
    const next: Language = lang === 'hi' ? 'en' : 'hi';
    setLang(next);
    saveLanguage(next);
  }

  const hi = lang === 'hi';
  const t = content[lang].tatv;
  const currentPath = typeof window === 'undefined' ? '/' : window.location.pathname;

  if (!member) {
    return (
      <div style={{ minHeight: '100vh', background: '#080f0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={() => router.push('/')} style={{ color: 'var(--c-gold)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
          ← {t.detailBack}
        </button>
      </div>
    );
  }

  const { colors } = member;
  const hasVideos = member.videos && member.videos.length > 0;
  const totalMembers = TATV_MEMBERS.length;
  const displayIndex = memberIndex >= 0 ? memberIndex + 1 : 1;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('https://formspree.io/f/xqeogwza', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formState,
          _subject: `Nirvan Dham – Contact: ${member?.name ?? 'Member'}`,
        }),
      });
      if (res.ok) setSubmitted(true);
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: 'var(--c-ivory)', fontFamily: 'var(--font-inter)', overflowX: 'hidden' }}>

      {/* ══════════════════════════════════
          SECTION 1 — CINEMATIC HERO
      ══════════════════════════════════ */}
      <section style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>

        {/* Background gradient layer */}
        <div style={{ position: 'absolute', inset: 0, background: colors.gradient, opacity: 0.6, zIndex: 0 }} />

        {/* Full-bleed image */}
        {!hasVideos && !imgError && (
          <img
            src={member.image}
            alt={member.name}
            onError={() => setImgError(true)}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center top',
              opacity: heroVisible ? 0.82 : 0,
              transition: 'opacity 1.2s ease',
              zIndex: 1,
            }}
          />
        )}

        {/* Video background */}
        {hasVideos && (
          <>
            {!videoLoaded && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg, zIndex: 1 }}>
                <div style={{ width: '44px', height: '44px', border: `3px solid ${colors.accent}30`, borderTopColor: colors.accent, borderRadius: '50%', animation: 'tatvSpin 1s linear infinite' }} />
              </div>
            )}
            <video
              ref={videoRef}
              key={activeVideo}
              autoPlay muted loop playsInline
              onCanPlay={() => setVideoLoaded(true)}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center top',
                opacity: videoLoaded ? (heroVisible ? 0.82 : 0) : 0,
                transition: 'opacity 1.2s ease',
                zIndex: 1,
              }}
            >
              <source src={member.videos![activeVideo]} type="video/mp4" />
            </video>
          </>
        )}

        {/* Fallback symbol */}
        {imgError && !hasVideos && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
            <span style={{ fontSize: '10rem', opacity: 0.08, color: colors.accent }}>{member.symbol}</span>
          </div>
        )}

        {/* Cinematic gradient overlay: bottom fade for text legibility */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3,
          background: `linear-gradient(to top,
            ${colors.bg} 0%,
            rgba(0,0,0,0.72) 28%,
            rgba(0,0,0,0.25) 55%,
            rgba(0,0,0,0.08) 80%,
            transparent 100%)`,
        }} />

        {/* Subtle vignette sides */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, rgba(0,0,0,0.35) 100%)',
        }} />

        {/* Element mandala — decorative */}
        <ElementMandala tatv={member.tatv} accent={colors.accent} />

        {/* ── TOP BAR: Back + Lang ── */}
        <div style={{
          position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 20,
          display: 'flex', gap: '0.5rem', alignItems: 'center',
          opacity: heroVisible ? 1 : 0, transition: 'opacity 0.8s ease 0.3s',
        }}>
          <button
            onClick={() => router.push('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(0,0,0,0.4)', border: `1px solid ${colors.accent}30`,
              borderRadius: '9999px', padding: '0.45rem 1.1rem',
              color: 'var(--c-ivory)', fontSize: '0.78rem', cursor: 'pointer',
              backdropFilter: 'blur(12px)', letterSpacing: '0.05em',
              transition: 'all 0.3s ease', fontFamily: 'var(--font-inter)',
            }}
          >
            ← {t.detailBack}
          </button>
          <a
            href={`/api/language?lang=${hi ? 'en' : 'hi'}&next=${encodeURIComponent(currentPath)}`}
            onClick={(e) => { e.preventDefault(); toggleLang(); }}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.4)', border: `1px solid ${colors.accent}40`,
              borderRadius: '9999px', padding: '0.45rem 1rem',
              color: colors.accent, fontSize: '0.73rem', cursor: 'pointer',
              backdropFilter: 'blur(12px)', fontWeight: 600, letterSpacing: '0.08em',
              transition: 'all 0.3s ease', textDecoration: 'none',
            }}
          >
            {hi ? 'EN' : 'हि'}
          </a>
        </div>

        {/* Video switcher pills (top-right) */}
        {hasVideos && member.videos!.length > 1 && (
          <div style={{
            position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 20,
            display: 'flex', gap: '0.4rem',
          }}>
            {member.videos!.map((_, i) => (
              <button
                key={i}
                onClick={() => { setActiveVideo(i); setVideoLoaded(false); if (videoRef.current) { videoRef.current.load(); } }}
                style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: activeVideo === i ? colors.accent : 'rgba(0,0,0,0.45)',
                  border: `1px solid ${colors.accent}60`,
                  color: activeVideo === i ? '#000' : colors.accent,
                  fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer',
                  backdropFilter: 'blur(10px)', transition: 'all 0.2s',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* ── HERO TEXT: Bottom-left overlay ── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          zIndex: 10, padding: 'clamp(2rem, 4vw, 4rem) clamp(1.5rem, 4vw, 4rem)',
          opacity: heroVisible ? 1 : 0, transition: 'opacity 0.9s ease 0.5s',
        }}>

          {/* Tatv badge pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <span style={{
              display: 'inline-block',
              padding: '0.28rem 0.85rem',
              border: `1px solid ${colors.accent}50`,
              borderRadius: '9999px',
              fontSize: '0.68rem', letterSpacing: '0.12em',
              color: colors.accent, background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(8px)', fontWeight: 600,
              fontFamily: 'var(--font-inter)',
            }}>
              {hi ? member.tatvHindi : member.tatv} {hi ? 'तत्व' : 'Tatv'}
            </span>
            <span style={{
              display: 'inline-block',
              padding: '0.28rem 0.85rem',
              border: `1px solid ${colors.accent}30`,
              borderRadius: '9999px',
              fontSize: '0.68rem', letterSpacing: '0.08em',
              color: 'rgba(255,255,255,0.6)', background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(8px)',
              fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
            }}>
              {hi ? member.tatvMeaningHindi : member.tatvMeaning}
            </span>
          </div>

          {/* Name */}
          <h1
            className={`font-serif ${hi ? 'font-hindi' : ''}`}
            style={{
              fontSize: 'clamp(3.2rem, 8vw, 6.5rem)',
              fontWeight: hi ? 600 : 300,
              lineHeight: 0.95,
              color: 'var(--c-ivory)',
              marginBottom: '0.6rem',
              textShadow: '0 4px 40px rgba(0,0,0,0.6)',
              fontFamily: hi ? 'var(--font-hind)' : 'var(--font-cormorant)',
            }}
          >
            {hi ? member.hindiName : member.name}
          </h1>

          {/* Role */}
          <p style={{
            fontSize: 'clamp(0.78rem, 1.6vw, 0.92rem)',
            color: colors.accent, letterSpacing: '0.1em',
            marginBottom: '1rem', opacity: 0.9,
            fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
          }}>
            {hi ? member.roleHindi : member.role}
          </p>

          {/* Quote */}
          <blockquote style={{
            borderLeft: `2px solid ${colors.accent}60`,
            paddingLeft: '1rem',
            maxWidth: '580px',
          }}>
            <p
              className={`font-serif ${hi ? 'font-hindi' : ''}`}
              style={{
                fontSize: hi ? '1rem' : '0.95rem',
                fontStyle: hi ? 'normal' : 'italic',
                color: 'rgba(255,255,255,0.72)',
                lineHeight: hi ? 1.85 : 1.65,
              }}
            >
              &ldquo;{hi ? member.quoteHindi : member.quote}&rdquo;
            </p>
          </blockquote>

          {/* Bottom-right: counter */}
          <div style={{
            position: 'absolute', bottom: 'clamp(2rem, 4vw, 4rem)', right: 'clamp(1.5rem, 4vw, 4rem)',
          }}>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', fontVariantNumeric: 'tabular-nums' }}>
              {String(displayIndex).padStart(2, '0')} / {String(totalMembers).padStart(2, '0')}
            </span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          SECTION 2 — BIO & CONTENT
      ══════════════════════════════════ */}
      <section style={{
        background: colors.bg, position: 'relative', zIndex: 5,
        padding: 'clamp(4rem, 8vw, 7rem) clamp(1.5rem, 6vw, 5rem)',
      }}>
        {/* Subtle top glow line */}
        <div style={{ height: '1px', background: `linear-gradient(to right, transparent, ${colors.accent}30, transparent)`, marginBottom: 'clamp(3rem, 6vw, 5rem)' }} />

        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(2.5rem, 5vw, 4rem)' }}>

          {/* Bio */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{
              fontSize: '0.68rem', letterSpacing: '0.22em', color: colors.accent,
              fontWeight: 700, textTransform: 'uppercase', fontFamily: 'var(--font-inter)',
              marginBottom: '0.25rem',
            }}>
              {hi ? 'परिचय' : 'Introduction'}
            </p>
            {(hi ? member.bioHindi : member.bio).map((para, i) => (
              <p
                key={i}
                className={hi ? 'font-hindi' : ''}
                style={{
                  fontSize: hi ? '1.02rem' : '0.94rem',
                  color: 'rgba(255,255,255,0.65)',
                  lineHeight: hi ? 1.95 : 1.85,
                }}
              >
                {para}
              </p>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: `linear-gradient(to right, ${colors.accent}25, transparent)` }} />

          {/* Contact form */}
          <div>
            <h2
              className={`font-serif ${hi ? 'font-hindi' : ''}`}
              style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: hi ? 600 : 300, color: 'var(--c-ivory)', marginBottom: '1.5rem', lineHeight: 1.2 }}
            >
              {t.sendMessage}
            </h2>

            {submitted ? (
              <div style={{ padding: '1.5rem', background: `${colors.accent}08`, border: `1px solid ${colors.accent}25`, borderRadius: '10px' }}>
                <p className={hi ? 'font-hindi' : ''} style={{ color: colors.accent, fontSize: '0.95rem', lineHeight: 1.7 }}>{t.submittedDesc}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {(['name', 'email', 'phone'] as const).map((field) => {
                  const placeholders: Record<string, string> = { name: t.nameLabel, email: t.emailLabel, phone: t.phoneLabel };
                  return (
                    <input
                      key={field}
                      type={field === 'email' ? 'email' : 'text'}
                      placeholder={placeholders[field] ?? field}
                      value={formState[field]}
                      onChange={(e) => setFormState((p) => ({ ...p, [field]: e.target.value }))}
                      required={field !== 'phone'}
                      className={hi ? 'font-hindi' : ''}
                      style={{
                        width: '100%', padding: '0.8rem 1.1rem', borderRadius: '8px',
                        border: `1px solid ${colors.accent}18`,
                        background: 'rgba(255,255,255,0.04)', color: 'var(--c-ivory)',
                        fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                      }}
                    />
                  );
                })}
                <textarea
                  placeholder={t.messageLabel}
                  rows={4}
                  value={formState.message}
                  onChange={(e) => setFormState((p) => ({ ...p, message: e.target.value }))}
                  className={hi ? 'font-hindi' : ''}
                  style={{
                    width: '100%', padding: '0.8rem 1.1rem', borderRadius: '8px',
                    border: `1px solid ${colors.accent}18`,
                    background: 'rgba(255,255,255,0.04)', color: 'var(--c-ivory)',
                    fontSize: '0.875rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                  }}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className={hi ? 'font-hindi' : ''}
                  style={{
                    padding: '0.9rem 2.5rem', borderRadius: '8px', border: 'none',
                    background: submitting ? `${colors.accent}55` : colors.accent,
                    color: '#000', fontWeight: 700, fontSize: '0.875rem',
                    cursor: submitting ? 'default' : 'pointer',
                    transition: 'all 0.3s ease', alignSelf: 'flex-start',
                    letterSpacing: '0.04em',
                  }}
                >
                  {submitting ? '...' : t.submit}
                </button>
              </form>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: `linear-gradient(to right, ${colors.accent}20, transparent)` }} />

          {/* Other Tatv members */}
          <div>
            <p style={{
              fontSize: '0.65rem', letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
              marginBottom: '1.25rem', fontFamily: 'var(--font-inter)',
            }}>
              {hi ? 'अन्य तत्व' : 'Other Elements'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {TATV_MEMBERS.filter((m) => m.slug !== member.slug).map((m) => (
                <button
                  key={m.slug}
                  onClick={() => router.push(`/tatv/${m.slug}`)}
                  style={{
                    padding: '0.45rem 1.1rem', borderRadius: '9999px',
                    border: `1px solid ${m.colors.accent}35`,
                    background: 'rgba(255,255,255,0.025)',
                    color: m.colors.accent, fontSize: '0.78rem',
                    cursor: 'pointer', transition: 'all 0.25s ease',
                    fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${m.colors.accent}15`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.025)'; }}
                >
                  {m.symbol} {hi ? m.hindiName : m.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Global styles for this page */}
      <style>{`
        @keyframes tatvSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (max-width: 640px) {
          .tatv-hero-name { font-size: 3rem !important; }
        }
      `}</style>
    </div>
  );
}
