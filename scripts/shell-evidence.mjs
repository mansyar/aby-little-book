// One-off Phase 1 evidence capture: static shell at required layouts in both engines.
// Run with: node scripts/shell-evidence.mjs (expects a preview server on port 4173).
import { chromium, webkit } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const outDir = 'evidence/phase1';
mkdirSync(outDir, { recursive: true });

// iPad landscape, phone portrait, desktop — the authored layouts from the spec.
const viewports = [
  { name: 'ipad-landscape', width: 1180, height: 820 },
  { name: 'phone-portrait', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
];

for (const browserType of [chromium, webkit]) {
  const browser = await browserType.launch();
  const page = await browser.newPage();
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const response = await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    const shot = `${outDir}/${browserType === chromium ? 'chromium' : 'webkit'}-${viewport.name}.png`;
    await page.screenshot({ path: shot });
    const status = response?.status() ?? 'none';
    const main = await page.getByRole('main').isVisible();
    const h1 = await page.getByRole('heading', { level: 1 }).textContent();
    console.log(`${shot} -> http ${status}, main=${main}, h1=${h1}`);
  }
  await browser.close();
}

// Reduced-motion variant (Chromium, iPad landscape).
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1180, height: 820 },
  reducedMotion: 'reduce',
});
const page = await context.newPage();
await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
await page.screenshot({ path: `${outDir}/chromium-ipad-landscape-reduced-motion.png` });
console.log(`${outDir}/chromium-ipad-landscape-reduced-motion.png -> captured`);
await browser.close();

// Font provenance: assert no external requests (CSP restricts to 'self').
const netBrowser = await chromium.launch();
const netPage = await netBrowser.newPage();
const external = [];
netPage.on('request', (request) => {
  const url = request.url();
  if (!url.startsWith(baseUrl)) external.push(url);
});
await netPage.goto(baseUrl, { waitUntil: 'networkidle' });
console.log(`external requests: ${external.length === 0 ? 'none (all resources local)' : external.join(', ')}`);
await netBrowser.close();
