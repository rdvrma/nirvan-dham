'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BrandMark from '../BrandMark';
import type { LocaleCode } from '@/course/nirvan-sutra/types';

type L = { code: LocaleCode; native: string; english: string };

// The first screen of /course: before anything else, the seeker chooses the language the whole course will speak.
export default function LanguageGate({ locales, titles, notes, current }: { locales: L[]; titles: Record<string, string>; notes: Record<string, string>; current: LocaleCode | null }) {
  const router = useRouter();
  const [cycle, setCycle] = useState(0);
  const [picked, setPicked] = useState<LocaleCode | null>(null);
  const [hover, setHover] = useState<LocaleCode | null>(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setCycle((c) => (c + 1) % locales.length), 2600);
    return () => clearInterval(t);
  }, [locales.length]);
  const shown = hover ?? locales[cycle].code;

  const choose = (code: LocaleCode) => {
    setPicked(code);
    rememberLanguage(code);
    router.push(`/course?lang=${code}`);
  };

  return (
    <main className={`nsl-gate${picked ? ' is-leaving' : ''}`}>
      <video className="nsl-bgvideo" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" src="/course-videos/hero.mp4" />
      <div className="nsl-veil" aria-hidden="true" />
      <Rings />
      <div className="nsl-gate-inner">
        <div className="nsl-gate-mark ns-rise"><BrandMark size={64} className="" /></div>
        <p className="nsl-gate-brand ns-rise ns-rise-1"><span lang="hi">निर्वाण सूत्र</span><span className="nsl-gate-brand-en">Nirvan Sutra</span></p>
        <h1 className="nsl-gate-q ns-rise ns-rise-2" aria-live="polite">
          <span key={shown} lang={shown} className="nsl-gate-q-text">{titles[shown]}</span>
        </h1>
        <div className="nsl-gate-grid ns-rise ns-rise-3" role="group" aria-label="Choose your language">
          {locales.map((l, i) => (
            <button
              key={l.code}
              type="button"
              lang={l.code}
              className={`nsl-tile${l.code === current ? ' is-current' : ''}${l.code === picked ? ' is-picked' : ''}`}
              style={{ ['--i' as string]: i }}
              onClick={() => choose(l.code)}
              onMouseEnter={() => setHover(l.code)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(l.code)}
              onBlur={() => setHover(null)}
              disabled={!!picked}
            >
              <span className="nsl-tile-glyph" aria-hidden="true">{[...l.native][0]}</span>
              <span className="nsl-tile-native">{l.native}</span>
              <span className="nsl-tile-en">{l.english}</span>
            </button>
          ))}
        </div>
        <p className="nsl-gate-note ns-rise ns-rise-4" lang={shown}>{notes[shown]}</p>
      </div>
    </main>
  );
}

/** The last choice, so /course opens in it next time (read on the server; not sensitive). */
function rememberLanguage(code: LocaleCode) {
  document.cookie = `ns_lang=${code}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

function Rings() {
  return (
    <svg className="nsl-rings" viewBox="0 0 800 800" aria-hidden="true">
      <g fill="none" stroke="rgba(212,168,67,0.16)">
        <circle cx="400" cy="400" r="390" strokeWidth="0.8" />
        <circle cx="400" cy="400" r="300" strokeWidth="0.8" strokeDasharray="2 10" className="nsl-spin" />
        <circle cx="400" cy="400" r="210" strokeWidth="0.8" />
        <circle cx="400" cy="400" r="120" strokeWidth="0.8" strokeDasharray="1 6" className="nsl-spin-rev" />
      </g>
    </svg>
  );
}
