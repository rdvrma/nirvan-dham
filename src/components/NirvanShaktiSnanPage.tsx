'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import EntryQuestionsForm from '@/components/EntryQuestionsForm';
import type { Language } from '@/lib/i18n';
import { getSavedLanguage, saveLanguage } from '@/lib/i18n';
import questionData from '@/content/programs/nirvan-shakti-snan-pravesh-prashn.json';
import styles from './NirvanShaktiSnanPage.module.css';

// ── Design tokens ────────────────────────────────────────────────
const GOLD        = '#d4a843';
const GOLD_DIM    = 'rgba(212,168,67,0.65)';
const GOLD_FAINT  = 'rgba(212,168,67,0.08)';
const ROSE        = '#c06080';
const ROSE_DIM    = 'rgba(192,96,128,0.65)';
const ROSE_FAINT  = 'rgba(192,96,128,0.08)';
const ROSE_GLOW   = 'rgba(192,96,128,0.18)';

// ── Bilingual Copy ───────────────────────────────────────────────
const T = {
  hi: {
    // Hero
    eyebrow:        'Nirvan Dham · देवी महामाया की साधना-यात्रा',
    h1a:            'निर्वाण शक्ति स्नान',
    h1b:            'साधना',
    heroSub:        'भीतर उठी वह अज्ञात हलचल — महामाया का मौन आमंत्रण है।',
    heroCopy:       'शक्ति स्नान कोई साधारण अभ्यास नहीं। यह स्वयं को खोलना है — मंत्र में, मौन में, उस अनंत उपस्थिति में जो सदा से भीतर प्रतीक्षा कर रही है। आदिसत्व दीक्षा से आरंभ, सामूहिक मंडल में यात्रा, और प्रत्येक शक्ति स्नान में देवी महामाया का नया स्पर्श।',
    ctaPrimary:     'प्रवेश प्रश्न भरें',
    ctaSecondary:   'कार्यक्रम की रूपरेखा देखें',
    badges:         ['निःशुल्क साधना', 'दैनिक 1 घंटा ध्यान', 'Aadisatv Deeksha', 'मासिक Shakti Snan', 'मंत्र साधना'],

    // Identity
    idEyebrow:      'दो धाराएँ · एक ही धाम',
    idTitle:        'गुरु का प्रकाश, देवी का स्पंदन',
    idLead:         'Nirvan Sutra गुरु की अभिव्यक्ति है। Nirvan Shakti Snan Sadhna देवी महामाया की अभिव्यक्ति है। दोनों विरोधी नहीं, साधक की आंतरिक यात्रा के दो पूरक आयाम हैं।',
    panel1Label:    'ज्ञान · साक्षी',
    panel1Title:    'Nirvan Sutra',
    panel1Sub:      'गुरु की अभिव्यक्ति',
    panel1Items:    ['ज्ञान', 'साक्षी', 'आत्मबोध', 'अद्वैत'],
    panel2Label:    'अनुभव · ऊर्जा',
    panel2Title:    'Nirvan Shakti Snan',
    panel2Sub:      'देवी महामाया की अभिव्यक्ति',
    panel2Items:    ['अनुभव', 'मंत्र', 'शक्ति स्नान', 'भक्ति और ऊर्जा'],

    // Audience
    audEyebrow:     'साधक की तैयारी',
    audTitle:       'यह साधना किनके लिए है?',
    audLead:        'यह आरंभिक परिचय नहीं, उन साधकों के लिए जीवंत अभ्यास है जो नियमितता के साथ भीतर उतरना चाहते हैं।',
    audItems: [
      'जिन्होंने पहले ध्यान या साधना की है।',
      'जिन्हें ऊर्जा, स्पंदन, प्रकाश, भाव अथवा मौन की आंतरिक खोज है।',
      'जो केवल सिद्धांत नहीं, जीवंत और नियमित साधना चाहते हैं।',
      'जो मंत्र, देवी-भाव और शक्ति स्नान के प्रति खुले हैं।',
      'जो प्रतिदिन निश्चित समय पर एक घंटे बैठने के लिए तैयार हैं।',
    ],

    // Daily Practice
    practiceEyebrow: 'एक समय · एक मंडल · एक घंटा',
    practiceTitle:   'दैनिक सामूहिक साधना',
    practiceLead:    'हर दिन निश्चित समय पर Nirvan Dham के गुरुजनों के सान्निध्य में वीडियो कॉल के माध्यम से एक घंटे का ध्यान किया जाएगा।',
    practiceMin:     'मिनट',
    practiceStep:    'चरण',
    practiceSteps: [
      ['05', 'मौन में प्रवेश',   'बाहरी गति से भीतर की स्थिरता की ओर'],
      ['10', 'मंत्र-जप',         'दीक्षा-मंत्र को श्वास और भाव से जोड़ना'],
      ['35', 'मुख्य ध्यान',      'मार्गदर्शित अथवा मौन सामूहिक साधना'],
      ['05', 'मौन अवलोकन',       'जो घटा उसे बिना निर्णय के देखना'],
      ['05', 'समापन',             'स्थिरता, संकल्प और सहज वापसी'],
    ],

    // Entry Flow
    entryEyebrow:   'पहले समझना, फिर आमंत्रण',
    entryTitle:     'प्रवेश की प्रक्रिया',
    entrySteps: [
      ['01', '9 प्रवेश प्रश्न',    'आपकी साधना-पृष्ठभूमि और वर्तमान स्थिति को समझना।'],
      ['02', 'अवलोकन',              'Nirvan Dham द्वारा उत्तरों का संवेदनशील अध्ययन।'],
      ['03', 'समूह में प्रवेश',     'उपयुक्त साधकों को निजी साधना-मंडल में जोड़ना।'],
      ['04', 'Aadisatv Deeksha',   'साधना-संकल्प और देवी महामाया की यात्रा में प्रवेश।'],
      ['05', 'मंत्र प्राप्ति',      'दीक्षा के समय निजी रूप से साधना-मंत्र दिया जाएगा।'],
      ['06', 'प्रथम Shakti Snan',  'मंत्र, मौन और उपस्थिति में प्रथम सामूहिक शक्ति स्नान।'],
      ['07', 'नियमित यात्रा',       'दैनिक ध्यान और प्रत्येक माह विशेष Shakti Snan।'],
    ],

    // Deeksha
    deekshaEyebrow: 'यात्रा का प्रथम द्वार',
    deekshaTitle:   'Aadisatv Deeksha',
    deekshaLead:    'यात्रा का आरंभ Aadisatv Deeksha से होगा। दीक्षा में साधक को साधना-संकल्प, मंत्र और देवी महामाया की साधना में प्रवेश दिया जाएगा।',
    mantraStrong:   'मंत्र गोपनीय रहेगा।',
    mantraCopy:     'मंत्र केवल दीक्षा के समय निजी रूप से दिया जाएगा; वेबसाइट पर उसे प्रदर्शित नहीं किया जाएगा।',

    // Bath
    bathEyebrow:    'मंत्र · मौन · समर्पण',
    bathTitle:      'Shakti Snan क्या है?',
    bathLead:       'Shakti Snan वह सामूहिक ध्यान-सत्र है जहाँ साधक मंत्र, मौन, संकल्प और Aadisatv की उपस्थिति में अपने भीतर देवी महामाया के स्पंदन के लिए स्वयं को खोलता है। इसे Shaktipat के एक ध्यानमय रूप में समझा जा सकता है, पर किसी निश्चित अनुभव की गारंटी के रूप में नहीं। कृपा अपने ढंग से घटती है।',
    baths: [
      ['01', 'बीज शक्ति स्नान'],
      ['02', 'प्राण शक्ति स्नान'],
      ['03', 'ज्योति शक्ति स्नान'],
      ['04', 'हृदय शक्ति स्नान'],
      ['05', 'लीला शक्ति स्नान'],
      ['06', 'पूर्णिमा शक्ति स्नान'],
    ],

    // Journey
    journeyEyebrow: 'छह मास · छह अंतर-द्वार',
    journeyTitle:   'साधना की यात्रा',
    journeyCenter:  'केंद्र',
    months: [
      ['माह 01', 'बीज जागरण',          'दीक्षा, मंत्र, प्रथम स्पर्श और साधना की भूमि'],
      ['माह 02', 'प्राण लहर साधना',    'शरीर, श्वास, ऊर्जा और सूक्ष्म स्पंदन'],
      ['माह 03', 'देवी दर्शन ध्यान',   'अंतर्ज्योति, प्रतीक, स्वप्न और भाव का सजग अवलोकन'],
      ['माह 04', 'रस और भाव साधना',    'हृदय, भक्ति, करुणा और समर्पण'],
      ['माह 05', 'महामाया लीला साधना', 'जीवन के संकेत, संबंध, इच्छा और कर्म-पैटर्न'],
      ['माह 06', 'अनुभव तृप्ति',       'अनुभवों की अनित्यता, मौन और साक्षी की देहरी'],
    ],

    // Form
    formEyebrow:    'आपकी वर्तमान साधना को समझने के लिए',
    formTitle:      'प्रवेश से पहले 9 प्रश्न',
    formLead:       'यह परीक्षा नहीं है। उत्तर सहज, स्पष्ट और सत्य रखें, ताकि आगे का मार्ग जिम्मेदारी से तय किया जा सके।',

    // Safety
    safetyEyebrow:  'साधना की परिपक्वता',
    safetyH2:       'अनुभव आएँ तो कृपा,\nन आएँ तो मौन भी कृपा।',
    safetyBody:     'यह साधना अनुभवों की खोज से आरंभ हो सकती है, पर अनुभवों की गुलामी पर समाप्त नहीं होती। अनुभव आएँ या न आएँ, साधक की सजगता ही मुख्य है।',
    safetyAside:    'यह कार्यक्रम चिकित्सा, मानसिक स्वास्थ्य उपचार या रोग-निवारण का विकल्प नहीं है। गंभीर मानसिक या शारीरिक समस्या में पहले योग्य विशेषज्ञ की सहायता लेना आवश्यक है।',
    safetyImportant:'महत्वपूर्ण:',

    // Final CTA
    finalEyebrow:   'Nirvan Dham · निःशुल्क साधना',
    finalH2:        'यदि भीतर अनुभवों की प्यास है,\nतो यह यात्रा आपके लिए हो सकती है।',
    finalBody:      'साधक स्वयं को खोलता है; कृपा अपने ढंग से घटती है।',
    finalCta:       'प्रवेश प्रश्न भरें',
  },
  en: {
    eyebrow:        'Nirvan Dham · A Journey into Devi Mahamaya',
    h1a:            'Nirvan Shakti Snan',
    h1b:            'Sadhna',
    heroSub:        'When something stirs within — that is the Devi calling',
    heroCopy:       "Shakti Snan is no ordinary practice. It is an opening — in mantra, in silence, in the infinite presence that has always been waiting within. Beginning with Aadisatv Deeksha, journeying through a sacred circle, and at each Shakti Snan — a new touch of Devi Mahamaya.",
    ctaPrimary:     'Fill Entry Questions',
    ctaSecondary:   'View Programme Outline',
    badges:         ['Free Sadhna', 'Daily 1 Hour', 'Aadisatv Deeksha', 'Monthly Shakti Snan', 'Mantra Sadhna'],

    idEyebrow:      'Two Streams · One Dhama',
    idTitle:        "The Guru's Light, The Devi's Vibration",
    idLead:         "Nirvan Sutra is the Guru's expression. Nirvan Shakti Snan Sadhna is Devi Mahamaya's expression. They are not opposites — they are two complementary dimensions of the seeker's inner journey.",
    panel1Label:    'Knowledge · Witness',
    panel1Title:    'Nirvan Sutra',
    panel1Sub:      "The Guru's Expression",
    panel1Items:    ['Knowledge', 'Witness', 'Self-Realization', 'Advaita'],
    panel2Label:    'Experience · Energy',
    panel2Title:    'Nirvan Shakti Snan',
    panel2Sub:      "The Expression of Devi Mahamaya",
    panel2Items:    ['Experience', 'Mantra', 'Shakti Snan', 'Devotion & Energy'],

    audEyebrow:     'Readiness of the Seeker',
    audTitle:       'Who is this Sadhna for?',
    audLead:        'This is not an introductory overview — it is a living practice for seekers who wish to descend inward with consistency.',
    audItems: [
      'Those who have practised meditation or sadhna before.',
      'Those with an inner seeking for energy, vibration, light, bhava, or silence.',
      'Those who want not just theory, but living, regular practice.',
      'Those who are open to mantra, Devi-bhava, and Shakti Snan.',
      'Those ready to sit for one hour at a fixed time every day.',
    ],

    practiceEyebrow: 'One Time · One Circle · One Hour',
    practiceTitle:   'Daily Group Sadhna',
    practiceLead:    "Every day at a fixed time, one hour of meditation will be conducted via video call in the presence of Nirvan Dham's guides.",
    practiceMin:     'min',
    practiceStep:    'Step',
    practiceSteps: [
      ['05', 'Entering Silence',     'Moving from outer motion to inner stillness'],
      ['10', 'Mantra Japa',          'Connecting the initiation mantra with breath and feeling'],
      ['35', 'Main Meditation',      'Guided or silent group sadhna'],
      ['05', 'Silent Observation',   'Witnessing what arose, without judgment'],
      ['05', 'Completion',           'Stability, resolve and a gentle return'],
    ],

    entryEyebrow:   'First Understand, Then Invitation',
    entryTitle:     'The Entry Process',
    entrySteps: [
      ['01', '9 Entry Questions',    'Understanding your sadhna background and present state.'],
      ['02', 'Observation',          'A sensitive study of your responses by Nirvan Dham.'],
      ['03', 'Entry into the Group', 'Suitable seekers are added to the private sadhna circle.'],
      ['04', 'Aadisatv Deeksha',    "Entry into the sadhna resolve and Devi Mahamaya's journey."],
      ['05', 'Receiving the Mantra', 'The sadhna mantra will be given personally at the time of Deeksha.'],
      ['06', 'First Shakti Snan',   'The first collective Shakti Snan in mantra, silence, and presence.'],
      ['07', 'Regular Journey',      'Daily meditation and a special Shakti Snan each month.'],
    ],

    deekshaEyebrow: 'The First Door of the Journey',
    deekshaTitle:   'Aadisatv Deeksha',
    deekshaLead:    'The journey begins with Aadisatv Deeksha. In the Deeksha, the seeker receives the sadhna resolve, the mantra, and entry into the journey of Devi Mahamaya.',
    mantraStrong:   'The mantra shall remain confidential.',
    mantraCopy:     'The mantra will be given personally only at the time of Deeksha; it will not be displayed on the website.',

    bathEyebrow:    'Mantra · Silence · Surrender',
    bathTitle:      'What is Shakti Snan?',
    bathLead:       "Shakti Snan is the collective meditation session in which the seeker opens themselves — through mantra, silence, resolve and Aadisatv's presence — to the vibration of Devi Mahamaya within. It can be understood as a meditative form of Shaktipat, but not as a guarantee of any particular experience. Grace descends in its own way.",
    baths: [
      ['01', 'Beej Shakti Snan'],
      ['02', 'Prana Shakti Snan'],
      ['03', 'Jyoti Shakti Snan'],
      ['04', 'Hriday Shakti Snan'],
      ['05', 'Leela Shakti Snan'],
      ['06', 'Purnima Shakti Snan'],
    ],

    journeyEyebrow: 'Six Months · Six Inner Doors',
    journeyTitle:   'The Sadhna Journey',
    journeyCenter:  'Focus',
    months: [
      ['Month 01', 'Seed Awakening',        'Deeksha, mantra, first touch and the ground of sadhna'],
      ['Month 02', 'Prana Wave Sadhna',     'Body, breath, energy and subtle vibration'],
      ['Month 03', 'Devi Darshan Dhyan',    'Inner light, symbols, dreams, and bhava — alert observation'],
      ['Month 04', 'Rasa & Bhava Sadhna',   'Heart, devotion, compassion and surrender'],
      ['Month 05', 'Mahamaya Leela Sadhna', 'Signals in life, relationships, desire, and karma patterns'],
      ['Month 06', 'Experience Fulfilment', 'The impermanence of experiences, silence and the threshold of the witness'],
    ],

    formEyebrow:    'To understand your current sadhna',
    formTitle:      '9 Questions Before Entry',
    formLead:       'This is not a test. Keep your answers natural, clear and true, so that the path ahead can be set with responsibility.',

    safetyEyebrow:  'Maturity of Sadhna',
    safetyH2:       'If experiences come — grace.\nIf silence comes — that too is grace.',
    safetyBody:     "This sadhna may begin with the search for experiences, but it does not end in their slavery. Whether experiences come or not, the seeker's alertness is primary.",
    safetyAside:    'This programme is not a substitute for medical, mental health, or therapeutic treatment. In cases of serious mental or physical difficulty, seeking qualified professional help first is essential.',
    safetyImportant:'Important:',

    finalEyebrow:   'Nirvan Dham · Free Sadhna',
    finalH2:        'If there is a thirst for experiences within,\nthis journey may be for you.',
    finalBody:      "The seeker opens themselves; grace descends in its own way.",
    finalCta:       'Fill Entry Questions',
  },
} as const;

// ── Mandala SVG ─────────────────────────────────────────────────
function MandalaMark() {
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden>
      <circle cx="100" cy="100" r="88" />
      <circle cx="100" cy="100" r="58" />
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse key={i} cx="100" cy="52" rx="18" ry="46" transform={`rotate(${i * 30} 100 100)`} />
      ))}
      <circle cx="100" cy="100" r="8" />
      <circle cx="100" cy="100" r="2" className={styles.binduFill} />
    </svg>
  );
}

// ── Section heading ──────────────────────────────────────────────
function SH({ eyebrow, title, align = 'center' }: { eyebrow: string; title: string; align?: 'left' | 'center' }) {
  return (
    <header className={`${styles.sectionHeading} ${align === 'left' ? styles.alignLeft : ''}`}>
      <p>{eyebrow}</p>
      <h2>{title}</h2>
      <span />
    </header>
  );
}

// ════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════════════
export default function NirvanShaktiSnanPage() {
  const [lang, setLang]   = useState<Language>('hi');
  const [mounted, setMounted] = useState(false);
  const formRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setLang(getSavedLanguage());
    setMounted(true);
  }, []);

  function handleLangChange(l: Language) { saveLanguage(l); setLang(l); }

  const activeLang = mounted ? lang : 'hi';
  const isHi = activeLang === 'hi';
  const c = T[isHi ? 'hi' : 'en'];

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <main className={styles.page} lang={activeLang}>
      <Header lang={activeLang} onLangChange={handleLangChange} />

      {/* ═══════════════════════════════════
          HERO
      ═══════════════════════════════════ */}
      <section className={styles.hero}>
        <Image
          src="/programs/nirvan-shakti-snan/mahamaya-hero.png"
          alt={isHi ? 'देवी महामाया की ध्यानमय उपस्थिति' : 'The meditative presence of Devi Mahamaya'}
          fill priority sizes="100vw" quality={85}
          className={styles.heroImage}
          fetchPriority="high"
        />
        <div className={styles.heroVeil} />
        <div className={styles.heroGeometry} aria-hidden><MandalaMark /></div>

        <div className={`${styles.container} ${styles.heroInner}`}>
          <p className={styles.eyebrow}>{c.eyebrow}</p>
          <h1>
            {c.h1a} <span style={{ color: GOLD }}>{c.h1b}</span>
          </h1>
          <p className={styles.heroSubtitle}>{c.heroSub}</p>
          <p className={styles.heroCopy}>{c.heroCopy}</p>

          <div className={styles.heroActions}>
            <button onClick={scrollToForm} className={styles.primaryButton}>
              {c.ctaPrimary} <span aria-hidden>→</span>
            </button>
            <a
              className={styles.secondaryButton}
              href="/programs/nirvan-shakti-snan/Nirvan_Shakti_Snan_Sadhna_Rooprekha.pdf"
              target="_blank" rel="noreferrer"
            >
              {c.ctaSecondary}
            </a>
          </div>

          {/* Badges */}
          <div className={styles.badges} aria-label={isHi ? 'कार्यक्रम की विशेषताएँ' : 'Programme highlights'}>
            {c.badges.map((b) => <span key={b}>{b}</span>)}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          IDENTITY — Two Streams
      ═══════════════════════════════════ */}
      <section className={styles.identitySection}>
        {/* Background mandala */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 'min(500px,70vw)', height: 'min(500px,70vw)', opacity: 0.055 }}>
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
              <circle cx="100" cy="100" r="98" stroke={GOLD} strokeWidth="0.4" />
              <polygon points="100,15 178,155 22,155" stroke={GOLD} strokeWidth="0.5" fill="none" />
              <polygon points="100,185 22,45 178,45" stroke={GOLD} strokeWidth="0.5" fill="none" />
              <circle cx="100" cy="100" r="4" stroke={GOLD} strokeWidth="0.8" fill="none" />
              <circle cx="100" cy="100" r="1.5" fill={GOLD} opacity="0.8" />
            </svg>
          </div>
        </div>

        <div className={styles.container}>
          <SH eyebrow={c.idEyebrow} title={c.idTitle} />
          <p className={styles.centerLead} style={{ marginBottom: '3.5rem' }}>{c.idLead}</p>

          {/* Comparison panels */}
          <div className={styles.comparison}>
            {/* Panel 1 — Guru */}
            <article className={styles.comparisonPanel}>
              <p className={styles.panelNumber}>{c.panel1Label}</p>
              <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(2rem,4vw,3.4rem)', lineHeight: 1, marginBottom: '0.3rem', color: 'var(--c-ivory)' }}>{c.panel1Title}</h3>
              <p style={{ color: 'var(--c-ivdim)', fontFamily: 'var(--font-hind)', marginBottom: '1.5rem' }}>{c.panel1Sub}</p>
              <ul style={{ listStyle: 'none', display: 'grid', gap: '0.8rem' }}>
                {c.panel1Items.map((item) => (
                  <li key={item} style={{ paddingBottom: '0.7rem', borderBottom: `1px solid ${GOLD}18`, color: 'rgba(245,237,216,0.82)', fontFamily: 'var(--font-hind)' }}>{item}</li>
                ))}
              </ul>
            </article>

            {/* Bindu divider */}
            <div className={styles.comparisonBindu} aria-hidden>
              <span style={{ width: '12px', height: '12px', transform: 'rotate(45deg)', background: GOLD, boxShadow: `0 0 28px rgba(212,168,67,0.55)`, display: 'block' }} />
            </div>

            {/* Panel 2 — Devi/Shakti */}
            <article className={styles.comparisonPanel} style={{
              background: 'rgba(29,18,16,0.5)',
              border: `1px solid rgba(192,96,128,0.28)`,
              boxShadow: `0 8px 40px ${ROSE_GLOW}`,
            }}>
              <p className={styles.panelNumber} style={{ color: ROSE_DIM }}>{c.panel2Label}</p>
              <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(2rem,4vw,3.4rem)', lineHeight: 1, marginBottom: '0.3rem', color: 'var(--c-ivory)' }}>{c.panel2Title}</h3>
              <p style={{ color: 'var(--c-ivdim)', fontFamily: 'var(--font-hind)', marginBottom: '1.5rem' }}>{c.panel2Sub}</p>
              <ul style={{ listStyle: 'none', display: 'grid', gap: '0.8rem' }}>
                {c.panel2Items.map((item) => (
                  <li key={item} style={{ paddingBottom: '0.7rem', borderBottom: `1px solid ${ROSE}22`, color: 'rgba(245,237,216,0.82)', fontFamily: 'var(--font-hind)' }}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          AUDIENCE
      ═══════════════════════════════════ */}
      <section className={styles.audienceSection}>
        <div className={`${styles.container} ${styles.splitBand}`}>
          <div>
            <SH eyebrow={c.audEyebrow} title={c.audTitle} align="left" />
            <p className={styles.lead}>{c.audLead}</p>
          </div>
          <div className={styles.criteriaList}>
            {c.audItems.map((item, i) => (
              <p key={item}>
                <span style={{ color: GOLD, fontFamily: 'var(--font-cormorant)', fontSize: '1.35rem' }}>{String(i + 1).padStart(2, '0')}</span>
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          DAILY PRACTICE TIMELINE
      ═══════════════════════════════════ */}
      <section className={styles.practiceSection} id="rooprekha">
        <div className={styles.container}>
          <SH eyebrow={c.practiceEyebrow} title={c.practiceTitle} />
          <p className={styles.centerLead} style={{ marginBottom: '3.5rem' }}>{c.practiceLead}</p>

          <div className={styles.practiceTimeline}>
            {c.practiceSteps.map(([mins, title, desc], i) => (
              <article key={i}>
                <div className={styles.minuteMark}>
                  <strong>{mins}</strong>
                  <span>{c.practiceMin}</span>
                </div>
                <div>
                  <p className={styles.stepLabel}>{c.practiceStep} {i + 1}</p>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          ENTRY FLOW
      ═══════════════════════════════════ */}
      <section className={styles.entrySection}>
        {/* Subtle sacred geometry bg */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 'min(600px,80vw)', height: 'min(600px,80vw)', opacity: 0.05, animation: 'sacredSpin 60s linear infinite' }}>
            <svg viewBox="0 0 200 200" fill="none" style={{ width: '100%', height: '100%' }}>
              <circle cx="100" cy="100" r="95" stroke={ROSE} strokeWidth="0.5" />
              <circle cx="100" cy="100" r="70" stroke={ROSE} strokeWidth="0.5" />
              <circle cx="100" cy="100" r="20" stroke={ROSE} strokeWidth="0.5" />
            </svg>
          </div>
        </div>

        <div className={styles.container}>
          <SH eyebrow={c.entryEyebrow} title={c.entryTitle} />
          <div className={styles.entryTimeline}>
            {c.entrySteps.map(([num, title, desc]) => (
              <article key={num}>
                <span style={{
                  width: '68px', height: '48px', display: 'grid', placeItems: 'center',
                  border: `1px solid ${ROSE}40`, borderRadius: '999px', color: ROSE,
                  background: 'rgba(10,24,14,0.9)', fontFamily: 'var(--font-inter)',
                  fontWeight: 600, fontSize: '0.72rem',
                }}>{num}</span>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-hind)', fontWeight: 500, fontSize: '1.35rem', lineHeight: 1.3 }}>{title}</h3>
                  <p style={{ marginTop: '0.35rem', color: 'var(--c-ivdim)', fontFamily: 'var(--font-hind)', fontSize: '0.95rem', lineHeight: 1.7 }}>{desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          DEEKSHA
      ═══════════════════════════════════ */}
      <section className={styles.deekshaSection}>
        <div className={`${styles.container} ${styles.deekshaLayout}`}>
          <div className={styles.deekshaSymbol} aria-hidden><MandalaMark /></div>
          <div>
            <SH eyebrow={c.deekshaEyebrow} title={c.deekshaTitle} align="left" />
            <p className={styles.lead}>{c.deekshaLead}</p>
            <div className={styles.mantraNote} style={{ borderLeftColor: ROSE, background: ROSE_FAINT }}>
              <strong style={{ color: '#e5b398', fontFamily: 'var(--font-hind)' }}>{c.mantraStrong}</strong>
              <p style={{ marginTop: '0.4rem', color: 'var(--c-ivdim)', fontFamily: 'var(--font-hind)', fontSize: '0.95rem', lineHeight: 1.7 }}>{c.mantraCopy}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          SHAKTI SNAN — What is it?
      ═══════════════════════════════════ */}
      <section className={styles.bathSection}>
        <div className={styles.container}>
          <SH eyebrow={c.bathEyebrow} title={c.bathTitle} />
          <p className={styles.centerLead} style={{ marginBottom: '3.5rem' }}>{c.bathLead}</p>

          <div className={styles.bathGrid}>
            {c.baths.map(([num, title]) => (
              <article key={num} style={{
                borderRadius: '12px',
                border: `1px solid ${ROSE}28`,
                background: `linear-gradient(135deg, rgba(29,18,16,0.65) 0%, rgba(13,31,17,0.5) 100%)`,
                backdropFilter: 'blur(12px)',
                padding: '1.5rem',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                minHeight: '150px',
                transition: 'all 0.3s',
                boxShadow: `0 4px 24px ${ROSE_FAINT}`,
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${ROSE}55`; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px ${ROSE_GLOW}`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${ROSE}28`; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 24px ${ROSE_FAINT}`; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                <span style={{ color: ROSE, fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem', fontWeight: 500 }}>{num}</span>
                <h3 style={{ fontFamily: 'var(--font-hind)', fontWeight: 500, fontSize: '1.2rem', lineHeight: 1.4, color: 'var(--c-ivory)' }}>{title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          JOURNEY — 6 Months
      ═══════════════════════════════════ */}
      <section className={styles.journeySection}>
        <div className={styles.container}>
          <SH eyebrow={c.journeyEyebrow} title={c.journeyTitle} />

          <div className={styles.journeyGrid} style={{ marginTop: '3.5rem' }}>
            {c.months.map(([month, title, focus], i) => (
              <article key={i} style={{
                background: `linear-gradient(145deg, rgba(11,23,16,0.95) 0%, rgba(15,10,10,0.5) 100%)`,
                borderRight: i % 3 < 2 ? `1px solid ${GOLD}15` : undefined,
                borderBottom: i < 3 ? `1px solid ${GOLD}15` : undefined,
                padding: '1.8rem',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Rose accent corner for Shakti months */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: `linear-gradient(to bottom, ${ROSE}60, transparent)` }} />

                <p style={{ color: ROSE_DIM, fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase' }}>{month}</p>
                <h3 style={{ minHeight: '64px', marginTop: '1.2rem', fontFamily: 'var(--font-hind)', fontWeight: 500, fontSize: '1.5rem', lineHeight: 1.3, color: 'var(--c-ivory)' }}>{title}</h3>
                <span style={{ display: 'block', marginTop: '2rem', color: GOLD_DIM, fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase' }}>{c.journeyCenter}</span>
                <div style={{ marginTop: '0.5rem', color: 'var(--c-ivdim)', fontFamily: 'var(--font-hind)', fontSize: '0.95rem', lineHeight: 1.7 }}>{focus}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          ENTRY FORM
      ═══════════════════════════════════ */}
      <section className={styles.formSection} id="pravesh-prashn" ref={formRef as React.RefObject<HTMLElement>}>
        {/* Sacred mandala background */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '300px', height: '300px', borderRadius: '50%', background: `radial-gradient(circle, ${ROSE_FAINT} 0%, transparent 70%)`, animation: 'breathe 5s ease-in-out infinite' }} />
          </div>
          {[700, 560, 420].map((size, i) => (
            <div key={size} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: `min(${size}px, ${size / 8}vw + ${size * 0.35}px)`, height: `min(${size}px, ${size / 8}vw + ${size * 0.35}px)`, borderRadius: '50%', border: `1px solid ${ROSE}${i % 2 ? '09' : '06'}`, animation: `${i % 2 ? 'sacredSpinRev' : 'sacredSpin'} ${30 + i * 15}s linear infinite` }} />
            </div>
          ))}
        </div>

        <div className={styles.container}>
          <SH eyebrow={c.formEyebrow} title={c.formTitle} />
          <p className={styles.centerLead} style={{ marginBottom: '3.5rem' }}>{c.formLead}</p>
          <EntryQuestionsForm questions={questionData.questions} />
        </div>
      </section>

      {/* ═══════════════════════════════════
          SAFETY NOTE
      ═══════════════════════════════════ */}
      <section className={styles.safetySection}>
        <div className={`${styles.container} ${styles.safetyLayout}`}>
          <div>
            <p className={styles.eyebrow}>{c.safetyEyebrow}</p>
            <h2 style={{ marginTop: '0.7rem', fontFamily: 'var(--font-hind)', fontWeight: 500, fontSize: 'clamp(2.2rem,4.8vw,4rem)', lineHeight: 1.12, whiteSpace: 'pre-line' }}>
              {c.safetyH2}
            </h2>
          </div>
          <div>
            <p style={{ color: 'rgba(245,237,216,0.76)', fontFamily: 'var(--font-hind)', fontSize: '1.02rem', lineHeight: 1.85 }}>{c.safetyBody}</p>
            <aside style={{ marginTop: '1.5rem', padding: '1.25rem', border: `1px solid ${ROSE}24`, borderRadius: '6px', color: 'rgba(245,237,216,0.58)', fontFamily: 'var(--font-hind)', fontSize: '0.88rem', lineHeight: 1.75 }}>
              <strong style={{ color: '#d7a288' }}>{c.safetyImportant}</strong> {c.safetyAside}
            </aside>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════ */}
      <section className={styles.finalCta} style={{ position: 'relative', isolation: 'isolate' }}>
        {/* Rose radial glow */}
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${ROSE_GLOW}, transparent 70%)`, pointerEvents: 'none', zIndex: -1 }} />
        {/* Gold shimmer top */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent, ${ROSE}60, ${GOLD}40, ${ROSE}60, transparent)` }} />

        <div className={styles.container} style={{ textAlign: 'center' }}>
          <p className={styles.eyebrow}>{c.finalEyebrow}</p>
          <h2 style={{ maxWidth: '900px', margin: '0.8rem auto 0', fontFamily: 'var(--font-hind)', fontWeight: 500, fontSize: 'clamp(2.5rem,5.5vw,5rem)', lineHeight: 1.08, whiteSpace: 'pre-line' }}>
            {c.finalH2}
          </h2>
          <p style={{ margin: '1.2rem 0 2.5rem', color: 'var(--c-ivdim)', fontFamily: 'var(--font-hind)', fontSize: '1.05rem', lineHeight: 1.7 }}>{c.finalBody}</p>

          <button onClick={scrollToForm} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
            padding: '1rem 2.5rem', borderRadius: '8px',
            background: `linear-gradient(135deg, ${ROSE} 0%, #d4708a 50%, #b85070 100%)`,
            color: '#fff', fontFamily: 'var(--font-hind)', fontWeight: 700,
            fontSize: '1rem', border: 'none', cursor: 'pointer', letterSpacing: '0.03em',
            boxShadow: `0 12px 48px rgba(192,96,128,0.38)`,
            transition: 'all 0.3s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 64px rgba(192,96,128,0.52)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 48px rgba(192,96,128,0.38)'; }}>
            🌸 {c.finalCta} <span aria-hidden>↑</span>
          </button>
        </div>
      </section>
    </main>
  );
}
