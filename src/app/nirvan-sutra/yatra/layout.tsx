import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { isLocale, localeInfo } from '@/course/nirvan-sutra/locales';
import { uiStrings } from '@/course/nirvan-sutra/server/content';
import CourseShell from '@/components/nirvan-sutra/CourseShell';
import { nsFontVars as fontVars } from '@/components/nirvan-sutra/fonts';
import './yatra.css';

export const metadata: Metadata = {
  title: 'Nirvan Sutra — the 17-stage journey | Nirvan Dham',
  description: 'A quiet journey from inquiry toward direct seeing: seventeen stages, 170 deep questions and a three-month guided Nididhyasana.',
  robots: { index: false, follow: false },
};

export default async function YatraLayout({ children }: { children: React.ReactNode }) {
  // The shell must render before the remote progress lookup. Each protected page
  // verifies the account and progress inside the route's loading boundary.
  const saved = (await cookies()).get('ns_lang')?.value;
  const locale = isLocale(saved) ? saved : 'hi';
  const info = localeInfo(locale);
  const ui = uiStrings(locale);
  return (
    <div className={`ns-root ${fontVars}`} lang={locale} data-script={info.script} data-locale={locale}>
      <CourseShell ui={ui} locale={locale} enrolled dev={process.env.NODE_ENV !== 'production'}>
        {children}
      </CourseShell>
    </div>
  );
}
