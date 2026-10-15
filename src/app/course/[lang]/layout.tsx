import { redirect } from 'next/navigation';
import { isLocale } from '@/course/nirvan-sutra/locales';

// Retire the eight-chapter course without leaving old bookmarks on a dead page.
export default async function LegacyCourseLayout({
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(isLocale(lang) ? `/course?lang=${lang}` : '/course');
}
