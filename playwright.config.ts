import { defineConfig } from '@playwright/test';

/**
 * Two ways to run the browser flows:
 *   pnpm test:e2e      serves the build with `astro preview` (fast, no headers)
 *   pnpm test:headers  serves the build with `wrangler pages dev`, which applies
 *                      public/_headers and the functions/ routes, close to production
 */
const useHeaders = process.env.HEADERS === '1';
const port = useHeaders ? 8788 : 4321;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  use: {
    baseURL: `http://localhost:${port}`,
  },
  webServer: useHeaders
    ? {
        command: 'pnpm exec wrangler pages dev dist --port 8788',
        port,
        reuseExistingServer: false,
        timeout: 120_000,
      }
    : {
        command: 'pnpm preview',
        port,
        reuseExistingServer: false,
        timeout: 120_000,
      },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
