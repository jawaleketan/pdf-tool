import { expect, test } from '@playwright/test';

const useHeaders = process.env.HEADERS === '1';

test.describe('production headers (pnpm test:headers)', () => {
  test.skip(!useHeaders, 'These checks need the wrangler served build (pnpm test:headers).');

  test('home page carries the security headers and the worker rule', async ({ request }) => {
    const response = await request.get('/');
    expect(response.ok()).toBe(true);

    const headers = response.headers();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['content-security-policy']).toContain("worker-src 'self' blob:");
  });

  test('the api health shell answers', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBe(true);
    expect(await response.json()).toMatchObject({ ok: true, service: 'pdf-utilities' });
  });
});
