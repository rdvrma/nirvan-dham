'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Language } from '@/lib/i18n';
import { getSavedLanguage, saveLanguage } from '@/lib/i18n';
import Header from '@/components/Header';
import ContactSection from '@/components/ContactSection';

// ── Design tokens ─────────────────────────────────
const GOLD = '#d4a843';
const GOLD_DIM = 'rgba(212,168,67,0.65)';
const GREEN_GLOW = 'rgba(26,92,53,0.32)';

// ── Bilingual copy ─────────────────────────────────
const copy = {
  hi: {
    eyebrow: 'आदिगुरु-तत्त्व की कृपा',
    heroTitle: 'इच्छा-पूर्ति',
    heroLead: 'अपनी इच्छा आदिगुरु-तत्त्व तक पहुँचाएँ — बाकी सब स्वयमेव हो जाता है।',
    heroDesc:
      'जब आपकी इच्छा आदिगुरु-तत्त्व से जुड़ती है, प्रक्रिया उसी क्षण प्रारम्भ हो जाती है।\nपहला और सबसे आवश्यक कदम है — उसे सत्य मन से लिख देना।',
    faqNote: 'दिशा, नियम और सभी सामान्य प्रश्नों हेतु नीचे FAQ अनुभाग देखें।',

    // Form
    formTitle: 'अपनी इच्छा सामर्पित करें',
    name: 'आपका नाम',
    namePh: 'उदाहरण — रोहित शर्मा',
    phone: 'सक्रिय नंबर (WhatsApp / Telegram)',
    phonePh: '+91 98765 43210',
    email: 'ईमेल',
    emailPh: 'example@gmail.com',
    sankalp: 'आप इच्छा-पूर्ति हेतु कौन-सा संकल्प करेंगे?',
    sankalpOpts: [
      { value: '', label: '— संकल्प चुनें —' },
      { value: 'bhojan-seva', label: '🍛 भोजन-सेवा' },
      { value: 'paudha-sthapana', label: '🌱 पौधा-स्थापना' },
      { value: 'sajha-satkarya', label: '🤝 साझा-सत्कार्य' },
      { value: 'nirvan-dham-sthapana', label: '🪔 आदिगुरु निर्वाण धाम स्थापना' },
      { value: 'daan', label: '🙏 दान' },
      { value: 'sabhi', label: '✨ सभी पाँच संकल्प' },
    ],
    sahmat: 'सहमति',
    sahmatOpts: [
      { value: '', label: '— सहमति दें —' },
      { value: 'yes', label: 'हाँ, मैं इस प्रक्रिया को पूर्ण श्रद्धा से करूँगा/करूँगी।' },
      { value: 'partial', label: 'हाँ, मैं यथासम्भव प्रयास करूँगा/करूँगी।' },
    ],
    ichchha: 'आपकी इच्छा',
    ichchhaPh: 'अपनी इच्छा विस्तार से लिखें... (जो भी मन में हो, सत्य भाव से)',
    captchaLabel: 'स्पैम-सुरक्षा',
    submit: 'मेरी इच्छा सामर्पित करें',
    submitting: 'सामर्पित हो रहा है...',
    successTitle: '🙏 आपकी इच्छा सामर्पित हो गई',
    successDesc: 'आदिगुरु-तत्त्व ने आपकी भावना को ग्रहण किया। संकल्प की दिशा में प्रयास आरम्भ करें।',
    errorMsg: 'कुछ त्रुटि हुई। पुनः प्रयास करें।',
    captchaError: 'गणना अशुद्ध है। पुनः जाँचें।',
    required: 'यह अनिवार्य है',

    // 5 Sankalps
    sankalpTitle: 'इच्छा-पूर्ति के पाँच संकल्प',
    sankalpDesc: 'इन पाँच सेवाओं में से एक या अधिक संकल्प लेकर अपनी इच्छा को आदिगुरु-तत्त्व से जोड़ें।',
    sankalps: [
      {
        icon: '🍛',
        title: 'भोजन-सेवा',
        desc: 'किसी भी भूखे व्यक्ति को गुरु-भाव से भोजन कराना — संकल्प के लिए सबसे श्रेष्ठ सेवा मानी जाती है।',
      },
      {
        icon: '🌱',
        title: 'पौधा-स्थापना',
        desc: 'घर में एक पौधा लाकर उसे गुरु-भाव से स्थापित करें — प्रतिदिन की सेवा संकल्प को स्थिर करती है।',
      },
      {
        icon: '🤝',
        title: 'साझा-सत्कार्य',
        desc: 'इच्छा-पूर्ति को परिवार, सत्सु या परिचितों में साझा करें। साझा करने से संकल्प की दिशा विस्तृत होती है।',
      },
      {
        icon: '🪔',
        title: 'आदिगुरु निर्वाण धाम स्थापना',
        desc: 'घर में आदिगुरु निर्वाण धाम (शिवलिंग) स्थापित कर नित्येश्वर स्तोत्र पढ़ें — साधना और श्रद्धा संकल्प को पुष्ट बनाते हैं।',
      },
      {
        icon: '🙏',
        title: 'दान',
        desc: 'दान अनिवार्य नहीं — यशसाशित किया गया दान संकल्प की पवित्रता और शुभ-फल की दिशा को सशक्त करता है।',
      },
    ],

    // FAQ
    faqTitle: 'अक्सर पूछे जाने वाले प्रश्न (FAQ)',
    faqs: [
      {
        q: 'गुरु-वंदना का इस प्रक्रिया में क्या स्थान है?',
        a: 'भारतीय परंपरा में कहा गया है —\n\nगुरुर्ब्रह्मा गुरुर्विष्णुः।\nगुन्देवो महेश्वरः।\nगुरू साक्षात् परं ब्रह्म।\nतस्मै श्रीगुरवे नमः।।\n\nइच्छा-पूर्ति से जुड़ा कोई भी कार्य गुरु-वंदना के बिना अपूर्ण माना जाता है। सेवा, दान, पौधारोपण या कोई भी संकल्प — जब गुरु-वंदना से प्रारम्भ होता है, तो उसका परिणाम अधिक स्पष्ट और शीघ्र होता है।',
      },
      {
        q: 'इच्छा-पूर्ति की प्रक्रिया वास्तव में कैसे कार्य करती है?',
        a: 'जब साधक अपनी इच्छा सत्य मन से लिखता है, उसी क्षण वह गुरु-तत्त्व से जुड़ जाती है। इसके पश्चात साधक द्वारा किए गए संकल्पात्मक कार्य उस इच्छा को गति प्रदान करते हैं। प्रयास साधक के होते हैं, और पूर्णता गुरु-तत्त्व की कृपा से मिलती है।',
      },
      {
        q: 'क्या इच्छा छोटी या बड़ी होने पर प्रक्रिया अलग होती है?',
        a: 'नहीं। इच्छा का आकार नहीं, भाव, निष्ठा और निरंतरता अधिक महत्त्वपूर्ण होती है। छोटी इच्छा में भी यदि साधक यथापूर्वक कार्य करता है, तो परिणाम अधिक शीघ्र आते हैं। बड़ी इच्छा में अधिक समर्पण और निरंतरता अपेक्षित होती है।',
      },
      {
        q: 'भोजन-सेवा करते समय किस बात का विशेष ध्यान रखना चाहिए?',
        a: 'भोजन-सेवा केवल भोजन कराना नहीं है। जिसे भोजन कराया जाए, उसे गुरु-भाव से असन पर बैठाकर, स्वयं को सेवक भाव में रखकर भोजन कराना चाहिए। यही भाव सेवा को प्रभावशाली बनाता है।',
      },
      {
        q: 'पौधा लगाना इच्छा-पूर्ति से कैसे जुड़ा है?',
        a: 'हर पौधा गुरु-तत्त्व के प्रकाश का प्रतीक माना जाता है। जब पौधा गुरु-भाव से स्थापित कर उसकी नित्यनिष्ठ सेवा की जाती है, तो वह संकल्प को निरंतरता और निश्चितता प्रदान करता है। निर्वाणधाम में कल्प-वृक्ष की परंपरा इसी भाव पर आधारित है।',
      },
      {
        q: 'क्या दान करना अनिवार्य है?',
        a: 'नहीं। दान अनिवार्य नहीं है, बल्कि ऐच्छिक है। दान का उद्देश्य सहायमता और शुभ-भाव होता है, न कि बाध्यता। यथाशक्ति दिया गया दान ही सार्थक माना जाता है।',
      },
      {
        q: 'क्या एक से अधिक संकल्प साथ में किए जा सकते हैं?',
        a: 'हाँ। परंतु यह आवश्यक है कि साधक हर संकल्प को स्वस्थता और पूर्ण भाव के साथ स्वीकार करे। अधूरा या अधूरे भाव से किया गया संकल्प प्रभावी नहीं होता।',
      },
      {
        q: 'इच्छा लिखने के बाद साधक को क्या करना चाहिए?',
        a: 'इच्छा लिखने के बाद साधक को चुने गए संकल्पों का नित्यनिष्ठ पालन करना चाहिए। धैर्य, श्रद्धा और निरंतरता — यही इस प्रक्रिया की वास्तविक कुंजी है।',
      },
      {
        q: 'यदि मैं सभी पाँच कार्य करता/करती हूँ, तो क्या इच्छा-पूर्ति शीघ्र होगी?',
        a: 'हाँ! जितनी अधिक सत्यता, निष्ठा और प्रयास आपकी ओर से होगा, उतनी ही त्वरिता से इच्छा-पूर्ति की प्रक्रिया सक्रिय होती है। सभी पाँच कार्य करना इच्छा-पूर्ति के लिए एक अत्यंत प्रभावी और संतुलित मार्ग है।',
      },
      {
        q: 'क्या सभी पाँच कार्य करना अनिवार्य है?',
        a: 'अनिवार्य नहीं, पर अत्यंत अनुशंसित है। सभी पाँच कार्य मिलकर साधक की भावना, कर्म और संकल्प को एक दिशा में संरेखित करते हैं, जिससे प्रक्रिया अधिक तीव्र और स्पष्ट होती है।',
      },
      {
        q: 'यदि मैं केवल एक या दो कार्य ही कर पाऊँ, तो क्या लाभ होगा?',
        a: 'निश्चित रूप से होगा। आप वही करें जो आप यथाशक्ति कर सकते हैं। हर सच्चा प्रयास इच्छा-पूर्ति की दिशा में योगदान देता है।',
      },
      {
        q: 'फिर भी सभी पाँच कार्य करने की सलाह क्यों दी जाती है?',
        a: 'क्योंकि पाँचों कार्य मिलकर सेवा, सहभागिता, संकल्प और निरंतरता को पूर्ण करते हैं। यह संयोजन साधक की तैयारी को व्यापक बनाता है और प्रक्रिया को सहजता व तेज़ी से गति करता है।',
      },
      {
        q: 'क्या दान करना सबसे महत्त्वपूर्ण कार्य है?',
        a: 'नहीं। दान ऐच्छिक है और कभी भी बाध्यकारी नहीं। सेवा-भाव, सहभागिता और निष्ठा — ये सभी समान रूप से महत्त्वपूर्ण हैं।',
      },
      {
        q: 'यदि मैं सभी पाँच कार्य करूँ, तो क्या यह मेरी इच्छा-पूर्ति की संभावना बढ़ाता है?',
        a: 'हाँ! सभी पाँच कार्य करने से साधक की सहभागिता पूर्ण होती है, जिससे इच्छा-पूर्ति की प्रक्रिया अधिक सक्रिय और त्वरित बनती है।',
      },
    ],
  },
  en: {
    eyebrow: 'Grace of the Aadi-Guru Tattva',
    heroTitle: 'Ichchha Poorti',
    heroLead: 'Offer your wish to the Aadi-Guru Tattva — all else unfolds by itself.',
    heroDesc:
      'When your wish connects with the Aadi-Guru Tattva, the process begins in that very moment.\nThe first and most essential step is — to write it with a truthful heart.',
    faqNote: 'For guidance, rules, and common questions, please see the FAQ section below.',

    formTitle: 'Submit Your Wish',
    name: 'Your Name',
    namePh: 'e.g. — Rohit Sharma',
    phone: 'Active Number (WhatsApp / Telegram)',
    phonePh: '+91 98765 43210',
    email: 'Email',
    emailPh: 'example@gmail.com',
    sankalp: 'Which Sankalp will you undertake for Ichchha Poorti?',
    sankalpOpts: [
      { value: '', label: '— Choose a Sankalp —' },
      { value: 'bhojan-seva', label: '🍛 Bhojan-Seva (Food Service)' },
      { value: 'paudha-sthapana', label: '🌱 Paudha-Sthapana (Plant a tree)' },
      { value: 'sajha-satkarya', label: '🤝 Sajha-Satkarya (Share the cause)' },
      { value: 'nirvan-dham-sthapana', label: '🪔 Nirvan Dham Sthapana (Establish at home)' },
      { value: 'daan', label: '🙏 Daan (Offering)' },
      { value: 'sabhi', label: '✨ All Five Sankalps' },
    ],
    sahmat: 'Consent',
    sahmatOpts: [
      { value: '', label: '— Give Consent —' },
      { value: 'yes', label: 'Yes, I will undertake this process with complete devotion.' },
      { value: 'partial', label: 'Yes, I will try to the best of my ability.' },
    ],
    ichchha: 'Your Wish (Ichchha)',
    ichchhaPh: 'Write your wish in detail... (in your own words, from a truthful place)',
    captchaLabel: 'Spam Protection',
    submit: 'Submit My Wish',
    submitting: 'Submitting...',
    successTitle: '🙏 Your wish has been offered',
    successDesc: 'The Aadi-Guru Tattva has received your intention. Now begin walking in the direction of your Sankalp.',
    errorMsg: 'Something went wrong. Please try again.',
    captchaError: 'Incorrect answer. Please check again.',
    required: 'This field is required',

    sankalpTitle: 'The Five Sankalps of Ichchha Poorti',
    sankalpDesc: 'Choose one or more of these five acts of service to connect your wish with the Aadi-Guru Tattva.',
    sankalps: [
      {
        icon: '🍛',
        title: 'Bhojan-Seva',
        desc: 'Feeding a hungry person with the attitude of Guru-Bhava — considered the most sacred service for a Sankalp.',
      },
      {
        icon: '🌱',
        title: 'Paudha-Sthapana',
        desc: 'Bring a plant home and establish it with Guru-Bhava — daily care of the plant stabilises the Sankalp.',
      },
      {
        icon: '🤝',
        title: 'Sajha-Satkarya',
        desc: 'Share Ichchha Poorti with family or friends. Sharing expands the direction of the Sankalp.',
      },
      {
        icon: '🪔',
        title: 'Nirvan Dham Sthapana',
        desc: 'Establish Aadisatv Nirvan Dham (Shivalinga) at home and recite the Nityeshvar Stotra daily — devotion strengthens the Sankalp.',
      },
      {
        icon: '🙏',
        title: 'Daan (Offering)',
        desc: 'Daan is not mandatory — an offering made with faith and a pure heart strengthens the Sankalp and its auspicious direction.',
      },
    ],

    faqTitle: 'Frequently Asked Questions (FAQ)',
    faqs: [
      {
        q: 'What is the role of Guru-Vandana in this process?',
        a: 'The Indian tradition says:\n\nGururbrahmā Gururvishnuh.\nGurdevo Maheshvarah.\nGuru Sakshat Param Brahma.\nTasmai Shri Gurave Namah.\n\nAny act connected with Ichchha Poorti is considered incomplete without Guru-Vandana. When service, daan, or any Sankalp begins with Guru-Vandana, its result is clearer and more swift.',
      },
      {
        q: 'How does the Ichchha Poorti process actually work?',
        a: "When a seeker writes their wish with a truthful heart, it connects with the Guru-Tattva in that very moment. The seeker's Sankalp-actions then give momentum to that wish. The effort belongs to the seeker, and fulfillment comes through the grace of the Guru-Tattva.",
      },
      {
        q: 'Does the process differ for a small or large wish?',
        a: 'No. The size of the wish does not matter — attitude, dedication, and consistency are more important. Even a small wish, pursued with complete sincerity, yields results more quickly. A larger wish requires deeper commitment and consistency.',
      },
      {
        q: 'What should be kept in mind while performing Bhojan-Seva?',
        a: 'Bhojan-Seva is not merely about feeding someone. The person being fed should be seated respectfully as a guest of the Guru, and one should serve in the attitude of a devoted sevak. This attitude is what makes the service powerful.',
      },
      {
        q: 'How is planting a tree related to Ichchha Poorti?',
        a: 'Every plant is considered a symbol of the Guru-Tattva. When a plant is established with Guru-Bhava and cared for daily with devotion, it lends continuity and certainty to the Sankalp. The Kalpa-Vriksha tradition at Nirvan Dham is rooted in this very principle.',
      },
      {
        q: 'Is Daan mandatory?',
        a: 'No. Daan is entirely voluntary. Its purpose is goodwill and auspicious direction — never compulsion. Whatever one offers according to their capacity is considered meaningful.',
      },
      {
        q: 'Can more than one Sankalp be undertaken simultaneously?',
        a: 'Yes. However, it is essential that each Sankalp be accepted with full awareness and wholehearted intention. A Sankalp undertaken half-heartedly or with divided attention does not produce its full effect.',
      },
      {
        q: 'What should the seeker do after submitting the wish?',
        a: "After writing the wish, the seeker must diligently observe the chosen Sankalps every day. Patience, devotion, and consistency — these are the true keys to this process.",
      },
      {
        q: 'If I do all five acts, will Ichchha Poorti happen faster?',
        a: 'Yes! The more sincerity, dedication, and effort from your side, the more swiftly the Ichchha Poorti process activates. Doing all five acts is an extremely effective and balanced path.',
      },
      {
        q: 'Is performing all five acts mandatory?',
        a: 'Not mandatory, but strongly recommended. All five acts together align the seeker\'s intention, action, and Sankalp in a single direction, making the process more powerful and clear.',
      },
      {
        q: 'What if I can only do one or two acts?',
        a: 'There will definitely be benefit. Do what you can, to the best of your ability. Every sincere effort contributes to the direction of Ichchha Poorti.',
      },
      {
        q: 'Then why is doing all five acts advised?',
        a: "Because all five together fulfil the dimensions of service, participation, Sankalp, and consistency. This combination makes the seeker's preparation comprehensive and accelerates the process.",
      },
      {
        q: 'Is Daan the most important act?',
        a: 'No. Daan is voluntary and never compulsory. Service, participation, and devotion are equally important.',
      },
      {
        q: 'If I do all five acts, does it increase the chances of Ichchha Poorti?',
        a: "Yes! Doing all five acts makes the seeker's participation complete, which makes the Ichchha Poorti process more active and swift.",
      },
    ],
  },
} as const;

// ── Spinning mandala ─────────────────────────────────
function Mandala({ size = 500, opacity = 0.06, duration = '120s', reverse = false, style = {} }: {
  size?: number; opacity?: number; duration?: string; reverse?: boolean; style?: React.CSSProperties;
}) {
  const c = size / 2;
  const rings = [0.46, 0.35, 0.25, 0.15].map(f => Math.round(c * f));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" aria-hidden
      style={{ pointerEvents: 'none', opacity, color: GOLD, animation: `${reverse ? 'mR' : 'mF'} ${duration} linear infinite`, ...style }}>
      <style>{`@keyframes mF{from{transform:rotate(0)}to{transform:rotate(360deg)}} @keyframes mR{from{transform:rotate(0)}to{transform:rotate(-360deg)}}`}</style>
      {rings.map((r, i) => (
        <circle key={r} cx={c} cy={c} r={r} stroke="currentColor" strokeWidth={i === 0 ? '1' : '0.5'} strokeDasharray={i % 2 ? '4 6' : undefined} />
      ))}
      {Array.from({ length: 12 }, (_, i) => i * 30).map(a => {
        const rad = a * Math.PI / 180;
        return <line key={a} x1={c + rings[3] * Math.cos(rad)} y1={c + rings[3] * Math.sin(rad)}
          x2={c + rings[0] * Math.cos(rad)} y2={c + rings[0] * Math.sin(rad)}
          stroke="currentColor" strokeWidth="0.4" />;
      })}
      <circle cx={c} cy={c} r={4} fill="currentColor" opacity="0.5" />
    </svg>
  );
}

// ── Field wrapper ─────────────────────────────────────
const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '0.85rem 1.1rem',
  background: 'rgba(8,15,10,0.65)', backdropFilter: 'blur(8px)',
  border: '1px solid rgba(212,168,67,0.2)', borderRadius: '8px',
  color: 'var(--c-ivory)', fontSize: '0.95rem', fontFamily: 'var(--font-hind)',
  outline: 'none', transition: 'border-color 0.25s',
};

// ── Main component ────────────────────────────────────
export default function IchchhaPoortiPage() {
  const [lang, setLang] = useState<Language>('hi');
  const [mounted, setMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Form state
  const [form, setForm] = useState({ name: '', phone: '', email: '', sankalp: '', sahmat: '', ichchha: '' });
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaNums, setCaptchaNums] = useState([12, 12]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, behavior: 'instant' });
    const timer = window.setTimeout(() => {
      const saved = getSavedLanguage();
      setLang(saved);
      setMounted(true);
      setCaptchaNums([Math.floor(Math.random() * 15) + 3, Math.floor(Math.random() * 15) + 3]);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function handleLangChange(next: Language) { setLang(next); saveLanguage(next); }

  const c = copy[mounted ? lang : 'hi'];
  const isHi = (mounted ? lang : 'hi') === 'hi';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Captcha check
    if (parseInt(captchaAnswer, 10) !== captchaNums[0] + captchaNums[1]) {
      setError(c.captchaError);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('https://formspree.io/f/xqeogwza', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...form,
          _subject: `[इच्छा-पूर्ति] ${form.name} — Nirvan Dham`,
          _source_page: 'Ichchha Poorti Page',
          _source_url: typeof window !== 'undefined' ? window.location.href : '/ichchha-poorti',
          _submitted_at: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          _language: lang,
        }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError(c.errorMsg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080f0a', color: 'var(--c-ivory)', overflowX: 'hidden', fontFamily: 'var(--font-hind)' }}>

      {/* ── Global background ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 80% 55% at 50% 0%, ${GREEN_GLOW}, transparent 65%),
            radial-gradient(ellipse 50% 40% at 85% 90%, rgba(61,138,88,0.12), transparent 60%),
            radial-gradient(ellipse 45% 35% at 15% 75%, rgba(212,168,67,0.07), transparent 60%)`,
        }} />
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.08,
          backgroundImage: `linear-gradient(rgba(212,168,67,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(212,168,67,.02) 1px,transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
          <Mandala size={900} opacity={0.04} duration="180s" />
        </div>
      </div>

      <Header lang={mounted ? lang : 'hi'} onLangChange={handleLangChange} />

      <main style={{ position: 'relative', zIndex: 2 }}>

        {/* ══ HERO ══ */}
        <section style={{ textAlign: 'center', padding: 'clamp(5rem,10vw,8rem) 1.5rem clamp(3rem,6vw,5rem)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-55%)' }}>
            <Mandala size={600} opacity={0.08} duration="90s" reverse />
          </div>
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '860px', margin: '0 auto' }}>
            <div style={{ fontSize: 'clamp(2.5rem,6vw,4.5rem)', marginBottom: '1.25rem', color: GOLD, filter: `drop-shadow(0 0 32px rgba(212,168,67,0.5))`, animation: 'floatIP 6s ease-in-out infinite' }}>
              🌸
            </div>
            <p style={{ fontSize: '0.62rem', letterSpacing: '0.28em', color: GOLD_DIM, textTransform: 'uppercase', marginBottom: '0.75rem' }}>{c.eyebrow}</p>
            <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(3.2rem,9vw,6.5rem)', lineHeight: 0.95, color: 'var(--c-ivory)', margin: '0 0 1.5rem' }}>
              {c.heroTitle}
            </h1>
            <p style={{ fontSize: 'clamp(1.1rem,2.2vw,1.35rem)', color: 'var(--c-ivory)', fontWeight: 500, lineHeight: 1.6, marginBottom: '1.25rem' }}>{c.heroLead}</p>
            <p style={{ color: 'var(--c-ivdim)', lineHeight: 1.9, fontSize: '1rem', marginBottom: '0.75rem', whiteSpace: 'pre-line' }}>{c.heroDesc}</p>
            <p style={{ fontSize: '0.85rem', color: GOLD_DIM, fontStyle: 'italic' }}>{c.faqNote}</p>
            <div style={{ width: '160px', height: '1px', background: `linear-gradient(90deg,transparent,${GOLD_DIM},transparent)`, margin: '2.5rem auto 0' }} />
          </div>
          <style>{`@keyframes floatIP{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}`}</style>
        </section>

        {/* ══ FORM ══ */}
        <section style={{ maxWidth: '760px', margin: '0 auto', padding: '0 1.5rem 5rem' }}>
          <div style={{
            borderRadius: '16px', overflow: 'hidden',
            border: '1px solid rgba(212,168,67,0.22)',
            background: 'rgba(10,22,12,0.75)', backdropFilter: 'blur(20px)',
            boxShadow: '0 32px 100px rgba(0,0,0,0.45), 0 0 60px rgba(26,92,53,0.18)',
          }}>
            <div style={{ height: '3px', background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
            <div style={{ padding: 'clamp(1.75rem,4vw,3rem)' }}>
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(1.8rem,4vw,2.5rem)', color: 'var(--c-ivory)', marginBottom: '2rem', textAlign: 'center' }}>
                🙏 {c.formTitle}
              </h2>

              {submitted ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
                  <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 300, color: 'var(--c-ivory)', marginBottom: '1rem' }}>{c.successTitle}</h3>
                  <p style={{ color: 'var(--c-ivdim)', lineHeight: 1.9, maxWidth: '480px', margin: '0 auto 2rem' }}>{c.successDesc}</p>
                  <button onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', email: '', sankalp: '', sahmat: '', ichchha: '' }); setCaptchaAnswer(''); setCaptchaNums([Math.floor(Math.random() * 15) + 3, Math.floor(Math.random() * 15) + 3]); }}
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: `1px solid ${GOLD}44`, background: `${GOLD}12`, color: GOLD, cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-hind)' }}>
                    {isHi ? 'एक और इच्छा सामर्पित करें' : 'Submit Another Wish'}
                  </button>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Row 1: Name + Phone */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="ip-2col">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: GOLD_DIM, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{c.name} *</label>
                      <input required style={fieldStyle} placeholder={c.namePh} value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        onFocus={e => (e.currentTarget.style.borderColor = `${GOLD}60`)}
                        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(212,168,67,0.2)')} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: GOLD_DIM, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{c.phone} *</label>
                      <input required type="tel" style={fieldStyle} placeholder={c.phonePh} value={form.phone}
                        onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        onFocus={e => (e.currentTarget.style.borderColor = `${GOLD}60`)}
                        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(212,168,67,0.2)')} />
                    </div>
                  </div>

                  {/* Row 2: Email + Sankalp */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="ip-2col">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: GOLD_DIM, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{c.email} *</label>
                      <input required type="email" style={fieldStyle} placeholder={c.emailPh} value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        onFocus={e => (e.currentTarget.style.borderColor = `${GOLD}60`)}
                        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(212,168,67,0.2)')} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: GOLD_DIM, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{c.sankalp} *</label>
                      <select required style={{ ...fieldStyle, cursor: 'pointer' }} value={form.sankalp}
                        onChange={e => setForm(p => ({ ...p, sankalp: e.target.value }))}
                        onFocus={e => (e.currentTarget.style.borderColor = `${GOLD}60`)}
                        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(212,168,67,0.2)')}>
                        {c.sankalpOpts.map(o => <option key={o.value} value={o.value} style={{ background: '#080f0a' }}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Sahmat */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: GOLD_DIM, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{c.sahmat} *</label>
                    <select required style={{ ...fieldStyle, cursor: 'pointer' }} value={form.sahmat}
                      onChange={e => setForm(p => ({ ...p, sahmat: e.target.value }))}
                      onFocus={e => (e.currentTarget.style.borderColor = `${GOLD}60`)}
                      onBlur={e => (e.currentTarget.style.borderColor = 'rgba(212,168,67,0.2)')}>
                      {c.sahmatOpts.map(o => <option key={o.value} value={o.value} style={{ background: '#080f0a' }}>{o.label}</option>)}
                    </select>
                  </div>

                  {/* Ichchha textarea */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: GOLD_DIM, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{c.ichchha} *</label>
                    <textarea required rows={5} style={{ ...fieldStyle, resize: 'vertical', minHeight: '130px' }} placeholder={c.ichchhaPh} value={form.ichchha}
                      onChange={e => setForm(p => ({ ...p, ichchha: e.target.value }))}
                      onFocus={e => (e.currentTarget.style.borderColor = `${GOLD}60`)}
                      onBlur={e => (e.currentTarget.style.borderColor = 'rgba(212,168,67,0.2)')} />
                  </div>

                  {/* Math captcha */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ fontSize: '0.75rem', color: GOLD_DIM, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{c.captchaLabel}:</label>
                    <span style={{ color: 'var(--c-ivory)', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                      {captchaNums[0]} + {captchaNums[1]} =
                    </span>
                    <input
                      type="number" required
                      style={{ ...fieldStyle, width: '90px', textAlign: 'center', flexShrink: 0 }}
                      value={captchaAnswer}
                      onChange={e => setCaptchaAnswer(e.target.value)}
                      placeholder="?"
                    />
                  </div>

                  {error && (
                    <p style={{ color: '#f87171', fontSize: '0.88rem', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '6px', padding: '0.75rem 1rem' }}>
                      ⚠ {error}
                    </p>
                  )}

                  <button type="submit" disabled={submitting} style={{
                    width: '100%', padding: '1rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 700,
                    border: `1.5px solid ${GOLD}55`,
                    background: submitting ? 'rgba(212,168,67,0.1)' : `linear-gradient(135deg, rgba(212,168,67,0.18), rgba(212,168,67,0.08))`,
                    color: GOLD, cursor: submitting ? 'default' : 'pointer',
                    letterSpacing: '0.06em', fontFamily: 'var(--font-hind)',
                    transition: 'all 0.3s', boxShadow: submitting ? 'none' : `0 8px 32px rgba(212,168,67,0.15)`,
                  }}>
                    {submitting ? `⏳ ${c.submitting}` : `🙏 ${c.submit}`}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ══ 5 SANKALPS ══ */}
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem 6rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.62rem', letterSpacing: '0.26em', color: GOLD_DIM, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              {isHi ? 'पाँच पवित्र मार्ग' : 'Five Sacred Paths'}
            </p>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(2rem,5vw,3.8rem)', color: 'var(--c-ivory)', marginBottom: '1rem' }}>
              {c.sankalpTitle}
            </h2>
            <p style={{ color: 'var(--c-ivdim)', maxWidth: '620px', margin: '0 auto', lineHeight: 1.9 }}>{c.sankalpDesc}</p>
            <div style={{ width: '120px', height: '1px', background: `linear-gradient(90deg,transparent,${GOLD_DIM},transparent)`, margin: '1.5rem auto 0' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '1.25rem' }} className="ip-sankalp-grid">
            {c.sankalps.map((s, i) => (
              <div key={i} style={{
                padding: 'clamp(1.5rem,3vw,2rem)', borderRadius: '12px',
                border: '1px solid rgba(212,168,67,0.16)',
                background: 'linear-gradient(145deg, rgba(13,31,16,0.82), rgba(8,15,10,0.75))',
                backdropFilter: 'blur(12px)',
                transition: 'transform 0.3s, border-color 0.3s, box-shadow 0.3s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,67,0.36)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 50px rgba(0,0,0,0.3)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,67,0.16)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem', filter: `drop-shadow(0 0 12px rgba(212,168,67,0.4))` }}>{s.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', color: GOLD, marginBottom: '0.75rem', lineHeight: 1.1 }}>
                  {s.title}
                </h3>
                <p style={{ color: 'var(--c-ivdim)', lineHeight: 1.85, fontSize: '0.92rem' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ FAQ ══ */}
        <section style={{ maxWidth: '860px', margin: '0 auto', padding: '0 1.5rem 8rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(2rem,5vw,3.5rem)', color: 'var(--c-ivory)', marginBottom: '0.5rem' }}>
              {c.faqTitle}
            </h2>
            <div style={{ width: '120px', height: '1px', background: `linear-gradient(90deg,transparent,${GOLD_DIM},transparent)`, margin: '1.25rem auto 0' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {c.faqs.map((faq, i) => (
              <div key={i} style={{
                borderRadius: '10px', overflow: 'hidden',
                border: `1px solid ${openFaq === i ? 'rgba(212,168,67,0.35)' : 'rgba(212,168,67,0.14)'}`,
                background: openFaq === i ? 'rgba(13,31,16,0.85)' : 'rgba(10,20,12,0.55)',
                backdropFilter: 'blur(12px)', transition: 'all 0.3s ease',
                boxShadow: openFaq === i ? '0 8px 30px rgba(0,0,0,0.25)' : 'none',
              }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                  padding: '1.25rem 1.5rem', background: 'transparent', border: 'none', cursor: 'pointer',
                  textAlign: 'left', color: 'var(--c-ivory)', fontFamily: 'var(--font-hind)',
                }}>
                  <span style={{ fontWeight: 600, fontSize: 'clamp(0.9rem,1.5vw,1.02rem)', lineHeight: 1.4, flex: 1 }}>
                    <span style={{ color: GOLD_DIM, marginRight: '0.5rem', fontVariantNumeric: 'tabular-nums' }}>{String(i + 1).padStart(2, '0')}.</span>
                    {faq.q}
                  </span>
                  <span style={{
                    flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%',
                    border: `1px solid ${GOLD}40`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', color: GOLD, transition: 'transform 0.3s',
                    transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)',
                  }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid rgba(212,168,67,0.12)' }}>
                    <p style={{ color: 'var(--c-ivdim)', lineHeight: 2, fontSize: '0.95rem', marginTop: '1rem', whiteSpace: 'pre-line' }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ══ Samvad CTA ══ */}
        <section style={{
          maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem 6rem', textAlign: 'center',
        }}>
          <div style={{
            padding: 'clamp(2rem,5vw,3.5rem)', borderRadius: '16px',
            border: '1px solid rgba(212,168,67,0.22)',
            background: 'rgba(8,15,10,0.6)', backdropFilter: 'blur(16px)',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🌸</div>
            <h3 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', color: 'var(--c-ivory)', marginBottom: '0.75rem' }}>
              {isHi ? 'व्यक्तिगत मार्गदर्शन के लिए' : 'For Personal Guidance'}
            </h3>
            <p style={{ color: 'var(--c-ivdim)', lineHeight: 1.9, marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
              {isHi
                ? 'यदि आप इस प्रक्रिया के बारे में अधिक जानना चाहते हैं या आदिसत्व से सीधे संवाद करना चाहते हैं:'
                : 'If you would like to know more about this process or connect directly with Aadisatv:'}
            </p>
            <Link href="/samvad/online" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.9rem 2rem', borderRadius: '8px',
              border: `1px solid ${GOLD}45`, background: `${GOLD}12`,
              color: GOLD, fontWeight: 700, fontSize: '0.92rem',
              textDecoration: 'none', letterSpacing: '0.06em',
            }}>
              💬 {isHi ? 'ऑनलाइन संवाद करें →' : 'Online Samvad →'}
            </Link>
          </div>
        </section>
      </main>

      <ContactSection lang={mounted ? lang : 'hi'} />

      <style>{`
        @media (max-width: 640px) {
          .ip-2col { grid-template-columns: 1fr !important; }
          .ip-sankalp-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) {
          .ip-sankalp-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
        }
      `}</style>
    </div>
  );
}
