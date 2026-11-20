import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PremiumBookReader from '@/components/PremiumBookReader';
import { MAGAZINES, getMagazineBySlug, isMagazineReadable, isMagazineViewable } from '@/lib/library-data';
import type { EBook } from '@/lib/library-data';

interface MagazineReaderRouteProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export function generateStaticParams() {
  return MAGAZINES
    .filter((magazine) => isMagazineViewable(magazine))
    .map((magazine) => ({ slug: magazine.slug }));
}

export async function generateMetadata({ params }: MagazineReaderRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const magazine = getMagazineBySlug(slug);
  if (!magazine || !isMagazineViewable(magazine)) return { title: 'Magazine Not Found | Nirvan Dham' };
  const title = `${magazine.nameHindi} | ${magazine.name} ${magazine.issue}`;
  const description = magazine.descriptionHindi || magazine.description;
  return {
    title: `Read ${title} | Nirvan Dham`,
    description,
    alternates: { canonical: `/library/magazine/${magazine.slug}/read` },
    openGraph: { title: `Read ${title}`, description, url: `/library/magazine/${magazine.slug}/read`, type: 'article' },
    twitter: { card: 'summary', title: `Read ${title}`, description },
  };
}

/** Full-screen PDF reader — used when a magazine has a pdf but no interactive page images yet */
function MuktibodhPdfReader({ magazine }: { magazine: NonNullable<ReturnType<typeof getMagazineBySlug>> }) {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg,#060e08,#0d2014 40%,#071009)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* ── Top bar ── */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.75rem 1.5rem',
        background: 'rgba(4,10,5,0.92)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(212,168,67,0.14)',
        flexShrink: 0,
        flexWrap: 'wrap',
      }}>
        <Link href="/library" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.45rem 0.9rem',
          border: '1px solid rgba(212,168,67,0.22)',
          borderRadius: '7px',
          color: 'rgba(212,168,67,0.78)',
          textDecoration: 'none',
          fontSize: '0.72rem',
          fontFamily: 'var(--font-inter)',
          letterSpacing: '0.04em',
          transition: 'border-color 0.2s',
        }}>
          ← Library
        </Link>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0,
            fontSize: '0.6rem',
            letterSpacing: '0.18em',
            color: '#c7a24e',
            textTransform: 'uppercase',
            fontWeight: 700,
            fontFamily: 'var(--font-inter)',
          }}>
            Nirvan Dham · मुक्तिबोध
          </p>
          <p style={{
            margin: '0.1rem 0 0',
            fontSize: '0.9rem',
            fontFamily: 'var(--font-hind)',
            color: '#f0e7cf',
            fontWeight: 600,
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {magazine.nameHindi} &nbsp;<span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', fontWeight: 400 }}>{magazine.issue}</span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <a href={magazine.pdf!} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 1rem',
            background: 'rgba(212,168,67,0.12)',
            border: '1px solid rgba(212,168,67,0.35)',
            borderRadius: '7px',
            color: '#d4a843',
            textDecoration: 'none',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-inter)',
            fontWeight: 700,
          }}>
            ↗ नये Tab में खोलें
          </a>
          <a href={magazine.pdf!} download style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.9rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '7px',
            color: 'rgba(255,255,255,0.55)',
            textDecoration: 'none',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-inter)',
          }}>
            ↓ PDF
          </a>
        </div>
      </header>

      {/* ── PDF iframe ── */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <iframe
          src={`${magazine.pdf}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 'none',
            background: '#071009',
          }}
          title={`${magazine.nameHindi} - ${magazine.issue}`}
        />
      </div>

      {/* ── Fallback message ── */}
      <noscript>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#d4a843', fontFamily: 'var(--font-hind)' }}>
          <a href={magazine.pdf!} style={{ color: '#d4a843' }}>PDF directly download karein →</a>
        </div>
      </noscript>
    </div>
  );
}

export default async function MagazineReaderRoutePage({ params, searchParams }: MagazineReaderRouteProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const magazine = getMagazineBySlug(slug);

  if (!magazine || !isMagazineViewable(magazine)) notFound();

  // PDF-only issue (isPlaceholder or no pageImages) → show inline PDF reader
  if (!isMagazineReadable(magazine)) {
    return <MuktibodhPdfReader magazine={magazine} />;
  }

  // Full interactive reader (has pageImages)
  const readerBook: EBook = {
    slug: magazine.slug,
    titleHindi: magazine.nameHindi,
    titleEnglish: magazine.name,
    subtitleHindi: magazine.issue,
    subtitle: magazine.issue,
    author: 'Aadisatv',
    lang: 'hi',
    cover: magazine.cover || '',
    pdf: magazine.pdf!,
    pageImages: magazine.pageImages,
    libraryHref: '/library',
    description: magazine.description,
    descriptionHindi: magazine.descriptionHindi,
  };

  return <PremiumBookReader book={readerBook} initialPage={Number(page) || 1} />;
}
