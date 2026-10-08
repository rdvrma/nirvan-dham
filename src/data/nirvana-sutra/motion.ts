/** Geometry-only scroll model: no timers, accumulated state or scroll direction. */
export const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const easeBetween = (p: number, start: number, end: number) => {
  const t = clamp01((p - start) / (end - start));
  return t * t * (3 - 2 * t);
};

/** Inline illustrations resolve from viewport geometry, including reverse/jump scroll. */
export function editorialProgress(top: number, height: number, viewport: number, topAtDocumentEnd = Number.NEGATIVE_INFINITY) {
  const start = viewport * .7;
  const naturalEnd = start - (height * .9 + viewport * .35);
  // A concluding scene can have little text below it: finish within the scroll
  // space that actually exists, instead of leaving its final question hidden.
  const end = Math.max(naturalEnd, Math.min(start - 1, topAtDocumentEnd));
  return clamp01((start - top) / Math.max(1, start - end));
}

export function editorialFrame(progress: number) {
  const p = clamp01(progress);
  return {
    p,
    first: 1 - easeBetween(p, .3, .7),
    last: easeBetween(p, .38, .84),
    held: easeBetween(p, .12, .4) * (1 - easeBetween(p, .62, .97)),
    merge: easeBetween(p, .35, .9),
    quiet: easeBetween(p, .1, .82),
    returns: easeBetween(p, .62, 1),
  };
}

/** Successive forms travel through the center, rather than only changing opacity. */
export function editorialItemFrame(progress: number, index: number, count: number) {
  const t = clamp01(progress) * (count + 1.2) - index;
  return { travel: 110 * (1 - t), show: easeBetween(t, -.2, .35) * (1 - easeBetween(t, 1, 1.7)), scale: .72 + .28 * (1 - clamp01(Math.abs(1 - t))) };
}
export function sceneAt(steps: { top: number; height: number }[], anchor: number) {
  let index = 0;
  for (let i = 1; i < steps.length; i++) if (steps[i].top <= anchor) index = i;
  const step = steps[index];
  return { scene: index + 1, progress: step ? clamp01((anchor - step.top) / Math.max(1, step.height)) : 0 };
}
export function inquiryFrame(scene: number, progress: number) {
  const p = clamp01(progress);
  return {
    path: scene === 4 ? 1 - p : clamp01(p * 1.8 + 0.12),
    seekerX: scene === 4 ? 110 + 190 * p : 92 + 105 * p,
    seekerY: scene === 4 ? 290 - 70 * p : 305 - 85 * p,
    targetX: 490 - 190 * p, targetY: 160 + 60 * p, targetRadius: 14 - 10 * p,
    ringOffset: 100 * (1 - p), waveOpacity: 1 - clamp01((p - 0.2) / 0.55),
    waveX: -45 + p * 100, waveScale: 0.82 + p * 0.48, seaAmplitude: 42 * (1 - p),
  };
}
