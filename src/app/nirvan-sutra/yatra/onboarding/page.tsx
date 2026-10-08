import { LOCALES } from '@/course/nirvan-sutra/locales';
import { uiStrings } from '@/course/nirvan-sutra/server/content';
import { courseContext } from '@/course/nirvan-sutra/server/context';
import Onboarding from '@/components/nirvan-sutra/Onboarding';

const KEYS = ['chooseLanguageTitle', 'chooseLanguageNote', 'introEyebrow', 'introTitle', 'introBody1', 'introBody2', 'introBody3', 'introNamePrompt', 'introCta', 'back', 'brand'];

export default async function OnboardingPage() {
  const { progress } = await courseContext();
  // the onboarding speaks every language before one is chosen
  const byLocale = Object.fromEntries(LOCALES.map((l) => { const s = uiStrings(l.code); return [l.code, Object.fromEntries(KEYS.map((k) => [k, s[k]]))]; }));
  return <Onboarding locales={LOCALES.map(({ code, native, english, script }) => ({ code, native, english, script }))} strings={byLocale} initial={progress?.locale ?? null} name={progress?.name ?? ''} />;
}
