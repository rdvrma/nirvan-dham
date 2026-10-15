import Link from 'next/link';
import { enrolledContext, BASE } from '@/course/nirvan-sutra/server/context';
import { programView } from '@/course/nirvan-sutra/server/content';
import * as E from '@/course/nirvan-sutra/engine';
import FinalReflectionForm from '@/components/nirvan-sutra/FinalReflectionForm';

// The final reflection: thoughtful prompts, no right or wrong, stored privately, never read as an attainment.
export default async function ReflectionPage() {
  const { progress: p, locale, t } = await enrolledContext();
  const prog = programView(locale);
  const head = (
    <header className="ns-opening ns-narrow">
      <div className="ns-eyebrow">{t('phase2')}</div>
      <h1 className="ns-h1" style={{ marginTop: 10 }}>{t('finalReflectionTitle')}</h1>
      <p className="ns-lead" style={{ marginTop: 12 }}>{t('finalReflectionIntro')}</p>
    </header>
  );
  if (!E.finalReflectionUnlocked(p)) {
    return <section>{head}<div className="ns-narrow ns-panel" role="status"><span className="ns-chip">{t('locked')}</span><p className="ns-muted" style={{ marginTop: 10 }}>{t('finalReflectionLocked')}</p><Link className="ns-btn ns-btn-quiet" style={{ marginTop: 16 }} href={`${BASE}/dashboard`}>{t('toJourney')}</Link></div></section>;
  }
  return <section>{head}<FinalReflectionForm prompts={prog.finalReflection.prompts} initial={p.finalReflection?.answers ?? []} /></section>;
}
