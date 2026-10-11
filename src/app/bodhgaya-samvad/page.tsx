import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import BodhgayaLanding from '@/components/bodhgaya/BodhgayaLanding';
import SchemaOrg from '@/components/SchemaOrg';
import { isLanguage, LANGUAGE_COOKIE_KEY } from '@/lib/i18n';

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
    description: 'In-person spiritual guidance session in Bodhgaya.',
    serviceType: 'In-Person Spiritual Session',
  };

  return (
    <>
      <SchemaOrg schema={serviceSchema} />
      <BodhgayaLanding initialLanguage={initialLanguage} />
    </>
  );
}
