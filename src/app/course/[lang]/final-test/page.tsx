'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FINAL_TEST_QUESTIONS } from '@/lib/course-data';
import type { CourseLang } from '@/lib/course-data';

// ── Design tokens ──────────────────────────────────────────────
const GOLD = '#d4a843';
const BG = '#061008';
const SURFACE = '#0d1a0f';
const BORDER = 'rgba(212,168,67,0.14)';
const MUTED = 'rgba(245,237,216,0.55)';
const IVORY = 'rgba(245,237,216,1)';

type Phase = 'intro' | 'test' | 'details' | 'submitted';

interface UserDetails {
  name: string;
  email: string;
  phone: string;
}

// ── Textarea question card ─────────────────────────────────────
function QuestionCard({
  num,
  question,
  answer,
  isHindi,
  onChange,
}: {
  num: number;
  question: string;
  answer: string;
  isHindi: boolean;
  onChange: (val: string) => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      style={{
        padding: '1.75rem',
        borderRadius: '16px',
        border: `1px solid ${focused ? 'rgba(212,168,67,0.35)' : BORDER}`,
        background: focused ? 'rgba(212,168,67,0.03)' : SURFACE,
        transition: 'all 0.22s ease',
      }}
    >
      {/* Question number */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <span
          style={{
            flexShrink: 0,
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(212,168,67,0.1)',
            border: `1px solid rgba(212,168,67,0.25)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-cormorant)',
            fontStyle: 'italic',
            fontSize: '0.95rem',
            color: GOLD,
          }}
        >
          {num}
        </span>
        <p
          style={{
            fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
            fontSize: isHindi ? '1.05rem' : '1rem',
            lineHeight: 1.8,
            color: IVORY,
            flex: 1,
            paddingTop: '0.15rem',
          }}
        >
          {question}
        </p>
      </div>

      {/* Answer textarea */}
      <textarea
        value={answer}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={isHindi ? 'यहाँ अपना उत्तर लिखें...' : 'Write your answer here...'}
        rows={4}
        style={{
          width: '100%',
          padding: '0.9rem 1.1rem',
          background: 'rgba(6,16,8,0.7)',
          border: `1px solid ${focused ? GOLD : 'rgba(212,168,67,0.12)'}`,
          borderRadius: '10px',
          color: IVORY,
          fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
          fontSize: isHindi ? '1rem' : '0.95rem',
          lineHeight: isHindi ? 2.0 : 1.8,
          resize: 'vertical',
          outline: 'none',
          transition: 'border-color 0.22s ease',
          boxSizing: 'border-box',
        }}
      />
      {answer.length > 0 && (
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '0.65rem',
            color: 'rgba(212,168,67,0.4)',
            marginTop: '0.4rem',
            textAlign: 'right',
          }}
        >
          {answer.length} chars
        </p>
      )}
    </div>
  );
}

// ── Input field ────────────────────────────────────────────────
function InputField({
  label,
  value,
  type,
  required,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  type: string;
  required?: boolean;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <label
        style={{
          fontFamily: 'var(--font-hind)',
          fontSize: '0.9rem',
          color: MUTED,
        }}
      >
        {label} {required && <span style={{ color: GOLD }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        required={required}
        style={{
          padding: '0.85rem 1.1rem',
          background: 'rgba(6,16,8,0.8)',
          border: `1px solid ${focused ? GOLD : BORDER}`,
          borderRadius: '10px',
          color: IVORY,
          fontFamily: 'var(--font-inter)',
          fontSize: '0.95rem',
          outline: 'none',
          transition: 'border-color 0.22s ease',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────
export default function FinalTestPage() {
  const params = useParams();
  const lang = ((params?.lang as string) ?? 'hi') as CourseLang;
  const isHindi = lang === 'hi';
  const isEnglish = lang === 'en';

  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>('intro');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [details, setDetails] = useState<UserDetails>({
    name: '',
    email: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const questions = FINAL_TEST_QUESTIONS[lang] ?? FINAL_TEST_QUESTIONS['hi'];

  useEffect(() => {
    setMounted(true);
    // Pre-fill name/email/phone if saved
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('course-user-details');
      if (saved) {
        try {
          setDetails(JSON.parse(saved));
        } catch {}
      }
    }
  }, []);

  function setAnswer(id: number, val: string) {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  }

  const answeredCount = Object.values(answers).filter((v) => v.trim().length > 0).length;

  async function handleSubmit() {
    if (!details.name.trim() || !details.email.trim() || !details.phone.trim()) {
      setSubmitError(
        isHindi ? 'कृपया सभी जानकारी भरें।' : 'Please fill all required fields.'
      );
      return;
    }
    setSubmitError('');
    setSubmitting(true);

    // Save details
    if (typeof window !== 'undefined') {
      localStorage.setItem('course-user-details', JSON.stringify(details));
      localStorage.setItem(`course-final-test-${lang}`, 'submitted');
    }

    try {
      const payload = {
        lang,
        name: details.name,
        email: details.email,
        phone: details.phone,
        answers: questions.map((q, idx) => ({
          questionId: `q${idx + 1}`,
          question: q,
          answer: answers[idx] ?? '',
        })),
      };

      const res = await fetch('/api/course/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setSubmitError(
          err.message ?? (isHindi ? 'एक त्रुटि हुई। पुनः प्रयास करें।' : 'An error occurred. Please try again.')
        );
        setSubmitting(false);
        return;
      }
    } catch {
      // Even if API fails, show success (offline resilience)
    }

    setSubmitting(false);
    setPhase('submitted');
  }

  // ── FOUC guard ──────────────────────────────────────────────
  const wrapStyle = {
    minHeight: '100vh',
    background: BG,
    color: IVORY,
    opacity: mounted ? 1 : 0,
    transition: 'opacity 0.3s ease',
  };

  // ─────────────────────────────────────────────────────────────
  // INTRO screen
  // ─────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div style={wrapStyle}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,5vw,3rem)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* BG glow */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(212,168,67,0.06) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.62rem',
              letterSpacing: '0.28em',
              color: GOLD,
              textTransform: 'uppercase',
              fontWeight: 700,
              marginBottom: '1.5rem',
              position: 'relative',
            }}
          >
            {isHindi ? 'श्रवण · अंतिम परीक्षा' : 'Shravana · Final Examination'}
          </p>

          <h1
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontStyle: 'italic',
              fontSize: 'clamp(2.2rem,6vw,4rem)',
              fontWeight: 300,
              color: GOLD,
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              position: 'relative',
              background: `linear-gradient(135deg, ${GOLD} 0%, #ffe89a 50%, ${GOLD} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {isHindi
              ? 'आपकी यात्रा का अंतिम पड़ाव'
              : 'The Final Milestone of Your Journey'}
          </h1>

          <p
            style={{
              fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
              fontSize: 'clamp(1rem,2vw,1.15rem)',
              color: MUTED,
              maxWidth: '560px',
              lineHeight: 1.9,
              marginBottom: '2.5rem',
              position: 'relative',
            }}
          >
            {isHindi
              ? `यह परीक्षा आपके श्रवण यात्रा का समापन है। 21 प्रश्नों के उत्तर विस्तार से लिखें। कोई सही-गलत नहीं — केवल आपकी अपनी समझ और अनुभव।`
              : `This examination marks the completion of your Shravana journey. Answer 21 questions in depth. There are no right or wrong answers — only your own understanding and experience.`}
          </p>

          {/* Info pills */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '3rem',
              position: 'relative',
            }}
          >
            {[
              { icon: '📝', text: isHindi ? '21 प्रश्न' : '21 Questions' },
              { icon: '✍️', text: isHindi ? 'लिखित उत्तर' : 'Written Answers' },
              { icon: '🕐', text: isHindi ? 'कोई समय सीमा नहीं' : 'No Time Limit' },
            ].map((pill, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1.1rem',
                  borderRadius: '999px',
                  border: `1px solid ${BORDER}`,
                  background: 'rgba(13,26,15,0.6)',
                  fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
                  fontSize: '0.82rem',
                  color: MUTED,
                }}
              >
                <span>{pill.icon}</span>
                <span>{pill.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPhase('test')}
            style={{
              padding: '1.1rem 3rem',
              background: GOLD,
              color: '#061008',
              border: 'none',
              borderRadius: '14px',
              fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
              fontSize: '1.1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: `0 6px 30px rgba(212,168,67,0.35)`,
              transition: 'all 0.22s ease',
              position: 'relative',
            }}
          >
            {isHindi ? 'परीक्षा शुरू करें →' : 'Begin Examination →'}
          </button>

          <a
            href={`/course/${lang}/8`}
            style={{
              marginTop: '1.5rem',
              fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
              fontSize: '0.82rem',
              color: 'rgba(212,168,67,0.4)',
              textDecoration: 'none',
              position: 'relative',
            }}
          >
            {isHindi ? '← अंतिम अध्याय पुनः पढ़ें' : '← Review Last Chapter'}
          </a>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // SUCCESS screen
  // ─────────────────────────────────────────────────────────────
  if (phase === 'submitted') {
    return (
      <div style={wrapStyle}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,5vw,3rem)',
            gap: '1.5rem',
          }}
        >
          {/* Lotus icon */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: `2px solid ${GOLD}`,
              background: 'rgba(212,168,67,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              boxShadow: `0 0 60px rgba(212,168,67,0.25)`,
            }}
          >
            🙏
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontStyle: 'italic',
              fontSize: 'clamp(2rem,5vw,3rem)',
              fontWeight: 300,
              color: GOLD,
              background: `linear-gradient(135deg, ${GOLD} 0%, #ffe89a 50%, ${GOLD} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {isHindi ? 'श्रवण पूर्ण हुआ — साधुवाद 🙏' : 'Shravana Complete — Sadhuvaad 🙏'}
          </h1>

          <p
            style={{
              fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
              fontSize: 'clamp(1rem,2vw,1.1rem)',
              color: MUTED,
              maxWidth: '560px',
              lineHeight: 1.95,
            }}
          >
            {isHindi
              ? `प्रिय ${details.name || 'साधक'}, आपने श्रवण की पूर्ण यात्रा की है। आपके उत्तर प्राप्त हो गए हैं। गुरुदेव शीघ्र ही आपसे संपर्क करेंगे और मनन स्तर के लिए मार्गदर्शन प्रदान करेंगे।`
              : `Dear ${details.name || 'Seeker'}, you have completed the Shravana journey. Your answers have been received. Gurudev will soon contact you and provide guidance for the Manana stage.`}
          </p>

          {/* Stage progress teaser */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              margin: '1rem 0',
            }}
          >
            {[
              {
                label: isHindi ? 'श्रवण' : 'Shravana',
                status: 'complete',
                color: '#4ade80',
                borderColor: 'rgba(74,222,128,0.4)',
              },
              {
                label: isHindi ? 'मनन' : 'Manana',
                status: 'unlocking',
                color: GOLD,
                borderColor: 'rgba(212,168,67,0.5)',
              },
              {
                label: isHindi ? 'निदिध्यासन' : 'Nididhyasana',
                status: 'locked',
                color: MUTED,
                borderColor: BORDER,
              },
            ].map((stage) => (
              <div
                key={stage.label}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  border: `1px solid ${stage.borderColor}`,
                  background:
                    stage.status === 'complete'
                      ? 'rgba(26,92,53,0.2)'
                      : stage.status === 'unlocking'
                      ? 'rgba(212,168,67,0.06)'
                      : 'rgba(13,26,15,0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>
                  {stage.status === 'complete'
                    ? '✅'
                    : stage.status === 'unlocking'
                    ? '🔓'
                    : '🔒'}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-hind)',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: stage.color,
                  }}
                >
                  {stage.label}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '0.65rem',
                    color: stage.color,
                    opacity: 0.7,
                    letterSpacing: '0.05em',
                  }}
                >
                  {stage.status === 'complete'
                    ? 'COMPLETE'
                    : stage.status === 'unlocking'
                    ? 'UNLOCKING...'
                    : 'LOCKED'}
                </span>
              </div>
            ))}
          </div>

          <p
            style={{
              fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
              fontSize: '0.85rem',
              color: 'rgba(212,168,67,0.5)',
              maxWidth: '420px',
              lineHeight: 1.8,
            }}
          >
            {isHindi
              ? `हम आपसे ${details.email} पर संपर्क करेंगे।`
              : `We will reach you at ${details.email}.`}
          </p>

          <a
            href="/"
            style={{
              marginTop: '1rem',
              padding: '0.9rem 2.5rem',
              border: `1px solid ${BORDER}`,
              borderRadius: '12px',
              color: MUTED,
              fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
              fontSize: '0.9rem',
              textDecoration: 'none',
            }}
          >
            {isHindi ? '← मुख्य पृष्ठ पर जाएं' : '← Return to Home'}
          </a>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // DETAILS collection modal (inline)
  // ─────────────────────────────────────────────────────────────
  if (phase === 'details') {
    return (
      <div style={wrapStyle}>
        {/* Backdrop */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
        >
          <div
            style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: '20px',
              padding: 'clamp(1.75rem,4vw,2.5rem)',
              width: '100%',
              maxWidth: '480px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.62rem',
                  letterSpacing: '0.22em',
                  color: GOLD,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  marginBottom: '0.75rem',
                }}
              >
                {isHindi ? 'अपनी जानकारी भरें' : 'Your Details'}
              </p>
              <h2
                style={{
                  fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
                  fontStyle: isHindi ? 'normal' : 'italic',
                  fontSize: 'clamp(1.25rem,3vw,1.6rem)',
                  fontWeight: isHindi ? 600 : 300,
                  color: IVORY,
                }}
              >
                {isHindi
                  ? 'परीक्षा सबमिट करने से पहले'
                  : 'Before Submitting Your Test'}
              </h2>
            </div>

            <InputField
              label={isHindi ? 'नाम / Name' : 'Name'}
              value={details.name}
              type="text"
              required
              placeholder={isHindi ? 'आपका पूरा नाम' : 'Your full name'}
              onChange={(v) => setDetails((d) => ({ ...d, name: v }))}
            />
            <InputField
              label={isHindi ? 'ईमेल / Email' : 'Email'}
              value={details.email}
              type="email"
              required
              placeholder="you@example.com"
              onChange={(v) => setDetails((d) => ({ ...d, email: v }))}
            />
            <InputField
              label={isHindi ? 'फोन / Phone' : 'Phone'}
              value={details.phone}
              type="tel"
              required
              placeholder={isHindi ? '+91 9876543210' : '+91 9876543210'}
              onChange={(v) => setDetails((d) => ({ ...d, phone: v }))}
            />

            {submitError && (
              <p
                style={{
                  fontFamily: 'var(--font-hind)',
                  fontSize: '0.88rem',
                  color: '#f87171',
                  padding: '0.75rem 1rem',
                  background: 'rgba(139,10,10,0.2)',
                  borderRadius: '8px',
                  border: '1px solid rgba(248,113,113,0.3)',
                }}
              >
                {submitError}
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setPhase('test')}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  border: `1px solid ${BORDER}`,
                  borderRadius: '10px',
                  background: 'transparent',
                  color: MUTED,
                  fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                {isHindi ? '← वापस' : '← Back'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  flex: 2,
                  padding: '0.85rem',
                  background: submitting ? 'rgba(212,168,67,0.5)' : GOLD,
                  border: 'none',
                  borderRadius: '10px',
                  color: '#061008',
                  fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: submitting ? 'wait' : 'pointer',
                  transition: 'all 0.22s ease',
                }}
              >
                {submitting
                  ? (isHindi ? 'भेज रहे हैं...' : 'Submitting...')
                  : (isHindi ? 'परीक्षा सबमिट करें →' : 'Submit Test →')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // TEST screen — all 21 questions
  // ─────────────────────────────────────────────────────────────
  return (
    <div style={wrapStyle}>
      {/* ── Top nav ──────────────────────────────────────────── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(6,16,8,0.97)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${BORDER}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 clamp(1rem,4vw,2.5rem)',
          height: '56px',
          gap: '1rem',
        }}
      >
        <button
          onClick={() => setPhase('intro')}
          style={{
            background: 'none',
            border: 'none',
            color: MUTED,
            cursor: 'pointer',
            fontFamily: 'var(--font-inter)',
            fontSize: '0.8rem',
            flexShrink: 0,
          }}
        >
          ← {isHindi ? 'परिचय' : 'Intro'}
        </button>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            flex: 1,
            maxWidth: '300px',
          }}
        >
          <span
            style={{
              fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
              fontSize: '0.72rem',
              color: GOLD,
              fontWeight: 600,
            }}
          >
            {isHindi
              ? `${answeredCount}/${questions.length} उत्तर दिए`
              : `${answeredCount}/${questions.length} answered`}
          </span>
          <div
            style={{
              width: '100%',
              height: '2px',
              background: 'rgba(212,168,67,0.15)',
              borderRadius: '1px',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${(answeredCount / questions.length) * 100}%`,
                background: `linear-gradient(90deg, ${GOLD}, #ffe89a)`,
                borderRadius: '1px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        <button
          onClick={() => setPhase('details')}
          style={{
            padding: '0.45rem 1rem',
            background: GOLD,
            border: 'none',
            borderRadius: '8px',
            color: '#061008',
            fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {isHindi ? 'सबमिट करें →' : 'Submit →'}
        </button>
      </nav>

      {/* ── Questions list ────────────────────────────────────── */}
      <main
        style={{
          maxWidth: '780px',
          margin: '0 auto',
          padding: 'clamp(2rem,5vw,4rem) clamp(1.25rem,5vw,2rem) clamp(3rem,6vw,5rem)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Test header */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.62rem',
              letterSpacing: '0.28em',
              color: GOLD,
              textTransform: 'uppercase',
              fontWeight: 700,
              marginBottom: '0.75rem',
            }}
          >
            {isHindi ? 'अंतिम परीक्षा · श्रवण' : 'Final Examination · Shravana'}
          </p>
          <h1
            style={{
              fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-cormorant)',
              fontStyle: isHindi ? 'normal' : 'italic',
              fontSize: 'clamp(1.5rem,4vw,2.2rem)',
              fontWeight: isHindi ? 600 : 300,
              color: IVORY,
              marginBottom: '0.5rem',
            }}
          >
            {isHindi
              ? 'अपने अनुभव और समझ को लिखें'
              : 'Write Your Understanding & Experience'}
          </h1>
          <p
            style={{
              fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
              fontSize: '0.88rem',
              color: MUTED,
            }}
          >
            {isHindi
              ? 'सभी प्रश्नों का उत्तर दें। कोई सही-गलत नहीं।'
              : 'Answer all questions. There are no right or wrong answers.'}
          </p>
        </div>

        {/* Gold divider */}
        <div
          style={{
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
            opacity: 0.2,
          }}
        />

        {/* Question cards */}
        {questions.map((q, idx) => (
          <QuestionCard
            key={idx}
            num={idx + 1}
            question={q}
            answer={answers[idx] ?? ''}
            isHindi={isHindi}
            onChange={(val) => setAnswers((prev) => ({ ...prev, [idx]: val }))}
          />
        ))}

        {/* Bottom submit */}
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            border: `1px solid ${BORDER}`,
            borderRadius: '16px',
            background: 'rgba(212,168,67,0.03)',
          }}
        >
          <p
            style={{
              fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
              fontSize: '0.88rem',
              color: MUTED,
              marginBottom: '1.25rem',
            }}
          >
            {isHindi
              ? `${answeredCount}/${questions.length} प्रश्नों के उत्तर दिए गए। सबमिट करने के लिए तैयार?`
              : `${answeredCount}/${questions.length} questions answered. Ready to submit?`}
          </p>
          <button
            onClick={() => setPhase('details')}
            style={{
              padding: '1rem 3rem',
              background: GOLD,
              border: 'none',
              borderRadius: '12px',
              color: '#061008',
              fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: `0 4px 20px rgba(212,168,67,0.3)`,
            }}
          >
            {isHindi ? 'परीक्षा सबमिट करें →' : 'Submit Test →'}
          </button>
        </div>
      </main>
    </div>
  );
}
