/** Local playback evidence for the course UI. A seek does not count the skipped interval. */
export interface WatchProgress {
  seconds: Set<number>;
  lastMediaTime: number | null;
  lastWallTime: number | null;
}

export function newWatchProgress(): WatchProgress {
  return { seconds: new Set(), lastMediaTime: null, lastWallTime: null };
}

export function pauseWatchProgress(progress: WatchProgress) {
  progress.lastMediaTime = null;
  progress.lastWallTime = null;
}

/** Returns true after at least 90% of the actual film has played, even across seeks. */
export function recordWatchSample(progress: WatchProgress, mediaTime: number, duration: number, wallTime: number): boolean {
  if (!Number.isFinite(mediaTime) || !Number.isFinite(duration) || !Number.isFinite(wallTime) || duration <= 0) return false;
  if (progress.lastMediaTime !== null && progress.lastWallTime !== null) {
    const elapsedMedia = mediaTime - progress.lastMediaTime;
    const elapsedWall = (wallTime - progress.lastWallTime) / 1000;
    // Allow faster playback and browser timer throttling, but never credit a seek ahead.
    if (elapsedMedia > 0 && elapsedWall > 0 && elapsedMedia <= elapsedWall * 2.25 + 1.5) {
      const first = Math.max(0, Math.floor(progress.lastMediaTime));
      const last = Math.min(Math.ceil(duration) - 1, Math.floor(mediaTime) - 1);
      for (let second = first; second <= last; second++) progress.seconds.add(second);
    }
  }
  progress.lastMediaTime = mediaTime;
  progress.lastWallTime = wallTime;
  return progress.seconds.size >= Math.ceil(duration * 0.9);
}
