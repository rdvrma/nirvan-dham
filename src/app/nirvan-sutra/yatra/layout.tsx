import type { Metadata } from 'next';
import { Noto_Serif_Devanagari, Noto_Sans_Bengali, Noto_Sans_Tamil, Noto_Sans_Telugu, Noto_Sans_Gujarati, Noto_Sans_Kannada, Noto_Sans_Malayalam, Noto_Sans_Gurmukhi, Noto_Sans_Oriya } from 'next/font/google';
import { courseContext } from '@/course/nirvan-sutra/server/context';
import CourseShell from '@/components/nirvan-sutra/CourseShell';
import './yatra.css';

// one face per script, loaded only when a glyph of that script is on the page (unicode-range), never preloaded
const deva = Noto_Serif_Devanagari({ subsets: ['devanagari'], weight: ['400', '500', '600'], variable: '--ns-font-deva-serif', display: 'swap', preload: false });
const beng = Noto_Sans_Bengali({ subsets: ['bengali'], weight: ['400', '500'], variable: '--ns-font-beng', display: 'swap', preload: false });
const taml = Noto_Sans_Tamil({ subsets: ['tamil'], weight: ['400', '500'], variable: '--ns-font-taml', display: 'swap', preload: false });
const telu = Noto_Sans_Telugu({ subsets: ['telugu'], weight: ['400', '500'], variable: '--ns-font-telu', display: 'swap', preload: false });
const gujr = Noto_Sans_Gujarati({ subsets: ['gujarati'], weight: ['400', '500'], variable: '--ns-font-gujr', display: 'swap', preload: false });
const knda = Noto_Sans_Kannada({ subsets: ['kannada'], weight: ['400', '500'], variable: '--ns-font-knda', display: 'swap', preload: false });
const mlym = Noto_Sans_Malayalam({ subsets: ['malayalam'], weight: ['400', '500'], variable: '--ns-font-mlym', display: 'swap', preload: false });
const guru = Noto_Sans_Gurmukhi({ subsets: ['gurmukhi'], weight: ['400', '500'], variable: '--ns-font-guru', display: 'swap', preload: false });
const orya = Noto_Sans_Oriya({ subsets: ['oriya'], weight: ['400', '500'], variable: '--ns-font-orya', display: 'swap', preload: false });
const fontVars = [deva, beng, taml, telu, gujr, knda, mlym, guru, orya].map((f) => f.variable).join(' ');

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
