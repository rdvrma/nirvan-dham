import Link from 'next/link';
import { notFound } from 'next/navigation';
import { enrolledContext, BASE } from '@/course/nirvan-sutra/server/context';
import { checkpointView, allStages, programView } from '@/course/nirvan-sutra/server/content';
import * as E from '@/course/nirvan-sutra/engine';
import { isCheckpointId, CHECKPOINTS } from '@/course/nirvan-sutra/structure';
import Assessment from '@/components/nirvan-sutra/Assessment';
import { Visit } from '@/components/nirvan-sutra/Bits';

export default async function CheckpointPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isCheckpointId(id)) notFound();
  const { progress: p, locale, t } = await enrolledContext();
  const cp = CHECKPOINTS.find((c) => c.id === id)!;
  const n = CHECKPOINTS.indexOf(cp) + 1;
  const prog = programView(locale);
  const head = (
    <header className="ns-opening ns-narrow">
      <div className="ns-eyebrow">{t('checkpointN', { n })}</div>
      <h1 className="ns-h1" style={{ marginTop: 10 }}>{prog.movements[cp.movement].title}</h1>
    </header>
  );
  if (!E.checkpointUnlocked(p, id)) {
    return <section>{head}<div className="ns-narrow ns-panel" role="status"><span className="ns-chip">{t('locked')}</span><p className="ns-muted" style={{ marginTop: 10 }}>{t('assessmentLocked', { n: cp.afterStage })}</p><Link className="ns-btn ns-btn-quiet" style={{ marginTop: 16 }} href={`${BASE}/dashboard`}>{t('toJourney')}</Link></div></section>;
  }
  const v = checkpointView(locale, id);
  const last = p.checkpoints[id]?.at(-1) ?? null;
  const titles = Object.fromEntries(allStages(locale).map((s) => [s.id, `${t('stageN', { n: s.n })} · ${s.text.title}`]));
  return (
    <section>
      <Visit kind="checkpoint" id={id} />
      {head}
      {v.fallback && <p className="ns-notice ns-narrow">{t('notInYourLanguage', { lang: 'English' })}</p>}
      <Assessment kind="checkpoint" id={id} title={`${t('checkpointN', { n })} · ${v.title}`} items={v.items} stageTitles={titles} previous={last ? { score: last.score, total: last.total } : null} />
    </section>
  );
}
