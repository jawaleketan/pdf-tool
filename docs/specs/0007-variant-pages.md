---
number: 0007
title: Variant Pages
status: Proposed
created: 2026-10-12
area: src/content/variants/, src/pages/[tool]/[slug].astro
approach: Skateboard
---

## Summary

Release 6 introduces variant landing pages across all four core tools (merge, split, compress, and convert). Variant pages multiply search engine traffic by targeting specific use cases and search intents (for example, merging PDF files for students, splitting PDF page ranges for legal documents, compressing PDF files for email attachments, and converting PDF resumes to Word documents). Each variant page is generated from an Astro Content Collection using dynamic routes, featuring unique content, canonical tags, internal links connecting back to the core tools, and entries in the XML sitemap.

## Requirements

- **AC-1 (Variant Content Collection)**: Define an Astro Content Collection schema using Zod for variant pages, storing target tool identifier, unique slug, SEO title, description, targeted intent, custom content sections, and optional FAQs.
- **AC-2 (Dynamic Route Generation)**: Implement an Astro dynamic route page at `src/pages/[tool]/[slug].astro` that renders each variant page statically at build time.
- **AC-3 (SEO & Structured Data)**: Every variant page carries unique title, description, canonical link, and JSON-LD structured data via `SeoHead.astro`.
- **AC-4 (Internal Linking & Navigation)**: Variant pages include contextual cross-links to the parent core tool and related variants to facilitate search crawler discovery and visitor navigation.
- **AC-5 (Sitemap Integration)**: Ensure `@astrojs/sitemap` automatically indexes all generated variant pages.

## Decision

- **Content Source**: Astro Content Collections (`src/content/variants/`) with Zod schema validation.
- **Routing**: Astro dynamic routes (`src/pages/[tool]/[slug].astro`).
- **Tool Integration**: Variant pages embed the corresponding core tool island or provide a direct action link to the parent tool interface.

## Build Plan

1. **Content Schema & Directory**: Create the variant collection schema in `src/content.config.ts` and set up sample variant content files under `src/content/variants/`.
2. **Dynamic Route Page**: Build `src/pages/[tool]/[slug].astro` to query the variant collection, validate paths, and render layout components.
3. **Template & SEO Integration**: Integrate `SeoHead.astro`, breadcrumbs, FAQ schema, and internal linking blocks.
4. **Sitemap & Build Verification**: Verify that `@astrojs/sitemap` includes the variant URLs and test build output.
5. **Testing**: Add unit and E2E tests covering variant page rendering, metadata, and link structures.

## Consequences

- **Positive**: Significantly increases organic search footprint and captures long tail keyword traffic across all core tool categories.
- **Negative / Tradeoffs**: Increases build time and content maintenance overhead, which is minimized by structured JSON or Markdown collections.

## Follow-up

- Expand variant coverage based on search console performance data and user search queries.
