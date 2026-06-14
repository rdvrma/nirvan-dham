'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Language } from '@/lib/i18n';
import SacredBackground from '@/components/SacredBackground';

interface DonationSectionProps {
  lang: Language;
}

const text = {
  hi: {
    eyebrow: 'सेवा और सहयोग',
    title: 'दान — Dana',
    subtitle: 'निरवाण धाम की साधना, संवाद और डिजिटल सेवा को सहज बनाए रखने के लिए आपका सहयोग।',
    india: 'भारत',
    indiaLine: 'UPI QR और UPI ID',
    intl: 'International',
    intlLine: 'PayPal और Card',
    cta: 'दान विवरण देखें',
  },
  en: {
    eyebrow: 'Seva & Support',
    title: 'Dana — Offering',
    subtitle: 'Support the sadhana, samvad, and digital ashram work of Nirvan Dham.',
    india: 'India',
    indiaLine: 'UPI QR and UPI ID',
    intl: 'International',
    intlLine: 'PayPal and Card',
    cta: 'View Donation Details',
  },
} as const;

export default function DonationSection({ lang }: DonationSectionProps) {
  const t = text[lang];
  const isHindi = lang === 'hi';

  return (
    <section id="donation" className="section-pad relative overflow-hidden" style={{ background: 'var(--c-bg)' }}>
      <SacredBackground variant="mandala" intensity="soft" />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 55% at 50% 20%, rgba(212,168,67,0.09), transparent 68%)',
      }} />

      <div className="nd-container relative z-10">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] items-center">
          <div>
            <p className="pill mb-5" style={{ width: 'fit-content' }}>{t.eyebrow}</p>
            <h2
              className="font-serif"
              suppressHydrationWarning
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 4rem)',
                color: 'var(--c-ivory)',
                fontWeight: isHindi ? 600 : 300,
                lineHeight: 1.05,
                marginBottom: '1rem',
              }}
            >
              {t.title}
            </h2>
            <p
              suppressHydrationWarning
              style={{
                color: 'var(--c-ivdim)',
                fontSize: 'clamp(1rem, 2vw, 1.1rem)',
                lineHeight: 1.9,
                maxWidth: '560px',
                marginBottom: '1.8rem',
              }}
            >
              {t.subtitle}
            </p>
            <Link
              href="/donation"
              suppressHydrationWarning
              className="transition-premium"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '.6rem',
                border: '1px solid rgba(212,168,67,0.35)',
                color: 'var(--c-gold)',
                textDecoration: 'none',
                padding: '.9rem 1.3rem',
                borderRadius: '4px',
                background: 'rgba(212,168,67,0.06)',
                fontWeight: 700,
              }}
            >
              {t.cta} <span aria-hidden="true">→</span>
            </Link>
          </div>

          <Link
            href="/donation"
            className="group relative overflow-hidden grid grid-cols-1 sm:grid-cols-[0.9fr_1.1fr]"
            style={{
              gap: '1.2rem',
              alignItems: 'center',
              border: '1px solid rgba(212,168,67,0.16)',
              background: 'rgba(13,31,16,0.58)',
              backdropFilter: 'blur(12px)',
              borderRadius: '8px',
              padding: 'clamp(1.1rem, 3vw, 1.6rem)',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div
              style={{
                border: '1px solid rgba(212,168,67,0.28)',
                borderRadius: '6px',
                padding: '.45rem',
                background: '#f4f6fb',
                boxShadow: '0 18px 42px rgba(0,0,0,.24)',
              }}
            >
              <Image src="/donation/upi-qr.jpg" alt="UPI QR code" width={240} height={328} style={{ width: '100%', height: 'auto', borderRadius: '4px', display: 'block' }} />
            </div>
            <div suppressHydrationWarning>
              <p style={{ color: 'var(--c-gold)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '.4rem' }}>{t.india}</p>
              <p style={{ color: 'var(--c-ivdim)', marginBottom: '1.2rem' }}>{t.indiaLine}</p>
              <div style={{ height: '1px', background: 'rgba(212,168,67,0.18)', marginBottom: '1.2rem' }} />
              <p style={{ color: 'var(--c-gold)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '.4rem' }}>{t.intl}</p>
              <p style={{ color: 'var(--c-ivdim)' }}>{t.intlLine}</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
