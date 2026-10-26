'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { saveLanguage, type Language } from '@/lib/i18n';
import { indiaDateToday } from '@/lib/bodhgaya-samvad/slots';
import styles from './samvad-experience.module.css';
import slotStyles from './samvad-slots.module.css';

const words = {
  en: {
    nav: ['The Samvad', 'Explore the work', 'How it works'],
    eyebrow: 'BODHGAYA SAMVAD · PRIVATE IN-PERSON DIALOGUE',
    title: <>Meet Aadisatv.<br /><em>In Bodhgaya.</em></>,
    intro: 'Meet Aadisatv where the Buddha awakened, and let the grace of a teacher guide you beyond ignorance.',
    request: 'Request a private meeting', explore: 'Explore Aadisatv’s work', discover: 'Discover the meeting',
    facts: ['Bodhgaya, India', 'English & Hindi', 'By prior request'],
    whatEyebrow: '01 / THE MEETING', whatTitle: 'A conversation rooted in your question.',
    whatText: 'Bodhgaya Samvad is a private, in-person dialogue with Aadisatv. You can bring a question about the self, awareness, non-duality, meditation, suffering, identity or truth. There is no promise of a particular outcome—only room to look honestly together.',
    fitEyebrow: 'WHO THIS IS FOR', fitTitle: 'For a question that asks for more than an answer.',
    fitText: 'This may be meaningful if you have explored these questions on your own and feel that a direct conversation could help you examine them more deeply. No prior knowledge of Advaita is required.',
    workEyebrow: '02 / BEFORE WE MEET', workTitle: 'Let the work speak first.',
    workText: 'Read, listen and decide whether this conversation belongs to your own inquiry.',
    books: 'Selected books', library: 'Explore the Digital Library',
    teaching: 'Public teachings', channels: [
      ['Aadisatv', 'Structured self-inquiry, Nirvan Sutra and Gyanmarg teachings', 'https://www.youtube.com/@Aadisatv'],
      ['The Oneness Project', 'English and international non-duality reflections', 'https://www.youtube.com/@TheOnenessProject'],
      ['Nirvan Dham', 'Vedanta, scripture and broader spiritual teachings', 'https://www.youtube.com/@dhamnirvan'],
    ],
    public: 'Explore Aadisatv’s public presence', google: 'Search Aadisatv on Google',
    questionEyebrow: '03 / THE QUESTION', questionTitle: 'Bring one question that truly matters.',
    questionText: 'You do not need the perfect words in advance. Bring what remains unresolved for you into the conversation.',
    stepsEyebrow: '04 / THE PATH', stepsTitle: 'A thoughtful path to meeting.',
    steps: [
      ['Choose', 'Pick a date and one available two-hour slot between 7 AM and 5 PM.'],
      ['Book', 'Send your details. The slot is booked immediately and Nirvan Dham receives them by email.'],
      ['Continue', 'The existing Razorpay page opens next. Payment is optional; your time stays booked either way.'],
      ['Remember', 'Keep your private booking link and reference.'],
      ['Meet', 'Meeting details are shared privately.'],
    ],
    formEyebrow: '05 / REQUEST A PRIVATE MEETING', formTitle: 'Choose your time.',
    formText: 'Choose a date and an available two-hour time. Submitting books your slot and emails the details to Nirvan Dham. Payment is not required to keep the booking.',
    fields: ['Full name', 'Email', 'WhatsApp / phone', 'Country', 'Preferred language', 'Meeting date', 'Meeting format'],
    formats: ['Individual', 'Couple / two seekers', 'Small group'],
    submit: 'Book this time', sending: 'Booking your time…',
    received: 'SLOT BOOKED', thank: 'Your time is booked.',
    reference: 'Booking reference',
    error: 'The booking or notification email could not be completed. Your details remain here; please retry with the same form.',
    practicalEyebrow: '06 / PRACTICAL DETAILS', practicalTitle: 'A little clarity before you travel.',
    practical: 'Meetings take place in Bodhgaya in the chosen two-hour slot. The exact location is shared privately. English and Hindi are available.',
    policyTitle: 'Reservation & changes',
    policy: 'Submitting the form books the selected time, whether or not you pay. The existing Razorpay page offers a separate ₹2,500 contribution. If you need to change your booking, contact Nirvan Dham; a different time depends on availability.',
    faqTitle: 'A few useful questions',
    faq: [
      ['Is this a group satsang?', 'This request is primarily for a private or small-format Samvad.'],
      ['Do I need prior knowledge of Advaita?', 'No. A sincere question is enough.'],
      ['What if I have not paid yet?', 'Your selected time is already booked after submitting the form. It remains booked if you do not pay.'],
      ['Is ₹2,500 a donation?', 'No. This contribution is separate from voluntary donations to Nirvan Dham.'],
      ['Where is the meeting?', 'In Bodhgaya. The exact location is shared privately.'],
      ['Which languages are available?', 'English and Hindi.'],
    ],
    finalTitle: 'When the question is ready, begin here.', footer: 'A quiet place for honest inquiry.',
  },
  hi: {
    nav: ['संवाद', 'सार्वजनिक कार्य', 'प्रक्रिया'],
    eyebrow: 'बोधगया संवाद · प्रत्यक्ष निजी संवाद',
    title: <>आदिसत्व से मिलें।<br /><em>बोधगया में।</em></>,
    intro: 'जहाँ बुद्ध को ज्ञान मिला, वहाँ आदिसत्व से मिलिए और गुरु-कृपा की छाँव में स्वयं को अज्ञान से मुक्त कीजिए।',
    request: 'निजी मुलाकात का अनुरोध करें', explore: 'आदिसत्व का कार्य देखें', discover: 'मुलाकात को जानें',
    facts: ['बोधगया, भारत', 'हिंदी और अंग्रेज़ी', 'पूर्व अनुरोध से'],
    whatEyebrow: '०१ / मुलाकात', whatTitle: 'संवाद आपके प्रश्न से आरंभ होता है।',
    whatText: 'बोधगया संवाद आदिसत्व के साथ एक निजी, प्रत्यक्ष बातचीत है। आप स्वयं, जागरूकता, अद्वैत, ध्यान, दुःख, पहचान या सत्य से जुड़ा प्रश्न ला सकते हैं। किसी निश्चित परिणाम का वादा नहीं—बस साथ ईमानदारी से देखने का स्थान।',
    fitEyebrow: 'किसके लिए', fitTitle: 'उस प्रश्न के लिए जो भीतर बना हुआ है।',
    fitText: 'यदि आप स्वयं इन विषयों पर विचार कर रहे हैं और प्रत्यक्ष संवाद से प्रश्न को और गहराई से देखना चाहते हैं, तो यह मुलाकात आपके लिए सार्थक हो सकती है। अद्वैत का पहले से ज्ञान आवश्यक नहीं है।',
    workEyebrow: '०२ / मिलने से पहले', workTitle: 'पहले उनके कार्य को जानें।',
    workText: 'पढ़ें, सुनें और स्वयं तय करें कि यह संवाद आपकी खोज से जुड़ता है या नहीं।',
    books: 'चुनी हुई पुस्तकें', library: 'डिजिटल पुस्तकालय देखें',
    teaching: 'सार्वजनिक शिक्षाएँ', channels: [
      ['आदिसत्व', 'आत्म-विचार, निर्वाण सूत्र और ज्ञानमार्ग की क्रमबद्ध शिक्षाएँ', 'https://www.youtube.com/@Aadisatv'],
      ['द ओननेस प्रोजेक्ट', 'अंग्रेज़ी में अद्वैत और अंतरराष्ट्रीय साधकों के लिए विचार', 'https://www.youtube.com/@TheOnenessProject'],
      ['निर्वाण धाम', 'वेदांत, शास्त्र और व्यापक आध्यात्मिक शिक्षाएँ', 'https://www.youtube.com/@dhamnirvan'],
    ],
    public: 'आदिसत्व की सार्वजनिक उपस्थिति देखें', google: 'Google पर आदिसत्व खोजें',
    questionEyebrow: '०३ / प्रश्न', questionTitle: 'एक ऐसा प्रश्न लेकर आइए जो सच में महत्त्वपूर्ण है।',
    questionText: 'पहले से बिल्कुल सही शब्द होना आवश्यक नहीं। जो अस्पष्ट है, उसे संवाद में लेकर आइए।',
    stepsEyebrow: '०४ / आगे का मार्ग', stepsTitle: 'मुलाकात तक एक विचारपूर्ण प्रक्रिया।',
    steps: [
      ['चुनें', 'सुबह 7 से शाम 5 बजे के बीच उपलब्ध दो घंटे का समय चुनें।'],
      ['बुक करें', 'अपना विवरण भेजें। समय तुरंत बुक होगा और निर्वाण धाम को ईमेल से जानकारी मिलेगी।'],
      ['आगे बढ़ें', 'इसके बाद मौजूदा Razorpay पेज खुलेगा। भुगतान करें या न करें, आपका समय बुक रहेगा।'],
      ['याद रखें', 'अपना निजी बुकिंग लिंक और संदर्भ सुरक्षित रखें।'],
      ['मिलें', 'मुलाकात का स्थान और विवरण निजी रूप से साझा होंगे।'],
    ],
    formEyebrow: '०५ / निजी मुलाकात', formTitle: 'अपना समय चुनें।',
    formText: 'तिथि और उपलब्ध दो घंटे का समय चुनें। फ़ॉर्म भेजते ही स्लॉट बुक होगा और विवरण निर्वाण धाम को ईमेल से मिलेगा। बुकिंग के लिए भुगतान ज़रूरी नहीं है।',
    fields: ['पूरा नाम', 'ईमेल', 'WhatsApp / फ़ोन', 'देश', 'बातचीत की भाषा', 'मुलाकात की तिथि', 'मुलाकात का स्वरूप'],
    formats: ['व्यक्तिगत', 'दो साधक', 'छोटा समूह'],
    submit: 'यह समय बुक करें', sending: 'समय बुक हो रहा है…',
    received: 'स्लॉट बुक हो गया', thank: 'आपका समय बुक हो गया है।',
    reference: 'बुकिंग संदर्भ',
    error: 'बुकिंग या सूचना ईमेल पूरी नहीं हो सकी। आपकी जानकारी यहीं है; कृपया इसी फ़ॉर्म से फिर प्रयास करें।',
    practicalEyebrow: '०६ / व्यावहारिक जानकारी', practicalTitle: 'आने से पहले कुछ स्पष्ट बातें।',
    practical: 'मुलाकात बोधगया में चुने हुए दो घंटे के समय पर होगी। सटीक स्थान निजी रूप से बताया जाएगा। हिंदी और अंग्रेज़ी उपलब्ध हैं।',
    policyTitle: 'आरक्षण और बदलाव',
    policy: 'फ़ॉर्म भेजते ही चुना हुआ समय बुक हो जाता है, भुगतान करें या न करें। मौजूदा Razorpay पेज पर ₹2,500 का अलग योगदान दिया जा सकता है। बुकिंग बदलनी हो तो निर्वाण धाम से संपर्क करें; दूसरा समय उपलब्धता के अनुसार मिलेगा।',
    faqTitle: 'कुछ उपयोगी प्रश्न',
    faq: [
      ['क्या यह सामूहिक सत्संग है?', 'यह अनुरोध मुख्यतः निजी या छोटे स्वरूप के संवाद के लिए है।'],
      ['क्या अद्वैत का पूर्व ज्ञान चाहिए?', 'नहीं। एक सच्चे प्रश्न से शुरुआत हो सकती है।'],
      ['अभी भुगतान न किया हो तो?', 'फ़ॉर्म भेजते ही आपका चुना हुआ समय बुक हो जाता है। भुगतान न करने पर भी बुक रहेगा।'],
      ['क्या ₹2,500 दान है?', 'नहीं। यह योगदान निर्वाण धाम के स्वैच्छिक दान से अलग है।'],
      ['मुलाकात कहाँ होगी?', 'बोधगया में। सटीक स्थान निजी रूप से बताया जाएगा।'],
      ['कौन-सी भाषाएँ उपलब्ध हैं?', 'हिंदी और अंग्रेज़ी।'],
    ],
    finalTitle: 'जब प्रश्न तैयार हो, यहीं से शुरुआत करें।', footer: 'ईमानदार आत्म-विचार के लिए शांत स्थान।',
  },
} as const;

const books = [
  { en: 'The Seeker Is the Illusion', hi: 'The Seeker Is the Illusion', cover: '/library/covers/the-seeker-is-the-illusion.png', slug: 'the-seeker-is-the-illusion' },
  { en: 'Maya and Mind', hi: 'माया और मन', cover: '/library/covers/maya-and-mind.png', slug: 'maya-and-mind' },
  { en: 'Who Is God?', hi: 'Who Is God?', cover: '/library/covers/who-is-god.png', slug: 'who-is-god' },
];

type SubmitState = 'idle' | 'sending' | 'success' | 'error';
type AvailableSlot = { time: string; label: string; available: boolean };

export default function SamvadExperience({ initialLanguage }: { initialLanguage: Language }) {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [state, setState] = useState<SubmitState>('idle');
  const [reference, setReference] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [slotError, setSlotError] = useState(false);
  const [requestUrl, setRequestUrl] = useState('');
  const inFlight = useRef(false);
  const submissionId = useRef<string | null>(null);
  const c = words[lang];

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  useEffect(() => {
    if (!bookingDate) return;
    const abort = new AbortController();
    fetch(`/api/bodhgaya-samvad/slots?date=${encodeURIComponent(bookingDate)}`, { signal: abort.signal, cache: 'no-store' })
      .then(async (response) => { if (!response.ok) throw new Error('availability'); return response.json(); })
      .then((result) => setSlots(result.slots))
      .catch(() => { if (!abort.signal.aborted) setSlotError(true); })
      .finally(() => { if (!abort.signal.aborted) setSlotLoading(false); });
    return () => abort.abort();
  }, [bookingDate]);

  function changeLanguage(next: Language) {
    setLang(next);
    saveLanguage(next);
    const url = new URL(window.location.href);
    url.searchParams.set('lang', next);
    window.history.replaceState(null, '', url);
  }

  function changeBookingDate(date: string) {
    setBookingDate(date);
    setBookingTime('');
    setSlots([]);
    setSlotError(false);
    setSlotLoading(Boolean(date));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    if (String(fields.get('website') ?? '').trim()) return;
    const payload = Object.fromEntries(fields.entries());
    submissionId.current ??= crypto.randomUUID();
    inFlight.current = true;
    setState('sending');
    try {
      const response = await fetch('/api/bodhgaya-samvad/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, pageLanguage: lang, submissionId: submissionId.current }),
      });
      const result = await response.json();
      if (!response.ok || !result.reference || !result.paymentUrl) throw new Error('Request not saved');
      setReference(result.reference);
      setRequestUrl(result.requestUrl);
      setState('success');
      submissionId.current = null;
      window.location.assign(result.paymentUrl);
    } catch {
      setState('error');
    } finally {
      inFlight.current = false;
    }
  }

  return <div className={styles.page} lang={lang}>
    <a className={styles.skip} href="#main">{lang === 'hi' ? 'मुख्य सामग्री पर जाएँ' : 'Skip to content'}</a>
    <header className={styles.header}>
      <Link href="/" className={styles.brand}><Image src="/brand/nirvan-dham-logo.png" alt="" width={42} height={42} /> <span>{lang === 'hi' ? 'निर्वाण धाम' : 'Nirvan Dham'}<small>NIRVANDHAM.IN</small></span></Link>
      <nav aria-label="Page navigation"><a href="#the-samvad">{c.nav[0]}</a><a href="#explore">{c.nav[1]}</a><a href="#journey">{c.nav[2]}</a></nav>
      <div className={styles.headerRight}><div className={styles.language} aria-label="Language"><button type="button" aria-pressed={lang === 'en'} onClick={() => changeLanguage('en')}>EN</button><span>/</span><button type="button" aria-pressed={lang === 'hi'} onClick={() => changeLanguage('hi')}>हिंदी</button></div><a className={styles.headerCta} href="#request">{c.request} ↗</a></div>
    </header>
    <main id="main">
      <section className={styles.hero}>
        <div className={styles.heroCopy}><p className={styles.eyebrow}>{c.eyebrow}</p><h1>{c.title}</h1><p className={styles.heroIntro}>{c.intro}</p><div className={styles.actions}><a className={styles.primary} href="#request">{c.request} <span>↗</span></a><a className={styles.textLink} href="#explore">{c.explore} <span>↗</span></a></div><p className={styles.heroFoot}>{c.facts.join(' · ')}</p></div>
        <div className={styles.heroImage}><Image src="/images/bodhgaya-samvad/aadisatv-real-portrait.webp" alt={lang === 'hi' ? 'आदिसत्व का वास्तविक चित्र' : 'Portrait of Aadisatv'} fill priority sizes="(max-width: 800px) 100vw, 50vw" /><span>AADISATV · BODHGAYA SAMVAD</span></div>
      </section>
      <section id="the-samvad" className={styles.introSection}><div><p className={styles.eyebrow}>{c.whatEyebrow}</p><h2>{c.whatTitle}</h2></div><div><p>{c.whatText}</p><div className={styles.fit}><span>{c.fitEyebrow}</span><h3>{c.fitTitle}</h3><p>{c.fitText}</p></div></div></section>
      <section id="explore" className={styles.work}><div className={styles.sectionHead}><p className={styles.eyebrow}>{c.workEyebrow}</p><h2>{c.workTitle}</h2><p>{c.workText}</p></div><div className={styles.workLayout}><div><div className={styles.smallHead}><span>{c.books}</span><Link href="/library">{c.library} ↗</Link></div><div className={styles.books}>{books.map((book) => <Link key={book.slug} href={`/library/${book.slug}`} className={styles.book}><span><Image src={book.cover} alt={book[lang]} fill sizes="(max-width: 600px) 26vw, 150px" /></span><strong>{book[lang]}</strong></Link>)}</div></div><div className={styles.channels}><span className={styles.smallLabel}>{c.teaching}</span>{c.channels.map(([name, description, url]) => <a href={url} key={url} target="_blank" rel="noopener noreferrer"><span><strong>{name}</strong><small>{description}</small></span><b>↗</b></a>)}<a href="https://www.google.com/search?q=Aadisatv" target="_blank" rel="noopener noreferrer"><span><strong>{c.public}</strong><small>{c.google}</small></span><b>↗</b></a></div></div></section>
      <section className={styles.question}><p className={styles.eyebrow}>{c.questionEyebrow}</p><h2>{c.questionTitle}</h2><p>{c.questionText}</p><Image src="/aadisatv/portrait.jpg" alt="Aadisatv" width={180} height={180} /></section>
      <section id="journey" className={styles.journey}><div className={styles.sectionHead}><p className={styles.eyebrow}>{c.stepsEyebrow}</p><h2>{c.stepsTitle}</h2></div><ol>{c.steps.map(([name, description], i) => <li key={name}><span>{String(i + 1).padStart(2, '0')}</span><div><h3>{name}</h3><p>{description}</p></div></li>)}</ol></section>
      <section id="request" className={styles.request}>
        <div className={styles.requestCopy}><p className={styles.eyebrow}>{c.formEyebrow}</p><h2>{c.formTitle}</h2><p>{c.formText}</p><div className={styles.requestQuote}>“{c.questionTitle}”</div></div>
        {state === 'success' ? <div className={styles.received} role="status"><span>✓ {c.received}</span><h3>{c.thank}</h3><p>{lang === 'hi' ? 'निर्वाण धाम को विवरण ईमेल से भेज दिया गया है। Razorpay पेज खुलेगा; भुगतान न करने पर भी स्लॉट बुक रहेगा।' : 'The details have been emailed to Nirvan Dham. The Razorpay page will open; your slot stays booked even without payment.'}</p><p>{c.reference}: <strong>{reference}</strong></p><a className={styles.primary} href={requestUrl}>{lang === 'hi' ? 'अपनी बुकिंग देखें' : 'View my reservation'} ↗</a></div>
        : <form onSubmit={submit} className={styles.form} aria-busy={state === 'sending'}>
          <div className={styles.grid}>
            <label>{c.fields[0]} <input name="name" required minLength={2} maxLength={120} autoComplete="name" /></label>
            <label>{c.fields[1]} <input name="email" type="email" required maxLength={180} autoComplete="email" /></label>
            <label>{c.fields[2]} <input name="phone" type="tel" required maxLength={40} autoComplete="tel" /></label>
            <label>{c.fields[3]} <input name="country" required maxLength={100} autoComplete="country-name" /></label>
            <label>{c.fields[4]} <select name="preferredLanguage" required defaultValue=""><option value="" disabled>—</option><option value="English">English</option><option value="Hindi">हिंदी</option></select></label>
            <label>{c.fields[5]} <input name="bookingDate" type="date" required min={indiaDateToday()} value={bookingDate} onChange={(event) => changeBookingDate(event.target.value)} /></label>
            <fieldset className={slotStyles.slotField}>
              <legend>{lang === 'hi' ? 'उपलब्ध समय चुनें · भारतीय समय' : 'Choose an available time · India time'}</legend>
              <p>{lang === 'hi' ? 'हर मुलाकात 2 घंटे की है; अगली मुलाकात से पहले 15 मिनट का अंतर है।' : 'Each meeting lasts 2 hours, with 15 minutes between meetings.'}</p>
              {slotLoading && <p role="status">{lang === 'hi' ? 'उपलब्धता देख रहे हैं…' : 'Checking availability…'}</p>}
              {slotError && <p className={styles.error} role="alert">{lang === 'hi' ? 'समय नहीं मिल पाए। फिर प्रयास करें।' : 'Availability could not load. Please retry.'}</p>}
              {bookingDate && !slotLoading && !slotError && <div className={slotStyles.slotGrid}>{slots.map((slot) => <label key={slot.time} className={slot.available ? slotStyles.slotAvailable : slotStyles.slotBooked}>
                <input type="radio" name="bookingTime" value={slot.time} checked={bookingTime === slot.time} onChange={() => setBookingTime(slot.time)} disabled={!slot.available} required />
                <strong>{slot.label}</strong><span>{slot.available ? (lang === 'hi' ? 'उपलब्ध' : 'Available') : (lang === 'hi' ? 'बुक हो चुका' : 'Booked')}</span>
              </label>)}</div>}
            </fieldset>
            <label className={styles.full}>{c.fields[6]} <select name="meetingType" required defaultValue=""><option value="" disabled>—</option>{c.formats.map((name, i) => <option value={['individual', 'couple', 'small_group'][i]} key={name}>{name}</option>)}</select></label>
          </div>
          <p className={slotStyles.formNotice}>{lang === 'hi' ? 'फ़ॉर्म भेजते ही स्लॉट बुक होगा और विवरण निर्वाण धाम को ईमेल से जाएगा। फिर मौजूदा Razorpay पेज खुलेगा; भुगतान न करने पर भी स्लॉट बुक रहेगा।' : 'Submitting books the slot and emails Nirvan Dham. The existing Razorpay page then opens; your slot remains booked even if you do not pay.'}</p>
          <div className={styles.honeypot} aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          {state === 'error' && <p className={styles.error} role="alert">{c.error}</p>}
          <button type="submit" className={styles.primary} disabled={state === 'sending' || !bookingTime}>{state === 'sending' ? c.sending : c.submit} <span>↗</span></button>
        </form>}
      </section>
      <section className={styles.practical}><div><p className={styles.eyebrow}>{c.practicalEyebrow}</p><h2>{c.practicalTitle}</h2><p>{c.practical}</p></div><div><h3>{c.policyTitle}</h3><p>{c.policy}</p></div></section>
      <section className={styles.faq}><h2>{c.faqTitle}</h2><div>{c.faq.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section>
      <section className={styles.final}><h2>{c.finalTitle}</h2><a className={styles.primary} href="#request">{c.request} ↗</a></section>
    </main><footer className={styles.footer}><Link href="/">{lang === 'hi' ? 'निर्वाण धाम' : 'Nirvan Dham'}</Link><p>{c.footer}</p><Link href="/library">{c.library}</Link></footer><div className={styles.mobileCta}><a href="#request">{c.request} ↗</a></div>
  </div>;
}
