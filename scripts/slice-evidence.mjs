/**
 * Phase 4 visual evidence capture for the Spread 08 vertical slice.
 *
 * Deterministic captures (rest and response states) at the authored layouts
 * in Chromium and WebKit, plus a reduced-motion rest capture. Asserts the
 * composited state programmatically (layer counts, response layers, zero
 * external requests, natural image dimensions matching the manifest) and
 * saves screenshots to evidence/phase4 for human review of alpha edges,
 * seams, panel fit, and target alignment.
 *
 * Run:  node scripts/slice-evidence.mjs   (serves against BASE_URL, default
 * http://127.0.0.1:4173 — start `pnpm preview --host 127.0.0.1 --port 4173`
 * first, or set BASE_URL).
 */
import { mkdirSync } from 'node:fs';
import { chromium, webkit } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const OUT_DIR = 'evidence/phase4';

const LAYOUTS = [
  { name: 'ipad-landscape', width: 1180, height: 820 },
  { name: 'phone-portrait', width: 390, height: 844 },
];

const LAYER_COUNT = { rest: 7, response: 9 };
const IMAGE_SIZES = {
  'ipad-landscape': { width: 2048, height: 1536 },
  'phone-portrait': { width: 1080, height: 1920 },
};

mkdirSync(OUT_DIR, { recursive: true });

let chromiumBrowser;
let webkitBrowser;

async function openPage(browserType, layout) {
  const browser = browserType === chromium ? await ensureChromium() : await ensureWebkit();
  const context = await browser.newContext({
    viewport: { width: layout.width, height: layout.height },
  });
  const page = await context.newPage();
  const external = [];
  page.on('request', (request) => {
    if (!request.url().startsWith(BASE_URL)) {
      external.push(request.url());
    }
  });
  return { context, page, external };
}

async function ensureChromium() {
  chromiumBrowser ??= await chromium.launch();
  return chromiumBrowser;
}

async function ensureWebkit() {
  webkitBrowser ??= await webkit.launch();
  return webkitBrowser;
}

async function assertComposition(page, state, layout) {
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('img')).every(
      (image) => image.complete && image.naturalWidth > 0,
    ),
  );
  const result = await page.evaluate(
    ({ state }) => {
      const images = Array.from(document.querySelectorAll('img'));
      const layerOrder = images.map((image) => image.getAttribute('src'));
      const sizes = images.map((image) => ({ w: image.naturalWidth, h: image.naturalHeight }));
      return {
        heading: document.querySelector('h2')?.textContent ?? null,
        lampPresent: document.querySelector('[data-interactive][aria-label]') !== null,
        restLayerCount: images.filter((image) => !image.src.includes('fx-')).length,
        fxLayers: images.filter((image) => image.src.includes('fx-')).length,
        layerOrder,
        sizes,
        responseAnnouncement:
          state === 'response'
            ? Array.from(document.querySelectorAll('[aria-live="polite"]'))
                .map((n) => n.textContent)
                .join('')
            : null,
      };
    },
    { state, layout },
  );
  const imageCount = state === 'rest' ? LAYER_COUNT.rest : LAYER_COUNT.response;
  if (result.heading !== 'Share the Light') {
    throw new Error(`${state}: expected heading 'Share the Light', got '${result.heading}'`);
  }
  if (result.lampPresent !== true) {
    throw new Error(`${state}: lamp interaction target missing`);
  }
  if (result.restLayerCount + result.fxLayers !== imageCount) {
    throw new Error(
      `${state}: expected ${imageCount} layers, got rest=${result.restLayerCount} fx=${result.fxLayers}`,
    );
  }
  if (state === 'rest' && result.fxLayers !== 0) {
    throw new Error('rest: response layers must not be composited');
  }
  if (state === 'response' && result.fxLayers !== 2) {
    throw new Error(`response: expected 2 response layers, got ${result.fxLayers}`);
  }
  if (state === 'response' && !/glows? warm|hangat/i.test(result.responseAnnouncement ?? '')) {
    throw new Error('response: polite announcement missing');
  }
  for (const size of result.sizes) {
    if (size.w !== IMAGE_SIZES[layout].width || size.h !== IMAGE_SIZES[layout].height) {
      throw new Error(
        `${state}: natural size ${size.w}x${size.h} does not match authored ${IMAGE_SIZES[layout].width}x${IMAGE_SIZES[layout].height}`,
      );
    }
  }
  return result.layerOrder;
}

for (const engine of [chromium, webkit]) {
  for (const layout of LAYOUTS) {
    const { context, page, external } = await openPage(engine, layout);
    await page.goto(`${BASE_URL}/?preview=1`);
    await page.waitForSelector('h2');
    const restOrder = await assertComposition(page, 'rest', layout.name);
    await page.screenshot({ path: `${OUT_DIR}/${engine.name()}-${layout.name}-rest.png` });

    await page.getByRole('button', { name: 'Star lamp' }).click();
    await assertComposition(page, 'response', layout.name);
    await page.screenshot({ path: `${OUT_DIR}/${engine.name()}-${layout.name}-response.png` });

    if (external.length > 0) {
      throw new Error(`${engine.name()} ${layout.name}: external requests: ${external.join(', ')}`);
    }
    console.log(
      `${engine.name()} ${layout.name}: rest 7 layers [${restOrder.length}] -> response 9 layers, no external requests, natural sizes ok`,
    );
    await context.close();
  }
}

// Reduced-motion rest capture (chromium only; behavior identical in webkit).
{
  const { context, page, external } = await openPage(chromium, LAYOUTS[0]);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${BASE_URL}/?preview=1`);
  await page.waitForSelector('h2');
  await assertComposition(page, 'rest', LAYOUTS[0].name);
  await page.screenshot({ path: `${OUT_DIR}/chromium-ipad-landscape-rest-reduced-motion.png` });
  if (external.length > 0) {
    throw new Error(`reduced-motion: external requests: ${external.join(', ')}`);
  }
  console.log('chromium ipad-landscape reduced-motion: rest composition ok, no external requests');
  await context.close();
}

// Bilingual panel fit: Indonesian prose in the phone-portrait panel.
{
  const { context, page, external } = await openPage(webkit, LAYOUTS[1]);
  await page.goto(`${BASE_URL}/?preview=1&locale=id`);
  await page.waitForSelector('h2');
  const idInfo = await page.evaluate(() => ({
    heading: document.querySelector('h2')?.textContent ?? null,
    proseLength: document.querySelector('.prose')?.textContent?.length ?? 0,
    panelVisible:
      getComputedStyle(document.querySelector('.scene__panel--bottom')).display !== 'none',
  }));
  if (idInfo.heading !== 'Berbagi Cahaya' && idInfo.heading !== 'Share the Light') {
    throw new Error(`id locale: unexpected heading '${idInfo.heading}'`);
  }
  if (idInfo.proseLength === 0 || idInfo.panelVisible !== true) {
    throw new Error('id locale: prose or panel missing');
  }
  await page.screenshot({ path: `${OUT_DIR}/webkit-phone-portrait-id-panel.png` });
  if (external.length > 0) {
    throw new Error(`id capture: external requests: ${external.join(', ')}`);
  }
  console.log(`webkit phone-portrait id: panel fit capture ok (prose ${idInfo.proseLength} chars)`);
  await context.close();
}

console.log('Phase 4 evidence capture complete.');
