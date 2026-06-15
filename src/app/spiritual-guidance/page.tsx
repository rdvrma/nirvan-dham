import type { Metadata } from 'next';
import { SamvadChoicePage } from '@/components/SamvadPages';
import SchemaOrg from '@/components/SchemaOrg';

export const metadata: Metadata = {
  title: 'Spiritual Guidance | One-on-One Non-Duality Sessions',
  description:
    'Join Aadisatv for spiritual guidance and self-inquiry. Choose between Online Samvad or in-person Bodhgaya Samvad to deepen your understanding of non-duality.',
  alternates: {
    canonical: '/spiritual-guidance',
  },
  openGraph: {
    title: 'Spiritual Guidance | Nirvan Dham',
    description:
      'Join Aadisatv for spiritual guidance and self-inquiry. Choose between Online or Bodhgaya Samvad.',
    url: '/spiritual-guidance',
    type: 'website',
  },
};

export default function SpiritualGuidanceRoute() {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Spiritual Guidance',
    provider: {
      '@type': 'Person',
      name: 'Aadisatv',
    },
    description: 'One-on-one spiritual guidance, self-inquiry, and Advaita non-duality sessions.',
    serviceType: 'Spiritual Guidance',
  };

  return (
    <>
      <SchemaOrg schema={serviceSchema} />
      <SamvadChoicePage />
    </>
  );
}
