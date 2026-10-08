import { enrolledContext } from '@/course/nirvan-sutra/server/context';
import { LOCALES } from '@/course/nirvan-sutra/locales';
import Settings from '@/components/nirvan-sutra/Settings';

export default async function SettingsPage() {
  const { progress: p, locale, t } = await enrolledContext();
  return (
    <section className="ns-narrow ns-stack-l">
      <h1 className="ns-h1">{t('settingsTitle')}</h1>
      <Settings locales={LOCALES.map(({ code, native, english }) => ({ code, native, english }))} locale={locale} name={p.name ?? ''} />
    </section>
  );
}
