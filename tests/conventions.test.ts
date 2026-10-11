import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Covers: versions and pinning convention (spec 0001 build conventions).
 * Exact pins everywhere, one package manager, one Node major shared by
 * .nvmrc and engines.
 */

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  engines: { node: string };
  packageManager: string;
};

const allDependencies = { ...pkg.dependencies, ...pkg.devDependencies };

describe('versions and pinning', () => {
  it('pins every dependency to an exact version', () => {
    const ranged = Object.entries(allDependencies).filter(([, version]) =>
      /^[\^~]|^\s*[<>=*]| - |x/.test(version),
    );

    expect(ranged).toEqual([]);
  });

  it('pins the package manager to an exact pnpm version', () => {
    expect(pkg.packageManager).toMatch(/^pnpm@\d+\.\d+\.\d+$/);
  });

  it('asks for the same Node major that .nvmrc pins', () => {
    const nvmrc = readFileSync(new URL('../.nvmrc', import.meta.url), 'utf8').trim();
    const engines = pkg.engines.node;

    expect(nvmrc).toMatch(/^\d+$/);
    expect(engines).toContain(`>=${nvmrc}.`);
    expect(engines).toContain(`<${Number(nvmrc) + 1}`);
  });
});
