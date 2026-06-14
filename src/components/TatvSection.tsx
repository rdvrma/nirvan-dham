'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Language } from '@/lib/i18n';
import { content } from '@/lib/i18n';
import { TATV_MEMBERS } from '@/lib/tatv-data';

interface TatvSectionProps {
  lang: Language;
}

export default function TatvSection({ lang }: TatvSectionProps) {
  const t = content[lang].tatv;
  const router = useRouter();

  return (
    <section
      id="tatv"
      style={{
        position: 'relative',
        background: 'var(--c-bg)',
        overflow: 'hidden',
        paddingTop: 'clamp(4rem,8vw,8rem)',
        paddingBottom: 'clamp(4rem,8vw,8rem)',
      }}
    >
      {/* Background radial glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(212,168,67,0.04) 0%, transparent 70%)',
      }} />

      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: 'clamp(3rem,6vw,5rem)',
        position: 'relative', zIndex: 2,
        paddingLeft: 'clamp(1rem,4vw,2rem)',
        paddingRight: 'clamp(1rem,4vw,2rem)',
      }}>
        <div className="pill" style={{ marginBottom: '1.25rem', display: 'inline-block' }}>
          <span className="font-hindi" style={{ fontSize: '0.75rem' }}>
            {t.eyebrow}
          </span>
        </div>
        <h2 style={{
          fontSize: 'clamp(1.8rem,4vw,3rem)',
          fontWeight: 300,
          color: 'var(--c-ivory)',
          fontFamily: 'var(--font-cormorant)',
          lineHeight: 1.15,
          marginBottom: '0.75rem',
        }}>
          {t.heading}
        </h2>
        <p style={{
          fontSize: 'clamp(0.88rem,1.8vw,1.05rem)',
          color: 'var(--c-ivdim)',
          maxWidth: '520px', margin: '0 auto',
          lineHeight: 1.8, opacity: 0.65,
          fontStyle: 'italic',
          fontFamily: 'var(--font-cormorant)',
        }}>
          {t.subheading}
        </p>

        {/* Gold line */}
        <div style={{
          width: '48px', height: '1px',
          background: 'linear-gradient(90deg, transparent, var(--c-gold), transparent)',
          margin: '1.5rem auto 0',
        }} />
      </div>

      {/* ── Circles Row ── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'clamp(2rem,4vw,3.5rem)',
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 clamp(1rem,4vw,2rem)',
        position: 'relative', zIndex: 2,
      }}>
        {TATV_MEMBERS.map((member, idx) => (
          <TatvCircle
            key={member.slug}
            member={member}
            isFeatured={idx === 0}
            lang={lang}
            onClick={() => router.push(`/tatv/${member.slug}`)}
          />
        ))}
      </div>
    </section>
  );
}

/* ─── Single Circular Card ─── */
function TatvCircle({
  member,
  isFeatured,
  lang,
  onClick,
}: {
  member: typeof TATV_MEMBERS[0];
  isFeatured: boolean;
  lang: Language;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const size = isFeatured ? 200 : 164;
  const isHindi = lang === 'hi';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        cursor: 'pointer',
        transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
        userSelect: 'none',
      }}
    >
      {/* ── Circle image container ── */}
      <div style={{ position: 'relative' }}>

        {/* Outer animated glow ring */}
        <div style={{
          position: 'absolute',
          inset: `-${isFeatured ? 6 : 5}px`,
          borderRadius: '50%',
          background: `conic-gradient(from 0deg, ${member.colors.accent}00, ${member.colors.accent}80, ${member.colors.accent}00, ${member.colors.accent}80, ${member.colors.accent}00)`,
          animation: 'sacredSpin 6s linear infinite',
          opacity: hovered ? 1 : 0.45,
          transition: 'opacity 0.4s ease',
        }} />

        {/* Middle ring — static border */}
        <div style={{
          position: 'absolute',
          inset: `-${isFeatured ? 4 : 3}px`,
          borderRadius: '50%',
          border: `1px solid ${member.colors.accent}30`,
          boxShadow: hovered
            ? `0 0 ${isFeatured ? 40 : 30}px ${member.colors.glow}, inset 0 0 20px ${member.colors.glow}`
            : `0 0 12px ${member.colors.glow}`,
          transition: 'box-shadow 0.4s ease',
        }} />

        {/* Circle photo */}
        <div style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          overflow: 'hidden',
          position: 'relative',
          background: member.colors.gradient,
          border: `2px solid ${member.colors.accent}40`,
          flexShrink: 0,
        }}>
          {!imgError ? (
            <img
              src={member.image}
              alt={isHindi ? member.hindiName : member.name}
              onError={() => setImgError(true)}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
                transition: 'transform 0.5s ease',
                transform: hovered ? 'scale(1.08)' : 'scale(1)',
              }}
            />
          ) : (
            /* Fallback when image not found */
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              background: member.colors.gradient,
            }}>
              <span style={{
                fontSize: `${size * 0.3}px`,
                color: member.colors.accent,
                opacity: 0.6,
                lineHeight: 1,
                marginBottom: '0.25rem',
              }}>
                {member.symbol}
              </span>
              <span style={{
                fontSize: `${size * 0.1}px`,
                color: member.colors.accent,
                opacity: 0.4,
                letterSpacing: '0.1em',
                fontFamily: 'serif',
              }}>
                {member.tatvHindi}
              </span>
            </div>
          )}

          {/* Inner overlay on hover */}
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            background: `radial-gradient(circle, transparent 40%, ${member.colors.bg}60 100%)`,
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }} />
        </div>

        {/* Element symbol badge — top right */}
        <div style={{
          position: 'absolute',
          top: isFeatured ? '4px' : '2px',
          right: isFeatured ? '4px' : '2px',
          width: isFeatured ? '36px' : '30px',
          height: isFeatured ? '36px' : '30px',
          borderRadius: '50%',
          background: `${member.colors.bg}ee`,
          border: `1px solid ${member.colors.accent}50`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isFeatured ? '1rem' : '0.8rem',
          color: member.colors.accent,
          backdropFilter: 'blur(8px)',
          transition: 'transform 0.4s ease',
          transform: hovered ? 'scale(1.1) rotate(-10deg)' : 'scale(1) rotate(0deg)',
        }}>
          {member.symbol}
        </div>
      </div>

      {/* ── Text below circle ── */}
      <div style={{ textAlign: 'center' }}>
        {/* Name */}
        <h3 style={{
          fontSize: isFeatured ? 'clamp(1.1rem,2.2vw,1.5rem)' : 'clamp(0.95rem,1.8vw,1.2rem)',
          fontWeight: isFeatured ? 300 : 400,
          fontFamily: 'var(--font-cormorant)',
          color: 'var(--c-ivory)',
          lineHeight: 1.1,
          marginBottom: '0.3rem',
          transition: 'color 0.3s ease',
          ...(hovered ? { color: member.colors.accent } : {}),
        }}>
          {isHindi ? member.hindiName : member.name}
        </h3>

        {/* Tatv tag */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          padding: '0.2rem 0.65rem',
          borderRadius: '9999px',
          border: `1px solid ${member.colors.accent}35`,
          background: hovered ? `${member.colors.accent}20` : `${member.colors.accent}10`,
          transition: 'background 0.3s ease',
          marginBottom: '0.4rem',
        }}>
          <span style={{
            fontSize: '0.62rem',
            color: member.colors.accent,
            letterSpacing: '0.1em',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}>
            {isHindi ? member.tatvHindi : member.tatv}
          </span>
        </div>

        {/* Role — visible on hover */}
        <div style={{
          maxHeight: hovered ? '40px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.4s ease',
        }}>
          <p style={{
            fontSize: '0.7rem',
            color: 'var(--c-ivdim)',
            opacity: 0.6,
            marginTop: '0.2rem',
            letterSpacing: '0.04em',
            textAlign: 'center',
          }}>
            {isHindi ? member.roleHindi : member.role}
          </p>
        </div>
      </div>
    </div>
  );
}
