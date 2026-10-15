import { test } from 'node:test';
import assert from 'node:assert/strict';
import { videoAsset } from '../src/course/nirvan-sutra/server/content';
import { courseAudioKey, runpodAudioReady } from '../src/course/nirvan-sutra/server/runpod-audio';

test('each published film selects its matching language track; pending films stay unavailable', () => {
  const prior = {
    ready: process.env.RUNPOD_COURSE_AUDIO_READY,
    access: process.env.RUNPOD_S3_ACCESS_KEY_ID,
    secret: process.env.RUNPOD_S3_SECRET_ACCESS_KEY,
    volume: process.env.RUNPOD_S3_VOLUME_ID,
  };
  try {
    process.env.RUNPOD_COURSE_AUDIO_READY = '1';
    process.env.RUNPOD_S3_ACCESS_KEY_ID = 'test-access';
    process.env.RUNPOD_S3_SECRET_ACCESS_KEY = 'test-secret';
    process.env.RUNPOD_S3_VOLUME_ID = 'test-volume';
    assert.equal(runpodAudioReady(), true);

    const ids = [
      ...Array.from({ length: 17 }, (_, i) => `NS-S${String(i + 1).padStart(2, '0')}-MAIN`),
      'NS-S01-Q01', 'NS-S01-Q03', 'NS-S01-Q06',
    ];
    const locales = ['en', 'bn', 'ta', 'te', 'gu', 'kn', 'ml', 'mr', 'pa', 'or'] as const;
    for (const id of ids) {
      const film = videoAsset(id);
      const filmId = id.replace(/^NS-S/, 'gm-t').replace('-MAIN', '-main').replace(/-Q(\d+)$/, '-q$1').toLowerCase();
      assert.equal(film.publishStatus, 'published', id);
      assert.equal(film.audio.hi, undefined, `${id} uses the Hindi master`);
      for (const locale of locales) {
        assert.equal(film.audio[locale]?.url, `/api/nirvan-sutra/audio/${filmId}/${locale}`, `${id}/${locale}`);
        assert.equal(film.audio[locale]?.status, 'published');
      }
    }
    assert.equal(videoAsset('NS-S01-Q02').audio.en, undefined);
    assert.equal(courseAudioKey('gm-t17-main', 'or'), 'nirvan-sutra/course-audio/v1/gm-t17-main/or.m4a');
    assert.throws(() => courseAudioKey('../secret', 'en'), /Invalid/);
  } finally {
    if (prior.ready === undefined) delete process.env.RUNPOD_COURSE_AUDIO_READY;
    else process.env.RUNPOD_COURSE_AUDIO_READY = prior.ready;
    if (prior.access === undefined) delete process.env.RUNPOD_S3_ACCESS_KEY_ID;
    else process.env.RUNPOD_S3_ACCESS_KEY_ID = prior.access;
    if (prior.secret === undefined) delete process.env.RUNPOD_S3_SECRET_ACCESS_KEY;
    else process.env.RUNPOD_S3_SECRET_ACCESS_KEY = prior.secret;
    if (prior.volume === undefined) delete process.env.RUNPOD_S3_VOLUME_ID;
    else process.env.RUNPOD_S3_VOLUME_ID = prior.volume;
  }
});
