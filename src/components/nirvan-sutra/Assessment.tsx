'use client';
// Section checkpoints and the final understanding assessment: a calm intro, one item at a time, then what is clear and what to revisit —
// with links to the exact stages. Grading happens on the server; nothing here decides a score.
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { act, BASE, fmt } from './api';
import { useCourse } from './CourseShell';
import { Tick } from './VideoPlayer';
import type { PublicItem } from '@/course/nirvan-sutra/server/content';

type Result = { score: number; total: number; passed: boolean; phase1Complete: boolean; results: { id: string; correct: boolean; rightPosition: number; explanation: string }[]; weakest: { stage: string; misses: number; concepts: string[] }[]; clarity: string[] };

export default function Assessment({ kind, id, title, items, stageTitles, previous }: {
  kind: 'checkpoint' | 'final'; id: string; title: string; items: PublicItem[]; stageTitles: Record<string, string>;
  previous: { score: number; total: number } | null;
}) {
  const { ui } = useCourse();
  const router = useRouter();
  const [phase, setPhase] = useState<'intro' | 'items' | 'result'>('intro');
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [res, setRes] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const it = items[i];

  const finish = async () => {
    setBusy(true);
    try { const r = await act<Result>('assessment', { kind, id, answers }); setRes(r); setPhase('result'); router.refresh(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    finally { setBusy(false); }
  };
  const restart = () => { setAnswers({}); setI(0); setRes(null); setPhase('items'); };

  if (phase === 'intro') {
    return (
      <div className="ns-narrow ns-stack-l">
        <div className="ns-panel ns-panel-glow ns-rise">
          <div className="ns-eyebrow">{ui.assessmentIntroTitle}</div>
          <p className="ns-lead" style={{ marginTop: 12 }}>{ui.assessmentIntro}</p>
          {previous && <p className="ns-small ns-muted" style={{ marginTop: 12 }}>{fmt(ui.ofTotal, { a: previous.score, b: previous.total })}</p>}
          <div className="ns-row" style={{ marginTop: 22 }}><button className="ns-btn" onClick={() => setPhase('items')}>{ui.assessmentStart}</button><Link className="ns-btn ns-btn-quiet" href={`${BASE}/dashboard`}>{ui.toJourney}</Link></div>
        </div>
      </div>
    );
  }

  if (phase === 'items') {
    return (
      <div className="ns-narrow ns-stack">
        <div className="ns-row" style={{ justifyContent: 'space-between' }}>
          <span className="ns-small ns-muted">{fmt(ui.assessmentItemN, { a: i + 1, b: items.length })}</span>
          <div className="ns-progress-dots" aria-hidden="true">{items.map((x, k) => <i key={x.id} data-on={answers[x.id] !== undefined || k === i} />)}</div>
        </div>
        <fieldset className="ns-q" key={it.id} style={{ animation: 'ns-rise 600ms var(--ns-ease) both' }}>
          <legend className="ns-sr">{fmt(ui.assessmentItemN, { a: i + 1, b: items.length })}</legend>
          <p className="ns-q-prompt">{it.prompt}</p>
          <div className="ns-opts" role="radiogroup">
            {it.options.map((o, oi) => (
              <button key={oi} role="radio" aria-checked={answers[it.id] === oi} className="ns-opt" onClick={() => setAnswers((a) => ({ ...a, [it.id]: oi }))}>
                <span className="ns-opt-key">{String.fromCharCode(65 + oi)}</span><span>{o}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <div className="ns-row" style={{ justifyContent: 'space-between' }}>
          <button className="ns-btn ns-btn-quiet" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}>← {ui.previous}</button>
          {i < items.length - 1
            ? <button className="ns-btn" onClick={() => setI((x) => x + 1)} disabled={answers[it.id] === undefined}>{ui.next} →</button>
            : <button className="ns-btn" onClick={finish} disabled={busy || Object.keys(answers).length < items.length}>{ui.assessmentFinish}</button>}
        </div>
      </div>
    );
  }

  // result: no "failed", only what is clear and what is worth seeing again
  const r = res!;
  const final = kind === 'final';
  const missed = r.results.filter((x) => !x.correct);
  return (
    <div className="ns-narrow ns-stack-l">
      <div className="ns-panel ns-panel-glow ns-rise" role="status">
        <div className="ns-eyebrow">{title}</div>
        <h2 className="ns-h2" style={{ marginTop: 10 }}>{final ? (r.passed ? ui.finalPassed : ui.finalBelow) : ui.assessmentDone}</h2>
        {final && <p className="ns-muted" style={{ marginTop: 10 }}>{r.passed ? ui.finalPassedNote : ui.finalBelowNote}</p>}
        <p className="ns-small ns-muted" style={{ marginTop: 14 }}>{fmt(ui.ofTotal, { a: r.score, b: r.total })}</p>
      </div>
      {r.clarity.length > 0 && (
        <section><h3 className="ns-h3" style={{ marginBottom: 12 }}>{ui.clarityAreas}</h3><div className="ns-row">{r.clarity.map((c) => <span key={c} className="ns-chip ns-chip-sage"><Tick /> {c}</span>)}</div></section>
      )}
      {r.weakest.length > 0 && (
        <section>
          <h3 className="ns-h3" style={{ marginBottom: 12 }}>{final ? ui.weakestConcepts : ui.revisitAreas}</h3>
          <div className="ns-areas">
            {r.weakest.map((w) => (
              <div key={w.stage} className="ns-area">
                <div><div>{stageTitles[w.stage]}</div><div className="ns-small ns-muted">{w.concepts.join(' · ')}</div></div>
                <Link className="ns-btn ns-btn-quiet" style={{ minHeight: 40, padding: '6px 16px' }} href={`${BASE}/stage/${w.stage}`}>{fmt(ui.revisitStage, { n: Number(w.stage.slice(1)) })}</Link>
              </div>
            ))}
          </div>
        </section>
      )}
      {missed.length > 0 && (
        <details className="ns-disclose">
          <summary>{ui.revisitAreas}</summary>
          <div className="ns-stack">{missed.map((m) => { const item = items.find((x) => x.id === m.id)!; return (
            <div key={m.id} className="ns-q"><p className="ns-q-prompt">{item.prompt}</p><p className="ns-small"><span className="ns-gold">{item.options[m.rightPosition]}</span></p><p className="ns-muted ns-small" style={{ marginTop: 8 }}>{m.explanation}</p></div>
          ); })}</div>
        </details>
      )}
      <div className="ns-row">
        {final && r.passed && r.phase1Complete ? <Link className="ns-btn" href={`${BASE}/phase-one-complete`}>{ui.phase1DoneCta}</Link> : null}
        {(!final || !r.passed) && <button className="ns-btn" onClick={restart}>{ui.retry}</button>}
        <Link className="ns-btn ns-btn-quiet" href={`${BASE}/dashboard`}>{ui.toJourney}</Link>
      </div>
    </div>
  );
}
