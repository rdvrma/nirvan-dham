const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  await page.goto('http://localhost:3001/nirvan-sutra', {waitUntil: 'networkidle'});
  await new Promise(r => setTimeout(r, 1000));
  await page.goto('http://localhost:3001/guided-meditation', {waitUntil: 'networkidle'});
  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
})();
