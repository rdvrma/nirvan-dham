import type { Metadata } from 'next';
import IchchhaPoortiPage from '@/components/IchchhaPoortiPage';

import SchemaOrg from '@/components/SchemaOrg';

export const metadata: Metadata = {
  title: 'Ichchha Poorti | Nirvan Dham',
  description:
    'अपनी इच्छा आदिगुरु-तत्त्व तक पहुँचाएँ। Submit your heartfelt wish through the Nirvan Dham Ichchha Poorti process guided by Aadisatv.',
  alternates: { canonical: '/ichchha-poorti' },
  openGraph: {
    title: 'Ichchha Poorti | Nirvan Dham',
    description: 'A sacred process to submit your innermost wish to the Aadi-Guru Tattva.',
    url: '/ichchha-poorti',
    type: 'website',
  },
};

export default function IchchhaPoortiRoute() {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Ichchha Poorti',
    provider: {
      '@type': 'Organization',
      name: 'Nirvan Dham',
    },
    description: 'A sacred process to submit your innermost wish.',
  };

  return (
    <>
      <SchemaOrg schema={serviceSchema} />
      <IchchhaPoortiPage />
    </>
  );
}
