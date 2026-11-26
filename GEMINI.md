# Terraço Platform — Agent Guidelines

Monorepo with an Angular SSR/prerendered web app (`apps/web-seo`), shared design tokens (`branding/`), Firebase config (`firebase.json`, `.firebaserc`), Playwright E2E tests (`e2e/`), and a planned Flutter app (`apps/mobile-app`)[cite: 1, 2].

## Critical Gotchas & Conventions
- For general Angular patterns in `apps/web-seo`, follow the `/angular-developer` skill and match existing codebase conventions[cite: 2].
- For frontend visual and UI design work, use the `gemini-frontend-design` skill (`https://github.com/google-gemini/demolab/blob/main/skills/gemini-frontend-design/SKILL.md`) alongside `branding/tokens.css`, `branding/tokens.json`, and `branding/DESIGN.md`[cite: 1, 2].
- Keep the app **zoneless** (`provideZonelessChangeDetection()`); do not introduce `zone.js` or `NgZone`[cite: 2].
- Preserve SVG namespace integrity on layered `<svg>` components using attribute selectors on `<svg:g>` and external `.svg` templates[cite: 1, 2].
- Guard browser-only APIs (`window`, `localStorage`, `IntersectionObserver`, `matchMedia`) in SSR/prerender flows with `afterNextRender()` or `isPlatformBrowser()`[cite: 2].
- Update page titles, meta tags, canonicals, and JSON-LD through `SeoService` (`apps/web-seo/src/app/core/seo.service.ts`) and `DOCUMENT`[cite: 1, 2].

## Verification & Workflow
- Run commands from the monorepo root:
  - Dev: `npm run dev`[cite: 2]
  - Build: `npm run build`[cite: 2]
  - SSR server: `npm run start -- --port 3105`[cite: 2]
  - E2E: `PLAYWRIGHT_PORT=3105 npm run test:e2e -- --workers=1`[cite: 2]
- For UI, SVG, or navigation changes, verify the rendered result (via Playwright/browser/screenshots) rather than relying only on build output[cite: 1, 2].
- When switching major phases or opening parallel workstreams, write a short handoff note with verified decisions and file paths instead of relying on mid-session compaction.
