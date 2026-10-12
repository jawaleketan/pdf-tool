---
number: 0009
title: Public Developer API
status: Proposed
created: 2026-10-13
area: functions/api/v1/, src/pages/developers/
approach: Skateboard
---

## Summary

Release 9 introduces the **Public Developer API** (`/developers`), enabling third-party developers, CI pipelines, and external applications to programmatically leverage our PDF processing engine (conversion, compression, merging, and splitting). The API is built on Cloudflare Pages Functions, secured with API keys, protected by tiered rate limits, and backed by clear developer documentation.

## Requirements

- **AC-1 (API Authentication)**: All API requests under `/api/v1/` require a valid API key passed via the `X-API-Key` header or `Authorization: Bearer <key>`. Missing or invalid keys return `401 Unauthorized`.
- **AC-2 (Core Endpoints)**:
  - `POST /api/v1/convert`: Convert PDF to Word (`.docx`).
  - `POST /api/v1/compress`: Compress PDF files.
  - `POST /api/v1/merge`: Merge multiple PDFs into one.
  - `POST /api/v1/split`: Split a PDF into pages/ranges.
- **AC-3 (Rate Limiting & Headers)**: API keys are subject to rate limits (e.g. 100 requests per hour). Responses include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers. Exceeding limits returns `429 Too Many Requests`.
- **AC-4 (Zero Persistence Policy)**: Files uploaded via the API are processed in-memory or ephemeral storage and deleted immediately after response transmission.
- **AC-5 (Developer Portal & Documentation)**: A public documentation page at `/developers` featuring authentication guides, endpoint reference, cURL examples, and JavaScript/TypeScript fetch examples.

## Decision

- **Architecture**: Cloudflare Pages Functions under `functions/api/v1/` routing incoming requests.
- **Key Management**: Simulated key store with test/development keys (e.g., `pdf_live_...`) extensible to Cloudflare KV.
- **Documentation**: Static Astro page with syntax-highlighted code snippets and interactive playground or copyable examples.

## Build Plan

1. **Architecture Spec**: Publish this spec at `docs/specs/0009-public-developer-api.md`.
2. **API Middleware & Endpoints**: Implement authentication middleware and v1 endpoints in `functions/api/v1/`.
3. **Developer Portal Page**: Create `src/pages/developers/index.astro` with API documentation and code examples.
4. **Testing**: Add Vitest unit tests covering API key validation, rate limiting headers, and endpoint responses.
5. **Scope Update**: Update `docs/scope/scope.md` to mark Feature 13 as in-progress.

## Consequences

- **Positive**: Opens a second major growth channel (developer integrations / B2B usage) on top of organic search traffic.
- **Negative / Tradeoffs**: Server-side processing overhead; mitigated by strict rate limiting and ephemeral memory handling.

## Follow-up

- Monitor API traffic patterns, error rates, and quota utilization.
- Implement self-serve API key generation portal if developer demand warrants.
