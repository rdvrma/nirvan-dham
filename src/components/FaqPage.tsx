'use client';

import { useState, useEffect } from 'react';
import type { Language } from '@/lib/i18n';
import { getSavedLanguage, saveLanguage } from '@/lib/i18n';
import Header from '@/components/Header';
import ContactSection from '@/components/ContactSection';

const faqs = [
  {
    q: { hi: 'निर्वाण धाम क्या है?', en: 'What is Nirvan Dham?' },
    a: { 
      hi: 'निर्वाण धाम कोई भौतिक स्थान या संस्था मात्र नहीं है। यह जागरूकता, अद्वैत और आत्म-जिज्ञासा के साधकों के लिए एक मौन और पावन स्थान है।',
      en: 'Nirvan Dham is not merely a physical place or institution. It is a silent, sacred space for seekers of awareness, non-duality, and self-inquiry.' 
    }
  },
  {
    q: { hi: 'आदिसत्व कौन हैं?', en: 'Who is Aadisatv?' },
    a: { 
      hi: 'आदिसत्व एक आध्यात्मिक मार्गदर्शक हैं जो साधकों को सीधे देखने की ओर ले जाते हैं: आप केवल नाम, शरीर या मन नहीं हैं — आप वह जागरूकता हैं जिसमें सब कुछ प्रकट होता है।',
      en: 'Aadisatv is a spiritual guide who points seekers toward direct seeing: you are not merely the name, body, or mind — you are the awareness in which all appears.' 
    }
  },
  {
    q: { hi: 'निर्वाण सूत्र क्या है?', en: 'What is Nirvan Sutra?' },
    a: { 
      hi: 'निर्वाण सूत्र निर्वाण धाम की अभिव्यक्ति है। यह उन शिक्षाओं, वीडियो और मार्गदर्शन का संग्रह है जो सत्य को उद्घाटित करते हैं।',
      en: 'Nirvan Sutra is the expression of Nirvan Dham. It is the collection of teachings, videos, and guidance that point to the ultimate truth.' 
    }
  },
  {
    q: { hi: 'क्या निर्वाण धाम एक मंदिर या आश्रम है?', en: 'Is Nirvan Dham a temple or ashram?' },
    a: { 
      hi: 'नहीं, यह पारंपरिक अर्थों में कोई मंदिर या आश्रम नहीं है। यहाँ कोई अनुष्ठान या कर्मकांड नहीं होते। यह सत्य को जानने वालों के लिए एक डिजिटल और भौतिक (बोधगया) मिलन बिंदु है।',
      en: 'No, it is not a temple or a traditional ashram. There are no rituals performed here. It is a digital and physical (Bodhgaya) meeting point for those seeking truth.' 
    }
  },
  {
    q: { hi: 'अद्वैत क्या है?', en: 'What is non-duality / Advaita?' },
    a: { 
      hi: 'अद्वैत का अर्थ है "दो नहीं"। यह वह समझ है कि देखने वाला और जो देखा जा रहा है, वे अलग-अलग नहीं हैं। केवल एक ही असीम चेतना है।',
      en: 'Advaita translates to "not two". It is the understanding that the seer and the seen are not separate. There is only one boundless consciousness.' 
    }
  },
  {
    q: { hi: 'ऑनलाइन संवाद में कौन शामिल हो सकता है?', en: 'Who can join Online Samvad?' },
    a: { 
      hi: 'कोई भी साधक जो सत्य के प्रति ईमानदार और जिज्ञासु है, वह ऑनलाइन संवाद (वीडियो सत्र) के लिए आवेदन कर सकता है।',
      en: 'Any seeker who is sincere and deeply curious about the truth can apply for an Online Samvad (video session).' 
    }
  },
  {
    q: { hi: 'बोधगया संवाद में क्या होता है?', en: 'What happens in Bodhgaya Samvad?' },
    a: { 
      hi: 'बोधगया संवाद में साधक व्यक्तिगत रूप से आदिसत्व के साथ बैठते हैं। यह मौन, आत्म-जिज्ञासा और प्रत्यक्ष मार्गदर्शन का एक गहरा अवसर होता है।',
      en: 'In Bodhgaya Samvad, seekers sit in person with Aadisatv. It is a profound opportunity for silence, self-inquiry, and direct guidance.' 
    }
  },
  {
    q: { hi: 'क्या इसका कोई निश्चित शुल्क है?', en: 'Is there any fixed fee?' },
    a: { 
      hi: 'नहीं। मार्गदर्शन के लिए कोई शुल्क या "चढ़ावा" नहीं है। निर्वाण धाम पूरी तरह से साधकों के स्वैच्छिक सहयोग (Donation) पर चलता है।',
      en: 'No. There is no fee or mandatory payment for guidance. Nirvan Dham runs entirely on the voluntary support (donation) of seekers.' 
    }
  },
  {
    q: { hi: 'क्या शुरुआती साधक ध्यान मार्गदर्शन से शुरुआत कर सकते हैं?', en: 'Can beginners start with guided meditation?' },
    a: { 
      hi: 'हाँ, बिल्कुल। गाइडेड मेडिटेशन (ध्यान मार्गदर्शन) शुरुआती और अनुभवी दोनों साधकों को उनके भीतर की शांति तक पहुँचने में मदद करता है।',
      en: 'Yes, absolutely. The guided meditation (Sadhana) helps both beginners and experienced seekers rest into the silence within.' 
    }
  },
  {
    q: { hi: 'अंतरराष्ट्रीय साधक कैसे जुड़ सकते हैं?', en: 'How can international seekers connect?' },
    a: { 
      hi: 'अंतरराष्ट्रीय साधक निर्वाण सूत्र के अंग्रेजी वीडियो देख सकते हैं और व्यक्तिगत मार्गदर्शन के लिए ऑनलाइन संवाद का विकल्प चुन सकते हैं।',
      en: 'International seekers can watch the English teachings through Nirvan Sutra and apply for Online Samvad for one-on-one guidance.' 
    }
  }
];

export default function FaqPage() {
  const [lang, setLang] = useState<Language>('hi');
  const [mounted, setMounted] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    setLang(getSavedLanguage());
    setMounted(true);
  }, []);

  function handleLangChange(selected: Language) {
    setLang(selected);
    saveLanguage(selected);
  }

  const activeLang = mounted ? lang : 'hi';

  const eyebrow = activeLang === 'hi' ? 'सामान्य प्रश्न' : 'FAQ';
  const title = activeLang === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न' : 'Frequently Asked Questions';
  const lead = activeLang === 'hi' 
    ? 'निर्वाण धाम, आदिसत्व और अद्वैत दर्शन से जुड़े कुछ सामान्य प्रश्नों के उत्तर।'
    : 'Answers to common questions regarding Nirvan Dham, Aadisatv, and non-duality.';

  return (
    <div className="faq-page">
      <div className="faq-grid-bg" />
      <div className="faq-mandala" aria-hidden="true" />
      
      <Header lang={activeLang} onLangChange={handleLangChange} />

      <main className="faq-main">
        <section className="faq-hero">
          <span className="faq-symbol">∞</span>
          <p>{eyebrow}</p>
          <h1>{title}</h1>
          <span className="faq-line" />
          <p className="faq-lead">{lead}</p>
        </section>

        <section className="faq-content">
          <div className="faq-accordion">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className={`faq-item ${isOpen ? 'open' : ''}`}>
                  <button 
                    className="faq-question" 
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                  >
                    <span className={activeLang === 'hi' ? 'font-hindi' : ''}>{faq.q[activeLang]}</span>
                    <span className="faq-icon">{isOpen ? '−' : '+'}</span>
                  </button>
                  <div className="faq-answer-wrapper" style={{ maxHeight: isOpen ? '200px' : '0' }}>
                    <p className={`faq-answer ${activeLang === 'hi' ? 'font-hindi' : ''}`}>
                      {faq.a[activeLang]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <ContactSection lang={activeLang} />

      <style jsx>{`
        .faq-page {
          min-height: 100vh;
          background: var(--c-bg);
          color: var(--c-text);
          position: relative;
          overflow-x: hidden;
          font-family: var(--font-hind);
          display: flex;
          flex-direction: column;
        }

        .faq-page::before {
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

        .faq-grid-bg {
          position: fixed;
          inset: 0;
          opacity: .16;
          background-image:
            linear-gradient(rgba(212,168,67,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,168,67,.025) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        .faq-mandala {
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

        .faq-main {
          position: relative;
          z-index: 2;
          width: min(900px, calc(100% - 2rem));
          margin: 0 auto;
          padding-top: 5rem;
          padding-bottom: 5rem;
          flex-grow: 1;
        }

        .faq-hero {
          text-align: center;
          padding: clamp(4rem, 8vw, 6rem) 0 clamp(2rem, 5vw, 3.5rem);
        }

        .faq-symbol {
          display: block;
          color: var(--c-gold);
          font-size: clamp(2.4rem, 6vw, 4rem);
          margin-bottom: 1rem;
          filter: drop-shadow(0 0 28px rgba(212,168,67,.32));
        }

        .faq-hero > p:first-of-type {
          color: rgba(212,168,67,.7);
          text-transform: uppercase;
          letter-spacing: .24em;
          font-size: .72rem;
          font-family: var(--font-inter);
          font-weight: 700;
        }

        .faq-hero h1 {
          color: var(--c-ivory);
          font-family: var(--font-cormorant);
          font-weight: 300;
          font-size: clamp(3rem, 8vw, 5.5rem);
          line-height: .95;
          margin: .8rem 0 1.3rem;
        }

        .faq-line {
          display: block;
          width: 140px;
          height: 1px;
          margin: 0 auto 1.5rem;
          background: linear-gradient(90deg, transparent, rgba(212,168,67,.5), transparent);
        }

        .faq-lead {
          max-width: 700px;
          margin: 0 auto;
          color: var(--c-ivdim);
          line-height: 1.85;
          font-size: clamp(1rem, 2vw, 1.16rem);
        }

        .faq-accordion {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 2rem;
        }

        .faq-item {
          border: 1px solid rgba(212,168,67,.15);
          background: rgba(13,31,16,.6);
          backdrop-filter: blur(14px);
          border-radius: 8px;
          overflow: hidden;
          transition: border-color 0.3s ease;
        }

        .faq-item:hover, .faq-item.open {
          border-color: rgba(212,168,67,.35);
        }

        .faq-question {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: transparent;
          border: none;
          padding: 1.25rem 1.5rem;
          color: var(--c-ivory);
          font-size: 1.1rem;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          font-family: inherit;
        }

        .faq-icon {
          color: var(--c-gold);
          font-size: 1.4rem;
          font-weight: 300;
        }

        .faq-answer-wrapper {
          transition: max-height 0.3s ease;
          overflow: hidden;
        }

        .faq-answer {
          padding: 0 1.5rem 1.25rem 1.5rem;
          color: var(--c-ivdim);
          line-height: 1.7;
          font-size: 0.95rem;
          opacity: 0.9;
        }

        @media (max-width: 720px) {
          .faq-hero h1 {
            font-size: 2.5rem;
          }
          .faq-question {
            font-size: 1rem;
            padding: 1rem 1.25rem;
          }
          .faq-answer {
            padding: 0 1.25rem 1rem 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}
