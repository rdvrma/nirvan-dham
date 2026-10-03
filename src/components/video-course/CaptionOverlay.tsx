'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { activeCaption, captionWindow, type CaptionCue } from '@/lib/video-course/logic';
import type { TrackLanguage } from '@/lib/video-course/config';

export type CaptionMode = 'word' | 'sentence';

/**
 * Captions drawn by the page from the word-timing file (never mid-frame): bottom-centre, a fixed baseline, 1-2 lines, a subtle scrim, the spoken word highlighted
 * (or the whole sentence when the clock is too jittery to follow words). `pointer-events: none`: it never takes a click from the player.
 * `clearOfControls` lifts the baseline above a control bar that the player draws itself (YouTube): max(8 % of the height, 52 px), so no player UI is ever covered.
 */
function CaptionOverlayBase({ cues, time, lang, mode, clearOfControls }: { cues: CaptionCue[] | null; time: number; lang: TrackLanguage; mode: CaptionMode; clearOfControls: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const active = cues ? activeCaption(cues, time) : null;
  const maxChars = Math.max(40, Math.min(120, Math.floor(width / 4.6)));
  const win = active ? captionWindow(active.cue.words, active.wordIndex, maxChars) : null;
  const font = lang === 'hi' ? 'var(--font-hind), system-ui, sans-serif' : 'var(--font-inter), system-ui, sans-serif';

  return (
    <div
      ref={ref}
      data-testid="caption-overlay"
      aria-live="off"
      style={{
        position: 'absolute', left: 0, right: 0, bottom: clearOfControls ? 'max(8%, 52px)' : '8%', display: 'flex', justifyContent: 'center',
        padding: '0 4%', pointerEvents: 'none', zIndex: 2, minHeight: 0,
      }}
    >
      {active && win && (
        <p
          data-testid="caption-text"
          data-mode={mode}
          lang={lang}
          style={{
            margin: 0, maxWidth: '92%', textAlign: 'center', fontFamily: font, fontWeight: 500, lineHeight: 1.45,
            fontSize: 'clamp(0.92rem, 0.55rem + 1.7vw, 1.4rem)', color: 'rgba(245,237,216,0.96)', background: 'rgba(5,14,7,0.62)',
            padding: '0.28em 0.7em', borderRadius: '6px', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone',
            textShadow: '0 1px 2px rgba(0,0,0,0.6)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}
        >
          {active.cue.words.slice(win.from, win.to).map((w, k) => {
            const i = win.from + k;
            const spoken = mode === 'word' ? i === active.wordIndex : i >= 0 && active.wordIndex >= 0;
            return (
              <span key={i} data-spoken={spoken ? '1' : undefined} style={{ color: spoken ? '#ffe89a' : undefined, transition: 'color 120ms linear' }}>
                {w.text}{' '}
              </span>
            );
          })}
        </p>
      )}
    </div>
  );
}

export const CaptionOverlay = memo(CaptionOverlayBase);
