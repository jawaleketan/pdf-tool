import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import astro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/',
      '.astro/',
      '.vercel/',
      '.wrangler/',
      'node_modules/',
      'test-results/',
      'playwright-report/',
      'coverage/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    // Node globals for the plain module configs at the root.
    files: ['*.config.mjs', 'astro.config.mjs'],
    languageOptions: { globals: { console: 'readonly', process: 'readonly' } },
  },
  // Prettier owns formatting, so it loads last and only turns rules off.
  prettier,
);
