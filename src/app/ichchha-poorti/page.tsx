import type { Metadata } from 'next';
import IchchhaPoortiPage from '@/components/IchchhaPoortiPage';

export const metadata: Metadata = {
  title: 'इच्छा-पूर्ति | Nirvan Dham',
  description:
    'अपनी इच्छा आदिगुरु-तत्त्व तक पहुँचाएँ। Submit your heartfelt wish through the Nirvan Dham Ichchha Poorti process guided by Aadisatv.',
  alternates: { canonical: '/ichchha-poorti' },
  openGraph: {
    title: 'इच्छा-पूर्ति | Nirvan Dham',
    description: 'A sacred process to submit your innermost wish to the Aadi-Guru Tattva.',
    url: '/ichchha-poorti',
    type: 'website',
  },
};

export default function IchchhaPoortiRoute() {
  return <IchchhaPoortiPage />;
}
