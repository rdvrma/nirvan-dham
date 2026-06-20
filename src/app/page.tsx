import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import HomePageClient from '@/components/HomePageClient';
import SchemaOrg from '@/components/SchemaOrg';

export const metadata: Metadata = {
  title: 'Nirvan Dham | Self-Inquiry, Non-Duality & Awareness',
  description:
    'Nirvan Dham is a space for seekers of awareness, non-duality, oneness, and self-inquiry. Guided by Aadisatv, explore Advaita Vedanta through Nirvan Sutra.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Nirvan Dham | Self-Inquiry & Non-Duality',
    description:
      'Nirvan Dham is a space for seekers of awareness, non-duality, oneness, and self-inquiry. Guided by Aadisatv.',
    url: '/',
    type: 'website',
  },
};

interface HomePageProps {
  searchParams: Promise<{ code?: string; next?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { code, next } = await searchParams;
  if (code) {
    const callbackParams = new URLSearchParams({ code });
    if (next?.startsWith('/') && !next.startsWith('//')) callbackParams.set('next', next);
    redirect(`/auth/callback?${callbackParams.toString()}`);
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Nirvan Dham',
    url: 'https://nirvandham.in',
    description: 'A space for seekers of awareness, non-duality, oneness, and self-inquiry guided by Aadisatv.',
    publisher: {
      '@type': 'Organization',
      name: 'Nirvan Dham',
      logo: {
        '@type': 'ImageObject',
        url: 'https://nirvandham.in/brand/lotus-mark.png',
      },
    },
  };

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Aadisatv',
    jobTitle: 'Spiritual Guide',
    description: 'Aadisatv guides seekers toward direct seeing: you are not merely the name, body, or mind — you are the awareness in which all appears.',
    url: 'https://nirvandham.in',
    affiliation: {
      '@type': 'Organization',
      name: 'Nirvan Dham',
    },
  };

  return (
    <>
      <SchemaOrg schema={websiteSchema} />
      <SchemaOrg schema={personSchema} />
      <HomePageClient />
    </>
  );
}
