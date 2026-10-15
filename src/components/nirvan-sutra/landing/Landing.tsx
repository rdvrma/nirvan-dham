import Link from 'next/link';
import BrandMark from '../BrandMark';
import { Orb } from '../Graphics';
import type { LocaleCode } from '@/course/nirvan-sutra/types';

export interface LandingData {
  locale: LocaleCode;
  native: string;
  ui: Record<string, string>;
  stats: { stages: number; questions: number; checkpoints: number; weeks: number; languages: number };
  movements: { id: string; title: string; subtitle: string; stages: { n: number; title: string; subtitle: string; inquiry: string }[] }[];
  cta: { href: string; label: string };
  login: string | null;
}

const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));

// The introduction of Nirvan Sutra in the seeker's language. Server-rendered; motion is CSS only and settles under reduced motion.
export default function Landing({ d }: { d: LandingData }) {
  const { ui, stats } = d;
  const first = d.movements[0]?.stages[0];
  const enrolled = d.cta.href.endsWith('/dashboard');

  return (
    <>
      <a className="ns-skip" href="#nsl-main">{ui.skipToContent}</a>
      <header className="nsl-top">
        <Link href="/" className="ns-brand" aria-label={ui.brandSub}>
          <BrandMark />
          <span>
            <span className="ns-brand-name">{ui.brand}</span>
            <span className="ns-brand-sub" style={{ display: 'block' }}>{ui.brandSub}</span>
          </span>
        </Link>
        <nav className="nsl-top-nav" aria-label={ui.language}>
          <Link href="/course?choose=1" className="nsl-langpill" aria-label={`${ui.changeLanguage}: ${d.native}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" /></svg>
            <span>{d.native}</span>
          </Link>
          <Link href={d.cta.href} className="nsl-top-cta">{d.cta.label}</Link>
        </nav>
      </header>

      <main id="nsl-main">
        {/* ── hero ─────────────────────────────────────────── */}
        <section className="nsl-hero">
          <video className="nsl-bgvideo" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" src="/course-videos/hero.mp4" />
          <div className="nsl-veil" aria-hidden="true" />
          <div className="nsl-hero-inner">
            <p className="ns-eyebrow ns-rise">{ui.introEyebrow}</p>
            <h1 className="nsl-title ns-rise ns-rise-1">{ui.brand}</h1>
            <p className="nsl-tagline ns-rise ns-rise-2">{ui.introTitle}</p>
            <p className="nsl-hero-body ns-rise ns-rise-3">{ui.introBody1}</p>
            <div className="nsl-hero-actions ns-rise ns-rise-4">
              <Cta cta={d.cta} big />
              <a href="#journey" className="nsl-ghost">{ui.lSeeJourney}</a>
            </div>
            <p className="nsl-hero-lang ns-rise ns-rise-4">
              <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" /></svg>
              {ui.chooseLanguageNote}
            </p>
          </div>
          <a href="#nsl-stats" className="nsl-scrollcue" aria-hidden="true" tabIndex={-1}><span /></a>
        </section>

        {/* ── numbers ──────────────────────────────────────── */}
        <section id="nsl-stats" className="nsl-stats nsl-reveal" aria-label={ui.journeyMap}>
          {([
            [stats.stages, ui.lStatStages],
            [stats.questions, ui.lStatQuestions],
            [stats.checkpoints, ui.lStatCheckpoints],
            [stats.weeks, ui.lStatWeeks],
            [stats.languages, ui.lStatLanguages],
          ] as const).map(([n, label]) => (
            <div key={label} className="nsl-stat"><span className="nsl-stat-n">{n}</span><span className="nsl-stat-l">{label}</span></div>
          ))}
        </section>

        {/* ── the first inquiry ────────────────────────────── */}
        {first?.inquiry && (
          <section className="nsl-inquiry nsl-reveal">
            <div className="nsl-inquiry-orb"><Orb size={96} /></div>
            <p className="nsl-inquiry-text">{first.inquiry}</p>
            <p className="nsl-inquiry-src">{fill(ui.stageN, { n: 1 })} · {first.title}</p>
          </section>
        )}

        <div className="nsl-wrap">
          {/* ── two parts ──────────────────────────────────── */}
          <section className="nsl-section nsl-reveal" aria-labelledby="nsl-phases">
            <h2 id="nsl-phases" className="nsl-h2">{ui.lPhasesTitle}</h2>
            <div className="nsl-phases">
              <article className="nsl-phase">
                <span className="nsl-phase-num" aria-hidden="true">I</span>
                <h3 className="nsl-h3">{ui.phase1}</h3>
                <p className="nsl-phase-sub">{ui.phase1Sub}</p>
                <p className="nsl-phase-body">{ui.lPhase1Body}</p>
              </article>
              <div className="nsl-phase-link" aria-hidden="true"><span /></div>
              <article className="nsl-phase">
                <span className="nsl-phase-num" aria-hidden="true">II</span>
                <h3 className="nsl-h3">{ui.phase2}</h3>
                <p className="nsl-phase-sub">{ui.phase2Sub}</p>
                <p className="nsl-phase-body">{ui.lPhase2Body}</p>
              </article>
            </div>
          </section>

          {/* ── inside a stage ─────────────────────────────── */}
          <section className="nsl-section nsl-reveal" aria-labelledby="nsl-inside">
            <h2 id="nsl-inside" className="nsl-h2">{ui.lInsideTitle}</h2>
            <p className="nsl-sub">{ui.introBody2}</p>
            <ol className="nsl-inside">
              {([
                ['film', ui.mainFilm, ui.lFilmDesc],
                ['essence', ui.essenceLabel, ui.lEssenceDesc],
                ['observe', ui.observationLabel, ui.lObserveDesc],
                ['check', ui.checkLabel, ui.lCheckDesc],
                ['deeper', ui.deeperLabel, ui.lDeeperDesc],
              ] as const).map(([icon, title, body]) => (
                <li key={icon} className="nsl-inside-item">
                  <span className="nsl-icon"><Icon name={icon} /></span>
                  <span className="nsl-inside-title">{title}</span>
                  <span className="nsl-inside-body">{body}</span>
                </li>
              ))}
            </ol>
            <p className="nsl-note">{ui.lFilmsSoon}</p>
          </section>

          {/* ── the seventeen stages ───────────────────────── */}
          <section id="journey" className="nsl-section nsl-reveal" aria-labelledby="nsl-map">
            <h2 id="nsl-map" className="nsl-h2">{ui.journeyMap}</h2>
            <p className="nsl-sub">{ui.lMapSub}</p>
            <div className="nsl-map">
              {d.movements.map((m, mi) => (
                <div key={m.id} className="nsl-mv">
                  <div className="nsl-mv-head">
                    <span className="nsl-mv-n">{fill(ui.lMovementN, { n: mi + 1 })}</span>
                    <h3 className="nsl-h3">{m.title}</h3>
                    <p className="nsl-mv-sub">{m.subtitle}</p>
                  </div>
                  <ol className="nsl-stages">
                    {m.stages.map((s) => (
                      <li key={s.n} className="nsl-stage">
                        <span className="nsl-stage-n">{String(s.n).padStart(2, '0')}</span>
                        <div className="nsl-stage-text">
                          <span className="nsl-stage-title">{s.title}</span>
                          {s.subtitle && <span className="nsl-stage-sub">{s.subtitle}</span>}
                          {s.inquiry && <span className="nsl-stage-q">{s.inquiry}</span>}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
              <div className="nsl-mv nsl-mv-nid">
                <div className="nsl-mv-head">
                  <span className="nsl-mv-n">{stats.weeks} · {ui.lStatWeeks}</span>
                  <h3 className="nsl-h3">{ui.phase2}</h3>
                  <p className="nsl-mv-sub">{ui.phase2Sub}</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── how to begin ───────────────────────────────── */}
          {!enrolled ? (
            <section className="nsl-section nsl-reveal" aria-labelledby="nsl-steps">
              <h2 id="nsl-steps" className="nsl-h2">{ui.lStepsTitle}</h2>
              <ol className="nsl-steps">
                {[ui.lStep1, ui.lStep2, ui.lStep3].map((s, i) => (
                  <li key={i} className="nsl-step"><span className="nsl-step-n">{i + 1}</span><span>{s}</span></li>
                ))}
              </ol>
            </section>
          ) : null}

          {/* ── honest word + final call ───────────────────── */}
          <section className="nsl-final nsl-reveal">
            <p className="nsl-honest">{ui.lHonest}</p>
            <p className="nsl-final-title">{enrolled ? ui.continueTitle : ui.startTitle}</p>
            <Cta cta={d.cta} big />
            <div className="nsl-final-links">
              {d.login && <Link href={d.login}>{ui.lHaveAccount}</Link>}
              <Link href="/course?choose=1">{ui.changeLanguage}</Link>
            </div>
          </section>
        </div>
      </main>

      <footer className="nsl-foot">
        <BrandMark size={28} className="" />
        <span>{ui.brand} · {ui.brandSub}</span>
      </footer>

      {/* phones: the way in is always one tap away */}
      <div className="nsl-dock"><Cta cta={d.cta} /></div>
    </>
  );
}

function Cta({ cta, big = false }: { cta: LandingData['cta']; big?: boolean }) {
  return (
    <Link href={cta.href} className={`nsl-cta${big ? ' nsl-cta-big' : ''}`}>
      <span>{cta.label}</span>
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
    </Link>
  );
}

function Icon({ name }: { name: 'film' | 'essence' | 'observe' | 'check' | 'deeper' }) {
  const p = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, 'aria-hidden': true } as const;
  switch (name) {
    case 'film': return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M10 9.5v5l4.5-2.5z" /></svg>;
    case 'essence': return <svg {...p}><path d="M6 4h9l3 3v13H6z" /><path d="M9 10h6M9 13h6M9 16h4" /></svg>;
    case 'observe': return <svg {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.6" /></svg>;
    case 'check': return <svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M8.5 12.3l2.4 2.4 4.6-5" /></svg>;
    case 'deeper': return <svg {...p}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.6" /></svg>;
  }
}
