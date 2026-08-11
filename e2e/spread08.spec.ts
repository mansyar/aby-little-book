import { expect, test } from '@playwright/test';

// Spread 08 vertical slice journeys: rest state, lamp response ownership,
// keyboard navigation, ignored interaction, and the phone-portrait layout.

test.describe('Spread 08 preview slice', () => {
  test('renders the rest state on the iPad landscape layout', async ({ page }) => {
    await page.goto('/?preview=1');
    await expect(page.getByRole('heading', { level: 2, name: 'Share the Light' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Star lamp' })).toBeVisible();
    await expect(page.locator('img')).toHaveCount(7);
    await expect(page.locator('img[src*="fx-lamp-beam"]')).toHaveCount(0);
    await expect(page.locator('img[src*="fx-shared-glow"]')).toHaveCount(0);
  });

  test('activates the lamp response without navigating the page', async ({ page }) => {
    await page.goto('/?preview=1');
    await page.getByRole('button', { name: 'Star lamp' }).click();
    await expect(page.locator('img')).toHaveCount(9);
    await expect(page.locator('img[src*="fx-lamp-beam"]')).toHaveCount(1);
    await expect(page.locator('img[src*="fx-shared-glow"]')).toHaveCount(1);
    await expect(page.getByText('The lamp glows warm.')).toBeVisible();
    // The lamp tap stays on the interaction: the spread did not change.
    await expect(page.getByRole('heading', { level: 2, name: 'Share the Light' })).toBeVisible();
  });

  test('composes the phone-portrait layout for narrow viewports', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?preview=1');
    await expect(page.locator('.scene__panel--bottom')).toBeVisible();
    await expect(page.locator('img')).toHaveCount(7);
    await expect(page.getByRole('button', { name: 'Star lamp' })).toBeVisible();
  });

  test('navigates forward with the keyboard to the next bound scene', async ({ page }) => {
    await page.goto('/?preview=1');
    // Await the committed, focused reader before sending keys: React mounts
    // asynchronously, and a keystroke cannot precede the page a child sees.
    await expect(page.getByRole('heading', { level: 2, name: 'Share the Light' })).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('heading', { level: 2, name: 'The Warm Moon' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Star lamp' })).toHaveCount(0);
    await expect(page.locator('img')).toHaveCount(0);
  });

  test('keeps reading when the interaction is ignored', async ({ page }) => {
    await page.goto('/?preview=1');
    await expect(page.getByRole('heading', { level: 2, name: 'Share the Light' })).toBeVisible();
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('heading', { level: 2, name: 'Lumi' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Star lamp' })).toHaveCount(0);
    await expect(page.locator('img')).toHaveCount(0);
  });

  test('renders the slice under reduced motion', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/?preview=1');
    await expect(page.getByRole('heading', { level: 2, name: 'Share the Light' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Star lamp' })).toBeVisible();
    await context.close();
  });

  test('meets touch target and landmark semantics', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?preview=1');
    await expect(page.getByRole('heading', { level: 2, name: 'Share the Light' })).toBeVisible();
    // The scene section is named by its heading (aria-labelledby), and the
    // lamp target is a real button with an accessible name.
    const labelledBy = await page
      .locator('section')
      .evaluate((section) => section.getAttribute('aria-labelledby'));
    await expect(page.locator(`#${labelledBy}`)).toHaveText('Share the Light');
    // Touch targets are comfortably above the 44x44 CSS pixel minimum.
    const box = await page.getByRole('button', { name: 'Star lamp' }).boundingBox();
    if (box === null) {
      throw new Error('lamp target has no bounding box');
    }
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    // Focus is presentable: word controls and the lamp are reachable with
    // Tab alone. Chromium has speech synthesis (word buttons come first);
    // WebKit headless does not, so words render as plain text and the lamp
    // is the first focusable — both orders must reach the lamp.
    const wordButtons = page.getByRole('button', { name: /Lumi/ });
    const lamp = page.getByRole('button', { name: 'Star lamp' });
    await page.keyboard.press('Tab');
    if ((await wordButtons.count()) > 0) {
      await expect(wordButtons.first()).toBeFocused();
    }
    for (
      let i = 0;
      i < 5 && !(await lamp.evaluate((el) => el === document.activeElement));
      i += 1
    ) {
      await page.keyboard.press('Tab');
    }
    await expect(lamp).toBeFocused();
  });
});
