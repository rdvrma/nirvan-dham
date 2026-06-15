import type { Metadata } from 'next';
import { SamvadDetailPage } from '@/components/SamvadPages';
import SchemaOrg from '@/components/SchemaOrg';

export const metadata: Metadata = {
  title: 'Bodhgaya Samvad | Spiritual Guidance in Bodhgaya',
  description:
    'Sit in presence with Aadisatv in the sacred land of Bodhgaya. A deep, one-on-one session for self-inquiry and direct seeing of the truth.',
  alternates: {
    canonical: '/bodhgaya-samvad',
  },
  openGraph: {
    title: 'Bodhgaya Samvad | Spiritual Guidance in Bodhgaya',
    description:
      'Sit in presence with Aadisatv in the sacred land of Bodhgaya for a deep, one-on-one session.',
    url: '/bodhgaya-samvad',
    type: 'website',
  },
};

export default function BodhgayaSamvadRoute() {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Bodhgaya Samvad',
    provider: {
      '@type': 'Person',
      name: 'Aadisatv',
    },
    areaServed: {
      '@type': 'City',
      name: 'Bodhgaya',
    },
    description: 'In-person spiritual guidance session in Bodhgaya.',
    serviceType: 'In-Person Spiritual Session',
  };

  return (
    <>
      <SchemaOrg schema={serviceSchema} />
      <SamvadDetailPage mode="bodhgaya" />
    </>
  );
}
