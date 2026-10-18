import Link from 'next/link';
import { enrolledContext, BASE } from '@/course/nirvan-sutra/server/context';
import { allStages, programView, questionView } from '@/course/nirvan-sutra/server/content';
import * as E from '@/course/nirvan-sutra/engine';
import { CHECKPOINTS, PROGRAM, MOVEMENTS, stageNumber } from '@/course/nirvan-sutra/structure';
import JourneyMap from '@/components/nirvan-sutra/JourneyMap';
import LanguagePreferenceSync from '@/components/nirvan-sutra/LanguagePreferenceSync';
import { Orb } from '@/components/nirvan-sutra/Graphics';

export default async function Dashboard() {
  const { progress: p, locale, t, ui } = await enrolledContext();
  const stages = allStages(locale);
  const prog = programView(locale);
  const cur = E.currentStage(p);
  const curView = cur ? stages.find((s) => s.id === cur)! : null;
  const stagesDone = p.stagesCompleted.length;
  const qDone = p.questionsViewed.length;
  const nidWeek = E.nididhyasanaWeek(p);

  // where "continue" leads: the last place visited, if it is still open, else the next step of the journey
  let cont: { href: string; eyebrow: string; title: string; sub: string };
  const lv = p.lastVisited;
  if (lv?.kind === 'question' && E.isStageUnlocked(p, lv.id.slice(3, 6))) {
    const q = questionView(locale, lv.id);
    cont = { href: `${BASE}/stage/${q.stage}/question/${q.id}`, eyebrow: t('inquiryEyebrow', { n: q.n, s: stageNumber(q.stage) }), title: q.text, sub: stages.find((s) => s.id === q.stage)!.text.title };
  } else if (curView) {
    cont = { href: `${BASE}/stage/${curView.id}`, eyebrow: t('stageN', { n: curView.n }), title: curView.text.title, sub: curView.text.centralInquiry };
  } else if (!E.finalPassed(p)) {
    cont = { href: `${BASE}/final`, eyebrow: t('phase1'), title: t('finalTitle'), sub: t('finalSub') };
  } else if (!p.nididhyasana.startedAt) {
    cont = { href: `${BASE}/phase-one-complete`, eyebrow: t('phase2'), title: t('phase1DoneTitle'), sub: t('phase1DoneBody') };
  } else {
    cont = { href: `${BASE}/nididhyasana`, eyebrow: t('phase2'), title: t('nidStatus'), sub: nidWeek && nidWeek <= 12 ? t('nidWeekOf', { n: nidWeek }) : t('nidComplete') };
  }

  const suggestion = (() => {
    if (p.nididhyasana.startedAt && nidWeek && nidWeek <= 12) return t('suggestionNid', { pointer: prog.nididhyasana.weeks[nidWeek - 1]?.pointer ?? '' });
    if (!cur) return t('suggestionFinal');
    if (!p.mainViewed.includes(cur)) return t('suggestionWatch', { n: stageNumber(cur) });
    if (!E.stageWritten(p, cur)) return t('suggestionCheck');
    return t('suggestionQuestions');
  })();

  const movement = curView?.movement ?? 'M4';
  const mProg = E.movementProgress(p).find((m) => m.id === movement)!;
  const reflections = Object.entries(p.reflections).sort((a, b) => b[1].at.localeCompare(a[1].at)).slice(0, 3);
  const mapStages = stages.map((s) => ({ id: s.id, n: s.n, title: s.text.title, inquiry: s.text.centralInquiry, state: E.stageState(p, s.id), movement: s.movement }));
  const mapMoves = MOVEMENTS.map((m, i) => ({ id: m.id, title: prog.movements[m.id].title, label: ['I', 'II', 'III', 'IV'][i] }));
  const firstVisit = !p.lastVisited && stagesDone === 0;

  return (
    <div>
      <LanguagePreferenceSync chosen={locale} saved={p.locale} />
      {/* 1. warm entry */}
      <section className="ns-hero">
        <div className="ns-stack">
          <div className="ns-eyebrow ns-rise">{t('phase1')} · {t('phase1Sub')}</div>
          <h1 className="ns-h1 ns-rise ns-rise-1">{firstVisit ? t('welcomeFirst') : p.name ? t('welcomeNamed', { name: p.name }) : t('welcome')}</h1>
          <p className="ns-lead ns-rise ns-rise-2">{t('journeyDescription')}</p>
        </div>
        {/* 2. continue */}
        <Link href={cont.href} className="ns-panel ns-panel-glow ns-continue ns-rise ns-rise-2" aria-label={`${firstVisit ? t('startTitle') : t('continueTitle')}: ${cont.title}`}>
          <div className="ns-eyebrow">{firstVisit ? t('startTitle') : t('continueTitle')}</div>
          <div className="ns-small ns-muted" style={{ marginTop: 14 }}>{cont.eyebrow}</div>
          <div className="ns-h2" style={{ marginTop: 4 }}>{cont.title}</div>
          <p className="ns-inquiry" style={{ fontSize: '1.08rem', marginTop: 8 }}>{cont.sub}</p>
          <div className="ns-row" style={{ marginTop: 22, justifyContent: 'space-between' }}>
            <span className="ns-chip ns-chip-gold">{t('continue')} <span className="ns-continue-arrow" aria-hidden="true">→</span></span>
            <span style={{ width: 56, opacity: 0.8 }}><Orb size={56} /></span>
          </div>
        </Link>
      </section>

      <section className="ns-grid-2 ns-section" style={{ marginTop: 40 }} aria-label={t('mainJourney')}>
        <div className="ns-panel">
          <div className="ns-eyebrow">{t('mainJourney')}</div>
          <div className="ns-stat" style={{ margin: '12px 0' }}>{stagesDone} <small>/ {PROGRAM.stageCount}</small></div>
          <div className="ns-meter" aria-hidden="true"><i style={{ width: `${(stagesDone / PROGRAM.stageCount) * 100}%` }} /></div>
        </div>
        <div className="ns-panel">
          <div className="ns-eyebrow">{t('deepInquiry')}</div>
          <div className="ns-stat" style={{ margin: '12px 0' }}>{qDone} <small>/ {PROGRAM.stageCount * PROGRAM.questionsPerStage}</small></div>
          <div className="ns-meter" aria-hidden="true"><i style={{ width: `${(qDone / 170) * 100}%` }} /></div>
        </div>
      </section>

      {/* 3. the journey */}
      <section className="ns-section">
        <div className="ns-section-head"><h2 className="ns-h2">{t('journeyMap')}</h2><span className="ns-muted ns-small">{t('progressStages', { a: stagesDone, b: 17 })}</span></div>
        <JourneyMap stages={mapStages} movements={mapMoves} base={BASE} ui={ui} />
      </section>

      {/* 4. current movement, 5. today */}
      <section className="ns-grid-2 ns-section">
        <div className="ns-panel">
          <div className="ns-eyebrow">{t('currentMovement')} · {['I', 'II', 'III', 'IV'][Number(movement.slice(1)) - 1]}</div>
          <h3 className="ns-h3" style={{ marginTop: 10 }}>{prog.movements[movement].title}</h3>
          <p className="ns-muted" style={{ marginTop: 6 }}>{prog.movements[movement].subtitle}</p>
          <div className="ns-meter" style={{ marginTop: 18 }} aria-hidden="true"><i style={{ width: `${(mProg.done / mProg.total) * 100}%` }} /></div>
          <div className="ns-small ns-muted" style={{ marginTop: 8 }}>{t('ofTotal', { a: mProg.done, b: mProg.total })}</div>
        </div>
        <div className="ns-panel">
          <div className="ns-eyebrow">{t('todaySuggestion')}</div>
          <p className="ns-lead" style={{ marginTop: 12 }}>{suggestion}</p>
        </div>
      </section>

      {/* checkpoints and the final assessment */}
      <section className="ns-section">
        <div className="ns-section-head"><h2 className="ns-h2">{t('checkpointsTitle')}</h2></div>
        <div className="ns-grid-3">
          {CHECKPOINTS.map((c, i) => {
            const open = E.checkpointUnlocked(p, c.id), done = E.checkpointDone(p, c.id);
            const inner = (<><div className="ns-eyebrow">{t('checkpointN', { n: i + 1 })}</div><div className="ns-h3" style={{ marginTop: 8 }}>{prog.movements[c.movement].title}</div><div style={{ marginTop: 12 }}><span className={`ns-chip ${done ? 'ns-chip-sage' : open ? 'ns-chip-gold' : ''}`}>{done ? t('completed') : open ? t('available') : t('locked')}</span></div></>);
            return open ? <Link key={c.id} href={`${BASE}/checkpoint/${c.id}`} className="ns-panel ns-qcard" style={{ display: 'block' }}>{inner}</Link> : <div key={c.id} className="ns-panel" style={{ opacity: 0.6 }} aria-disabled="true">{inner}<p className="ns-small ns-muted" style={{ marginTop: 8 }}>{t('assessmentLocked', { n: c.afterStage })}</p></div>;
          })}
          {(() => {
            const open = E.finalUnlocked(p), done = E.finalPassed(p);
            const inner = (<><div className="ns-eyebrow">{t('phase1')}</div><div className="ns-h3" style={{ marginTop: 8 }}>{t('finalTitle')}</div><div style={{ marginTop: 12 }}><span className={`ns-chip ${done ? 'ns-chip-sage' : open ? 'ns-chip-gold' : ''}`}>{done ? t('completed') : open ? t('available') : t('locked')}</span></div></>);
            return open ? <Link href={`${BASE}/final`} className="ns-panel ns-qcard" style={{ display: 'block' }}>{inner}</Link> : <div className="ns-panel" style={{ opacity: 0.6 }}>{inner}<p className="ns-small ns-muted" style={{ marginTop: 8 }}>{t('finalLocked')}</p></div>;
          })()}
        </div>
      </section>

      {/* 7. reflections, 8. Nididhyasana */}
      <section className="ns-grid-2 ns-section">
        <div className="ns-panel">
          <div className="ns-eyebrow">{t('reflectionsTitle')}</div>
          {reflections.length === 0 ? <p className="ns-muted" style={{ marginTop: 12 }}>{t('reflectionsEmpty')}</p> : (
            <ul style={{ listStyle: 'none', marginTop: 12 }} className="ns-stack">
              {reflections.map(([k, r]) => (
                <li key={k}><Link href={k.startsWith('NS-') ? `${BASE}/stage/${k.slice(3, 6)}/question/${k}` : `${BASE}/stage/${k}#reflection`} className="ns-small"><span className="ns-gold">{k.startsWith('NS-') ? k : t('stageN', { n: stageNumber(k) })}</span> — <span className="ns-muted">{r.text.slice(0, 120)}{r.text.length > 120 ? '…' : ''}</span></Link></li>
              ))}
            </ul>
          )}
        </div>
        <div className="ns-panel">
          <div className="ns-eyebrow">{t('phase2')}</div>
          <h3 className="ns-h3" style={{ marginTop: 8 }}>{t('phase2Sub')}</h3>
          {!E.nididhyasanaUnlocked(p) ? <p className="ns-muted" style={{ marginTop: 10 }}>{t('nidLockedNote')}</p> : (
            <div style={{ marginTop: 14 }} className="ns-stack">
              <p className="ns-muted">{nidWeek ? (nidWeek <= 12 ? t('nidWeekOf', { n: nidWeek }) : t('nidComplete')) : t('phase1DoneBody')}</p>
              <Link className="ns-btn" href={p.nididhyasana.startedAt ? `${BASE}/nididhyasana` : `${BASE}/phase-one-complete`}>{t('open')}</Link>
            </div>
          )}
          {p.finalReflection && <div style={{ marginTop: 14 }}><Link className="ns-btn ns-btn-quiet" href={`${BASE}/completion`}>{t('certificateTitle')}</Link></div>}
        </div>
      </section>
    </div>
  );
}
