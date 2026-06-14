'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { Language } from '@/lib/i18n';
import SacredBackground from '@/components/SacredBackground';

interface SplashScreenProps {
  onSelect: (lang: Language) => void;
}

export default function SplashScreen({ onSelect }: SplashScreenProps) {
  const [visible, setVisible] = useState(false);
  const [choosing, setChoosing] = useState<Language | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 80);
    return () => window.clearTimeout(timer);
  }, []);

  function handleSelect(lang: Language) {
    setChoosing(lang);
    window.setTimeout(() => onSelect(lang), 600);
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-700 ${
        visible ? 'opacity-100' : 'opacity-0'
      } ${choosing ? 'opacity-0' : ''}`}
      style={{ background: 'var(--c-bg)' }}
    >
      <SacredBackground variant="mandala" intensity="medium" />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
        <div
          style={{
            width: 'min(560px, 86vw)',
            height: 'min(560px, 86vw)',
            opacity: 0.055,
            animation: 'sacredSpinRev 56s linear infinite',
          }}
        >
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            <circle cx="100" cy="100" r="95" stroke="#d4a843" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="70" stroke="#d4a843" strokeWidth="0.4" />
            <circle cx="100" cy="100" r="42" stroke="#d4a843" strokeWidth="0.35" strokeDasharray="3 6" />
            <circle cx="100" cy="100" r="20" stroke="#d4a843" strokeWidth="0.4" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <line
                  key={angle}
                  x1={100 + 20 * Math.cos(rad)}
                  y1={100 + 20 * Math.sin(rad)}
                  x2={100 + 94 * Math.cos(rad)}
                  y2={100 + 94 * Math.sin(rad)}
                  stroke="#d4a843"
                  strokeWidth="0.5"
                />
              );
            })}
          </svg>
        </div>
      </div>

      <div className="relative z-10 text-center px-6 flex flex-col items-center w-full">
        <div
          style={{
            width: 'min(170px, 38vw)',
            height: 'min(170px, 38vw)',
            borderRadius: '50%',
            border: '1px solid rgba(212,168,67,0.22)',
            background: 'radial-gradient(circle at 50% 20%, rgba(212,168,67,0.16), rgba(8,15,10,0.72) 65%)',
            boxShadow: '0 0 50px rgba(212,168,67,0.18), inset 0 0 40px rgba(212,168,67,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            marginBottom: '1.35rem',
            animation: 'glowPulse 4.8s ease-in-out infinite',
          }}
        >
          <Image
            src="/brand/lotus-mark.png"
            alt="Nirvan Dham"
            width={150}
            height={150}
            priority
            style={{ width: '90%', height: '90%', objectFit: 'cover', transform: 'scale(1.2)' }}
          />
        </div>

        <p
          className="font-hindi"
          style={{
            fontSize: 'clamp(0.78rem, 2vw, 0.92rem)',
            letterSpacing: '0.28em',
            color: 'var(--c-gold)',
            textTransform: 'uppercase',
            opacity: 0.8,
            marginBottom: '0.5rem',
          }}
        >
          निर्वाण धाम
        </p>

        <h1
          className="font-serif-brand"
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 300,
            color: 'var(--c-ivory)',
            lineHeight: 1.1,
            marginBottom: '0.4rem',
            textAlign: 'center',
          }}
        >
          Choose Your Path
        </h1>
        <p
          className="font-hindi"
          style={{
            fontSize: 'clamp(1.25rem, 3vw, 2rem)',
            fontWeight: 400,
            color: 'var(--c-ivdim)',
            lineHeight: 1.2,
            marginBottom: '0.75rem',
            textAlign: 'center',
          }}
        >
          अपनी भाषा चुनें
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, transparent, var(--c-gold))', opacity: 0.3 }} />
          <span style={{ color: 'var(--c-gold)', fontSize: '1rem', opacity: 0.6 }}>◆</span>
          <div style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, var(--c-gold), transparent)', opacity: 0.3 }} />
        </div>

        <div className="flex gap-5 flex-wrap justify-center">
          <button
            onClick={() => handleSelect('hi')}
            className="group relative overflow-hidden transition-premium"
            style={{
              padding: '1.1rem 2.75rem',
              borderRadius: '4px',
              border: '1px solid rgba(212,168,67,0.4)',
              background: 'rgba(212,168,67,0.08)',
              color: 'var(--c-ivory)',
              cursor: 'pointer',
              minWidth: '170px',
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = 'rgba(212,168,67,0.18)';
              event.currentTarget.style.borderColor = 'rgba(212,168,67,0.7)';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = 'rgba(212,168,67,0.08)';
              event.currentTarget.style.borderColor = 'rgba(212,168,67,0.4)';
            }}
          >
            <span className="font-hindi relative z-10" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 600, display: 'block' }}>
              हिंदी
            </span>
            <span style={{ fontSize: '0.7rem', opacity: 0.45, letterSpacing: '0.1em', display: 'block', marginTop: '2px' }}>
              Hindi
            </span>
          </button>

          <button
            onClick={() => handleSelect('en')}
            className="group relative overflow-hidden transition-premium"
            style={{
              padding: '1.1rem 2.75rem',
              borderRadius: '4px',
              border: '1px solid rgba(245,237,216,0.2)',
              background: 'rgba(245,237,216,0.04)',
              color: 'var(--c-ivory)',
              cursor: 'pointer',
              minWidth: '170px',
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = 'rgba(245,237,216,0.1)';
              event.currentTarget.style.borderColor = 'rgba(245,237,216,0.4)';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = 'rgba(245,237,216,0.04)';
              event.currentTarget.style.borderColor = 'rgba(245,237,216,0.2)';
            }}
          >
            <span className="relative z-10 font-serif-brand" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 400, fontStyle: 'italic', display: 'block' }}>
              English
            </span>
            <span className="font-hindi" style={{ fontSize: '0.7rem', opacity: 0.45, letterSpacing: '0.05em', display: 'block', marginTop: '2px' }}>
              अंग्रेज़ी
            </span>
          </button>
        </div>

        <p style={{ fontSize: '0.7rem', color: 'var(--c-ivdim)', opacity: 0.35, letterSpacing: '0.12em', marginTop: '3rem' }}>
          nirvandham.in
        </p>
      </div>
    </div>
  );
}
