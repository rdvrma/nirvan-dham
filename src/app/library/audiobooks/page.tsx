import type { Metadata } from 'next';
import AudiobooksPage from '@/components/AudiobooksPage';

export const metadata: Metadata = {
  title: 'Audiobooks | Nirvan Dham Listening Library',
  description:
    'Listen to Nirvan Dham Hindi audiobooks by Aadisatv with chapter playlists, premium audio controls, and MP3 downloads. English audiobook editions are coming soon.',
  alternates: { canonical: '/library/audiobooks' },
  openGraph: {
    title: 'Nirvan Dham Audiobooks',
    description: 'A premium listening library for seekers: Hindi audiobooks, chapter player, and downloads.',
    url: '/library/audiobooks',
    type: 'website',
    images: [{ url: '/library/audiobooks/audiobook-hero.png', width: 1536, height: 1024, alt: 'Nirvan Dham Audiobooks' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nirvan Dham Audiobooks',
    description: 'Hindi audiobooks for listening as sadhana.',
    images: ['/library/audiobooks/audiobook-hero.png'],
  },
};

export default function AudiobooksRoute() {
  return <AudiobooksPage />;
}
