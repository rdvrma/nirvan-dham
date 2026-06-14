import type { Metadata } from 'next';
import BlogIndexPage from '@/components/BlogIndexPage';

export const metadata: Metadata = {
  title: 'Blogs & Contemplations | Nirvan Dham',
  description:
    'Read Nirvan Dham blogs in Hindi and English: Advaita Vedanta, Jnana Marga, self-inquiry, Maya, witness consciousness, and direct recognition.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blogs & Contemplations | Nirvan Dham',
    description:
      'A premium bilingual collection of Nirvan Dham articles in Hindi and English.',
    url: '/blog',
    type: 'website',
  },
};

export default function BlogRoutePage() {
  return <BlogIndexPage />;
}
