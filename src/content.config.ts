import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * The tools collection feeds tool pages and, later, variant pages (Release 6).
 * Content lives one directory per locale (src/content/tools/en/...) so a second
 * language arrives without a rewrite; the data model feature owns the full
 * schema (spec 0001, international readiness).
 */
const tools = defineCollection({
  loader: glob({ base: './src/content/tools', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
  }),
});

const variants = defineCollection({
  loader: glob({ base: './src/content/variants', pattern: '**/*.md' }),
  schema: z.object({
    toolId: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    heading: z.string(),
    faqs: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        }),
      )
      .optional(),
  }),
});

export const collections = { tools, variants };
