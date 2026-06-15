'use client';

import { useState, useEffect } from 'react';
import type { Language } from '@/lib/i18n';
import { getSavedLanguage, saveLanguage } from '@/lib/i18n';
import Header from '@/components/Header';
import ContactSection from '@/components/ContactSection';

const copy = {
  hi: {
    eyebrow: 'आदिसत्व',
    title: 'जिसे तुम खोज रहे हो, वही तुम हो',
    lead: 'आदिसत्व कोई व्यक्ति या शरीर नहीं है, बल्कि वह विशुद्ध जागरूकता है जो हर जीव के भीतर विद्यमान है। निर्वाण धाम एक आश्रम नहीं, बल्कि उसी सत्य की एक अभिव्यक्ति है।',
    p1: 'आदिसत्व की शिक्षाओं का मूल आधार "अद्वैत" और "आत्म-जिज्ञासा" (मैं कौन हूँ?) है। यह कोई नया धर्म, परंपरा या संप्रदाय नहीं है। यह केवल एक सीधा इशारा है — उस सत्य की ओर जिसे तुम हमेशा से हो।',
    p2: 'यहाँ कोई वादा नहीं किया जाता, कोई चमत्कार नहीं बेचा जाता। केवल एक शांत, प्रेमपूर्ण मार्गदर्शन है उन साधकों के लिए जो वास्तव में सत्य को जानना चाहते हैं। जब मन शांत होता है, तब "निर्वाण सूत्र" स्वयं प्रकट होता है।',
    p3: 'चाहे आप ऑनलाइन संवाद के माध्यम से जुड़ें, या बोधगया की पावन भूमि पर बैठें — आदिसत्व की उपस्थिति आपको केवल स्वयं की ओर लौटाती है।',
  },
  en: {
    eyebrow: 'Aadisatv',
    title: 'You yourself are that which you are seeking',
    lead: 'Aadisatv is not merely a person or a body, but the pure awareness that exists within every being. Nirvan Dham is not an ashram, but an expression of that very truth.',
    p1: 'The core foundation of Aadisatv’s teachings is "Advaita" (Non-duality) and "Self-inquiry" (Who am I?). This is not a new religion, tradition, or sect. It is a direct pointing — toward the truth of what you have always been.',
    p2: 'There are no promises of enlightenment, no miracles sold here. There is only a quiet, loving guidance for seekers who truly wish to see. When the mind settles, the "Nirvan Sutra" reveals itself.',
    p3: 'Whether you connect through Online Samvad, or sit in the sacred land of Bodhgaya — the presence of Aadisatv simply returns you to yourself.',
  },
};

export default function AboutAadisatvPage() {
  const [lang, setLang] = useState<Language>('hi');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLang(getSavedLanguage());
    setMounted(true);
  }, []);

  function handleLangChange(selected: Language) {
    setLang(selected);
    saveLanguage(selected);
  }

  const activeLang = mounted ? lang : 'hi';
  const c = copy[activeLang];

  return (
    <div className="about-page">
      <div className="about-grid-bg" />
      <div className="about-mandala" aria-hidden="true" />
      
      <Header lang={activeLang} onLangChange={handleLangChange} />

      <main className="about-main">
        <section className="about-hero">
          <span className="about-symbol">ॐ</span>
          <p>{c.eyebrow}</p>
          <h1>{c.title}</h1>
          <span className="about-line" />
          <p className="about-lead">{c.lead}</p>
        </section>

        <section className="about-content">
          <div className="about-text-card">
            <p className={activeLang === 'hi' ? 'font-hindi' : ''}>{c.p1}</p>
            <p className={activeLang === 'hi' ? 'font-hindi' : ''}>{c.p2}</p>
            <p className={activeLang === 'hi' ? 'font-hindi' : ''}>{c.p3}</p>
          </div>
        </section>
      </main>

      <ContactSection lang={activeLang} />

      <style jsx>{`
        .about-page {
          min-height: 100vh;
          background: var(--c-bg);
          color: var(--c-text);
          position: relative;
          overflow-x: hidden;
          font-family: var(--font-hind);
          display: flex;
          flex-direction: column;
        }

        .about-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 78% 58% at 50% -10%, rgba(26,92,53,.34), transparent 68%),
            radial-gradient(ellipse 58% 48% at 82% 92%, rgba(61,138,88,.14), transparent 62%),
            radial-gradient(ellipse 45% 42% at 18% 80%, rgba(212,168,67,.08), transparent 64%),
            linear-gradient(180deg, var(--c-bg), var(--c-surface) 52%, var(--c-bg));
          pointer-events: none;
        }

        .about-grid-bg {
          position: fixed;
          inset: 0;
          opacity: .16;
          background-image:
            linear-gradient(rgba(212,168,67,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,168,67,.025) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        .about-mandala {
          position: fixed;
          width: min(880px, 116vw);
          aspect-ratio: 1;
          top: 48%;
          left: 50%;
          transform: translate(-50%, -50%);
          border: 1px solid rgba(212,168,67,.08);
          border-radius: 999px;
          pointer-events: none;
          opacity: .9;
        }

        .about-main {
          position: relative;
          z-index: 2;
          width: min(1000px, calc(100% - 2rem));
          margin: 0 auto;
          padding-top: 5rem;
          padding-bottom: 5rem;
          flex-grow: 1;
        }

        .about-hero {
          text-align: center;
          padding: clamp(4rem, 8vw, 6rem) 0 clamp(2rem, 5vw, 3.5rem);
        }

        .about-symbol {
          display: block;
          color: var(--c-gold);
          font-size: clamp(2.4rem, 6vw, 4rem);
          margin-bottom: 1rem;
          filter: drop-shadow(0 0 28px rgba(212,168,67,.32));
        }

        .about-hero > p:first-of-type {
          color: rgba(212,168,67,.7);
          text-transform: uppercase;
          letter-spacing: .24em;
          font-size: .72rem;
          font-family: var(--font-inter);
          font-weight: 700;
        }

        .about-hero h1 {
          color: var(--c-ivory);
          font-family: var(--font-cormorant);
          font-weight: 300;
          font-size: clamp(3rem, 8vw, 5.5rem);
          line-height: .95;
          margin: .8rem 0 1.3rem;
        }

        .about-line {
          display: block;
          width: 140px;
          height: 1px;
          margin: 0 auto 1.5rem;
          background: linear-gradient(90deg, transparent, rgba(212,168,67,.5), transparent);
        }

        .about-lead {
          max-width: 700px;
          margin: 0 auto;
          color: var(--c-ivdim);
          line-height: 1.85;
          font-size: clamp(1rem, 2vw, 1.16rem);
        }

        .about-content {
          margin-top: 2rem;
        }

        .about-text-card {
          border: 1px solid rgba(212,168,67,.15);
          background: rgba(13,31,16,.72);
          backdrop-filter: blur(14px);
          border-radius: 10px;
          padding: clamp(2rem, 5vw, 4rem);
          box-shadow: 0 24px 80px rgba(0,0,0,.35), 0 0 50px rgba(26,92,53,.14);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .about-text-card p {
          color: var(--c-ivdim);
          line-height: 1.8;
          font-size: 1.1rem;
        }

        @media (max-width: 720px) {
          .about-hero h1 {
            font-size: 2.5rem;
          }
          .about-text-card p {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
