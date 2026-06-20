const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  for (const path of ['/', '/library', '/nirvan-sutra', '/guided-meditation']) {
    console.log(`Testing ${path}`);
    await page.goto(`http://localhost:3000${path}`, {waitUntil: 'networkidle'});
    await new Promise(r => setTimeout(r, 1000));
  }
  await browser.close();
})();
