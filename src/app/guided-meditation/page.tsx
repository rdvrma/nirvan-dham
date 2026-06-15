import type { Metadata } from 'next';
import SadhanaPageComponent from '@/components/SadhanaPage';
import SchemaOrg from '@/components/SchemaOrg';

export const metadata: Metadata = {
  title: 'Guided Meditation | Audio for Self-Realization',
  description:
    'Experience deep guided meditations by Aadisatv to help you rest in awareness and practice self-inquiry.',
  alternates: {
    canonical: '/guided-meditation',
  },
  openGraph: {
    title: 'Guided Meditation | Nirvan Dham',
    description:
      'Experience deep guided meditations by Aadisatv to help you rest in awareness.',
    url: '/guided-meditation',
    type: 'website',
  },
};

export default function GuidedMeditationRoute() {
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Guided Meditation',
    description: 'Audio guided meditations for self-realization and awareness.',
    url: 'https://nirvandham.in/guided-meditation',
    about: {
      '@type': 'Thing',
      name: 'Meditation and Mindfulness',
    },
  };

  return (
    <>
      <SchemaOrg schema={collectionSchema} />
      <SadhanaPageComponent />
    </>
  );
}
