// Flag-OFF regression: with NEXT_PUBLIC_VIDEO_COURSE unset the site behaves exactly as before (run against a flag-off build, see playwright.flagoff.config.ts).
import { expect, test } from '@playwright/test';

test('the public preview route does not exist', async ({ page }) => {
  const res = await page.goto('/video-preview/1');
  expect(res?.status()).toBe(404);
});

test('/course shows the old landing without the video-lessons entry', async ({ page }) => {
  const res = await page.goto('/course', { waitUntil: 'domcontentloaded' });
  expect(res?.status()).toBe(200);
  await expect(page.locator('#lang-hi')).toBeVisible();
  await expect(page.getByTestId('video-lessons-entry')).toHaveCount(0);
});

test('a chapter still sends a signed-out visitor to the login page (the reading flow is unchanged)', async ({ page }) => {
  await page.goto('/course/hi/1', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/login\?next=%2Fcourse%2Fhi%2F1/);
  await page.goto('/course/hi/1?view=read', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/login\?.*next=%2Fcourse%2Fhi%2F1/); // the existing middleware keeps the query string on the login URL
});

test('no video-lesson markup anywhere on the landing page', async ({ page }) => {
  await page.goto('/course', { waitUntil: 'domcontentloaded' });
  const html = await page.content();
  expect(html).not.toContain('video-lesson');
  expect(html).not.toContain('course-fixture');
});
