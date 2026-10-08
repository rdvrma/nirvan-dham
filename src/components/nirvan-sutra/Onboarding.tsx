'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { act, BASE } from './api';
import { Orb } from './Graphics';
import type { LocaleCode } from '@/course/nirvan-sutra/types';

type L = { code: LocaleCode; native: string; english: string; script: string };

export default function Onboarding({ locales, strings, initial, name: initialName }: { locales: L[]; strings: Record<string, Record<string, string>>; initial: LocaleCode | null; name: string }) {
  const router = useRouter();
  const [step, setStep] = useState<'language' | 'intro'>('language');
  const [locale, setLocale] = useState<LocaleCode | null>(initial);
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  // before a choice, the question slowly turns through every language
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    if (step !== 'language' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setCycle((c) => (c + 1) % locales.length), 3800);
    return () => clearInterval(t);
  }, [step, locales.length]);
  const shown = locales[cycle];
  const s = strings[locale ?? 'hi'];

  const enter = async () => {
    if (!locale) return;
    setBusy(true);
    try { await act('enroll', { locale, name }); router.push(`${BASE}/dashboard`); router.refresh(); } catch { setBusy(false); }
  };

  if (step === 'language') {
    return (
      <section className="ns-onb">
        <div className="ns-narrow">
          <div className="ns-onb-orb ns-rise"><Orb /></div>
          <h1 className="ns-h2 ns-rise ns-rise-1" lang="hi">{strings.hi.chooseLanguageTitle}</h1>
          <p className="ns-lead ns-rise ns-rise-2" aria-hidden="true" lang={shown.code} key={shown.code} style={{ minHeight: '3.4em', animation: 'ns-fade 1.2s both' }}>
            {shown.code !== 'hi' ? strings[shown.code].chooseLanguageTitle : strings.en.chooseLanguageTitle}
          </p>
          <div className="ns-langs ns-rise ns-rise-3" role="group" aria-label={strings.en.chooseLanguageTitle}>
            {locales.map((l) => (
              <button key={l.code} className="ns-lang" aria-pressed={locale === l.code} lang={l.code} onClick={() => { setLocale(l.code); setStep('intro'); }}>
                <span className="ns-lang-native">{l.native}</span>
                <span className="ns-lang-en">{l.english}</span>
              </button>
            ))}
          </div>
          {locale && <p className="ns-small ns-muted" style={{ marginTop: 24 }} lang={locale}>{strings[locale].chooseLanguageNote}</p>}
        </div>
      </section>
    );
  }
  return (
    <section className="ns-onb" lang={locale ?? 'hi'}>
      <div className="ns-narrow ns-stack-l" style={{ textAlign: 'left' }}>
        <div className="ns-eyebrow ns-rise">{s.introEyebrow}</div>
        <h1 className="ns-h1 ns-rise ns-rise-1">{s.introTitle}</h1>
        <p className="ns-lead ns-rise ns-rise-2">{s.introBody1}</p>
        <p className="ns-rise ns-rise-3 ns-muted">{s.introBody2}</p>
        <p className="ns-rise ns-rise-3 ns-muted">{s.introBody3}</p>
        <div className="ns-rise ns-rise-4">
          <label className="ns-label" htmlFor="ns-name">{s.introNamePrompt}</label>
          <input id="ns-name" className="ns-input" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
        </div>
        <div className="ns-row ns-rise ns-rise-4">
          <button className="ns-btn" onClick={enter} disabled={busy}>{s.introCta} <span aria-hidden="true">→</span></button>
          <button className="ns-btn ns-btn-quiet" onClick={() => setStep('language')}>{s.back}</button>
        </div>
      </div>
    </section>
  );
}
