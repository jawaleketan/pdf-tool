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

test('the head carries canonical, social, and structured data for search engines', async ({ page }) => {
  await page.goto('/');

  // The preview build uses the default site URL, and the site root keeps its slash.
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'http://localhost:4321/',
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    'content',
    'http://localhost:4321/',
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /never leave your device/);

  const jsonLd = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ?? '',
  );
  expect(jsonLd).toMatchObject({ '@type': 'WebSite', name: 'PDF Utilities' });
});
