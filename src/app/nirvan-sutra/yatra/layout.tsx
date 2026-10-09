import type { Metadata } from 'next';
import { courseContext } from '@/course/nirvan-sutra/server/context';
import CourseShell from '@/components/nirvan-sutra/CourseShell';
import { nsFontVars as fontVars } from '@/components/nirvan-sutra/fonts';
import './yatra.css';

export const metadata: Metadata = {
  title: 'Nirvan Sutra — the 17-stage journey | Nirvan Dham',
  description: 'A quiet journey from inquiry toward direct seeing: seventeen stages, 170 deep questions and a three-month guided Nididhyasana.',
  robots: { index: false, follow: false },
};

export default async function YatraLayout({ children }: { children: React.ReactNode }) {
  const { locale, info, ui, progress } = await courseContext();
  return (
    <div className={`ns-root ${fontVars}`} lang={locale} data-script={info.script} data-locale={locale}>
      <CourseShell ui={ui} locale={locale} enrolled={!!progress?.locale} dev={process.env.NODE_ENV !== 'production'}>
        {children}
      </CourseShell>
    </div>
  );
}
