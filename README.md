# PDF Utilities

A browser based PDF tool site (merge, split, compress, then convert). The
search pages are static HTML; every tool runs in the visitor's browser, so
files never leave the device. The stack decision lives in
`docs/specs/0001-stack-and-architecture.md`.

Stack: Astro 7 (static output), TypeScript (strict), Tailwind CSS 4,
pdf-lib + PDF.js in Web Workers (installed per tool release), Cloudflare Pages
hosting, Vitest + Playwright, pnpm.

## Commands

| Command | Action |
| :------ | :----- |
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start the dev server at `localhost:4321` |
| `pnpm build` | Build the static site to `./dist/` |
| `pnpm preview` | Serve the build locally |
| `pnpm check` | Typecheck with `astro check` |
| `pnpm test` | Run the unit tests (Vitest) |
| `pnpm test:e2e` | Browser smoke flows against the build (Playwright) |
| `pnpm test:headers` | Same flows against `wrangler pages dev`, which applies `public/_headers` and `functions/` |

## Site URL

`SITE_URL` is the single source for every absolute URL (canonical tags, the
sitemap, robots.txt). Production and preview builds set it:

```sh
SITE_URL=https://example.com pnpm build
```

Local builds default to `http://localhost:4321`. Preview URLs must never be
submitted as the production canonical (see the spec's build conventions).

## Layout

```text
src/pages/        routes
src/components/   UI plus shared metadata and JSON-LD components
src/layouts/      page chrome
src/content/      content collections (tools now, variant pages later)
src/lib/pdf/      typed contract and helpers around the PDF workers
src/workers/      Web Worker entry points (merge, split, compress)
functions/        Cloudflare Pages Functions (/api shell)
public/           static assets, _headers with the security headers
tests/            Vitest unit tests
e2e/              Playwright flows
```

## Environment

Node is pinned in `.nvmrc` and `engines` (Node 24). Dependency versions are
exact (see `.npmrc`); the pnpm lockfile is committed.
