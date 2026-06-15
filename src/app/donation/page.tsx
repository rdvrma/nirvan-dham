import type { Metadata } from 'next';
import { DonationPage } from '@/components/SamvadPages';

export const metadata: Metadata = {
  title: 'Support Nirvan Dham | Voluntary Offerings',
  description:
    'Nirvan Dham operates entirely through the voluntary support and love of seekers. Support the spread of non-duality and Advaita teachings.',
  alternates: {
    canonical: '/donation',
  },
  openGraph: {
    title: 'Support Nirvan Dham',
    description:
      'Nirvan Dham operates entirely through the voluntary support and love of seekers.',
    url: '/donation',
    type: 'website',
  },
};

export default function DonationRoutePage() {
  return <DonationPage />;
}
