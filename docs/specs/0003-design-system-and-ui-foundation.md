# Spec 0003: Design System & UI Foundation

## Summary

Establish the visual language, Tailwind CSS 4 token structure, and accessible core UI components (buttons, dropzones, modals, tabs, toasts) adhering to WCAG 2.1 AA standards across all pages and tool islands.

## Requirements

1. **Design Tokens**: Centralized color palette, typography scale, spacing, and shadows defined as CSS custom properties in `:root` and Tailwind 4 theme configuration.
2. **Accessibility (a11y)**: WCAG 2.1 AA compliance with visible focus rings (`focus-visible:ring-2`), ARIA attributes, and screen reader announcements.
3. **Core UI Components**: Reusable Astro/Preact components for buttons, file dropzones, cards, tabs, and toast notifications.
4. **Responsive Layout**: Mobile-first grid and flex layouts ensuring seamless usability on phones, tablets, and desktop viewports.

## Decision

- **Styling Engine**: Tailwind CSS 4 (`@tailwindcss/vite`) with global CSS variables in `src/styles/global.css`.
- **Component Strategy**: Accessible vanilla Astro components for static UI and lightweight interactive islands for dynamic tool interfaces.

## Design

### 1. Color Palette & Tokens (`src/styles/global.css`)
- Primary brand: Indigo/Blue professional palette optimized for trust and readability.
- Neutral scale: Slate for clean high-contrast text and backgrounds.
- Feedback colors: Emerald (success), Amber (warning), Rose (error).

### 2. Core Components
- `Button.astro`: Accessible button with variant styles (primary, secondary, ghost) and robust keyboard focus states.
- `Dropzone.astro` / island: Drag-and-drop file upload container with file validation and keyboard support.
- `Toast.astro` / store: Notification banner for success/error alerts.

## Build Plan

1. **Step 1**: Define design tokens and variables in `src/styles/global.css`.
2. **Step 2**: Create core UI components (`src/components/ui/`).
3. **Step 3**: Add accessibility testing unit tests and build output guards.
4. **Step 4**: Update `docs/scope/scope.md` marking Feature 4 as `done`.

## Consequences

- **Pros**: Consistent product feel, high accessibility, fast rendering.
- **Cons**: Requires strict adherence to design token conventions.

## Follow-up

- Proceed to Release 1: Site shell & merge tool implementation.

## Rationale

A unified design system with built-in accessibility guarantees that visitors on any device or assistive technology can successfully merge, split, and compress PDFs securely.
