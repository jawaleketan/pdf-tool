import { describe, expect, it } from 'vitest';
import { canonicalPath } from '../src/config/site';

/**
 * Covers: environment and site URL convention (spec 0001 scaffold criteria).
 * The canonical form has no trailing slash, except the site root.
 */

describe('canonicalPath', () => {
  it('keeps the site root as a single slash', () => {
    expect(canonicalPath('/')).toBe('/');
    expect(canonicalPath('')).toBe('/');
  });

  it('strips trailing slashes from real paths', () => {
    expect(canonicalPath('/tools/merge/')).toBe('/tools/merge');
    expect(canonicalPath('/tools/merge///')).toBe('/tools/merge');
  });

  it('leaves inner slashes and the path itself untouched', () => {
    expect(canonicalPath('/tools/merge')).toBe('/tools/merge');
    expect(canonicalPath('/en/tools/split-pdf/')).toBe('/en/tools/split-pdf');
  });
});
