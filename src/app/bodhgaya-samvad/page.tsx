import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import SamvadExperience from '@/components/bodhgaya/SamvadExperience';
import SchemaOrg from '@/components/SchemaOrg';
import { isLanguage, LANGUAGE_COOKIE_KEY } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Meet Aadisatv in Bodhgaya | Bodhgaya Samvad | Nirvan Dham',
  description:
    'Request a private in-person dialogue with Aadisatv in Bodhgaya. Explore his books and teachings, and bring the question that truly matters to you.',
  alternates: {
    canonical: '/bodhgaya-samvad',
  },
  openGraph: {
    title: 'Meet Aadisatv in Bodhgaya | Bodhgaya Samvad',
    description:
      'Explore Aadisatv’s work and request a private in-person dialogue in Bodhgaya.',
    url: '/bodhgaya-samvad',
    type: 'website',
    images: [{ url: '/images/bodhgaya-samvad/aadisatv-bodhgaya-hero-01.webp', width: 1122, height: 1402, alt: 'Bodhgaya Samvad with Aadisatv' }],
  },
};

export default async function BodhgayaSamvadRoute({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const [params, cookieStore] = await Promise.all([searchParams, cookies()]);
  const saved = cookieStore.get(LANGUAGE_COOKIE_KEY)?.value;
  const initialLanguage = isLanguage(params.lang) ? params.lang : isLanguage(saved) ? saved : 'en';
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
    description: 'Application-based in-person dialogue and self-inquiry with Aadisatv in Bodhgaya, by prior arrangement.',
    serviceType: 'In-Person Spiritual Session',
  };

  return (
    <>
      <SchemaOrg schema={serviceSchema} />
      <SamvadExperience initialLanguage={initialLanguage} />
    </>
  );
}
