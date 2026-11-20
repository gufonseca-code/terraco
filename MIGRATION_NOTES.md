# Terraço Platform — Architectural Migration Notes

## Next.js + Vinext (Cloudflare Workers) → Angular (SSR/Prerender) + Firebase + Flutter Split Architecture

**Branch:** `feat/angular-split-architecture`  
**Target Architecture:** Google-First Split Architecture (`apps/web-seo/` in Angular + `branding/` Shared Tokens + Firebase Multi-Site Hosting & Backend + `apps/mobile-app/` in Flutter)

---

## 1. Architectural & Monorepo Transformation

### 1.1 Why a Google-First Split Architecture?

The repository was previously structured as a single flat Next.js 16 + Vinext (`@vinext/cloudflare`) application deployed to Cloudflare Workers. To align the entire stack around Google's native web, mobile, and cloud ecosystem without sacrificing instant organic SEO performance or rich cross-platform app capabilities, the repository has been restructured into a **Split Architecture Monorepo**:

1. **`apps/web-seo/` (Angular SSR & Static Prerendering — `terraco.com.br`)**
   - **Role:** Public discovery engine, organic search landing pages, OpenGraph/WhatsApp link previews, JSON-LD structured data (`RealEstateListing` + `BreadcrumbList`), and sub-second first contentful paint.
   - **Runtime Profile:** Angular (latest stable) with 100% Standalone Components, **Zoneless Change Detection** (`provideZonelessChangeDetection()`), **Signals-first reactivity**, **Hybrid Server-Side Rendering + Static Prerendering (SSG)** (`RenderMode.Prerender`), **Incremental Hydration & Event Replay** (`withIncrementalHydration()`, `withEventReplay()`), **View Transitions API** (`withViewTransitions()`), and **Tailwind CSS v4**.
2. **`apps/mobile-app/` (Planned — Flutter Web & Native Mobile — `app.terraco.com.br` + Android/iOS)**
   - **Role:** High-interactivity client application for authenticated buyer journeys, financing calculators, visit scheduling, interactive floorplans, and real-time Firebase-synced favorites.
   - **Cross-App Handoff:** `apps/web-seo/src/app/core/site.config.ts` and `LancamentosService.buildFlutterAppDeepLink()` provide deterministic deep-linking into `FLUTTER_APP_URL` (`https://app.terraco.com.br`).
3. **`branding/` (Shared Design System Single Source of Truth)**
   - Preserves the **"Warm Brutalism / Sunlit Terracotta"** visual identity across both Angular and Flutter:
     - `branding/tokens.json` & `branding/tokens.css`: Canonical design tokens (`#FAF7F0` Warm Alabaster Canvas, `#161514` Deep Basalt Ink, `#C85A32` Sunlit Terracotta, `#2D4A3E` Deep Moss Leaf, `Fraunces` variable display serif, `Plus Jakarta Sans` UI sans, warm editorial shadows, and spring easing curves).
     - `branding/DESIGN.md`: Complete typography scale, spacing discipline, and anti-slop visual guardrails.
4. **`firebase.json` & `.firebaserc` (Firebase Multi-Site Hosting, App Hosting SSR & Emulator Suite)**
   - Replaces Cloudflare Workers (`cloudflare.config.ts`, `vite.config.ts`, `playwright.workers.config.ts`, `e2e-workers/`, `tests/workers/`).
   - Defines project alias `terraco-platform` with two distinct Hosting targets:
     - `web-seo` (`terraco-web-seo`): serves prerendered browser assets from `apps/web-seo/dist/web-seo/browser` with immutable caching headers and SSR Cloud Run / Functions fallback.
     - `mobile-app` (`terraco-mobile-app`): pre-configured for Flutter Web builds at `apps/mobile-app/build/web`.
   - Configures the **Firebase Emulator Suite** (`auth`, `firestore`, `hosting`, `storage`) for local full-stack development.

### 1.2 Monorepo Layout Comparison

| Legacy Flat Repository (Next.js + Vinext) | New Split-Architecture Monorepo (Angular + Firebase + Flutter) |
| :--- | :--- |
| `src/app/layout.tsx`, `src/app/globals.css` | `apps/web-seo/src/index.html`, `apps/web-seo/src/styles.css`, `apps/web-seo/src/app/app.ts` |
| `src/app/page.tsx` | `apps/web-seo/src/app/pages/home.page.ts` |
| `src/app/lancamentos/page.tsx` | `apps/web-seo/src/app/pages/lancamentos.page.ts` |
| `src/app/lancamentos/[slug]/page.tsx` | `apps/web-seo/src/app/pages/lancamento-detail.page.ts` & `not-found.page.ts` |
| `src/app/robots.ts`, `src/app/sitemap.ts` | `apps/web-seo/public/robots.txt`, `apps/web-seo/public/sitemap.xml`, & Express routes in `apps/web-seo/src/server.ts` |
| `src/data/lancamentos.ts`, `src/lib/site.ts` | `apps/web-seo/src/app/core/lancamentos.data.ts`, `lancamentos.service.ts`, `site.config.ts`, `seo.service.ts` |
| `src/components/FavoriteButton.tsx` | `apps/web-seo/src/app/core/favorites.service.ts` & `components/launches/favorite-button.component.ts` |
| `src/components/hero-svg/*.tsx`, `Hero*.tsx` | `apps/web-seo/src/app/components/hero/*.component.ts` + `.component.svg` templates |
| `src/components/Navbar*.tsx`, `Footer.tsx`, `TerracoLogo.tsx` | `apps/web-seo/src/app/components/layout/*.component.ts` |
| `cloudflare.config.ts`, `vite.config.ts`, `next.config.ts` | `firebase.json`, `.firebaserc`, `apps/web-seo/angular.json` |

---

## 2. Framework Mapping (Next.js / React / Cloudflare → Angular / Firebase)

### 2.1 Reactivity & State Management: React Hooks → Angular Signals & Zoneless

| React / Next.js Pattern | Angular Signals & Zoneless Implementation |
| :--- | :--- |
| `useState(initialValue)` in `HeroSearchForm.tsx` | `readonly query = signal<string>('');` with synchronous template updates under `provideZonelessChangeDetection()` |
| `useSyncExternalStore(subscribeFavorites, getFavoritesSnapshot, getServerSnapshot)` in `FavoriteButton.tsx` | `FavoritesService` (`@Injectable({ providedIn: 'root' })`) holding `readonly favorites = signal<string[]>([])`, guarded for SSR via `isPlatformBrowser(inject(PLATFORM_ID))`, synchronizing across components and browser tabs via `localStorage` (`terraco:favoritos`) and CustomEvent (`terraco-favorites-change`) |
| Props (`interface Props { ... }`) | Signal inputs (`input<T>()`, `input.required<T>()`) consumed directly in `computed()` expressions and templates |
| `useRef<HTMLInputElement>(null)` / `useRef<HTMLVideoElement>(null)` | Signal view queries: `viewChild<ElementRef<HTMLInputElement>>('inputRef')` and `viewChild<ElementRef<HTMLVideoElement>>('videoRef')` |
| `useEffect(...)` for browser-only `IntersectionObserver` & `matchMedia('(prefers-reduced-motion: reduce)')` in `HeroAnimatedBackdrop.tsx` | `afterNextRender(() => { ... })` paired with `inject(DestroyRef).onDestroy(...)` so observers execute strictly on the browser after hydration and clean up deterministically |
| `usePathname()` in `NavbarLinks.tsx` | Reactive router signal in `NavbarLinksComponent` listening to `Router.events` (`NavigationEnd`) with `takeUntilDestroyed()` and `computed(() => this.currentUrl().startsWith('/lancamentos'))` |
| In-memory array imports (`LANCAMENTOS`, `filterLancamentos`) | `LancamentosService` exposing `lancamentos`, `searchQuery`, `activeFilter`, and `filteredLancamentos = computed(...)`, plus `LANCAMENTOS_DATA_SOURCE` and `FIREBASE_CONFIG` `InjectionToken`s for seamless `@angular/fire/firestore` integration |

### 2.2 Routing, Prerendering (SSG), Hydration & SEO Metadata

1. **Angular Router & View Transitions (`apps/web-seo/src/app/app.config.ts`)**
   - Configured with `provideRouter(routes, withViewTransitions(), withComponentInputBinding(), withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withPreloading(PreloadAllModules))`.
   - Route parameters (`:slug` on `lancamentos/:slug`) bind directly to component signal inputs (`readonly slug = input<string>('')`) via `withComponentInputBinding()`, with fallback support via `ActivatedRoute`.
2. **Hybrid Rendering & Build-Time Prerendering (`apps/web-seo/src/app/app.routes.server.ts`)**
   - Replaces Next.js `generateStaticParams()` and Cache Components with Angular's `ServerRoute[]` configuration:
     - `path: ''` → `RenderMode.Prerender`
     - `path: 'lancamentos'` → `RenderMode.Prerender`
     - `path: 'lancamentos/:slug'` → `RenderMode.Prerender` with `async getPrerenderParams() { return [{ slug: 'prime-view' }]; }`
     - `path: '**'` → `RenderMode.Server`
3. **Incremental Hydration & Event Replay**
   - `provideClientHydration(withEventReplay(), withIncrementalHydration())` ensures that prerendered HTML is non-destructively hydrated on the client without DOM flickering, replaying any early user clicks or search interactions captured prior to bootstrap.
4. **SEO Metadata & Structured Data (`apps/web-seo/src/app/core/seo.service.ts` & `PrimeViewLandingComponent`)**
   - Replaces Next.js `export const metadata: Metadata` and `generateMetadata()` with `SeoService`, which uses Angular's `Title`, `Meta`, and `DOCUMENT` tokens to set `<title>`, `description`, `canonical`, `og:*`, `twitter:*`, and `robots` tags during both server prerendering and client route transitions.
   - `PrimeViewLandingComponent` injects `DOCUMENT` to serialize the `<script type="application/ld+json" id="launch-jsonld">` payload containing both the `BreadcrumbList` and `RealEstateListing` schemas in the prerendered HTML response.

### 2.3 Layered Architectural SVGs & Strict SVG Namespace Preservation

A key visual signature of Terraço is the 4-layer full-bleed architectural illustration (`HeroSvgPrototype`) with 60fps CSS wind sway (`@keyframes terraco-sway-a`, `terraco-sway-b`, `terraco-sway-fg`, `terraco-sway-vine`) and the interactive 3-step `TerracoStairsMark` logo.

- **Challenge in Angular:** Custom HTML element tags (such as `<app-facade-backdrop>`) nested inside an `<svg>` element are parsed by the browser and compiler in the HTML namespace rather than `http://www.w3.org/2000/svg`, causing browsers to ignore child `<g>`, `<path>`, `<defs>`, and `<linearGradient>` nodes.
- **Solution Applied:**
  1. Each SVG layer component uses an **attribute selector targeting `<svg:g>`**:
     - `FacadeBackdropComponent` → `selector: 'g[appFacadeBackdrop]'`, `templateUrl: './facade-backdrop.component.svg'`
     - `BalconyFoliageComponent` → `selector: 'g[appBalconyFoliage]'`, `templateUrl: './balcony-foliage.component.svg'`
     - `FacadeForegroundStructureComponent` → `selector: 'g[appFacadeForegroundStructure]'`, `templateUrl: './facade-foreground-structure.component.svg'`
     - `ForegroundFoliageComponent` → `selector: 'g[appForegroundFoliage]'`, `templateUrl: './foreground-foliage.component.svg'`
  2. External `.svg` template files instruct the Angular template compiler to emit all elements inside the `http://www.w3.org/2000/svg` namespace automatically.
  3. All JSX camelCase SVG attributes (`strokeWidth`, `strokeLinecap`, `fillOpacity`, `clipPath`, `stopColor`, `floodOpacity`, etc.) were converted to standard kebab-case SVG attributes (`stroke-width`, `stroke-linecap`, `fill-opacity`, `clip-path`, `stop-color`, `flood-opacity`), while preserving case-sensitive SVG attributes (`viewBox`, `preserveAspectRatio`, `stdDeviation`, `gradientUnits`, `gradientTransform`, `filterUnits`, `patternUnits`).
  4. `HeroSvgPrototypeComponent` composes the four layers cleanly inside `<svg viewBox="0 0 720 1280" preserveAspectRatio="xMinYMin slice">`:
     ```html
     <svg:g appFacadeBackdrop />
     <svg:g appBalconyFoliage />
     <svg:g appFacadeForegroundStructure />
     <svg:g appForegroundFoliage />
     ```

### 2.4 Playwright Instant Navigation Test Suite Adaptation (`e2e/instant-navigation.spec.ts`)

- Removed the Next.js-specific `import { instant } from "@next/playwright"` dependency (which relied on Next.js internal testing globals and `EXPOSE_TESTING_API=1`).
- Implemented an Angular-native `instant(page, action, options)` helper with the exact same signature:
  - **Initial Hard Load Mode (`{ baseURL }` passed):** Verifies that the prerendered/SSR response renders the App Shell (`site-header`, `site-navbar`), hero SVG backdrop, and route content immediately with zero loading skeletons (`Carregando lançamento` count = `0`) and zero uncaught `pageerror` exceptions.
  - **Client-Side SPA Transition Mode (`options` omitted):** Tags `window.__terracoSpaMarker = true` before executing `action()` and asserts `window.__terracoSpaMarker === true` after navigation completes—proving Angular Router performed an instant in-memory SPA transition without a full document reload, with zero loading skeletons and zero runtime errors.
- Preserved all 9 original E2E test blocks and every single accessibility/DOM assertion (`getByTestId`, `getByRole`, `aria-current="page"`, 404 heading hierarchy) and added a 10th E2E test verifying raw HTTP GET responses for `/`, `/lancamentos`, `/lancamentos/prime-view`, `/robots.txt`, and `/sitemap.xml` (checking prerendered HTML, `<title>`, `og:title`, and `application/ld+json`).

---

## 3. Build, SSR & Playwright E2E Verification Results

### 3.1 Angular Production SSR & Prerender Build (`npm run build`)

- **Command:** `npm run build` (`ng build` in `apps/web-seo`)
- **Prerendered Static Routes (SSG):**
  - `/` (`HomePageComponent` → `apps/web-seo/dist/web-seo/browser/index.html`)
  - `/lancamentos` (`LancamentosPageComponent` → `apps/web-seo/dist/web-seo/browser/lancamentos/index.html`)
  - `/lancamentos/prime-view` (`LancamentoDetailPageComponent` via `getPrerenderParams()` → `apps/web-seo/dist/web-seo/browser/lancamentos/prime-view/index.html`)
- **Static & SSR Crawler Metadata Endpoints:**
  - `/robots.txt` (`apps/web-seo/dist/web-seo/browser/robots.txt` & Express route in `server.ts`)
  - `/sitemap.xml` (`apps/web-seo/dist/web-seo/browser/sitemap.xml` & Express route in `server.ts`)
- **Dynamic Server Fallback Route (SSR):**
  - `/**` (`NotFoundPageComponent` / dynamic slug evaluation via `RenderMode.Server`)
- **Exact Build Output:**
  ```text
  Browser bundles
  Initial chunk files  | Names            |  Raw size | Estimated transfer size
  main-B3BQM2JN.js     | main             | 410.77 kB |               101.76 kB
  styles-UD7BOV3X.css  | styles           |  44.80 kB |                 7.47 kB

                       | Initial total    | 455.57 kB |               109.23 kB

  Server bundles
  Initial chunk files  | Names            |  Raw size
  server.mjs           | server           | 946.67 kB |
  main.server.mjs      | main.server      | 460.77 kB |
  polyfills.server.mjs | polyfills.server | 243.30 kB |
  chunk-C2KJ4ATU.mjs   | -                |   1.54 kB |
  chunk-KYQQYI4M.mjs   | -                |   1.01 kB |

  Lazy chunk files     | Names            |  Raw size
  chunk-RBXOAK24.mjs   | xhr2             |  12.17 kB |
  chunk-XDZ7ZLR6.mjs   | xhr2             |  12.08 kB |

  Prerendered 3 static routes.
  Application bundle generation complete. [5.778 seconds]
  Output location: /home/gustavo-fonseca/Projetos/terraco-website/apps/web-seo/dist/web-seo
  ```

### 3.2 Playwright E2E Verification (`PLAYWRIGHT_PORT=3105 npm run test:e2e -- --workers=1`)

- **Test Suite:** `e2e/instant-navigation.spec.ts` (11 tests, 11 passed in 17.1s)
  1. `✓ renders / static shell immediately on initial load (460ms)`
  2. `✓ renders /lancamentos static shell immediately on initial load (339ms)`
  3. `✓ renders prerendered /lancamentos/prime-view immediately on initial load (320ms)`
  4. `✓ renders not-found on unknown /lancamentos/[slug] (384ms)`
  5. `✓ navigates instantly from / to /lancamentos (920ms)`
  6. `✓ prefetches product title when navigating from /lancamentos CTA link to /lancamentos/prime-view (854ms)`
  7. `✓ prefetches product title when navigating from /lancamentos title link to /lancamentos/prime-view (909ms)`
  8. `✓ prefetches product title when navigating from /lancamentos image link to /lancamentos/prime-view (895ms)`
  9. `✓ navigates instantly from /lancamentos/prime-view back to /lancamentos (852ms)`
  10. `✓ serves prerendered SSR HTML and SEO metadata for routes, robots.txt, and sitemap.xml (60ms)`
  11. `✓ renders 4-layer SVG hero in SVG namespace, submits hero search, and persists favorites toggle (2.0s)`
- **Status:** **PASSED (11/11 tests, 0 console/page errors)**
