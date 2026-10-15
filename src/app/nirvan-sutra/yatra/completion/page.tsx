import Link from 'next/link';
import { redirect } from 'next/navigation';
import { enrolledContext, BASE } from '@/course/nirvan-sutra/server/context';
import { Orb } from '@/components/nirvan-sutra/Graphics';

// After the three months and the final reflection: the journey does not end — it no longer needs a course.
export default async function CompletionPage() {
  const { progress: p, t } = await enrolledContext();
  if (!p.finalReflection) redirect(`${BASE}/dashboard`);
  return (
    <section className="ns-onb">
      <div className="ns-narrow ns-stack-l">
        <div className="ns-onb-orb ns-rise" style={{ width: 180, height: 180 }}><Orb size={180} /></div>
        <h1 className="ns-h1 ns-rise ns-rise-1">{t('journeyEndTitle')}</h1>
        <p className="ns-h2 ns-rise ns-rise-2" style={{ color: 'var(--ns-ink-2)' }}>{t('journeyEndBody')}</p>
        <div className="ns-row ns-rise ns-rise-4" style={{ justifyContent: 'center' }}>
          <Link className="ns-btn" href={`${BASE}/certificate`}>{t('certificateTitle')}</Link>
          <Link className="ns-btn ns-btn-quiet" href={`${BASE}/dashboard`}>{t('toJourney')}</Link>
        </div>
      </div>
    </section>
  );
}
