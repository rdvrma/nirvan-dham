'use client';

import type { Language } from '@/lib/i18n';
import { content } from '@/lib/i18n';
import SacredBackground from '@/components/SacredBackground';

interface ContactSectionProps {
  lang: Language;
}

export default function ContactSection({ lang }: ContactSectionProps) {
  const t = content[lang].contact;
  const ft = content[lang].footer;
  const nav = content[lang].nav;
  const isHindi = lang === 'hi';

  return (
    <footer
      id="contact"
      style={{ background: 'var(--c-surface)', position: 'relative', overflow: 'hidden' }}
    >
      <SacredBackground variant="minimal" intensity="soft" />

      {/* Top gold separator */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.3), transparent)' }} />

      {/* Main footer content */}
      <div style={{
        position: 'relative', zIndex: 10,
        paddingTop: 'clamp(3rem,6vw,6rem)', paddingBottom: 'clamp(3rem,6vw,6rem)',
        maxWidth: '1280px', marginLeft: 'auto', marginRight: 'auto',
        paddingLeft: 'clamp(1.25rem,4vw,3rem)', paddingRight: 'clamp(1.25rem,4vw,3rem)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'clamp(2rem,4vw,3rem)',
        }}>
          {/* Brand column */}
          <div>
            <div className="mb-5">
              <p
                className="font-hindi"
                style={{
                  fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                  fontWeight: 700,
                  color: 'var(--c-gold)',
                  lineHeight: 1.1,
                  marginBottom: '0.25rem',
                }}
              >
                निर्वाण धाम
              </p>
              <p
                className="font-serif"
                style={{
                  fontSize: '0.8rem',
                  letterSpacing: '0.2em',
                  color: 'var(--c-ivdim)',
                  opacity: 0.5,
                  textTransform: 'uppercase',
                  fontStyle: 'italic',
                }}
              >
                Nirvan Dham
              </p>
            </div>

            <p
              className={`font-serif ${isHindi ? 'font-hindi' : ''}`}
              style={{
                fontSize: isHindi ? '0.9rem' : '0.95rem',
                color: 'var(--c-ivdim)',
                lineHeight: isHindi ? 1.9 : 1.75,
                opacity: 0.65,
                fontStyle: isHindi ? 'normal' : 'italic',
                maxWidth: '260px',
              }}
            >
              {ft.tagline}
            </p>

            <div style={{ marginTop: '1.25rem' }}>
              <p
                style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.15em',
                  color: 'var(--c-ivdim)',
                  opacity: 0.35,
                  textTransform: 'uppercase',
                }}
              >
                {ft.website}
              </p>
            </div>
          </div>

          {/* Contact column */}
          <div>
            <p
              className={isHindi ? 'font-hindi' : ''}
              style={{
                fontSize: '0.7rem',
                letterSpacing: '0.2em',
                color: 'var(--c-gold)',
                textTransform: 'uppercase',
                opacity: 0.6,
                marginBottom: '1.25rem',
              }}
            >
              {t.heading}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Phone/WhatsApp */}
              <a
                href={`https://wa.me/919334325558`}
                target="_blank"
                rel="noopener noreferrer"
                className="group transition-premium"
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(212,168,67,0.08)',
                    background: 'rgba(13,31,16,0.4)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,67,0.2)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(13,31,16,0.7)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,67,0.08)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(13,31,16,0.4)';
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>💬</span>
                  <div>
                    <p
                      style={{
                        fontSize: '0.65rem',
                        color: 'var(--c-ivdim)',
                        opacity: 0.5,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginBottom: '2px',
                      }}
                    >
                      WhatsApp
                    </p>
                    <p
                      style={{
                        fontSize: '0.9rem',
                        color: 'var(--c-ivory)',
                        fontWeight: 500,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {t.phone}
                    </p>
                  </div>
                </div>
              </a>

              {/* Email */}
              <a
                href={`mailto:${t.email}`}
                className="group transition-premium"
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(212,168,67,0.08)',
                    background: 'rgba(13,31,16,0.4)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,67,0.2)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(13,31,16,0.7)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,67,0.08)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(13,31,16,0.4)';
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>✉</span>
                  <div>
                    <p
                      style={{
                        fontSize: '0.65rem',
                        color: 'var(--c-ivdim)',
                        opacity: 0.5,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginBottom: '2px',
                      }}
                    >
                      Email
                    </p>
                    <p
                      style={{
                        fontSize: '0.9rem',
                        color: 'var(--c-ivory)',
                        fontWeight: 500,
                      }}
                    >
                      {t.email}
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Nav column */}
          <div>
            <p
              style={{
                fontSize: '0.7rem',
                letterSpacing: '0.2em',
                color: 'var(--c-gold)',
                textTransform: 'uppercase',
                opacity: 0.6,
                marginBottom: '1.25rem',
              }}
            >
              {ft.navigation}
            </p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { href: '#darshan', label: nav.darshan },
                { href: '#sadhana', label: nav.sadhana },
                { href: '#ai-guide', label: nav.aiGuide },
                { href: '#guidance', label: nav.samvad },
                { href: '#app', label: content[lang].app.heading },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`transition-premium ${isHindi ? 'font-hindi' : ''}`}
                  style={{
                    fontSize: isHindi ? '0.9rem' : '0.85rem',
                    color: 'var(--c-ivdim)',
                    opacity: 0.6,
                    textDecoration: 'none',
                    letterSpacing: isHindi ? '0' : '0.04em',
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = '1')}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = '0.6')}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{ marginTop: '3rem', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', borderTop: '1px solid rgba(212,168,67,0.06)' }}
        >
          <p
            className={isHindi ? 'font-hindi' : ''}
            style={{
              fontSize: isHindi ? '0.8rem' : '0.75rem',
              color: 'var(--c-ivdim)',
              opacity: 0.35,
            }}
          >
            {ft.rights}
          </p>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--c-gold)',
              opacity: 0.3,
              letterSpacing: '0.1em',
            }}
          >
            {ft.mantra}
          </p>
        </div>
      </div>
    </footer>
  );
}
