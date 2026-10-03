import { defineConfig } from '@playwright/test';

// End-to-end tests against the PRODUCTION build served by scripts/e2e-serve.mjs (no dev server). Two viewports: a phone and a desktop.
// The server is started with dummy Supabase settings: the tests never touch a real database.
//   NEXT_PUBLIC_VIDEO_COURSE=1 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy npx next build
//   npx playwright test            (flag-on suite)      |   npx playwright test -c playwright.flagoff.config.ts   (flag-off suite, needs a flag-off build)
const PORT = Number(process.env.E2E_PORT ?? 3100);

export default defineConfig({
  testDir: './e2e',
  testMatch: /video-course\.spec\.ts/,
  timeout: 120_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    channel: process.env.E2E_CHANNEL ?? 'chrome',
    launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] },
    trace: 'off',
  },
  projects: [
    { name: 'phone-390x844', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
    { name: 'desktop-1280x800', use: { browserName: 'chromium', viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: 'node scripts/e2e-serve.mjs',
    url: `http://127.0.0.1:${PORT}/video-preview/1`,
    reuseExistingServer: true,
    timeout: 60_000,
    stdout: 'ignore',
    env: { PORT: String(PORT), VIDEO_COURSE_PUBLIC_PREVIEW: '1', NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'dummy-anon-key' },
  },
});
