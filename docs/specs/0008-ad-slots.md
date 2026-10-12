---
number: 0008
title: Ad Slots & Monetization
status: Proposed
created: 2026-10-12
area: src/components/AdSlot.astro, src/components/ConsentBanner.astro
approach: Skateboard
---

## Summary

Release 7 introduces non-intrusive, consent-gated ad placements (`/ad-slots`) to monetize search traffic and fund free browser-based PDF utilities without compromising performance, core web vitals (CLS/INP), or visitor privacy. Ads are integrated via Google AdSense and remain strictly gated behind user consent.

## Requirements

- **AC-1 (Consent Gated Loading)**: Ad scripts and ad slots do not load, request resources, or render until the visitor grants explicit advertising/marketing consent through the consent banner (`ConsentBanner.astro`).
- **AC-2 (Layout Stability & CLS Protection)**: Ad slot components (`AdSlot.astro`) enforce fixed minimum heights and responsive container dimensions to prevent Cumulative Layout Shift (CLS) when ad creatives load.
- **AC-3 (Strategic Placements)**: Ad units are placed below the core tool interface (merge, split, compress, convert) and in the right-hand sidebar of variant pages, ensuring high visibility without interrupting primary utility workflows.
- **AC-4 (Performance Budget Compliance)**: Ad integration adds minimal JavaScript overhead, respecting the 50 KB gzipped JS budget per page established in `tests/build-output.test.ts`.
- **AC-5 (Graceful Fallbacks)**: When ad blockers are active or consent is withheld, ad slots render gracefully as empty collapsible containers or fallback sponsor messages with zero broken UI elements.

## Decision

- **Network**: Google AdSense asynchronous ad script tags.
- **Consent Enforcement**: Reactive subscription to consent state managed by `src/lib/analytics.ts` and `ConsentBanner.astro`. Ad units check for `analytics` / `marketing` consent before mounting.
- **Component**: Reusable Astro component `src/components/AdSlot.astro` with configurable slot types (`banner`, `sidebar`, `in-feed`) and fixed aspect-ratio boxes.
- **Styling**: Tailwind CSS 4 utility classes ensuring responsive padding, borders, and empty state styling.

## Build Plan

1. **Ad Slot Component**: Create `src/components/AdSlot.astro` supporting slot types, dimensions, and consent-checking logic.
2. **Consent Integration**: Update consent state management to expose ad-loading triggers upon user consent acceptance.
3. **Template Placements**: Embed `<AdSlot>` components below tools in `MergeTool.astro`, `SplitTool.astro`, `CompressTool.astro`, `ConvertTool.astro`, and variant pages (`[tool]/[slug].astro`).
4. **Testing & Verification**: Add unit and E2E tests validating that ad slots do not render without consent and maintain zero CLS.
5. **Scope Update**: Update `docs/scope/scope.md` to mark Release 7 as in-progress / design accepted.

## Consequences

- **Positive**: Establishes sustainable monetization for the site while keeping user privacy fully protected via strict consent gates.
- **Negative / Tradeoffs**: External ad network scripts add third-party requests; mitigated by strict consent gating and async loading.

## Follow-up

- Monitor AdSense fill rates, RPM, and Core Web Vitals (specifically CLS and INP) post-launch.
- Fine-tune ad unit dimensions for optimal mobile vs desktop viewports.
