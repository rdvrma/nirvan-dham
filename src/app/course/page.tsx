import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { LOCALES, isLocale, localeInfo } from '@/course/nirvan-sutra/locales';
import type { LocaleCode } from '@/course/nirvan-sutra/types';
import { allStages, programView, uiStrings } from '@/course/nirvan-sutra/server/content';
import { currentAccount, currentProgress } from '@/course/nirvan-sutra/server/session';
import { storeMode } from '@/course/nirvan-sutra/server/store';
import { BASE } from '@/course/nirvan-sutra/server/context';
import { MOVEMENTS, PROGRAM, CHECKPOINTS } from '@/course/nirvan-sutra/structure';
import { nsFontVars } from '@/components/nirvan-sutra/fonts';
import LanguageGate from '@/components/nirvan-sutra/landing/LanguageGate';
import Landing, { type LandingData } from '@/components/nirvan-sutra/landing/Landing';
import '../nirvan-sutra/yatra/yatra.css';
import './landing.css';

// The introduction of Nirvan Sutra: the seeker chooses a language first, then reads the whole introduction in it.
// /course?lang=ta is the shareable page of one language; the last choice is remembered in the ns_lang cookie.

const LANG_COOKIE = 'ns_lang';

export const metadata: Metadata = {
  title: 'Nirvan Sutra — a seventeen-stage journey of self-inquiry | Nirvan Dham',
  description: 'निर्वाण सूत्र — जिज्ञासा से प्रत्यक्ष दर्शन तक की एक शांत यात्रा: सत्रह चरण, 170 गहन प्रश्न और तीन माह का मार्गदर्शित निदिध्यासन। ग्यारह भारतीय भाषाओं में।',
  openGraph: {
    title: 'Nirvan Sutra | Nirvan Dham',
    description: 'Seventeen stages, 170 deep questions and three months of guided Nididhyāsana — in eleven Indian languages.',
    url: 'https://nirvandham.in/course',
    type: 'website',
  },
  alternates: { canonical: 'https://nirvandham.in/course' },
};

export default async function CourseIntro({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const asked = typeof sp.lang === 'string' && isLocale(sp.lang) ? sp.lang : null;
  const remembered = (await cookies()).get(LANG_COOKIE)?.value;
  const [progress, account] = await Promise.all([currentProgress().catch(() => null), currentAccount().catch(() => null)]);
  const enrolled = !!progress?.locale;
  const locale: LocaleCode | null = sp.choose === '1' ? null : asked ?? (isLocale(remembered) ? remembered : null) ?? progress?.locale ?? null;

  if (!locale) {
    const titles = Object.fromEntries(LOCALES.map((l) => [l.code, uiStrings(l.code).lChooseTitle]));
    const notes = Object.fromEntries(LOCALES.map((l) => [l.code, uiStrings(l.code).chooseLanguageNote]));
    return (
      <div className={`ns-root ns-landing ${nsFontVars}`} lang="hi" data-script="Devanagari">
        <LanguageGate locales={LOCALES.map(({ code, native, english }) => ({ code, native, english }))} titles={titles} notes={notes} current={asked ?? (isLocale(remembered) ? remembered : null)} />
      </div>
    );
  }

  const ui = uiStrings(locale);
  const stages = allStages(locale);
  const { movements } = programView(locale);
  const needsAccount = storeMode() === 'supabase' && !account;
  const onboarding = `${BASE}/onboarding?lang=${locale}`;
  const data: LandingData = {
    locale,
    native: localeInfo(locale).native,
    ui,
    stats: { stages: PROGRAM.stageCount, questions: PROGRAM.stageCount * PROGRAM.questionsPerStage, checkpoints: CHECKPOINTS.length, weeks: 12, languages: LOCALES.length },
    movements: MOVEMENTS.map((m) => ({
      id: m.id,
      title: movements[m.id]?.title ?? '',
      subtitle: movements[m.id]?.subtitle ?? '',
      stages: m.stages.map((n) => { const s = stages[n - 1]; return { n, title: s.text.title ?? '', subtitle: s.text.subtitle ?? '', inquiry: s.text.centralInquiry ?? '' }; }),
    })),
    cta: enrolled
      ? { href: `${BASE}/dashboard`, label: ui.lContinueJourney }
      : { href: needsAccount ? `/signup?next=${encodeURIComponent(onboarding)}` : onboarding, label: ui.introCta },
    login: needsAccount ? `/login?next=${encodeURIComponent(onboarding)}` : null,
  };
  return (
    <div className={`ns-root ns-landing ${nsFontVars}`} lang={locale} data-script={localeInfo(locale).script} data-locale={locale}>
      <Landing d={data} />
    </div>
  );
}
