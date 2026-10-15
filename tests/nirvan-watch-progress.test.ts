import assert from 'node:assert/strict';
import test from 'node:test';
import { newWatchProgress, pauseWatchProgress, recordWatchSample } from '../src/course/nirvan-sutra/watch-progress';

test('watch evidence counts played intervals and rejects skipped intervals', () => {
  const progress = newWatchProgress();
  for (let second = 0; second <= 90; second++) {
    const done = recordWatchSample(progress, second, 100, second * 1000);
    if (second < 90) assert.equal(done, false);
  }
  assert.equal(progress.seconds.size >= 90, true);
  assert.equal(recordWatchSample(progress, 100, 100, 100_000), true);
});

test('jumping to the end does not complete a film', () => {
  const progress = newWatchProgress();
  recordWatchSample(progress, 0, 100, 0);
  recordWatchSample(progress, 2, 100, 2000);
  assert.equal(recordWatchSample(progress, 99, 100, 3000), false);
  assert.equal(progress.seconds.size < 10, true);
  pauseWatchProgress(progress);
  assert.equal(recordWatchSample(progress, 100, 100, 5000), false);
});
