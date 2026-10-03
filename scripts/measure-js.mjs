// Measures the JavaScript a page downloads on a cold load (fresh browser context, no cache): number of files, decoded bytes and gzip bytes.
//   node scripts/measure-js.mjs http://127.0.0.1:3101 / /course /video-preview/1
// Used for the "JS bundle delta" in docs/video-course/report.md: run it against a build of origin/main and against a build of this branch.
import { chromium } from '@playwright/test';
import { gzipSync } from 'node:zlib';

const [base, ...routes] = process.argv.slice(2);
if (!base || !routes.length) { console.error('usage: node scripts/measure-js.mjs <baseUrl> <route>...'); process.exit(2); }

const browser = await chromium.launch();
const out = [];
for (const route of routes) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const seen = new Map();
  page.on('response', async (r) => {
    const url = r.url();
    const type = r.headers()['content-type'] ?? '';
    if (!(url.split('?')[0].endsWith('.js') || type.includes('javascript'))) return;
    try { const b = await r.body(); seen.set(url, { raw: b.length, gz: gzipSync(b).length }); } catch { /* redirect or aborted */ }
  });
  let status = 0;
  try { const res = await page.goto(base + route, { waitUntil: 'networkidle', timeout: 45000 }); status = res?.status() ?? 0; } catch (e) { status = -1; }
  await page.waitForTimeout(500);
  let raw = 0, gz = 0;
  for (const v of seen.values()) { raw += v.raw; gz += v.gz; }
  out.push({ route, finalUrl: new URL(page.url()).pathname, status, files: seen.size, rawKB: +(raw / 1024).toFixed(1), gzKB: +(gz / 1024).toFixed(1) });
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 1));
