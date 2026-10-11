import type { APIRoute } from 'astro';
import { SITE_URL } from '../config/site';

/**
 * robots.txt generated at build time so the sitemap line carries the real
 * production URL (spec 0001, environment and site URL convention).
 */
export const GET: APIRoute = () => {
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${new URL('/sitemap-index.xml', SITE_URL).toString()}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
