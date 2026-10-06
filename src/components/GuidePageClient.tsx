'use client';

import { useEffect, useState } from 'react';
import AIGuidePanel from '@/components/AIGuidePanel';
import ContactSection from '@/components/ContactSection';
import Header from '@/components/Header';
import { getSavedLanguage, saveLanguage, type Language } from '@/lib/i18n';

export default function GuidePageClient() {
  const [lang, setLang] = useState<Language>('hi');

  useEffect(() => {
    const timer = window.setTimeout(() => setLang(getSavedLanguage()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function changeLanguage(next: Language) {
    saveLanguage(next);
    setLang(next);
  }

  return (
    <>
      <Header lang={lang} onLangChange={changeLanguage} />
      <main style={{ paddingTop: '72px' }}>
        <AIGuidePanel lang={lang} standalone />
      </main>
      <ContactSection lang={lang} homeLinks />
    </>
  );
}
