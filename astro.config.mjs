// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// SITE_URL is the single source for every absolute URL (canonical tags, sitemap, robots).
// Production builds set it to the production domain; previews set it to the preview URL.
// Local default matches the dev server.
const siteUrl = process.env.SITE_URL ?? 'http://localhost:4321';

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  integrations: [sitemap()],
  vite: {
    define: {
      'import.meta.env.SITE_URL': JSON.stringify(siteUrl),
    },
    plugins: [tailwindcss()],
  },
});
