import type { Metadata } from 'next';
import AudiobooksPage from '@/components/AudiobooksPage';

export const metadata: Metadata = {
  title: 'Audiobooks | Nirvan Dham Listening Library',
  description:
    'Listen to Nirvan Dham Hindi and English audiobooks with chapter playlists, premium audio controls, and MP3 downloads.',
  alternates: { canonical: '/library/audiobooks' },
  openGraph: {
    title: 'Nirvan Dham Audiobooks',
    description: 'A premium listening library for seekers: Hindi and English audiobooks, chapter player, and downloads.',
    url: '/library/audiobooks',
    type: 'website',
    images: [{ url: '/library/audiobooks/audiobook-hero.png', width: 1536, height: 1024, alt: 'Nirvan Dham Audiobooks' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nirvan Dham Audiobooks',
    description: 'Hindi and English audiobooks for listening as sadhana.',
    images: ['/library/audiobooks/audiobook-hero.png'],
  },
};

export default function AudiobooksRoute() {
  return <AudiobooksPage />;
}
