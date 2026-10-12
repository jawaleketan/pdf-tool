# Scope: PDF Utilities

A browser based tool site for quick PDF fixes: merge, split, compress, and convert, with nothing heavy to download. Search traffic is the growth engine, ads are the money.

**Build approach:** Skateboard (ship the thinnest usable whole first, then grow it release by release; every release is live and shippable).
**Workflow:** Beta (after `/develop` comes `/check verify`, then `/test`). The project default level of rigor. `/architect` is the recommended first stop for a feature with a real decision, but skippable when you already know the build. Any feature can carry its own tag (e.g. `· GA`) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Stack & architecture | Foundation | done |
| 2 | Coding standards & tooling | Foundation | done |
| 3 | Data model | Foundation | done |
| 4 | Design system & UI foundation | Foundation | done |
| 5 | Site shell & merge tool | Release 1 | done |
| 6 | Split tool | Release 2 | done |
| 7 | Compress tool | Release 3 | done |
| 8 | Consent, legal & analytics | Release 4 | done |
| 9 | PDF to Word converter | Release 5 | done |
| 10 | Variant pages | Release 6 | done |
| 11 | Ad slots | Release 7 | done |
| 12 | Batch processing | Release 8 | done |
| 13 | Public developer API | Release 9 | done |

## Foundations

### 1. Stack & architecture
Decide the stack and scaffold a runnable project so every later release builds on real structure. The one place tools and providers are chosen, including how PDFs get processed in the browser.
**Done when:** the stack is recorded in a spec and the empty scaffold boots locally and passes build.
- [x] Design it (spec): [0001](../specs/0001-stack-and-architecture/index.md)
- [x] Scaffold from the decision: `/develop stack & architecture` · code in `src/`, `functions/`, `tests/`, `e2e/`
- [x] Verify it: `/check verify stack & architecture`
- [x] Test it: `/test stack & architecture`

### 2. Coding standards & tooling
Capture conventions from the real project, then install lint, format, and commit checks that keep every later change honest.
**Done when:** root `AGENTS.md` reflects the real stack, and lint, format, and type checks run clean.
- [x] Capture conventions and tooling choices: `/audit`

### 3. Data model
The shape of everything the site knows: tools, pages, variant page definitions, and the string layout future languages plug into. Cheap to change now, expensive later.
**Done when:** one model covers tools, variant pages, and a second language later without a rewrite.
- [x] Design it (spec): [0002](../specs/0002-data-model.md)

### 4. Design system & UI foundation
Visual language and base components so every page feels like one product and works for everyone, keyboard included, holding to WCAG 2.1 AA.
**Done when:** design tokens cover type, color, spacing, and components, and base components handle focus and keyboard.
- [x] Design it (spec): [0003](../specs/0003-design-system-and-ui-foundation.md)

## Release 1: smallest usable whole

### 5. Site shell & merge tool
The first live release: a home page, one tool that really works in the browser, and the metadata search needs. A real visitor lands, merges, downloads, and leaves happy. Nothing else yet.
**Done when:** a visitor lands from search, picks two PDFs, reorders them, and downloads the merged file, all in the browser on a phone, and the page carries title, description, and structured data with the URL in the sitemap.
- [x] Design it (spec): [0004](../specs/0004-site-shell-and-merge-tool.md)

## Release 2

### 6. Split tool
The second tool, reusing the page and processing pattern the merge spec decided. Page range controls land here, since splitting is where ranges matter most.
**Done when:** a visitor splits by every page, a range, or selected pages and downloads the results in the browser; empty and error states render.
- [x] Build it: `/develop split tool`

## Release 3

### 7. Compress tool
The third tool: quality presets with a visible before and after size. Completes the core trio the traffic story stands on.
**Done when:** a visitor picks a quality preset, sees the size before and after, and downloads a smaller file, all in the browser.
- [x] Build it: `/develop compress tool`

## Release 4

### 8. Consent, legal & analytics · needs a decision
The honest minimum for an ad supported site: a consent banner that gates analytics, a privacy policy, terms, and the events that show what is working. Ships before anything uploads files or serves ads.
**Done when:** the consent banner gates analytics until accepted, privacy and terms pages are live and linked, and tool completions and errors reach your dashboard.
- [x] Design it (spec): [0005](../specs/0005-consent-legal-analytics.md)
- [x] Build it: `/develop consent, legal & analytics`

## Release 5

### 9. PDF to Word converter · GA
The one tool that needs a server, so it breaks the never upload promise for this single job. Handled with extra rigor: a clear deletion policy on the page, hard size and rate limits, and the full review tail.
**Done when:** a visitor uploads a PDF and downloads a usable editable file, the page states when uploads are deleted, and size and rate limits hold under abuse.
- [x] Design it (spec): [0006](../specs/0006-pdf-to-word-converter.md)
- [x] Build it: `/develop pdf to word converter`

## Release 6

### 10. Variant pages
Multiply search coverage: a variant page per tool for the situations people actually search, generated from the data model, each with its own content and internal links. This is where the steady traffic lives.
**Done when:** each tool has variant pages with unique content, correct canonical tags, links both ways, and entries in the sitemap.
- [x] Design it (spec): [0007](../specs/0007-variant-pages.md)
- [x] Build it: `/develop variant pages`

## Release 7

### 11. Ad slots · needs a decision
Where the site earns: ad placements that pay for the free tools without wrecking speed or the tool experience. Consent gated, placed where they help rather than interrupt.
**Done when:** ads render in the agreed slots, stay consent gated, and Core Web Vitals stay in the green on every page carrying them.
- [x] Design it (spec): [0008](../specs/0008-ad-slots.md)
- [x] Build it: `/develop ad slots`

## Release 8

### 12. Batch processing
One run, many files: merge, split, or compress a whole folder in one pass, with progress and a single result to download.
**Done when:** a visitor processes many files in one run on any tool, sees progress, and gets one result to download.
- [x] Build it: `/develop batch processing`

## Release 9

### 13. Public developer API
Let other sites build on the same engine: a documented API with keys and rate limits. A second audience on top of what already works.
**Done when:** a developer gets a key, reads the docs, and completes a conversion within the published rate limits.
- [x] Design it (spec): [0009](../specs/0009-public-developer-api.md)
- [x] Build it: `/develop public developer api`

## Deferred

Out of scope for now, kept so the plan stays honest.
- **Translated content**: the second and third languages, once English traffic proves the model · needs a decision
- **Site search**: revisit only if the page count grows large
- **Accounts & premium tier**: revisit only if monetization outgrows ads
- **Cloud storage import**: pull PDFs straight from cloud drives · needs a decision
- **OCR for scanned PDFs**: make PDF to Word work on scans · needs a decision

## Legend

**The decision box.** Every feature carries exactly one, the sub task whose label ends with `(spec)`. Its wording varies (`Design it (spec)` normally, `Capture conventions and tooling choices` on tooling), so skills locate it by the `(spec)` suffix or the `/audit` entry, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Feature lifecycle**: `planned` → `in-progress` → `done`, set by `/scope`, `/architect`, `/develop`, and you. `needs a decision` means run `/architect` first; otherwise straight to `/develop` (or `/audit` for standards and tooling). The tag drops once the spec is captured. A per feature tier tag (like `· GA` on the converter) sets that feature's rigor above or below the project default; no tag inherits it. The next step is always the first unticked box, always a command. Atomic build tasks live in the spec, not here.
