'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

// ── Design tokens ──────────────────────────────────────────────
const GOLD = '#d4a843';
const BG = '#061008';
const SURFACE = '#0d1a0f';
const BORDER = 'rgba(212,168,67,0.14)';
const MUTED = 'rgba(245,237,216,0.55)';
const IVORY = 'rgba(245,237,216,1)';

// ── Types ──────────────────────────────────────────────────────
interface MCQOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

interface MCQQuestion {
  id: number;
  question: string;
  options: MCQOption[];
  correct: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

type AnswerState = 'idle' | 'correct' | 'wrong';

// ── Option card ────────────────────────────────────────────────
function OptionCard({
  opt,
  selected,
  correct,
  answerState,
  onSelect,
}: {
  opt: MCQOption;
  selected: boolean;
  correct: boolean;
  answerState: AnswerState;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const answered = answerState !== 'idle';

  let bg = 'rgba(13,26,15,0.7)';
  let border = BORDER;
  let color = IVORY;
  let keyBg = 'rgba(212,168,67,0.08)';
  let keyColor = GOLD;

  if (answered) {
    if (correct) {
      bg = 'rgba(26,92,53,0.35)';
      border = '#4ade80';
      color = '#86efac';
      keyBg = 'rgba(74,222,128,0.18)';
      keyColor = '#4ade80';
    } else if (selected) {
      bg = 'rgba(139,10,10,0.35)';
      border = '#f87171';
      color = '#fca5a5';
      keyBg = 'rgba(248,113,113,0.18)';
      keyColor = '#f87171';
    } else {
      bg = 'rgba(13,26,15,0.4)';
      border = 'rgba(212,168,67,0.07)';
      color = 'rgba(245,237,216,0.3)';
      keyBg = 'rgba(212,168,67,0.04)';
      keyColor = 'rgba(212,168,67,0.3)';
    }
  } else if (hovered) {
    bg = 'rgba(212,168,67,0.07)';
    border = 'rgba(212,168,67,0.35)';
  }

  return (
    <button
      onClick={answered ? undefined : onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={answered}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        width: '100%',
        padding: '1.1rem 1.3rem',
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: '14px',
        cursor: answered ? 'default' : 'pointer',
        textAlign: 'left',
        transition: 'all 0.22s ease',
        transform: !answered && hovered ? 'translateX(4px)' : 'none',
      }}
    >
      {/* Option key badge */}
      <span
        style={{
          flexShrink: 0,
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: keyBg,
          border: `1px solid ${keyColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-inter)',
          fontSize: '0.78rem',
          fontWeight: 800,
          color: keyColor,
          transition: 'all 0.22s ease',
        }}
      >
        {answered && correct ? '✓' : answered && selected && !correct ? '✗' : opt.key}
      </span>

      <span
        style={{
          fontFamily: 'var(--font-hind)',
          fontSize: '1rem',
          lineHeight: 1.7,
          color,
          flex: 1,
          paddingTop: '0.15rem',
          transition: 'color 0.22s ease',
        }}
      >
        {opt.text}
      </span>
    </button>
  );
}

// ── Score card ─────────────────────────────────────────────────
function ScoreCard({
  score,
  total,
  lang,
  chapterNum,
}: {
  score: number;
  total: number;
  lang: string;
  chapterNum: number;
}) {
  const isHindi = lang === 'hi';
  const pct = Math.round((score / total) * 100);
  const isLast = chapterNum === 8;
  const router = useRouter();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '1.5rem',
        padding: 'clamp(2rem,5vw,4rem)',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      {/* Decorative circle */}
      <div
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: `2px solid ${GOLD}`,
          background: 'rgba(212,168,67,0.06)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 40px rgba(212,168,67,0.2)`,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontStyle: 'italic',
            fontSize: '2.2rem',
            color: GOLD,
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '0.65rem',
            color: MUTED,
            letterSpacing: '0.1em',
          }}
        >
          / {total}
        </span>
      </div>

      <div>
        <h2
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
            ? `आपने ${score}/${total} सही किए 🙏`
            : `You got ${score}/${total} correct 🙏`}
        </h2>
        <p
          style={{
            fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
            fontSize: '1rem',
            color: MUTED,
          }}
        >
          {pct >= 80
            ? (isHindi ? 'उत्कृष्ट! आपकी समझ गहरी है।' : 'Excellent! Your understanding is deep.')
            : pct >= 60
            ? (isHindi ? 'अच्छा! थोड़ा और अभ्यास करें।' : 'Good! A little more practice will help.')
            : (isHindi ? 'पुनः अध्याय पढ़ें और फिर प्रयास करें।' : 'Review the chapter and try again.')}
        </p>
      </div>

      {/* Next action */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '320px' }}>
        {isLast ? (
          <a
            href={`/course/${lang}/final-test`}
            style={{
              display: 'block',
              padding: '1rem 2rem',
              background: GOLD,
              color: '#061008',
              borderRadius: '12px',
              fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
              fontSize: '1rem',
              fontWeight: 700,
              textDecoration: 'none',
              textAlign: 'center',
              boxShadow: `0 4px 20px rgba(212,168,67,0.35)`,
            }}
          >
            {isHindi ? 'अंतिम परीक्षा दें →' : 'Take Final Test →'}
          </a>
        ) : (
          <a
            href={`/course/${lang}/${chapterNum + 1}`}
            style={{
              display: 'block',
              padding: '1rem 2rem',
              background: GOLD,
              color: '#061008',
              borderRadius: '12px',
              fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
              fontSize: '1rem',
              fontWeight: 700,
              textDecoration: 'none',
              textAlign: 'center',
              boxShadow: `0 4px 20px rgba(212,168,67,0.35)`,
            }}
          >
            {isHindi
              ? `अगले अध्याय पर जाएं → (${chapterNum + 1}/${8})`
              : `Next Chapter → (${chapterNum + 1}/${8})`}
          </a>
        )}

        <a
          href={`/course/${lang}/${chapterNum}`}
          style={{
            display: 'block',
            padding: '0.75rem 2rem',
            border: `1px solid ${BORDER}`,
            borderRadius: '12px',
            color: MUTED,
            fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
            fontSize: '0.88rem',
            textDecoration: 'none',
            textAlign: 'center',
          }}
        >
          {isHindi ? '← अध्याय पुनः पढ़ें' : '← Re-read Chapter'}
        </a>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────
export default function PracticePage() {
  const params = useParams();
  const lang = (params?.lang as string) ?? 'hi';
  const chapter = (params?.chapter as string) ?? '1';
  const chapterNum = parseInt(chapter, 10);

  const isHindi = lang === 'hi';

  const [mounted, setMounted] = useState(false);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedKey, setSelectedKey] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [explanationVisible, setExplanationVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/course/questions?lang=${lang}&chapter=${chapterNum}`
      );
      if (res.status === 404) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setQuestions(data.questions ?? data ?? []);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  const currentQ = questions[currentIdx];

  function handleSelect(key: 'A' | 'B' | 'C' | 'D') {
    if (answerState !== 'idle') return;
    setSelectedKey(key);
    const isCorrect = key === currentQ.correct;
    setAnswerState(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) setScore((s) => s + 1);
    // Delay showing explanation slightly for animation effect
    setTimeout(() => setExplanationVisible(true), 120);
    // Mark progress in localStorage
    if (typeof window !== 'undefined') {
      const key2 = `course-chapter-${lang}-${chapterNum}`;
      localStorage.setItem(key2, 'practice-started');
    }
  }

  function handleNext() {
    if (currentIdx + 1 >= questions.length) {
      // Mark chapter complete
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          `course-chapter-${lang}-${chapterNum}`,
          'complete'
        );
      }
      setShowScore(true);
    } else {
      setCurrentIdx((i) => i + 1);
      setSelectedKey(null);
      setAnswerState('idle');
      setExplanationVisible(false);
    }
  }

  // ── Loading state ─────────────────────────────────────────
  if (!mounted || loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: BG,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            border: `2px solid ${BORDER}`,
            borderTop: `2px solid ${GOLD}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p
          style={{
            fontFamily: 'var(--font-hind)',
            fontSize: '1rem',
            color: MUTED,
          }}
        >
          {isHindi ? 'प्रश्न लोड हो रहे हैं...' : 'Loading questions...'}
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Not found state ───────────────────────────────────────
  if (notFound || questions.length === 0) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: BG,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          padding: '2rem',
          textAlign: 'center',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <span style={{ fontSize: '3rem' }}>🌸</span>
        <h2
          style={{
            fontFamily: 'var(--font-hind)',
            fontSize: 'clamp(1.35rem,4vw,1.75rem)',
            fontWeight: 600,
            color: IVORY,
          }}
        >
          {isHindi ? 'प्रश्न जल्द उपलब्ध होंगे' : 'Questions Coming Soon'}
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-hind)',
            fontSize: '1rem',
            color: MUTED,
            maxWidth: '420px',
            lineHeight: 1.8,
          }}
        >
          {isHindi
            ? `अध्याय ${chapterNum} के अभ्यास प्रश्न शीघ्र ही जोड़े जाएंगे।`
            : `Practice questions for Chapter ${chapterNum} will be added soon.`}
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {chapterNum < 8 && (
            <a
              href={`/course/${lang}/${chapterNum + 1}`}
              style={{
                padding: '0.85rem 2rem',
                background: GOLD,
                color: '#061008',
                borderRadius: '10px',
                fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
                fontSize: '0.95rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              {isHindi ? 'अगले अध्याय पर जाएं →' : 'Next Chapter →'}
            </a>
          )}
          {chapterNum === 8 && (
            <a
              href={`/course/${lang}/final-test`}
              style={{
                padding: '0.85rem 2rem',
                background: GOLD,
                color: '#061008',
                borderRadius: '10px',
                fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
                fontSize: '0.95rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              {isHindi ? 'अंतिम परीक्षा दें →' : 'Take Final Test →'}
            </a>
          )}
          <a
            href={`/course/${lang}/${chapterNum}`}
            style={{
              padding: '0.85rem 2rem',
              border: `1px solid ${BORDER}`,
              color: MUTED,
              borderRadius: '10px',
              fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
              fontSize: '0.88rem',
              textDecoration: 'none',
            }}
          >
            {isHindi ? '← अध्याय पुनः पढ़ें' : '← Back to Chapter'}
          </a>
        </div>
      </div>
    );
  }

  // ── Score screen ──────────────────────────────────────────
  if (showScore) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: BG,
          color: IVORY,
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            background: 'rgba(6,16,8,0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${BORDER}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 clamp(1rem,4vw,2.5rem)',
            height: '56px',
          }}
        >
          <a
            href={`/course/${lang}/${chapterNum}`}
            style={{
              color: MUTED,
              textDecoration: 'none',
              fontFamily: 'var(--font-inter)',
              fontSize: '0.8rem',
            }}
          >
            ← {isHindi ? 'अध्याय' : 'Chapter'} {chapterNum}
          </a>
        </div>

        <div
          style={{
            padding: 'clamp(3rem,7vw,6rem) clamp(1.25rem,5vw,2.5rem)',
          }}
        >
          <ScoreCard
            score={score}
            total={questions.length}
            lang={lang}
            chapterNum={chapterNum}
          />
        </div>
      </div>
    );
  }

  // ── Question view ─────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: '100vh',
        background: BG,
        color: IVORY,
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* ── Top nav ──────────────────────────────────────── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(6,16,8,0.95)',
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
        <a
          href={`/course/${lang}/${chapterNum}`}
          style={{
            color: MUTED,
            textDecoration: 'none',
            fontFamily: 'var(--font-inter)',
            fontSize: '0.8rem',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          ← {isHindi ? 'अध्याय' : 'Ch.'} {chapterNum}
        </a>

        {/* Progress */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            flex: 1,
            maxWidth: '320px',
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
              ? `प्रश्न ${currentIdx + 1} / ${questions.length}`
              : `Question ${currentIdx + 1} / ${questions.length}`}
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
                width: `${((currentIdx + (answerState !== 'idle' ? 1 : 0)) / questions.length) * 100}%`,
                background: `linear-gradient(90deg, ${GOLD}, #ffe89a)`,
                borderRadius: '1px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Score chip */}
        <div
          style={{
            padding: '0.25rem 0.7rem',
            border: `1px solid rgba(74,222,128,0.3)`,
            borderRadius: '6px',
            color: '#86efac',
            fontFamily: 'var(--font-inter)',
            fontSize: '0.7rem',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          ✓ {score}
        </div>
      </nav>

      {/* ── Question area ─────────────────────────────────── */}
      <main
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: 'clamp(2.5rem,5vw,4rem) clamp(1.25rem,5vw,2rem)',
        }}
      >
        {/* Question card */}
        <div
          style={{
            marginBottom: '2rem',
            padding: 'clamp(1.5rem,4vw,2.5rem)',
            borderRadius: '20px',
            background: SURFACE,
            border: `1px solid ${BORDER}`,
          }}
        >
          {/* Q number */}
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '0.62rem',
              letterSpacing: '0.22em',
              color: GOLD,
              textTransform: 'uppercase',
              fontWeight: 700,
              marginBottom: '1rem',
            }}
          >
            {isHindi ? `प्रश्न ${currentIdx + 1}` : `Q ${currentIdx + 1}`}
          </p>
          {/* Question text */}
          <p
            style={{
              fontFamily: 'var(--font-hind)',
              fontSize: 'clamp(1rem,2.5vw,1.2rem)',
              lineHeight: 1.85,
              color: IVORY,
              fontWeight: 500,
            }}
          >
            {currentQ.question}
          </p>
        </div>

        {/* Options */}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
        >
          {currentQ.options.map((opt) => (
            <OptionCard
              key={opt.key}
              opt={opt}
              selected={selectedKey === opt.key}
              correct={opt.key === currentQ.correct}
              answerState={answerState}
              onSelect={() => handleSelect(opt.key)}
            />
          ))}
        </div>

        {/* Explanation */}
        {answerState !== 'idle' && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.5rem',
              borderRadius: '14px',
              background:
                answerState === 'correct'
                  ? 'rgba(26,92,53,0.2)'
                  : 'rgba(92,26,26,0.2)',
              border: `1px solid ${
                answerState === 'correct'
                  ? 'rgba(74,222,128,0.25)'
                  : 'rgba(248,113,113,0.25)'
              }`,
              opacity: explanationVisible ? 1 : 0,
              transform: explanationVisible
                ? 'translateY(0)'
                : 'translateY(12px)',
              transition: 'all 0.35s ease',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
                color:
                  answerState === 'correct' ? '#4ade80' : '#f87171',
                fontWeight: 700,
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
              }}
            >
              {answerState === 'correct'
                ? (isHindi ? '✓ सही उत्तर' : '✓ Correct')
                : (isHindi ? '✗ गलत उत्तर' : '✗ Incorrect')}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-hind)',
                fontSize: '0.95rem',
                lineHeight: 1.85,
                color: MUTED,
              }}
            >
              {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Next button */}
        {answerState !== 'idle' && (
          <div
            style={{
              marginTop: '1.75rem',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <button
              onClick={handleNext}
              style={{
                padding: '0.9rem 2.5rem',
                background: GOLD,
                color: '#061008',
                border: 'none',
                borderRadius: '12px',
                fontFamily: isHindi ? 'var(--font-hind)' : 'var(--font-inter)',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: `0 4px 20px rgba(212,168,67,0.3)`,
              }}
            >
              {currentIdx + 1 >= questions.length
                ? (isHindi ? 'परिणाम देखें →' : 'See Results →')
                : (isHindi ? 'अगला प्रश्न →' : 'Next Question →')}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
