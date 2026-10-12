# Spec 0002: Data Model & Content Architecture

## Summary

Define the unified data model for tools, variant pages (SEO growth engine), and build-time internationalization (i18n) using Astro Content Collections and TypeScript strict mode, ensuring future scalability for multi-file processing and multi-language support without architectural rewrites.

## Requirements

1. **Tool Registry Schema**: Strongly typed definition for every tool (`merge`, `split`, `compress`, `convert`, etc.) specifying metadata, worker entry points, mime types, and file constraints.
2. **Variant Page Schema**: Structured schema for long-tail search variant pages linked to parent tools, supporting SEO titles, descriptions, FAQs, and customized content blocks.
3. **Programmatic Generator**: Mechanism to generate variant pages dynamically from a configuration matrix or data collections.
4. **Build-Time i18n Layout**: JSON dictionary-based localization supporting English initially with zero-rewrite expansion to future languages via Astro i18n routing.
5. **Type Safety**: Full strict TypeScript validation across content collections and runtime tool configs.

## Decision

- **Storage**: Astro Content Collections (`src/content/`) with Zod schema validation for tools and variant pages.
- **Variant Generation**: Content collection schemas combined with programmatic Astro dynamic routes (`[tool]/[variant].astro`).
- **Localization**: Structured JSON dictionaries in `src/i18n/` keyed by locale (`en`, etc.), accessed via helper utilities with fallback handling.

## Design

### 1. Tool Collection Schema (`src/content.config.ts` or `src/content/tools/`)
```typescript
import { defineCollection, z } from 'astro:content';

const toolsCollection = defineCollection({
  loader: ... // or glob loader
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    path: z.string(),
    icon: z.string(),
    worker: z.string(),
    maxFiles: z.number().optional(),
    acceptedMimeTypes: z.array(z.string()),
  }),
});
```

### 2. Variant Page Collection Schema
```typescript
const variantsCollection = defineCollection({
  schema: z.object({
    toolId: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    intent: z.enum(['merge', 'split', 'compress', 'convert', 'general']),
    faqs: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })).optional(),
  }),
});
```

### 3. Build-Time i18n Structure
- `src/i18n/en.json`: UI strings, error messages, footer links, and SEO defaults.
- Helper `src/i18n/utils.ts` to retrieve localized strings with fallback support.

## Build Plan

1. **Step 1**: Set up Astro Content Collections configuration (`src/content.config.ts`) for tools and variant pages with Zod validation.
2. **Step 2**: Create initial tool definitions (`tools/merge.json`, `tools/split.json`, etc.) under `src/content/tools/`.
3. **Step 3**: Implement i18n JSON structure (`src/i18n/en.json`) and translation helper functions (`src/i18n/utils.ts`).
4. **Step 4**: Add unit tests in `tests/data-model.test.ts` verifying Zod schema validation and collection loading.

## Consequences

- **Pros**: Complete type safety, robust SEO variant extensibility, clean separation of content and code, zero runtime performance penalty (static build).
- **Cons**: Content updates require site rebuilds (acceptable for static PDF utility site).

## Follow-up

- Implement Release 1 Merge tool page utilizing the new tool collection and i18n dictionaries.
- Plan Release 6 variant page generation templates.

## Rationale

Astro Content Collections paired with Zod schemas provide industry-standard type-safe content management without external CMS dependencies. JSON-based localization ensures simple translation onboarding for future languages.
