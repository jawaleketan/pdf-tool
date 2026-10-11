import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';

/**
 * Covers: scaffold done criteria and performance budget convention
 * (spec 0001 build conventions). Runs against dist/, so it needs a build
 * first; CI builds before it tests, and the suite skips these checks on a
 * tree that has no build yet.
 */

const distDir = fileURLToPath(new URL('../dist', import.meta.url));
const hasDist = existsSync(distDir);
const describeBuild = describe.skipIf(!hasDist);

describeBuild('the build output (run pnpm build first)', () => {
  it('emits the pages, metadata, and header rules the site needs', () => {
    for (const file of ['index.html', 'robots.txt', 'sitemap-index.xml', '_headers']) {
      expect(existsSync(join(distDir, file)), `${file} missing from dist/`).toBe(true);
    }
  });

  it('bundles each tool worker as its own real file', () => {
    const astroDir = join(distDir, '_astro');
    const scripts = existsSync(astroDir) ? readdirSync(astroDir) : [];
    const workerFiles = scripts.filter((file) => file.endsWith('.js') && file.includes('worker'));

    expect(workerFiles.length).toBeGreaterThanOrEqual(3);
    for (const tool of ['merge', 'split', 'compress']) {
      expect(
        workerFiles.some((file) => file.includes(tool)),
        `no bundled ${tool} worker in dist/_astro`,
      ).toBe(true);
    }
  });

  it('keeps the shipped JavaScript under the 51,200 byte budget, gzipped', () => {
    const astroDir = join(distDir, '_astro');
    let total = 0;

    for (const file of readdirSync(astroDir)) {
      if (file.endsWith('.js') && !file.endsWith('.map')) {
        total += gzipSync(readFileSync(join(astroDir, file))).length;
      }
    }

    const html = readFileSync(join(distDir, 'index.html'), 'utf8');
    for (const match of html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)) {
      total += gzipSync(Buffer.from(match[1])).length;
    }

    expect(total).toBeLessThan(51_200);
  });
});
