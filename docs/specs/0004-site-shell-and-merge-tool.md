# Spec 0004: Site Shell & Merge Tool

## Summary

Design the Release 1 site shell (home page, layout, SEO headers, footer) and the core browser-based Merge PDF tool island powered by a dedicated Web Worker (`merge.worker.ts`) and pdf-lib.

## Requirements

1. **Site Shell**: Responsive header, footer, and `SeoHead` integration providing title, description, canonical URL, and JSON-LD structured data.
2. **Merge Tool UX**: Drag-and-drop file uploader, file list with item reordering (up/down), remove file action, progress indicator, and secure client-side download.
3. **Web Worker Isolation**: Heavy PDF processing runs exclusively inside `src/workers/merge.worker.ts`, ensuring zero main-thread blocking and worker health probing.
4. **Performance Budgets**: Landing and tool pages ship under 50 KB of JavaScript gzipped, enforced by `tests/build-output.test.ts`.

## Decision

- **Framework**: Astro 7 static output with interactive islands (`client:load` or `client:idle`).
- **PDF Engine**: `pdf-lib` running inside a Web Worker communicating via typed message contracts (`src/lib/pdf/messages.ts`).
- **Styling**: Tailwind CSS 4 with CSS custom properties.

## Design

### 1. Site Shell (`src/layouts/BaseLayout.astro`)
- Wraps all pages with header navigation, footer, and `SeoHead.astro`.
- Provides consistent accessibility landmarks (`<header>`, `<main>`, `<footer>`).

### 2. Merge Tool Island (`src/components/tools/MergeTool.tsx` or Astro/Preact component)
- State management for selected files (`File[]`), reordering logic, merge status (`idle`, `processing`, `success`, `error`), and download URL generation.

### 3. Web Worker (`src/workers/merge.worker.ts`)
- Receives file array buffers, instantiates `PDFDocument` from `pdf-lib`, appends pages from each document in order, serializes the merged PDF, and returns the result array buffer.

## Build Plan

1. **Step 1**: Author the site shell layout and `SeoHead` integration.
2. **Step 2**: Build the interactive Merge tool client component and Web Worker integration.
3. **Step 3**: Add end-to-end tests for the merge workflow (`e2e/merge.spec.ts`).
4. **Step 4**: Verify build output, bundle sizes, type safety, and test suites.

## Consequences

- **Pros**: Lightning-fast static delivery, secure client-side processing (zero server uploads required), fully tested end-to-end flow.
- **Cons**: Browser memory limits for extremely large PDFs (mitigated by file size warnings).

## Follow-up

- Proceed to Release 2: Split tool implementation.

## Rationale

Merging PDFs entirely in the browser using Web Workers satisfies both privacy promises and speed expectations while laying the foundational architecture for all subsequent tools.
