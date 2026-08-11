// Phase 6 Task 4: full application journeys in real browsers. These are the
// acceptance-level journeys: first launch -> preparation -> reading -> route
// choice -> completion -> replay, Continue after close/reload, caregiver
// settings + protected reset, and phone/desktop adaptations. Preparation is
// real (fetches dist assets), so the preview server must be running the
// production build (playwright config already starts `pnpm preview`).

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

// Fresh book: Prepare runs the real bounded download, then the reader opens
// directly at S01 (preparation-ready carries the session).
async function prepareBook(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Prepare the book' })).toBeVisible();
  await page.getByRole('button', { name: 'Prepare the book' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'A Tiny Signal' })).toBeVisible({
    timeout: 20000,
  });
}

async function completeRoute(
  page: Page,
  route: 'Asteroid Garden' | 'Singing Starfield',
): Promise<void> {
  const intermediateTitles =
    route === 'Asteroid Garden'
      ? [
          'The Glowing Garden',
          'The Winding Gap',
          'Lights Point Ahead',
          'Lumi',
          'Share the Light',
          'The Warm Moon',
        ]
      : [
          'The Singing Stars',
          'The Steady Song',
          'A Note Far Away',
          'Lumi',
          'Share the Light',
          'The Warm Moon',
        ];
  const heading = page.getByRole('heading', { level: 2 }).first();
  // Press ArrowRight until the expected spread title is reached. Each press
  // is spaced 400ms (reader's 250ms transition lock), and a dropped press
  // (slow parallel workers, WebKit jank) self-heals on the next attempt.
  async function advanceTo(title: string): Promise<void> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      if ((await heading.textContent()) === title) return;
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(400);
    }
    await expect(heading).toHaveText(title, { timeout: 10000 });
  }

  // S01 -> S02 -> S03 (route choice).
  await advanceTo('The Star Lamp');
  await advanceTo('Two Ways Through Space');
  await page.getByRole('button', { name: route }).click();
  // S04..S09, then the final press arrives at S10 and the app flips to the
  // completion view.
  for (const title of intermediateTitles) {
    await advanceTo(title);
  }
  await advanceTo('Lumi Shines Again');
  await expect(page.getByRole('heading', { level: 1, name: 'The Starlight Rescue' })).toBeVisible({
    timeout: 10000,
  });
}

test.describe('application journeys', () => {
  test.beforeEach(async ({ page }) => {
    // IndexedDB requires a same-origin document; evaluate after first load.
    await page.goto('/');
    await resetState(page);
  });

  test('first launch: prepare, choose a route, and complete', async ({ page }) => {
    await prepareBook(page);
    await completeRoute(page, 'Asteroid Garden');
    await expect(
      page.getByRole('heading', { level: 1, name: 'The Starlight Rescue' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Lumi Shines Again' })).toBeVisible();
  });

  test('second route stays discoverable after replay', async ({ page }) => {
    await prepareBook(page);
    await completeRoute(page, 'Asteroid Garden');
    // Replay: fresh session, alternate route.
    await page.getByRole('button', { name: /Read the story again/ }).click();
    await expect(page.getByRole('button', { name: 'Begin' })).toBeVisible();
    await page.getByRole('button', { name: 'Begin' }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'A Tiny Signal' })).toBeVisible({
      timeout: 20000,
    });
    await completeRoute(page, 'Singing Starfield');
    await expect(page.getByRole('heading', { level: 2, name: 'Lumi Shines Again' })).toBeVisible();
  });

  test('Continue restores progress after closing and after reload', async ({ page }) => {
    await prepareBook(page);
    // Move to S02, then close the book with Escape (close-reader saves).
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(320);
    await expect(page.getByRole('heading', { level: 2, name: 'The Star Lamp' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Continue reading' })).toBeVisible();
    // Reload proves the progress survived a restart.
    await page.reload();
    await expect(page.getByRole('button', { name: 'Continue reading' })).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole('button', { name: 'Continue reading' }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'The Star Lamp' })).toBeVisible();
  });

  test('caregiver flow: gate, settings, protected reset', async ({ page }) => {
    await prepareBook(page);
    // Return to the shelf (progress exists, so the card offers Continue).
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Continue reading' })).toBeVisible();
    await page.getByRole('button', { name: 'For grown-ups' }).click();
    await expect(page.getByRole('dialog', { name: 'For grown-ups' })).toBeVisible();
    await page.getByRole('button', { name: /open grown-up settings/i }).click();
    await expect(page.getByRole('dialog', { name: 'Grown-up settings' })).toBeVisible();
    // Switch language to Indonesian.
    await page.getByRole('button', { name: 'Bahasa Indonesia' }).click();
    // Close via the stable class (label switches to 'Tutup pengaturan dewasa' after locale change).
    await page.locator('button.caregiver-controls__close').click();
    await expect(page.getByRole('heading', { level: 1, name: 'Aby Little Book' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Lanjutkan membaca' })).toBeVisible();
    // Protected reset: consequences stated, explicit erase, everything cleared.
    await page.getByRole('button', { name: 'Untuk orang dewasa' }).click();
    await page.getByRole('button', { name: /buka pengaturan/i }).click();
    await page.getByRole('button', { name: 'Mulai buku dari awal' }).click();
    await expect(page.getByRole('dialog', { name: 'Mulai buku dari awal' })).toBeVisible();
    await page.getByRole('button', { name: 'Hapus semuanya' }).click();
    await expect(page.getByRole('button', { name: 'Siapkan bukunya' })).toBeVisible();
  });

  test('phone portrait and desktop adaptations render the reader', async ({ page }) => {
    await prepareBook(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole('heading', { level: 2, name: 'A Tiny Signal' })).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.getByRole('heading', { level: 2, name: 'A Tiny Signal' })).toBeVisible();
  });
});
