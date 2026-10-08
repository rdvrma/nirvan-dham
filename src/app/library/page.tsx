import type { Metadata } from 'next';
import LibraryPage from '@/components/LibraryPage';

export const metadata: Metadata = {
  title: 'Digital Library | Nirvan Dham — Nirvan Sutra Patrika, eBooks & Audiobooks',
  description:
    'Explore Nirvan Sutra Patrika, an interactive reading and listening journey, alongside Nirvan Dham eBooks, audiobooks and the Muktibodh magazine archive.',
  alternates: { canonical: '/library' },
  openGraph: {
    title: 'Digital Library | Nirvan Dham',
    description: 'Nirvan Sutra Patrika, eBooks, Audiobooks & the Muktibodh archive — Nirvan Dham.',
    url: '/library',
    type: 'website',
  },
};

export default function LibraryRoute() {
  return <LibraryPage />;
}
