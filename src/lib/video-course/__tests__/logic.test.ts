import { describe, expect, it } from 'vitest';
import { parseManifest, parseWordTiming } from '../manifest';
import {
  JitterMeter, activeCaption, buildCues, buildPauseStops, captionWindow, clampResume, evaluateTick, firstIncompleteStop, formatClock, isSegmentUnlocked, parseVtt, segmentIndexAt, unlockedLimitSec,
} from '../logic';
import { manifestJson, vttHi, wordsEn, wordsHi } from './fixture';

const manifest = (() => {
  const r = parseManifest(manifestJson());
  if (!r.ok) throw new Error(r.message);
  return r.value;
})();
const stops = buildPauseStops(manifest);
const none = new Set<string>();

describe('pause stops', () => {
  it('has one stop per segment, in time order, with prompts; the opening silence is not a stop', () => {
    expect(stops.map((s) => s.id)).toEqual(['p-g1', 'p-g2', 'p-g3', 'p-g4', 'p-g5']);
    expect(stops.map((s) => s.atSec)).toEqual([50.842, 82.167, 115.799, 159.063, 212.067]);
    expect(stops.every((s) => s.prompts.length >= 1 && s.prompts.length <= 2)).toBe(true);
    expect(stops.map((s) => s.segmentIndex)).toEqual([0, 1, 2, 3, 4]);
  });

  it('falls back to the segments\' own pause markers when a manifest has no pause points', () => {
    const m = { ...manifest, pausePoints: [] };
    expect(buildPauseStops(m).map((s) => s.atSec)).toEqual(stops.map((s) => s.atSec));
  });
});

describe('unlock rule (sequential)', () => {
  it('opens only the first segment at the start and one more after each completed pause', () => {
    expect([0, 1, 2, 3, 4].map((i) => isSegmentUnlocked(stops, i, none, 'sequential'))).toEqual([true, false, false, false, false]);
    expect([0, 1, 2, 3, 4].map((i) => isSegmentUnlocked(stops, i, new Set(['p-g1']), 'sequential'))).toEqual([true, true, false, false, false]);
    expect([0, 1, 2, 3, 4].map((i) => isSegmentUnlocked(stops, i, new Set(['p-g1', 'p-g2', 'p-g3', 'p-g4']), 'sequential'))).toEqual([true, true, true, true, true]);
  });

  it('does not open a later segment when only a later pause is completed', () => {
    expect(isSegmentUnlocked(stops, 2, new Set(['p-g2']), 'sequential')).toBe(false);
  });

  it('open mode unlocks everything', () => {
    expect([0, 1, 2, 3, 4].every((i) => isSegmentUnlocked(stops, i, none, 'open'))).toBe(true);
    expect(unlockedLimitSec(stops, none, 'open', 219.5)).toBe(219.5);
  });

  it('the reachable time is the first incomplete pause point, then the end', () => {
    expect(unlockedLimitSec(stops, none, 'sequential', 219.5)).toBe(50.842);
    expect(unlockedLimitSec(stops, new Set(['p-g1']), 'sequential', 219.5)).toBe(82.167);
    expect(unlockedLimitSec(stops, new Set(stops.map((s) => s.id)), 'sequential', 219.5)).toBe(219.5);
    expect(firstIncompleteStop(stops, new Set(['p-g1', 'p-g2']))?.id).toBe('p-g3');
  });

  it('knows which segment a time belongs to', () => {
    expect(segmentIndexAt(manifest, 0)).toBe(0);
    expect(segmentIndexAt(manifest, 60)).toBe(1);
    expect(segmentIndexAt(manifest, 218)).toBe(4);
  });
});

describe('evaluateTick (polled every 200 ms)', () => {
  const base = { stops, completed: none, mode: 'sequential' as const, seekJumpSec: 1.5 };

  it('does nothing before the pause point', () => {
    expect(evaluateTick({ ...base, prev: 49.2, cur: 49.4 })).toEqual({ type: 'none' });
  });

  it('pauses when playback reaches the pause point, also with a small overshoot (silences are >= 1 s)', () => {
    expect(evaluateTick({ ...base, prev: 50.7, cur: 50.9 })).toMatchObject({ type: 'pause', stop: { id: 'p-g1' } });
    expect(evaluateTick({ ...base, prev: 50.9, cur: 51.3 })).toMatchObject({ type: 'pause', stop: { id: 'p-g1' } });
  });

  it('seeks back when the learner jumped past the pause point (the seek-back guard)', () => {
    const jump = evaluateTick({ ...base, prev: 20, cur: 90 });
    expect(jump).toMatchObject({ type: 'seekBack', to: 50.842, stop: { id: 'p-g1' } });
    const far = evaluateTick({ ...base, prev: 52.9, cur: 53.1 });
    expect(far).toMatchObject({ type: 'seekBack', to: 50.842 });
  });

  it('a backward seek never triggers anything', () => {
    expect(evaluateTick({ ...base, prev: 40, cur: 10 })).toEqual({ type: 'none' });
  });

  it('after a pause point is completed the next one applies, and replaying earlier video is free', () => {
    const done = new Set(['p-g1']);
    expect(evaluateTick({ ...base, completed: done, prev: 50.9, cur: 51.1 })).toEqual({ type: 'none' });
    expect(evaluateTick({ ...base, completed: done, prev: 82.0, cur: 82.2 })).toMatchObject({ type: 'pause', stop: { id: 'p-g2' } });
    expect(evaluateTick({ ...base, completed: new Set(stops.map((s) => s.id)), prev: 212, cur: 214 })).toEqual({ type: 'none' });
  });

  it('open mode pauses only when playback crosses a pause point, seeks are free', () => {
    const open = { ...base, mode: 'open' as const };
    expect(evaluateTick({ ...open, prev: 50.7, cur: 50.9 })).toMatchObject({ type: 'pause', stop: { id: 'p-g1' } });
    expect(evaluateTick({ ...open, prev: 20, cur: 90 })).toEqual({ type: 'none' });
  });
});

describe('resume position', () => {
  it('never resumes beyond the unlocked limit or in the last second', () => {
    expect(clampResume(100, 50.842, 219.5)).toBe(50.842);
    expect(clampResume(30, 50.842, 219.5)).toBe(30);
    expect(clampResume(219.2, 219.5, 219.5)).toBe(0);
    expect(clampResume(-4, 50, 219.5)).toBe(0);
  });
});

describe('caption cues and timing', () => {
  const hi = (() => { const r = parseWordTiming(wordsHi()); if (!r.ok) throw new Error(r.message); return buildCues(r.value.words); })();
  const en = (() => { const r = parseWordTiming(wordsEn()); if (!r.ok) throw new Error(r.message); return buildCues(r.value.words); })();

  it('builds the cues of the file for Hindi (46: long sentences are split) and keeps the words in order', () => {
    expect(hi).toHaveLength(46);
    expect(hi[0].text.startsWith('अध्यात्म की यात्रा')).toBe(true);
    expect(hi.every((c, i) => i === 0 || c.start >= hi[i - 1].start)).toBe(true);
    expect(hi.reduce((n, c) => n + c.words.length, 0)).toBe(391);
  });

  it('English cues follow the cue ids of the file (long sentences are split)', () => {
    expect(en.length).toBeGreaterThanOrEqual(32);
    expect(en[0].id).toBe('s01-1');
  });

  it('finds the cue and the spoken word at a given time', () => {
    const a = activeCaption(hi, 2.9)!;
    expect(a.cue.id).toMatch(/^s01/);
    expect(a.wordIndex).toBe(1); // "की" starts at 2.80
    expect(activeCaption(hi, 2.1)!.wordIndex).toBe(0);
    expect(activeCaption(hi, 2.0)!.wordIndex).toBe(-1); // a hair before the first word: the cue is already on screen
  });

  it('shows nothing in the silences between sentences and before the first cue', () => {
    expect(activeCaption(hi, 0.5)).toBeNull();
    expect(activeCaption(hi, 9.4)).toBeNull(); // between s01 and s02, beyond the hold
  });

  it('keeps a caption for a short hold after its last word so it does not flicker', () => {
    const c = hi[0];
    expect(activeCaption(hi, c.end + 0.3)?.cue.id).toBe(c.id);
    expect(activeCaption(hi, c.end + 0.6)).toBeNull();
  });

  it('limits a long cue to a window of at most the given characters around the spoken word', () => {
    const long = hi.reduce((a, c) => (c.text.length > a.text.length ? c : a), hi[0]);
    const w = captionWindow(long.words, 5, 60);
    const len = long.words.slice(w.from, w.to).reduce((n, x) => n + x.text.length + 1, -1);
    expect(len).toBeLessThanOrEqual(60);
    expect(w.from).toBeLessThanOrEqual(5);
    expect(w.to).toBeGreaterThan(5);
    expect(captionWindow(hi[2].words, 0, 400)).toEqual({ from: 0, to: hi[2].words.length });
  });

  it('parses the WebVTT fallback with per-word timestamps', () => {
    const cues = parseVtt(vttHi());
    expect(cues).toHaveLength(46);
    expect(cues[0].start).toBeCloseTo(1.81, 2);
    expect(cues[0].words[0].text).toBe('अध्यात्म');
    expect(cues[0].words[1].start).toBeCloseTo(2.8, 2);
    expect(cues[0].words.at(-1)!.end).toBeCloseTo(9.3, 2);
  });

  it('a VTT cue without word tags is one unit (sentence-level)', () => {
    const cues = parseVtt('WEBVTT\n\n00:00:01.000 --> 00:00:03.000\nhello world again\n');
    expect(cues).toHaveLength(1);
    expect(activeCaption(cues, 1.5)?.cue.text).toBe('hello world again');
  });

  it('formats the clock', () => {
    expect(formatClock(75.9)).toBe('1:15');
    expect(formatClock(-1)).toBe('0:00');
  });
});

describe('sync jitter meter', () => {
  it('reads near zero for a steady clock polled every 200 ms', () => {
    const m = new JitterMeter();
    for (let i = 0; i < 40; i++) m.push(i * 0.2, i * 200, true);
    expect(m.samples).toBe(36); // 40 readings minus the 4 warm-up readings
    expect(m.percentile(95)).toBeLessThan(5);
    expect(m.exceeds(250)).toBe(false);
  });

  it('flags a clock that steps in 500 ms jumps (a coarse player clock)', () => {
    const m = new JitterMeter();
    for (let i = 0; i < 60; i++) m.push(Math.floor((i * 200) / 1000 / 0.5) * 0.5, i * 200, true);
    expect(m.percentile(95)).toBeGreaterThan(250);
    expect(m.exceeds(250)).toBe(true);
  });

  it('takes no samples while paused or buffering, and a seek is not jitter', () => {
    const m = new JitterMeter();
    for (let i = 0; i < 30; i++) m.push(10, i * 200, false);
    expect(m.samples).toBe(0);
    m.push(5, 0, true);
    m.push(60, 200, true); // jumped 55 s in 200 ms: a seek
    expect(m.samples).toBe(0);
  });

  it('ignores the warm-up readings after playback starts, so a start-up stall does not count', () => {
    const m = new JitterMeter(60, 4);
    const t = [0, 0.9, 0.9, 1.7, 1.9, 2.1, 2.3, 2.5, 2.7, 2.9, 3.1, 3.3, 3.5, 3.7, 3.9, 4.1, 4.3, 4.5, 4.7, 4.9];
    t.forEach((x, i) => m.push(x, i * 200, true));
    expect(m.percentile(95)).toBeLessThan(5);
  });

  it('needs enough samples before it decides', () => {
    const m = new JitterMeter();
    m.push(0, 0, true);
    m.push(1.5, 200, true);
    expect(m.exceeds(250)).toBe(false);
  });
});
