'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import SacredBackground from '@/components/SacredBackground';
import EntryQuestionsForm from '@/components/EntryQuestionsForm';
import type { Language } from '@/lib/i18n';
import { getSavedLanguage, saveLanguage } from '@/lib/i18n';
import questionData from '@/content/programs/nirvan-shakti-snan-pravesh-prashn.json';
import styles from './NirvanShaktiSnanPage.module.css';

const dailyPractice = [
  ['05', 'मौन में प्रवेश', 'बाहरी गति से भीतर की स्थिरता की ओर'],
  ['10', 'मंत्र-जप', 'दीक्षा-मंत्र को श्वास और भाव से जोड़ना'],
  ['35', 'मुख्य ध्यान', 'मार्गदर्शित अथवा मौन सामूहिक साधना'],
  ['05', 'मौन अवलोकन', 'जो घटा उसे बिना निर्णय के देखना'],
  ['05', 'समापन', 'स्थिरता, संकल्प और सहज वापसी'],
];

const entryFlow = [
  ['01', '9 प्रवेश प्रश्न', 'आपकी साधना-पृष्ठभूमि और वर्तमान स्थिति को समझना।'],
  ['02', 'अवलोकन', 'Nirvan Dham द्वारा उत्तरों का संवेदनशील अध्ययन।'],
  ['03', 'समूह में प्रवेश', 'उपयुक्त साधकों को निजी साधना-मंडल में जोड़ना।'],
  ['04', 'Aadisatv Deeksha', 'साधना-संकल्प और देवी महामाया की यात्रा में प्रवेश।'],
  ['05', 'मंत्र प्राप्ति', 'दीक्षा के समय निजी रूप से साधना-मंत्र दिया जाएगा।'],
  ['06', 'प्रथम Shakti Snan', 'मंत्र, मौन और उपस्थिति में प्रथम सामूहिक शक्ति स्नान।'],
  ['07', 'नियमित यात्रा', 'दैनिक ध्यान और प्रत्येक माह विशेष Shakti Snan।'],
];

const monthlyBaths = [
  ['01', 'बीज शक्ति स्नान'],
  ['02', 'प्राण शक्ति स्नान'],
  ['03', 'ज्योति शक्ति स्नान'],
  ['04', 'हृदय शक्ति स्नान'],
  ['05', 'लीला शक्ति स्नान'],
  ['06', 'पूर्णिमा शक्ति स्नान'],
];

const journey = [
  ['माह 01', 'बीज जागरण', 'दीक्षा, मंत्र, प्रथम स्पर्श और साधना की भूमि'],
  ['माह 02', 'प्राण लहर साधना', 'शरीर, श्वास, ऊर्जा और सूक्ष्म स्पंदन'],
  ['माह 03', 'देवी दर्शन ध्यान', 'अंतर्ज्योति, प्रतीक, स्वप्न और भाव का सजग अवलोकन'],
  ['माह 04', 'रस और भाव साधना', 'हृदय, भक्ति, करुणा और समर्पण'],
  ['माह 05', 'महामाया लीला साधना', 'जीवन के संकेत, संबंध, इच्छा और कर्म-पैटर्न'],
  ['माह 06', 'अनुभव तृप्ति', 'अनुभवों की अनित्यता, मौन और साक्षी की देहरी'],
];

export default function NirvanShaktiSnanPage() {
  const [activeLang, setActiveLang] = useState<Language>('hi');

  useEffect(() => setActiveLang(getSavedLanguage()), []);

  function handleLanguageChange(language: Language) {
    saveLanguage(language);
    setActiveLang(language);
  }

  return (
    <main className={styles.page} lang="hi">
      <Header lang={activeLang} onLangChange={handleLanguageChange} />

      <section className={styles.hero}>
        <Image
          src="/programs/nirvan-shakti-snan/mahamaya-hero.png"
          alt="देवी महामाया की ध्यानमय उपस्थिति"
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroVeil} />
        <div className={styles.heroGeometry} aria-hidden="true">
          <MandalaMark />
        </div>
        <div className={`${styles.container} ${styles.heroInner}`}>
          <p className={styles.eyebrow}>Nirvan Dham · देवी महामाया की साधना-यात्रा</p>
          <h1>निर्वाण शक्ति स्नान <span>साधना</span></h1>
          <p className={styles.heroSubtitle}>अनुभवों की तलाश में चल रहे साधकों के लिए देवी महामाया की साधना यात्रा</p>
          <p className={styles.heroCopy}>
            यह Nirvan Dham का वह जीवंत साधना-क्षेत्र है जहाँ साधक ज्ञान सुनने से आगे बढ़कर ध्यान, मंत्र,
            शक्ति स्नान और आंतरिक अनुभवों की यात्रा में प्रवेश करते हैं।
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#pravesh-prashn">प्रवेश प्रश्न भरें <span aria-hidden="true">→</span></a>
            <a className={styles.secondaryButton} href="/programs/nirvan-shakti-snan/Nirvan_Shakti_Snan_Sadhna_Rooprekha.pdf" target="_blank" rel="noreferrer">
              कार्यक्रम की रूपरेखा देखें
            </a>
          </div>
          <div className={styles.badges} aria-label="कार्यक्रम की विशेषताएँ">
            {['निःशुल्क साधना', 'दैनिक 1 घंटा ध्यान', 'Aadisatv Deeksha', 'मासिक Shakti Snan', 'मंत्र साधना'].map((badge) => (
              <span key={badge}>{badge}</span>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.identitySection}>
        <SacredBackground variant="sri-yantra" intensity="soft" />
        <div className={styles.container}>
          <SectionHeading eyebrow="दो धाराएँ · एक ही धाम" title="गुरु का प्रकाश, देवी का स्पंदन" />
          <p className={styles.centerLead}>
            Nirvan Sutra गुरु की अभिव्यक्ति है। Nirvan Shakti Snan Sadhna देवी महामाया की अभिव्यक्ति है।
            दोनों विरोधी नहीं, साधक की आंतरिक यात्रा के दो पूरक आयाम हैं।
          </p>
          <div className={styles.comparison}>
            <article className={styles.comparisonPanel}>
              <p className={styles.panelNumber}>ज्ञान · साक्षी</p>
              <h3>Nirvan Sutra</h3>
              <p>गुरु की अभिव्यक्ति</p>
              <ul><li>ज्ञान</li><li>साक्षी</li><li>आत्मबोध</li><li>अद्वैत</li></ul>
            </article>
            <div className={styles.comparisonBindu} aria-hidden="true"><span /></div>
            <article className={`${styles.comparisonPanel} ${styles.shaktiPanel}`}>
              <p className={styles.panelNumber}>अनुभव · ऊर्जा</p>
              <h3>Nirvan Shakti Snan</h3>
              <p>देवी महामाया की अभिव्यक्ति</p>
              <ul><li>अनुभव</li><li>मंत्र</li><li>शक्ति स्नान</li><li>भक्ति और ऊर्जा</li></ul>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.audienceSection}>
        <div className={`${styles.container} ${styles.splitBand}`}>
          <div>
            <SectionHeading eyebrow="साधक की तैयारी" title="यह साधना किनके लिए है?" align="left" />
            <p className={styles.lead}>यह आरंभिक परिचय नहीं, उन साधकों के लिए जीवंत अभ्यास है जो नियमितता के साथ भीतर उतरना चाहते हैं।</p>
          </div>
          <div className={styles.criteriaList}>
            {[
              'जिन्होंने पहले ध्यान या साधना की है।',
              'जिन्हें ऊर्जा, स्पंदन, प्रकाश, भाव अथवा मौन की आंतरिक खोज है।',
              'जो केवल theory नहीं, जीवंत और नियमित साधना चाहते हैं।',
              'जो मंत्र, देवी-भाव और शक्ति स्नान के प्रति खुले हैं।',
              'जो प्रतिदिन निश्चित समय पर एक घंटे बैठने के लिए तैयार हैं।',
            ].map((item, index) => <p key={item}><span>{String(index + 1).padStart(2, '0')}</span>{item}</p>)}
          </div>
        </div>
      </section>

      <section className={styles.practiceSection} id="rooprekha">
        <div className={styles.container}>
          <SectionHeading eyebrow="एक समय · एक मंडल · एक घंटा" title="दैनिक सामूहिक साधना" />
          <p className={styles.centerLead}>हर दिन निश्चित समय पर Nirvan Dham के गुरुजनों के सान्निध्य में video call के माध्यम से एक घंटे का ध्यान किया जाएगा।</p>
          <div className={styles.practiceTimeline}>
            {dailyPractice.map(([minutes, title, copy], index) => (
              <article key={title}>
                <div className={styles.minuteMark}><strong>{minutes}</strong><span>मिनट</span></div>
                <div><p className={styles.stepLabel}>चरण {index + 1}</p><h3>{title}</h3><p>{copy}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.entrySection}>
        <SacredBackground variant="chakra" intensity="soft" />
        <div className={styles.container}>
          <SectionHeading eyebrow="पहले समझना, फिर आमंत्रण" title="प्रवेश की प्रक्रिया" />
          <div className={styles.entryTimeline}>
            {entryFlow.map(([number, title, copy]) => (
              <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.deekshaSection}>
        <div className={`${styles.container} ${styles.deekshaLayout}`}>
          <div className={styles.deekshaSymbol} aria-hidden="true"><MandalaMark /></div>
          <div>
            <SectionHeading eyebrow="यात्रा का प्रथम द्वार" title="Aadisatv Deeksha" align="left" />
            <p className={styles.lead}>
              यात्रा का आरंभ Aadisatv Deeksha से होगा। दीक्षा में साधक को साधना-संकल्प, मंत्र और देवी महामाया
              की साधना में प्रवेश दिया जाएगा।
            </p>
            <div className={styles.mantraNote}>
              <strong>मंत्र गोपनीय रहेगा।</strong>
              <p>मंत्र केवल दीक्षा के समय निजी रूप से दिया जाएगा; website पर उसे प्रदर्शित नहीं किया जाएगा।</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.bathSection}>
        <div className={styles.container}>
          <SectionHeading eyebrow="मंत्र · मौन · समर्पण" title="Shakti Snan क्या है?" />
          <p className={styles.centerLead}>
            Shakti Snan वह सामूहिक ध्यान-सत्र है जहाँ साधक मंत्र, मौन, संकल्प और Aadisatv की उपस्थिति में
            अपने भीतर देवी महामाया के स्पंदन के लिए स्वयं को खोलता है। इसे Shaktipat के एक ध्यानमय रूप में
            समझा जा सकता है, पर किसी निश्चित अनुभव की गारंटी के रूप में नहीं। कृपा अपने ढंग से घटती है।
          </p>
          <div className={styles.bathGrid}>
            {monthlyBaths.map(([number, title]) => <article key={number}><span>{number}</span><h3>{title}</h3></article>)}
          </div>
        </div>
      </section>

      <section className={styles.journeySection}>
        <div className={styles.container}>
          <SectionHeading eyebrow="छह मास · छह अंतर-द्वार" title="साधना की यात्रा" />
          <div className={styles.journeyGrid}>
            {journey.map(([month, title, focus]) => (
              <article key={month}><p>{month}</p><h3>{title}</h3><span>केंद्र</span><div>{focus}</div></article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.formSection} id="pravesh-prashn">
        <SacredBackground variant="mandala" intensity="soft" />
        <div className={styles.container}>
          <SectionHeading eyebrow="आपकी वर्तमान साधना को समझने के लिए" title="प्रवेश से पहले 9 प्रश्न" />
          <p className={styles.centerLead}>यह परीक्षा नहीं है। उत्तर सहज, स्पष्ट और सत्य रखें, ताकि आगे का मार्ग जिम्मेदारी से तय किया जा सके।</p>
          <EntryQuestionsForm questions={questionData.questions} />
        </div>
      </section>

      <section className={styles.safetySection}>
        <div className={`${styles.container} ${styles.safetyLayout}`}>
          <div><p className={styles.eyebrow}>साधना की परिपक्वता</p><h2>अनुभव आएँ तो कृपा,<br />न आएँ तो मौन भी कृपा।</h2></div>
          <div>
            <p>यह साधना अनुभवों की खोज से आरंभ हो सकती है, पर अनुभवों की गुलामी पर समाप्त नहीं होती। अनुभव आएँ या न आएँ, साधक की सजगता ही मुख्य है।</p>
            <aside><strong>महत्वपूर्ण:</strong> यह कार्यक्रम चिकित्सा, मानसिक स्वास्थ्य उपचार या रोग-निवारण का विकल्प नहीं है। गंभीर मानसिक या शारीरिक समस्या में पहले योग्य professional सहायता लेना आवश्यक है।</aside>
          </div>
        </div>
      </section>

      <section className={styles.finalCta}>
        <SacredBackground variant="lotus" intensity="soft" />
        <div className={styles.container}>
          <p className={styles.eyebrow}>Nirvan Dham · निःशुल्क साधना</p>
          <h2>यदि भीतर अनुभवों की प्यास है,<br />तो यह यात्रा आपके लिए हो सकती है।</h2>
          <p>साधक स्वयं को खोलता है; कृपा अपने ढंग से घटती है।</p>
          <a className={styles.primaryButton} href="#pravesh-prashn">प्रवेश प्रश्न भरें <span aria-hidden="true">↑</span></a>
        </div>
      </section>
    </main>
  );
}

function SectionHeading({ eyebrow, title, align = 'center' }: { eyebrow: string; title: string; align?: 'left' | 'center' }) {
  return <header className={`${styles.sectionHeading} ${align === 'left' ? styles.alignLeft : ''}`}><p>{eyebrow}</p><h2>{title}</h2><span /></header>;
}

function MandalaMark() {
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <circle cx="100" cy="100" r="88" />
      <circle cx="100" cy="100" r="58" />
      {Array.from({ length: 12 }, (_, index) => (
        <ellipse key={index} cx="100" cy="52" rx="18" ry="46" transform={`rotate(${index * 30} 100 100)`} />
      ))}
      <circle cx="100" cy="100" r="8" />
      <circle cx="100" cy="100" r="2" className={styles.binduFill} />
    </svg>
  );
}
