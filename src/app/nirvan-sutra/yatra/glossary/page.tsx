import { enrolledContext } from '@/course/nirvan-sutra/server/context';
import { programView } from '@/course/nirvan-sutra/server/content';

// The Sanskrit terms stay as they are in every language, each with its meaning in the learner's language.
export default async function GlossaryPage() {
  const { locale, t } = await enrolledContext();
  const g = programView(locale).glossary;
  return (
    <section className="ns-narrow ns-stack-l">
      <header><h1 className="ns-h1">{t('glossaryTitle')}</h1><p className="ns-muted" style={{ marginTop: 10 }}>{t('glossaryNote')}</p></header>
      <dl className="ns-stack">
        {g.terms.map((x) => (
          <div key={x.term} className="ns-panel" style={{ padding: '18px 22px' }}>
            <dt className="ns-h3" lang="hi">{x.term}</dt>
            <dd className="ns-muted" style={{ marginTop: 6 }}>{x.gloss}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
