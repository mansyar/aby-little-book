// Phase 6 Task 2: dock family journeys in real browsers. Acceptance-level
// flows over the Starlit Dock: first launch -> preparation -> boarding ->
// route choice -> completion -> replay, Continue after close/reload,
// caregiver settings + protected reset, and phone/desktop adaptations.
// Preparation is real (fetches dist/stories/* published by postbuild), so
// the preview server must run the production build (playwright config
// already starts `pnpm preview`).

import { expect, type Page, test } from '@playwright/test';

const DB_NAME = 'aby-little-book-e2e';

async function resetState(page: Page): Promise<void> {
  await page.evaluate(async (dbName) => {
    const open = indexedDB.open(dbName, 1);
    await new Promise<void>((resolve, reject) => {
      open.onupgradeneeded = () => {
        for (const name of ['settings', 'progress', 'completion', 'packageState']) {
          if (!open.result.objectStoreNames.contains(name)) {
            open.result.createObjectStore(name, {
              keyPath: name === 'progress' ? 'storyId' : 'id',
            });
          }
        }
      };
      open.onsuccess = () => {
        open.result.close();
        resolve();
      };
      open.onerror = () => reject(open.error);
    });
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(dbName);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    for (const name of ['settings', 'progress', 'completion', 'packageState']) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(name, 'readwrite');
        tx.objectStore(name).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
    db.close();
  }, DB_NAME);
}

// Fresh book: the real bounded download runs, then the reader opens at S01.
// S01 holds Next until the boat tap commits (tap-to-board entry), so the
// journey boards explicitly like a child would.
async function prepareBoat(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Prepare the boat' })).toBeVisible();
  await page.getByRole('button', { name: 'Prepare the boat' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Lanterns on the Water' })).toBeVisible({
    timeout: 20000,
  });
  await page.getByRole('button', { name: 'Boat' }).click();
  await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
}

async function completeRoute(page: Page, route: 'Reed Channel' | 'Lily Cove'): Promise<void> {
  const heading = page.getByRole('heading', { level: 1 });
  const routeTitles =
    route === 'Reed Channel' ? ['Tall Reeds', 'Shared Light'] : ['Lily Pads', 'Cake Crumbs'];

  async function advanceTo(title: string): Promise<void> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      if ((await heading.textContent()) === title) return;
      await page.getByRole('button', { name: 'Next' }).click();
      await page.waitForTimeout(300);
    }
    await expect(heading).toHaveText(title, { timeout: 10000 });
  }

  // S01 -> S02 -> S03. The cake tap is optional but proves glow-plus-word.
  await advanceTo('A Shy New Friend');
  await advanceTo('Half for You');
  await page.getByRole('button', { name: 'Cake' }).click();
  await expect(page.getByRole('status')).toContainText('Cake');
  await advanceTo('Which Way Across?');
  await page.getByRole('button', { name: route }).click();
  for (const title of routeTitles) {
    await advanceTo(title);
  }
  // S08 -> S10, then Finish flips to the calm completion view.
  await advanceTo('The Other Shore');
  await advanceTo('Home by Lantern Light');
  await page.getByRole('button', { name: 'Finish' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'The Lantern Glows On' })).toBeVisible({
    timeout: 10000,
  });
}

test.describe('dock journeys', () => {
  test.beforeEach(async ({ page }) => {
    // IndexedDB requires a same-origin document; evaluate after first load.
    await page.goto('/');
    await resetState(page);
  });

  test('first launch: prepare, choose a route, and complete', async ({ page }) => {
    await prepareBoat(page);
    await completeRoute(page, 'Reed Channel');
    await expect(page.getByRole('heading', { level: 1, name: 'The Sharing Tide' })).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'The Lantern Glows On' }),
    ).toBeVisible();
  });

  test('second route stays discoverable after replay', async ({ page }) => {
    await prepareBoat(page);
    await completeRoute(page, 'Reed Channel');
    // Replay: straight back into the reader with a fresh session.
    await page.getByRole('button', { name: 'Float the story again' }).click();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Lanterns on the Water' }),
    ).toBeVisible({ timeout: 20000 });
    await page.getByRole('button', { name: 'Boat' }).click();
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
    await completeRoute(page, 'Lily Cove');
    await expect(
      page.getByRole('heading', { level: 2, name: 'The Lantern Glows On' }),
    ).toBeVisible();
  });

  test('Keep floating restores progress after closing and after reload', async ({ page }) => {
    await prepareBoat(page);
    // Move to S02, then close the book with Escape (close-reader saves).
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'A Shy New Friend' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Keep floating' })).toBeVisible();
    // Reload proves the progress survived a restart.
    await page.reload();
    await expect(page.getByRole('button', { name: 'Keep floating' })).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole('button', { name: 'Keep floating' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'A Shy New Friend' })).toBeVisible();
  });

  test('grown-ups door: gate, settings, protected reset', async ({ page }) => {
    await prepareBoat(page);
    // Return to the dock (progress exists, so the card offers continuation).
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Keep floating' })).toBeVisible();
    await page.getByRole('button', { name: 'For grown-ups' }).click();
    await expect(page.getByRole('dialog', { name: 'For grown-ups' })).toBeVisible();
    await page.getByRole('button', { name: /open grown-up settings/i }).click();
    await expect(page.getByRole('dialog', { name: 'Grown-up settings' })).toBeVisible();
    // Switch language to Indonesian.
    await page.getByRole('button', { name: 'Bahasa Indonesia' }).click();
    // Close via the stable class (label switches to ID after locale change).
    await page.locator('button.caregiver-controls__close').click();
    await expect(page.getByRole('heading', { level: 1, name: 'Aby Little Book' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Lanjut berlayar' })).toBeVisible();
    // Protected reset: consequences stated, explicit erase, everything cleared.
    await page.getByRole('button', { name: 'Untuk orang dewasa' }).click();
    await page.getByRole('button', { name: /buka pengaturan/i }).click();
    await page.getByRole('button', { name: 'Mulai buku dari awal' }).click();
    await expect(page.getByRole('dialog', { name: 'Mulai buku dari awal' })).toBeVisible();
    await page.getByRole('button', { name: 'Hapus semuanya' }).click();
    await expect(page.getByRole('button', { name: 'Siapkan perahu' })).toBeVisible();
  });

  test('phone portrait and desktop adaptations render the reader', async ({ page }) => {
    await prepareBoat(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(
      page.getByRole('heading', { level: 1, name: 'Lanterns on the Water' }),
    ).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(
      page.getByRole('heading', { level: 1, name: 'Lanterns on the Water' }),
    ).toBeVisible();
  });
});
