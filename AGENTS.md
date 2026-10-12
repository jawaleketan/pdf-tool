# PDF Utilities

A browser based PDF tool site: merge, split, compress, then convert. Search
traffic is the growth engine, ads are the money.

## Stack

- **Language / Runtime**: TypeScript in strict mode (`astro/tsconfigs/strict`), Node 24 (pinned in `.nvmrc` and `engines`)
- **Framework**: Astro 7, static output, one island per tool
- **Key dependencies**: pdf-lib + PDF.js (inside Web Workers only), Tailwind CSS 4, @astrojs/sitemap
- **Package manager**: pnpm 11 (exact versions via `save-exact`, lockfile committed)

## Build approach

**Skateboard**: ship the thinnest usable whole first, then grow it release by release; every release is live and shippable. (From `docs/scope/scope.md`.)

## Commands

```bash
pnpm install        # install dependencies
pnpm dev            # dev server (add --background; then stop/status/logs)
pnpm build          # static build to dist/
pnpm preview        # serve the build
pnpm check          # typecheck (astro check)
pnpm lint           # ESLint (ts, astro, configs)
pnpm format         # Prettier write; format:check for CI
pnpm test           # Vitest unit tests
pnpm test:e2e       # Playwright flows against the build
pnpm test:headers   # same flows under wrangler pages dev (applies _headers and functions/)
```

# CLAUDE.md

This project's context for all AI tools lives in [AGENTS.md](./AGENTS.md).
Claude Code loads it via the import below:

@AGENTS.md

## Rules

- `SITE_URL` is the single source for every absolute URL (canonical, sitemap, robots); no trailing slash except the site root.
- PDF libraries load only inside Web Workers, never on content pages; every worker speaks the one typed contract in `src/lib/pdf/messages.ts`.
- Landing and variant pages ship under 50 KB of JavaScript gzipped; `tests/build-output.test.ts` guards the budget and the per worker bundles.
- Exact dependency versions only; Node stays pinned in `.nvmrc` and `engines` together.
- Every page carries title, description, canonical, and JSON-LD from `src/components/SeoHead.astro`.
- Browsers without Web Worker support get a clear "not supported" message; heavy work never runs on the main thread.

## Specs

Stored in `docs/specs/` (the stack decision: `0001-stack-and-architecture/`). Feature scope: `docs/scope/scope.md`.

## Agent skills

SEO account skills that matter for this traffic driven site, load only the needed one:

- `seo-page`: single page SEO analysis
- `seo-schema`: structured data and JSON-LD
- `seo-sitemap`: sitemap generation and validation
- `seo-technical`: technical SEO audit
- `seo-audit`: full site health audit

Declined: cloudflare/mcp-server-cloudflare MCP servers (offered in spec 0001, skipped; do not offer again)

## Context files

<!-- Nested AGENTS.md files are listed here as they are created -->

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
