# 0001. Stack and architecture: reasoning

**Status**: Accepted (governed by [index.md](index.md))

## Context

The scope for this project is a browser based PDF utility site: merge, split, compress, then convert. Search traffic is the growth engine and ads are the money, so the pages must be fast, fully rendered HTML that search engines and AI crawlers can read without running JavaScript. The product promise is that nothing heavy gets downloaded and, for every tool except the converter, that uploaded files never leave the device. That promise pushes the PDF work into the browser.

Three forces shape the choice. First, performance on mid range phones: a visitor with a large PDF on a phone must still get a responsive page, so heavy processing cannot run on the main thread. Second, cost: an ads funded site needs hosting that stays cheap at low traffic and remains legal for commercial use. Third, one tool breaks the promise: PDF to Word needs a server, so the base must leave room for a small server area without turning the whole project into a backend system.

If this goes undecided, every release invents its own conventions, and changing direction after several tools exist costs a rewrite.

## Options considered

### Option 1: Astro static site, client side PDF engine, Cloudflare Pages

Astro renders every page to plain HTML at build time and ships no client JavaScript unless a component opts in (an "island"). Each tool is one island; the PDF engine (pdf-lib for structure work, PDF.js for rendering and lossy compression) runs inside a Web Worker. Cloudflare Pages serves the static output free and unlimited, and hosts the one server function later as a Pages Function (a small server route running on Cloudflare's edge network).

**Pros**:
- Best match for a search driven site: content pages ship as pure HTML, no client framework runtime by default.
- Cloudflare's free tier allows commercial use with unlimited static requests; the server job later fits in the same deployment.
- The same pdf-lib engine can later back the public API, since it runs in JavaScript everywhere.

**Cons**:
- Astro's island model is a different mental component model than React alone, so a developer used to single page apps needs a small adjustment.
- Client side compression cannot shrink every PDF well; the biggest gains need image downsampling, which is lossy, so presets must be honest about quality tradeoffs.

### Option 2: Next.js static export with the same PDF engine

Next.js with static export produces HTML per route at build time. The tool islands would carry React client components with the same PDF libraries.

**Pros**:
- The largest ecosystem of components and examples, and familiar React mental model.
- Static export keeps the SEO story intact while leaving a clear path to server rendering later.

**Cons**:
- Next.js tends to pull client JavaScript into pages by habit, which works against the performance goal.
- Hosting it properly for a commercial static site on Vercel needs a paid plan (the free Hobby plan forbids commercial use), which costs money from day one for ads.
- Heavier framework surface for a site whose pages are mostly static content plus one widget.

### Option 3: Vite plus React single page app

A client rendered app where every page is the same HTML shell and all content renders in the browser.

**Pros**:
- Simplest tooling for interactive widgets, fastest feedback loop while building the tools.
- No framework opinions about routing or rendering; total control of the bundle.

**Cons**:
- Pages are empty until JavaScript runs, which hurts search rankings and AI citation, the whole growth engine.
- Every SEO concern (metadata, structured data, social cards) becomes manual work.

## Rationale

The site lives or dies on search traffic and running cost, so the option that ships the purest HTML at the lowest cost wins. Astro's static output serves the growth engine directly, and the Web Worker placement answers the phone performance force from Context. Cloudflare answers the commercial use force: the free plans of the other mainstream hosts either forbid ads or meter by credits, which an ads funded site cannot accept early. Next.js would work, but habit pulls it toward client JavaScript on every page, and a single page app would fight the SEO mission on every release. The limits of client side compression are real, so the spec states them instead of hiding them, which keeps the product promise honest.

## References

**Project sources** (verifiable, in this repo):
- `docs/scope/scope.md`: the scope, build approach (Skateboard), and feature 1 done criteria.

**Practices & standards**:
- Static site generation for search driven content sites.
- Islands architecture: render HTML on the server, hydrate only interactive parts.
- Background thread processing (Web Workers) to keep the main thread free for the user.
- Client side processing as a privacy guarantee (files never uploaded).
- Boring technology preference: proven tools with known failure modes over new ones.

**Links** (web verified during the landscape check, October 2026):
- Astro, Why Astro: https://docs.astro.build/en/concepts/why-astro/
- Next.js, Static Exports: https://nextjs.org/docs/app/guides/static-exports
- pdf-lib repository: https://github.com/Hopding/pdf-lib · releases: https://github.com/Hopding/pdf-lib/releases
- PDF.js (Mozilla): https://mozilla.github.io/pdf.js/
- Cloudflare Pages Functions pricing: https://developers.cloudflare.com/pages/functions/pricing/
- Netlify pricing: https://www.netlify.com/pricing/
- Vercel Hobby plan: https://vercel.com/docs/plans/hobby
- Cloudflare MCP servers (the declined offer, for later): https://github.com/cloudflare/mcp-server-cloudflare
