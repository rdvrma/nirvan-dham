'use client';

import { useEffect, useRef, useState } from 'react';
import type { Prompt } from '@/lib/video-course/manifest';
import type { TrackLanguage } from '@/lib/video-course/config';
import type { PlayerCopy } from './copy';

const GOLD = '#d4a843';

/**
 * The reflection panel. It opens BELOW the player (never over it), shows the prompts in the caption language, a text area for each, and a Continue button.
 * Continue unlocks when the learner has written something, or after `skipDelaySec` (so a learner who only wants to look within is never held back).
 * Nothing here shows scores, source flags or anything but the questions.
 */
export function ReflectionPanel({ prompts, lang, copy, skipDelaySec, initialAnswers, onContinue }: {
  prompts: Prompt[];
  lang: TrackLanguage;
  copy: PlayerCopy;
  skipDelaySec: number;
  initialAnswers?: string[];
  onContinue: (answers: string[]) => void | Promise<void>;
}) {
  const [answers, setAnswers] = useState<string[]>(() => prompts.map((_, i) => initialAnswers?.[i] ?? ''));
  const [left, setLeft] = useState(skipDelaySec);
  const [busy, setBusy] = useState(false);
  const first = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    first.current?.focus({ preventScroll: false });
    setLeft(skipDelaySec);
    const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [skipDelaySec, prompts]);

  const wrote = answers.some((a) => a.trim().length > 0);
  const canContinue = (wrote || left === 0) && !busy;
  const text = (p: Prompt) => (lang === 'en' && p.en ? p.en : p.hi);

  async function go() {
    setBusy(true);
    try { await onContinue(answers); } finally { setBusy(false); }
  }

  return (
    <section
      role="region"
      aria-labelledby="reflect-title"
      data-testid="reflection-panel"
      style={{ marginTop: '1rem', padding: 'clamp(1rem, 3vw, 1.6rem)', border: '1px solid rgba(212,168,67,0.22)', borderRadius: '12px', background: 'linear-gradient(145deg, rgba(18,36,21,0.92), rgba(6,16,8,0.96))' }}
    >
      <h2 id="reflect-title" style={{ margin: '0 0 0.35rem', fontFamily: 'var(--font-cormorant), serif', fontWeight: 500, fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', color: '#f5edd8' }}>{copy.reflectTitle}</h2>
      <p style={{ margin: '0 0 1rem', color: 'rgba(245,237,216,0.62)', fontFamily: 'var(--font-hind), var(--font-inter), sans-serif', fontSize: '0.88rem', lineHeight: 1.6 }}>{copy.reflectHint}</p>
      {prompts.map((p, i) => (
        <div key={i} style={{ marginBottom: '1rem' }}>
          <label htmlFor={`reflect-${i}`} style={{ display: 'block', margin: '0 0 0.5rem', color: GOLD, fontFamily: 'var(--font-hind), var(--font-inter), sans-serif', fontSize: '1.02rem', lineHeight: 1.55 }}>
            {text(p)}
          </label>
          <textarea
            id={`reflect-${i}`}
            ref={i === 0 ? first : undefined}
            value={answers[i]}
            onChange={(e) => setAnswers((a) => a.map((x, k) => (k === i ? e.target.value : x)))}
            rows={3}
            maxLength={4000}
            aria-label={copy.answerLabel(i + 1, prompts.length)}
            lang={lang}
            style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', padding: '0.8rem 0.9rem', borderRadius: '8px', border: '1px solid rgba(212,168,67,0.25)', background: 'rgba(4,12,6,0.72)', color: 'rgba(245,237,216,1)', fontFamily: 'var(--font-hind), var(--font-inter), sans-serif', fontSize: '1rem', lineHeight: 1.6, outline: 'none' }}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={go}
        disabled={!canContinue}
        data-testid="reflection-continue"
        style={{ border: 0, borderRadius: '8px', padding: '0.85rem 1.4rem', background: canContinue ? GOLD : 'rgba(212,168,67,0.25)', color: canContinue ? '#061008' : 'rgba(245,237,216,0.6)', fontFamily: 'var(--font-inter), system-ui, sans-serif', fontWeight: 700, fontSize: '0.92rem', cursor: canContinue ? 'pointer' : 'not-allowed', minHeight: '44px' }}
      >
        {busy ? copy.saving : !wrote && left > 0 ? copy.continueIn(left) : copy.continueLabel}
      </button>
    </section>
  );
}
