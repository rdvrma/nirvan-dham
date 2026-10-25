import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { isLocale, LOCALES, localeInfo } from '@/course/nirvan-sutra/locales';
import type { LocaleCode } from '@/course/nirvan-sutra/types';
import { uiStrings } from '@/course/nirvan-sutra/server/content';
import { nsFontVars } from '@/components/nirvan-sutra/fonts';
import BrandMark from '@/components/nirvan-sutra/BrandMark';
import '../../nirvan-sutra/yatra/yatra.css';
import './reader.css';

export const metadata: Metadata = {
  title: 'Nirvan Sutra glossary | Words and definitions in 11 languages',
  description: 'Read or download the Nirvan Sutra seeker glossary in Hindi, English, Bengali, Tamil, Telugu, Gujarati, Kannada, Malayalam, Marathi, Punjabi, or Odia.',
  alternates: { canonical: '/course/glossary' },
};

const PAGES: Record<LocaleCode, number> = {
  hi: 32, en: 35, bn: 34, ta: 36, te: 34, gu: 32,
  kn: 34, ml: 35, mr: 32, pa: 32, or: 32,
};

const READER: Record<LocaleCode, { eyebrow: string; intro: string; read: string; download: string; original: string; page: string; back: string }> = {
  hi: { eyebrow: 'ज्ञानमार्ग की तैयारी', intro: 'सत्रह चरणों से जुड़े आवश्यक शब्द और उनकी विस्तृत परिभाषाएँ। अपनी भाषा चुनें, यहाँ क्रम से पढ़ें या पूरा ग्रंथ PDF में साथ रखें।', read: 'यहीं पढ़ें', download: 'PDF डाउनलोड करें', original: 'मूल PDF खोलें', page: 'पृष्ठ', back: 'पाठ्यक्रम पर लौटें' },
  en: { eyebrow: 'Prepare for the journey', intro: 'Essential terms and full definitions from the seventeen stages. Choose your language, read them here, or keep the complete PDF.', read: 'Read here', download: 'Download PDF', original: 'Open original PDF', page: 'Page', back: 'Back to the course' },
  bn: { eyebrow: 'জ্ঞানমার্গের প্রস্তুতি', intro: 'সতেরোটি ধাপের প্রয়োজনীয় শব্দ ও বিস্তারিত সংজ্ঞা। এখানে পড়ুন অথবা সম্পূর্ণ PDF ডাউনলোড করুন।', read: 'এখানে পড়ুন', download: 'PDF ডাউনলোড করুন', original: 'মূল PDF খুলুন', page: 'পৃষ্ঠা', back: 'পাঠ্যক্রমে ফিরুন' },
  ta: { eyebrow: 'ஞானமார்க்கத்திற்கான தயாரிப்பு', intro: 'பதினேழு நிலைகளின் முக்கிய சொற்களும் விரிவான வரையறைகளும். இங்கே படிக்கலாம் அல்லது முழு PDF-ஐ பதிவிறக்கலாம்.', read: 'இங்கே படிக்கவும்', download: 'PDF பதிவிறக்கம்', original: 'அசல் PDF-ஐத் திறக்கவும்', page: 'பக்கம்', back: 'பாடநெறிக்குத் திரும்பவும்' },
  te: { eyebrow: 'జ్ఞానమార్గానికి సిద్ధత', intro: 'పదిహేడు దశలకు సంబంధించిన ముఖ్య పదాలు, పూర్తి నిర్వచనాలు. ఇక్కడ చదవండి లేదా PDF డౌన్‌లోడ్ చేసుకోండి.', read: 'ఇక్కడ చదవండి', download: 'PDF డౌన్‌లోడ్', original: 'అసలు PDF తెరవండి', page: 'పేజీ', back: 'కోర్సుకు తిరిగి వెళ్ళండి' },
  gu: { eyebrow: 'જ્ઞાનમાર્ગની તૈયારી', intro: 'સત્તર તબક્કાના જરૂરી શબ્દો અને વિસ્તૃત વ્યાખ્યાઓ. અહીં વાંચો અથવા સંપૂર્ણ PDF ડાઉનલોડ કરો.', read: 'અહીં વાંચો', download: 'PDF ડાઉનલોડ કરો', original: 'મૂળ PDF ખોલો', page: 'પાનું', back: 'અભ્યાસક્રમમાં પાછા જાઓ' },
  kn: { eyebrow: 'ಜ್ಞಾನಮಾರ್ಗದ ಸಿದ್ಧತೆ', intro: 'ಹದಿನೇಳು ಹಂತಗಳ ಪ್ರಮುಖ ಪದಗಳು ಮತ್ತು ಸಂಪೂರ್ಣ ವ್ಯಾಖ್ಯಾನಗಳು. ಇಲ್ಲಿ ಓದಿ ಅಥವಾ PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.', read: 'ಇಲ್ಲಿ ಓದಿ', download: 'PDF ಡೌನ್‌ಲೋಡ್', original: 'ಮೂಲ PDF ತೆರೆಯಿರಿ', page: 'ಪುಟ', back: 'ಕೋರ್ಸ್‌ಗೆ ಹಿಂತಿರುಗಿ' },
  ml: { eyebrow: 'ജ്ഞാനമാർഗത്തിനുള്ള തയ്യാറെടുപ്പ്', intro: 'പതിനേഴ് ഘട്ടങ്ങളിലെ പ്രധാന പദങ്ങളും വിശദമായ നിർവചനങ്ങളും. ഇവിടെ വായിക്കുകയോ മുഴുവൻ PDF ഡൗൺലോഡ് ചെയ്യുകയോ ചെയ്യാം.', read: 'ഇവിടെ വായിക്കുക', download: 'PDF ഡൗൺലോഡ്', original: 'മൂല PDF തുറക്കുക', page: 'പേജ്', back: 'കോഴ്സിലേക്ക് മടങ്ങുക' },
  mr: { eyebrow: 'ज्ञानमार्गाची तयारी', intro: 'सतरा टप्प्यांतील आवश्यक शब्द आणि सविस्तर व्याख्या. येथे वाचा किंवा संपूर्ण PDF डाउनलोड करा.', read: 'येथे वाचा', download: 'PDF डाउनलोड करा', original: 'मूळ PDF उघडा', page: 'पान', back: 'अभ्यासक्रमाकडे परत जा' },
  pa: { eyebrow: 'ਗਿਆਨਮਾਰਗ ਦੀ ਤਿਆਰੀ', intro: 'ਸਤਾਰਾਂ ਪੜਾਵਾਂ ਦੇ ਜ਼ਰੂਰੀ ਸ਼ਬਦ ਅਤੇ ਵਿਸਥਾਰਪੂਰਵਕ ਪਰਿਭਾਸ਼ਾਵਾਂ। ਇੱਥੇ ਪੜ੍ਹੋ ਜਾਂ ਪੂਰੀ PDF ਡਾਊਨਲੋਡ ਕਰੋ।', read: 'ਇੱਥੇ ਪੜ੍ਹੋ', download: 'PDF ਡਾਊਨਲੋਡ ਕਰੋ', original: 'ਅਸਲ PDF ਖੋਲ੍ਹੋ', page: 'ਪੰਨਾ', back: 'ਕੋਰਸ ਵੱਲ ਵਾਪਸ ਜਾਓ' },
  or: { eyebrow: 'ଜ୍ଞାନମାର୍ଗ ପାଇଁ ପ୍ରସ୍ତୁତି', intro: 'ସତରଟି ପର୍ଯ୍ୟାୟର ଆବଶ୍ୟକ ଶବ୍ଦ ଓ ବିସ୍ତୃତ ପରିଭାଷା। ଏଠାରେ ପଢ଼ନ୍ତୁ କିମ୍ବା ସମ୍ପୂର୍ଣ୍ଣ PDF ଡାଉନଲୋଡ୍ କରନ୍ତୁ।', read: 'ଏଠାରେ ପଢ଼ନ୍ତୁ', download: 'PDF ଡାଉନଲୋଡ୍', original: 'ମୂଳ PDF ଖୋଲନ୍ତୁ', page: 'ପୃଷ୍ଠା', back: 'ପାଠ୍ୟକ୍ରମକୁ ଫେରନ୍ତୁ' },
};

export default async function GlossaryReader({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const requested = typeof params.lang === 'string' ? params.lang : undefined;
  const saved = (await cookies()).get('ns_lang')?.value;
  const locale: LocaleCode = isLocale(requested) ? requested : isLocale(saved) ? saved : 'hi';
  const copy = READER[locale];
  const ui = uiStrings(locale);
  const pdf = `/nirvan-sutra/glossary/${locale}.pdf`;
  const pages = Array.from({ length: PAGES[locale] }, (_, index) => index + 1);

  return (
    <div className={`ns-root ns-reader ${nsFontVars}`} lang={locale} data-script={localeInfo(locale).script} data-locale={locale}>
      <a className="ns-skip" href="#reader-main">{ui.skipToContent}</a>
      <header className="reader-top">
        <Link href={`/course?lang=${locale}`} className="reader-brand"><BrandMark /><span>{ui.brand}</span></Link>
        <Link href={`/course?lang=${locale}`} className="reader-back">← {copy.back}</Link>
      </header>
      <main id="reader-main" className="reader-wrap">
        <header className="reader-hero">
          <p className="reader-eyebrow">{copy.eyebrow} · NIRVAN SUTRA</p>
          <h1>{ui.glossaryTitle}</h1>
          <p className="reader-intro">{copy.intro}</p>
          <div className="reader-actions">
            <a href="#read" className="reader-button reader-button-primary">{copy.read} ↓</a>
            <a href={pdf} download={`Nirvan-Sutra-Glossary-${locale}.pdf`} className="reader-button">{copy.download} ↓</a>
          </div>
        </header>
        <nav className="reader-languages" aria-label={ui.language}>
          {LOCALES.map(({ code, native }) => (
            <Link key={code} href={`/course/glossary?lang=${code}`} hrefLang={code} lang={code} aria-current={code === locale ? 'page' : undefined} className={code === locale ? 'reader-language active' : 'reader-language'}>
              {native}
            </Link>
          ))}
        </nav>
        <div className="reader-toolbar"><span>{PAGES[locale]} {copy.page}</span><a href={pdf} target="_blank" rel="noopener noreferrer">{copy.original} ↗</a></div>
        <article id="read" className="reader-pages" aria-label={ui.glossaryTitle}>
          {pages.map((number) => (
            <figure key={number} className="reader-page">
              {/* The supplied PDFs use embedded Indic fonts that extract as broken Unicode.
                  Render their original pages so every word stays faithful to the source. */}
              <a href={`${pdf}#page=${number}`} target="_blank" rel="noopener noreferrer" aria-label={`${copy.original} — ${copy.page} ${number}`} className="reader-full-page">
                <Image unoptimized src={`/nirvan-sutra/glossary/${locale}/${String(number).padStart(2, '0')}.webp`} alt={`${ui.glossaryTitle} — ${copy.page} ${number}`} width={893} height={1263} loading={number < 3 ? 'eager' : 'lazy'} decoding="async" />
              </a>
              {number > 4 && (
                <div className="reader-mobile-columns" aria-hidden="true">
                  <div className="reader-half reader-half-left"><Image unoptimized src={`/nirvan-sutra/glossary/${locale}/${String(number).padStart(2, '0')}.webp`} alt="" width={893} height={1263} loading="lazy" decoding="async" /></div>
                  <div className="reader-half reader-half-right"><Image unoptimized src={`/nirvan-sutra/glossary/${locale}/${String(number).padStart(2, '0')}.webp`} alt="" width={893} height={1263} loading="lazy" decoding="async" /></div>
                </div>
              )}
              <figcaption>{copy.page} {number} / {PAGES[locale]}</figcaption>
            </figure>
          ))}
        </article>
        <footer className="reader-footer"><a href={pdf} download={`Nirvan-Sutra-Glossary-${locale}.pdf`} className="reader-button reader-button-primary">{copy.download} ↓</a><Link href={`/course?lang=${locale}`}>{copy.back} →</Link></footer>
      </main>
    </div>
  );
}
