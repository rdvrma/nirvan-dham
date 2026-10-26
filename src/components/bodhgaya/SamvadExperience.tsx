'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { saveLanguage, type Language } from '@/lib/i18n';
import { photoUrl } from './content';
import styles from './samvad-experience.module.css';

const words = {
  en: {
    nav: ['The Samvad', 'Explore the work', 'How it works'],
    eyebrow: 'BODHGAYA SAMVAD · PRIVATE IN-PERSON DIALOGUE',
    title: <>Meet Aadisatv.<br /><em>In Bodhgaya.</em></>,
    intro: 'Bring the question that truly matters to you. A private space for sincere dialogue, self-inquiry and silence in Bodhgaya.',
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
    questionText: 'You do not need the perfect words. Tell us what remains unresolved for you, and why speaking in person feels important.',
    stepsEyebrow: '04 / THE PATH', stepsTitle: 'A thoughtful path to meeting.',
    steps: [
      ['Request', 'Share your question and travel dates. There is no payment at this step.'],
      ['Review', 'We read the request and respond according to availability. Submission is not a booking.'],
      ['Time', 'If accepted, we arrange a genuine available time with you.'],
      ['Contribution', 'An accepted private reservation requires a ₹2,500 commitment contribution, separate from any voluntary donation.'],
      ['Meet', 'Only a verified payment and agreed time complete the booking; details are then shared privately.'],
    ],
    formEyebrow: '05 / REQUEST A PRIVATE MEETING', formTitle: 'Begin with your question.',
    formText: 'Tell us what matters to you. Requests are reviewed personally; no time is reserved by submitting this form.',
    fields: ['Full name', 'Email', 'WhatsApp / phone', 'Country', 'Preferred language', 'When will you be in Bodhgaya?', 'Meeting format', 'If you could bring only one question to Aadisatv, what would it be?', 'Why would you like to explore this question in person?', 'Anything useful for Aadisatv to know?'],
    formats: ['Individual', 'Couple / two seekers', 'Small group'],
    datesHint: 'Dates or an approximate window; no availability is promised',
    noteHint: 'Optional. Please avoid sharing sensitive medical information.',
    check1: 'I understand this request does not automatically confirm a meeting.',
    check2: 'I understand an accepted private reservation requires a ₹2,500 commitment contribution.',
    check3: 'Nirvan Dham may contact me about this request by email or phone.',
    optional: 'Optional', submit: 'Send my request', sending: 'Sending your request…',
    received: 'REQUEST RECEIVED', thank: 'Thank you. Your request has been received.',
    after: 'Bodhgaya Samvad is arranged by prior request so that available time stays focused on sincere conversations. If the meeting can be accommodated, you will receive the next step for choosing a time and confirming your reservation.',
    reference: 'Request reference', another: 'Send another request',
    error: 'The request could not be saved. Your answers remain on this page. Please try again.',
    practicalEyebrow: '06 / PRACTICAL DETAILS', practicalTitle: 'A little clarity before you travel.',
    practical: 'Meetings take place in Bodhgaya, by prior arrangement. The exact location is shared privately after confirmation. English and Hindi are available. Please do not travel expecting a meeting until a time is confirmed.',
    policyTitle: 'Reservation & changes',
    policy: 'The ₹2,500 contribution reserves time for an accepted private Samvad and helps prevent unattended bookings. It is not a donation. More than 48 hours before the agreed meeting, one reschedule may be requested, subject to availability. Within 48 hours, the contribution is normally non-refundable. If Nirvan Dham cancels, a reschedule or full refund will be offered. If the contribution is a genuine difficulty, you may still apply and mention it in your note.',
    faqTitle: 'A few useful questions',
    faq: [
      ['Is this a group satsang?', 'This request is primarily for a private or small-format Samvad.'],
      ['Do I need prior knowledge of Advaita?', 'No. A sincere question is enough.'],
      ['Can I meet without paying?', 'If the contribution is a genuine difficulty, explain this in your application. This does not promise acceptance or a time.'],
      ['Is ₹2,500 a donation?', 'No. It is a commitment contribution for an accepted reservation. Donations to Nirvan Dham are separate and voluntary.'],
      ['Where is the meeting?', 'In Bodhgaya. The exact location is shared privately after confirmation.'],
      ['Which languages are available?', 'English and Hindi.'],
    ],
    finalTitle: 'When the question is ready, begin here.', footer: 'A quiet place for honest inquiry.',
  },
  hi: {
    nav: ['संवाद', 'सार्वजनिक कार्य', 'प्रक्रिया'],
    eyebrow: 'बोधगया संवाद · प्रत्यक्ष निजी संवाद',
    title: <>आदिसत्व से मिलें।<br /><em>बोधगया में।</em></>,
    intro: 'वह प्रश्न लेकर आइए जो आपके लिए सचमुच महत्त्वपूर्ण है। बोधगया में सहज संवाद, आत्म-विचार और मौन का निजी अवसर।',
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
    questionText: 'शब्द बिल्कुल सही होना आवश्यक नहीं। बताइए कि आपके लिए क्या अभी अस्पष्ट है और प्रत्यक्ष बात करना क्यों ज़रूरी लगता है।',
    stepsEyebrow: '०४ / आगे का मार्ग', stepsTitle: 'मुलाकात तक एक विचारपूर्ण प्रक्रिया।',
    steps: [
      ['अनुरोध', 'अपना प्रश्न और यात्रा की तिथियाँ साझा करें। इस चरण पर कोई भुगतान नहीं।'],
      ['समीक्षा', 'हम अनुरोध पढ़ते हैं और उपलब्धता के अनुसार उत्तर देते हैं। फ़ॉर्म भेजना बुकिंग नहीं है।'],
      ['समय', 'स्वीकृति मिलने पर वास्तविक उपलब्ध समय आपके साथ तय किया जाता है।'],
      ['योगदान', 'स्वीकृत निजी आरक्षण के लिए ₹2,500 प्रतिबद्धता योगदान है; स्वैच्छिक दान इससे अलग है।'],
      ['मुलाकात', 'तय समय और सत्यापित भुगतान के बाद ही बुकिंग पक्की होती है; विवरण निजी रूप से साझा होते हैं।'],
    ],
    formEyebrow: '०५ / संवाद का अनुरोध', formTitle: 'अपने प्रश्न से शुरुआत करें।',
    formText: 'जो आपके लिए महत्त्वपूर्ण है, उसे लिखें। हर अनुरोध को व्यक्तिगत रूप से देखा जाता है; फ़ॉर्म भरने से समय आरक्षित नहीं होता।',
    fields: ['पूरा नाम', 'ईमेल', 'WhatsApp / फ़ोन', 'देश', 'बातचीत की भाषा', 'बोधगया में कब होंगे?', 'मुलाकात का स्वरूप', 'यदि आप आदिसत्व से केवल एक प्रश्न पूछ सकें, तो वह क्या होगा?', 'इस प्रश्न को प्रत्यक्ष बातचीत में क्यों देखना चाहते हैं?', 'आदिसत्व के लिए पहले से कोई उपयोगी बात?'],
    formats: ['व्यक्तिगत', 'दो साधक', 'छोटा समूह'],
    datesHint: 'तिथियाँ या संभावित समय; उपलब्धता का वादा नहीं है',
    noteHint: 'वैकल्पिक। कृपया संवेदनशील चिकित्सा जानकारी न लिखें।',
    check1: 'मैं समझता/समझती हूँ कि अनुरोध भेजने से मुलाकात की पुष्टि नहीं होती।',
    check2: 'मैं समझता/समझती हूँ कि स्वीकृत निजी आरक्षण के लिए ₹2,500 प्रतिबद्धता योगदान है।',
    check3: 'निर्वाण धाम इस अनुरोध के संबंध में ईमेल या फ़ोन पर मुझसे संपर्क कर सकता है।',
    optional: 'वैकल्पिक', submit: 'अनुरोध भेजें', sending: 'अनुरोध भेजा जा रहा है…',
    received: 'अनुरोध प्राप्त हुआ', thank: 'धन्यवाद। आपका अनुरोध प्राप्त हुआ है।',
    after: 'बोधगया संवाद पूर्व अनुरोध से व्यवस्थित होता है ताकि उपलब्ध समय सच्चे प्रश्नों के लिए बना रहे। यदि मुलाकात संभव हुई, तो समय चुनने और आरक्षण की पुष्टि का अगला चरण आपको भेजा जाएगा।',
    reference: 'अनुरोध संदर्भ', another: 'नया अनुरोध भेजें',
    error: 'अनुरोध सुरक्षित नहीं हो सका। आपके उत्तर इसी पृष्ठ पर हैं। कृपया फिर प्रयास करें।',
    practicalEyebrow: '०६ / व्यावहारिक जानकारी', practicalTitle: 'आने से पहले कुछ स्पष्ट बातें।',
    practical: 'मुलाकात बोधगया में पूर्व व्यवस्था से होती है। पक्की पुष्टि के बाद ही स्थान निजी रूप से बताया जाता है। हिंदी और अंग्रेज़ी उपलब्ध हैं। समय तय होने से पहले मुलाकात मानकर यात्रा न करें।',
    policyTitle: 'आरक्षण और बदलाव',
    policy: '₹2,500 का योगदान स्वीकृत निजी संवाद के लिए समय आरक्षित करता है और अनुपस्थित रहने वाली बुकिंग कम करता है। यह दान नहीं है। तय समय से 48 घंटे से अधिक पहले एक बार समय बदलने का अनुरोध किया जा सकता है, उपलब्धता के अनुसार। 48 घंटे के भीतर योगदान सामान्यतः वापस नहीं होगा। निर्वाण धाम को मुलाकात रद्द करनी पड़े तो नया समय या पूरा रिफ़ंड दिया जाएगा। यदि यह योगदान सचमुच कठिन है, तो भी अनुरोध भेजकर अपनी बात लिख सकते हैं।',
    faqTitle: 'कुछ उपयोगी प्रश्न',
    faq: [
      ['क्या यह सामूहिक सत्संग है?', 'यह अनुरोध मुख्यतः निजी या छोटे स्वरूप के संवाद के लिए है।'],
      ['क्या अद्वैत का पूर्व ज्ञान चाहिए?', 'नहीं। एक सच्चे प्रश्न से शुरुआत हो सकती है।'],
      ['क्या बिना योगदान के मिल सकते हैं?', 'यदि योगदान सचमुच कठिन है, तो आवेदन में बताएँ। इससे स्वीकृति या समय का वादा नहीं होता।'],
      ['क्या ₹2,500 दान है?', 'नहीं। यह स्वीकृत आरक्षण का प्रतिबद्धता योगदान है। निर्वाण धाम को स्वैच्छिक दान अलग है।'],
      ['मुलाकात कहाँ होगी?', 'बोधगया में। पक्की पुष्टि के बाद स्थान निजी रूप से बताया जाएगा।'],
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

export default function SamvadExperience({ initialLanguage }: { initialLanguage: Language }) {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [state, setState] = useState<SubmitState>('idle');
  const [reference, setReference] = useState('');
  const inFlight = useRef(false);
  const submissionId = useRef<string | null>(null);
  const c = words[lang];

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  function changeLanguage(next: Language) {
    setLang(next);
    saveLanguage(next);
    const url = new URL(window.location.href);
    url.searchParams.set('lang', next);
    window.history.replaceState(null, '', url);
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
      if (!response.ok || !result.reference) throw new Error('Request not saved');
      setReference(result.reference);
      setState('success');
      submissionId.current = null;
      form.reset();
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
        <div className={styles.heroImage}><Image src={photoUrl(0)} alt={lang === 'hi' ? 'बोधगया में संवाद का चित्रात्मक दृश्य' : 'Illustrative Bodhgaya dialogue scene'} fill priority sizes="(max-width: 800px) 100vw, 50vw" /><span>BODHGAYA · 24.6951° N</span></div>
      </section>
      <section id="the-samvad" className={styles.introSection}><div><p className={styles.eyebrow}>{c.whatEyebrow}</p><h2>{c.whatTitle}</h2></div><div><p>{c.whatText}</p><div className={styles.fit}><span>{c.fitEyebrow}</span><h3>{c.fitTitle}</h3><p>{c.fitText}</p></div></div></section>
      <section id="explore" className={styles.work}><div className={styles.sectionHead}><p className={styles.eyebrow}>{c.workEyebrow}</p><h2>{c.workTitle}</h2><p>{c.workText}</p></div><div className={styles.workLayout}><div><div className={styles.smallHead}><span>{c.books}</span><Link href="/library">{c.library} ↗</Link></div><div className={styles.books}>{books.map((book) => <Link key={book.slug} href={`/library/${book.slug}`} className={styles.book}><span><Image src={book.cover} alt={book[lang]} fill sizes="(max-width: 600px) 26vw, 150px" /></span><strong>{book[lang]}</strong></Link>)}</div></div><div className={styles.channels}><span className={styles.smallLabel}>{c.teaching}</span>{c.channels.map(([name, description, url]) => <a href={url} key={url} target="_blank" rel="noopener noreferrer"><span><strong>{name}</strong><small>{description}</small></span><b>↗</b></a>)}<a href="https://www.google.com/search?q=Aadisatv" target="_blank" rel="noopener noreferrer"><span><strong>{c.public}</strong><small>{c.google}</small></span><b>↗</b></a></div></div></section>
      <section className={styles.question}><p className={styles.eyebrow}>{c.questionEyebrow}</p><h2>{c.questionTitle}</h2><p>{c.questionText}</p><Image src="/aadisatv/portrait.jpg" alt="Aadisatv" width={180} height={180} /></section>
      <section id="journey" className={styles.journey}><div className={styles.sectionHead}><p className={styles.eyebrow}>{c.stepsEyebrow}</p><h2>{c.stepsTitle}</h2></div><ol>{c.steps.map(([name, description], i) => <li key={name}><span>{String(i + 1).padStart(2, '0')}</span><div><h3>{name}</h3><p>{description}</p></div></li>)}</ol></section>
      <section id="request" className={styles.request}><div className={styles.requestCopy}><p className={styles.eyebrow}>{c.formEyebrow}</p><h2>{c.formTitle}</h2><p>{c.formText}</p><div className={styles.requestQuote}>“{c.questionTitle}”</div></div>{state === 'success' ? <div className={styles.received} role="status"><span>✓ {c.received}</span><h3>{c.thank}</h3><p>{c.after}</p><p>{c.reference}: <strong>{reference}</strong></p><button type="button" className={styles.textLink} onClick={() => setState('idle')}>{c.another} ↗</button></div> : <form onSubmit={submit} className={styles.form} aria-busy={state === 'sending'}><div className={styles.grid}><label>{c.fields[0]} <input name="name" required minLength={2} maxLength={120} autoComplete="name" /></label><label>{c.fields[1]} <input name="email" type="email" required maxLength={180} autoComplete="email" /></label><label>{c.fields[2]} <input name="phone" type="tel" required maxLength={40} autoComplete="tel" /></label><label>{c.fields[3]} <input name="country" required maxLength={100} autoComplete="country-name" /></label><label>{c.fields[4]} <select name="preferredLanguage" required defaultValue=""><option value="" disabled>—</option><option value="English">English</option><option value="Hindi">हिंदी</option></select></label><label>{c.fields[5]} <input name="travelDates" required maxLength={160} placeholder={c.datesHint} /></label><label className={styles.full}>{c.fields[6]} <select name="meetingType" required defaultValue=""><option value="" disabled>—</option>{c.formats.map((name, i) => <option value={['individual', 'couple', 'small_group'][i]} key={name}>{name}</option>)}</select></label><label className={styles.full}>{c.fields[7]} <textarea name="primaryQuestion" required minLength={30} maxLength={2000} rows={5} /></label><label className={styles.full}>{c.fields[8]} <textarea name="whyInPerson" required minLength={20} maxLength={2000} rows={4} /></label><label className={styles.full}>{c.fields[9]} <small>({c.optional})</small><textarea name="note" maxLength={2000} rows={3} placeholder={c.noteHint} /></label></div><div className={styles.consents}><label><input type="checkbox" name="requestConsent" required />{c.check1}</label><label><input type="checkbox" name="contributionConsent" required />{c.check2}</label><label><input type="checkbox" name="contactConsent" required />{c.check3}</label></div><div className={styles.honeypot} aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>{state === 'error' && <p className={styles.error} role="alert">{c.error}</p>}<button type="submit" className={styles.primary} disabled={state === 'sending'}>{state === 'sending' ? c.sending : c.submit} <span>↗</span></button></form>}</section>
      <section className={styles.practical}><div><p className={styles.eyebrow}>{c.practicalEyebrow}</p><h2>{c.practicalTitle}</h2><p>{c.practical}</p></div><div><h3>{c.policyTitle}</h3><p>{c.policy}</p></div></section>
      <section className={styles.faq}><h2>{c.faqTitle}</h2><div>{c.faq.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section>
      <section className={styles.final}><h2>{c.finalTitle}</h2><a className={styles.primary} href="#request">{c.request} ↗</a></section>
    </main><footer className={styles.footer}><Link href="/">{lang === 'hi' ? 'निर्वाण धाम' : 'Nirvan Dham'}</Link><p>{c.footer}</p><Link href="/library">{c.library}</Link></footer><div className={styles.mobileCta}><a href="#request">{c.request} ↗</a></div>
  </div>;
}
