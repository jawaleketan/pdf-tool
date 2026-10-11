/** The site URL as defined at build time by astro.config.mjs (from SITE_URL). */
export const SITE_URL: string = import.meta.env.SITE_URL;

/** Canonical form used everywhere: no trailing slash, except the site root. */
export function canonicalPath(pathname: string): string {
  const withoutTrailingSlash = pathname.replace(/\/+$/, '');
  return withoutTrailingSlash === '' ? '/' : withoutTrailingSlash;
}
