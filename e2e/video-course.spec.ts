// End-to-end test of the video lesson on the production build (flag ON, public preview, local 540p proxy): load, play to the first pause point, answer, continue,
// audio language choice (Hindi only), captions at the bottom, resume, accessibility checks, measurements. Runs at 390x844 (phone) and 1280x800 (desktop).
// Screenshots go to docs/video-course/screens/ (never wider than 1280 px); measurements to docs/video-course/measurements.json.
import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const SCREENS = path.join(process.cwd(), 'docs', 'video-course', 'screens');
const MEASURE = path.join(process.cwd(), 'docs', 'video-course', 'measurements.json');
fs.mkdirSync(SCREENS, { recursive: true });

function record(project: string, data: Record<string, unknown>) {
  let all: Record<string, Record<string, unknown>> = {};
  try { all = JSON.parse(fs.readFileSync(MEASURE, 'utf8')); } catch { /* first write */ }
  all[project] = { ...(all[project] ?? {}), ...data };
  fs.writeFileSync(MEASURE, JSON.stringify(all, null, 2));
}

const state = (page: Page) => page.evaluate(() => { const v = document.querySelector('video')!; return { t: v.currentTime, paused: v.paused, muted: v.muted, rate: v.playbackRate }; });
async function openLesson(page: Page) {
  await page.goto('/video-preview/1');
  await expect(page.getByTestId('video-lesson')).toHaveAttribute('data-phase', 'ready', { timeout: 20_000 });
  await expect(page.locator('video')).toBeVisible();
}
const play = (page: Page) => page.evaluate(() => document.querySelector('video')!.play());
const seek = (page: Page, t: number) => page.evaluate((x) => { document.querySelector('video')!.currentTime = x; }, t);

function luminance(rgb: number[]) {
  const c = rgb.map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const contrast = (a: number[], b: number[]) => { const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

test.beforeEach(async ({ page }) => {
  // start every test with empty device storage, but not again on a reload inside the test (sessionStorage marks the first load)
  await page.addInitScript(() => { try { if (!sessionStorage.getItem('__e2e_init')) { localStorage.clear(); sessionStorage.setItem('__e2e_init', '1'); } } catch { /* ignore */ } });
});

test('this browser can play the H.264 proxy (the test needs Chrome: Playwright\'s Chromium has no proprietary codecs)', async ({ page }) => {
  await page.goto('/video-preview/1');
  const ok = await page.evaluate(() => document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"'));
  expect(ok, 'run with Chrome: E2E_CHANNEL=chrome (the default)').not.toBe('');
});

test('loads, plays to the first pause point, asks the question BELOW the player, saves the answer, continues', async ({ page }, testInfo) => {
  const proj = testInfo.project.name;
  const jsBytes = { total: 0, files: 0 };
  page.on('response', async (r) => { if (/\.js(\?|$)/.test(r.url()) && r.status() === 200) { try { jsBytes.total += (await r.body()).length; jsBytes.files++; } catch { /* aborted */ } } });
  const t0 = Date.now();
  await openLesson(page);
  const ready = Date.now() - t0;

  // the lesson shows the Hindi title, the local source, the rail with only the first segment open
  await expect(page.getByTestId('video-lesson')).toHaveAttribute('data-source', 'local');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('स्वयं की खोज');
  await expect(page.getByTestId('rail-seg-0')).toBeEnabled();
  for (const i of [1, 2, 3, 4]) await expect(page.getByTestId(`rail-seg-${i}`)).toBeDisabled();

  // first frame and click-to-playing latency on the 540p proxy
  const frame = await page.evaluate(() => new Promise<{ loadedMs: number; playMs: number }>((resolve) => {
    const v = document.querySelector('video')!;
    const t = performance.now();
    v.addEventListener('playing', () => resolve({ loadedMs: Math.round(performance.timeOrigin + performance.now() - performance.timeOrigin), playMs: Math.round(performance.now() - t) }), { once: true });
    v.play();
  }));

  // captions: bottom-centre, fixed baseline, ~8 % from the bottom, never mid-frame
  await expect(page.getByTestId('caption-text')).toBeVisible({ timeout: 15_000 });
  const frameBox = (await page.getByTestId('player-frame').boundingBox())!;
  const capBox = (await page.getByTestId('caption-text').boundingBox())!;
  const capCenter = capBox.x + capBox.width / 2;
  expect(Math.abs(capCenter - (frameBox.x + frameBox.width / 2))).toBeLessThan(frameBox.width * 0.03);
  const bottomGap = (frameBox.y + frameBox.height - (capBox.y + capBox.height)) / frameBox.height;
  expect(bottomGap, 'caption bottom margin as a share of the player height').toBeGreaterThan(0.04);
  expect(bottomGap).toBeLessThan(0.14);
  expect(capBox.y).toBeGreaterThan(frameBox.y + frameBox.height * 0.5); // lower half only
  expect(capBox.width).toBeLessThanOrEqual(frameBox.width);
  await page.screenshot({ path: path.join(SCREENS, `${proj}-1-captions.png`) });

  // sync jitter of the clock the captions follow (local source), after ~10 s of playback
  await page.waitForTimeout(10_000);
  const diag = await page.evaluate(() => window.__nirvanVideoDiag);
  expect(diag?.jitterSamples as number).toBeGreaterThan(20);
  expect(diag?.jitterP95Ms as number).toBeLessThan(250);
  expect(diag?.captionMode).toBe('word');

  // play to the first pause point (50.842 s)
  await seek(page, 49.2);
  await expect(page.getByTestId('reflection-panel')).toBeVisible({ timeout: 15_000 });
  const v = await state(page);
  expect(v.paused).toBe(true);
  expect(v.t).toBeGreaterThan(50.5);
  expect(v.t).toBeLessThan(52.5);
  const panelBox = (await page.getByTestId('reflection-panel').boundingBox())!;
  const frameBox2 = (await page.getByTestId('player-frame').boundingBox())!;
  expect(panelBox.y, 'the reflection panel starts below the player').toBeGreaterThanOrEqual(frameBox2.y + frameBox2.height - 1);
  await expect(page.getByTestId('reflection-panel')).toContainText('आपके जीवन में कौन-सी बेचैनी');
  await expect(page.getByTestId('reflection-panel')).not.toContainText(/generated|reviewed|machine/i);
  await expect(page.getByTestId('reflection-continue')).toBeDisabled();
  await page.screenshot({ path: path.join(SCREENS, `${proj}-2-reflection.png`), fullPage: true });

  // answer, continue
  const answer = 'एक अनकही बेचैनी जो शांत बैठने पर उठती है।';
  await page.getByRole('textbox').first().fill(answer);
  await expect(page.getByTestId('reflection-continue')).toBeEnabled();
  await page.getByTestId('reflection-continue').click();
  await expect(page.getByTestId('reflection-panel')).toHaveCount(0);
  await expect.poll(async () => (await state(page)).paused, { timeout: 8000 }).toBe(false);
  await expect(page.getByTestId('rail-seg-1')).toBeEnabled();
  await expect(page.getByTestId('rail-seg-2')).toBeDisabled();
  const stored = await page.evaluate(() => Object.entries(localStorage).filter(([k]) => k.includes(':answers:')).map(([, v]) => v).join(''));
  expect(stored).toContain(answer);
  await page.screenshot({ path: path.join(SCREENS, `${proj}-3-continued.png`) });

  // jumping past the next locked pause point sends the learner back to it
  await seek(page, 200);
  await expect(page.getByTestId('reflection-panel')).toBeVisible({ timeout: 8000 });
  expect((await state(page)).t).toBeLessThan(83);

  record(proj, { lessonReadyMs: ready, clickToPlayingMs: frame.playMs, jsBytesLoadedOnPreviewPage: jsBytes.total, jsFilesLoaded: jsBytes.files, captionJitterP95Ms: diag?.jitterP95Ms, captionJitterSamples: diag?.jitterSamples, captionBottomGapShare: Number(bottomGap.toFixed(3)) });
});

test('audio language: only Hindi is offered while English is not enabled; captions can be switched off', async ({ page }) => {
  await openLesson(page);
  const audio = page.getByTestId('audio-select');
  await expect(audio.locator('option')).toHaveText(['हिंदी']);
  await expect(audio).toBeDisabled();
  await expect(page.getByTestId('caption-select').locator('option')).toHaveText(['हिंदी', 'बंद']);
  await page.getByTestId('caption-select').selectOption('off');
  await play(page);
  await page.waitForTimeout(3500);
  await expect(page.getByTestId('caption-text')).toHaveCount(0);
  await page.getByTestId('caption-select').selectOption('hi');
  await expect(page.getByTestId('caption-text')).toBeVisible({ timeout: 6000 });
});

test('resumes where the learner stopped and keeps the unlocked segment', async ({ page }) => {
  await openLesson(page);
  await seek(page, 49.2);
  await play(page);
  await expect(page.getByTestId('reflection-panel')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('textbox').first().fill('ठीक है');
  await page.getByTestId('reflection-continue').click();
  await expect(page.getByTestId('reflection-panel')).toHaveCount(0);
  await page.waitForTimeout(6500); // a position save happens every 5 s while playing
  await page.reload();
  await expect(page.getByTestId('video-lesson')).toHaveAttribute('data-phase', 'ready', { timeout: 20_000 });
  await expect(page.getByTestId('rail-seg-1')).toBeEnabled();
  await expect(page.getByText(/से जारी/)).toBeVisible();
});

test('Ask the Guide shows the not-connected message and nothing else happens', async ({ page }) => {
  await openLesson(page);
  await page.getByTestId('ask-guide').click();
  await expect(page.getByTestId('guide-message')).toContainText('गाइड अभी जुड़ा नहीं है');
});

test('accessibility: every control has a name, focus order is logical, focus is visible, contrast >= 4.5, reduced motion is respected', async ({ page }, testInfo) => {
  await openLesson(page);

  // names: buttons, selects, textareas, links
  const unnamed = await page.evaluate(() => {
    const out: string[] = [];
    document.querySelectorAll('main button, main select, main textarea, main a').forEach((el) => {
      const e = el as HTMLElement;
      const label = e.getAttribute('aria-label') || (e.id && document.querySelector(`label[for="${e.id}"]`)?.textContent) || e.closest('label')?.textContent || e.textContent;
      if (!label || !label.trim()) out.push(e.outerHTML.slice(0, 80));
    });
    return out;
  });
  expect(unnamed).toEqual([]);

  // focus order: back link, read-text link not present in preview, then rail (first segment), selects, ask the guide
  const order: string[] = [];
  await page.locator('body').click({ position: { x: 1, y: 1 } });
  for (let i = 0; i < 30; i++) { // the native video controls take several tab stops of their own
    await page.keyboard.press('Tab');
    const name = await page.evaluate(() => { const e = document.activeElement as HTMLElement; return e?.getAttribute('data-testid') || e?.getAttribute('aria-label') || e?.tagName || ''; });
    order.push(name);
    if (name === 'ask-guide') break;
  }
  const idx = (k: string) => order.findIndex((o) => o.includes(k));
  expect(idx('rail-seg-0')).toBeGreaterThanOrEqual(0);
  expect(idx('audio-select') === -1 || idx('rail-seg-0') < idx('caption-select') || idx('caption-select') === -1).toBe(true); // rail comes before the selectors (visual order)
  expect(idx('caption-select')).toBeGreaterThan(idx('rail-seg-0'));
  expect(idx('ask-guide')).toBeGreaterThan(idx('caption-select'));
  // a visible focus ring on the focused rail button
  await page.getByTestId('rail-seg-0').focus();
  const outline = await page.getByTestId('rail-seg-0').evaluate((e) => getComputedStyle(e).outlineStyle + ' ' + getComputedStyle(e).outlineWidth);
  expect(outline).toMatch(/solid 2px/);

  // contrast of the text that matters (computed colours against the computed backgrounds)
  const colours = await page.evaluate(() => {
    const rgb = (s: string) => (s.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
    const pick = (sel: string) => { const e = document.querySelector(sel) as HTMLElement | null; return e ? getComputedStyle(e).color : null; };
    return { title: rgb(pick('h1') ?? 'rgb(0,0,0)'), ask: rgb(pick('[data-testid="ask-guide"]') ?? 'rgb(0,0,0)'), select: rgb(pick('[data-testid="audio-select"]') ?? 'rgb(0,0,0)') };
  });
  const bg = [5, 14, 7];
  expect(contrast(colours.title, bg)).toBeGreaterThan(4.5);
  expect(contrast(colours.ask, bg)).toBeGreaterThan(4.5);
  expect(contrast(colours.select, [4, 12, 6])).toBeGreaterThan(4.5);

  // reduced motion: no transitions anywhere in the lesson
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const motion = await page.evaluate(() => [...document.querySelectorAll('[data-testid="video-lesson"] *')].map((e) => getComputedStyle(e).transitionDuration).filter((d) => d !== '0s' && d !== ''));
  expect(motion).toEqual([]);
  record(testInfo.project.name, { a11y: { unnamedControls: unnamed.length, tabOrder: order, contrast: { title: Number(contrast(colours.title, bg).toFixed(1)), askGuide: Number(contrast(colours.ask, bg).toFixed(1)) }, reducedMotionTransitions: motion.length } });
});

test('the page does not scroll sideways on this viewport', async ({ page }) => {
  await openLesson(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

// ── YouTube source with a stubbed IFrame API (no network: the stub draws a box with a 40 px "control bar" and a controllable clock) ─────────────────
const YT_STUB = `
(function () {
  window.__fakeYT = { time: 0, state: 2, timer: null, play: null };
  function Player(el, opts) {
    var self = this;
    el.setAttribute('data-fake-youtube', opts.videoId);
    el.style.cssText = 'position:absolute;inset:0;background:#1c1c1c;';
    var bar = document.createElement('div');
    bar.className = 'fake-yt-bar';
    bar.style.cssText = 'position:absolute;left:0;right:0;bottom:0;height:40px;background:rgba(0,0,0,0.75);';
    el.appendChild(bar);
    window.__fakeYT.optsJson = JSON.stringify({ host: opts.host, videoId: opts.videoId, playerVars: opts.playerVars });
    function set(s) { window.__fakeYT.state = s; opts.events.onStateChange({ data: s }); }
    this.playVideo = function () { clearInterval(window.__fakeYT.timer); window.__fakeYT.timer = setInterval(function () { window.__fakeYT.time += 0.05; }, 50); set(1); };
    this.pauseVideo = function () { clearInterval(window.__fakeYT.timer); set(2); };
    this.seekTo = function (t) { window.__fakeYT.time = t; };
    this.getCurrentTime = function () { return window.__fakeYT.time; };
    this.getDuration = function () { return 219.567; };
    this.getPlayerState = function () { return window.__fakeYT.state; };
    this.getPlaybackRate = function () { return 1; };
    this.loadVideoById = function () {};
    this.destroy = function () { clearInterval(window.__fakeYT.timer); };
    window.__fakeYT.play = this.playVideo;
    setTimeout(function () { opts.events.onReady(); }, 20);
  }
  window.YT = { Player: Player };
  setTimeout(function () { if (window.onYouTubeIframeAPIReady) window.onYouTubeIframeAPIReady(); }, 10);
})();`;

test('YouTube source (stubbed API): the question opens below the player, captions stay clear of the control bar, nothing is drawn over the player', async ({ page }, testInfo) => {
  await page.route('https://www.youtube.com/iframe_api', (route) => route.fulfill({ contentType: 'application/javascript', body: YT_STUB }));
  await page.goto('/video-preview/1?yt=abcdefghijk');
  await expect(page.getByTestId('video-lesson')).toHaveAttribute('data-phase', 'ready', { timeout: 20_000 });
  await expect(page.getByTestId('video-lesson')).toHaveAttribute('data-source', 'youtube');
  await page.waitForFunction(() => (window as unknown as { __fakeYT?: { optsJson?: string } }).__fakeYT?.optsJson, undefined, { timeout: 10_000 }); // the API script is fetched after the page is ready
  const opts = JSON.parse(await page.evaluate(() => (window as unknown as { __fakeYT: { optsJson: string } }).__fakeYT.optsJson));
  expect(opts.host).toBe('https://www.youtube-nocookie.com');
  expect(opts.videoId).toBe('abcdefghijk');
  expect(opts.playerVars).toMatchObject({ enablejsapi: 1, rel: 0, playsinline: 1, hl: 'hi', cc_load_policy: 0, controls: 1 });

  // captions while "playing" at 3 s: above the 40 px control bar
  await page.evaluate(() => { const y = (window as unknown as { __fakeYT: { time: number; play: () => void } }).__fakeYT; y.time = 2.9; y.play(); });
  await expect(page.getByTestId('caption-text')).toBeVisible({ timeout: 6000 });
  const bar = (await page.locator('.fake-yt-bar').boundingBox())!;
  const cap = (await page.getByTestId('caption-text').boundingBox())!;
  expect(cap.y + cap.height, 'caption bottom is above the player\'s control bar').toBeLessThanOrEqual(bar.y + 1);
  await page.screenshot({ path: path.join(SCREENS, `${testInfo.project.name}-4-youtube-captions.png`) });

  // pause point: the player is paused, the panel is below the player frame and shares no pixel with it
  await page.evaluate(() => { (window as unknown as { __fakeYT: { time: number } }).__fakeYT.time = 50.3; });
  await expect(page.getByTestId('reflection-panel')).toBeVisible({ timeout: 8000 });
  expect(await page.evaluate(() => (window as unknown as { __fakeYT: { state: number } }).__fakeYT.state)).toBe(2);
  const frame = (await page.getByTestId('player-frame').boundingBox())!;
  const panel = (await page.getByTestId('reflection-panel').boundingBox())!;
  expect(panel.y).toBeGreaterThanOrEqual(frame.y + frame.height - 1);
  // the only things inside the player frame are the player host and the caption overlay (no panel, no button, no text of ours over YouTube's UI)
  const inside = await page.getByTestId('player-frame').evaluate((f) => [...f.children].map((c) => c.getAttribute('data-testid') ?? c.tagName));
  expect(inside.sort()).toEqual(['caption-overlay', 'player-host']);
  await page.screenshot({ path: path.join(SCREENS, `${testInfo.project.name}-5-youtube-reflection.png`), fullPage: true });
});

// ── time to first frame on a slow connection (Chromium network emulation: 1.6 Mbit/s, 150 ms round trip: "Slow 4G") ────────────────────────────────
test('time to first frame of the 540p proxy on Slow 4G', async ({ page }, testInfo) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  const t0 = Date.now();
  await page.goto('/video-preview/1');
  await expect(page.getByTestId('video-lesson')).toHaveAttribute('data-phase', 'ready', { timeout: 60_000 });
  const readyMs = Date.now() - t0;
  const t1 = Date.now();
  await page.evaluate(() => document.querySelector('video')!.play());
  await page.waitForFunction(() => { const v = document.querySelector('video')!; return v.currentTime > 0.3 && v.readyState >= 3; }, undefined, { timeout: 60_000 });
  const firstFrameMs = Date.now() - t1;
  record(testInfo.project.name, { slow4g: { lessonReadyMs: readyMs, playToFirstFrameMs: firstFrameMs } });
  expect(firstFrameMs).toBeLessThan(20_000);
});
