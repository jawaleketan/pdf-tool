# Consent, legal and analytics

**Status**: Proposed  
**Created**: 2026-10-12  
**Feature**: Release 4 (Consent, legal and analytics)

## Summary

This specification defines the consent management banner, legal pages, and privacy preserving analytics for the browser based PDF utilities site. The consent banner ensures that analytics and measurement scripts do not load until the visitor explicitly grants consent. Dedicated static pages for the privacy policy and terms of service provide the required legal foundation for an ad supported utility site.

## Requirements

- **AC-1**: A bottom banner appears on first visit, informing the visitor about local storage and privacy respectful metrics collection.
- **AC-2**: The banner provides explicit Accept and Reject buttons. Choosing Accept stores consent and loads analytics; choosing Reject suppresses analytics and hides the banner.
- **AC-3**: Consent preference is persisted in browser local storage so returning visitors are not repeatedly prompted.
- **AC-4**: Dedicated static pages for Privacy Policy (`/privacy`) and Terms of Service (`/terms`) are accessible from footer links across all views.
- **AC-5**: Analytics events track tool completions, processing duration ranges, and client errors without capturing any personal data or file contents.

## Decision

- **Consent Mechanism**: A persistent bottom banner component rendered via Astro island or global layout element, checking local storage on load.
- **Persistence Key**: `pdf_utils_consent` stored in browser local storage with values `accepted` or `rejected`.
- **Analytics Approach**: Privacy first client side telemetry that initializes only when consent status equals `accepted`. Events are dispatched to a lightweight endpoint or console adapter.
- **Legal Pages**: Static Astro pages using `BaseLayout.astro` and `SeoHead.astro` with proper metadata and structured data.

## Design and Specification

### Consent Banner Component
- Fixed bottom positioning with high z index.
- Clear copy explaining privacy practices and local storage usage.
- Action buttons for accepting or rejecting analytics.
- Integration into `BaseLayout.astro` or global footer area.

### Legal Pages
- `/privacy` route with comprehensive privacy policy covering zero server uploads and local processing.
- `/terms` route with terms of service governing tool usage and disclaimers.
- Footer links on every page pointing to `/privacy` and `/terms`.

### Analytics Event Dispatcher
- A utility module `src/lib/analytics.ts` that checks local storage consent before recording events.
- Tracked events: `tool_complete` (tool name, processing time, success/error status).

## Build plan (Skateboard approach)

1. **Slice 1: Legal Pages**: Create `src/pages/privacy.astro` and `src/pages/terms.astro` with SEO metadata and footer links.
2. **Slice 2: Consent Banner & Storage**: Implement consent state management and banner UI component, integrated into the layout.
3. **Slice 3: Analytics Integration**: Implement privacy safe analytics event tracking gated by consent state.
4. **Slice 4: Testing & Verification**: Add unit and end to end tests guarding consent gating and legal page routes.

## Consequences

- Visitors retain full control over data collection.
- Legal compliance requirements are met for public utility launch.
- Analytics data remains strictly non personal and privacy safe.

## Follow-up

- Consider adding consent preference reset settings in the footer if visitors wish to change their choice later.
