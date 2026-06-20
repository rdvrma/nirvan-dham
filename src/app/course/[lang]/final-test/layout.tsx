import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { isFinalTestLanguage } from '@/lib/final-test-data';
import { createClient } from '@/utils/supabase/server';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function FinalTestLayout({ children, params }: LayoutProps) {
  const { lang } = await params;
  if (!isFinalTestLanguage(lang)) redirect('/course');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/course/${lang}/final-test`)}`);

  const { data: progress } = await supabase
    .from('user_progress')
    .select('highest_chapter_unlocked')
    .eq('user_id', user.id)
    .maybeSingle();

  const highestUnlocked = progress?.highest_chapter_unlocked ?? 1;
  if (highestUnlocked < 9) {
    redirect(`/course/${lang}/${Math.min(Math.max(highestUnlocked, 1), 8)}`);
  }

  return children;
}
