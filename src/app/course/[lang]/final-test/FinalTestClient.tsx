'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  FINAL_TEST_QUESTION_COUNT,
  selectFinalTestQuestions,
  type FinalTestLanguage,
  type FinalTestQuestion,
} from '@/lib/final-test-data';

const GOLD = '#d4a843';
const BG = '#061008';
const SURFACE = '#0d1a0f';
const BORDER = 'rgba(212,168,67,0.16)';
const IVORY = 'rgba(245,237,216,1)';
const MUTED = 'rgba(245,237,216,0.58)';

type Phase = 'loading' | 'intro' | 'test' | 'details' | 'submitted' | 'error';

interface Profile {
  name: string;
  email: string;
  phone: string;
  submittedAt: string | null;
}

function labels(language: FinalTestLanguage) {
  if (language === 'hi') {
    return {
      eyebrow: 'श्रवण · अंतिम परीक्षा',
      title: 'आपकी यात्रा का अंतिम पड़ाव',
      intro: '60 प्रश्नों के ज्ञान-संग्रह से आपके लिए 15 चिंतनशील प्रश्न चुने जाएंगे। हर उत्तर अपने अनुभव और समझ से लिखें।',
      begin: 'परीक्षा शुरू करें',
      allRequired: 'सभी 15 प्रश्नों के उत्तर आवश्यक हैं।',
      answerHere: 'यहां अपना उत्तर लिखें...',
      submit: 'परीक्षा सबमिट करें',
      details: 'सबमिट करने से पहले',
      phone: 'फोन / WhatsApp',
      profile: 'आपकी पंजीकृत जानकारी',
      complete: 'श्रवण पूर्ण हुआ',
      completion: 'श्रवण का भाग पूर्ण हुआ है। मनन के लिए गुरु अपनी सुविधा के अनुसार आपको निर्देश भेजेंगे।',
      retry: 'वापस परीक्षा पर जाएं',
      required: 'फोन नंबर भरना आवश्यक है।',
      saved: 'आपके उत्तर सुरक्षित रूप से प्राप्त हो गए हैं।',
      status: 'उत्तर दिए गए',
    };
  }
  if (language === 'hl') {
    return {
      eyebrow: 'Shravana · Final Pariksha',
      title: 'Aapki Yatra Ka Antim Padaav',
      intro: '60 prashnon ke bank se aapke liye 15 chintansheel prashn chune jaayenge. Har uttar apne anubhav aur samajh se likhein.',
      begin: 'Pariksha Shuru Karein',
      allRequired: 'Sabhi 15 prashnon ke uttar zaroori hain.',
      answerHere: 'Apna uttar yahan likhein...',
      submit: 'Pariksha Submit Karein',
      details: 'Submit karne se pehle',
      phone: 'Phone / WhatsApp',
      profile: 'Aapki registered jaankari',
      complete: 'Shravana Poora Hua',
      completion: 'Shravana ka bhaag poora hua hai. Manana ke liye Guru apni suvidha ke anusaar aapko nirdesh bhejenge.',
      retry: 'Pariksha par wapas jaayein',
      required: 'Phone number zaroori hai.',
      saved: 'Aapke uttar surakshit roop se praapt ho gaye hain.',
      status: 'answers diye gaye',
    };
  }
  return {
    eyebrow: 'Shravana · Final Examination',
    title: 'The Final Milestone of Your Journey',
    intro: 'Fifteen reflective questions will be selected from a bank of sixty. Write each answer from your own understanding and experience.',
    begin: 'Begin Examination',
    allRequired: 'All 15 answers are required.',
    answerHere: 'Write your answer here...',
    submit: 'Submit Final Test',
    details: 'Before you submit',
    phone: 'Phone / WhatsApp',
    profile: 'Your registered details',
    complete: 'Shravana Complete',
    completion: 'The Shravana part is complete. For Manana, the Guru will send you guidance at a suitable time.',
    retry: 'Return to examination',
    required: 'A phone number is required.',
    saved: 'Your answers have been received securely.',
    status: 'answers given',
  };
}

function QuestionCard({
  question,
  index,
  answer,
  onChange,
  language,
  placeholder,
}: {
  question: FinalTestQuestion;
  index: number;
  answer: string;
  onChange: (value: string) => void;
  language: FinalTestLanguage;
  placeholder: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <section style={{ padding: 'clamp(1.25rem,3vw,1.8rem)', border: `1px solid ${focused ? 'rgba(212,168,67,0.42)' : BORDER}`, borderRadius: '16px', background: focused ? 'rgba(212,168,67,0.04)' : SURFACE, transition: 'border-color 0.2s, background 0.2s' }}>
      <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <span style={{ width: '32px', height: '32px', flexShrink: 0, borderRadius: '8px', display: 'grid', placeItems: 'center', color: GOLD, border: `1px solid rgba(212,168,67,0.32)`, background: 'rgba(212,168,67,0.08)', fontFamily: 'var(--font-inter)', fontSize: '0.72rem', fontWeight: 700 }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <p style={{ margin: 0, color: IVORY, fontFamily: language === 'hi' ? 'var(--font-hind)' : 'var(--font-inter)', fontSize: language === 'hi' ? '1rem' : '0.96rem', lineHeight: 1.85 }}>
          {question.prompt}
        </p>
      </div>
      <textarea
        value={answer}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        rows={5}
        style={{ width: '100%', boxSizing: 'border-box', padding: '0.9rem 1rem', resize: 'vertical', borderRadius: '10px', border: `1px solid ${focused ? GOLD : 'rgba(212,168,67,0.14)'}`, background: 'rgba(4,12,6,0.68)', color: IVORY, outline: 'none', fontFamily: language === 'hi' ? 'var(--font-hind)' : 'var(--font-inter)', fontSize: language === 'hi' ? '0.97rem' : '0.92rem', lineHeight: 1.8 }}
      />
    </section>
  );
}

export default function FinalTestClient({ lang }: { lang: FinalTestLanguage }) {
  const copy = labels(lang);
  const [phase, setPhase] = useState<Phase>('loading');
  const [questions, setQuestions] = useState<FinalTestQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [profile, setProfile] = useState<Profile>({ name: '', email: '', phone: '', submittedAt: null });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const answeredCount = useMemo(
    () => questions.filter((question) => (answers[question.id] ?? '').trim().length > 0).length,
    [answers, questions],
  );

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch('/api/course/submit', { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? 'Could not load your course profile.');
        setProfile(data);
        setQuestions(selectFinalTestQuestions(lang));
        setPhase(data.submittedAt ? 'submitted' : 'intro');
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Could not load the final test.');
        setPhase('error');
      }
    }
    void loadProfile();
  }, [lang]);

  async function submitFinalTest() {
    if (!profile.phone.trim()) {
      setError(copy.required);
      return;
    }
    if (answeredCount !== FINAL_TEST_QUESTION_COUNT) {
      setError(copy.allRequired);
      setPhase('test');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/course/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: lang,
          phone: profile.phone,
          answers: questions.map((question) => ({ id: question.id, answer: answers[question.id] ?? '' })),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? 'Your final test could not be submitted.');
      setProfile((current) => ({ ...current, submittedAt: data.submittedAt }));
      setPhase('submitted');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Your final test could not be submitted.');
    } finally {
      setSubmitting(false);
    }
  }

  const shell: CSSProperties = { minHeight: '100vh', background: BG, color: IVORY, padding: 'clamp(1rem,4vw,3rem)' };
  const card: CSSProperties = { width: '100%', maxWidth: '780px', margin: '0 auto', border: `1px solid ${BORDER}`, borderRadius: '20px', background: 'linear-gradient(145deg, rgba(13,26,15,0.98), rgba(5,16,8,0.98))', boxShadow: '0 20px 70px rgba(0,0,0,0.28)' };

  if (phase === 'loading') {
    return <div style={{ ...shell, display: 'grid', placeItems: 'center' }}><p style={{ color: MUTED, fontFamily: 'var(--font-inter)' }}>Preparing your final reflection...</p></div>;
  }

  if (phase === 'error') {
    return <div style={{ ...shell, display: 'grid', placeItems: 'center' }}><div style={{ ...card, maxWidth: '520px', padding: '2rem', textAlign: 'center' }}><h1 style={{ color: GOLD, fontFamily: 'var(--font-cormorant)', fontSize: '2rem' }}>Final Test</h1><p style={{ color: MUTED, lineHeight: 1.7 }}>{error}</p></div></div>;
  }

  if (phase === 'submitted') {
    return (
      <div style={{ ...shell, display: 'grid', placeItems: 'center' }}>
        <div style={{ ...card, maxWidth: '640px', padding: 'clamp(2rem,6vw,4rem)', textAlign: 'center' }}>
          <p style={{ margin: '0 0 0.9rem', fontFamily: 'var(--font-inter)', letterSpacing: '0.22em', fontSize: '0.65rem', color: GOLD }}>NIRVAN SUTRA · SHRAVANA</p>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 1.4rem', display: 'grid', placeItems: 'center', border: `1px solid rgba(212,168,67,0.5)`, color: GOLD, fontSize: '1.3rem' }}>+</div>
          <h1 style={{ fontFamily: lang === 'hi' ? 'var(--font-hind)' : 'var(--font-cormorant)', fontWeight: lang === 'hi' ? 600 : 300, fontStyle: lang === 'hi' ? 'normal' : 'italic', fontSize: 'clamp(2rem,6vw,3.4rem)', color: IVORY, margin: '0 0 1.25rem' }}>{copy.complete}</h1>
          <p style={{ color: MUTED, fontFamily: lang === 'hi' ? 'var(--font-hind)' : 'var(--font-inter)', fontSize: '1rem', lineHeight: 1.95, margin: '0 auto 1rem', maxWidth: '520px' }}>{copy.completion}</p>
          <p style={{ color: 'rgba(212,168,67,0.72)', fontFamily: lang === 'hi' ? 'var(--font-hind)' : 'var(--font-inter)', fontSize: '0.88rem', margin: 0 }}>{copy.saved}</p>
        </div>
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div style={{ ...shell, display: 'grid', placeItems: 'center' }}>
        <div style={{ ...card, maxWidth: '700px', padding: 'clamp(2rem,6vw,4.5rem)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: '420px', height: '420px', left: '50%', top: '-260px', transform: 'translateX(-50%)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,67,0.16), transparent 66%)', pointerEvents: 'none' }} />
          <p style={{ position: 'relative', margin: '0 0 1rem', fontFamily: 'var(--font-inter)', letterSpacing: '0.24em', fontSize: '0.65rem', color: GOLD }}>{copy.eyebrow}</p>
          <h1 style={{ position: 'relative', fontFamily: lang === 'hi' ? 'var(--font-hind)' : 'var(--font-cormorant)', fontSize: 'clamp(2.1rem,6vw,4rem)', fontWeight: lang === 'hi' ? 600 : 300, fontStyle: lang === 'hi' ? 'normal' : 'italic', margin: '0 0 1.25rem', color: IVORY }}>{copy.title}</h1>
          <p style={{ position: 'relative', maxWidth: '560px', margin: '0 auto 2rem', color: MUTED, fontFamily: lang === 'hi' ? 'var(--font-hind)' : 'var(--font-inter)', lineHeight: 1.9 }}>{copy.intro}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.7rem', flexWrap: 'wrap', marginBottom: '2rem', position: 'relative' }}>
            {[`${FINAL_TEST_QUESTION_COUNT} Questions`, 'Written Responses', 'No Time Limit'].map((item) => <span key={item} style={{ padding: '0.45rem 0.85rem', borderRadius: '999px', border: `1px solid ${BORDER}`, color: 'rgba(245,237,216,0.68)', fontFamily: 'var(--font-inter)', fontSize: '0.68rem' }}>{item}</span>)}
          </div>
          <button onClick={() => setPhase('test')} style={{ position: 'relative', border: 'none', borderRadius: '10px', padding: '1rem 2.25rem', background: GOLD, color: '#061008', fontFamily: lang === 'hi' ? 'var(--font-hind)' : 'var(--font-inter)', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 9px 32px rgba(212,168,67,0.27)' }}>{copy.begin}</button>
        </div>
      </div>
    );
  }

  if (phase === 'details') {
    return (
      <div style={{ ...shell, display: 'grid', placeItems: 'center' }}>
        <div style={{ ...card, maxWidth: '580px', padding: 'clamp(1.5rem,5vw,2.5rem)' }}>
          <p style={{ margin: '0 0 0.5rem', color: GOLD, fontFamily: 'var(--font-inter)', fontSize: '0.64rem', letterSpacing: '0.2em' }}>{copy.profile}</p>
          <h1 style={{ margin: '0 0 1.5rem', fontFamily: lang === 'hi' ? 'var(--font-hind)' : 'var(--font-cormorant)', fontStyle: lang === 'hi' ? 'normal' : 'italic', fontWeight: lang === 'hi' ? 600 : 300, fontSize: '2rem' }}>{copy.details}</h1>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <label style={{ color: MUTED, fontFamily: lang === 'hi' ? 'var(--font-hind)' : 'var(--font-inter)', fontSize: '0.86rem' }}>Name<input value={profile.name} disabled style={{ display: 'block', width: '100%', marginTop: '0.45rem', boxSizing: 'border-box', padding: '0.8rem 0.9rem', borderRadius: '8px', border: `1px solid ${BORDER}`, background: 'rgba(6,16,8,0.62)', color: 'rgba(245,237,216,0.6)' }} /></label>
            <label style={{ color: MUTED, fontFamily: lang === 'hi' ? 'var(--font-hind)' : 'var(--font-inter)', fontSize: '0.86rem' }}>Email<input value={profile.email} disabled style={{ display: 'block', width: '100%', marginTop: '0.45rem', boxSizing: 'border-box', padding: '0.8rem 0.9rem', borderRadius: '8px', border: `1px solid ${BORDER}`, background: 'rgba(6,16,8,0.62)', color: 'rgba(245,237,216,0.6)' }} /></label>
            <label style={{ color: MUTED, fontFamily: lang === 'hi' ? 'var(--font-hind)' : 'var(--font-inter)', fontSize: '0.86rem' }}>{copy.phone}<input value={profile.phone} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} placeholder="+91 98765 43210" style={{ display: 'block', width: '100%', marginTop: '0.45rem', boxSizing: 'border-box', padding: '0.8rem 0.9rem', borderRadius: '8px', border: `1px solid ${BORDER}`, background: 'rgba(6,16,8,0.8)', color: IVORY, outline: 'none' }} /></label>
          </div>
          {error && <p style={{ margin: '1rem 0 0', color: '#fca5a5', fontFamily: lang === 'hi' ? 'var(--font-hind)' : 'var(--font-inter)', fontSize: '0.85rem' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button onClick={() => setPhase('test')} disabled={submitting} style={{ flex: 1, borderRadius: '9px', padding: '0.85rem', border: `1px solid ${BORDER}`, color: MUTED, background: 'transparent', cursor: 'pointer' }}>{copy.retry}</button>
            <button onClick={() => void submitFinalTest()} disabled={submitting} style={{ flex: 1.5, border: 'none', borderRadius: '9px', padding: '0.85rem', background: submitting ? 'rgba(212,168,67,0.5)' : GOLD, color: '#061008', fontWeight: 700, cursor: submitting ? 'wait' : 'pointer' }}>{submitting ? 'Submitting...' : copy.submit}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={shell}>
      <nav style={{ position: 'sticky', top: '1rem', zIndex: 2, maxWidth: '900px', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1rem', background: 'rgba(6,16,8,0.9)', backdropFilter: 'blur(14px)', border: `1px solid ${BORDER}`, borderRadius: '12px' }}>
        <span style={{ color: GOLD, fontFamily: 'var(--font-inter)', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>{answeredCount}/{FINAL_TEST_QUESTION_COUNT} {copy.status}</span>
        <div style={{ flex: 1, height: '3px', borderRadius: '999px', background: 'rgba(212,168,67,0.13)' }}><div style={{ width: `${(answeredCount / FINAL_TEST_QUESTION_COUNT) * 100}%`, height: '100%', borderRadius: 'inherit', background: GOLD, transition: 'width 0.2s ease' }} /></div>
        <button onClick={() => { setError(answeredCount === FINAL_TEST_QUESTION_COUNT ? '' : copy.allRequired); setPhase(answeredCount === FINAL_TEST_QUESTION_COUNT ? 'details' : 'test'); }} style={{ border: 'none', borderRadius: '7px', padding: '0.55rem 0.85rem', background: GOLD, color: '#061008', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>{copy.submit}</button>
      </nav>
      <main style={{ width: '100%', maxWidth: '900px', margin: '0 auto', display: 'grid', gap: '1rem' }}>
        <header style={{ textAlign: 'center', padding: '1.5rem 0 1rem' }}><p style={{ margin: '0 0 0.7rem', color: GOLD, fontFamily: 'var(--font-inter)', fontSize: '0.65rem', letterSpacing: '0.22em' }}>{copy.eyebrow}</p><h1 style={{ margin: 0, fontFamily: lang === 'hi' ? 'var(--font-hind)' : 'var(--font-cormorant)', fontStyle: lang === 'hi' ? 'normal' : 'italic', fontWeight: lang === 'hi' ? 600 : 300, fontSize: 'clamp(1.7rem,4vw,2.7rem)' }}>{copy.title}</h1></header>
        {error && <p style={{ margin: 0, padding: '0.9rem 1rem', border: '1px solid rgba(248,113,113,0.35)', borderRadius: '10px', background: 'rgba(127,29,29,0.15)', color: '#fecaca', fontFamily: lang === 'hi' ? 'var(--font-hind)' : 'var(--font-inter)' }}>{error}</p>}
        {questions.map((question, index) => <QuestionCard key={question.id} question={question} index={index} answer={answers[question.id] ?? ''} onChange={(answer) => setAnswers((current) => ({ ...current, [question.id]: answer }))} language={lang} placeholder={copy.answerHere} />)}
        <section style={{ textAlign: 'center', padding: '2rem', border: `1px solid ${BORDER}`, borderRadius: '16px', background: 'rgba(212,168,67,0.035)' }}><p style={{ color: MUTED, margin: '0 0 1rem', fontFamily: lang === 'hi' ? 'var(--font-hind)' : 'var(--font-inter)' }}>{answeredCount}/{FINAL_TEST_QUESTION_COUNT} {copy.status}</p><button onClick={() => { setError(answeredCount === FINAL_TEST_QUESTION_COUNT ? '' : copy.allRequired); setPhase(answeredCount === FINAL_TEST_QUESTION_COUNT ? 'details' : 'test'); }} style={{ border: 'none', borderRadius: '10px', padding: '0.9rem 2rem', background: GOLD, color: '#061008', cursor: 'pointer', fontWeight: 700 }}>{copy.submit}</button></section>
      </main>
    </div>
  );
}
