import type { Metadata } from 'next';
import LibraryPage from '@/components/LibraryPage';

export const metadata: Metadata = {
  title: 'Digital Library | Nirvan Dham — eBooks, Audiobooks & Muktibodh Magazine',
  description:
    'Explore the Nirvan Dham Digital Library — eBooks on Advaita, non-duality and self-inquiry by Aadisatv, guided meditation audiobooks, and the monthly Muktibodh magazine.',
  alternates: { canonical: '/library' },
  openGraph: {
    title: 'Digital Library | Nirvan Dham',
    description: 'eBooks, Audiobooks & Muktibodh Magazine by Aadisatv — Nirvan Dham.',
    url: '/library',
    type: 'website',
  },
};

export default function LibraryRoute() {
  return <LibraryPage />;
}
