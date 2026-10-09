import Link from 'next/link';
import { enrolledContext, BASE } from '@/course/nirvan-sutra/server/context';
import * as E from '@/course/nirvan-sutra/engine';
import BrandMark from '@/components/nirvan-sutra/BrandMark';

// The certificate: eligible only when every requirement is met; it certifies completion of the program and nothing else.
const LABEL: Record<string, string> = { stages: 'certStages', stageChecks: 'certStageChecks', checkpoints: 'certCheckpoints', final: 'certFinal', nididhyasana: 'certNididhyasana', finalReflection: 'certFinalReflection' };

export default async function CertificatePage() {
  const { progress: p, locale, t } = await enrolledContext();
  const list = E.certificateChecklist(p);
  const eligible = list.every((c) => c.done);
  const date = new Intl.DateTimeFormat(`${locale === 'or' ? 'or' : locale}-IN`, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(p.finalReflection?.submittedAt ?? p.updatedAt));
  return (
    <section className="ns-stack-l">
      <header className="ns-opening ns-narrow">
        <div className="ns-eyebrow">{eligible ? t('certificateTitle') : t('certificatePreview')}</div>
        <h1 className="ns-h1" style={{ marginTop: 10 }}>{t('certificateHeading')}</h1>
      </header>
      {!eligible && (
        <div className="ns-narrow ns-panel" role="status">
          <p>{t('certificateNotYet')}</p>
          <ul className="ns-req" style={{ marginTop: 14, listStyle: 'none' }}>
            {list.map((c) => <li key={c.key} className="ns-req-item" data-done={c.done}><span className="ns-req-dot" aria-hidden="true">{c.done ? '✓' : ''}</span>{t(LABEL[c.key])}<span className="ns-sr">{c.done ? t('completed') : t('locked')}</span></li>)}
          </ul>
        </div>
      )}
      <div className="ns-cert" style={{ opacity: eligible ? 1 : 0.5, filter: eligible ? 'none' : 'grayscale(0.4)' }} aria-label={t('certificateTitle')}>
        <BrandMark size={52} className="" />
        <div className="ns-cert-title" style={{ marginTop: 10 }}>{t('certificateHeading')}</div>
        <div style={{ marginTop: 'clamp(8px,2vw,18px)', fontSize: 'clamp(0.7rem,1.6vw,0.95rem)', color: '#5a4a2e' }}>{t('certificatePresented')}</div>
        <div className="ns-cert-name">{p.name || t('certificateAnonymous')}</div>
        <p className="ns-cert-text">{t('certificateText')}</p>
        <div className="ns-cert-foot"><span>{t('certificateDate')}: {date}</span><span>{t('certificateIssuer')}</span></div>
        <p className="ns-cert-disc">{t('certificateDisclaimer')}</p>
      </div>
      <div className="ns-row" style={{ justifyContent: 'center' }}><Link className="ns-btn ns-btn-quiet" href={`${BASE}/dashboard`}>{t('toJourney')}</Link></div>
    </section>
  );
}
