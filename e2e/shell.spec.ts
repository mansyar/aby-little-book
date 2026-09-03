import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

// The served version must track the release version in package.json; a
// hardcoded expectation goes stale on every bump (as 0.0.0 did at v0.1.0).
const { version: packageVersion } = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
) as { version: string };

test('serves the static health endpoint', async ({ request }) => {
  const response = await request.get('/healthz');
  expect(response.ok()).toBe(true);
  expect((await response.text()).trim()).toBe('ok');
});

test('serves generated version output', async ({ request }) => {
  const response = await request.get('/version.json');
  expect(response.ok()).toBe(true);
  const info = (await response.json()) as {
    name: string;
    version: string;
  };
  expect(info.name).toBe('aby-little-book');
  expect(info.version).toBe(packageVersion);
});

test('renders the accessible application shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Aby Little Book' })).toBeVisible();
});
