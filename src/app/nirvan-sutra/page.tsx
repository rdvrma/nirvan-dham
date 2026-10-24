import type { Metadata } from 'next';
import NirvanSutraCoursePage from '@/components/NirvanSutraCoursePage';
import SchemaOrg from '@/components/SchemaOrg';

export const metadata: Metadata = {
  title: 'Nirvan Sutra Course | 17 Stages of Self-Inquiry | Nirvan Dham',
  description:
    'निर्वाण सूत्र: आदिसत्व के साथ आत्म-विचार की 17 चरणों और 170 प्रश्नों वाली यात्रा। 11 भाषाओं में फ़िल्में, उपलब्ध dubbed audio और सुरक्षित प्रगति।',
  alternates: {
    canonical: '/nirvan-sutra',
  },
  openGraph: {
    title: 'Nirvan Sutra Course | Nirvan Dham',
    description:
      'A seventeen-stage journey of self-inquiry with 170 questions, films and language-matched audio.',
    url: '/nirvan-sutra',
    type: 'website',
  },
};

export default function NirvanSutraRoute() {
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Nirvan Sutra',
    description: 'A seventeen-stage course of self-inquiry with 170 questions and language-matched audio.',
    url: 'https://nirvandham.in/nirvan-sutra',
    provider: { '@type': 'Organization', name: 'Nirvan Dham', url: 'https://nirvandham.in' },
    inLanguage: ['hi', 'en', 'bn', 'gu', 'kn', 'ml', 'mr', 'or', 'pa', 'ta', 'te'],
    about: {
      '@type': 'Thing',
      name: 'Advaita Vedanta and Non-duality',
    },
  };

  return (
    <>
      <SchemaOrg schema={collectionSchema} />
      <NirvanSutraCoursePage />
    </>
  );
}
