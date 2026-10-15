import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { enrolledContext, BASE } from '@/course/nirvan-sutra/server/context';
import { stageView, programView } from '@/course/nirvan-sutra/server/content';
import * as E from '@/course/nirvan-sutra/engine';
import { isStageId, stageId, CHECKPOINTS } from '@/course/nirvan-sutra/structure';
import { Orb } from '@/components/nirvan-sutra/Graphics';

// L–M: a stage is complete (the curriculum of it, nothing more) and the next stage opens.
export default async function StageComplete({ params }: { params: Promise<{ stageId: string }> }) {
  const { stageId: sid } = await params;
  if (!isStageId(sid)) notFound();
  const { progress: p, locale, t } = await enrolledContext();
  if (!E.isStageCompleted(p, sid)) redirect(`${BASE}/stage/${sid}`);
  const s = stageView(locale, sid);
  const next = s.n < 17 ? stageView(locale, stageId(s.n + 1)) : null;
  const cp = CHECKPOINTS.find((c) => c.afterStage === s.n);
  const prog = programView(locale);
  const newMovement = next && next.movement !== s.movement;
  return (
    <section className="ns-onb">
      <div className="ns-narrow ns-stack-l">
        <div className="ns-onb-orb ns-rise" style={{ animation: 'ns-settle 1.4s var(--ns-ease) both' }}><Orb /></div>
        <div className="ns-eyebrow ns-rise ns-rise-1">{s.text.title}</div>
        <h1 className="ns-h1 ns-rise ns-rise-1">{t('stageCompleteTitle', { n: s.n })}</h1>
        <p className="ns-muted ns-rise ns-rise-2">{t('stageCompleteNote')}</p>
        {cp && <p className="ns-lead ns-rise ns-rise-3">{t('checkpointN', { n: CHECKPOINTS.indexOf(cp) + 1 })} · {prog.movements[cp.movement].title}</p>}
        {newMovement && <div className="ns-panel ns-rise ns-rise-3"><div className="ns-eyebrow">{['I', 'II', 'III', 'IV'][Number(next!.movement.slice(1)) - 1]}</div><div className="ns-h3" style={{ marginTop: 8 }}>{prog.movements[next!.movement].title}</div><p className="ns-muted" style={{ marginTop: 6 }}>{prog.movements[next!.movement].subtitle}</p></div>}
        <div className="ns-row ns-rise ns-rise-4" style={{ justifyContent: 'center' }}>
          {cp && <Link className="ns-btn" href={`${BASE}/checkpoint/${cp.id}`}>{t('checkpointN', { n: CHECKPOINTS.indexOf(cp) + 1 })}</Link>}
          {next ? <Link className={`ns-btn ${cp ? 'ns-btn-quiet' : ''}`} href={`${BASE}/stage/${next.id}`}>{t('nextStage', { title: next.text.title })}</Link>
            : <Link className="ns-btn ns-btn-quiet" href={`${BASE}/final`}>{t('finalTitle')}</Link>}
          <Link className="ns-btn ns-btn-quiet" href={`${BASE}/dashboard`}>{t('toJourney')}</Link>
        </div>
      </div>
    </section>
  );
}
