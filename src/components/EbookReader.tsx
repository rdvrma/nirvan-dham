'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';

interface EbookReaderProps {
  pdfUrl: string;
  title: string;
  author: string;
  onClose: () => void;
  downloadUrl: string;
}

// ── Web Audio page-flip sound synthesizer ─────────────────
function playPageFlipSound(ctx: AudioContext) {
  const now = ctx.currentTime;
  // White noise burst — paper rustle
  const bufferSize = ctx.sampleRate * 0.08;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2.5);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;

  // Bandpass filter — paper-like freq
  const bpf = ctx.createBiquadFilter();
  bpf.type = 'bandpass';
  bpf.frequency.value = 3200;
  bpf.Q.value = 0.8;

  // Gain envelope
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.55, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  src.connect(bpf);
  bpf.connect(gainNode);
  gainNode.connect(ctx.destination);
  src.start(now);
}

export default function EbookReader({ pdfUrl, title, author, onClose, downloadUrl }: EbookReaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasPrevRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState<'next' | 'prev'>('next');
  const [darkMode, setDarkMode] = useState(true);
  const [scale, setScale] = useState(1.4);
  const [showControls, setShowControls] = useState(true);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Init AudioContext lazily
  function getAudioCtx() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }

  // Load PDF
  useEffect(() => {
    let cancelled = false;
    async function loadPdf() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfjsLib = await import('pdfjs-dist') as any;
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        const doc = await pdfjsLib.getDocument({ url: pdfUrl }).promise;
        if (!cancelled) {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError('Could not load PDF. Please try downloading.');
          setLoading(false);
        }
      }
    }
    loadPdf();
    return () => { cancelled = true; };
  }, [pdfUrl]);

  // Render a page to a canvas ref
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderPage = useCallback(async (doc: any, pageNum: number, ref: React.RefObject<HTMLCanvasElement | null>, s: number) => {
    if (!doc || !ref.current) return;
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: s });
    const canvas = ref.current;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    await page.render({ canvasContext: ctx, viewport }).promise;
  }, []);

  // Render current page
  useEffect(() => {
    if (pdfDoc && canvasRef.current) {
      renderPage(pdfDoc, currentPage, canvasRef, scale);
    }
  }, [pdfDoc, currentPage, scale, renderPage]);

  // Keyboard nav
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  async function goNext() {
    if (isFlipping || currentPage >= totalPages) return;
    setFlipDir('next');
    // Render next page to preview canvas before animation
    if (pdfDoc && canvasPrevRef.current) {
      await renderPage(pdfDoc, Math.min(currentPage + 1, totalPages), canvasPrevRef, scale);
    }
    playPageFlipSound(getAudioCtx());
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage((p) => Math.min(p + 1, totalPages));
      setIsFlipping(false);
    }, 380);
  }

  async function goPrev() {
    if (isFlipping || currentPage <= 1) return;
    setFlipDir('prev');
    if (pdfDoc && canvasPrevRef.current) {
      await renderPage(pdfDoc, Math.max(currentPage - 1, 1), canvasPrevRef, scale);
    }
    playPageFlipSound(getAudioCtx());
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage((p) => Math.max(p - 1, 1));
      setIsFlipping(false);
    }, 380);
  }

  const bgColor = darkMode ? '#0e1410' : '#f5ede0';
  const textColor = darkMode ? '#e8d9bb' : '#1a0f00';
  const panelBg = darkMode ? 'rgba(8,12,9,0.95)' : 'rgba(245,237,220,0.97)';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: bgColor,
        display: 'flex', flexDirection: 'column',
        transition: 'background 0.3s',
        userSelect: 'none',
      }}
      onClick={() => setShowControls((p) => !p)}
    >
      {/* ── Top Bar ── */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          zIndex: 20,
          background: panelBg,
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid rgba(212,168,67,0.12)`,
          padding: '0.75rem 1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'opacity 0.3s, transform 0.3s',
          opacity: showControls ? 1 : 0,
          transform: showControls ? 'translateY(0)' : 'translateY(-100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: `1px solid rgba(212,168,67,0.3)`,
              borderRadius: '6px', padding: '0.35rem 0.75rem',
              color: '#d4a843', fontSize: '0.8rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.35rem',
            }}
          >
            ← Library
          </button>
          <div>
            <p style={{ color: textColor, fontSize: '0.8rem', fontWeight: 600, margin: 0, fontFamily: 'var(--font-cormorant)', fontStyle: 'italic' }}>
              {title}
            </p>
            <p style={{ color: '#d4a843', fontSize: '0.62rem', opacity: 0.7, margin: 0, letterSpacing: '0.1em' }}>
              {author}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Zoom */}
          <button onClick={() => setScale((s) => Math.max(0.8, s - 0.2))}
            style={ctrlBtn(textColor)}>−</button>
          <span style={{ color: textColor, fontSize: '0.72rem', minWidth: '36px', textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </span>
          <button onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
            style={ctrlBtn(textColor)}>+</button>

          {/* Dark/Light toggle */}
          <button
            onClick={() => setDarkMode((d) => !d)}
            style={{ ...ctrlBtn(textColor), padding: '0.35rem 0.65rem', marginLeft: '0.25rem' }}
          >
            {darkMode ? '☀' : '🌙'}
          </button>

          {/* Download */}
          <a
            href={downloadUrl}
            download
            onClick={(e) => e.stopPropagation()}
            style={{
              ...ctrlBtn('#d4a843'),
              background: 'rgba(212,168,67,0.12)',
              border: '1px solid rgba(212,168,67,0.35)',
              textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.35rem 0.85rem',
              marginLeft: '0.25rem',
            }}
          >
            ↓ Download
          </a>
        </div>
      </div>

      {/* ── Page Canvas area ── */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          padding: '5rem 1rem 4rem',
          position: 'relative',
        }}
      >
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              border: '2px solid rgba(212,168,67,0.2)',
              borderTopColor: '#d4a843',
              animation: 'readerSpin 1s linear infinite',
            }} />
            <p style={{ color: '#d4a843', fontSize: '0.78rem', opacity: 0.6, letterSpacing: '0.12em' }}>
              Loading…
            </p>
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', color: '#d4a843', padding: '2rem' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>⚠</p>
            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>{error}</p>
            <a href={downloadUrl} download style={{
              display: 'inline-block', marginTop: '1rem',
              padding: '0.7rem 1.5rem', border: '1px solid rgba(212,168,67,0.4)',
              borderRadius: '6px', color: '#d4a843', textDecoration: 'none', fontSize: '0.85rem',
            }}>
              Download PDF Instead
            </a>
          </div>
        )}

        {!loading && !error && (
          <div style={{
            position: 'relative',
            perspective: '1400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Shadow under book */}
            <div style={{
              position: 'absolute', bottom: '-24px', left: '50%',
              transform: 'translateX(-50%)',
              width: '80%', height: '32px',
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.45), transparent)',
              filter: 'blur(12px)',
            }} />

            {/* Current page — the page being flipped away */}
            <div style={{
              position: 'relative',
              transformStyle: 'preserve-3d',
              transform: isFlipping
                ? flipDir === 'next'
                  ? 'rotateY(-25deg) scale(0.97)'
                  : 'rotateY(25deg) scale(0.97)'
                : 'rotateY(0deg) scale(1)',
              transition: isFlipping ? 'transform 0.38s cubic-bezier(0.4,0,0.2,1)' : 'transform 0.28s ease',
              boxShadow: darkMode
                ? '0 24px 80px rgba(0,0,0,0.7), 4px 0 20px rgba(0,0,0,0.4)'
                : '0 24px 80px rgba(0,0,0,0.3), 4px 0 20px rgba(0,0,0,0.15)',
              borderRadius: '2px 8px 8px 2px',
              overflow: 'hidden',
            }}>
              <canvas
                ref={canvasRef}
                style={{
                  display: 'block',
                  maxWidth: isMobile ? 'calc(100vw - 2rem)' : 'calc(100vw - 8rem)',
                  maxHeight: 'calc(100vh - 10rem)',
                  objectFit: 'contain',
                  filter: darkMode ? 'brightness(0.95)' : 'none',
                }}
              />
              {/* Page spine shadow */}
              <div style={{
                position: 'absolute', top: 0, left: 0, bottom: 0, width: '12px',
                background: 'linear-gradient(to right, rgba(0,0,0,0.35), transparent)',
                pointerEvents: 'none',
              }} />
            </div>

            {/* Hidden canvas for pre-rendering next/prev page */}
            <canvas ref={canvasPrevRef} style={{ display: 'none' }} />
          </div>
        )}
      </div>

      {/* ── Bottom Nav ── */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          zIndex: 20,
          background: panelBg,
          backdropFilter: 'blur(16px)',
          borderTop: `1px solid rgba(212,168,67,0.12)`,
          padding: '0.75rem 1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '1rem',
          transition: 'opacity 0.3s, transform 0.3s',
          opacity: showControls ? 1 : 0,
          transform: showControls ? 'translateY(0)' : 'translateY(100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={goPrev}
          disabled={currentPage <= 1 || isFlipping}
          style={{
            ...navBtn(textColor),
            opacity: currentPage <= 1 ? 0.3 : 1,
          }}
        >
          ‹ Prev
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const n = parseInt(e.target.value);
              if (n >= 1 && n <= totalPages) setCurrentPage(n);
            }}
            style={{
              width: '52px', textAlign: 'center',
              background: 'rgba(212,168,67,0.08)',
              border: '1px solid rgba(212,168,67,0.25)',
              borderRadius: '6px', padding: '0.3rem',
              color: textColor, fontSize: '0.85rem',
            }}
          />
          <span style={{ color: textColor, opacity: 0.45, fontSize: '0.8rem' }}>/ {totalPages}</span>
        </div>

        {/* Progress bar */}
        <div style={{
          flex: 1, maxWidth: '200px', height: '3px',
          background: 'rgba(212,168,67,0.15)', borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: '2px',
            background: 'linear-gradient(90deg, #d4a843, #c8983a)',
            width: `${(currentPage / totalPages) * 100}%`,
            transition: 'width 0.3s ease',
          }} />
        </div>

        <button
          onClick={goNext}
          disabled={currentPage >= totalPages || isFlipping}
          style={{
            ...navBtn(textColor),
            opacity: currentPage >= totalPages ? 0.3 : 1,
          }}
        >
          Next ›
        </button>
      </div>

      {/* Swipe hint — mobile only */}
      {isMobile && !loading && showControls && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none', opacity: 0.18,
          fontSize: '0.7rem', color: textColor, letterSpacing: '0.12em',
        }}>
          ← swipe →
        </div>
      )}

      <style>{`
        @keyframes readerSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function ctrlBtn(color: string): React.CSSProperties {
  return {
    background: 'none',
    border: `1px solid rgba(212,168,67,0.2)`,
    borderRadius: '6px',
    padding: '0.35rem 0.6rem',
    color,
    fontSize: '0.8rem',
    cursor: 'pointer',
  };
}

function navBtn(color: string): React.CSSProperties {
  return {
    background: 'rgba(212,168,67,0.08)',
    border: '1px solid rgba(212,168,67,0.25)',
    borderRadius: '8px',
    padding: '0.5rem 1.25rem',
    color,
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontWeight: 600,
    letterSpacing: '0.04em',
    transition: 'all 0.2s',
  };
}
