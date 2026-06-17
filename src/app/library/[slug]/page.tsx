import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BookDetailPage from '@/components/BookDetailPage';
import { EBOOKS, getEBookBySlug } from '@/lib/library-data';

interface BookRouteProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  return EBOOKS.map((book) => ({
    slug: book.slug,
  }));
}

export async function generateMetadata({ params }: BookRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const book = getEBookBySlug(slug);

  if (!book) {
    return { title: 'Book Not Found | Nirvan Dham' };
  }

  const title = book.titleHindi ? `${book.titleHindi} | ${book.titleEnglish}` : book.titleEnglish;
  const description = book.descriptionHindi || book.description || book.subtitleHindi || book.subtitle || `Read ${book.titleEnglish} by ${book.author} in the Nirvan Dham Digital Library.`;
  const images = book.cover ? [{ url: book.cover, width: 1200, height: 1800, alt: title }] : undefined;

  return {
    title: `${title} | Nirvan Dham Library`,
    description,
    alternates: {
      canonical: `/library/${book.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/library/${book.slug}`,
      type: 'book',
      images,
    },
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title,
      description,
      images: book.cover ? [book.cover] : undefined,
    },
  };
}

export default async function BookRoutePage({ params }: BookRouteProps) {
  const { slug } = await params;
  const book = getEBookBySlug(slug);

  if (!book) notFound();

  return <BookDetailPage book={book} />;
}
