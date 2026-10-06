// Pure logic of the video player: pause points, the unlock rule, caption cues and timing, the sync-jitter meter.
// No DOM, no React, no network: everything here is unit-tested (src/lib/video-course/__tests__).
import type { Manifest, Prompt, TimedWord } from './manifest';
import type { UnlockMode } from './config';

// ── pause points and the unlock rule ───────────────────────────────────────────────────────────────

export interface PauseStop {
  id: string;
  atSec: number;
  durationSec: number;
  segmentId: string;
  segmentIndex: number;
  kind: string;
  prompts: Prompt[];
}

/** The places where the player stops and asks a question: the manifest's think/reflection pause points, matched to their segment (or the segment's own pause marker when the manifest has no pause points). */
export function buildPauseStops(manifest: Manifest): PauseStop[] {
  const stops: PauseStop[] = [];
  const bySegment = new Map(manifest.segments.map((s, i) => [s.id, { s, i }]));
  for (const p of manifest.pausePoints) {
    if (p.kind !== 'think' && p.kind !== 'reflection') continue; // the opening silence is not a question
    const seg = p.segment ? bySegment.get(p.segment) : undefined;
    if (!seg) continue;
    stops.push({ id: p.id, atSec: p.atSec, durationSec: p.durationSec, segmentId: seg.s.id, segmentIndex: seg.i, kind: p.kind, prompts: seg.s.interaction.prompts });
  }
  if (!stops.length) {
    manifest.segments.forEach((s, i) => {
      if (s.pauseMarker) stops.push({ id: `p-${s.id}`, atSec: s.pauseMarker.atSec, durationSec: s.pauseMarker.durationSec, segmentId: s.id, segmentIndex: i, kind: 'think', prompts: s.interaction.prompts });
    });
  }
  return stops.sort((a, b) => a.atSec - b.atSec);
}

export function firstIncompleteStop(stops: PauseStop[], completed: ReadonlySet<string>): PauseStop | null {
  return stops.find((s) => !completed.has(s.id)) ?? null;
}

/** The furthest time the learner may reach. Sequential: up to the first pause point not yet completed. Open: the whole lesson. */
export function unlockedLimitSec(stops: PauseStop[], completed: ReadonlySet<string>, mode: UnlockMode, durationSec: number): number {
  if (mode === 'open') return durationSec;
  return firstIncompleteStop(stops, completed)?.atSec ?? durationSec;
}

/** Segment `index` is unlocked when every pause point of the segments before it is completed (sequential), or always (open). */
export function isSegmentUnlocked(stops: PauseStop[], index: number, completed: ReadonlySet<string>, mode: UnlockMode): boolean {
  if (mode === 'open' || index === 0) return true;
  return stops.filter((s) => s.segmentIndex < index).every((s) => completed.has(s.id));
}

export function segmentIndexAt(manifest: Manifest, t: number): number {
  const segs = manifest.segments;
  for (let i = segs.length - 1; i >= 0; i--) if (t >= segs[i].startSec - 0.001) return i;
  return 0;
}

export type TickAction = { type: 'none' } | { type: 'pause'; stop: PauseStop } | { type: 'seekBack'; to: number; stop: PauseStop };

/**
 * What to do when the player's clock moved from `prev` to `cur` (read every ~200 ms).
 *  - sequential: playback reaches the first incomplete pause point: pause there (an overshoot of a few hundred ms is harmless, pause points sit in silences of >= 1 s);
 *    the learner jumped past it (a forward jump larger than `seekJumpSec`, or far beyond the point): seek back to the pause point and open it (the seek-back guard);
 *  - open: only ordinary playback crossing a pause point pauses; seeks are free.
 */
export function evaluateTick(args: { prev: number | null; cur: number; stops: PauseStop[]; completed: ReadonlySet<string>; mode: UnlockMode; seekJumpSec: number; overshootSec?: number }): TickAction {
  const { prev, cur, stops, completed, mode, seekJumpSec } = args;
  const overshoot = args.overshootSec ?? 1.0;
  const jumped = prev !== null && cur - prev > seekJumpSec;
  if (mode === 'sequential') {
    const stop = firstIncompleteStop(stops, completed);
    if (!stop) return { type: 'none' };
    if (cur < stop.atSec - 0.001) return { type: 'none' };
    if (jumped || cur - stop.atSec > overshoot) return { type: 'seekBack', to: stop.atSec, stop };
    return { type: 'pause', stop };
  }
  for (const s of stops) {
    if (completed.has(s.id)) continue;
    if (prev !== null && prev < s.atSec - 0.001 && cur >= s.atSec - 0.001 && !jumped) return { type: 'pause', stop: s };
  }
  return { type: 'none' };
}

/** Where a saved position may resume: never beyond the unlocked limit, and never in the last second (that restarts a finished lesson). */
export function clampResume(positionSec: number, limitSec: number, durationSec: number, endToleranceSec = 1): number {
  const p = Math.max(0, Math.min(positionSec, limitSec));
  return p >= durationSec - endToleranceSec ? 0 : p;
}

// ── captions ───────────────────────────────────────────────────────────────────────────────────────

export interface CaptionCue {
  id: string;
  start: number;
  end: number;
  words: TimedWord[];
  text: string;
}

/** Groups the words of a timing file into cues: consecutive words with the same `cue` id (English files split long sentences), else the same sentence. */
export function buildCues(words: TimedWord[]): CaptionCue[] {
  const cues: CaptionCue[] = [];
  let cur: CaptionCue | null = null;
  let key: string | undefined;
  for (const w of words) {
    const k = w.cue ?? w.sentence ?? `w${cues.length}`;
    if (!cur || k !== key) {
      cur = { id: k, start: w.start, end: w.end, words: [], text: '' };
      cues.push(cur);
      key = k;
    }
    cur.words.push(w);
    cur.end = Math.max(cur.end, w.end);
  }
  for (const c of cues) c.text = c.words.map((w) => w.text).join(' ');
  return cues;
}

const TS = /<(\d+):(\d\d):(\d\d\.\d{3})>/g;
const toSec = (h: string, m: string, s: string) => Number(h) * 3600 + Number(m) * 60 + Number(s);

/** WebVTT fallback: cues with optional per-word timestamps (<00:00:02.800>word). Without word tags a cue is one unit (sentence-level highlight). */
export function parseVtt(vtt: string): CaptionCue[] {
  const cues: CaptionCue[] = [];
  for (const block of vtt.replace(/\r/g, '').split(/\n\n+/)) {
    const lines = block.split('\n');
    const ti = lines.findIndex((l) => l.includes('-->'));
    if (ti < 0) continue;
    const m = lines[ti].match(/(\d+):(\d\d):(\d\d\.\d{3})\s*-->\s*(\d+):(\d\d):(\d\d\.\d{3})/);
    if (!m) continue;
    const start = toSec(m[1], m[2], m[3]);
    const end = toSec(m[4], m[5], m[6]);
    // the payload is everything after the timing line, without the cue settings that follow the timestamps on that line
    const payload = lines.slice(ti + 1).join(' ').trim();
    const id = ti > 0 ? lines[0].trim() : `c${cues.length}`;
    const words: TimedWord[] = [];
    const parts = payload.split(TS); // text, h, m, s, text, h, m, s, ...
    const push = (text: string, from: number) => text.split(/\s+/).filter(Boolean).forEach((x) => words.push({ text: x, start: from, end: from }));
    push(parts[0] ?? '', start);
    for (let i = 1; i + 3 < parts.length + 1; i += 4) push(parts[i + 3] ?? '', toSec(parts[i], parts[i + 1], parts[i + 2]));
    words.forEach((w, i) => {
      w.end = i + 1 < words.length ? words[i + 1].start : end;
    });
    cues.push({ id, start, end, words, text: words.map((w) => w.text).join(' ') });
  }
  return cues;
}

export interface ActiveCaption {
  cue: CaptionCue;
  wordIndex: number;
}

/** The cue shown at time t (a little early and a little late so a caption never flickers between sentences) and the index of the word being spoken (-1 before the first word). */
export function activeCaption(cues: CaptionCue[], t: number, opts: { leadSec?: number; holdSec?: number } = {}): ActiveCaption | null {
  const lead = opts.leadSec ?? 0.15;
  const hold = opts.holdSec ?? 0.4;
  let found: CaptionCue | null = null;
  let lo = 0;
  let hi = cues.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (cues[mid].start - lead <= t) {
      found = cues[mid];
      lo = mid + 1;
    } else hi = mid - 1;
  }
  if (!found || t > found.end + hold) return null;
  let wi = -1;
  for (let i = 0; i < found.words.length; i++) {
    if (found.words[i].start <= t) wi = i;
    else break;
  }
  return { cue: found, wordIndex: wi };
}

/** At most `maxChars` characters of a long cue around the spoken word, so a caption is never more than two lines. */
export function captionWindow(words: TimedWord[], wordIndex: number, maxChars: number): { from: number; to: number } {
  const total = words.reduce((n, w) => n + w.text.length + 1, 0);
  if (total <= maxChars) return { from: 0, to: words.length };
  const idx = Math.max(0, Math.min(wordIndex, words.length - 1));
  let from = idx;
  let to = idx + 1;
  let len = words[idx].text.length;
  for (;;) {
    const next = to < words.length ? words[to].text.length + 1 : Infinity;
    const prev = from > 0 ? words[from - 1].text.length + 1 : Infinity;
    if (next <= prev && len + next <= maxChars) {
      len += next;
      to++;
    } else if (prev !== Infinity && len + prev <= maxChars) {
      len += prev;
      from--;
    } else if (next !== Infinity && len + next <= maxChars) {
      len += next;
      to++;
    } else break;
  }
  return { from, to };
}

// ── sync jitter ────────────────────────────────────────────────────────────────────────────────────

/**
 * Measures how well the player's clock can be followed: between two polls the clock is extrapolated (last reading + elapsed wall time x playback rate) and compared
 * with the next reading. A steady clock gives deviations near 0; a clock that is read late, steps or stalls gives large ones. While paused, seeking or buffering no sample is taken.
 */
export class JitterMeter {
  private last: { t: number; now: number } | null = null;
  private devs: number[] = [];
  private skip = 0;
  /** `warmup`: readings right after playback (re)starts are ignored: a player's clock settles for a moment while it starts decoding */
  constructor(private readonly windowSize = 60, private readonly warmup = 4) {}

  reset() {
    this.last = null;
  }

  push(playerTimeSec: number, nowMs: number, playing: boolean, rate = 1) {
    if (!playing) {
      this.last = null;
      return;
    }
    if (!this.last) this.skip = this.warmup;
    if (this.skip > 0) {
      this.skip--;
      this.last = { t: playerTimeSec, now: nowMs };
      return;
    }
    if (this.last) {
      const predicted = this.last.t + ((nowMs - this.last.now) / 1000) * rate;
      const dev = Math.abs(predicted - playerTimeSec) * 1000;
      if (dev < 2000) this.devs.push(dev); // a bigger gap is a seek, not jitter
      if (this.devs.length > this.windowSize) this.devs.shift();
    }
    this.last = { t: playerTimeSec, now: nowMs };
  }

  get samples() {
    return this.devs.length;
  }

  percentile(p: number): number {
    if (!this.devs.length) return 0;
    const s = [...this.devs].sort((a, b) => a - b);
    return s[Math.min(s.length - 1, Math.ceil((p / 100) * s.length) - 1)];
  }

  /** True once there are enough samples and the 95th percentile of the deviation is above the limit. */
  exceeds(limitMs: number, minSamples = 15): boolean {
    return this.devs.length >= minSamples && this.percentile(95) > limitMs;
  }
}

export function formatClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
