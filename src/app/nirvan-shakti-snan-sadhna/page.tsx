import type { Metadata } from 'next';
import NirvanShaktiSnanPage from '@/components/NirvanShaktiSnanPage';
import SchemaOrg from '@/components/SchemaOrg';

export const metadata: Metadata = {
  title: 'Nirvan Shakti Snan Sadhna | Mahamaya Meditation Program | Nirvan Dham',
  description:
    'निर्वाण शक्ति स्नान साधना Nirvan Dham का निःशुल्क दैनिक ध्यान कार्यक्रम है, जिसमें Aadisatv Deeksha, मंत्र साधना, मासिक Shakti Snan और देवी महामाया की अनुभव-यात्रा सम्मिलित है।',
  keywords: [
    'Nirvan Shakti Snan',
    'Shakti Snan Sadhna',
    'Aadisatv Deeksha',
    'Nirvan Dham meditation',
    'Mahamaya Sadhna',
    'Shaktipat meditation',
    'mantra sadhna',
    'spiritual experience meditation',
  ],
  alternates: { canonical: '/nirvan-shakti-snan-sadhna' },
  openGraph: {
    title: 'Nirvan Shakti Snan Sadhna | Nirvan Dham',
    description: 'देवी महामाया की उपस्थिति में निःशुल्क दैनिक ध्यान, दीक्षा और मासिक शक्ति स्नान की साधना-यात्रा।',
    url: '/nirvan-shakti-snan-sadhna',
    type: 'website',
    images: [{
      url: '/programs/nirvan-shakti-snan/mahamaya-hero.png',
      width: 1672,
      height: 941,
      alt: 'Nirvan Shakti Snan Sadhna',
    }],
  },
};

export default function NirvanShaktiSnanRoute() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Nirvan Shakti Snan Sadhna',
    description: 'A free six-month meditation program with daily group practice, Aadisatv Deeksha and monthly Shakti Snan.',
    provider: {
      '@type': 'Organization',
      name: 'Nirvan Dham',
      url: 'https://nirvandham.in',
    },
    isAccessibleForFree: true,
    inLanguage: ['hi', 'en'],
    url: 'https://nirvandham.in/nirvan-shakti-snan-sadhna',
  };

  return (
    <>
      <SchemaOrg schema={schema} />
      <NirvanShaktiSnanPage />
    </>
  );
}
