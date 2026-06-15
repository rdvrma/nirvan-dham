import type { Metadata } from 'next';
import BlogIndexPage from '@/components/BlogIndexPage';

import SchemaOrg from '@/components/SchemaOrg';

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
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Nirvan Dham Blog',
    description: 'A premium bilingual collection of Nirvan Dham articles on Advaita and self-inquiry.',
    url: 'https://nirvandham.in/blog',
  };

  return (
    <>
      <SchemaOrg schema={blogSchema} />
      <BlogIndexPage />
    </>
  );
}
