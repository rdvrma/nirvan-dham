'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import GuruBetaForm from '@/components/GuruBetaForm';
import type { Language } from '@/lib/i18n';
import { getSavedLanguage, saveLanguage } from '@/lib/i18n';
import styles from './NirvanShaktiSnanPage.module.css';

export default function GuruBetaPage() {
  const [lang, setLang] = useState<Language>('hi');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLang(getSavedLanguage());
    setMounted(true);
  }, []);

  function handleLangChange(l: Language) {
    saveLanguage(l);
    setLang(l);
  }

  const activeLang = mounted ? lang : 'hi';

  return (
    <main lang="hi">
      <Header lang={activeLang} onLangChange={handleLangChange} />
      <div className={styles.pageWrap}>
        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>Nirvan Dham · एआई आध्यात्मिक साथी</p>
            <h1 className={styles.h1}>
              <span className={styles.h1a}>सीमित गुरु बीटा</span>
              <span className={styles.h1b}>आवेदन</span>
            </h1>
            <p className={styles.heroSub}>साधकों के कल्याण हेतु एक डिजिटल सेवा परीक्षण</p>
            <p className={styles.heroCopy}>
              यह पृष्ठ केवल आमंत्रित आध्यात्मिक गुरुओं, मार्गदर्शकों और संस्था प्रमुखों के लिए है। निर्वाण धाम एक एआई-आधारित आध्यात्मिक साथी का परीक्षण कर रहा है जो साधकों को उनके अभ्यास में तकनीकी सहायता दे सके।
            </p>
          </div>
        </header>

        <section className={styles.section}>
          <div className={styles.sectionContent}>
            <p className={styles.sectionEyebrow}>परिचय</p>
            <h2>यह एआई साथी क्या है?</h2>
            <p className={styles.lead}>
              यह एक प्रयोगात्मक डिजिटल टूल है जिसे आध्यात्मिक प्रश्नों के उत्तर देने, ध्यान के लिए संकेत देने और सत्य-जिज्ञासा में एक डिजिटल सहायक के रूप में काम करने के लिए प्रशिक्षित किया जा रहा है।
            </p>
          </div>
        </section>

        <section className={`${styles.section} ${styles.altSection}`}>
          <div className={styles.sectionContent}>
            <p className={styles.sectionEyebrow}>स्पष्ट सीमाएँ</p>
            <h2>पहचान की सीमा (Identity Boundary)</h2>
            <p className={styles.lead}>
              यह एआई केवल एक डिजिटल मार्गदर्शक है। यह जीवित गुरु, चिकित्सक, वकील या धार्मिक अधिकारी का स्थान नहीं लेता है। यह एआई कोई जीवित चेतना नहीं है, बल्कि दिए गए आध्यात्मिक ज्ञान का एक संकलन मात्र है।
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionContent}>
            <p className={styles.sectionEyebrow}>उद्देश्य</p>
            <h2>बीटा परीक्षण का उद्देश्य</h2>
            <p className={styles.lead}>
              सार्वजनिक रूप से लॉन्च करने से पहले, हम यह सुनिश्चित करना चाहते हैं कि यह एआई विभिन्न परंपराओं और मार्गों के साधकों के लिए सुरक्षित, सटीक और लाभकारी है। इसलिए हम इसे सीमित समूहों में परीक्षण के लिए खोल रहे हैं।
            </p>
          </div>
        </section>

        <section className={`${styles.section} ${styles.altSection}`}>
          <div className={styles.sectionContent}>
            <p className={styles.sectionEyebrow}>पात्रता और सीमाएँ</p>
            <h2>कौन आवेदन कर सकता है?</h2>
            <p className={styles.lead}>
              कोई भी आध्यात्मिक मार्गदर्शक, गुरु, या समुदाय प्रमुख जो अपने साधकों के लिए इस तकनीक का परीक्षण करना चाहते हैं।
            </p>
            
            <div className={styles.stepGrid}>
              <div className={styles.stepCard}>
                <span className={styles.stepNum}>सीमा</span>
                <strong>उपयोग की सीमाएँ</strong>
                <p>वर्तमान में यह केवल सीमित उपयोगकर्ताओं के लिए उपलब्ध होगा ताकि हम सर्वर और गुणवत्ता को नियंत्रित रख सकें।</p>
              </div>
              <div className={styles.stepCard}>
                <span className={styles.stepNum}>सहयोग</span>
                <strong>दान / सहयोग</strong>
                <p>इस बीटा परीक्षण के लिए कोई शुल्क नहीं है। कोई भी आर्थिक सहयोग केवल निर्वाण धाम के सामान्य संचालन हेतु स्वैच्छिक है।</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionContent}>
            <p className={styles.sectionEyebrow}>आवेदन प्रपत्र</p>
            <h2>गुरु / मार्गदर्शक जानकारी</h2>
            <p className={styles.lead}>
              कृपया नीचे दी गई जानकारी भरें ताकि हम आपके समुदाय के लिए एक सुरक्षित परीक्षण वातावरण तैयार कर सकें।
            </p>
            <GuruBetaForm />
          </div>
        </section>
      </div>
    </main>
  );
}
