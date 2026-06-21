'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import CourseBanner from '@/components/CourseBanner';

interface EbookReaderProps {
  pdfUrl: string;
  title: string;
  author: string;
  onClose: () => void;
  downloadUrl: string;
}

// ─────────────────────────────────────────────────────────
//  Realistic paper-flip sound using Web Audio API
// ─────────────────────────────────────────────────────────
function playRealFlipSound(ctx: AudioContext) {
  const t = ctx.currentTime;
  const sr = ctx.sampleRate;

  // 1. Whoosh sweep
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(900, t);
  osc.frequency.exponentialRampToValueAtTime(180, t + 0.22);
  oscGain.gain.setValueAtTime(0, t);
  oscGain.gain.linearRampToValueAtTime(0.025, t + 0.03);
  oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  const bpf = ctx.createBiquadFilter();
  bpf.type = 'bandpass';
  bpf.frequency.value = 500;
  bpf.Q.value = 1.2;
  osc.connect(bpf); bpf.connect(oscGain); oscGain.connect(ctx.destination);
  osc.start(t); osc.stop(t + 0.25);

  // 2. Paper rustle noise (two bursts: lift + land)
  [0, 0.18].forEach((delay, idx) => {
    const bufSize = Math.floor(sr * (idx === 0 ? 0.12 : 0.07));
    const buf = ctx.createBuffer(1, bufSize, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      const env = idx === 0
        ? Math.pow(1 - i / bufSize, 1.5)
        : Math.pow(i / bufSize < 0.3 ? i / bufSize / 0.3 : 1 - (i / bufSize - 0.3) / 0.7, 1.2);
      d[i] = (Math.random() * 2 - 1) * env;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = idx === 0 ? 2200 : 1800;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = idx === 0 ? 7000 : 5500;

    const gn = ctx.createGain();
    gn.gain.setValueAtTime(idx === 0 ? 0.55 : 0.42, t + delay);

    src.connect(hp); hp.connect(lp); lp.connect(gn); gn.connect(ctx.destination);
    src.start(t + delay);
  });

  // 3. Soft landing thud
  const thudBuf = ctx.createBuffer(1, Math.floor(sr * 0.06), sr);
  const td = thudBuf.getChannelData(0);
  for (let i = 0; i < td.length; i++) {
    td[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / td.length, 3);
  }
  const thudSrc = ctx.createBufferSource();
  thudSrc.buffer = thudBuf;
  const thudLp = ctx.createBiquadFilter();
  thudLp.type = 'lowpass';
  thudLp.frequency.value = 400;
  const thudGn = ctx.createGain();
  thudGn.gain.setValueAtTime(0.3, t + 0.24);
  thudSrc.connect(thudLp); thudLp.connect(thudGn); thudGn.connect(ctx.destination);
  thudSrc.start(t + 0.24);
}

// ─────────────────────────────────────────────────────────
//  Single canvas page renderer
// ─────────────────────────────────────────────────────────
function PageCanvas({
  pdfDoc, pageNum, scale, style,
}: {
  pdfDoc: any; pageNum: number; scale: number; style?: React.CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTask = useRef<any>(null);

  useEffect(() => {
    if (!pdfDoc || pageNum < 1) return;
    let cancelled = false;

    async function render() {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        if (renderTask.current) renderTask.current.cancel();
        renderTask.current = page.render({ canvasContext: ctx, viewport });
        await renderTask.current.promise;
      } catch (e) { /* cancelled */ }
    }
    render();
    return () => { cancelled = true; };
  }, [pdfDoc, pageNum, scale]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        maxWidth: '100%',
        height: 'auto',
        ...style,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────
//  Main Reader Component
// ─────────────────────────────────────────────────────────
export default function EbookReader({ pdfUrl, title, author, onClose, downloadUrl }: EbookReaderProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scale, setScale] = useState(1.4);
  const [darkMode, setDarkMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [flipState, setFlipState] = useState<'idle' | 'flipping-next' | 'flipping-prev'>('idle');
  const [pageInput, setPageInput] = useState('1');

  // Responsive: is desktop (show double page)
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Load PDF
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfjsLib = await import('pdfjs-dist') as any;
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        const doc = await pdfjsLib.getDocument({ url: pdfUrl }).promise;
        if (!cancelled) { setPdfDoc(doc); setTotalPages(doc.numPages); setLoading(false); }
      } catch { if (!cancelled) { setError('PDF load failed.'); setLoading(false); } }
    }
    load();
    return () => { cancelled = true; };
  }, [pdfUrl]);

  // Sync page input
  useEffect(() => { setPageInput(String(currentPage)); }, [currentPage]);

  function getAudioCtx() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  }

  const goNext = useCallback(() => {
    if (flipState !== 'idle') return;
    const step = isDesktop ? 2 : 1;
    if (currentPage + (isDesktop ? 1 : 0) >= totalPages) return;
    playRealFlipSound(getAudioCtx());
    setFlipState('flipping-next');
    setTimeout(() => {
      setCurrentPage((p) => Math.min(p + step, totalPages));
      setFlipState('idle');
    }, 420);
  }, [flipState, currentPage, totalPages, isDesktop]);

  const goPrev = useCallback(() => {
    if (flipState !== 'idle') return;
    const step = isDesktop ? 2 : 1;
    if (currentPage <= 1) return;
    playRealFlipSound(getAudioCtx());
    setFlipState('flipping-prev');
    setTimeout(() => {
      setCurrentPage((p) => Math.max(p - step, 1));
      setFlipState('idle');
    }, 420);
  }, [flipState, currentPage, isDesktop]);

  // Keyboard
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [goNext, goPrev, onClose]);

  // Touch swipe
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 45) {
      if (dx < 0) goNext(); else goPrev();
    }
  }

  // Pages to show
  const leftPage = currentPage;
  const rightPage = isDesktop ? currentPage + 1 : null;

  // Flip animation CSS
  const flipStyle = (side: 'left' | 'right'): React.CSSProperties => {
    const baseTransform = 'perspective(2000px)';
    if (flipState === 'idle') return { transform: baseTransform + ' rotateY(0deg)', transition: 'transform 0.42s cubic-bezier(0.4,0,0.2,1)' };
    if (flipState === 'flipping-next') {
      return side === 'right'
        ? { transform: baseTransform + ' rotateY(-15deg) scale(0.97)', transition: 'transform 0.42s cubic-bezier(0.4,0,0.2,1)', transformOrigin: 'left center' }
        : { transform: baseTransform + ' rotateY(0deg)', transition: 'none' };
    }
    if (flipState === 'flipping-prev') {
      return side === 'left'
        ? { transform: baseTransform + ' rotateY(15deg) scale(0.97)', transition: 'transform 0.42s cubic-bezier(0.4,0,0.2,1)', transformOrigin: 'right center' }
        : { transform: baseTransform + ' rotateY(0deg)', transition: 'none' };
    }
    return {};
  };

  const bg = darkMode ? '#0b1410' : '#f0e6d3';
  const panelBg = darkMode ? 'rgba(7,12,9,0.96)' : 'rgba(240,230,211,0.97)';
  const textC = darkMode ? '#e8d9bb' : '#1a0a00';
  const pageShadow = darkMode
    ? '0 32px 80px rgba(0,0,0,0.75), 0 8px 24px rgba(0,0,0,0.5)'
    : '0 32px 80px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.18)';

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9000, background: bg, display: 'flex', flexDirection: 'column', transition: 'background 0.3s' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClick={() => setShowControls((s) => !s)}
    >
      {/* ── Top Bar ── */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: panelBg, backdropFilter: 'blur(20px) saturate(1.5)',
          borderBottom: '1px solid rgba(212,168,67,0.15)',
          padding: '0.6rem 1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
          transition: 'opacity 0.35s, transform 0.35s',
          opacity: showControls ? 1 : 0, pointerEvents: showControls ? 'auto' : 'none',
          transform: showControls ? 'translateY(0)' : 'translateY(-100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
          <button onClick={onClose} style={topBtn(textC)}>
            ← <span style={{ fontSize: '0.7rem' }}>Library</span>
          </button>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: textC, fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '0.9rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>{title}</p>
            <p style={{ color: '#d4a843', fontSize: '0.6rem', margin: 0, opacity: 0.65 }}>— {author}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          <button onClick={() => setScale((s) => Math.max(0.7, parseFloat((s - 0.15).toFixed(2))))} style={topBtn(textC)}>−</button>
          <span style={{ color: textC, fontSize: '0.72rem', minWidth: '40px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
            {Math.round(scale * 100)}%
          </span>
          <button onClick={() => setScale((s) => Math.min(3.0, parseFloat((s + 0.15).toFixed(2))))} style={topBtn(textC)}>+</button>

          <button
            onClick={() => setDarkMode((d) => !d)}
            style={{ ...topBtn(textC), marginLeft: '0.25rem', fontSize: '1rem', padding: '0.25rem 0.5rem' }}
          >
            {darkMode ? '☀' : '🌙'}
          </button>

          <a
            href={downloadUrl} download
            onClick={(e) => e.stopPropagation()}
            style={{
              ...topBtn('#d4a843'),
              background: 'rgba(212,168,67,0.1)',
              border: '1px solid rgba(212,168,67,0.3)',
              textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              marginLeft: '0.25rem',
            }}
          >
            ↓ PDF
          </a>
        </div>
      </div>

      {/* ── Book Stage ── */}
      <div
        style={{
          flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          paddingTop: '5rem',
          paddingBottom: '5rem',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              border: '2px solid rgba(212,168,67,0.15)',
              borderTop: '2px solid #d4a843',
              animation: 'rdSpin 1s linear infinite',
            }} />
            <p style={{ color: '#d4a843', fontSize: '0.72rem', letterSpacing: '0.18em', opacity: 0.6 }}>Opening book…</p>
            <style>{`@keyframes rdSpin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#d4a843', fontSize: '1.5rem', marginBottom: '1rem' }}>⚠</p>
            <p style={{ color: textC, opacity: 0.6, fontSize: '0.88rem', marginBottom: '1.5rem' }}>{error}</p>
            <a href={downloadUrl} download style={{
              padding: '0.7rem 1.5rem', border: '1px solid rgba(212,168,67,0.35)',
              borderRadius: '8px', color: '#d4a843', textDecoration: 'none', fontSize: '0.85rem',
            }}>
              ↓ Download PDF Instead
            </a>
          </div>
        )}

        {!loading && !error && (
          <div style={{ display: 'flex', alignItems: 'stretch', position: 'relative' }}>
            {/* Book shadow */}
            <div style={{
              position: 'absolute', bottom: '-28px', left: '50%',
              transform: 'translateX(-50%)',
              width: '75%', height: '36px',
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.5), transparent)',
              filter: 'blur(14px)',
            }} />

            {/* Left page */}
            <div
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              style={{
                ...flipStyle('left'),
                transformStyle: 'preserve-3d',
                borderRadius: '2px 0 0 2px',
                overflow: 'hidden',
                boxShadow: isDesktop ? `inset -4px 0 12px rgba(0,0,0,0.3), ${pageShadow}` : pageShadow,
                cursor: currentPage > 1 ? 'w-resize' : 'default',
                userSelect: 'none',
              }}
            >
              <PageCanvas pdfDoc={pdfDoc} pageNum={leftPage} scale={scale} />
              {/* Spine gradient */}
              {isDesktop && (
                <div style={{
                  position: 'absolute', top: 0, right: 0, bottom: 0, width: '16px',
                  background: 'linear-gradient(to left, rgba(0,0,0,0.25), transparent)',
                  pointerEvents: 'none',
                }} />
              )}
              {/* Left page hover hint */}
              {!isDesktop && currentPage > 1 && (
                <div style={{
                  position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(0,0,0,0.3)', borderRadius: '50%',
                  width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(212,168,67,0.6)', fontSize: '1.2rem', pointerEvents: 'none',
                  opacity: showControls ? 1 : 0, transition: 'opacity 0.3s',
                }}>‹</div>
              )}
            </div>

            {/* Center spine */}
            {isDesktop && (
              <div style={{
                width: '3px',
                background: 'linear-gradient(to bottom, rgba(212,168,67,0.12), rgba(212,168,67,0.35), rgba(212,168,67,0.12))',
                boxShadow: '0 0 12px rgba(0,0,0,0.5)',
                flexShrink: 0,
                zIndex: 10,
              }} />
            )}

            {/* Right page (desktop only) */}
            {isDesktop && rightPage && rightPage <= totalPages && (
              <div
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                style={{
                  ...flipStyle('right'),
                  transformStyle: 'preserve-3d',
                  borderRadius: '0 2px 2px 0',
                  overflow: 'hidden',
                  boxShadow: `inset 4px 0 12px rgba(0,0,0,0.25), ${pageShadow}`,
                  cursor: rightPage < totalPages ? 'e-resize' : 'default',
                  userSelect: 'none',
                }}
              >
                <PageCanvas pdfDoc={pdfDoc} pageNum={rightPage} scale={scale} />
                {/* Right page hint */}
                {rightPage < totalPages && (
                  <div style={{
                    position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.3)', borderRadius: '50%',
                    width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(212,168,67,0.6)', fontSize: '1.2rem', pointerEvents: 'none',
                    opacity: showControls ? 1 : 0, transition: 'opacity 0.3s',
                  }}>›</div>
                )}
              </div>
            )}

            {/* Mobile next area */}
            {!isDesktop && (
              <div
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                style={{
                  position: 'absolute', right: '-20px', top: 0, bottom: 0, width: '40px',
                  cursor: currentPage < totalPages ? 'e-resize' : 'default',
                }}
              />
            )}
          </div>
        )}

        {/* Course invitation — shown when reader reaches last page */}
        {!loading && !error && totalPages > 0 && currentPage >= totalPages && (
          <div style={{ width: '100%', maxWidth: '760px', padding: '0 1rem 5rem' }}>
            <CourseBanner lang="hi" variant="strip" />
          </div>
        )}
      </div>

      {/* ── Bottom Nav ── */}
      <div
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
          background: panelBg, backdropFilter: 'blur(20px) saturate(1.5)',
          borderTop: '1px solid rgba(212,168,67,0.12)',
          padding: '0.6rem 1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
          transition: 'opacity 0.35s, transform 0.35s',
          opacity: showControls ? 1 : 0, pointerEvents: showControls ? 'auto' : 'none',
          transform: showControls ? 'translateY(0)' : 'translateY(100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={goPrev}
          disabled={currentPage <= 1 || flipState !== 'idle'}
          style={{ ...navBtn(textC), opacity: currentPage <= 1 ? 0.25 : 1 }}
        >
          ‹ Prev
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <input
            type="number" min={1} max={totalPages}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onBlur={() => {
              const n = parseInt(pageInput);
              if (!isNaN(n) && n >= 1 && n <= totalPages) setCurrentPage(n);
              else setPageInput(String(currentPage));
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            style={{
              width: '48px', textAlign: 'center', background: 'rgba(212,168,67,0.08)',
              border: '1px solid rgba(212,168,67,0.2)', borderRadius: '6px',
              padding: '0.3rem', color: textC, fontSize: '0.82rem', fontVariantNumeric: 'tabular-nums',
            }}
          />
          <span style={{ color: textC, opacity: 0.35, fontSize: '0.78rem' }}>/ {totalPages}</span>
        </div>

        {/* Progress bar */}
        <div style={{ flex: 1, maxWidth: '180px', height: '3px', background: 'rgba(212,168,67,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '2px',
            background: 'linear-gradient(90deg, #c8983a, #d4a843)',
            width: `${(currentPage / Math.max(totalPages, 1)) * 100}%`,
            transition: 'width 0.4s ease',
          }} />
        </div>

        <button
          onClick={goNext}
          disabled={currentPage + (isDesktop ? 1 : 0) >= totalPages || flipState !== 'idle'}
          style={{ ...navBtn(textC), opacity: currentPage + (isDesktop ? 1 : 0) >= totalPages ? 0.25 : 1 }}
        >
          Next ›
        </button>
      </div>

      {/* Swipe hint (mobile, auto-hide) */}
      {!isDesktop && !loading && (
        <div style={{
          position: 'fixed', bottom: '3.5rem', left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(212,168,67,0.3)', fontSize: '0.62rem', letterSpacing: '0.15em',
          pointerEvents: 'none', transition: 'opacity 0.5s',
          opacity: showControls ? 1 : 0,
        }}>
          ← swipe →
        </div>
      )}
    </div>
  );
}

function topBtn(color: string): React.CSSProperties {
  return {
    background: 'none',
    border: '1px solid rgba(212,168,67,0.18)',
    borderRadius: '7px',
    padding: '0.28rem 0.65rem',
    color, fontSize: '0.78rem',
    cursor: 'pointer', fontWeight: 600,
    letterSpacing: '0.02em', whiteSpace: 'nowrap',
  };
}

function navBtn(color: string): React.CSSProperties {
  return {
    background: 'rgba(212,168,67,0.07)',
    border: '1px solid rgba(212,168,67,0.22)',
    borderRadius: '8px', padding: '0.5rem 1.1rem',
    color, fontSize: '0.82rem', cursor: 'pointer',
    fontWeight: 700, letterSpacing: '0.04em', transition: 'all 0.2s',
  };
}
