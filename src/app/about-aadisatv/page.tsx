import type { Metadata } from 'next';
import AboutAadisatvPage from '@/components/AboutAadisatvPage';
import SchemaOrg from '@/components/SchemaOrg';

export const metadata: Metadata = {
  title: 'About Aadisatv | Spiritual Guide for Advaita & Awareness',
  description:
    'Aadisatv guides seekers toward direct seeing through Advaita, non-duality, and self-inquiry. Learn about the pure awareness at the heart of Nirvan Dham.',
  alternates: {
    canonical: '/about-aadisatv',
  },
  openGraph: {
    title: 'About Aadisatv | Spiritual Guide',
    description:
      'Learn about Aadisatv and the core teachings of Advaita, non-duality, and self-inquiry at Nirvan Dham.',
    url: '/about-aadisatv',
    type: 'website',
  },
};

export default function AboutRoute() {
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Aadisatv',
    jobTitle: 'Spiritual Guide',
    description: 'A spiritual guide focusing on Advaita, non-duality, and self-inquiry.',
    url: 'https://nirvandham.in/about-aadisatv',
    affiliation: {
      '@type': 'Organization',
      name: 'Nirvan Dham',
    },
  };

  return (
    <>
      <SchemaOrg schema={personSchema} />
      <AboutAadisatvPage />
    </>
  );
}
