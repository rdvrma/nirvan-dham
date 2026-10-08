import Link from 'next/link';
import { enrolledContext, BASE } from '@/course/nirvan-sutra/server/context';
import { finalView, allStages } from '@/course/nirvan-sutra/server/content';
import * as E from '@/course/nirvan-sutra/engine';
import Assessment from '@/components/nirvan-sutra/Assessment';
import { Visit } from '@/components/nirvan-sutra/Bits';

// The final understanding assessment: open after the 17 stages; 80 % shows the curriculum is understood — never an attainment.
export default async function FinalPage() {
  const { progress: p, locale, t } = await enrolledContext();
  const head = (
    <header className="ns-opening ns-narrow">
      <div className="ns-eyebrow">{t('phase1')}</div>
      <h1 className="ns-h1" style={{ marginTop: 10 }}>{t('finalTitle')}</h1>
      <p className="ns-lead" style={{ marginTop: 10 }}>{t('finalSub')}</p>
    </header>
  );
  if (!E.finalUnlocked(p)) {
    return <section>{head}<div className="ns-narrow ns-panel" role="status"><span className="ns-chip">{t('locked')}</span><p className="ns-muted" style={{ marginTop: 10 }}>{t('finalLocked')}</p><Link className="ns-btn ns-btn-quiet" style={{ marginTop: 16 }} href={`${BASE}/dashboard`}>{t('toJourney')}</Link></div></section>;
  }
  const v = finalView(locale);
  const best = E.bestFinal(p);
  const titles = Object.fromEntries(allStages(locale).map((s) => [s.id, `${t('stageN', { n: s.n })} · ${s.text.title}`]));
  return (
    <section>
      <Visit kind="final" id="final" />
      {head}
      {v.fallback && <p className="ns-notice ns-narrow">{t('notInYourLanguage', { lang: 'English' })}</p>}
      {E.finalPassed(p) && <div className="ns-narrow ns-panel" style={{ marginBottom: 24 }}><p>{t('finalPassed')}</p><p className="ns-small ns-muted" style={{ marginTop: 6 }}>{t('finalPassedNote')}</p>{E.phase1Complete(p) && <Link className="ns-btn" style={{ marginTop: 14 }} href={`${BASE}/phase-one-complete`}>{t('phase1DoneCta')}</Link>}</div>}
      <Assessment kind="final" id="final" title={t('finalTitle')} items={v.items} stageTitles={titles} previous={best ? { score: best.score, total: best.total } : null} />
    </section>
  );
}
