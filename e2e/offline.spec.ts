import { expect, test } from '@playwright/test';
import { PACKAGE_CACHE_NAME } from '../src/offline/swRoutes';
import { SPREAD08_BASE_PATH, SPREAD08_MANIFEST } from '../src/story/spread08';

// Offline journeys: the service worker precaches the shell; prepared story
// packages are served from the verified cache only; IndexedDB progress
// survives reload; missing assets fail honestly instead of faking readiness.

const DB_NAME = 'aby-little-book-e2e';

async function waitForSw(
  page: import('@playwright/test').Page,
  path = '/?preview=1',
): Promise<void> {
  await page.goto(path);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // A page is controlled only after the next load; reload once while online
  // so the worker (not the network) owns the document before going offline.
  if (!(await page.evaluate(() => navigator.serviceWorker.controller !== null))) {
    await page.reload();
  }
  await expect
    .poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null))
    .toBe(true);
}

test.describe('offline journeys', () => {
  test('serves the shell offline through the precached service worker', async ({
    page,
    context,
  }) => {
    // Playwright's WebKit offline simulation does not consult the service
    // worker (a trivial stamping worker is bypassed; offline reload crashes
    // the engine). Real WebKit offline behavior is covered by the physical
    // iPad journey in the track plan.
    test.skip(
      test.info().project.name === 'webkit',
      'WebKit offline simulation bypasses service workers',
    );
    await waitForSw(page, '/');
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: 'Aby Little Book' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Prepare the book' })).toBeVisible();
  });

  test('serves prepared package assets offline from the verified cache', async ({
    page,
    context,
  }) => {
    test.skip(
      test.info().project.name === 'webkit',
      'WebKit offline simulation bypasses service workers',
    );
    await waitForSw(page);
    const origin = new URL(page.url()).origin;
    const result = await page.evaluate(
      async ({ manifest, basePath, cacheName, origin: source }) => {
        const cache = await caches.open(cacheName);
        const failures: string[] = [];
        for (const asset of manifest) {
          const response = await fetch(`${basePath}/${asset.src}`);
          const buffer = await response.arrayBuffer();
          const digest = await crypto.subtle.digest('SHA-256', buffer);
          const hex = Array.from(new Uint8Array(digest))
            .map((byte) => byte.toString(16).padStart(2, '0'))
            .join('');
          if (hex !== asset.sha256) {
            failures.push(asset.src);
            continue;
          }
          await cache.put(
            new Request(`${source}${basePath}/${asset.src}`),
            new Response(buffer, { status: 200, headers: { 'Content-Type': 'image/webp' } }),
          );
        }
        return { failures, cached: (await cache.keys()).length };
      },
      {
        manifest: SPREAD08_MANIFEST.assets,
        basePath: SPREAD08_BASE_PATH,
        cacheName: PACKAGE_CACHE_NAME,
        origin,
      },
    );
    expect(result.failures).toEqual([]);
    expect(result.cached).toBe(18);

    await context.setOffline(true);
    const fetchResult = await page.evaluate(async (basePath) => {
      try {
        const response = await fetch(`${basePath}/assets/layers/ipad-landscape/bg-space.webp`);
        return { ok: response.ok, status: response.status };
      } catch {
        return { ok: false, status: 0 };
      }
    }, SPREAD08_BASE_PATH);
    expect(fetchResult).toEqual({ ok: true, status: 200 });
  });

  test('reports missing package assets offline instead of false success', async ({
    page,
    context,
  }) => {
    await waitForSw(page);
    await context.setOffline(true);
    const result = await page.evaluate(async (basePath) => {
      try {
        const response = await fetch(
          `${basePath}/assets/layers/ipad-landscape/never-prepared.webp`,
        );
        return { ok: response.ok, status: response.status };
      } catch {
        return { ok: false, status: 0 };
      }
    }, SPREAD08_BASE_PATH);
    // No cache entry exists: the request must fail, never fabricate a body.
    expect(result).toEqual({ ok: false, status: 0 });
  });

  test('restores persisted progress after reload', async ({ page }) => {
    await waitForSw(page);
    const progress = {
      storyId: 'the-starlight-rescue',
      astronautId: 'maya',
      locale: 'en',
      currentSpreadId: 'B04',
      route: 'singing-starfield',
      history: ['S01', 'S02', 'S03', 'B04'],
      completed: false,
      savedAt: Date.now(),
    };

    const putProgress = async (record: unknown): Promise<void> => {
      await page.evaluate(
        async ({ dbName, value }) => {
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open(dbName, 1);
            request.onupgradeneeded = () => {
              const database = request.result;
              if (!database.objectStoreNames.contains('settings')) {
                database.createObjectStore('settings', { keyPath: 'id' });
              }
              if (!database.objectStoreNames.contains('progress')) {
                database.createObjectStore('progress', { keyPath: 'storyId' });
              }
              if (!database.objectStoreNames.contains('completion')) {
                database.createObjectStore('completion', { keyPath: 'id' });
              }
              if (!database.objectStoreNames.contains('packageState')) {
                database.createObjectStore('packageState', { keyPath: 'packageId' });
              }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
          await new Promise<void>((resolve, reject) => {
            const transaction = db.transaction('progress', 'readwrite');
            transaction.objectStore('progress').put(value);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
          });
          db.close();
        },
        { dbName: DB_NAME, value: record },
      );
    };

    await putProgress(progress);
    await page.reload();
    const restored = await page.evaluate(async (dbName) => {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const record = await new Promise<unknown>((resolve, reject) => {
        const transaction = db.transaction('progress', 'readonly');
        const get = transaction.objectStore('progress').get('the-starlight-rescue');
        get.onsuccess = () => resolve(get.result);
        get.onerror = () => reject(get.error);
      });
      db.close();
      return record;
    }, DB_NAME);
    expect(restored).toMatchObject({
      currentSpreadId: 'B04',
      route: 'singing-starfield',
      history: ['S01', 'S02', 'S03', 'B04'],
      completed: false,
    });

    // Cleanup: the Continue journey lives in Phase 6 UI; the engine's
    // fromSnapshot round-trip is covered by the state evidence harness.
    await page.evaluate(async (dbName) => {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('progress', 'readwrite');
        transaction.objectStore('progress').delete('the-starlight-rescue');
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
      db.close();
    }, DB_NAME);
  });
});
