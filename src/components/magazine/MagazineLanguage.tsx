"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import { englishText, magazineEditions, type MagazineLanguage } from '@/data/nirvana-sutra/localization';

const LANGUAGE_KEY = 'nirvan-dham-language';
const subscribe = (notify: () => void) => {
  window.addEventListener('storage', notify);
  window.addEventListener('popstate', notify);
  return () => { window.removeEventListener('storage', notify); window.removeEventListener('popstate', notify); };
};
const readLanguage = (): MagazineLanguage => {
  const query = new URLSearchParams(window.location.search).get('lang');
  if (query === 'en' || query === 'hi') return query;
  try { const saved = localStorage.getItem(LANGUAGE_KEY); if (saved === 'en' || saved === 'hi') return saved; } catch { /* Storage is optional. */ }
  const cookie = document.cookie.split('; ').find(row => row.startsWith(`${LANGUAGE_KEY}=`))?.split('=')[1];
  return cookie === 'en' ? 'en' : 'hi';
};
const defaultValue = { language: 'hi' as MagazineLanguage, issue: magazineEditions.hi, t: (text: string) => text, number: (value: number) => String(value).padStart(2, '0').replace(/\d/g, n => '०१२३४५६७८९'[Number(n)]), changeLanguage: (() => {}) as (language: MagazineLanguage) => void };
const MagazineLanguageContext = createContext(defaultValue);
export const useMagazineLanguage = () => useContext(MagazineLanguageContext);

export function MagazineLanguageProvider({ initialLanguage = 'hi', children }: { initialLanguage?: MagazineLanguage; children: ReactNode }) {
  const serverLanguage = useCallback(() => initialLanguage, [initialLanguage]);
  const saved = useSyncExternalStore(subscribe, readLanguage, serverLanguage);
  const [selected, setSelected] = useState<MagazineLanguage | null>(null);
  const language = selected ?? saved;
  const changeLanguage = useCallback((next: MagazineLanguage) => {
    try { localStorage.setItem(LANGUAGE_KEY, next); } catch { /* Optional preference persistence. */ }
    document.cookie = `${LANGUAGE_KEY}=${next}; path=/; max-age=31536000; samesite=lax`;
    const url = new URL(window.location.href); url.searchParams.set('lang', next);
    window.history.replaceState(null, '', url);
    setSelected(next);
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === 'en' ? 'Nirvan Sutra Patrika — Issue 01' : 'निर्वाण सूत्र पत्रिका — अंक ०१';
  }, [language]);
  const value = useMemo(() => ({ language, issue: magazineEditions[language], t: language === 'en' ? englishText : (text: string) => text, number: (n: number) => language === 'en' ? String(n).padStart(2, '0') : defaultValue.number(n), changeLanguage }), [language, changeLanguage]);
  return <MagazineLanguageContext.Provider value={value}><div className="ns-edition" lang={language}>
    <nav className="ns-language-switch" aria-label={language === 'en' ? 'Magazine language' : 'पत्रिका की भाषा'}>
      <button type="button" lang="hi" aria-pressed={language === 'hi'} onClick={() => changeLanguage('hi')}>हिंदी</button>
      <button type="button" lang="en" aria-pressed={language === 'en'} onClick={() => changeLanguage('en')}>English</button>
    </nav>{children}
  </div></MagazineLanguageContext.Provider>;
}
