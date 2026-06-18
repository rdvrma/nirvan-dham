'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import Link from 'next/link';
import type { CSSProperties, MouseEvent, PointerEvent, TouchEvent, WheelEvent } from 'react';
import type { EBook } from '@/lib/library-data';
import { getBookManuscript } from '@/lib/book-manuscripts';
import type { BookManuscript, ManuscriptBlock } from '@/lib/book-manuscripts';

type ReaderTheme = 'dark' | 'light' | 'sepia';
type ReaderView = 'flip' | 'grid';
type ReaderMode = 'manuscript' | 'image' | 'pdf';

interface ReaderPalette {
  app: string;
  panel: string;
  paper: string;
  ink: string;
  muted: string;
  border: string;
  gold: string;
}

interface PremiumBookReaderProps {
  book: EBook;
  initialPage?: number;
}

interface ReaderPage {
  id: string;
  kind: 'cover' | 'section' | 'content';
  sectionTitle?: string;
  sectionSubtitle?: string;
  sectionType?: string;
  blocks: ManuscriptBlock[];
}

interface PdfDocument {
  numPages: number;
  getPage(pageNumber: number): Promise<PdfRenderPage>;
}

interface PdfRenderPage {
  getViewport(options: { scale: number }): PdfViewport;
  render(options: { canvasContext: CanvasRenderingContext2D; viewport: PdfViewport }): PdfRenderTask;
}

interface PdfViewport {
  width: number;
  height: number;
}

interface PdfRenderTask {
  promise: Promise<void>;
  cancel?: () => void;
}

interface FlipBookApi {
  pageFlip(): {
    flipNext: (corner?: 'top' | 'bottom') => void;
    flipPrev: (corner?: 'top' | 'bottom') => void;
    turnToPage: (pageIndex: number) => void;
  };
}

interface FlipEvent {
  data: number;
}

type ScrollGestureEvent =
  | WheelEvent<HTMLElement>
  | PointerEvent<HTMLElement>
  | MouseEvent<HTMLElement>
  | TouchEvent<HTMLElement>;

function stopFlipGesture(event: ScrollGestureEvent) {
  event.stopPropagation();
}

const scrollGestureGuards = {
  onWheelCapture: stopFlipGesture,
  onPointerDownCapture: stopFlipGesture,
  onMouseDownCapture: stopFlipGesture,
  onTouchStartCapture: stopFlipGesture,
};

const imageScrollGestureGuards = {
  onWheelCapture: stopFlipGesture,
  onPointerDownCapture: stopFlipGesture,
  onMouseDownCapture: stopFlipGesture,
};

const IMAGE_MIN_ZOOM = 0.7;
const IMAGE_ZOOM_STEP = 0.15;

export default function PremiumBookReader({ book, initialPage = 1 }: PremiumBookReaderProps) {
  const flipRef = useRef<FlipBookApi | null>(null);
  const manuscript = useMemo(() => getBookManuscript(book.slug), [book.slug]);
  const manuscriptPages = useMemo(() => manuscript ? buildManuscriptPages(manuscript) : [], [manuscript]);
  const mode: ReaderMode = manuscript ? 'manuscript' : (book.pageImages?.length ? 'image' : 'pdf');

  const [pdfDoc, setPdfDoc] = useState<PdfDocument | null>(null);
  const [loading, setLoading] = useState(mode === 'pdf');
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [theme, setTheme] = useState<ReaderTheme>('dark');
  const [view, setView] = useState<ReaderView>('flip');
  const [fontScale, setFontScale] = useState(1);
  const [copied, setCopied] = useState(false);
  const [pageSize, setPageSize] = useState({ width: 430, height: 608, portrait: false });
  const [mounted, setMounted] = useState(false);

  const title = manuscript?.title || book.titleHindi || book.titleEnglish;
  const subtitle = manuscript?.subtitle || book.subtitleHindi || book.subtitle;
  const totalPages = mode === 'manuscript'
    ? manuscriptPages.length
    : mode === 'image'
      ? book.pageImages?.length || 0
      : (pdfDoc?.numPages || 0);
  const storageKey = `nirvan-reader-${book.slug}-page`;

  useEffect(() => {
    function measure() {
      const portrait = window.innerWidth < 920;
      const pageCount = portrait ? 1 : 2;
      const pageAspect = mode === 'image' ? 1946 / 1400 : 1.414;
      const sideReserve = portrait ? 28 : 150;
      const verticalReserve = portrait ? 178 : 214;
      const widthByViewport = Math.max(300, (window.innerWidth - sideReserve) / pageCount);
      const widthByHeight = Math.max(300, (window.innerHeight - verticalReserve) / pageAspect);
      const maxWidth = mode === 'image' ? 540 : 560;
      const nextWidth = Math.round(Math.min(maxWidth, widthByViewport, widthByHeight));
      setPageSize({
        width: nextWidth,
        height: Math.round(nextWidth * pageAspect),
        portrait,
      });
    }

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [mode]);

  // FOUC fix — mark mounted after first paint
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const storedPage = Number(window.localStorage.getItem(storageKey));
    const immediateTotal = mode === 'manuscript'
      ? manuscriptPages.length
      : mode === 'image'
        ? book.pageImages?.length || 0
        : 0;

    if (mode === 'manuscript' || mode === 'image') {
      setLoading(false);
      setCurrentPage(clampPage(initialPage || storedPage || 1, immediateTotal));
      return;
    }

    let cancelled = false;

    async function loadPdf() {
      try {
        setLoading(true);
        setError('');
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        const doc = await pdfjsLib.getDocument({ url: book.pdf }).promise as PdfDocument;
        if (cancelled) return;
        setPdfDoc(doc);
        setCurrentPage(clampPage(initialPage || storedPage || 1, doc.numPages));
      } catch {
        if (!cancelled) setError('This book could not be opened right now.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPdf();
    return () => {
      cancelled = true;
    };
  }, [book.pageImages?.length, book.pdf, initialPage, manuscriptPages.length, mode, storageKey]);

  const palette = useMemo<ReaderPalette>(() => {
    if (theme === 'light') {
      return {
        app: '#e9dfcc',
        panel: 'rgba(249,243,232,0.9)',
        paper: '#fbf6ec',
        ink: '#21180f',
        muted: 'rgba(33,24,15,0.58)',
        border: 'rgba(91,62,22,0.18)',
        gold: '#9f7328',
      };
    }

    if (theme === 'sepia') {
      return {
        app: '#21170e',
        panel: 'rgba(45,31,18,0.9)',
        paper: '#ead8b5',
        ink: '#2a1b0e',
        muted: 'rgba(42,27,14,0.6)',
        border: 'rgba(196,139,53,0.24)',
        gold: '#bd8230',
      };
    }

    return {
      app: '#061008',
      panel: 'rgba(5,10,6,0.9)',
      paper: '#101d12',
      ink: '#f2e8d0',
      muted: 'rgba(242,232,208,0.54)',
      border: 'rgba(212,168,67,0.16)',
      gold: '#d4a843',
    };
  }, [theme]);

  const syncPage = useCallback((page: number) => {
    const safePage = clampPage(page, totalPages);
    setCurrentPage(safePage);
    window.localStorage.setItem(storageKey, String(safePage));
    const url = new URL(window.location.href);
    url.searchParams.set('page', String(safePage));
    window.history.replaceState(null, '', url.toString());
  }, [storageKey, totalPages]);

  const turnToPage = useCallback((page: number) => {
    const safePage = clampPage(page, totalPages);
    flipRef.current?.pageFlip().turnToPage(safePage - 1);
    syncPage(safePage);
  }, [syncPage, totalPages]);

  const goNext = useCallback(() => {
    if (currentPage >= totalPages) return;
    const nextPage = currentPage + 1;
    flipRef.current?.pageFlip().flipNext('bottom');
    window.setTimeout(() => syncPage(nextPage), 920);
  }, [currentPage, syncPage, totalPages]);

  const goPrev = useCallback(() => {
    if (currentPage <= 1) return;
    const previousPage = currentPage - 1;
    flipRef.current?.pageFlip().flipPrev('bottom');
    window.setTimeout(() => syncPage(previousPage), 920);
  }, [currentPage, syncPage]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (view !== 'flip') return;
      if (event.key === 'ArrowRight') goNext();
      if (event.key === 'ArrowLeft') goPrev();
      if (mode === 'manuscript' && event.key === 'ArrowDown') goNext();
      if (mode === 'manuscript' && event.key === 'ArrowUp') goPrev();
      if (event.key.toLowerCase() === 'g') setView((value) => value === 'grid' ? 'flip' : 'grid');
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goNext, goPrev, mode, view]);

  function onFlip(event: FlipEvent) {
    syncPage(event.data + 1);
  }

  async function shareCurrentPage() {
    const url = new URL(window.location.href);
    url.searchParams.set('page', String(currentPage));
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: palette.app, color: palette.ink, opacity: mounted ? 1 : 0, transition: 'opacity 0.2s ease' }}>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        padding: '0.75rem clamp(0.85rem,3vw,1.5rem)',
        background: palette.panel,
        borderBottom: `1px solid ${palette.border}`,
        backdropFilter: 'blur(18px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
          <Link href={book.libraryHref || `/library/${book.slug}`} style={readerButton(palette)}>
            Library
          </Link>
          <div style={{ minWidth: 0 }}>
            <p style={{
              color: palette.ink,
              fontFamily: book.lang === 'hi' ? 'var(--font-hind)' : 'var(--font-cormorant)',
              fontSize: '0.92rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 'min(44vw,420px)',
            }}>
              {title}
            </p>
            <p style={{ color: palette.gold, fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Page {currentPage || 1} of {totalPages || '...'} / {mode === 'manuscript' ? 'Manuscript' : mode === 'image' ? 'Magazine' : 'PDF'}
            </p>
          </div>
        </div>

        <div className="reader-toolbar" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => setView(view === 'flip' ? 'grid' : 'flip')} style={readerButton(palette)}>
            {view === 'flip' ? 'Grid' : 'Flip'}
          </button>
          <button type="button" onClick={() => setTheme(nextTheme(theme))} style={readerButton(palette)}>
            {theme}
          </button>
          <button type="button" onClick={() => setFontScale((value) => {
            const minZoom = mode === 'image' ? IMAGE_MIN_ZOOM : 0.88;
            const step = mode === 'image' ? IMAGE_ZOOM_STEP : 0.06;
            return Math.max(minZoom, parseFloat((value - step).toFixed(2)));
          })} style={readerButton(palette)}>
            {mode === 'manuscript' ? 'A-' : 'Zoom -'}
          </button>
          <button type="button" onClick={() => setFontScale((value) => {
            if (mode !== 'image') return Math.min(1.24, parseFloat((value + 0.06).toFixed(2)));
            return parseFloat((value + IMAGE_ZOOM_STEP).toFixed(2));
          })} style={readerButton(palette)}>
            {mode === 'manuscript' ? 'A+' : 'Zoom +'}
          </button>
          <button type="button" onClick={shareCurrentPage} style={readerButton(palette)}>
            {copied ? 'Copied' : 'Share'}
          </button>
          <a href={book.pdf} download style={{ ...readerButton(palette), textDecoration: 'none' }}>
            PDF
          </a>
        </div>
      </header>

      <main style={{ position: 'relative', overflowX: 'hidden', overflowY: 'visible' }}>
        <div className="reader-bg-ring" style={{ borderColor: palette.border }} />

        {loading && (
          <section style={{ minHeight: 'calc(100vh - 72px)', display: 'grid', placeItems: 'center', padding: '2rem' }}>
            <div style={{ width: 'min(520px,100%)', textAlign: 'center' }}>
              <p style={{ color: palette.gold, letterSpacing: '0.22em', textTransform: 'uppercase', fontSize: '0.72rem', marginBottom: '1rem' }}>
                Preparing book
              </p>
              <h1 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, fontSize: 'clamp(2rem,6vw,4rem)', lineHeight: 1, marginBottom: '1.5rem' }}>
                {title}
              </h1>
              <p style={{ color: palette.muted, lineHeight: 1.8 }}>
                {mode === 'manuscript' ? 'Opening native manuscript pages.' : 'Loading exact PDF pages.'}
              </p>
            </div>
          </section>
        )}

        {error && (
          <section style={{ minHeight: 'calc(100vh - 72px)', display: 'grid', placeItems: 'center', padding: '2rem' }}>
            <div style={{ textAlign: 'center', maxWidth: 520 }}>
              <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2rem,6vw,3.5rem)', fontWeight: 300, marginBottom: '1rem' }}>
                Reader unavailable
              </h1>
              <p style={{ color: palette.muted, lineHeight: 1.8, marginBottom: '1.5rem' }}>{error}</p>
              <a href={book.pdf} download style={{ ...readerButton(palette), textDecoration: 'none', display: 'inline-flex' }}>
                Download PDF
              </a>
            </div>
          </section>
        )}

        {!loading && !error && totalPages > 0 && view === 'flip' && (
          <section className="reader-flip-section" style={{
            minHeight: 'calc(100vh - 72px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(1rem,3vw,2rem)',
          }}>
            <div className="book-shell" style={{ '--gold': palette.gold, '--border': palette.border } as CSSProperties}>
              <HTMLFlipBook
                key={`${mode}-${pageSize.width}-${pageSize.height}-${pageSize.portrait}-${totalPages}`}
                ref={flipRef}
                className="nirvan-flipbook"
                style={{}}
                startPage={Math.max(0, currentPage - 1)}
                width={pageSize.width}
                height={pageSize.height}
                minWidth={300}
                maxWidth={540}
                minHeight={424}
                maxHeight={764}
                size="fixed"
                drawShadow
                flippingTime={940}
                usePortrait={pageSize.portrait}
                startZIndex={10}
                autoSize
                maxShadowOpacity={0.58}
                showCover
                mobileScrollSupport={mode !== 'image'}
                clickEventForward={false}
                useMouseEvents={mode === 'manuscript'}
                swipeDistance={mode === 'manuscript' ? 22 : 9999}
                showPageCorners={mode === 'manuscript'}
                disableFlipByClick={mode !== 'manuscript'}
                onFlip={onFlip}
              >
                {mode === 'manuscript' ? manuscriptPages.map((page, index) => (
                  <div className="flip-page native-flip-page" key={page.id}>
                    <ManuscriptPageView
                      page={page}
                      manuscript={manuscript}
                      pageNumber={index + 1}
                      totalPages={totalPages}
                      palette={palette}
                      fontScale={fontScale}
                    />
                  </div>
                )) : mode === 'image' ? book.pageImages?.map((src, index) => (
                  <div className="flip-page image-flip-page" key={src} {...imageScrollGestureGuards}>
                    <ImagePageView
                      src={src}
                      pageNumber={index + 1}
                      title={title}
                      zoom={fontScale}
                      onZoomChange={setFontScale}
                      onSwipeNext={goNext}
                      onSwipePrev={goPrev}
                    />
                  </div>
                )) : Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  const shouldRender = pdfDoc && Math.abs(pageNumber - currentPage) <= 5;
                  return (
                    <div className="flip-page pdf-flip-page" key={pageNumber} {...scrollGestureGuards}>
                      {shouldRender ? (
                        <PdfPageCanvas pdfDoc={pdfDoc} pageNumber={pageNumber} targetWidth={pageSize.width * fontScale} />
                      ) : (
                        <PagePlaceholder pageNumber={pageNumber} title={title} palette={palette} />
                      )}
                    </div>
                  );
                })}
              </HTMLFlipBook>
            </div>

            <nav className="reader-page-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <button type="button" disabled={currentPage <= 1} onClick={goPrev} style={readerNavButton(palette, currentPage <= 1)}>
                Previous
              </button>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(event) => turnToPage(Number(event.target.value))}
                style={{
                  width: 76,
                  border: `1px solid ${palette.border}`,
                  borderRadius: 8,
                  padding: '0.58rem',
                  textAlign: 'center',
                  background: palette.panel,
                  color: palette.ink,
                }}
              />
              <button type="button" disabled={currentPage >= totalPages} onClick={goNext} style={readerNavButton(palette, currentPage >= totalPages)}>
                Next
              </button>
            </nav>
          </section>
        )}

        {!loading && !error && view === 'grid' && (
          <section style={{ padding: 'clamp(1rem,3vw,2rem)', maxWidth: 1320, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '1rem' }}>
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                const page = manuscriptPages[index];
                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => { setView('flip'); window.setTimeout(() => turnToPage(pageNumber), 50); }}
                    style={{
                      border: `1px solid ${pageNumber === currentPage ? palette.gold : palette.border}`,
                      background: palette.paper,
                      color: palette.ink,
                      borderRadius: 8,
                      padding: '1rem',
                      aspectRatio: '2 / 3',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: pageNumber === currentPage ? `0 0 0 1px ${palette.gold}` : 'none',
                    }}
                  >
                    <span style={{ color: palette.gold, fontSize: '0.66rem', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                      Page {pageNumber}
                    </span>
                    {mode === 'image' && book.pageImages?.[index] ? (
                      <img
                        src={book.pageImages[index]}
                        alt={`${title} page ${pageNumber}`}
                        style={{ width: '100%', minHeight: 0, flex: 1, objectFit: 'cover', borderRadius: 5, marginTop: '0.7rem' }}
                      />
                    ) : (
                      <span style={{
                        fontFamily: book.lang === 'hi' ? 'var(--font-hind)' : 'var(--font-cormorant)',
                        fontSize: '1.05rem',
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 6,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {page ? getGridLabel(page) : title}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <style jsx global>{`
        .reader-bg-ring {
          position: absolute;
          width: min(76vw, 820px);
          aspect-ratio: 1;
          right: -14vw;
          top: 8vh;
          border: 1px solid;
          border-radius: 50%;
          opacity: 0.45;
          pointer-events: none;
        }

        .book-shell {
          position: relative;
          border-radius: 8px;
          filter: drop-shadow(0 34px 70px rgba(0,0,0,0.42));
        }

        .book-shell::before {
          content: "";
          position: absolute;
          inset: -12px;
          border-radius: 14px;
          border: 1px solid color-mix(in srgb, var(--gold) 16%, transparent);
          background:
            linear-gradient(90deg, transparent 49.4%, rgba(0,0,0,0.26) 50%, transparent 50.6%),
            radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--gold) 12%, transparent), transparent 58%);
          pointer-events: none;
          z-index: -1;
        }

        .book-shell::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: -32px;
          width: 72%;
          height: 36px;
          transform: translateX(-50%);
          background: radial-gradient(ellipse, rgba(0,0,0,0.48), transparent 70%);
          filter: blur(12px);
          pointer-events: none;
        }

        .nirvan-flipbook {
          margin: 0 auto;
        }

        .flip-page {
          background:
            linear-gradient(90deg, rgba(0,0,0,0.08), transparent 8%, transparent 92%, rgba(0,0,0,0.12)),
            radial-gradient(circle at 20% 12%, rgba(255,255,255,0.36), transparent 24%),
            #f8f1df;
          overflow: hidden;
          border-radius: 3px;
          border: 1px solid color-mix(in srgb, var(--gold) 26%, transparent);
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.22),
            inset 18px 0 28px rgba(86,51,13,0.05),
            inset -18px 0 28px rgba(0,0,0,0.08);
        }

        .native-flip-page {
          background: transparent;
        }

        .manuscript-page {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
          padding: clamp(1.45rem, 4vw, 2.6rem);
          display: flex;
          flex-direction: column;
          box-shadow:
            inset 0 0 0 1px color-mix(in srgb, var(--page-gold) 12%, transparent),
            inset 0 0 80px rgba(0,0,0,0.08);
        }

        .manuscript-page::before {
          content: "";
          position: absolute;
          inset: 0.75rem;
          border: 1px solid color-mix(in srgb, var(--gold) 20%, transparent);
          border-radius: 4px;
          pointer-events: none;
        }

        .manuscript-page::after {
          content: "";
          position: absolute;
          inset: 0;
          opacity: 0.12;
          pointer-events: none;
          background-image:
            radial-gradient(circle at 18% 22%, color-mix(in srgb, var(--page-gold) 18%, transparent) 0 1px, transparent 1px),
            radial-gradient(circle at 74% 61%, rgba(255,255,255,0.32) 0 1px, transparent 1px);
          background-size: 34px 34px, 46px 46px;
          mix-blend-mode: overlay;
        }

        .manuscript-kicker {
          position: relative;
          z-index: 1;
          color: var(--page-gold);
          font-size: 0.62rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: 0.9rem;
        }

        .manuscript-title {
          position: relative;
          z-index: 1;
          color: var(--page-ink);
          font-family: var(--font-cormorant);
          font-size: calc(2.15rem * var(--font-scale));
          font-weight: 300;
          line-height: 1.02;
          margin-bottom: 0.72rem;
          max-width: 100%;
          overflow-wrap: break-word;
          text-wrap: balance;
        }

        .manuscript-title.hi {
          font-family: var(--font-hind);
          font-weight: 600;
          line-height: 1.16;
          font-size: calc(1.82rem * var(--font-scale));
        }

        .manuscript-subtitle {
          position: relative;
          z-index: 1;
          color: var(--page-muted);
          font-size: calc(0.95rem * var(--font-scale));
          line-height: 1.55;
          margin-bottom: 1rem;
          max-width: 100%;
          overflow-wrap: break-word;
          text-wrap: balance;
        }

        .manuscript-body {
          position: relative;
          z-index: 1;
          color: var(--page-ink);
          font-family: var(--font-cormorant);
          font-size: calc(1.04rem * var(--font-scale));
          line-height: 1.58;
        }

        .manuscript-body.hi {
          font-family: var(--font-hind);
          font-size: calc(0.92rem * var(--font-scale));
          line-height: 1.68;
        }

        .manuscript-body p + p,
        .manuscript-body h3 + p,
        .manuscript-body p + h3 {
          margin-top: 0.58rem;
        }

        .manuscript-body h3 {
          color: var(--page-gold);
          font-family: var(--font-cormorant);
          font-size: calc(1.25rem * var(--font-scale));
          font-weight: 500;
          line-height: 1.2;
        }

        .manuscript-body.hi h3 {
          font-family: var(--font-hind);
          font-size: calc(1.08rem * var(--font-scale));
        }

        .manuscript-page-number {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          color: var(--page-muted);
          font-size: 0.7rem;
          letter-spacing: 0.12em;
        }

        .flip-page canvas {
          display: block;
          width: 100%;
          height: 100%;
        }

        .image-flip-page,
        .pdf-flip-page {
          overflow: auto;
          overscroll-behavior: contain;
          scrollbar-width: thin;
          scrollbar-color: color-mix(in srgb, var(--gold) 42%, transparent) transparent;
        }

        .image-flip-page {
          touch-action: pan-x pan-y pinch-zoom;
        }

        .pdf-flip-page {
          touch-action: pan-x pan-y;
        }

        .image-page-frame {
          width: 100%;
          height: 100%;
          overflow: auto;
          background: #f8f1df;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          overscroll-behavior: contain;
          touch-action: pan-x pan-y pinch-zoom;
          scrollbar-width: thin;
          scrollbar-color: rgba(126,91,31,0.55) transparent;
        }

        .image-page-frame.is-zoomed {
          justify-content: flex-start;
          cursor: grab;
          touch-action: pan-x pan-y pinch-zoom;
        }

        .image-page-frame img {
          user-select: none;
          box-shadow: 0 0 0 1px rgba(88,62,22,0.08);
        }

        .pdf-page-loading,
        .pdf-page-placeholder {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          background: #f8f1df;
          color: #7c5b26;
          font-family: var(--font-cormorant);
          text-align: center;
          padding: 2rem;
        }

        @media (max-width: 700px) {
          .reader-toolbar {
            width: 100%;
          }

          .reader-flip-section {
            min-height: calc(100dvh - 132px) !important;
            justify-content: flex-start !important;
            padding: 0.9rem 0.35rem calc(5.8rem + env(safe-area-inset-bottom)) !important;
          }

          .reader-page-nav {
            position: fixed;
            left: 0.75rem;
            right: 0.75rem;
            bottom: calc(0.75rem + env(safe-area-inset-bottom));
            z-index: 80;
            margin-top: 0 !important;
            padding: 0.55rem;
            border: 1px solid rgba(212,168,67,0.16);
            border-radius: 12px;
            background: rgba(5,10,6,0.9);
            backdrop-filter: blur(16px);
            box-shadow: 0 14px 32px rgba(0,0,0,0.34);
          }

          .reader-page-nav input {
            min-height: 42px;
          }
        }
      `}</style>
    </div>
  );
}

function ManuscriptPageView({
  page,
  manuscript,
  pageNumber,
  totalPages,
  palette,
  fontScale,
}: {
  page: ReaderPage;
  manuscript: BookManuscript | null;
  pageNumber: number;
  totalPages: number;
  palette: ReaderPalette;
  fontScale: number;
}) {
  const lang = manuscript?.language || 'en';
  const hi = lang === 'hi';
  const pageVars = {
    '--page-paper': palette.paper,
    '--page-ink': palette.ink,
    '--page-muted': palette.muted,
    '--page-gold': palette.gold,
    '--font-scale': fontScale,
    background:
      page.kind === 'cover'
        ? `radial-gradient(circle at 50% 18%, color-mix(in srgb, ${palette.gold} 18%, transparent), transparent 45%), ${palette.paper}`
        : palette.paper,
    color: palette.ink,
  } as CSSProperties;

  return (
    <article className="manuscript-page" style={pageVars}>
      <p className="manuscript-kicker">
        {page.kind === 'cover' ? manuscript?.series || 'Nirvan Dham' : `Nirvan Dham / Page ${pageNumber}`}
      </p>

      {page.kind === 'cover' ? (
        <>
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
            <div>
              <h1 className={`manuscript-title ${hi ? 'hi' : ''}`} style={{ fontSize: hi ? 'calc(2.7rem * var(--font-scale))' : 'calc(3rem * var(--font-scale))' }}>
                {manuscript?.title}
              </h1>
              {manuscript?.subtitle && <p className="manuscript-subtitle">{manuscript.subtitle}</p>}
              <p style={{ color: palette.gold, marginTop: '1.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                {manuscript?.authorDevanagari || manuscript?.author}
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          {page.kind === 'section' && (
            <div style={{ flex: 1, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
              <div>
                <h1 className={`manuscript-title ${hi ? 'hi' : ''}`}>
                  {page.sectionTitle}
                </h1>
                {page.sectionSubtitle && <p className="manuscript-subtitle">{page.sectionSubtitle}</p>}
              </div>
            </div>
          )}

          {page.kind === 'content' && (
            <>
              {page.sectionTitle && <h1 className={`manuscript-title ${hi ? 'hi' : ''}`}>{page.sectionTitle}</h1>}
              {page.sectionSubtitle && <p className="manuscript-subtitle">{page.sectionSubtitle}</p>}
              <div className={`manuscript-body ${hi ? 'hi' : ''}`}>
                {page.blocks.map((block, index) => block.type === 'heading' ? (
                  <h3 key={`${page.id}-${index}`}>{block.text}</h3>
                ) : (
                  <p key={`${page.id}-${index}`}>{block.text}</p>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <p className="manuscript-page-number">{pageNumber} / {totalPages}</p>
    </article>
  );
}

function ImagePageView({
  src,
  pageNumber,
  title,
  zoom,
  onZoomChange,
  onSwipeNext,
  onSwipePrev,
}: {
  src: string;
  pageNumber: number;
  title: string;
  zoom: number;
  onZoomChange: (update: (value: number) => number) => void;
  onSwipeNext: () => void;
  onSwipePrev: () => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  const touchRef = useRef<{ x: number; y: number; time: number } | null>(null);

  function getTouchDistance(touches: { length: number; item(index: number): { clientX: number; clientY: number } | null }) {
    if (touches.length < 2) return 0;
    const first = touches.item(0);
    const second = touches.item(1);
    if (!first || !second) return 0;
    return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
  }

  function onImageTouchStart(event: TouchEvent<HTMLDivElement>) {
    event.stopPropagation();
    if (event.touches.length >= 2) {
      pinchRef.current = { distance: getTouchDistance(event.touches), zoom };
      touchRef.current = null;
      return;
    }

    const touch = event.touches.item(0);
    if (!touch) return;
    pinchRef.current = null;
    touchRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }

  function onImageTouchMove(event: TouchEvent<HTMLDivElement>) {
    event.stopPropagation();
    if (event.touches.length >= 2 && pinchRef.current) {
      event.preventDefault();
      const nextDistance = getTouchDistance(event.touches);
      if (!nextDistance || !pinchRef.current.distance) return;
      const ratio = nextDistance / pinchRef.current.distance;
      const nextZoom = Math.max(IMAGE_MIN_ZOOM, parseFloat((pinchRef.current.zoom * ratio).toFixed(2)));
      onZoomChange(() => nextZoom);
    }
  }

  function onImageTouchEnd(event: TouchEvent<HTMLDivElement>) {
    event.stopPropagation();
    if (pinchRef.current || event.touches.length > 0) {
      if (event.touches.length === 0) pinchRef.current = null;
      return;
    }

    const start = touchRef.current;
    const touch = event.changedTouches.item(0);
    touchRef.current = null;
    if (!start || !touch) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const elapsed = Date.now() - start.time;
    const isPageSwipe = zoom <= 1.01 && Math.abs(dx) > 62 && Math.abs(dx) > Math.abs(dy) * 1.35 && elapsed < 800;
    if (!isPageSwipe) return;

    if (dx < 0) onSwipeNext();
    else onSwipePrev();
  }

  return (
    <div
      ref={frameRef}
      className={`image-page-frame ${zoom > 1.01 ? 'is-zoomed' : ''}`}
      {...imageScrollGestureGuards}
      onTouchStart={onImageTouchStart}
      onTouchMove={onImageTouchMove}
      onTouchEnd={onImageTouchEnd}
      onTouchCancel={(event) => {
        event.stopPropagation();
        pinchRef.current = null;
        touchRef.current = null;
      }}
      style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
    >
      <img
        src={src}
        alt={`${title} page ${pageNumber}`}
        draggable={false}
        style={{
          width: `${zoom * 100}%`,
          maxWidth: 'none',
          height: 'auto',
          display: 'block',
          margin: zoom > 1.01 ? 0 : '0 auto',
        }}
      />
    </div>
  );
}

function PdfPageCanvas({
  pdfDoc,
  pageNumber,
  targetWidth,
}: {
  pdfDoc: PdfDocument;
  pageNumber: number;
  targetWidth: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pageHeight, setPageHeight] = useState(Math.round(targetWidth * 1.414));
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let renderTask: PdfRenderTask | null = null;

    async function renderPage() {
      try {
        setRendering(true);
        const page = await pdfDoc.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        const cssScale = targetWidth / baseViewport.width;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale: cssScale * dpr });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${targetWidth}px`;
        canvas.style.height = `${Math.round(baseViewport.height * cssScale)}px`;
        setPageHeight(Math.round(baseViewport.height * cssScale));

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#fffaf0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        renderTask = page.render({ canvasContext: ctx, viewport });
        await renderTask.promise;
      } catch {
        // Fast flips can cancel renders.
      } finally {
        if (!cancelled) setRendering(false);
      }
    }

    renderPage();
    return () => {
      cancelled = true;
      renderTask?.cancel?.();
    };
  }, [pdfDoc, pageNumber, targetWidth]);

  return (
    <div style={{ width: targetWidth, height: pageHeight, position: 'relative', background: '#f8f1df' }}>
      {rendering && (
        <div className="pdf-page-loading">
          <span>Page {pageNumber}</span>
        </div>
      )}
      <canvas ref={canvasRef} aria-label={`Page ${pageNumber}`} />
    </div>
  );
}

function PagePlaceholder({ pageNumber, title, palette }: { pageNumber: number; title: string; palette: ReaderPalette }) {
  return (
    <div className="pdf-page-placeholder">
      <span>
        <span style={{ display: 'block', color: palette.gold, fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          {title}
        </span>
        <span style={{ fontSize: '2.8rem' }}>{pageNumber}</span>
      </span>
    </div>
  );
}

function buildManuscriptPages(manuscript: BookManuscript): ReaderPage[] {
  const pages: ReaderPage[] = [{
    id: `${manuscript.id}-cover`,
    kind: 'cover',
    blocks: [],
  }];

  const maxChars = manuscript.language === 'hi' ? 1650 : 1900;
  const maxBlocks = manuscript.language === 'hi' ? 12 : 13;
  let current: ManuscriptBlock[] = [];
  let currentChars = 0;
  let part = 1;

  const flush = () => {
    if (!current.length) return;
    pages.push({
      id: `${manuscript.id}-part-${part}`,
      kind: 'content',
      blocks: current,
    });
    current = [];
    currentChars = 0;
    part += 1;
  };

  for (const section of manuscript.sections) {
    const sectionBlocks: ManuscriptBlock[] = [
      { type: 'heading', text: section.title, level: 2 },
      ...(section.subtitle ? [{ type: 'paragraph' as const, text: section.subtitle }] : []),
      ...normalizeBlocks(section.blocks, manuscript.language),
    ];

    for (const block of sectionBlocks) {
      const weight = block.type === 'heading' ? block.text.length + 210 : block.text.length;
      const headingNeedsFreshPage = block.type === 'heading' && currentChars > maxChars * 0.72;
      const wouldOverflow = current.length > 0 && (currentChars + weight > maxChars || current.length >= maxBlocks || headingNeedsFreshPage);

      if (wouldOverflow) flush();
      current.push(block);
      currentChars += weight;
    }
  }

  flush();
  return pages;
}

function normalizeBlocks(blocks: ManuscriptBlock[], language: 'hi' | 'en') {
  const maxParagraphChars = language === 'hi' ? 780 : 900;
  return blocks.flatMap((block) => {
    if (block.type !== 'paragraph' || block.text.length <= maxParagraphChars) return [block];
    return splitText(block.text, maxParagraphChars).map((text) => ({ ...block, text }));
  });
}

function splitText(text: string, maxChars: number) {
  const sentences = text
    .split(/(?<=[।.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (!sentences.length) return [text];

  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if (current && `${current} ${sentence}`.length > maxChars) {
      chunks.push(current);
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

function getGridLabel(page: ReaderPage) {
  if (page.kind === 'cover') return 'Cover';
  if (page.kind === 'section') return [page.sectionTitle, page.sectionSubtitle].filter(Boolean).join(' — ');
  return page.blocks.map((block) => block.text).join(' ').slice(0, 220);
}

function clampPage(page: number, total: number) {
  if (!total) return 1;
  if (!Number.isFinite(page)) return 1;
  return Math.min(Math.max(1, Math.round(page)), total);
}

function nextTheme(theme: ReaderTheme): ReaderTheme {
  if (theme === 'dark') return 'light';
  if (theme === 'light') return 'sepia';
  return 'dark';
}

function readerButton(palette: ReaderPalette): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 34,
    padding: '0.38rem 0.7rem',
    borderRadius: 7,
    border: `1px solid ${palette.border}`,
    background: 'rgba(255,255,255,0.04)',
    color: palette.ink,
    cursor: 'pointer',
    fontFamily: 'var(--font-inter)',
    fontSize: '0.75rem',
    fontWeight: 700,
  };
}

function readerNavButton(palette: ReaderPalette, disabled: boolean): CSSProperties {
  return {
    ...readerButton(palette),
    minHeight: 42,
    padding: '0.58rem 1.1rem',
    opacity: disabled ? 0.38 : 1,
    cursor: disabled ? 'default' : 'pointer',
  };
}
