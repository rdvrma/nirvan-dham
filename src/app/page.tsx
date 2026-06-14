'use client';

import { useState, useEffect } from 'react';
import type { Language } from '@/lib/i18n';
import { getSavedLanguage, saveLanguage, LANGUAGE_STORAGE_KEY } from '@/lib/i18n';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TatvSection from '@/components/TatvSection';
import PillarsSection from '@/components/PillarsSection';
import PathSection from '@/components/PathSection';
import AIGuidePanel from '@/components/AIGuidePanel';
import BlogSection from '@/components/BlogSection';
import YouTubeSection from '@/components/YouTubeSection';
import GuidanceSection from '@/components/GuidanceSection';
import DonationSection from '@/components/DonationSection';
import AppSection from '@/components/AppSection';
import ContactSection from '@/components/ContactSection';
import SplashScreen from '@/components/SplashScreen';

export default function HomePage() {
  const [lang, setLang] = useState<Language>('hi');
  const [mounted, setMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    window.setTimeout(() => {
      const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (!saved) {
        // First time visitor — show splash
        setShowSplash(true);
      } else {
        setLang(getSavedLanguage());
      }
      setMounted(true);
    }, 0);
  }, []);

  function handleSplashSelect(selected: Language) {
    saveLanguage(selected);
    setLang(selected);
    setShowSplash(false);
  }

  function handleLangChange(selected: Language) {
    setLang(selected);
    saveLanguage(selected);
  }

  const activeLang: Language = mounted ? lang : 'hi';

  return (
    <>
      {showSplash && <SplashScreen onSelect={handleSplashSelect} />}
      <Header lang={activeLang} onLangChange={handleLangChange} />
      <main>
        <HeroSection lang={activeLang} />
        <TatvSection lang={activeLang} />
        <PillarsSection lang={activeLang} />
        <PathSection lang={activeLang} />
        <AIGuidePanel lang={activeLang} />
        <BlogSection lang={activeLang} />
        <YouTubeSection lang={activeLang} />
        <GuidanceSection lang={activeLang} />
        <DonationSection lang={activeLang} />
        <AppSection lang={activeLang} />
      </main>
      <ContactSection lang={activeLang} />
    </>
  );
}
