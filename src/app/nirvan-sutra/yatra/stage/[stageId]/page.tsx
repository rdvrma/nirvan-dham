import Link from 'next/link';
import { notFound } from 'next/navigation';
import { enrolledContext, BASE } from '@/course/nirvan-sutra/server/context';
import { stageView, programView, questionView, videoAsset, transcript } from '@/course/nirvan-sutra/server/content';
import * as E from '@/course/nirvan-sutra/engine';
import { isStageId, stageId } from '@/course/nirvan-sutra/structure';
import { localeInfo } from '@/course/nirvan-sutra/locales';
import VideoPlayer from '@/components/nirvan-sutra/VideoPlayer';
import StageCheck from '@/components/nirvan-sutra/StageCheck';
import { Reflection, CompleteStage, Visit, MoreText } from '@/components/nirvan-sutra/Bits';
import { StageOrb, ConceptGraphic } from '@/components/nirvan-sutra/Graphics';

export default async function StagePage({ params }: { params: Promise<{ stageId: string }> }) {
  const { stageId: sid } = await params;
  if (!isStageId(sid)) notFound();
  const { progress: p, locale, t, ui } = await enrolledContext();
  const s = stageView(locale, sid);
  const prog = programView(locale);
  const movementTitle = prog.movements[s.movement].title;

  if (!E.isStageUnlocked(p, sid)) {
    return (
      <section className="ns-opening ns-narrow" aria-labelledby="locked-h">
        <StageOrb n={s.n} />
        <div className="ns-eyebrow">{t('stageN', { n: s.n })} · {movementTitle}</div>
        <h1 id="locked-h" className="ns-h1" style={{ marginTop: 10 }}>{s.text.title}</h1>
        <p className="ns-inquiry" style={{ marginTop: 14 }}>{s.text.centralInquiry}</p>
        <div className="ns-panel" style={{ marginTop: 32 }} role="status">
          <span className="ns-chip">{t('locked')}</span>
          <p className="ns-muted" style={{ marginTop: 12 }}>{t('lockedHint')}</p>
          <div className="ns-row" style={{ justifyContent: 'center', marginTop: 18 }}>
            <Link className="ns-btn" href={`${BASE}/stage/${E.currentStage(p) ?? 'S17'}`}>{t('continue')}</Link>
            <Link className="ns-btn ns-btn-quiet" href={`${BASE}/dashboard`}>{t('toJourney')}</Link>
          </div>
        </div>
      </section>
    );
  }

  const asset = videoAsset(s.mainLessonId);
  const tr = transcript(locale, s.mainLessonId);
  const req = E.stageRequirements(p, sid, s.checkItems.map((i) => i.id));
  const completed = E.isStageCompleted(p, sid);
  const fbLang = s.fallbackFields.length ? localeInfo(locale === 'en' ? 'hi' : 'en').native : null;
  const approved = (f: string) => s.approvedFields.includes(f);
  const badge = (f: string) => approved(f) ? <span className="ns-chip ns-chip-sage">{t('approvedBadge')}</span> : <span className="ns-chip">{t('draftBadge')}</span>;

  return (
    <article aria-labelledby="stage-h">
      <Visit kind="stage" id={sid} />
      {/* A–C: opening, title, central inquiry */}
      <header className="ns-opening">
        <StageOrb n={s.n} />
        <div className="ns-eyebrow ns-rise">{t('stageN', { n: s.n })} · {movementTitle}</div>
        <h1 id="stage-h" className="ns-h1 ns-rise ns-rise-1" style={{ marginTop: 10 }}>{s.text.title}</h1>
        <p className="ns-muted ns-rise ns-rise-2" style={{ marginTop: 6 }}>{s.text.subtitle}</p>
        <div className="ns-rise ns-rise-3" style={{ marginTop: 28 }}>
          <div className="ns-small ns-muted">{t('centralInquiry')}</div>
          <p className="ns-inquiry" style={{ marginTop: 6 }}>{s.text.centralInquiry}</p>
        </div>
        {completed && <div style={{ marginTop: 18 }}><span className="ns-chip ns-chip-sage">{t('completed')}</span></div>}
      </header>
      {fbLang && <p className="ns-notice ns-narrow">{t('notInYourLanguage', { lang: fbLang })}</p>}

      {/* E: the main film */}
      <section className="ns-section" style={{ marginTop: 24 }} aria-label={t('mainFilm')}>
        <VideoPlayer asset={asset} title={s.text.title} eyebrow={`${t('mainFilm')} · ${t('stageN', { n: s.n })}`} stageN={s.n} watchKey={{ kind: 'main', stage: sid }} watched={req.mainViewed} transcript={tr ? { blocks: tr.blocks, fallback: tr.fallback } : null} />
      </section>

      <div className="ns-narrow">
        {/* D: objective */}
        <section className="ns-section">
          <div className="ns-eyebrow">{t('objectiveLabel')}</div>
          <p className="ns-h3" style={{ marginTop: 10 }}>{s.text.objective}</p>
        </section>

        {/* main pointers (approved cards of the film) */}
        <section className="ns-section">
          <div className="ns-section-head"><h2 className="ns-h2">{t('pointersLabel')}</h2>{badge('pointers')}</div>
          <ol className="ns-pointers">{s.text.pointers.map((x, i) => <li key={i} className="ns-rise" style={{ animationDelay: `${i * 90}ms` }}>{x}</li>)}</ol>
        </section>

        {/* F: written essence, with its teaching graphic */}
        <section className="ns-section">
          <div className="ns-section-head"><h2 className="ns-h2">{t('essenceLabel')}</h2>{badge('essence')}</div>
          <figure style={{ margin: '0 0 24px' }}>
            <ConceptGraphic stage={s.n} g={ui} />
            <figcaption className="ns-small ns-muted" style={{ textAlign: 'center', marginTop: 8 }}>{t('graphicLabel')}</figcaption>
          </figure>
          <MoreText text={s.text.essence} />
        </section>

        {/* G: key distinctions */}
        <details className="ns-disclose ns-section" open>
          <summary>{t('distinctionsLabel')}</summary>
          <div className="ns-stack">
            {s.text.distinctions.map((d, i) => (
              <div key={i} className="ns-stack" style={{ marginTop: i ? 22 : 0 }}>
                <div className="ns-dist"><div className="ns-dist-side">{d.left}</div><div className="ns-dist-vs" aria-hidden="true">≠</div><div className="ns-dist-side">{d.right}</div></div>
                <p className="ns-muted">{d.note}</p>
              </div>
            ))}
          </div>
        </details>

        {/* H: observation experiment */}
        <details className="ns-disclose">
          <summary>{t('observationLabel')}: {s.text.observation.title}</summary>
          <div><ol className="ns-steps">{s.text.observation.steps.map((x, i) => <li key={i}><span>{x}</span></li>)}</ol></div>
        </details>

        {/* the common misconception */}
        <details className="ns-disclose">
          <summary>{t('misconceptionLabel')}</summary>
          <div className="ns-myth">
            <div className="ns-myth-a"><div className="ns-small ns-muted">{t('mythLabel')}</div><p style={{ marginTop: 6 }}>{s.text.misconception.myth}</p></div>
            <div className="ns-myth-b"><div className="ns-small" style={{ color: 'var(--ns-sage)' }}>{t('truthLabel')}</div><p style={{ marginTop: 6 }}>{s.text.misconception.truth}</p></div>
          </div>
        </details>

        {/* I: the 3-question check */}
        <section className="ns-section" id="check">
          <div className="ns-section-head"><h2 className="ns-h2">{t('checkLabel')}</h2><span className="ns-chip">{t('draftBadge')}</span></div>
          <StageCheck stage={sid} items={s.checkItems} cleared={p.stageChecks[sid]?.correct ?? []} />
        </section>

        {/* L: completion */}
        <section className="ns-section ns-panel ns-panel-glow">
          <h2 className="ns-h3">{t('requirementsTitle')}</h2>
          <div className="ns-req" style={{ margin: '16px 0 22px' }}>
            <div className="ns-req-item" data-done={req.mainViewed}><span className="ns-req-dot" aria-hidden="true">{req.mainViewed ? '✓' : ''}</span>{t('reqWatch')}<span className="ns-sr">{req.mainViewed ? t('completed') : ''}</span></div>
            <div className="ns-req-item" data-done={req.checkPassed}><span className="ns-req-dot" aria-hidden="true">{req.checkPassed ? '✓' : ''}</span>{t('reqCheck')}<span className="ns-sr">{req.checkPassed ? t('completed') : ''}</span></div>
          </div>
          {completed
            ? <div className="ns-row"><span className="ns-chip ns-chip-sage">{t('completed')}</span>{s.n < 17 && <Link className="ns-btn" href={`${BASE}/stage/${stageId(s.n + 1)}`}>{t('nextStage', { title: stageView(locale, stageId(s.n + 1)).text.title })}</Link>}</div>
            : <CompleteStage stage={sid} ready={req.mainViewed && req.checkPassed} />}
        </section>

        {/* J: the ten deep-inquiry lessons (optional) */}
        <section className="ns-section" id="questions">
          <div className="ns-section-head"><h2 className="ns-h2">{t('deeperLabel')}</h2><span className="ns-muted ns-small">{t('questionsViewed', { a: E.questionsViewedIn(p, sid), b: 10 })}</span></div>
          <p className="ns-muted" style={{ marginBottom: 18 }}>{t('deeperNote')}</p>
          <ul className="ns-qgrid" style={{ listStyle: 'none' }}>
            {s.questionIds.map((qid) => { const q = questionView(locale, qid); return (
              <li key={qid}><Link href={`${BASE}/stage/${sid}/question/${qid}`} className="ns-qcard" data-seen={p.questionsViewed.includes(qid)}><span className="ns-qnum">{String(q.n).padStart(2, '0')}</span><span>{q.text}</span></Link></li>
            ); })}
          </ul>
        </section>

        {/* K: the stage reflection */}
        <section className="ns-section" id="reflection">
          <h2 className="ns-h2" style={{ marginBottom: 14 }}>{t('reflectionLabel')}</h2>
          <Reflection k={sid} initial={p.reflections[sid]?.text ?? ''} prompt={s.text.reflectionPrompt} />
        </section>

        <p className="ns-notice ns-section">{t('draftNote')}</p>
      </div>
    </article>
  );
}
