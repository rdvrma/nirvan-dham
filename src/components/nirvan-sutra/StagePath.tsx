// The way through a stage, always visible: a three-step path at the top (film → check → complete) and a docked "next step" bar
// that names the one thing to do now and takes the seeker there. Server-rendered from progress; the client pieces refresh it.
import Link from 'next/link';
import { CompleteStage } from './Bits';
import { BASE, type T } from '@/course/nirvan-sutra/server/context';

export interface StepState { mainViewed: boolean; written: boolean; completed: boolean }
export type NextAction =
  | { kind: 'anchor'; text: string; href: string; label: string }
  | { kind: 'complete'; text: string; stage: string }
  | { kind: 'link'; text: string; href: string; label: string };

/** The one next thing to do on a stage page. */
export function nextAction(t: T, stage: string, s: StepState, after: { checkpoint: { id: string; n: number; done: boolean } | null; next: { id: string; title: string } | null }): NextAction {
  if (!s.mainViewed) return { kind: 'anchor', text: t('nextDoFilm', { button: `“${t('markWatched')}”` }), href: '#film', label: t('goThere') };
  if (!s.written) return { kind: 'anchor', text: t('nextDoCheck'), href: '#check', label: t('goThere') };
  if (!s.completed) return { kind: 'complete', text: t('nextDoComplete'), stage };
  if (after.checkpoint && !after.checkpoint.done) return { kind: 'link', text: t('nextDoCheckpoint'), href: `${BASE}/checkpoint/${after.checkpoint.id}`, label: t('checkpointN', { n: after.checkpoint.n }) };
  if (after.next) return { kind: 'link', text: t('nextDoNext'), href: `${BASE}/stage/${after.next.id}`, label: t('nextStage', { title: after.next.title }) };
  return { kind: 'link', text: t('suggestionFinal'), href: `${BASE}/final`, label: t('finalTitle') };
}

export function StageStepper({ t, s }: { t: T; s: StepState }) {
  const steps = [
    { href: '#film', label: t('mainFilm'), done: s.mainViewed },
    { href: '#check', label: t('checkLabel'), done: s.written },
    { href: '#complete', label: t('completeStage'), done: s.completed },
  ];
  const current = steps.findIndex((x) => !x.done);
  return (
    <nav className="ns-path ns-narrow" aria-label={t('pathTitle')}>
      <ol>
        {steps.map((x, i) => (
          <li key={x.href} data-state={x.done ? 'done' : i === current ? 'current' : 'todo'}>
            <a href={x.href} aria-current={i === current ? 'step' : undefined}>
              <span className="ns-path-dot" aria-hidden="true">{x.done ? '✓' : i + 1}</span>
              <span className="ns-path-label">{x.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function NextStepBar({ t, a }: { t: T; a: NextAction }) {
  return (
    <aside className="ns-nextbar" aria-label={t('nextStepLabel')}>
      <div className="ns-nextbar-inner">
        <div className="ns-nextbar-text">
          <span className="ns-nextbar-eyebrow">{t('nextStepLabel')}</span>
          <span>{a.text}</span>
        </div>
        {a.kind === 'complete'
          ? <CompleteStage stage={a.stage} ready />
          : a.kind === 'anchor'
            ? <a className="ns-btn" href={a.href}>{a.label} <span aria-hidden="true">↓</span></a>
            : <Link className="ns-btn" href={a.href}>{a.label} <span aria-hidden="true">→</span></Link>}
      </div>
    </aside>
  );
}
