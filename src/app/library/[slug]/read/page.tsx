import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PremiumBookReader from '@/components/PremiumBookReader';
import { EBOOKS, getEBookBySlug } from '@/lib/library-data';

interface BookReaderRouteProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export function generateStaticParams() {
  return EBOOKS
    .filter((book) => !book.isPlaceholder && book.pdf)
    .map((book) => ({
      slug: book.slug,
    }));
}

export async function generateMetadata({ params }: BookReaderRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const book = getEBookBySlug(slug);

  if (!book || book.isPlaceholder || !book.pdf) {
    return { title: 'Reader Not Found | Nirvan Dham' };
  }

  const title = book.titleHindi ? `${book.titleHindi} | ${book.titleEnglish}` : book.titleEnglish;
  const description = `Read ${book.titleEnglish} in the premium Nirvan Dham web-book reader with page flip, grid view, themes, and PDF download.`;

  return {
    title: `Read ${title} | Nirvan Dham`,
    description,
    alternates: {
      canonical: `/library/${book.slug}/read`,
    },
    openGraph: {
      title: `Read ${title}`,
      description,
      url: `/library/${book.slug}/read`,
      type: 'article',
      images: book.cover ? [{ url: book.cover, width: 1200, height: 1800, alt: title }] : undefined,
    },
    twitter: {
      card: book.cover ? 'summary_large_image' : 'summary',
      title: `Read ${title}`,
      description,
      images: book.cover ? [book.cover] : undefined,
    },
  };
}

export default async function BookReaderRoutePage({ params, searchParams }: BookReaderRouteProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const book = getEBookBySlug(slug);

  if (!book || book.isPlaceholder || !book.pdf) notFound();

  return <PremiumBookReader book={book} initialPage={Number(page) || 1} />;
}
