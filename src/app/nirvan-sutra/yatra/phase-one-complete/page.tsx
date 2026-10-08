import Link from 'next/link';
import { redirect } from 'next/navigation';
import { enrolledContext, BASE } from '@/course/nirvan-sutra/server/context';
import * as E from '@/course/nirvan-sutra/engine';
import { Orb } from '@/components/nirvan-sutra/Graphics';
import { BeginNididhyasana } from '@/components/nirvan-sutra/Nididhyasana';

// The end of Phase I and the threshold of Phase II. Contemplative, not celebratory.
export default async function PhaseOneComplete() {
  const { progress: p, t } = await enrolledContext();
  if (!E.phase1Complete(p)) redirect(`${BASE}/dashboard`);
  return (
    <section className="ns-onb">
      <div className="ns-narrow ns-stack-l">
        <div className="ns-onb-orb ns-rise" style={{ width: 160, height: 160 }}><Orb size={160} /></div>
        <h1 className="ns-h1 ns-rise ns-rise-1">{t('phase1DoneTitle')}</h1>
        <p className="ns-lead ns-rise ns-rise-2">{t('phase1DoneBody')}</p>
        <hr className="ns-rule" />
        <div className="ns-eyebrow ns-rise ns-rise-3">{t('phase2')} · {t('phase2Sub')}</div>
        <h2 className="ns-h2 ns-rise ns-rise-3">{t('nidTransitionTitle')}</h2>
        <p className="ns-muted ns-rise ns-rise-4">{t('nidTransitionBody')}</p>
        <div className="ns-row ns-rise ns-rise-4" style={{ justifyContent: 'center' }}>
          {p.nididhyasana.startedAt ? <Link className="ns-btn" href={`${BASE}/nididhyasana`}>{t('phase1DoneCta')}</Link> : <BeginNididhyasana label={t('phase1DoneCta')} />}
          <Link className="ns-btn ns-btn-quiet" href={`${BASE}/dashboard`}>{t('toJourney')}</Link>
        </div>
      </div>
    </section>
  );
}
