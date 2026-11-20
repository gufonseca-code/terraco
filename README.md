# Terraço Platform (`terraco-platform`)

Curated residential real estate launches platform for Belo Horizonte, MG, architected as a **Google-First Split Architecture** monorepo combining an **Angular SSR & Prerendered SEO Vitrine** (`apps/web-seo/`), shared **Sunlit Terracotta / Warm Brutalism** design tokens (`branding/`), **Firebase Multi-Site Hosting & Backend Infrastructure** (`firebase.json`, `.firebaserc`), and a planned **Flutter Cross-Platform Interactive App** (`apps/mobile-app/`).

---

## Tech Stack

- **Web SEO Vitrine (`apps/web-seo/`):** Angular `22.3.0` (100% Standalone Components, Zoneless Change Detection, Signals-first Reactivity, `@angular/ssr` Hybrid Rendering & Static Prerendering, Incremental Hydration + Event Replay, Router View Transitions)
- **Styling & Design System (`branding/`):** Tailwind CSS `4` (`@tailwindcss/postcss`), canonical design tokens (`branding/tokens.json`, `branding/tokens.css`, `branding/DESIGN.md`)
- **Typography:** `Fraunces` (variable display serif) and `Plus Jakarta Sans` (body & geometric UI sans)
- **Cloud & Hosting (`firebase.json`, `.firebaserc`):** Firebase Multi-Site Hosting (`web-seo` and `mobile-app` targets), Firebase App Hosting / Cloud Run SSR (`server.ts`), and Firebase Emulator Suite (`auth`, `firestore`, `hosting`, `storage`)
- **Verification (`e2e/`):** Playwright (`@playwright/test`) E2E & Instant Navigation regression suite (`e2e/instant-navigation.spec.ts`)

---

## Monorepo Architecture

```text
.
├── AGENTS.md                      # Engineering conventions & monorepo rules
├── MIGRATION_NOTES.md             # Complete Next.js/Cloudflare -> Angular/Firebase migration report
├── firebase.json                  # Multi-site Firebase Hosting (web-seo + mobile-app) & Emulator Suite
├── .firebaserc                    # Firebase project alias (terraco-platform) & hosting targets
├── instant-nav.rig.md             # Test rig contract for local Playwright verification
├── playwright.config.ts           # Builds & launches the Angular SSR server for E2E verification
├── branding/
│   ├── DESIGN.md                  # Visual direction, typography scale & anti-slop guardrails
│   ├── tokens.css                 # Canonical CSS custom properties (Ipê & Grafite / Sunlit Terracotta)
│   └── tokens.json                # Cross-platform JSON design tokens for Angular & Flutter
├── e2e/
│   └── instant-navigation.spec.ts # Instant navigation, SSR metadata, SVG namespace & interaction E2E tests
└── apps/
    └── web-seo/                   # Angular SSR/Prerendered SEO & High-Conversion Vitrine (terraco.com.br)
        ├── angular.json           # Angular CLI build, SSR & prerender configuration
        ├── public/                # Static assets (images/lancamentos/prime-view.webp, robots.txt, sitemap.xml)
        └── src/
            ├── index.html         # Root pt-BR shell, Google Fonts & default OpenGraph/Twitter tags
            ├── styles.css         # Tailwind CSS v4 @theme inline tokens, component primitives & 60fps keyframes
            ├── main.ts            # Client bootstrap with Zoneless & Incremental Hydration
            ├── main.server.ts     # Server bootstrap for Angular SSR & build-time Prerendering
            ├── server.ts          # Express SSR entry point (--port support, /robots.txt & /sitemap.xml routes)
            └── app/
                ├── app.ts                 # Root AppComponent (<router-outlet />)
                ├── app.config.ts          # Zoneless, View Transitions, PreloadAllModules & Event Replay
                ├── app.config.server.ts   # Server rendering providers (provideServerRendering(withRoutes(...)))
                ├── app.routes.ts          # Client routes (/, /lancamentos, /lancamentos/:slug, **)
                ├── app.routes.server.ts   # Hybrid ServerRoutes (RenderMode.Prerender + getPrerenderParams)
                ├── core/                  # Signals-first services (LancamentosService, FavoritesService, SeoService)
                ├── components/
                │   ├── hero/              # 4-layer architectural SVG scene (g[app...] selectors + .svg templates) & search
                │   ├── layout/            # Navbar, NavbarLinks, Footer & animated TerracoLogo
                │   └── launches/          # LaunchExplorer, PrimeViewLanding (with JSON-LD) & FavoriteButton
                └── pages/                 # HomePage, LancamentosPage, LancamentoDetailPage & NotFoundPage
```

### Hybrid Rendering & Prerender Strategy (`apps/web-seo`)

All public discovery routes are configured in `apps/web-seo/src/app/app.routes.server.ts` to prerender into static HTML at build time (`RenderMode.Prerender`), while dynamic unknown paths fall back to server rendering (`RenderMode.Server`):

| Route | Component | Rendering Mode | Purpose |
| :--- | :--- | :--- | :--- |
| `/` | `HomePageComponent` | `RenderMode.Prerender` (SSG) | Editorial hero with neighborhood/launch search and 4-layer animated SVG facade |
| `/lancamentos` | `LancamentosPageComponent` | `RenderMode.Prerender` (SSG) | Curated launch catalog with `FavoriteButtonComponent` and instant SPA links |
| `/lancamentos/:slug` | `LancamentoDetailPageComponent` | `RenderMode.Prerender` (`prime-view`) | Launch detail page with specs `<dl>`, WhatsApp CTA, and `RealEstateListing` JSON-LD |
| `/**` | `NotFoundPageComponent` | `RenderMode.Server` (SSR) | Custom `404 / This page could not be found.` handling |
| `/robots.txt` | Static + `server.ts` | Static / Express | Crawler directives and sitemap reference |
| `/sitemap.xml` | Static + `server.ts` | Static / Express | XML sitemap listing `/`, `/lancamentos`, and `/lancamentos/prime-view` |

---

## Local Development & Verification

Run all commands from the monorepo root:

```bash
# Install dependencies
npm install
npm --prefix apps/web-seo install

# Start Angular development server (http://localhost:4200)
npm run dev

# Build production browser + SSR + prerendered bundles (apps/web-seo/dist/web-seo/)
npm run build

# Start production Angular SSR Express server on a custom port
npm run start -- --port 3105

# Run the Playwright Instant Navigation & SSR E2E suite
PLAYWRIGHT_PORT=3105 npm run test:e2e -- --workers=1
```

For full technical details on the architectural migration from Next.js + Vinext/Cloudflare Workers to Angular + Firebase + Flutter, see [MIGRATION_NOTES.md](MIGRATION_NOTES.md).
