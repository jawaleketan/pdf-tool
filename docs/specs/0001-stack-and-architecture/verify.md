# Verify: Stack & architecture · spec 0001 · updated 2026-10-10
_Steps derived from spec 0001's scaffold done criteria and build conventions. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

- [x] `pnpm dev`, then GET `http://localhost:4321/` → HTTP 200, `<title>PDF Utilities</title>`, worker probe paragraph present → scaffold done criteria
- [x] The worker probe paragraph ends with `Worker running.` → worker scripts run → scaffold done criteria
- [x] Stop the server with `pnpm astro dev stop` → port 4321 free → hygiene

## Commands

- [x] `pnpm check` → 0 errors, 0 warnings, 0 hints → scaffold done criteria (build passes)
- [x] `pnpm build` → `dist/` contains `index.html`, `robots.txt`, `sitemap-index.xml`, `_headers`, and `_astro/*.worker-*.js` files → scaffold done criteria
- [x] `pnpm test` → 8 unit tests pass (contract guards and progress clamping) → scaffold done criteria (tests pass)
- [x] `pnpm test:e2e` → home renders the tool list, probe shows `Worker running.`, robots.txt carries a `Sitemap:` line → scaffold done criteria
- [x] `pnpm test:headers` → 4 pass: CSP contains `worker-src 'self' blob:`, `x-content-type-options: nosniff`, `x-frame-options: DENY`, `GET /api/health` returns `{ok:true, service:"pdf-utilities"}` → header check convention + server area shape
- [x] `SITE_URL=https://example.com pnpm build`, then inspect `dist/robots.txt`, `dist/sitemap-0.xml`, `dist/index.html` → all three carry `https://example.com`, canonical has no trailing slash → environment and site URL convention
- [x] Restore with a plain `pnpm build` → default `http://localhost:4321` back in the output → environment and site URL convention
- [x] Measure gzipped JS: inline module script in `dist/index.html` plus `dist/_astro/*.js` → total under 51,200 bytes (scaffold measured 2,347) → performance budget convention
- [x] `ls .nvmrc` and `node -p "require('./package.json').engines.node"` → `.nvmrc` says 24, engines say `>=24.0.0 <25`; dependency versions in `package.json` have no `^` → versions and pinning convention
- [ ] CI workflow exists at `.github/workflows/ci.yml` and runs `pnpm check`, `pnpm build`, `pnpm test` → scaffold done criteria (passes in CI) — BLOCKED 2026-10-10: file verified and each command passes locally, but the workflow itself cannot execute without a git repository and a remote runner

## Acceptance-criteria coverage

- Scaffold done criteria (dev serves, build produces output plus functions shell, tests and build pass, site loads under production headers with workers running) · covered by every command step above
- Environment and site URL convention · covered by the `SITE_URL` build steps
- Performance budget convention · covered by the gzip measurement step
- Versions and pinning convention · covered by the `.nvmrc` / engines / exact versions step
- Header check convention · covered by `pnpm test:headers`
- Worker message contract · covered by `pnpm test` (guards, clamping) and the probe assertion in `pnpm test:e2e`
