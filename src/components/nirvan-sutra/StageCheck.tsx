'use client';
// The three-question understanding check of a stage. Each answer is graded on the server; a miss is never "failed" — it names the distinction that is
// not clear yet, explains it from the approved teaching, points to the part to revisit, and lets the learner try again (unlimited).
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { act } from './api';
import { useCourse } from './CourseShell';
import { Tick } from './VideoPlayer';
import type { PublicItem } from '@/course/nirvan-sutra/server/content';

type Fb = { correct: boolean; explanation: string; revisit: string | null; rightPosition: number | null; chosen: number };

export default function StageCheck({ stage, items, cleared }: { stage: string; items: PublicItem[]; cleared: string[] }) {
  const { ui } = useCourse();
  const router = useRouter();
  const [done, setDone] = useState<string[]>(cleared);
  const [fb, setFb] = useState<Record<string, Fb | null>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const answer = async (it: PublicItem, pos: number) => {
    setBusy(it.id);
    try {
      const r = await act<{ correct: boolean; explanation: string; revisit: string | null; rightPosition: number | null; passed: boolean }>('check', { stage, itemId: it.id, answer: pos });
      setFb((f) => ({ ...f, [it.id]: { ...r, chosen: pos } }));
      if (r.correct) setDone((d) => [...new Set([...d, it.id])]);
      if (r.passed) router.refresh();
    } finally { setBusy(null); }
  };
  const allClear = items.every((i) => done.includes(i.id));

  return (
    <div className="ns-stack">
      <div className="ns-progress-dots" aria-hidden="true">{items.map((i) => <i key={i.id} data-on={done.includes(i.id)} />)}</div>
      {items.map((it, qi) => {
        const f = fb[it.id];
        const clear = done.includes(it.id);
        const locked = !!f || (clear && !f);
        return (
          <fieldset key={it.id} className="ns-q" aria-describedby={f ? `${it.id}-fb` : undefined}>
            <legend className="ns-sr">{ui.questionN?.replace('{n}', String(qi + 1))}</legend>
            <p className="ns-q-prompt"><span className="ns-gold" style={{ marginRight: 8 }}>{qi + 1}.</span>{it.prompt}</p>
            <div className="ns-opts" role="radiogroup">
              {it.options.map((o, oi) => {
                const result = f ? (f.correct && oi === f.chosen ? 'right' : !f.correct && oi === f.chosen ? 'wrong' : undefined) : undefined;
                return (
                  <button key={oi} role="radio" aria-checked={f?.chosen === oi} className="ns-opt" data-result={result} disabled={locked || busy === it.id} onClick={() => answer(it, oi)}>
                    <span className="ns-opt-key">{String.fromCharCode(65 + oi)}</span><span>{o}</span>
                  </button>
                );
              })}
            </div>
            {clear && !f && <div className="ns-feedback ns-feedback-ok"><div className="ns-feedback-title"><Tick /> {ui.checkCorrect}</div></div>}
            {f && (
              <div id={`${it.id}-fb`} className={`ns-feedback ${f.correct ? 'ns-feedback-ok' : 'ns-feedback-soft'}`} role="status" aria-live="polite">
                <div className="ns-feedback-title">{f.correct ? <><Tick /> {ui.checkCorrect}</> : ui.checkWrong}</div>
                <p className="ns-muted">{f.explanation}</p>
                {!f.correct && f.revisit && <p className="ns-small" style={{ marginTop: 8 }}><span className="ns-gold">{ui.checkRevisit}:</span> {f.revisit}</p>}
                {!f.correct && <button className="ns-btn ns-btn-quiet" style={{ marginTop: 12 }} onClick={() => setFb((x) => ({ ...x, [it.id]: null }))}>{ui.retry}</button>}
              </div>
            )}
          </fieldset>
        );
      })}
      {allClear && <p className="ns-gold" role="status">{ui.checkAllClear}</p>}
    </div>
  );
}
