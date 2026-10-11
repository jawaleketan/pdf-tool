import { describe, expect, it } from 'vitest';
import { onRequestGet } from '../functions/api/health';

/**
 * Covers: header check convention, the /api area server shape (spec 0001).
 * Cloudflare Pages serves functions/ directly, so the handler is the testable
 * surface; e2e/headers.spec.ts proves the served route under wrangler.
 */

describe('the /api/health handler', () => {
  it('answers 200 with the service shape the server area promises', async () => {
    const response = await onRequestGet();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, service: 'pdf-utilities' });
  });

  it('declares itself JSON', async () => {
    const response = await onRequestGet();

    expect(response.headers.get('content-type')).toContain('application/json');
  });
});
