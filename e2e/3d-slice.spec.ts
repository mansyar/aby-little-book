import { expect, test } from '@playwright/test';

// Slice proof: the real guided engine, real GLB package, and real hotspot
// plumbing working together in a browser over the scene-preview harness
// (entry via /?scene=S01). The full bookshelf composition lands in Phase 6;
// this spec proves the slice is real, responsive, and honest offline.
//
// Offline honesty: the shell, prose, poster, and Draco decoder ride the
// precache, so they survive a disconnect. GLB bytes offline wait on the
// Phase 6 public package layout (stable /stories/* paths); the offline test
// below asserts exactly the precached surface and no more.

test.describe('3D slice', () => {
  test('renders S01 prose with a labelled hotspot', async ({ page }) => {
    await page.goto('/?scene=S01&locale=en&beat=rest');
    await expect(page.getByRole('heading', { name: 'Lanterns on the Water' })).toBeVisible();
    await expect(page.getByText('A small boat sways by the dock.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Boat' })).toBeVisible();
  });

  test('guided tap answers glow plus word', async ({ page }) => {
    await page.goto('/?scene=S01&locale=id&beat=rest');
    await page.getByRole('button', { name: 'Perahu' }).click();
    await expect(page.getByRole('button', { name: 'Perahu' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByRole('status')).toContainText('Perahu');
  });

  test('the S04 choice opens the reed-channel route at A05', async ({ page }) => {
    await page.goto('/?scene=S04&locale=en&beat=rest');
    await expect(page.getByRole('heading', { name: 'Which Way Across?' })).toBeVisible();
    await page.getByRole('button', { name: 'Reed Channel' }).click();
    await expect(page.getByRole('heading', { name: 'Tall Reeds' })).toBeVisible();
  });

  test('the lily-cove route renders B05 with its turtle tap', async ({ page }) => {
    await page.goto('/?scene=B05&route=lily-cove&locale=en&beat=rest');
    await expect(page.getByRole('heading', { name: 'Lily Pads' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Turtle' })).toBeVisible();
  });

  test('both routes converge and share the S10 ending', async ({ page }) => {
    await page.goto('/?scene=S10&locale=en&beat=rest');
    await expect(page.getByRole('heading', { name: 'Home by Lantern Light' })).toBeVisible();
    await page.goto('/?scene=S10&route=lily-cove&locale=id&beat=rest');
    await expect(page.getByRole('heading', { name: 'Pulang Diterangi Lentera' })).toBeVisible();
  });

  test('rest and response stills are deterministic', async ({ page }) => {
    await page.goto('/?scene=S01&locale=en&beat=rest');
    await expect(page.getByRole('heading', { name: 'Lanterns on the Water' })).toBeVisible();
    // The scene still is only deterministic once the staged models decode;
    // blank-canvas captures would lock in a loading frame.
    await page.locator('canvas[data-scene="ready"]').waitFor({ timeout: 30_000 });
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('slice-S01-rest.png', { maxDiffPixels: 200 });
    await page.goto('/?scene=S01&locale=en&beat=arrive');
    await expect(page.getByRole('heading', { name: 'Lanterns on the Water' })).toBeVisible();
    await page.locator('canvas[data-scene="ready"]').waitFor({ timeout: 30_000 });
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('slice-S01-response.png', { maxDiffPixels: 200 });
  });

  test('poster fallback carries the story without WebGL', async ({ browser }) => {
    const context = await browser.newContext();
    await context.addInitScript(() => {
      // Deterministic WebGL absence: the probe sees no context factory.
      Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
        value: () => null,
      });
    });
    const page = await context.newPage();
    await page.goto('/?scene=S01&locale=en&beat=rest');
    await expect(page.getByRole('img', { name: 'Lanterns on the Water' })).toBeVisible();
    await expect(page.getByText('A small boat sways by the dock.')).toBeVisible();
    await page.getByRole('button', { name: 'Boat' }).click();
    await expect(page.getByRole('status')).toContainText('Boat');
    await context.close();
  });

  test('reduced motion still holds a calm frame', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/?scene=S01&locale=en&beat=arrive');
    await expect(page.getByRole('heading', { name: 'Lanterns on the Water' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Boat' })).toBeVisible();
    await context.close();
  });

  test('portrait phone layout keeps prose and taps reachable', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto('/?scene=S01&locale=en&beat=rest');
    await expect(page.getByRole('heading', { name: 'Lanterns on the Water' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Boat' })).toBeVisible();
    await context.close();
  });

  test('precached shell survives offline', async ({ page, context }) => {
    // Playwright's WebKit offline simulation bypasses service workers; real
    // WebKit offline behavior is covered by the physical iPad journey.
    test.skip(
      test.info().project.name === 'webkit',
      'WebKit offline simulation bypasses service workers',
    );
    await page.goto('/?scene=S01&locale=en&beat=rest');
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    if (!(await page.evaluate(() => navigator.serviceWorker.controller !== null))) {
      await page.reload();
    }
    await expect
      .poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null))
      .toBe(true);
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Lanterns on the Water' })).toBeVisible();
    await expect(page.getByText('A small boat sways by the dock.')).toBeVisible();
  });
});
