/**
 * Health route: the empty shell of the reserved /api area (spec 0001).
 * Cloudflare Pages serves this from functions/ at deploy time; the converter
 * (Release 5) and the public API (Release 9) add their routes beside it.
 */
export const onRequestGet = (): Promise<Response> =>
  Promise.resolve(
    Response.json({
      ok: true,
      service: 'pdf-utilities',
    }),
  );
