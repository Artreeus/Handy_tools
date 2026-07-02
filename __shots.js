const { chromium } = require('playwright-core');
const path = require('path');

const DIR = 'C:\\Users\\Mhr_Na\\AppData\\Local\\Temp\\claude\\D--Vo-vercel-toolbox\\2409673b-ac1d-41ba-be4a-3e8216af9e1a\\scratchpad';
const BASE = 'http://localhost:3417';
const CHROME = 'C:\\Users\\Mhr_Na\\AppData\\Local\\ms-playwright\\chromium-1217\\chrome-win64\\chrome.exe';

const pages = [
  ['home', '/'],
  ['password', '/tools/dev/password-generator'],
  ['income', '/tools/finance/income-tracker'],
  ['focus', '/tools/productivity/focus-timer'],
  ['json', '/tools/dev/json-formatter'],
];

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const errors = [];

  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ colorScheme: theme, viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    page.on('pageerror', (e) => errors.push(`${theme} pageerror: ${e.message}`));
    // Force theme via next-themes localStorage key
    await page.goto(BASE);
    await page.evaluate((t) => localStorage.setItem('theme', t), theme);
    for (const [name, url] of pages) {
      await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(DIR, `rd-${name}-${theme}.png`) });
    }
    await context.close();
  }

  console.log(JSON.stringify({ errors }, null, 2));
  await browser.close();
})().catch((e) => { console.error('SCRIPT ERROR', e); process.exit(1); });
