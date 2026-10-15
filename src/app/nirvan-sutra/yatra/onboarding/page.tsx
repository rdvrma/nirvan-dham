import { LOCALES, isLocale } from '@/course/nirvan-sutra/locales';
import { uiStrings } from '@/course/nirvan-sutra/server/content';
import { courseContext, requireSignedIn, BASE } from '@/course/nirvan-sutra/server/context';
import Onboarding from '@/components/nirvan-sutra/Onboarding';

const KEYS = ['chooseLanguageTitle', 'chooseLanguageNote', 'introEyebrow', 'introTitle', 'introBody1', 'introBody2', 'introBody3', 'introNamePrompt', 'introCta', 'back', 'brand'];

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  // chosen on the /course introduction: the language step is already done
  const chosen = typeof sp.lang === 'string' && isLocale(sp.lang) ? sp.lang : null;
  const account = await requireSignedIn(`${BASE}/onboarding${chosen ? `?lang=${chosen}` : ''}`);
  const { progress } = await courseContext();
  // the onboarding speaks every language before one is chosen
  const byLocale = Object.fromEntries(LOCALES.map((l) => { const s = uiStrings(l.code); return [l.code, Object.fromEntries(KEYS.map((k) => [k, s[k]]))]; }));
  return <Onboarding locales={LOCALES.map(({ code, native, english, script }) => ({ code, native, english, script }))} strings={byLocale} initial={chosen ?? progress?.locale ?? null} skipLanguage={!!chosen} name={progress?.name ?? account?.name ?? ''} />;
}
