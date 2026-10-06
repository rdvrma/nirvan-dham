import type { Metadata } from 'next';
import GuidePageClient from '@/components/GuidePageClient';

export const metadata: Metadata = {
  title: 'AI Guide | Nirvan Dham',
  description: 'Ask the Nirvan Dham AI Guide about self-inquiry, Advaita Vedanta and meditation.',
  alternates: { canonical: '/ask-guide' },
};

export default function AIGuidePage() {
  return <GuidePageClient />;
}
