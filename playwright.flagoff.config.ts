import { defineConfig } from '@playwright/test';

// The flag-OFF regression suite: run against a build made WITHOUT NEXT_PUBLIC_VIDEO_COURSE (and without the preview variable at run time).
const PORT = Number(process.env.E2E_PORT ?? 3102);

export default defineConfig({
  testDir: './e2e',
  testMatch: /flag-off\.spec\.ts/,
  timeout: 60_000,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: `http://127.0.0.1:${PORT}`, browserName: 'chromium', viewport: { width: 1280, height: 800 } },
  webServer: {
    command: 'node scripts/e2e-serve.mjs',
    url: `http://127.0.0.1:${PORT}/login`,
    reuseExistingServer: true,
    timeout: 60_000,
    stdout: 'ignore',
    env: { PORT: String(PORT), NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'dummy-anon-key' },
  },
});
