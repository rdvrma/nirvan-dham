import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import nextConfig from '../../../../next.config';
import {
  LESSONS, PLAYER_CONFIG, chooseChapterExperience, enabledLanguagesFor, getLessonConfig, isEnglishForcedOn, isPublicPreviewEnabled, isVideoCourseEnabled, trackLanguageFor,
} from '../config';

describe('feature flag', () => {
  it('is OFF by default and for anything but 1/true', () => {
    expect(isVideoCourseEnabled(undefined)).toBe(false);
    expect(isVideoCourseEnabled('')).toBe(false);
    expect(isVideoCourseEnabled('0')).toBe(false);
    expect(isVideoCourseEnabled('yes')).toBe(false);
    expect(isVideoCourseEnabled('1')).toBe(true);
    expect(isVideoCourseEnabled('true')).toBe(true);
    expect(isPublicPreviewEnabled(undefined)).toBe(false);
    expect(isEnglishForcedOn(undefined)).toBe(false);
  });

  it('the test environment itself runs with the flag off', () => {
    expect(isVideoCourseEnabled()).toBe(false);
  });
});

describe('flag-off regression: the site behaves exactly as today', () => {
  it('every chapter keeps the reading flow when the flag is off, whatever the query', () => {
    for (let c = 0; c <= 9; c++) {
      expect(chooseChapterExperience({ flagOn: false, chapter: c })).toBe('reading');
      expect(chooseChapterExperience({ flagOn: false, chapter: c, view: 'video' })).toBe('reading');
    }
  });

  // The golden string is the Content-Security-Policy of main (next.config.ts) before this work. YouTube needs no new CSP entry, so it must not change.
  const GOLDEN_CSP = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://www.youtube-nocookie.com https://www.clarity.ms https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    'frame-src https://www.youtube.com https://www.youtube-nocookie.com',
    "connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com https://formspree.io https://*.clarity.ms https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; ');

  it('the security headers and the redirect list are untouched', async () => {
    const headers = await nextConfig.headers!();
    const csp = headers[0].headers.find((h) => h.key === 'Content-Security-Policy')!.value;
    expect(csp).toBe(GOLDEN_CSP);
    const redirects = await nextConfig.redirects!();
    expect(redirects).toHaveLength(23);
    expect(nextConfig.output).toBe('standalone');
  });

  it('the middleware differs from main only by the matcher exclusion of the media files under /course-fixture/', () => {
    const src = fs.readFileSync(path.join(process.cwd(), 'middleware.ts'), 'utf8');
    const m = src.match(/matcher: \[\s*\/\/[^\n]*\n\s*'([^']+)'/);
    expect(m).not.toBeNull();
    // the file holds a JS string literal: a double backslash in the source is one backslash at run time
    const BS = String.fromCharCode(92);
    const matcher = new RegExp('^' + m![1].split(BS + BS).join(BS));
    expect(m![1]).toContain('course-fixture/');
    // everything that was matched before is still matched (pages, api, course); only the fixture media is skipped
    for (const p of ['/', '/course', '/course/hi/1', '/api/course/submit', '/login', '/video-preview/1']) expect(matcher.test(p)).toBe(true);
    for (const p of ['/_next/static/x.js', '/course-fixture/ch1/audio/hi.m4a', '/course-fixture/ch1/manifest.json', '/logo.png', '/hero.mp4']) expect(matcher.test(p)).toBe(false);
    // the auth rule for the old reading flow is unchanged
    expect(src).toContain("pathname !== '/course' && pathname.startsWith('/course/') && !user");
  });
});

describe('lesson config', () => {
  it('chapter 1 has a manifest, no YouTube ids yet, and only Hindi enabled', () => {
    const c = getLessonConfig(1)!;
    expect(c.manifest).toBe('/course-fixture/ch1/manifest.json');
    expect(c.youtubeIds).toEqual({ hi: null, en: null });
    expect(c.enabledLanguages).toEqual(['hi']);
    expect(Object.keys(LESSONS)).toEqual(['1']);
    expect(getLessonConfig(2)).toBeNull();
  });

  it('English stays hidden until a flag enables it', () => {
    const c = getLessonConfig(1)!;
    expect(enabledLanguagesFor(c, false)).toEqual(['hi']);
    expect(enabledLanguagesFor(c, true).sort()).toEqual(['en', 'hi']);
    expect(enabledLanguagesFor({ ...c, enabledLanguages: ['hi', 'en'] }, false).sort()).toEqual(['en', 'hi']);
  });

  it('maps the site language to a track that exists and is enabled; Hinglish uses Hindi', () => {
    expect(trackLanguageFor('hi', ['hi'])).toBe('hi');
    expect(trackLanguageFor('hl', ['hi'])).toBe('hi');
    expect(trackLanguageFor('en', ['hi'])).toBe('hi'); // English hidden: Hindi
    expect(trackLanguageFor('en', ['hi', 'en'])).toBe('en');
    expect(trackLanguageFor('hl', ['hi', 'en'])).toBe('hi');
    expect(trackLanguageFor('en', ['en'])).toBe('en');
  });

  it('with the flag on, a chapter with a lesson shows the video; without one, or with ?view=read, the old reading flow', () => {
    expect(chooseChapterExperience({ flagOn: true, chapter: 1 })).toBe('video');
    expect(chooseChapterExperience({ flagOn: true, chapter: 1, view: 'read' })).toBe('reading');
    expect(chooseChapterExperience({ flagOn: true, chapter: 2 })).toBe('reading');
  });

  it('the player defaults: sequential unlock, 200 ms clock, 250 ms caption jitter limit', () => {
    expect(PLAYER_CONFIG.unlockMode).toBe('sequential');
    expect(PLAYER_CONFIG.pollIntervalMs).toBe(200);
    expect(PLAYER_CONFIG.captionJitterLimitMs).toBe(250);
  });
});
