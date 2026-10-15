import Link from 'next/link';
import { notFound } from 'next/navigation';
import { enrolledContext, BASE } from '@/course/nirvan-sutra/server/context';
import { stageView, questionView, videoAsset, transcript, lessonMeta, programView } from '@/course/nirvan-sutra/server/content';
import * as E from '@/course/nirvan-sutra/engine';
import { isQuestionId } from '@/course/nirvan-sutra/structure';
import VideoPlayer from '@/components/nirvan-sutra/VideoPlayer';
import { Reflection, Visit } from '@/components/nirvan-sutra/Bits';

// One of the 170 deep-inquiry lessons (NS-Sxx-Qyy). Optional: it never blocks the main journey.
export default async function QuestionPage({ params }: { params: Promise<{ stageId: string; questionId: string }> }) {
  const { stageId: sid, questionId: qid } = await params;
  if (!isQuestionId(qid) || qid.slice(3, 6) !== sid) notFound();
  const { progress: p, locale, t } = await enrolledContext();
  const s = stageView(locale, sid);
  if (!E.isStageUnlocked(p, sid)) {
    return (
      <section className="ns-opening ns-narrow">
        <div className="ns-eyebrow">{t('stageN', { n: s.n })}</div>
        <h1 className="ns-h2" style={{ marginTop: 10 }}>{s.text.title}</h1>
        <div className="ns-panel" style={{ marginTop: 24 }} role="status"><span className="ns-chip">{t('locked')}</span><p className="ns-muted" style={{ marginTop: 10 }}>{t('lockedHint')}</p></div>
      </section>
    );
  }
  const q = questionView(locale, qid);
  const meta = lessonMeta(qid);
  const asset = videoAsset(qid);
  const tr = transcript(locale, qid);
  // the film's own cards (approved), without the question card and the closing cards
  const pointers = (meta?.cards ?? []).filter((c, i) => i > 0 && !/^ज्ञानमार्ग|प्रश्न|—\s*दस/.test(c)).slice(0, 5);
  const gl = programView(locale).glossary.terms;
  const related = gl.filter((g) => (q.text + ' ' + (meta?.cards ?? []).join(' ')).includes(g.term)).slice(0, 4);
  const seen = p.questionsViewed.includes(qid);

  return (
    <article aria-labelledby="q-h">
      <Visit kind="question" id={qid} />
      <header className="ns-narrow" style={{ padding: '12px 0 28px' }}>
        <Link href={`${BASE}/stage/${sid}#questions`} className="ns-small ns-muted">← {t('backToStage')} · {s.text.title}</Link>
        <div className="ns-eyebrow" style={{ marginTop: 22 }}>{t('inquiryEyebrow', { n: q.n, s: s.n })}</div>
        <h1 id="q-h" className="ns-h2" style={{ marginTop: 10 }}>{q.text}</h1>
        <div className="ns-row" style={{ marginTop: 14 }}>
          <span className={`ns-chip ${q.status === 'approved' ? 'ns-chip-sage' : ''}`}>{q.status === 'approved' ? t('approvedBadge') : t('draftBadge')}</span>
          {seen && <span className="ns-chip ns-chip-gold">{t('completed')}</span>}
        </div>
      </header>

      <VideoPlayer asset={asset} title={q.text} eyebrow={`${t('questionFilm')} · ${q.id}`} stageN={s.n} watchKey={{ kind: 'question', id: qid }} watched={seen} transcript={tr ? { blocks: tr.blocks, fallback: tr.fallback } : null} />

      <div className="ns-narrow">
        {pointers.length > 0 && (
          <section className="ns-section">
            <div className="ns-section-head"><h2 className="ns-h2">{t('pointersLabel')}</h2>{locale === 'hi' && <span className="ns-chip ns-chip-sage">{t('approvedBadge')}</span>}</div>
            <ol className="ns-pointers" lang="hi">{pointers.map((x, i) => <li key={i}>{x}</li>)}</ol>
          </section>
        )}
        {related.length > 0 && (
          <section className="ns-section">
            <div className="ns-eyebrow" style={{ marginBottom: 12 }}>{t('relatedConcepts')}</div>
            <dl className="ns-grid-2">{related.map((g) => <div key={g.term} className="ns-panel" style={{ padding: 18 }}><dt className="ns-h3" lang="hi">{g.term}</dt><dd className="ns-muted ns-small" style={{ marginTop: 6 }}>{g.gloss}</dd></div>)}</dl>
          </section>
        )}
        <section className="ns-section">
          <h2 className="ns-h2" style={{ marginBottom: 14 }}>{t('reflectionLabel')}</h2>
          <Reflection k={qid} initial={p.reflections[qid]?.text ?? ''} prompt={t('questionReflection')} />
        </section>
        <nav className="ns-row ns-section" style={{ justifyContent: 'space-between' }} aria-label={t('deeperLabel')}>
          {q.prev ? <Link className="ns-btn ns-btn-quiet" href={`${BASE}/stage/${sid}/question/${q.prev}`}>← {t('previousQuestion')}</Link> : <span />}
          {q.next ? <Link className="ns-btn ns-btn-quiet" href={`${BASE}/stage/${sid}/question/${q.next}`}>{t('nextQuestion')} →</Link> : <Link className="ns-btn ns-btn-quiet" href={`${BASE}/stage/${sid}`}>{t('backToStage')}</Link>}
        </nav>
      </div>
    </article>
  );
}
