'use client';

import { useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import { getSavedLanguage, saveLanguage, type Language } from '@/lib/i18n';
import './nirvan-sutra-course.css';

const movements = [
  { range: '01—04', hi: 'खोज की तैयारी', en: 'Preparing the inquiry', hiNote: 'अज्ञान · जिज्ञासा · विवेक · वैराग्य', enNote: 'Ignorance · inquiry · discernment · dispassion' },
  { range: '05—09', hi: 'समझ और आत्मपरीक्षण', en: 'Listening and looking within', hiNote: 'श्रवण · मनन · निदिध्यासन · नेति-नेति · साक्षीभाव', enNote: 'Listening · reflection · contemplation · neti-neti · witnessing' },
  { range: '10—14', hi: 'अनुभव से अनुभवकर्ता की ओर', en: 'From experience to the experiencer', hiNote: 'अनुभव · अनुभवकर्ता · आत्मविचार · आत्मज्ञान · ब्रह्मज्ञान', enNote: 'Experience · experiencer · self-inquiry · self-knowledge · Brahman' },
  { range: '15—17', hi: 'मौन से सहज जीवन', en: 'From silence to natural living', hiNote: 'अज्ञेयता · शून्यता / मौन · सहज अवस्था', enNote: 'The unknowable · silence · natural living' },
];

const copy = {
  hi: {
    skip: 'मुख्य सामग्री पर जाएँ',
    eyebrow: 'निर्वाण धाम प्रस्तुत करता है · निर्वाण सूत्र',
    title: <>जानकारी से आगे।<br /><em>सीधे देखने की ओर।</em></>,
    lead: '17 चरणों की एक शांत, क्रमिक यात्रा—जो “मैं कौन हूँ?” को केवल एक विचार नहीं रहने देती। आदिसत्व की फ़िल्मों, गहन प्रश्नों और अपने अनुभव की जाँच के साथ चलें।',
    join: 'अपनी यात्रा शुरू करें',
    explore: 'यात्रा का मानचित्र देखें',
    resume: 'पहले से जुड़े हैं? यात्रा जारी रखें',
    statLabels: ['क्रमिक चरण', 'मुख्य फ़िल्में', 'गहन प्रश्न', 'भाषाएँ'],
    promise: 'अपनी भाषा में सुनें · अपनी गति से बढ़ें · अगली बार वहीं से शुरू करें',
    introKicker: '01 / यात्रा का स्वरूप',
    introTitle: 'सुनना आरंभ है। देखना यात्रा है।',
    introBody: 'हर चरण एक मुख्य फ़िल्म से खुलता है। फिर दस प्रश्न उस समझ को अपने जीवन के पास ले आते हैं। सार, छोटे अभ्यास, जाँच और अपने शब्दों में उत्तर—ताकि सीखी हुई बात अनुभव की कसौटी पर उतरे।',
    steps: [
      { n: '01', title: 'फ़िल्म देखें', body: 'हर चरण की मूल शिक्षा को पहले ध्यान से सुनें और देखें।' },
      { n: '02', title: 'प्रश्नों में उतरें', body: 'उसी विषय के दस प्रश्नों से अपनी धारणाओं को जाँचें।' },
      { n: '03', title: 'अपने शब्द लिखें', body: 'सार, अवलोकन और जाँच के बाद जो साफ़ हुआ उसे व्यक्त करें।' },
      { n: '04', title: 'जहाँ रुके, वहीं लौटें', body: 'Sign in करने पर आपकी प्रगति सुरक्षित रहती है।' },
    ],
    mapKicker: '02 / सत्रह चरण',
    mapTitle: 'एक स्पष्ट मार्ग। भीतर की अपनी गति।',
    mapBody: 'चार पड़ावों में चलती यह यात्रा अज्ञान की पहचान से आत्मविचार और सहज जीवन तक पहुँचती है।',
    stageUnit: 'चरण',
    languageKicker: '03 / अपनी भाषा में',
    languageTitle: 'वीडियो एक। सुनने का अनुभव आपका।',
    languageBody: 'भाषा चुनते ही पाठ्यक्रम के शब्द और उपलब्ध dubbed audio उसी भाषा के अनुसार मिलते हैं। अलग audio setting खोजने की ज़रूरत नहीं।',
    languageList: 'हिंदी · English · বাংলা · ગુજરાતી · ಕನ್ನಡ · മലയാളം · मराठी · ଓଡ଼ିଆ · ਪੰਜਾਬੀ · தமிழ் · తెలుగు',
    languageFoot: 'भाषा यात्रा के दौरान भी बदली जा सकती है।',
    practiceKicker: '04 / फ़िल्मों के बाद',
    practiceTitle: 'समझ को जीवन में उतरने दें।',
    practiceBody: '17 चरणों के बाद चार पड़ावों पर जाँच, अंतिम चिंतन और 12 सप्ताह का निदिध्यासन मार्ग है—जहाँ देखी हुई बात को दैनिक जीवन में परखने का अवसर मिलता है।',
    faqKicker: 'शुरू करने से पहले',
    faqTitle: 'आपके मन में शायद यह हो',
    faqs: [
      { q: 'क्या पहले से अद्वैत का ज्ञान होना ज़रूरी है?', a: 'नहीं। यात्रा अज्ञान और जिज्ञासा जैसे मूल प्रश्नों से आरंभ होती है और धीरे-धीरे आगे बढ़ती है।' },
      { q: 'क्या पूरी यात्रा एक बार में पूरी करनी होगी?', a: 'नहीं। आप अपनी गति से चलते हैं। Sign in के बाद प्रगति सुरक्षित रहती है और लौटने पर उसी स्थान से आगे बढ़ सकते हैं।' },
      { q: 'भाषा और audio कैसे चुनेंगे?', a: 'शुरू में अपनी भाषा चुनें। पाठ और उपलब्ध dubbed audio उसके अनुरूप चलते हैं; आवश्यकता होने पर भाषा बाद में बदल सकते हैं।' },
    ],
    closingKicker: 'यदि प्रश्न सच में आपका है',
    closingTitle: 'शुरुआत यहीं से होती है।',
    closingBody: 'पहला चरण—अज्ञान। एक फ़िल्म, एक प्रश्न, और स्वयं को देखने की थोड़ी ईमानदारी।',
    footer: 'निर्वाण धाम · आदिसत्व के साथ आत्म-विचार की यात्रा',
  },
  en: {
    skip: 'Skip to main content',
    eyebrow: 'Nirvan Dham presents · Nirvan Sutra',
    title: <>Beyond information.<br /><em>Toward direct seeing.</em></>,
    lead: 'A quiet, step-by-step journey through 17 stages that lets “Who am I?” become more than an idea. Walk with Aadisatv’s films, searching questions and your own direct observation.',
    join: 'Begin your journey',
    explore: 'Explore the journey',
    resume: 'Already joined? Continue your journey',
    statLabels: ['guided stages', 'main films', 'deep questions', 'languages'],
    promise: 'Listen in your language · move at your pace · return where you left off',
    introKicker: '01 / The experience',
    introTitle: 'Listening begins it. Seeing makes it yours.',
    introBody: 'Each stage opens with a main film. Ten questions then bring that understanding close to your life. An essence, brief practices, a check and answers in your own words help you test what you have heard against experience.',
    steps: [
      { n: '01', title: 'Watch the film', body: 'First listen to and watch the central teaching of each stage.' },
      { n: '02', title: 'Stay with the questions', body: 'Examine your assumptions through ten questions on the same theme.' },
      { n: '03', title: 'Write what you see', body: 'After the essence, observation and check, express what became clear.' },
      { n: '04', title: 'Return to your place', body: 'Your progress is saved when you sign in.' },
    ],
    mapKicker: '02 / Seventeen stages',
    mapTitle: 'A clear path. Your own inward pace.',
    mapBody: 'Across four movements, the journey travels from recognising ignorance through self-inquiry to natural living.',
    stageUnit: 'Stages',
    languageKicker: '03 / In your language',
    languageTitle: 'One film. A listening experience that meets you.',
    languageBody: 'Choose a language and the course text and available dubbed audio follow that choice. There is no separate audio setting to find.',
    languageList: 'हिंदी · English · বাংলা · ગુજરાતી · ಕನ್ನಡ · മലയാളം · मराठी · ଓଡ଼ିଆ · ਪੰਜਾਬੀ · தமிழ் · తెలుగు',
    languageFoot: 'You can change language during the journey.',
    practiceKicker: '04 / Beyond the films',
    practiceTitle: 'Let understanding enter ordinary life.',
    practiceBody: 'After the 17 stages come four movement checkpoints, a final reflection and a 12-week Nididhyāsana path—an invitation to test what you have seen in daily life.',
    faqKicker: 'Before you begin',
    faqTitle: 'Questions you may have',
    faqs: [
      { q: 'Do I need to know Advaita already?', a: 'No. The journey starts with foundational questions about ignorance and inquiry, then moves forward gradually.' },
      { q: 'Must I finish everything in one sitting?', a: 'No. Move at your own pace. When you sign in, your progress is saved and you can pick up where you left off.' },
      { q: 'How do language and audio work?', a: 'Choose your language at the start. The text and available dubbed audio follow it; you can change language later.' },
    ],
    closingKicker: 'If the question is truly yours',
    closingTitle: 'Begin here.',
    closingBody: 'The first stage is Ajñāna: one film, one question and a little honesty in looking at yourself.',
    footer: 'Nirvan Dham · A journey of self-inquiry with Aadisatv',
  },
};

export default function NirvanSutraCoursePage() {
  const savedLang = useSyncExternalStore(
    (onChange) => { window.addEventListener('storage', onChange); return () => window.removeEventListener('storage', onChange); },
    getSavedLanguage,
    () => 'hi' as Language,
  );
  const [selectedLang, setSelectedLang] = useState<Language | null>(null);
  const lang = selectedLang ?? savedLang;
  const c = copy[lang];
  const hi = lang === 'hi';
  const join = '/course?choose=1';

  function changeLanguage(next: Language) {
    setSelectedLang(next);
    saveLanguage(next);
  }

  return (
    <div className={`sutra-page${hi ? ' sutra-hi' : ''}`} lang={lang}>
      <a className="sutra-skip" href="#sutra-main">{c.skip}</a>
      <Header lang={lang} onLangChange={changeLanguage} />
      <main id="sutra-main">
        <section className="sutra-hero" aria-labelledby="sutra-title">
          <div className="sutra-hero-image"><Image src="/aadisatv/meditation-dawn.jpg" alt="" fill priority sizes="(max-width: 760px) 100vw, 55vw" /></div>
          <div className="sutra-hero-shade" aria-hidden="true" />
          <div className="sutra-hero-content">
            <p className="sutra-kicker">{c.eyebrow}</p>
            <h1 id="sutra-title">{c.title}</h1>
            <p className="sutra-lead">{c.lead}</p>
            <div className="sutra-actions">
              <Link className="sutra-button sutra-button-primary" href={join}>{c.join}<span aria-hidden="true">↗</span></Link>
              <a className="sutra-button sutra-button-outline" href="#journey">{c.explore}<span aria-hidden="true">↓</span></a>
            </div>
            <Link className="sutra-resume" href="/nirvan-sutra/yatra">{c.resume}<span aria-hidden="true"> →</span></Link>
          </div>
          <div className="sutra-hero-index" aria-hidden="true">01 <span>/</span> 17</div>
        </section>

        <div className="sutra-stat-band">
          <div className="sutra-stats">{[17, 17, 170, 11].map((n, i) => <div className="sutra-stat" key={c.statLabels[i]}><strong>{n}</strong><span>{c.statLabels[i]}</span></div>)}</div>
          <p>{c.promise}</p>
        </div>

        <section className="sutra-section sutra-intro" aria-labelledby="sutra-intro-title">
          <div className="sutra-section-heading"><p className="sutra-kicker">{c.introKicker}</p><h2 id="sutra-intro-title">{c.introTitle}</h2><p>{c.introBody}</p></div>
          <ol className="sutra-step-grid">{c.steps.map((step) => <li key={step.n}><span className="sutra-step-number">{step.n}</span><h3>{step.title}</h3><p>{step.body}</p></li>)}</ol>
        </section>

        <section id="journey" className="sutra-section sutra-journey" aria-labelledby="sutra-journey-title">
          <div className="sutra-section-heading"><p className="sutra-kicker">{c.mapKicker}</p><h2 id="sutra-journey-title">{c.mapTitle}</h2><p>{c.mapBody}</p></div>
          <div className="sutra-movement-grid">{movements.map((m, i) => <article key={m.range} className="sutra-movement"><span className="sutra-movement-order">0{i + 1} / 04</span><div><span className="sutra-movement-range">{c.stageUnit} {m.range}</span><h3>{hi ? m.hi : m.en}</h3><p>{hi ? m.hiNote : m.enNote}</p></div><span className="sutra-movement-arrow" aria-hidden="true">↗</span></article>)}</div>
        </section>

        <section className="sutra-section sutra-language" aria-labelledby="sutra-language-title">
          <div className="sutra-language-art" aria-hidden="true"><span>अ</span><span>A</span><span>আ</span><span>க</span><span>అ</span></div>
          <div><p className="sutra-kicker">{c.languageKicker}</p><h2 id="sutra-language-title">{c.languageTitle}</h2><p>{c.languageBody}</p><p className="sutra-language-list">{c.languageList}</p><small>{c.languageFoot}</small></div>
        </section>

        <section className="sutra-section sutra-practice" aria-labelledby="sutra-practice-title">
          <div className="sutra-practice-mark" aria-hidden="true">∞</div><div><p className="sutra-kicker">{c.practiceKicker}</p><h2 id="sutra-practice-title">{c.practiceTitle}</h2><p>{c.practiceBody}</p></div>
        </section>

        <section className="sutra-section sutra-faq" aria-labelledby="sutra-faq-title">
          <div className="sutra-section-heading"><p className="sutra-kicker">{c.faqKicker}</p><h2 id="sutra-faq-title">{c.faqTitle}</h2></div>
          <div className="sutra-faq-list">{c.faqs.map((item) => <details key={item.q}><summary>{item.q}<span aria-hidden="true">＋</span></summary><p>{item.a}</p></details>)}</div>
        </section>

        <section className="sutra-closing"><p className="sutra-kicker">{c.closingKicker}</p><h2>{c.closingTitle}</h2><p>{c.closingBody}</p><Link className="sutra-button sutra-button-primary" href={join}>{c.join}<span aria-hidden="true">↗</span></Link></section>
      </main>
      <footer className="sutra-footer" id="contact"><span>{c.footer}</span><div><a href="mailto:aadiguru@nirvandham.in">aadiguru@nirvandham.in</a><a href="tel:+919334325558">+91 93343 25558</a><Link href="/">Nirvan Dham ↗</Link></div></footer>
    </div>
  );
}
