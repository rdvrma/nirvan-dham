'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { act, BASE } from './api';
import { useCourse } from './CourseShell';

const MIN = 20;
export default function FinalReflectionForm({ prompts, initial }: { prompts: string[]; initial: string[] }) {
  const { ui, toast } = useCourse();
  const router = useRouter();
  const [answers, setAnswers] = useState<string[]>(prompts.map((_, i) => initial[i] ?? ''));
  const [busy, setBusy] = useState(false);
  const ready = answers.every((a) => a.trim().length >= MIN);
  const submit = async () => {
    setBusy(true);
    try { await act('final-reflection', { answers }); router.push(`${BASE}/completion`); router.refresh(); }
    catch (e) { toast((e as Error).message); setBusy(false); }
  };
  return (
    <div className="ns-narrow ns-stack-l">
      {prompts.map((pr, i) => (
        <div key={i} className="ns-stack ns-rise" style={{ animationDelay: `${i * 60}ms` }}>
          <label htmlFor={`fr-${i}`} className="ns-h3" style={{ display: 'block' }}><span className="ns-gold" style={{ marginRight: 10, fontFamily: 'var(--font-cormorant)' }}>{i + 1}</span>{pr}</label>
          <textarea id={`fr-${i}`} className="ns-textarea" value={answers[i]} maxLength={8000} placeholder={ui.reflectionPlaceholder} onChange={(e) => setAnswers((a) => a.map((x, k) => (k === i ? e.target.value : x)))} />
        </div>
      ))}
      {!ready && <p className="ns-small ns-muted">{ui.finalReflectionShort}</p>}
      <button className="ns-btn" onClick={submit} disabled={!ready || busy}>{ui.finalReflectionSubmit}</button>
    </div>
  );
}
