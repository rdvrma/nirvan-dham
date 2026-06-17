import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PremiumBookReader from '@/components/PremiumBookReader';
import { MAGAZINES, getMagazineBySlug } from '@/lib/library-data';
import type { EBook } from '@/lib/library-data';

interface MagazineReaderRouteProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export function generateStaticParams() {
  return MAGAZINES
    .filter((magazine) => !magazine.isPlaceholder && magazine.pdf)
    .map((magazine) => ({
      slug: magazine.slug,
    }));
}

export async function generateMetadata({ params }: MagazineReaderRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const magazine = getMagazineBySlug(slug);

  if (!magazine || magazine.isPlaceholder || !magazine.pdf) {
    return { title: 'Magazine Not Found | Nirvan Dham' };
  }

  const title = `${magazine.nameHindi} | ${magazine.name} ${magazine.issue}`;
  const description = magazine.descriptionHindi || magazine.description;

  return {
    title: `Read ${title} | Nirvan Dham`,
    description,
    alternates: {
      canonical: `/library/magazine/${magazine.slug}/read`,
    },
    openGraph: {
      title: `Read ${title}`,
      description,
      url: `/library/magazine/${magazine.slug}/read`,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: `Read ${title}`,
      description,
    },
  };
}

export default async function MagazineReaderRoutePage({ params, searchParams }: MagazineReaderRouteProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const magazine = getMagazineBySlug(slug);

  if (!magazine || magazine.isPlaceholder || !magazine.pdf) notFound();

  const readerBook: EBook = {
    slug: magazine.slug,
    titleHindi: magazine.nameHindi,
    titleEnglish: magazine.name,
    subtitleHindi: magazine.issue,
    subtitle: magazine.issue,
    author: 'Aadisatv',
    lang: 'hi',
    cover: magazine.cover || '',
    pdf: magazine.pdf,
    pageImages: magazine.pageImages,
    libraryHref: '/library',
    description: magazine.description,
    descriptionHindi: magazine.descriptionHindi,
  };

  return <PremiumBookReader book={readerBook} initialPage={Number(page) || 1} />;
}
