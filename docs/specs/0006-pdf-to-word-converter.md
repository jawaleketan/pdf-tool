---
number: 0006
title: PDF to Word Converter
status: Proposed
created: 2026-10-12
area: src/pages/convert.astro, functions/api/convert.ts
approach: Skateboard
---

## Summary

Release 5 introduces the PDF to Word converter tool (`/convert`). Unlike our 100% client-side privacy-first tools (merge, split, compress), document conversion from PDF to editable `.docx format` requires server-side processing. This spec establishes a secure Cloudflare Pages Function endpoint with strict file size limits, rate limiting, and an explicit server deletion policy.

## Requirements

- **AC-1 (Upload & Validation)**: Visitors can upload a PDF file up to 10MB via drag-and-drop or file picker on `/convert`. Non-PDF files or files exceeding 10MB are rejected with clear error messages.
- **AC-2 (Server-Side Conversion)**: A Cloudflare Pages Function (`functions/api/convert.ts`) parses the PDF text/structure and generates a clean, editable Microsoft Word document (`.docx`) using server-side JS libraries.
- **AC-3 (Deletion Policy & Privacy Notice)**: The tool interface prominently displays an explicit deletion notice stating that uploaded files are processed securely and deleted immediately after conversion.
- **AC-4 (Rate Limiting & Abuse Prevention)**: API requests enforce rate limiting (5 conversions per IP per hour) to protect against abuse and resource exhaustion.
- **AC-5 (SEO & Metadata)**: The converter page carries title, description, canonical URL, and JSON-LD structured data via `SeoHead.astro`, and is listed on the homepage tools grid and sitemap.

## Decision

- **Engine**: Cloudflare Pages Function (`functions/api/convert.ts`) leveraging server-side PDF parsing and the `docx` library to construct professional `.docx` output.
- **Storage & Lifecycle**: Zero persistent storage. Files are held in memory/stream buffer during conversion and discarded immediately.
- **Limits**: 10MB maximum payload size, 5 requests per IP per hour rate limit.
- **UI Component**: `src/components/tools/ConvertTool.astro` adhering to the design system tokens and WCAG 2.1 AA accessibility guidelines.

## Build Plan

1. **Content & Tool Registration**: Add `src/content/tools/en/convert.md` content collection entry for the converter tool.
2. **Backend Function**: Implement `functions/api/convert.ts` handling multipart PDF uploads, validation, server-side conversion to `.docx`, rate limiting, and explicit deletion headers.
3. **Frontend Component**: Build `src/components/tools/ConvertTool.astro` with drag-and-drop, progress state, download button, and deletion policy disclaimer.
4. **Page Route**: Create `src/pages/convert.astro` incorporating `BaseLayout`, `SeoHead`, `ConvertTool`, and `WorkerProbe`.
5. **Homepage Integration**: Update homepage (`src/pages/index.astro`) and scope roadmap (`docs/scope/scope.md`) to mark Release 5 as design-ready / in-progress.
6. **Testing**: Add unit and E2E tests verifying conversion flow, error handling, and security headers.

## Consequences

- **Positive**: Enables high-demand PDF to Word conversion while maintaining transparency about server-side processing and strict data lifecycle hygiene.
- **Negative / Tradeoffs**: Breaks the strict "never leaves your device" guarantee of client-side tools, which is fully mitigated by explicit UI notices and immediate memory cleanup.

## Follow-up

- Monitor conversion error rates and performance metrics under production loads.
- Explore advanced layout preservation enhancements if visitor feedback requests complex table/image formatting.
