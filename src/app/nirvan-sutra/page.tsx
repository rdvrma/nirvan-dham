import type { Metadata } from 'next';
import TeachingsPage from '@/components/TeachingsPage';
import SchemaOrg from '@/components/SchemaOrg';

export const metadata: Metadata = {
  title: 'Nirvan Sutra | The Expression of Nirvan Dham',
  description:
    'Nirvan Sutra is the living expression of Nirvan Dham. Explore teachings on Advaita, non-duality, self-inquiry, guided meditation, and Samvad with Aadisatv.',
  alternates: {
    canonical: '/nirvan-sutra',
  },
  openGraph: {
    title: 'Nirvan Sutra | Nirvan Dham',
    description:
      'Explore teachings on Advaita, non-duality, self-inquiry, guided meditation, and Samvad with Aadisatv.',
    url: '/nirvan-sutra',
    type: 'website',
  },
};

export default function NirvanSutraRoute() {
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Nirvan Sutra',
    description: 'The living expression of Nirvan Dham. Teachings on Advaita, non-duality, self-inquiry, guided meditation, and Samvad with Aadisatv.',
    url: 'https://nirvandham.in/nirvan-sutra',
    about: {
      '@type': 'Thing',
      name: 'Advaita Vedanta and Non-duality',
    },
  };

  return (
    <>
      <SchemaOrg schema={collectionSchema} />
      <TeachingsPage />
    </>
  );
}
