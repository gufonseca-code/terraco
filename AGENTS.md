# Terraço Platform — Agent & Engineering Guidelines

This repository implements the **Terraço Google-First Split Architecture** monorepo (`terraco-platform`), combining an Angular SSR/Prerendered SEO vitrine, shared design tokens in `branding/`, Firebase multi-site hosting & backend infrastructure, and a planned Flutter cross-platform interactive application.

---

## 1. Monorepo Directory Structure

- **`apps/web-seo/`** — **Angular SEO & High-Conversion Vitrine (`terraco.com.br`)**
  - Built with **Angular (latest stable)** using 100% Standalone Components, **Zoneless change detection** (`provideZonelessChangeDetection()`), and a **Signals-first** reactive architecture (`signal`, `computed`, `effect`, `input`, `viewChild`).
  - Configured with **Angular SSR & Hybrid Rendering** (`@angular/ssr`, `RenderMode.Prerender` for `/`, `/lancamentos`, and `/lancamentos/:slug` via `getPrerenderParams()`, plus `RenderMode.Server` fallback for `**`).
  - Uses **Incremental Hydration & Event Replay** (`provideClientHydration(withEventReplay(), withIncrementalHydration())`) and **Angular Router View Transitions** (`withViewTransitions()`, `withComponentInputBinding()`, `withPreloading(PreloadAllModules)`).
  - Styled with **Tailwind CSS v4** (`@tailwindcss/postcss`) and the Terraço "Warm Brutalism / Sunlit Terracotta" design system (`apps/web-seo/src/styles.css`).
- **`apps/mobile-app/`** *(Planned)* — **Flutter Interactive App (`app.terraco.com.br` + Android/iOS)**
  - Dedicated Flutter web and native mobile application for authenticated buyer workflows, interactive 3D/floorplan tours, real-time financing simulations, visit scheduling, and cloud-synced favorites.
  - Deep-linked from `apps/web-seo` via `FLUTTER_APP_URL` (`https://app.terraco.com.br`) and `LancamentosService.buildFlutterAppDeepLink()`.
- **`branding/`** — **Single Source of Truth for Design Tokens & Brand Assets**
  - `branding/tokens.json` & `branding/tokens.css`: Canonical color palette (`#FAF7F0` Warm Alabaster Canvas, `#161514` Deep Basalt Ink, `#C85A32` Sunlit Terracotta, `#2D4A3E` Deep Moss Leaf), typography (`Fraunces` display serif + `Plus Jakarta Sans` UI sans), elevation shadows, and motion curves shared across Angular (`apps/web-seo`) and Flutter (`apps/mobile-app`).
  - `branding/DESIGN.md`: Complete visual direction, typography scale, layout discipline, and anti-slop guardrails.
- **`firebase.json` & `.firebaserc`** — **Firebase Multi-Site Hosting, App Hosting SSR & Emulator Suite**
  - Default Firebase project alias: `terraco-platform`.
  - Multi-site Hosting targets:
    - `web-seo` (`terraco-web-seo`): serves `apps/web-seo/dist/web-seo/browser` with immutable asset caching and Cloud Run / Functions SSR rewrite.
    - `mobile-app` (`terraco-mobile-app`): configured for `apps/mobile-app/build/web`.
  - Firebase Emulator Suite configured for local full-stack development (`auth`, `firestore`, `hosting`, `storage`).
- **`e2e/` & `playwright.config.ts`** — **Playwright End-to-End & Instant Navigation Verification**
  - `e2e/instant-navigation.spec.ts` verifies instant prerendered initial loads, zero-reload Angular Router SPA transitions, layered architectural SVG hero rendering, 404 handling, and SSR SEO metadata (`<title>`, OpenGraph, JSON-LD `RealEstateListing` & `BreadcrumbList`, `/robots.txt`, `/sitemap.xml`).

---

## 2. Angular Coding Conventions (`apps/web-seo`)

When creating or modifying code inside `apps/web-seo/`, adhere strictly to the workspace `/angular-developer` skill and these rules:

1. **Zoneless & Signals-First Reactivity**
   - Do **not** introduce `zone.js` or rely on `NgZone`.
   - Use `signal()`, `computed()`, and `effect()` for component and service state.
   - Use signal inputs (`input()`, `input.required()`) and signal queries (`viewChild()`, `viewChildren()`) instead of `@Input()` or `@ViewChild()` decorators.
2. **Standalone Components & Modern Control Flow**
   - Every component must be standalone (default in Angular v19+/v20+/v21+; do not declare `NgModule`).
   - Use built-in template control flow (`@if`, `@for`, `@switch`, `@defer`) rather than `*ngIf` or `*ngFor`.
   - Always use `inject()` for dependency injection instead of constructor parameter decorators.
3. **SVG Namespace Integrity**
   - Layered architectural SVG components inside `<svg>` must use attribute selectors on `<svg:g>` (e.g., `selector: 'g[appFacadeBackdrop]'`, `selector: 'g[appBalconyFoliage]'`, `selector: 'g[appFacadeForegroundStructure]'`, `selector: 'g[appForegroundFoliage]'`) paired with `.svg` template files (`templateUrl: './...component.svg'`) so Angular's compiler preserves the `http://www.w3.org/2000/svg` namespace.
4. **SSR Safety & Browser APIs**
   - Guard all browser-only globals (`window`, `localStorage`, `IntersectionObserver`, `matchMedia`) using `afterNextRender()` or `isPlatformBrowser(inject(PLATFORM_ID))`.
   - Update `<title>`, `<meta>`, canonical links, and JSON-LD via `SeoService` (`apps/web-seo/src/app/core/seo.service.ts`) and `inject(DOCUMENT)` so metadata is serialized during both build-time Prerendering (SSG) and client-side Router navigation.

---

## 3. Build, Serve & Verification Commands

Run commands from the monorepo root:

- **Install dependencies**: `npm install` (and `npm --prefix apps/web-seo install`)
- **Development server**: `npm run dev` (starts `ng serve` in `apps/web-seo`)
- **Production SSR + Prerender build**: `npm run build` (outputs browser, server, and prerendered HTML to `apps/web-seo/dist/web-seo/`)
- **Start production SSR server**: `npm run start -- --port 3105` (runs `node apps/web-seo/dist/web-seo/server/server.mjs --port 3105`)
- **Run Playwright E2E suite**: `PLAYWRIGHT_PORT=3105 npm run test:e2e -- --workers=1`

---

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
