import { expect, test } from '@playwright/test';

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
  expect(info.version).toBe('0.0.0');
});

test('renders the accessible application shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Aby Little Book' })).toBeVisible();
});
