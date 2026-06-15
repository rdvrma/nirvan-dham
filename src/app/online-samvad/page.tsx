import type { Metadata } from 'next';
import { SamvadDetailPage } from '@/components/SamvadPages';
import SchemaOrg from '@/components/SchemaOrg';

export const metadata: Metadata = {
  title: 'Online Samvad | Virtual Spiritual Guidance',
  description:
    'Join Aadisatv for a one-on-one Online Samvad. A virtual space for sincere seekers to explore self-inquiry, non-duality, and Advaita.',
  alternates: {
    canonical: '/online-samvad',
  },
  openGraph: {
    title: 'Online Samvad | Virtual Spiritual Guidance',
    description:
      'Join Aadisatv for a one-on-one Online Samvad. A virtual space for self-inquiry and Advaita.',
    url: '/online-samvad',
    type: 'website',
  },
};

export default function OnlineSamvadRoute() {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Online Samvad',
    provider: {
      '@type': 'Person',
      name: 'Aadisatv',
    },
    description: 'One-on-one virtual spiritual guidance session over a video call.',
    serviceType: 'Online Spiritual Session',
  };

  return (
    <>
      <SchemaOrg schema={serviceSchema} />
      <SamvadDetailPage mode="online" />
    </>
  );
}
