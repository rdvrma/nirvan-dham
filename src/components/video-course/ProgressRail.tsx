'use client';

import { memo } from 'react';
import type { Segment } from '@/lib/video-course/manifest';
import type { PlayerCopy } from './copy';
import { formatClock } from '@/lib/video-course/logic';

const GOLD = '#d4a843';

/** The progress rail: one button per segment. Locked segments are disabled (and say so); an unlocked segment seeks to its start. No scores, no percentages of "mastery". */
function ProgressRailBase({ segments, unlocked, completedSegments, currentIndex, time, onSeek, copy }: {
  segments: Segment[];
  unlocked: boolean[];
  completedSegments: boolean[];
  currentIndex: number;
  time: number;
  onSeek: (index: number) => void;
  copy: PlayerCopy;
}) {
  return (
    <nav aria-label={copy.segments} style={{ marginTop: '1rem' }}>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: `repeat(${segments.length}, minmax(0, 1fr))`, gap: '0.35rem' }}>
        {segments.map((s, i) => {
          const done = completedSegments[i];
          const isCurrent = i === currentIndex;
          const open = unlocked[i];
          const span = Math.max(1, s.endSec - s.startSec);
          const fill = done ? 1 : isCurrent ? Math.max(0, Math.min(1, (time - s.startSec) / span)) : 0;
          const state = done ? copy.done : !open ? copy.locked : isCurrent ? copy.current : '';
          return (
            <li key={s.id} style={{ minWidth: 0 }}>
              <button
                type="button"
                disabled={!open}
                onClick={() => onSeek(i)}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`${i + 1}. ${s.label ?? s.id}${state ? ` — ${state}` : ''} (${formatClock(s.startSec)})`}
                data-testid={`rail-seg-${i}`}
                data-state={done ? 'done' : !open ? 'locked' : isCurrent ? 'current' : 'open'}
                style={{
                  width: '100%', padding: '0.55rem 0.25rem 0.5rem', background: 'transparent', border: 0, cursor: open ? 'pointer' : 'not-allowed',
                  color: open ? 'rgba(245,237,216,0.85)' : 'rgba(245,237,216,0.32)', fontFamily: 'var(--font-inter), system-ui, sans-serif', fontSize: '0.68rem', textAlign: 'left',
                }}
              >
                <span aria-hidden style={{ display: 'block', height: '3px', borderRadius: '2px', background: 'rgba(212,168,67,0.16)', overflow: 'hidden', marginBottom: '0.45rem' }}>
                  <span style={{ display: 'block', height: '100%', width: `${fill * 100}%`, background: `linear-gradient(90deg, ${GOLD}, #ffe89a)` }} />
                </span>
                <span aria-hidden style={{ color: isCurrent ? GOLD : undefined, fontWeight: isCurrent ? 700 : 500, letterSpacing: '0.04em' }}>
                  {done ? '✓ ' : !open ? '🔒 ' : ''}{i + 1}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export const ProgressRail = memo(ProgressRailBase);
