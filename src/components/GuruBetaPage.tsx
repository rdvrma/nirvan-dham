'use client';

import Header from '@/components/Header';
import GuruBetaForm from '@/components/GuruBetaForm';
import styles from './NirvanShaktiSnanPage.module.css';

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

export default function GuruBetaPage() {
  return (
    <main className={styles.page} lang="hi">
      <Header lang="hi" onLangChange={() => {}} />

      {/* ═══════════════════════════════════
          HERO
      ═══════════════════════════════════ */}
      <section className={styles.hero}>
        <div className={styles.heroVeil} />
        <div className={styles.heroGeometry}><MandalaMark /></div>
        <div className={`${styles.container} ${styles.heroInner}`}>
          <p className={styles.eyebrow}>Nirvan Dham · एआई आध्यात्मिक साथी</p>
          <h1>
            <span>सीमित गुरु बीटा</span>{' '}
            <span>आवेदन</span>
          </h1>
          <p className={styles.heroSubtitle}>
            साधकों के कल्याण हेतु एक डिजिटल सेवा परीक्षण
          </p>
          <p className={styles.heroCopy}>
            यह पृष्ठ केवल आमंत्रित आध्यात्मिक गुरुओं, मार्गदर्शकों और संस्था प्रमुखों के लिए है।
            निरवण धाम एक एआई-आधारित आध्यात्मिक साथी का सीमित परीक्षण कर रहा है — जो साधकों को
            उनकी आध्यात्मिक यात्रा में एक डिजिटल सहायक के रूप में मार्गदर्शन दे सके।
          </p>
          <div className={styles.badges}>
            {['सीमित बीटा', 'गुरु आमंत्रण मात्र', 'शुद्ध हिंदी', 'निःशुल्क परीक्षण', 'गोपनीय'].map((b) => (
              <span key={b}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          WHAT IS THIS AI
      ═══════════════════════════════════ */}
      <section className={styles.identitySection}>
        <div className={styles.container}>
          <header className={styles.sectionHeading}>
            <p>परिचय</p>
            <h2>यह एआई साथी क्या है?</h2>
            <span />
          </header>
          <p className={styles.centerLead}>
            यह एक प्रयोगात्मक डिजिटल सहायक है जिसे आदिसत्व की शिक्षाओं, अद्वैत वेदांत और आध्यात्मिक
            जिज्ञासा के आधार पर प्रशिक्षित किया गया है। यह साधकों के आध्यात्मिक प्रश्नों का उत्तर
            देने, ध्यान की दिशा सुझाने और सत्य-अन्वेषण में सहायता करने के लिए बनाया जा रहा है।
          </p>
          <div className={styles.comparison} style={{ marginTop: '3.5rem' }}>
            <div className={styles.comparisonPanel}>
              <p className={styles.panelNumber}>यह एआई है</p>
              <h3>क्या करता है</h3>
              <ul>
                <li>आध्यात्मिक प्रश्नों के उत्तर देता है</li>
                <li>ध्यान और साधना की दिशा सुझाता है</li>
                <li>शास्त्र और शिक्षाओं का संदर्भ देता है</li>
                <li>२४×७ उपलब्ध रहता है</li>
              </ul>
            </div>
            <div className={styles.comparisonBindu}>
              <span />
            </div>
            <div className={`${styles.comparisonPanel} ${styles.shaktiPanel}`}>
              <p className={styles.panelNumber}>यह एआई नहीं है</p>
              <h3>क्या नहीं करता</h3>
              <ul>
                <li>जीवित गुरु का स्थान नहीं लेता</li>
                <li>दीक्षा या शक्तिपात नहीं देता</li>
                <li>चिकित्सीय सलाह नहीं देता</li>
                <li>धार्मिक अधिकारी नहीं है</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          IDENTITY BOUNDARY
      ═══════════════════════════════════ */}
      <section className={styles.deekshaSection}>
        <div className={styles.container}>
          <div className={styles.deekshaLayout}>
            <div className={styles.deekshaSymbol}><MandalaMark /></div>
            <div>
              <header className={`${styles.sectionHeading} ${styles.alignLeft}`}>
                <p>पहचान की सीमा</p>
                <h2>मूल घोषणा</h2>
                <span />
              </header>
              <p className={styles.lead}>
                यह एआई साथी आदिसत्व की शिक्षाओं का डिजिटल संकलन है। यह आदिसत्व की चेतना या उपस्थिति नहीं है।
              </p>
              <div className={styles.mantraNote}>
                <strong>&ldquo;मैं आदिसत्व का डिजिटल गाइड हूँ, आदिसत्व स्वयं नहीं।&rdquo;</strong>
                <p>यह सीमा प्रत्येक बातचीत में स्पष्ट रखी जाती है ताकि साधक किसी भ्रम में न रहे।</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          BETA PURPOSE
      ═══════════════════════════════════ */}
      <section className={styles.entrySection}>
        <div className={styles.container}>
          <header className={styles.sectionHeading}>
            <p>बीटा परीक्षण का उद्देश्य</p>
            <h2>हम क्यों परीक्षण कर रहे हैं?</h2>
            <span />
          </header>
          <div className={styles.entryTimeline}>
            {[
              ['01', 'सुरक्षा की जाँच', 'विभिन्न परंपराओं के साधकों के लिए यह एआई कितना सुरक्षित और सटीक है, यह जानना।'],
              ['02', 'गुणवत्ता परिष्कार', 'वास्तविक गुरुओं के फीडबैक से उत्तरों की गुणवत्ता और गहराई बढ़ाना।'],
              ['03', 'भाषा और भाव', 'हिंदी, हिंग्लिश और अंग्रेज़ी में भाव की सटीकता परखना।'],
              ['04', 'सीमाओं की पहचान', 'किन विषयों में एआई सावधानी बरते, इसे परिभाषित करना।'],
              ['05', 'सामुदायिक अनुकूलन', 'अलग-अलग परंपराओं के अनुसार उत्तर शैली को ढालना।'],
            ].map(([num, title, desc]) => (
              <article key={num}>
                <span>{num}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          WHO CAN APPLY + USAGE LIMITS
      ═══════════════════════════════════ */}
      <section className={styles.audienceSection}>
        <div className={styles.container}>
          <div className={styles.splitBand}>
            <div>
              <header className={`${styles.sectionHeading} ${styles.alignLeft}`}>
                <p>पात्रता</p>
                <h2>कौन आवेदन कर सकता है?</h2>
                <span />
              </header>
              <p className={styles.lead}>
                कोई भी आध्यात्मिक मार्गदर्शक, गुरु, या समुदाय प्रमुख जो अपने साधकों के लिए
                इस तकनीक का सावधानीपूर्वक परीक्षण करना चाहते हैं।
              </p>
            </div>
            <div className={styles.criteriaList}>
              {[
                ['✦', 'जो किसी आध्यात्मिक परंपरा से जुड़े हैं और साधकों का मार्गदर्शन करते हैं।'],
                ['✦', 'जो तकनीक को साधना के साथ ज़िम्मेदारी से जोड़ना चाहते हैं।'],
                ['✦', 'जो फीडबैक देने के इच्छुक हैं और गलत उत्तरों की रिपोर्ट करेंगे।'],
                ['✦', 'जो इस लिंक को सार्वजनिक रूप से साझा नहीं करेंगे।'],
                ['✦', 'जो समझते हैं कि यह जीवित गुरु का विकल्प नहीं है।'],
              ].map(([sym, text]) => (
                <p key={text}><span>{sym}</span>{text}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          DONATION CLARITY
      ═══════════════════════════════════ */}
      <section className={styles.safetySection}>
        <div className={styles.container}>
          <div className={styles.safetyLayout}>
            <div>
              <p className={styles.eyebrow}>दान / सहयोग</p>
              <h2>यह परीक्षण निःशुल्क है</h2>
            </div>
            <div>
              <p>
                इस बीटा परीक्षण चरण में कोई शुल्क नहीं लिया जाएगा। यदि आप निरवण धाम के कार्य में
                सहयोग करना चाहते हैं, तो वह केवल सामान्य प्लेटफॉर्म सहयोग के रूप में, आपकी
                इच्छानुसार, अलग से किया जा सकता है। इस पृष्ठ पर कोई दान अपील नहीं है।
              </p>
              <aside>
                <strong>महत्वपूर्ण:</strong> आवेदन करने के लिए कोई भुगतान आवश्यक नहीं है। फॉर्म
                भरना और बीटा में शामिल होना — दोनों पूर्णतः निःशुल्क हैं।
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          FORM
      ═══════════════════════════════════ */}
      <section className={styles.formSection}>
        <div className={styles.container}>
          <header className={styles.sectionHeading}>
            <p>गुरु / मार्गदर्शक जानकारी</p>
            <h2>बीटा आवेदन प्रपत्र</h2>
            <span />
          </header>
          <p className={styles.centerLead} style={{ marginBottom: '0' }}>
            कृपया नीचे दी गई जानकारी भरें ताकि हम आपके समुदाय के लिए एक सुरक्षित परीक्षण वातावरण
            तैयार कर सकें। सभी जानकारी गोपनीय रखी जाएगी।
          </p>
          <GuruBetaForm />
        </div>
      </section>
    </main>
  );
}
