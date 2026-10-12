// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// Lightweight mock adapter for local Windows builds (avoids @vercel/nft symlink EPERM)
const mockAdapter = {
  name: 'mock-adapter',
  hooks: {
    'astro:config:done': (/** @type {any} */ { setAdapter }) => {
      setAdapter({
        name: 'mock-adapter',
        serverEntrypoint: 'astro/app/node',
        supportedAstroFeatures: { serverOutput: 'stable', hybridOutput: true, sharp: true },
      });
    },
  },
};

// SITE_URL is the single source for every absolute URL (canonical tags, sitemap, robots).
const siteUrl = process.env.SITE_URL ?? 'http://localhost:4321';

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  adapter: process.env.VERCEL ? vercel() : mockAdapter,
  integrations: [sitemap()],
  vite: {
    define: {
      'import.meta.env.SITE_URL': JSON.stringify(siteUrl),
    },
    plugins: [tailwindcss()],
  },
});
