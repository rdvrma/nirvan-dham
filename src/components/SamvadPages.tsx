'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FormEvent, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Language } from '@/lib/i18n';
import { getSavedLanguage, saveLanguage } from '@/lib/i18n';

type SamvadMode = 'online' | 'bodhgaya';

const PAYPAL_URL = 'https://www.paypal.com/ncp/payment/7PSEDKULTWFVC';
const UPI_ID = 'montysahursp-2@okicici';
const LANG_KEY = 'nirvan-dham-language';

/* ── Colors aligned with site theme ── */
const GOLD = '#d4a843';
const GOLD_DIM = 'rgba(212,168,67,0.65)';
const GOLD_GLOW = 'rgba(212,168,67,0.12)';
const FOREST = 'rgba(26,92,53,0.18)';
const SURFACE = 'rgba(13,31,16,0.72)';
const BG = '#080f0a';

const copy = {
  hi: {
    back: '← संवाद चयन',
    home: 'निर्वाण धाम',
    phone: '+91 93343 25558',
    choose: {
      eyebrow: 'निर्वाण सूत्र',
      title: 'संवाद चयन',
      subtitle: 'आदिसत्व के साथ संवाद — जहाँ साधक अपने प्रश्न, मौन और खोज के साथ आते हैं।',
      onlineTitle: 'ऑनलाइन संवाद',
      onlineDesc: 'दूर रहते हुए भी सीधा संवाद। वीडियो कॉल के माध्यम से व्यक्तिगत मार्गदर्शन।',
      bodhgayaTitle: 'बोधगया संवाद',
      bodhgayaDesc: 'बोधगया की पवित्र भूमि पर प्रत्यक्ष मिलन, सत्संग और व्यक्तिगत मार्गदर्शन।',
      optionOne: 'विकल्प एक',
      optionTwo: 'विकल्प दो',
      free: 'निःशुल्क सेवा · दान स्वैच्छिक',
      quote: 'सही संवाद वही है जहाँ उत्तर से पहले मौन सुना जाता है।',
    },
    online: {
      tag: 'Online · Digital Samvad',
      title: 'ऑनलाइन संवाद',
      lead: 'जहाँ भी आप हैं, वहीं से आदिसत्व के साथ एक शांत, प्रत्यक्ष और व्यक्तिगत संवाद।',
      intro: 'आदिसत्व का परिचय',
      videoOne: 'आदिसत्व — उपस्थिति में संवाद',
      videoTwo: 'आदिसत्व — साधना और मार्ग',
      features: [
        ['🕯', 'व्यक्तिगत मार्गदर्शन', 'आपकी साधना, प्रश्न और आंतरिक यात्रा के अनुसार संवाद।'],
        ['🌐', 'ऑनलाइन सुविधा', 'दुनिया में कहीं से भी सुरक्षित वीडियो कॉल के माध्यम से जुड़ें।'],
        ['🙏', 'निःशुल्क सेवा', 'यह सेवा व्यापार नहीं है। दान पूरी तरह स्वैच्छिक है।'],
      ],
      formTitle: 'संवाद के लिए आवेदन',
      formSub: 'नीचे कुछ जानकारी भरें — आदिसत्व से संपर्क स्थापित होगा।',
      journeyPlaceholder: 'आपकी खोज क्या है? क्या प्रश्न आपको यहाँ तक लाया? जितना सच लगे, उतना लिखें।',
    },
    bodhgaya: {
      tag: 'Bodhgaya · Sacred Ground · Satsang',
      title: 'बोधगया संवाद',
      lead: 'बोधिवृक्ष की भूमि पर प्रत्यक्ष मिलन, मौन, सत्संग और गहरे आत्म-विचार का अवसर।',
      intro: 'आदिसत्व का परिचय',
      videoOne: 'आदिसत्व — उपस्थिति में संवाद',
      videoTwo: 'आदिसत्व — साधना और मार्ग',
      features: [
        ['🪷', 'पवित्र भूमि', 'बोधगया की ऊर्जा में शांत और केंद्रित संवाद।'],
        ['📍', 'प्रत्यक्ष मिलन', 'स्थान, समय और उपलब्धता के अनुसार व्यक्तिगत मार्गदर्शन।'],
        ['🙏', 'निःशुल्क सेवा', 'यह सेवा निःशुल्क है। दान स्वैच्छिक है।'],
      ],
      addressTitle: 'बोधगया में मिलन',
      address: 'स्थान और समय आवेदन के बाद साझा किया जाएगा। कृपया अपनी यात्रा योजना स्पष्ट लिखें।',
      formTitle: 'बोधगया संवाद के लिए आवेदन',
      formSub: 'नीचे कुछ जानकारी भरें — आदिसत्व से संपर्क होगा।',
      journeyPlaceholder: 'आप बोधगया क्यों आना चाहते हैं? आपकी खोज क्या है? जितना सच लगे, उतना लिखें।',
    },
    fields: {
      name: 'पूरा नाम', email: 'ईमेल', phone: 'फ़ोन / WhatsApp',
      country: 'देश / शहर', language: 'पसंदीदा भाषा', time: 'उचित समय',
      date: 'बोधगया आने की संभावित तिथि', days: 'कितने दिन रहेंगे?',
      source: 'यहाँ तक कैसे पहुँचे?', journey: 'अपनी आध्यात्मिक यात्रा के बारे में बताएं',
      select: 'चुनें', submit: 'आवेदन भेजें',
      successTitle: 'आवेदन प्राप्त हुआ',
      success: 'धन्यवाद। आपकी जानकारी सुरक्षित रूप से प्राप्त हो गई है। संपर्क शीघ्र किया जाएगा।',
      error: 'माफ़ करें, कोई समस्या हुई। कृपया पुनः प्रयास करें या सीधे लिखें: aadiguru@nirvandham.in',
    },
    dana: {
      title: 'दान — Dana',
      eyebrow: 'सेवा और सहयोग',
      intro: 'यह सेवा निःशुल्क है। यदि हृदय से उठे तो इस यात्रा में सहयोग करें।',
      pageEyebrow: 'सेवा और सहयोग',
      pageTitle: 'दान',
      pageLead: 'निर्वाण धाम की साधना, संवाद और डिजिटल सेवा को सहज बनाए रखने में आपका सहयोग मौन रूप से जुड़ता है।',
      homeCta: 'दान विवरण देखें',
      copied: '✓ कॉपी हो गया',
      paypal: 'PayPal से दान करें →',
      indiaTab: 'भारत',
      intlTab: 'International',
      quote: 'दान वह है जो बिना अपेक्षा के दिया जाए — ठीक वैसे जैसे सूर्य प्रकाश देता है।',
    },
  },
  en: {
    back: '← Samvad Choice',
    home: 'Nirvan Dham',
    phone: '+91 93343 25558',
    choose: {
      eyebrow: 'Nirvan Sutra',
      title: 'Choose Samvad',
      subtitle: 'A direct dialogue with Aadisatv for seekers bringing questions, silence, and sincerity.',
      onlineTitle: 'Online Samvad',
      onlineDesc: 'Direct personal guidance through a quiet video call, wherever you are.',
      bodhgayaTitle: 'Bodhgaya Samvad',
      bodhgayaDesc: 'Meet in the sacred field of Bodhgaya for satsang and personal guidance.',
      optionOne: 'Option One',
      optionTwo: 'Option Two',
      free: 'Free service · Dana is voluntary',
      quote: 'True dialogue begins by listening to the silence before the answer.',
    },
    online: {
      tag: 'Online · Digital Samvad',
      title: 'Online Samvad',
      lead: 'A quiet, direct, personal dialogue with Aadisatv from wherever you are.',
      intro: 'Aadisatv — Introduction',
      videoOne: 'Aadisatv — Dialogue in Presence',
      videoTwo: 'Aadisatv — Practice & the Path',
      features: [
        ['🕯', 'Personal Guidance', 'Dialogue shaped around your sadhana, questions, and inner journey.'],
        ['🌐', 'Online Access', 'Connect from anywhere through a secure video call.'],
        ['🙏', 'Free Service', 'This is service, not commerce. Dana is fully voluntary.'],
      ],
      formTitle: 'Apply for Samvad',
      formSub: 'Share a few details below — Aadisatv will reach out.',
      journeyPlaceholder: 'What is your search? What question brought you here? Write only what feels true.',
    },
    bodhgaya: {
      tag: 'Bodhgaya · Sacred Ground · Satsang',
      title: 'Bodhgaya Samvad',
      lead: 'A direct meeting in Bodhgaya for silence, satsang, and deep self-inquiry.',
      intro: 'Aadisatv — Introduction',
      videoOne: 'Aadisatv — Dialogue in Presence',
      videoTwo: 'Aadisatv — Practice & the Path',
      features: [
        ['🪷', 'Sacred Ground', 'A calm and focused dialogue in the energy of Bodhgaya.'],
        ['📍', 'In-Person Meeting', 'Personal guidance based on location, timing, and availability.'],
        ['🙏', 'Free Service', 'This service is free. Dana is voluntary.'],
      ],
      addressTitle: 'Meeting in Bodhgaya',
      address: 'Exact location and timing will be shared after application. Please write your travel plan clearly.',
      formTitle: 'Apply for Bodhgaya Samvad',
      formSub: 'Share a few details below — Aadisatv will be in touch.',
      journeyPlaceholder: 'Why do you want to come to Bodhgaya? What is your search? Write only what feels true.',
    },
    fields: {
      name: 'Full Name', email: 'Email', phone: 'Phone / WhatsApp',
      country: 'Country / City', language: 'Preferred Language', time: 'Suitable Time',
      date: 'Possible Bodhgaya Date', days: 'How many days?',
      source: 'How did you reach here?', journey: 'Tell us about your spiritual journey',
      select: 'Select', submit: 'Send Application',
      successTitle: 'Application Received',
      success: 'Thank you. Your details have been received safely. We will contact you soon.',
      error: 'Something went wrong. Please try again or write directly to aadiguru@nirvandham.in',
    },
    dana: {
      title: 'Dana — Offering',
      eyebrow: 'Seva & Support',
      intro: 'This service is free. If your heart moves you, please support this journey.',
      pageEyebrow: 'Seva & Support',
      pageTitle: 'Dana',
      pageLead: 'Your support helps keep Nirvan Dham, Samvad, and the digital ashram available with care and steadiness.',
      homeCta: 'View Donation Details',
      copied: '✓ Copied',
      paypal: 'Donate via PayPal →',
      indiaTab: 'India',
      intlTab: 'International',
      quote: 'Dana is that which is given without expectation — just as the sun gives light.',
    },
  },
} as const;

/* ══════════════════════════════════════════
   Language hook
══════════════════════════════════════════ */
function useSamvadLanguage() {
  const [lang, setLang] = useState<Language>(() => getSavedLanguage());

  useEffect(() => { saveLanguage(lang); }, [lang]);

  function selectLang(next: Language) {
    setLang(next);
    saveLanguage(next);
    if (typeof localStorage !== 'undefined') localStorage.setItem(LANG_KEY, next);
  }

  return { lang, selectLang };
}

/* ══════════════════════════════════════════
   Spinning Mandala SVG
══════════════════════════════════════════ */
function SpinningMandala({ size = 700, opacity = 0.07, speed = '120s', reverse = false }: {
  size?: number; opacity?: number; speed?: string; reverse?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    window.setTimeout(() => setMounted(true), 0);
  }, []);
  if (!mounted) return null;

  const c = size / 2;
  const rings = [0.46, 0.36, 0.27, 0.18, 0.10].map(f => Math.round(c * f));
  const spokes = Array.from({ length: 12 }, (_, i) => i * 30);

  return (
    <svg
      width={size} height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      style={{
        position: 'absolute', pointerEvents: 'none',
        opacity,
        animation: `spin${reverse ? 'Rev' : ''} ${speed} linear infinite`,
        color: GOLD,
      }}
    >
      <style>{`
        @keyframes spinRev { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      {rings.map((r, i) => (
        <circle key={r} cx={c} cy={c} r={r} stroke="currentColor"
          strokeWidth={i === 0 ? '1' : '0.5'} strokeDasharray={i % 2 === 0 ? undefined : '4 6'} />
      ))}
      {spokes.map(a => {
        const rad = a * Math.PI / 180;
        return (
          <line key={a}
            x1={c + rings[4] * Math.cos(rad)} y1={c + rings[4] * Math.sin(rad)}
            x2={c + rings[0] * Math.cos(rad)} y2={c + rings[0] * Math.sin(rad)}
            stroke="currentColor" strokeWidth="0.4" />
        );
      })}
      {/* Lotus petals outer ring */}
      {[0, 60, 120, 180, 240, 300].map(a => {
        const rad = a * Math.PI / 180;
        const px = c + rings[1] * Math.cos(rad);
        const py = c + rings[1] * Math.sin(rad);
        return <circle key={a} cx={px} cy={py} r={rings[3]} stroke="currentColor" strokeWidth="0.35" />;
      })}
      <circle cx={c} cy={c} r={5} fill="currentColor" opacity="0.5" />
    </svg>
  );
}

/* ══════════════════════════════════════════
   Shell — shared nav + background
══════════════════════════════════════════ */
function SamvadShell({
  lang, selectLang, backHref = '/samvad', backLabel, children, accentGlow,
}: {
  lang: Language; selectLang: (l: Language) => void;
  backHref?: string; backLabel?: string;
  children: ReactNode; accentGlow?: string;
}) {
  const c = copy[lang];
  const glow = accentGlow ?? 'rgba(26,92,53,0.35)';

  return (
    <div style={{ minHeight: '100vh', background: BG, color: 'var(--c-ivory)', overflowX: 'hidden', fontFamily: 'var(--font-hind)' }}>

      {/* ── Atmospheric background ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `
            radial-gradient(ellipse 80% 55% at 50% 0%, ${glow}, transparent 65%),
            radial-gradient(ellipse 50% 40% at 85% 90%, rgba(26,92,53,0.15), transparent 60%),
            radial-gradient(ellipse 45% 35% at 15% 75%, rgba(212,168,67,0.07), transparent 60%)
          `,
        }} />
        {/* Grid texture */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.12,
          backgroundImage: `linear-gradient(rgba(212,168,67,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,67,.025) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
        {/* Spinning mandala background */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
          <SpinningMandala size={900} opacity={0.05} speed="160s" />
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        height: '72px', padding: '0 clamp(1.25rem,4vw,3rem)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(212,168,67,0.1)',
        background: 'rgba(8,15,10,0.82)', backdropFilter: 'blur(20px)',
      }}>
        <Link href={backHref} style={{
          color: 'rgba(212,168,67,0.65)', textDecoration: 'none',
          fontSize: '0.82rem', letterSpacing: '0.08em',
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          transition: 'color 0.2s',
        }}>
          {backLabel ?? c.back}
        </Link>

        <Link href="/" style={{
          color: GOLD, textDecoration: 'none',
          fontFamily: 'var(--font-cormorant)', fontSize: '1.1rem',
          letterSpacing: '0.12em', fontWeight: 400,
        }}>
          {c.home}
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href={`tel:${c.phone.replace(/\s/g, '')}`} style={{
            color: 'rgba(212,168,67,0.5)', textDecoration: 'none',
            fontSize: '0.78rem', letterSpacing: '0.05em',
          }}>
            {c.phone}
          </a>

          {/* Lang toggle */}
          <div style={{
            display: 'flex', border: '1px solid rgba(212,168,67,0.22)',
            borderRadius: '999px', overflow: 'hidden',
            background: 'rgba(8,15,10,0.6)',
          }}>
            {(['hi', 'en'] as Language[]).map(item => (
              <button key={item} type="button" onClick={() => selectLang(item)} style={{
                border: 0, padding: '0.35rem 0.85rem', cursor: 'pointer',
                fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em',
                background: lang === item ? GOLD : 'transparent',
                color: lang === item ? BG : GOLD_DIM,
                transition: 'all 0.2s',
              }}>
                {item === 'hi' ? 'हिं' : 'EN'}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Page content ── */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>

    </div>
  );
}

/* ══════════════════════════════════════════
   SAMVAD CHOICE PAGE — /samvad
══════════════════════════════════════════ */
export function SamvadChoicePage() {
  const { lang, selectLang } = useSamvadLanguage();
  const c = copy[lang].choose;

  return (
    <SamvadShell lang={lang} selectLang={selectLang} backHref="/" backLabel={lang === 'hi' ? '← निर्वाण धाम' : '← Nirvan Dham'}>
      <main style={{
        minHeight: 'calc(100vh - 72px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(4rem,8vw,7rem) 1.5rem',
        textAlign: 'center',
      }}>
        {/* Om symbol */}
        <div style={{
          fontSize: 'clamp(2.5rem,5vw,4rem)', color: GOLD, marginBottom: '1.5rem',
          filter: `drop-shadow(0 0 32px rgba(212,168,67,0.4))`,
          animation: 'floatOm 6s ease-in-out infinite',
        }}>
          ☸
        </div>
        <style>{`@keyframes floatOm { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>

        <p style={{ fontSize: '0.65rem', letterSpacing: '0.28em', color: GOLD_DIM, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          {c.eyebrow}
        </p>
        <h1 style={{
          fontFamily: 'var(--font-cormorant)', fontWeight: 300,
          fontSize: 'clamp(3rem,9vw,6.5rem)', lineHeight: 0.95,
          color: 'var(--c-ivory)', margin: '0 0 1.25rem',
        }}>
          {c.title}
        </h1>
        <p style={{
          maxWidth: '600px', color: 'var(--c-ivdim)', lineHeight: 1.9,
          fontSize: 'clamp(1rem,2vw,1.15rem)', marginBottom: '3rem',
        }}>
          {c.subtitle}
        </p>

        {/* Gold divider */}
        <div style={{ width: '140px', height: '1px', background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)`, marginBottom: '3.5rem' }} />

        {/* Choice cards */}
        <div style={{
          width: 'min(900px, 100%)',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem', marginBottom: '4rem',
        }}>
          <ChoiceCard
            href="/samvad/online" icon="🖥" number={c.optionOne}
            title={c.onlineTitle} desc={c.onlineDesc} free={c.free}
            accent="rgba(103,232,249,0.7)" glow="rgba(103,232,249,0.08)"
          />
          <ChoiceCard
            href="/samvad/bodhgaya" icon="🪷" number={c.optionTwo}
            title={c.bodhgayaTitle} desc={c.bodhgayaDesc} free={c.free}
            accent="rgba(134,239,172,0.7)" glow="rgba(134,239,172,0.08)"
          />
        </div>

        <blockquote style={{
          fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.1rem,2vw,1.35rem)',
          fontStyle: 'italic', color: 'var(--c-ivdim)', opacity: 0.7,
          borderLeft: `2px solid ${GOLD_DIM}`, paddingLeft: '1.25rem', textAlign: 'left',
          maxWidth: '540px',
        }}>
          &ldquo;{c.quote}&rdquo;
        </blockquote>
      </main>
    </SamvadShell>
  );
}

function ChoiceCard({ href, icon, number, title, desc, free, accent, glow }: {
  href: string; icon: string; number: string; title: string;
  desc: string; free: string; accent: string; glow: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={href} style={{
      display: 'block', textAlign: 'left', textDecoration: 'none', color: 'inherit',
      padding: '2.5rem 2rem',
      border: `1px solid ${hovered ? accent : 'rgba(212,168,67,0.15)'}`,
      background: hovered ? `${glow}` : SURFACE,
      borderRadius: '12px', backdropFilter: 'blur(14px)',
      transition: 'all 0.35s ease',
      transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
      boxShadow: hovered ? `0 20px 60px rgba(0,0,0,0.35), 0 0 30px ${glow}` : 'none',
    }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontSize: '2.2rem', display: 'block', marginBottom: '1.2rem' }}>{icon}</span>
      <p style={{ fontSize: '0.62rem', letterSpacing: '0.2em', color: GOLD_DIM, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{number}</p>
      <h2 style={{
        fontFamily: 'var(--font-cormorant)', fontWeight: 400,
        fontSize: 'clamp(1.5rem,3vw,2rem)', color: 'var(--c-ivory)',
        marginBottom: '0.85rem',
      }}>{title}</h2>
      <p style={{ color: 'var(--c-ivdim)', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: '1.5rem' }}>{desc}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.65rem', color: GOLD_DIM, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{free}</span>
        <span style={{ fontSize: '1.5rem', color: GOLD, transition: 'transform 0.3s', transform: hovered ? 'translateX(6px)' : 'none' }}>→</span>
      </div>
    </Link>
  );
}

function VideoWithLoader({ src, caption, accent }: { src: string; caption: string; accent: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{
      borderRadius: '12px', overflow: 'hidden',
      border: `1px solid ${accent}25`,
      background: 'rgba(13,31,16,0.72)', backdropFilter: 'blur(12px)',
      boxShadow: `0 12px 40px rgba(0,0,0,0.3)`, position: 'relative'
    }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' }}>
        {!loaded && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: `3px solid ${accent}40`, borderTopColor: accent, borderRadius: '50%', animation: 'videoSpin 1s linear infinite' }} />
            <style>{`@keyframes videoSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
        <video controls playsInline preload="metadata" src={src} onCanPlay={() => setLoaded(true)}
          style={{ width: '100%', height: '100%', display: 'block', opacity: loaded ? 1 : 0, transition: 'opacity 0.5s ease' }} />
      </div>
      <div style={{ padding: '0.9rem 1.1rem', borderTop: `1px solid ${accent}15` }}>
        <p style={{ color: `${accent}80`, fontSize: '0.78rem', letterSpacing: '0.06em' }}>{caption}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   SAMVAD DETAIL PAGE — /samvad/online  &  /samvad/bodhgaya
   ══════════════════════════════════════════ */
export function SamvadDetailPage({ mode }: { mode: SamvadMode }) {
  const { lang, selectLang } = useSamvadLanguage();
  const c = copy[lang];
  const page = c[mode];
  const fields = c.fields;
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isOnline = mode === 'online';
  /* accent per mode */
  const accent = isOnline ? '#67e8f9' : '#86efac';
  const accentGlow = isOnline ? 'rgba(103,232,249,0.08)' : 'rgba(134,239,172,0.08)';
  const bgGlow = isOnline ? 'rgba(26,92,80,0.35)' : 'rgba(26,92,53,0.35)';
  const symbol = isOnline ? '🖥' : '🪷';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSubmitting(true);
    setError(false);
    setSubmitted(false);

    // Collect form fields into a plain object
    const fd = new FormData(form);
    const modeLabel = mode === 'online' ? 'Online Samvad' : 'Bodhgaya Samvad';
    const payload: Record<string, string> = {};
    fd.forEach((val, key) => { payload[key] = String(val); });

    // ── Source identification so mail clearly shows which page it came from ──
    payload['_subject']      = `[${modeLabel}] — Nirvan Dham`;
    payload['_source_page']  = modeLabel;
    payload['_source_url']   = typeof window !== 'undefined' ? window.location.href : `/samvad/${mode}`;
    payload['_submitted_at'] = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    payload['_language']     = lang;

    try {
      const res = await fetch('https://formspree.io/f/xqeogwza', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Formspree error: ${res.status}`);
      setSubmitted(true);
      form.reset();
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SamvadShell lang={lang} selectLang={selectLang} accentGlow={bgGlow}>
      <main style={{ maxWidth: '1040px', margin: '0 auto', padding: '0 clamp(1rem,4vw,2.5rem) 6rem' }}>

        {/* ── HERO ── */}
        <section style={{ textAlign: 'center', padding: 'clamp(4rem,8vw,7rem) 0 3rem', position: 'relative' }}>
          {/* Small spinning mandala behind hero */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 0 }}>
            <SpinningMandala size={500} opacity={0.06} speed="90s" reverse />
          </div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              fontSize: 'clamp(2.5rem,5vw,3.5rem)', marginBottom: '1.25rem',
              filter: `drop-shadow(0 0 32px ${accent}60)`,
            }}>{symbol}</div>

            <p style={{ fontSize: '0.62rem', letterSpacing: '0.28em', color: `${accent}99`, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              {page.tag}
            </p>
            <h1 style={{
              fontFamily: 'var(--font-cormorant)', fontWeight: 300,
              fontSize: 'clamp(3rem,9vw,6rem)', lineHeight: 0.95,
              color: 'var(--c-ivory)', margin: '0 0 1.25rem',
            }}>
              {page.title}
            </h1>
            <p style={{ maxWidth: '640px', margin: '0 auto 2.5rem', color: 'var(--c-ivdim)', lineHeight: 1.9, fontSize: 'clamp(1rem,2vw,1.15rem)' }}>
              {page.lead}
            </p>
            <div style={{ width: '120px', height: '1px', background: `linear-gradient(90deg, transparent, ${accent}80, transparent)`, margin: '0 auto' }} />
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}>
            {page.features.map((f) => (
              <div key={f[1]} style={{
                padding: '2rem 1.5rem', borderRadius: '12px',
                border: `1px solid ${accent}22`,
                background: `${accentGlow}`,
                backdropFilter: 'blur(12px)',
                textAlign: 'center',
                transition: 'border-color 0.3s',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{f[0]}</div>
                <h3 style={{ color: accent, fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>{f[1]}</h3>
                <p style={{ color: 'var(--c-ivdim)', fontSize: '0.88rem', lineHeight: 1.75 }}>{f[2]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── VIDEOS ── */}
        <section style={{ marginBottom: '4rem' }}>
          <p style={{ fontSize: '0.62rem', letterSpacing: '0.25em', color: `${accent}90`, textTransform: 'uppercase', marginBottom: '1.5rem', textAlign: 'center' }}>
            {page.intro}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {[
              { src: '/tatv/aadisatv_1.mp4', caption: page.videoOne },
              { src: '/tatv/aadisatv_2.mp4', caption: page.videoTwo },
            ].map(({ src, caption }) => (
              <VideoWithLoader key={src} src={src} caption={caption} accent={accent} />
            ))}
          </div>
        </section>

        {/* ── BODHGAYA ADDRESS ── */}
        {mode === 'bodhgaya' && (
          <section style={{ marginBottom: '3rem' }}>
            <div style={{
              display: 'flex', gap: '1.5rem', alignItems: 'flex-start',
              padding: '1.75rem 2rem', borderRadius: '12px',
              border: `1px solid ${accent}25`, background: SURFACE,
              backdropFilter: 'blur(12px)',
            }}>
              <div style={{ fontSize: '2.5rem', flexShrink: 0 }}>📍</div>
              <div>
                <h3 style={{ color: accent, fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  {copy[lang].bodhgaya.addressTitle}
                </h3>
                <p style={{ color: 'var(--c-ivdim)', lineHeight: 1.8, marginBottom: '0.75rem' }}>
                  {copy[lang].bodhgaya.address}
                </p>
                <a href="mailto:aadiguru@nirvandham.in" style={{ color: GOLD, textDecoration: 'none', fontSize: '0.9rem' }}>
                  aadiguru@nirvandham.in
                </a>
              </div>
            </div>
          </section>
        )}

        {/* ── APPLICATION FORM ── */}
        <section style={{
          padding: 'clamp(2rem,4vw,3rem)', borderRadius: '16px',
          border: `1px solid ${accent}20`,
          background: 'rgba(8,15,10,0.55)', backdropFilter: 'blur(16px)',
          marginBottom: '3rem',
          boxShadow: `0 24px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)`,
        }}>
          {submitted && (
            <div style={{
              padding: '1.75rem', textAlign: 'center', borderRadius: '10px',
              border: `1px solid ${accent}40`, background: `${accentGlow}`,
              marginBottom: '2rem',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🙏</div>
              <h3 style={{ color: 'var(--c-ivory)', fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                {fields.successTitle}
              </h3>
              <p style={{ color: 'var(--c-ivdim)', lineHeight: 1.7 }}>{fields.success}</p>
            </div>
          )}

          {error && (
            <div style={{
              padding: '1.25rem', textAlign: 'center', borderRadius: '8px',
              border: '1px solid rgba(255,120,100,0.3)', background: 'rgba(255,80,60,0.08)',
              marginBottom: '1.5rem', color: 'rgba(255,180,160,0.85)', lineHeight: 1.7,
            }}>
              {fields.error}
            </div>
          )}

          <p style={{ fontSize: '0.62rem', letterSpacing: '0.22em', color: `${accent}80`, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            {lang === 'hi' ? 'आवेदन' : 'Application'}
          </p>
          <h2 style={{
            fontFamily: 'var(--font-cormorant)', fontWeight: 300,
            fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: 'var(--c-ivory)',
            marginBottom: '0.5rem',
          }}>
            {page.formTitle}
          </h2>
          <p style={{ color: 'var(--c-ivdim)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            {page.formSub}
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <RichFormField label={fields.name} name="naam" required placeholder={lang === 'hi' ? 'आपका नाम' : 'Your name'} accent={accent} />
              <RichFormField label={fields.email} name="email" required type="email" placeholder="your@email.com" accent={accent} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <RichFormField label={fields.phone} name="phone" required type="tel" placeholder="+91 XXXXX XXXXX" accent={accent} />
              <RichFormField label={fields.country} name="desh" placeholder={lang === 'hi' ? 'आप कहाँ से हैं' : 'Where are you from'} accent={accent} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {mode === 'bodhgaya' ? (
                <RichFormField label={fields.date} name="tithi" required type="date" accent={accent} />
              ) : (
                <RichSelectField label={fields.language} name="bhasha" options={['हिंदी', 'English', 'Both']} placeholder={fields.select} accent={accent} />
              )}
              {mode === 'bodhgaya' ? (
                <RichSelectField label={fields.days} name="din" options={['1 day', '2-3 days', '4-7 days', 'More than a week']} placeholder={fields.select} accent={accent} />
              ) : (
                <RichSelectField label={fields.time} name="samay" options={['Morning', 'Afternoon', 'Evening', 'Flexible']} placeholder={fields.select} accent={accent} />
              )}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <RichSelectField label={fields.source} name="kaise" options={['YouTube', 'Website', 'Friend', 'Social Media', 'Other']} placeholder={fields.select} accent={accent} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block' }}>
                <span style={{ display: 'block', fontSize: '0.68rem', color: `${accent}80`, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 700 }}>
                  {fields.journey}
                </span>
                <textarea name="yatra" required placeholder={page.journeyPlaceholder} rows={5} style={{
                  width: '100%', boxSizing: 'border-box', padding: '0.85rem 1rem',
                  borderRadius: '8px', border: `1px solid ${accent}20`,
                  background: `${accent}06`, color: 'var(--c-ivory)',
                  fontSize: '0.92rem', outline: 'none', resize: 'vertical',
                  fontFamily: 'inherit', lineHeight: 1.8, minHeight: '130px',
                }} />
              </label>
            </div>
            <button type="submit" disabled={submitting} style={{
              width: '100%', padding: '1rem 1.5rem', borderRadius: '8px',
              border: `1px solid ${accent}50`,
              background: submitting ? `${accent}15` : `${accent}20`,
              color: accent, fontSize: '0.9rem', fontWeight: 700,
              letterSpacing: '0.08em', cursor: submitting ? 'default' : 'pointer',
              transition: 'all 0.3s ease',
            }}>
              {submitting ? '...' : fields.submit}
            </button>
          </form>
        </section>

        {/* ── DANA PANEL ── */}
        <section style={{ marginBottom: '3rem' }}>
          <DanaPanel lang={lang} accent={accent} accentGlow={accentGlow} />
        </section>

        {/* Footer */}
        <footer style={{ textAlign: 'center', padding: '1rem 0 2rem', opacity: 0.4 }}>
          <a href="mailto:aadiguru@nirvandham.in" style={{ color: GOLD, textDecoration: 'none', fontSize: '0.8rem', marginRight: '1rem' }}>
            aadiguru@nirvandham.in
          </a>
          <span style={{ color: 'var(--c-ivdim)', fontSize: '0.8rem' }}>·  </span>
          <Link href="/" style={{ color: GOLD, textDecoration: 'none', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
            nirvandham.in
          </Link>
        </footer>
      </main>
    </SamvadShell>
  );
}

/* ══════════════════════════════════════════
   DONATION PAGE — /donation
══════════════════════════════════════════ */
export function DonationPage() {
  const { lang, selectLang } = useSamvadLanguage();
  const c = copy[lang].dana;

  return (
    <SamvadShell lang={lang} selectLang={selectLang} backHref="/" backLabel={lang === 'hi' ? '← निर्वाण धाम' : '← Nirvan Dham'}
      accentGlow="rgba(212,168,67,0.2)">
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '0 clamp(1rem,4vw,2.5rem) 6rem' }}>

        {/* ── HERO ── */}
        <section style={{ textAlign: 'center', padding: 'clamp(4rem,8vw,7rem) 0 4rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-55%)', zIndex: 0 }}>
            <SpinningMandala size={600} opacity={0.07} speed="140s" />
          </div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              fontSize: 'clamp(3rem,6vw,4.5rem)', marginBottom: '1.5rem',
              filter: `drop-shadow(0 0 40px rgba(212,168,67,0.5))`,
              animation: 'floatOmD 7s ease-in-out infinite',
            }}>
              🙏
            </div>
            <style>{`@keyframes floatOmD { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-12px) scale(1.05); } }`}</style>

            <p style={{ fontSize: '0.62rem', letterSpacing: '0.28em', color: GOLD_DIM, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              {c.pageEyebrow}
            </p>
            <h1 style={{
              fontFamily: 'var(--font-cormorant)', fontWeight: 300,
              fontSize: 'clamp(3.5rem,10vw,7rem)', lineHeight: 0.9,
              color: 'var(--c-ivory)', margin: '0 0 1.25rem', letterSpacing: '-0.01em',
            }}>
              {c.pageTitle}
            </h1>
            <p style={{
              maxWidth: '580px', margin: '0 auto 2.5rem',
              color: 'var(--c-ivdim)', lineHeight: 1.9,
              fontSize: 'clamp(1rem,2vw,1.15rem)',
            }}>
              {c.pageLead}
            </p>
            <div style={{ width: '120px', height: '1px', background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)`, margin: '0 auto' }} />
          </div>
        </section>

        {/* ── DANA CARD ── */}
        <section style={{ marginBottom: '3rem' }}>
          <DanaPanel lang={lang} accent={GOLD} accentGlow={GOLD_GLOW} isFullPage />
        </section>

        {/* ── WHY DANA ── */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '1.25rem',
          }}>
            {[
              { icon: '🕯', title: lang === 'hi' ? 'निःशुल्क सेवा' : 'Free Service', desc: lang === 'hi' ? 'सभी संवाद, सत्संग और मार्गदर्शन निःशुल्क हैं।' : 'All samvad, satsang and guidance is free of charge.' },
              { icon: '🌿', title: lang === 'hi' ? 'आश्रम संचालन' : 'Ashram Upkeep', desc: lang === 'hi' ? 'आपका दान आश्रम की साधना और सेवा को जारी रखने में सहयोग करता है।' : 'Your dana supports the ongoing sadhana and service of the ashram.' },
              { icon: '📡', title: lang === 'hi' ? 'डिजिटल विस्तार' : 'Digital Reach', desc: lang === 'hi' ? 'निर्वाण सूत्र ऐप और वेबसाइट को जीवित रखने में सहयोग।' : 'Helps keep the Nirvan Sutra app and website alive and available.' },
            ].map(item => (
              <div key={item.title} style={{
                padding: '2rem 1.5rem', borderRadius: '12px', textAlign: 'center',
                border: `1px solid rgba(212,168,67,0.18)`,
                background: FOREST, backdropFilter: 'blur(12px)',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                <h3 style={{ color: GOLD, fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--c-ivdim)', fontSize: '0.88rem', lineHeight: 1.75 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── QUOTE ── */}
        <section style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <blockquote style={{
            fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.2rem,2.5vw,1.6rem)',
            fontStyle: 'italic', color: 'var(--c-ivdim)',
            borderTop: `1px solid rgba(212,168,67,0.15)`,
            borderBottom: `1px solid rgba(212,168,67,0.15)`,
            padding: '2rem 1.5rem', opacity: 0.75,
          }}>
            &ldquo;{c.quote}&rdquo;
          </blockquote>
        </section>

        {/* ── CONTACT NOTE ── */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ color: 'var(--c-ivdim)', fontSize: '0.88rem', lineHeight: 1.8, opacity: 0.6 }}>
            {lang === 'hi' ? 'किसी सहायता के लिए:' : 'For any questions:'}{' '}
            <a href="mailto:aadiguru@nirvandham.in" style={{ color: GOLD, textDecoration: 'none' }}>
              aadiguru@nirvandham.in
            </a>
          </p>
        </div>

      </main>
    </SamvadShell>
  );
}

/* ══════════════════════════════════════════
   DANA PANEL — shared between pages
══════════════════════════════════════════ */
function DanaPanel({ lang, accent, accentGlow, isFullPage = false }: {
  lang: Language; accent: string; accentGlow: string; isFullPage?: boolean;
}) {
  const c = copy[lang].dana;
  const [tab, setTab] = useState<'india' | 'intl'>('india');
  const [copied, setCopied] = useState(false);

  async function copyUpi() {
    await navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div style={{
      borderRadius: '16px',
      border: `1px solid ${accent}25`,
      background: 'rgba(8,15,10,0.55)', backdropFilter: 'blur(16px)',
      overflow: 'hidden',
      boxShadow: `0 24px 80px rgba(0,0,0,0.35), 0 0 40px ${accentGlow}`,
    }}>
      {/* Header */}
      <div style={{
        padding: 'clamp(1.5rem,3vw,2.5rem) clamp(1.5rem,3vw,2.5rem) 0',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-cormorant)', fontWeight: 300,
          fontSize: isFullPage ? 'clamp(2rem,4vw,3rem)' : 'clamp(1.6rem,3vw,2.2rem)',
          color: 'var(--c-ivory)', marginBottom: '0.5rem',
        }}>
          {c.title}
        </h2>
        <p style={{ color: 'var(--c-ivdim)', fontSize: '0.9rem', lineHeight: 1.75, maxWidth: '500px', margin: '0 auto 1.5rem' }}>
          {c.intro}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderTop: `1px solid ${accent}15`, borderBottom: `1px solid ${accent}15` }}>
        {[
          { id: 'india' as const, label: c.indiaTab, sub: 'UPI · QR', icon: '🇮🇳' },
          { id: 'intl' as const, label: c.intlTab, sub: 'PayPal · Card', icon: '🌍' },
        ].map(t => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} style={{
            flex: 1, border: 0, padding: '1rem',
            background: tab === t.id ? `${accent}12` : 'transparent',
            borderBottom: tab === t.id ? `2px solid ${accent}` : '2px solid transparent',
            color: tab === t.id ? accent : 'var(--c-ivdim)',
            cursor: 'pointer', transition: 'all 0.2s',
          }}>
            <span style={{ display: 'block', fontSize: '1.3rem', marginBottom: '0.2rem' }}>{t.icon}</span>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem' }}>{t.label}</span>
            <span style={{ display: 'block', fontSize: '0.7rem', opacity: 0.6, marginTop: '0.1rem' }}>{t.sub}</span>
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div style={{ padding: 'clamp(1.5rem,3vw,2.5rem)' }}>
        {tab === 'india' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 'min(220px,80%)', margin: '0 auto 1.25rem',
              padding: '0.5rem', background: '#f4f6fb',
              border: `1px solid ${accent}50`, borderRadius: '10px',
              boxShadow: `0 20px 50px rgba(0,0,0,0.35)`,
            }}>
              <Image src="/donation/upi-qr.jpg" alt="UPI QR code for Nirvan Dham" width={240} height={328}
                style={{ width: '100%', height: 'auto', borderRadius: '6px', display: 'block' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.2rem' }}>
              {['GPay', 'PhonePe', 'Paytm', 'BHIM', 'Any UPI'].map(tag => (
                <span key={tag} style={{
                  border: `1px solid ${accent}25`, borderRadius: '999px',
                  padding: '0.2rem 0.65rem', color: 'var(--c-ivdim)', fontSize: '0.72rem',
                }}>
                  {tag}
                </span>
              ))}
            </div>
            <button type="button" onClick={copyUpi} style={{
              border: `1px solid ${accent}30`, background: `${accent}08`,
              color: 'var(--c-ivory)', borderRadius: '8px', padding: '0.65rem 1.25rem',
              cursor: 'pointer', fontSize: '0.88rem', letterSpacing: '0.05em',
              transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <code style={{ color: accent }}>{UPI_ID}</code>
              <span style={{ color: GOLD_DIM }}>⎘</span>
            </button>
            {copied && (
              <p style={{ color: accent, fontSize: '0.78rem', marginTop: '0.5rem' }}>{c.copied}</p>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            {/* Professional PayPal Card */}
            <div style={{
              width: 'min(360px,100%)', margin: '0 auto 1.5rem',
              borderRadius: '16px', overflow: 'hidden',
              background: 'linear-gradient(145deg, #003087 0%, #0070ba 55%, #009cde 100%)',
              boxShadow: '0 24px 60px rgba(0,112,186,0.35), 0 4px 12px rgba(0,0,0,0.4)',
              position: 'relative',
            }}>
              {/* Decorative circles */}
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
              <div style={{ padding: '1.75rem 2rem', position: 'relative', zIndex: 1 }}>
                {/* PayPal SVG Logo */}
                <svg width="100" height="28" viewBox="0 0 100 28" fill="none" style={{ display: 'block', margin: '0 0 1rem' }}>
                  <text x="0" y="22" fill="white" fontSize="22" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="-0.5">PayPal</text>
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-start' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.88rem', fontWeight: 600 }}>Secure International Giving</span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                    {['🔒 SSL Encrypted', '🌍 Any Currency', '✓ Buyer Protected'].map(b => (
                      <span key={b} style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.65)', background: 'rgba(255,255,255,0.12)', borderRadius: '4px', padding: '0.15rem 0.5rem' }}>{b}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <a href={PAYPAL_URL} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.5rem',
              width: '100%', padding: '1rem', borderRadius: '10px',
              background: 'linear-gradient(135deg, #0070ba, #003087)',
              border: '1px solid rgba(0,156,222,0.4)',
              color: '#fff', fontWeight: 700, fontSize: '0.92rem',
              textDecoration: 'none', letterSpacing: '0.06em',
              boxShadow: '0 8px 24px rgba(0,112,186,0.3)',
              transition: 'all 0.3s',
            }}>
              <span>🔗</span> {c.paypal}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   FORM HELPERS
══════════════════════════════════════════ */
function RichFormField({ label, name, type = 'text', required = false, placeholder = '', accent }: {
  label: string; name: string; type?: string; required?: boolean; placeholder?: string; accent: string;
}) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: '0.68rem', color: `${accent}80`, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 700 }}>
        {label}{required && <b style={{ color: accent }}> *</b>}
      </span>
      <input name={name} type={type} required={required} placeholder={placeholder} style={{
        width: '100%', boxSizing: 'border-box', padding: '0.75rem 0.9rem',
        borderRadius: '8px', border: `1px solid ${accent}20`,
        background: `${accent}06`, color: 'var(--c-ivory)',
        fontSize: '0.92rem', outline: 'none', fontFamily: 'inherit',
        transition: 'border-color 0.2s',
      }} />
    </label>
  );
}

function RichSelectField({ label, name, options, placeholder, accent }: {
  label: string; name: string; options: string[]; placeholder: string; accent: string;
}) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: '0.68rem', color: `${accent}80`, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 700 }}>
        {label}
      </span>
      <select name={name} style={{
        width: '100%', boxSizing: 'border-box', padding: '0.75rem 0.9rem',
        borderRadius: '8px', border: `1px solid ${accent}20`,
        background: `${accent}06`, color: 'var(--c-ivory)',
        fontSize: '0.92rem', outline: 'none', fontFamily: 'inherit',
        appearance: 'none', cursor: 'pointer',
      }}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o} style={{ background: '#080f0a' }}>{o}</option>)}
      </select>
    </label>
  );
}
