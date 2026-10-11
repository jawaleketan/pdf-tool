import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

/**
 * Covers: environment and site URL convention (spec 0001 scaffold criteria).
 *
 * The endpoint reads SITE_URL through src/config/site at module load, so the
 * env is stubbed first and the module imported afterwards.
 */

describe('robots.txt endpoint', () => {
  beforeAll(() => {
    vi.stubEnv('SITE_URL', 'https://example.com');
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it('points the sitemap line at the site URL the build was given', async () => {
    const { GET } = await import('../src/pages/robots.txt');

    const response = (GET as unknown as () => Response)();
    const body = await response.text();

    expect(body).toContain('Sitemap: https://example.com/sitemap-index.xml');
  });

  it('allows every user agent and answers as plain text', async () => {
    const { GET } = await import('../src/pages/robots.txt');

    const response = (GET as unknown as () => Response)();

    expect(await response.text()).toContain('User-agent: *');
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
  });
});
