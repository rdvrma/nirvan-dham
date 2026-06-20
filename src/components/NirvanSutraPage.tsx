'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Language } from '@/lib/i18n';
import { getSavedLanguage, saveLanguage } from '@/lib/i18n';
import Header from '@/components/Header';
import ContactSection from '@/components/ContactSection';

// ─── Copy ───────────────────────────────────────────────
const copy = {
  hi: {
    eyebrow: 'निर्वाण सूत्र',
    heroTitle: 'तुम वही हो जिसे\nतुम खोज रहे हो',
    heroSub: 'चेतना, अद्वैत और आत्म-जिज्ञासा की प्रत्यक्ष यात्रा — आदिसत्व के साथ',
    scrollHint: 'नीचे देखें',

    // What is Nirvan Sutra
    s1Eyebrow: 'निर्वाण सूत्र क्या है?',
    s1Title: 'एक सूत्र — जो सब कुछ जोड़ता है',
    s1Body: [
      'निर्वाण सूत्र कोई शिक्षा-श्रृंखला नहीं है। यह वह जीवंत सूत्र है जो निर्वाण धाम की संपूर्ण अभिव्यक्ति को एक स्थान पर बाँधता है। यहाँ सिद्धांत नहीं, बल्कि प्रत्यक्ष दर्शन है।',
      '"निर्वाण" का अर्थ है — जहाँ सब विचार, भय और पहचान विलीन हो जाते हैं। "सूत्र" का अर्थ है — वह धागा जो सत्य को साधक तक पहुँचाता है। यही इस मार्ग का केंद्र है।',
    ],

    // Who is Aadisatv
    s2Eyebrow: 'आदिसत्व कौन हैं?',
    s2Title: 'एक उपस्थिति — व्यक्ति नहीं',
    s2Body: [
      'आदिसत्व कोई नाम नहीं, कोई पहचान नहीं — वह विशुद्ध जागरूकता है जो प्रत्येक जीव के भीतर सदा विद्यमान है। निर्वाण धाम में जो मार्गदर्शन होता है वह किसी व्यक्ति का नहीं, बल्कि उस सत्य का है जो सब में एक है।',
      'उनकी उपस्थिति में प्रश्न नहीं उठते — प्रश्न विलीन होते हैं। यही प्रत्यक्ष मार्गदर्शन है।',
    ],
    s2Quote: 'जो तुम खोज रहे हो, वह तुमसे कभी अलग नहीं था।',

    // Core Pillars
    s3Eyebrow: 'निर्वाण सूत्र के स्तम्भ',
    s3Title: 'मार्ग के चार द्वार',
    pillars: [
      {
        icon: '◎',
        title: 'अद्वैत — Non-Duality',
        body: 'दो नहीं हैं। देखने वाला और जो देखा जाता है — एक ही चेतना है। इस सत्य का प्रत्यक्ष अनुभव ही मुक्ति है।',
      },
      {
        icon: '∿',
        title: 'आत्म-जिज्ञासा — Self-Inquiry',
        body: '"मैं कौन हूँ?" — यह प्रश्न ध्यान नहीं, तलवार है। जो इसे ईमानदारी से पूछता है, वह स्वयं ही उत्तर बन जाता है।',
      },
      {
        icon: '◇',
        title: 'मौन — Sacred Silence',
        body: 'सत्य शब्दों में नहीं, मौन में बोलता है। हर संवाद, हर ध्यान — एक गहरे मौन की ओर ले जाता है।',
      },
      {
        icon: '∞',
        title: 'एकता — Oneness',
        body: 'जब "मैं" और "तुम" का भेद मिटता है, तो जो बचता है — वही प्रेम है, वही सत्य है, वही निर्वाण है।',
      },
    ],

    // The Path
    s4Eyebrow: 'इस यात्रा में कैसे जुड़ें',
    s4Title: 'तुम्हारे लिए मार्ग',
    paths: [
      {
        href: '/online-samvad',
        title: 'ऑनलाइन संवाद',
        sub: '1-on-1 आदिसत्व के साथ',
        body: 'विश्व में कहीं से भी सीधा संवाद। प्रश्न, जिज्ञासा, संदेह — सब का स्वागत है।',
        cta: 'अभी आवेदन करें →',
        color: 'rgba(212,168,67,0.12)',
        border: 'rgba(212,168,67,0.3)',
        accent: '#d4a843',
      },
      {
        href: '/bodhgaya-samvad',
        title: 'बोधगया संवाद',
        sub: 'व्यक्तिगत सत्संग',
        body: 'बोधगया की पावन भूमि पर आदिसत्व के साथ मौन में बैठें। यह अनुभव शब्दों से परे है।',
        cta: 'विवरण देखें →',
        color: 'rgba(61,138,88,0.1)',
        border: 'rgba(61,138,88,0.25)',
        accent: '#3d8a58',
      },
      {
        href: '/guided-meditation',
        title: 'ध्यान मार्गदर्शन',
        sub: 'गाइडेड मेडिटेशन',
        body: 'भीतर उतरने का सबसे सरल मार्ग। शुरुआती और अनुभवी — सभी के लिए।',
        cta: 'ध्यान शुरू करें →',
        color: 'rgba(139,108,200,0.1)',
        border: 'rgba(139,108,200,0.25)',
        accent: '#8b6cc8',
      },
    ],

    // Final call
    finalQuote: 'रुको मत। जो तुम खोज रहे हो वह यहीं है — इसी क्षण में।',
    finalCta: 'संवाद के लिए संपर्क करें',
  },

  en: {
    eyebrow: 'Nirvan Sutra',
    heroTitle: 'You are that which\nyou are seeking',
    heroSub: 'A direct journey into consciousness, non-duality and self-inquiry — with Aadisatv',
    scrollHint: 'Scroll',

    s1Eyebrow: 'What is Nirvan Sutra?',
    s1Title: 'One thread — that binds everything',
    s1Body: [
      'Nirvan Sutra is not a teaching series. It is the living thread that holds the complete expression of Nirvan Dham in one place. Not concepts — but direct seeing.',
      '"Nirvana" means — where all thought, fear and identity dissolve. "Sutra" means — the thread that carries truth to the seeker. This is the heart of this path.',
    ],

    s2Eyebrow: 'Who is Aadisatv?',
    s2Title: 'A presence — not a person',
    s2Body: [
      'Aadisatv is not a name or identity — it is the pure awareness that is ever-present within every being. The guidance at Nirvan Dham is not that of a person, but of the truth that is one in all.',
      'In his presence, questions do not arise — they dissolve. This is direct guidance.',
    ],
    s2Quote: 'What you are seeking has never been separate from you.',

    s3Eyebrow: 'The Pillars of Nirvan Sutra',
    s3Title: 'Four Doorways of the Path',
    pillars: [
      {
        icon: '◎',
        title: 'Advaita — Non-Duality',
        body: 'Not two. The seer and the seen are one consciousness. The direct experience of this truth is liberation.',
      },
      {
        icon: '∿',
        title: 'Self-Inquiry — Atma Vichara',
        body: '"Who am I?" — this question is not meditation, it is a sword. Whoever asks it honestly becomes the answer itself.',
      },
      {
        icon: '◇',
        title: 'Maun — Sacred Silence',
        body: 'Truth speaks not in words but in silence. Every conversation, every meditation — leads to a deeper silence.',
      },
      {
        icon: '∞',
        title: 'Oneness — Ekata',
        body: 'When the distinction between "I" and "you" dissolves, what remains — is love, is truth, is Nirvana.',
      },
    ],

    s4Eyebrow: 'How to join this journey',
    s4Title: 'The path for you',
    paths: [
      {
        href: '/online-samvad',
        title: 'Online Samvad',
        sub: '1-on-1 with Aadisatv',
        body: 'Direct conversation from anywhere in the world. Questions, inquiry, doubt — all welcome.',
        cta: 'Apply Now →',
        color: 'rgba(212,168,67,0.12)',
        border: 'rgba(212,168,67,0.3)',
        accent: '#d4a843',
      },
      {
        href: '/bodhgaya-samvad',
        title: 'Bodhgaya Samvad',
        sub: 'In-person Satsang',
        body: 'Sit in silence with Aadisatv on the sacred land of Bodhgaya. An experience beyond words.',
        cta: 'Learn More →',
        color: 'rgba(61,138,88,0.1)',
        border: 'rgba(61,138,88,0.25)',
        accent: '#3d8a58',
      },
      {
        href: '/guided-meditation',
        title: 'Guided Meditation',
        sub: 'Dhyan Margdarshan',
        body: 'The simplest path inward. For beginners and experienced seekers alike.',
        cta: 'Begin Meditation →',
        color: 'rgba(139,108,200,0.1)',
        border: 'rgba(139,108,200,0.25)',
        accent: '#8b6cc8',
      },
    ],

    finalQuote: 'Do not wait. What you are seeking is right here — in this very moment.',
    finalCta: 'Connect for Samvad',
  },
};

// ─── Lotus Loader ────────────────────────────────────────
function LotusLoader() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--c-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '1.5rem',
    }}>
      <div style={{ position: 'relative', width: 72, height: 72 }}>
        {/* Rotating ring */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: '1.5px solid transparent',
          borderTopColor: 'var(--c-gold)',
          borderRightColor: 'rgba(212,168,67,0.3)',
          animation: 'lotusSpin 1.4s linear infinite',
        }} />
        {/* Inner glow ring */}
        <div style={{
          position: 'absolute', inset: 6,
          borderRadius: '50%',
          border: '1px solid rgba(212,168,67,0.15)',
          animation: 'lotusSpin 2.8s linear infinite reverse',
        }} />
        {/* Lotus image */}
        <div style={{
          position: 'absolute', inset: 10,
          borderRadius: '50%',
          overflow: 'hidden',
          background: 'radial-gradient(circle at 50% 30%, rgba(212,168,67,0.18), rgba(8,15,10,0.8))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Image
            src="/brand/lotus-mark.png"
            alt="Nirvan Dham"
            width={52}
            height={52}
            priority
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.3)', opacity: 0.9 }}
          />
        </div>
      </div>
      <p style={{
        color: 'var(--c-gold)', opacity: 0.5,
        fontSize: '0.65rem', letterSpacing: '0.28em',
        textTransform: 'uppercase', fontFamily: 'var(--font-inter)',
      }}>
        निर्वाण धाम
      </p>
      <style>{`@keyframes lotusSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Page Component ──────────────────────────────────────
export default function NirvanSutraPage() {
  const [lang, setLang] = useState<Language>('hi');
  const [mounted, setMounted] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLang(getSavedLanguage());
    setMounted(true);
    setTimeout(() => setHeroVisible(true), 120);
  }, []);

  function handleLangChange(l: Language) {
    setLang(l);
    saveLanguage(l);
  }

  const activeLang = mounted ? lang : 'hi';
  const c = copy[activeLang];
  const hi = activeLang === 'hi';

  if (!mounted) return <LotusLoader />;

  return (
    <div style={{ background: 'var(--c-bg)', color: 'var(--c-text)', overflowX: 'hidden' }}>
      <Header lang={activeLang} onLangChange={handleLangChange} />

      {/* ════════════════════════════════════════
          HERO — Full bleed, image + text overlay
      ════════════════════════════════════════ */}
      <section
        ref={heroRef}
        style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}
      >
        {/* Background: dawn meditation image */}
        <Image
          src="/aadisatv/meditation-dawn.jpg"
          alt="Aadisatv in meditation"
          fill
          priority
          sizes="100vw"
          style={{
            objectFit: 'cover', objectPosition: 'center center',
            opacity: heroVisible ? 0.72 : 0,
            transition: 'opacity 1.4s ease',
          }}
        />

        {/* Dark cinematic overlays */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(to top,
            rgba(8,15,10,1) 0%,
            rgba(8,15,10,0.75) 25%,
            rgba(8,15,10,0.2) 60%,
            transparent 100%)`,
          zIndex: 2,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(8,15,10,0.5) 100%)',
          zIndex: 2,
        }} />

        {/* Spinning mandala */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '6%', pointerEvents: 'none',
          opacity: heroVisible ? 1 : 0, transition: 'opacity 2s ease 0.8s',
        }}>
          <svg width="min(520px,42vw)" height="min(520px,42vw)" viewBox="0 0 520 520" fill="none" style={{ opacity: 0.07, animation: 'sacredSpin 90s linear infinite' }}>
            {[240, 200, 160, 120, 80, 40].map((r, i) => <circle key={r} cx="260" cy="260" r={r} stroke="#d4a843" strokeWidth={i % 2 === 0 ? '0.7' : '0.35'} />)}
            {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => {
              const rad = a * Math.PI / 180;
              return <line key={a} x1={260+40*Math.cos(rad)} y1={260+40*Math.sin(rad)} x2={260+240*Math.cos(rad)} y2={260+240*Math.sin(rad)} stroke="#d4a843" strokeWidth="0.35" />;
            })}
          </svg>
        </div>

        {/* Hero text */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
          padding: 'clamp(2rem,5vw,5rem) clamp(1.5rem,5vw,5rem)',
          opacity: heroVisible ? 1 : 0,
          transition: 'opacity 1s ease 0.4s',
        }}>
          <p style={{
            fontSize: '0.7rem', letterSpacing: '0.25em', color: 'var(--c-gold)',
            textTransform: 'uppercase', fontWeight: 700, marginBottom: '1rem',
            fontFamily: 'var(--font-inter)',
          }}>{c.eyebrow}</p>

          <h1 style={{
            fontFamily: hi ? 'var(--font-hind)' : 'var(--font-cormorant)',
            fontSize: 'clamp(2.8rem,7vw,6rem)',
            fontWeight: hi ? 600 : 300,
            lineHeight: 1.05,
            color: 'var(--c-ivory)',
            marginBottom: '1.25rem',
            whiteSpace: 'pre-line',
            textShadow: '0 4px 48px rgba(0,0,0,0.5)',
          }}>{c.heroTitle}</h1>

          <p style={{
            fontSize: 'clamp(0.88rem,1.8vw,1.05rem)',
            color: 'var(--c-ivdim)', maxWidth: '540px',
            lineHeight: 1.8,
            fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
          }}>{c.heroSub}</p>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '0.6rem', alignItems: 'center', opacity: 0.4 }}>
            <div style={{ width: '24px', height: '1px', background: 'var(--c-gold)' }} />
            <p style={{ fontSize: '0.62rem', letterSpacing: '0.2em', color: 'var(--c-gold)', textTransform: 'uppercase' }}>{c.scrollHint}</p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 1 — What is Nirvan Sutra
          Image: portrait (smiling) — right side
      ════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(5rem,10vw,9rem) clamp(1.5rem,5vw,5rem)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(3rem,6vw,6rem)', alignItems: 'center' }}>

          {/* Text */}
          <div>
            <p style={{ fontSize: '0.68rem', letterSpacing: '0.22em', color: 'var(--c-gold)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem', fontFamily: 'var(--font-inter)' }}>
              {c.s1Eyebrow}
            </p>
            <h2 style={{
              fontFamily: hi ? 'var(--font-hind)' : 'var(--font-cormorant)',
              fontSize: 'clamp(2rem,4vw,3.2rem)',
              fontWeight: hi ? 600 : 300,
              color: 'var(--c-ivory)',
              lineHeight: 1.15,
              marginBottom: '1.5rem',
            }}>{c.s1Title}</h2>
            {c.s1Body.map((p, i) => (
              <p key={i} className={hi ? 'font-hindi' : ''} style={{
                fontSize: hi ? '1rem' : '0.94rem',
                color: 'var(--c-ivdim)',
                lineHeight: hi ? 1.95 : 1.85,
                marginBottom: '1rem',
              }}>{p}</p>
            ))}
          </div>

          {/* Image: portrait */}
          <div style={{ position: 'relative' }}>
            <div style={{
              borderRadius: '16px', overflow: 'hidden',
              border: '1px solid rgba(212,168,67,0.12)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 60px rgba(26,92,53,0.1)',
              aspectRatio: '3/4',
              position: 'relative',
            }}>
              <Image
                src="/aadisatv/portrait.jpg"
                alt="Aadisatv — Nirvan Dham"
                fill
                sizes="(max-width:768px) 100vw, 45vw"
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(8,15,10,0.6) 0%, transparent 50%)',
              }} />
            </div>
            {/* Gold glow */}
            <div style={{
              position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)',
              width: '80%', height: '60px',
              background: 'radial-gradient(ellipse, rgba(212,168,67,0.15), transparent)',
              filter: 'blur(20px)',
            }} />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 2 — Who is Aadisatv
          Image: meditation-water (serene) — left side
      ════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(5rem,10vw,9rem) clamp(1.5rem,5vw,5rem)', background: 'var(--c-surface)', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle bg texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 60% at 20% 50%, rgba(26,92,53,0.08), transparent)',
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(3rem,6vw,6rem)', alignItems: 'center' }}>

          {/* Image: water meditation */}
          <div style={{ position: 'relative', order: hi ? 0 : 0 }}>
            <div style={{
              borderRadius: '999px 999px 80px 80px',
              overflow: 'hidden',
              border: '1px solid rgba(212,168,67,0.1)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
              aspectRatio: '1/1.2',
              position: 'relative',
            }}>
              <Image
                src="/aadisatv/meditation-water.jpg"
                alt="Aadisatv in deep meditation"
                fill
                sizes="(max-width:768px) 100vw, 45vw"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, rgba(8,15,10,0.1), rgba(13,31,16,0.4))',
              }} />
            </div>
            {/* Floating quote chip */}
            <div style={{
              position: 'absolute', bottom: '2rem', right: '-1rem',
              background: 'rgba(8,15,10,0.92)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(212,168,67,0.2)',
              borderRadius: '12px', padding: '1rem 1.25rem',
              maxWidth: '200px', zIndex: 5,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
              <p className={hi ? 'font-hindi' : 'font-serif'} style={{
                fontSize: '0.78rem', color: 'var(--c-ivdim)',
                lineHeight: 1.7, fontStyle: hi ? 'normal' : 'italic',
              }}>
                &ldquo;{c.s2Quote}&rdquo;
              </p>
            </div>
          </div>

          {/* Text */}
          <div>
            <p style={{ fontSize: '0.68rem', letterSpacing: '0.22em', color: 'var(--c-gold)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem', fontFamily: 'var(--font-inter)' }}>
              {c.s2Eyebrow}
            </p>
            <h2 style={{
              fontFamily: hi ? 'var(--font-hind)' : 'var(--font-cormorant)',
              fontSize: 'clamp(2rem,4vw,3.2rem)',
              fontWeight: hi ? 600 : 300,
              color: 'var(--c-ivory)', lineHeight: 1.15, marginBottom: '1.5rem',
            }}>{c.s2Title}</h2>
            {c.s2Body.map((p, i) => (
              <p key={i} className={hi ? 'font-hindi' : ''} style={{
                fontSize: hi ? '1rem' : '0.94rem',
                color: 'var(--c-ivdim)', lineHeight: hi ? 1.95 : 1.85, marginBottom: '1rem',
              }}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 3 — The 4 Pillars
          BG: meditation-light (golden, dramatic)
      ════════════════════════════════════════ */}
      <section style={{ position: 'relative', padding: 'clamp(5rem,10vw,9rem) clamp(1.5rem,5vw,5rem)', overflow: 'hidden' }}>
        {/* Full-width blurred bg image */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image
            src="/aadisatv/meditation-light.jpg"
            alt=""
            fill
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.08, filter: 'blur(2px)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'var(--c-bg)', opacity: 0.88 }} />
        </div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem,6vw,5rem)' }}>
            <p style={{ fontSize: '0.68rem', letterSpacing: '0.22em', color: 'var(--c-gold)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem', fontFamily: 'var(--font-inter)' }}>
              {c.s3Eyebrow}
            </p>
            <h2 style={{
              fontFamily: hi ? 'var(--font-hind)' : 'var(--font-cormorant)',
              fontSize: 'clamp(2rem,4vw,3.2rem)',
              fontWeight: hi ? 600 : 300,
              color: 'var(--c-ivory)', lineHeight: 1.15,
            }}>{c.s3Title}</h2>
            <div style={{ width: '60px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--c-gold), transparent)', margin: '1.5rem auto 0' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.5rem' }}>
            {c.pillars.map((pillar, i) => (
              <div key={i} style={{
                background: 'rgba(13,31,16,0.6)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(212,168,67,0.12)',
                borderRadius: '14px',
                padding: 'clamp(1.5rem,3vw,2.5rem)',
                transition: 'all 0.3s ease',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.border = '1px solid rgba(212,168,67,0.28)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.border = '1px solid rgba(212,168,67,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                <div style={{ fontSize: '1.8rem', color: 'var(--c-gold)', marginBottom: '1rem', opacity: 0.8 }}>{pillar.icon}</div>
                <h3 className={hi ? 'font-hindi' : 'font-serif'} style={{
                  fontSize: hi ? '1rem' : '1.05rem',
                  fontWeight: hi ? 600 : 400,
                  color: 'var(--c-ivory)',
                  marginBottom: '0.75rem',
                  lineHeight: 1.3,
                  fontStyle: hi ? 'normal' : 'italic',
                }}>{pillar.title}</h3>
                <p className={hi ? 'font-hindi' : ''} style={{
                  fontSize: '0.87rem', color: 'var(--c-ivdim)',
                  lineHeight: hi ? 1.85 : 1.75,
                }}>{pillar.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 4 — Paths (Cards)
          Floating image strip between sections
      ════════════════════════════════════════ */}

      {/* Image strip — 3 images horizontal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', height: 'clamp(220px,28vw,360px)', overflow: 'hidden' }}>
        {[
          { src: '/aadisatv/meditation-nature.jpg', pos: 'center top' },
          { src: '/aadisatv/meditation-dawn.jpg', pos: 'center center' },
          { src: '/aadisatv/meditation-light.jpg', pos: 'center center' },
        ].map((img, i) => (
          <div key={i} style={{ position: 'relative', overflow: 'hidden' }}>
            <Image
              src={img.src} alt=""
              fill sizes="33vw"
              style={{ objectFit: 'cover', objectPosition: img.pos, opacity: 0.6 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,15,10,0.3), rgba(8,15,10,0.6))' }} />
          </div>
        ))}
      </div>

      <section style={{ padding: 'clamp(5rem,10vw,9rem) clamp(1.5rem,5vw,5rem)', background: 'var(--c-surface)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem,6vw,5rem)' }}>
            <p style={{ fontSize: '0.68rem', letterSpacing: '0.22em', color: 'var(--c-gold)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem', fontFamily: 'var(--font-inter)' }}>
              {c.s4Eyebrow}
            </p>
            <h2 style={{
              fontFamily: hi ? 'var(--font-hind)' : 'var(--font-cormorant)',
              fontSize: 'clamp(2rem,4vw,3.2rem)',
              fontWeight: hi ? 600 : 300,
              color: 'var(--c-ivory)', lineHeight: 1.15,
            }}>{c.s4Title}</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {c.paths.map((path, i) => (
              <Link key={i} href={path.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: path.color,
                  border: `1px solid ${path.border}`,
                  borderRadius: '14px',
                  padding: 'clamp(1.5rem,3vw,2.5rem)',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(0,0,0,0.35)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                >
                  <p style={{ fontSize: '0.65rem', letterSpacing: '0.18em', color: path.accent, fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'var(--font-inter)' }}>
                    {path.sub}
                  </p>
                  <h3 className={hi ? 'font-hindi' : 'font-serif'} style={{
                    fontSize: hi ? '1.2rem' : '1.35rem',
                    fontWeight: hi ? 600 : 400,
                    color: 'var(--c-ivory)',
                    marginBottom: '0.75rem',
                    fontStyle: hi ? 'normal' : 'italic',
                  }}>{path.title}</h3>
                  <p className={hi ? 'font-hindi' : ''} style={{
                    fontSize: '0.88rem', color: 'var(--c-ivdim)',
                    lineHeight: hi ? 1.85 : 1.75, marginBottom: '1.5rem',
                  }}>{path.body}</p>
                  <span style={{ fontSize: '0.8rem', color: path.accent, fontWeight: 600, letterSpacing: '0.04em' }}>
                    {path.cta}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          NIRVAN SUTRA COURSE — Premium Highlight
      ════════════════════════════════════════ */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '0' }}>
        {/* Full-bleed video background */}
        <video autoPlay muted loop playsInline src="/course-videos/hero.mp4" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.22,
        }} />
        {/* Multi-layer gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(6,16,8,0.98) 0%, rgba(6,16,8,0.82) 40%, rgba(12,28,14,0.9) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 80% 50%, rgba(212,168,67,0.07) 0%, transparent 70%)' }} />

        {/* Gold top border glow */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent 0%, #d4a843 30%, #ffe89a 50%, #d4a843 70%, transparent 100%)' }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', padding: 'clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)' }}>

          {/* Top badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <div style={{ width: '36px', height: '1px', background: 'linear-gradient(90deg, transparent, #d4a843)' }} />
            <span style={{ fontSize: '0.58rem', letterSpacing: '0.32em', color: '#d4a843', textTransform: 'uppercase', fontFamily: 'var(--font-inter)', fontWeight: 700 }}>
              FLAGSHIP COURSE · SHRAVANA
            </span>
            <div style={{ width: '36px', height: '1px', background: 'linear-gradient(90deg, #d4a843, transparent)' }} />
          </div>

          {/* Two-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(2rem,6vw,6rem)', alignItems: 'center' }} className="course-highlight-grid">

            {/* LEFT — headline */}
            <div>
              <div style={{
                display: 'inline-block', padding: '0.4rem 1rem',
                border: '1px solid rgba(212,168,67,0.35)', borderRadius: '999px',
                background: 'rgba(212,168,67,0.08)', marginBottom: '1.5rem',
              }}>
                <span style={{ fontSize: '0.62rem', color: '#d4a843', letterSpacing: '0.15em', fontFamily: 'var(--font-inter)' }}>
                  📖 {hi ? 'निर्वाण सूत्र पाठ्यक्रम' : 'NIRVAN SUTRA COURSE'}
                </span>
              </div>

              <h2 style={{
                fontFamily: 'var(--font-cormorant)', fontWeight: hi ? 600 : 300,
                fontSize: 'clamp(2.8rem,5.5vw,5rem)', lineHeight: 1.05,
                color: 'var(--c-ivory)', marginBottom: '1.5rem',
                fontStyle: hi ? 'normal' : 'italic',
              }}>
                {hi ? 'आप कौन हैं?' : 'Who are you?'}
              </h2>

              <p style={{ color: 'rgba(245,237,216,0.6)', lineHeight: 1.95, fontSize: 'clamp(0.95rem,1.6vw,1.05rem)', marginBottom: '2.5rem', maxWidth: '480px', fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)' }}>
                {hi
                  ? 'निर्वाण सूत्र पाठ्यक्रम साधक को जागरूकता, आत्म-जांच, अद्वैत और सत्य के प्रत्यक्ष दर्शन की ओर ले जाता है। 8 अध्याय। 3 भाषाएं। एक यात्रा।'
                  : 'The Nirvan Sutra Course guides the seeker through awareness, self-inquiry, non-duality and direct seeing of truth. 8 Chapters. 3 Languages. One Journey.'}
              </p>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                {[
                  { num: '8', label: hi ? 'अध्याय' : 'Chapters' },
                  { num: '3', label: hi ? 'भाषाएं' : 'Languages' },
                  { num: '40%', label: hi ? 'उत्तीर्ण मानदंड' : 'Pass Criteria' },
                ].map((s) => (
                  <div key={s.num}>
                    <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2.8rem', fontWeight: 300, color: '#d4a843', lineHeight: 1 }}>{s.num}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(245,237,216,0.45)', letterSpacing: '0.08em', fontFamily: 'var(--font-inter)', marginTop: '0.25rem' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Link href="/course" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                padding: '1.1rem 2.5rem', borderRadius: '6px',
                background: 'linear-gradient(135deg, #d4a843 0%, #ffe89a 50%, #c49832 100%)',
                color: '#061008', textDecoration: 'none', fontWeight: 800,
                fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
                fontSize: '1rem', letterSpacing: '0.04em',
                boxShadow: '0 8px 40px rgba(212,168,67,0.35), 0 2px 12px rgba(212,168,67,0.2)',
                transition: 'all 0.3s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 60px rgba(212,168,67,0.5)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 40px rgba(212,168,67,0.35)'; }}
              >
                {hi ? 'पाठ्यक्रम शुरू करें' : 'Start the Course'} →
              </Link>
            </div>

            {/* RIGHT — chapter grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {[
                { n: '01', hi: 'स्वयं की खोज', en: 'The Discovery of Self' },
                { n: '02', hi: 'मन की परतें', en: 'Layers of the Mind' },
                { n: '03', hi: 'साक्षी बोध', en: 'Witness Awareness' },
                { n: '04', hi: 'अहंकार की जड़', en: 'The Root of Ego' },
                { n: '05', hi: 'माया का खेल', en: 'The Play of Maya' },
                { n: '06', hi: 'ध्यान का द्वार', en: 'Gateway of Meditation' },
                { n: '07', hi: 'मुक्ति की राह', en: 'Path of Liberation' },
                { n: '08', hi: 'निर्वाण सूत्र', en: 'Nirvan Sutra' },
              ].map((ch, i) => (
                <div key={ch.n} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '0.75rem 1rem', borderRadius: '8px',
                  border: '1px solid rgba(212,168,67,0.08)',
                  background: i === 7 ? 'rgba(212,168,67,0.08)' : 'rgba(6,16,8,0.5)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s',
                }}>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.58rem', color: 'rgba(212,168,67,0.5)', letterSpacing: '0.1em', minWidth: '20px' }}>{ch.n}</span>
                  <span style={{ flex: 1, fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)', fontSize: '0.88rem', color: i === 7 ? '#d4a843' : 'rgba(245,237,216,0.65)', fontWeight: i === 7 ? 600 : 400 }}>
                    {hi ? ch.hi : ch.en}
                  </span>
                  <span style={{ fontSize: '0.5rem', color: 'rgba(212,168,67,0.25)' }}>◈</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gold bottom border glow */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(212,168,67,0.4) 50%, transparent 100%)' }} />

        <style>{`.course-highlight-grid { } @media(max-width:768px){.course-highlight-grid{grid-template-columns:1fr !important;}}`}</style>
      </section>

      {/* ════════════════════════════════════════
          FINAL QUOTE — Full-bleed with image
      ════════════════════════════════════════ */}
      <section style={{ position: 'relative', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <Image
          src="/aadisatv/meditation-water.jpg"
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.35 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,15,10,0.72)' }} />
        <div style={{
          position: 'relative', zIndex: 2, textAlign: 'center',
          padding: 'clamp(4rem,8vw,8rem) clamp(1.5rem,5vw,5rem)',
          maxWidth: '800px', margin: '0 auto',
        }}>
          <div style={{ width: '48px', height: '1px', background: 'var(--c-gold)', margin: '0 auto 2rem', opacity: 0.5 }} />
          <p className={`font-serif ${hi ? 'font-hindi' : ''}`} style={{
            fontSize: 'clamp(1.4rem,3vw,2.4rem)',
            fontWeight: hi ? 500 : 300,
            color: 'var(--c-ivory)',
            lineHeight: hi ? 1.7 : 1.5,
            fontStyle: hi ? 'normal' : 'italic',
            marginBottom: '2.5rem',
          }}>
            &ldquo;{c.finalQuote}&rdquo;
          </p>
          <Link href="#contact" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.9rem 2.5rem', borderRadius: '4px',
            border: '1px solid rgba(212,168,67,0.4)',
            background: 'rgba(212,168,67,0.1)',
            color: 'var(--c-gold)', textDecoration: 'none',
            fontSize: '0.85rem', fontWeight: 600,
            letterSpacing: '0.06em', transition: 'all 0.3s ease',
            fontFamily: hi ? 'var(--font-hind)' : 'var(--font-inter)',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(212,168,67,0.2)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(212,168,67,0.1)'; }}
          >
            {c.finalCta} →
          </Link>
        </div>
      </section>

      <ContactSection lang={activeLang} />
    </div>
  );
}
