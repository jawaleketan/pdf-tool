import { expect, test } from '@playwright/test';

test('home page renders the tool list and the worker answers', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('PDF Utilities');
  await expect(page.getByRole('heading', { name: 'Merge PDFs' })).toBeVisible();
  await expect(page.locator('[data-worker-probe]')).toContainText('Worker running.');
});

test('robots.txt points at the sitemap', async ({ request }) => {
  const response = await request.get('/robots.txt');
  expect(response.ok()).toBe(true);
  expect(await response.text()).toContain('Sitemap: ');
});
