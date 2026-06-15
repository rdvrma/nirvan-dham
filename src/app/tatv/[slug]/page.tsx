'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { getTatvBySlug, TATV_MEMBERS } from '@/lib/tatv-data';
import type { Language } from '@/lib/i18n';
import { content, getSavedLanguage, saveLanguage } from '@/lib/i18n';

// ── Pre-computed mandala SVG component — no Math.cos/sin at runtime ──
function ElementMandala({ tatv, accent }: { tatv: string; accent: string }) {
  const style: React.CSSProperties = { position: 'absolute', pointerEvents: 'none', zIndex: 10 };

  switch (tatv) {
    case 'Aakash':
      return (
        <div style={{ ...style, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '5%' }}>
          <svg width="min(700px, 55vw)" height="min(700px, 55vw)" viewBox="0 0 700 700" fill="none" style={{ opacity: 0.08, animation: 'sacredSpin 80s linear infinite' }}>
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
          <svg width="min(600px, 50vw)" height="min(600px, 50vw)" viewBox="0 0 600 600" fill="none" style={{ opacity: 0.07, animation: 'sacredSpinRev 90s linear infinite' }}>
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
          <svg width="min(580px, 48vw)" height="min(580px, 48vw)" viewBox="0 0 580 580" fill="none" style={{ opacity: 0.08, animation: 'sacredSpin 60s linear infinite' }}>
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
          <svg width="min(620px, 52vw)" height="min(620px, 52vw)" viewBox="0 0 620 620" fill="none" style={{ opacity: 0.07, animation: 'sacredSpinRev 100s linear infinite' }}>
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
          <svg width="min(640px, 53vw)" height="min(640px, 53vw)" viewBox="0 0 640 640" fill="none" style={{ opacity: 0.07, animation: 'sacredSpin 120s linear infinite' }}>
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

  const [formState, setFormState] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [activeVideo, setActiveVideo] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [lang, setLang] = useState<Language>(() => getSavedLanguage());
  const videoRef = useRef<HTMLVideoElement>(null);

  function toggleLang() {
    const next: Language = lang === 'hi' ? 'en' : 'hi';
    setLang(next);
    saveLanguage(next);
  }

  const hi = lang === 'hi';
  const t = content[lang].tatv;
  const currentPath = typeof window === 'undefined' ? '/' : window.location.pathname;

  useEffect(() => {
    saveLanguage(lang);
  }, [lang]);

  if (!member) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={() => router.push('/')} style={{ color: 'var(--c-gold)', background: 'none', border: 'none', cursor: 'pointer' }}>
          ← {t.detailBack}
        </button>
      </div>
    );
  }

  const { colors } = member;
  const hasVideos = member.videos && member.videos.length > 0;

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

  const TATV_ALL = TATV_MEMBERS;

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: 'var(--c-ivory)', fontFamily: 'var(--font-inter)', position: 'relative', overflow: 'hidden' }}>
      {/* Sacred background gradient */}
      <div style={{ position: 'absolute', inset: 0, background: colors.gradient, opacity: 0.4, pointerEvents: 'none', zIndex: 0 }} />

      {/* Element Mandala */}
      <ElementMandala tatv={member.tatv} accent={colors.accent} />

      {/* Back button + Lang toggle */}
      <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 30, display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => { router.push('/'); }} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(0,0,0,0.35)', border: `1px solid ${colors.accent}30`,
          borderRadius: '9999px', padding: '0.5rem 1.25rem',
          color: 'var(--c-ivory)', fontSize: '0.8rem', cursor: 'pointer',
          backdropFilter: 'blur(10px)', letterSpacing: '0.06em', transition: 'all 0.3s ease',
        }}>
          ← {t.detailBack}
        </button>
        <a href={`/api/language?lang=${hi ? 'en' : 'hi'}&next=${encodeURIComponent(currentPath)}`} onClick={(event) => { event.preventDefault(); toggleLang(); }} style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.35)', border: `1px solid ${colors.accent}40`,
          borderRadius: '9999px', padding: '0.5rem 1rem',
          color: colors.accent, fontSize: '0.75rem', cursor: 'pointer',
          backdropFilter: 'blur(10px)', fontWeight: 600, letterSpacing: '0.08em',
          transition: 'all 0.3s ease', textDecoration: 'none',
        }}>
          {hi ? 'EN' : 'हि'}
        </a>
      </div>

      {/* Video switcher (only for members with multiple videos) */}
      {hasVideos && member.videos!.length > 1 && (
        <div style={{
          position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 30,
          display: 'flex', gap: '0.5rem',
        }}>
          {member.videos!.map((_, i) => (
            <button
              key={i}
              onClick={() => { setActiveVideo(i); setVideoLoaded(false); if (videoRef.current) { videoRef.current.load(); } }}
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: activeVideo === i ? colors.accent : 'rgba(0,0,0,0.4)',
                border: `1px solid ${colors.accent}60`,
                color: activeVideo === i ? '#000' : colors.accent,
                fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                backdropFilter: 'blur(10px)',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Main layout: split screen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', minHeight: '100vh', position: 'relative', zIndex: 10 }}>

        {/* LEFT: Media panel */}
        <div style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Glow */}
          <div style={{ position: 'absolute', inset: 0, background: colors.cardGrad, zIndex: 1 }} />

          {hasVideos ? (
            <>
              {!videoLoaded && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg, zIndex: 0 }}>
                  <div style={{ width: '40px', height: '40px', border: `3px solid ${colors.accent}40`, borderTopColor: colors.accent, borderRadius: '50%', animation: 'videoSpin 1s linear infinite' }} />
                  <style>{`@keyframes videoSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                </div>
              )}
              <video
                ref={videoRef}
                key={activeVideo}
                autoPlay
                muted
                loop
                playsInline
                onCanPlay={() => setVideoLoaded(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, opacity: videoLoaded ? 0.85 : 0, transition: 'opacity 0.5s', zIndex: 1 }}
              >
                <source src={member.videos![activeVideo]} type="video/mp4" />
              </video>
            </>
          ) : (
            !imgError ? (
              <img
                src={member.image}
                alt={member.name}
                onError={() => setImgError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, opacity: 0.7 }}
              />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '6rem', opacity: 0.2 }}>{member.symbol}</span>
              </div>
            )
          )}

          {/* Element badge overlay */}
          <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', zIndex: 20 }}>
            <div style={{
              display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start',
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(16px)',
              border: `1px solid ${colors.accent}30`, borderRadius: '12px',
              padding: '1rem 1.5rem',
            }}>
              <span style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>{member.symbol}</span>
              <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: colors.accent, fontWeight: 600 }}>
                {member.tatvSanskrit}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.1rem' }}>
                {hi ? member.tatvMeaningHindi : member.tatvMeaning}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Content panel */}
        <div style={{ overflowY: 'auto', padding: 'clamp(4rem, 6vw, 6rem) clamp(2rem, 4vw, 4rem)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Name + role */}
          <div>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: colors.accent, fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              {hi ? member.tatvHindi : member.tatv} — {hi ? member.tatvMeaningHindi : member.tatvMeaning}
            </p>
            <h1 className="font-serif" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 300, color: 'var(--c-ivory)', lineHeight: 1.1, marginBottom: '0.25rem' }}>
              {hi ? member.hindiName : member.name}
            </h1>
            <p style={{ fontSize: '0.85rem', color: colors.accent, opacity: 0.8, letterSpacing: '0.08em' }}>
              {hi ? member.roleHindi : member.role}
            </p>
          </div>

          {/* Quote */}
          <blockquote style={{
            borderLeft: `2px solid ${colors.accent}60`,
            paddingLeft: '1.25rem',
            margin: 0,
          }}>
            <p className={`font-serif ${hi ? 'font-hindi' : ''}`} style={{ fontSize: hi ? '1.05rem' : '1rem', fontStyle: hi ? 'normal' : 'italic', color: 'rgba(255,255,255,0.7)', lineHeight: hi ? 1.9 : 1.7 }}>
              &ldquo;{hi ? member.quoteHindi : member.quote}&rdquo;
            </p>
          </blockquote>

          {/* Bio */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(hi ? member.bioHindi : member.bio).map((para, i) => (
              <p key={i} className={hi ? 'font-hindi' : ''} style={{ fontSize: hi ? '0.95rem' : '0.875rem', color: 'rgba(255,255,255,0.65)', lineHeight: hi ? 1.9 : 1.8 }}>
                {para}
              </p>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: `linear-gradient(to right, ${colors.accent}30, transparent)` }} />

          {/* Contact / Form */}
          <div>
            <h2 className={`font-serif ${hi ? 'font-hindi' : ''}`} style={{ fontSize: '1.1rem', fontWeight: 400, color: 'var(--c-ivory)', marginBottom: '1.25rem' }}>
              {t.sendMessage}
            </h2>

            {submitted ? (
              <div style={{ padding: '1.25rem', background: `${colors.accent}10`, border: `1px solid ${colors.accent}30`, borderRadius: '8px' }}>
                <p className={hi ? 'font-hindi' : ''} style={{ color: colors.accent, fontSize: '0.9rem' }}>{t.submittedDesc}</p>
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
                      width: '100%', padding: '0.75rem 1rem', borderRadius: '6px',
                      border: `1px solid ${colors.accent}20`,
                      background: 'rgba(255,255,255,0.04)', color: 'var(--c-ivory)',
                      fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
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
                    width: '100%', padding: '0.75rem 1rem', borderRadius: '6px',
                    border: `1px solid ${colors.accent}20`,
                    background: 'rgba(255,255,255,0.04)', color: 'var(--c-ivory)',
                    fontSize: '0.875rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                  }}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className={hi ? 'font-hindi' : ''}
                  style={{
                    padding: '0.875rem 2rem', borderRadius: '6px', border: 'none',
                    background: submitting ? `${colors.accent}50` : colors.accent,
                    color: '#000', fontWeight: 600, fontSize: '0.875rem',
                    cursor: submitting ? 'default' : 'pointer', transition: 'all 0.3s ease',
                    alignSelf: 'flex-start',
                  }}
>
                  {submitting ? '...' : t.submit}
                </button>
              </form>
            )}
          </div>

          {/* Other members */}
          <div>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '1rem' }}>
              {hi ? 'अन्य तत्व' : 'Other Elements'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {TATV_ALL.filter(m => m.slug !== member.slug).map(m => (
                <button
                  key={m.slug}
                  onClick={() => router.push(`/tatv/${m.slug}`)}
                  style={{
                    padding: '0.4rem 0.9rem', borderRadius: '9999px',
                    border: `1px solid ${m.colors.accent}40`,
                    background: 'rgba(255,255,255,0.03)',
                    color: m.colors.accent, fontSize: '0.75rem',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                >
                  {m.symbol} {hi ? m.hindiName : m.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile layout override */}
      <style>{`
        @media (max-width: 768px) {
          .tatv-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
