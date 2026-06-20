import { notFound } from 'next/navigation';
import { isFinalTestLanguage } from '@/lib/final-test-data';
import FinalTestClient from './FinalTestClient';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function FinalTestPage({ params }: PageProps) {
  const { lang } = await params;
  if (!isFinalTestLanguage(lang)) notFound();
  return <FinalTestClient lang={lang} />;
}
