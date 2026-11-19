# Terraço Website

Curated residential real estate launches platform for Belo Horizonte, MG, built with Next.js App Router and direct WhatsApp lead conversion.

## Tech Stack

- **Framework:** Next.js `16.4.6` (App Router, Turbopack, Cache Components & Partial Prefetching)
- **UI & Language:** React `19.3.0`, TypeScript `5`, Tailwind CSS `4.3.3` (`@tailwindcss/turbopack`)
- **Typography:** `Fraunces` (display) and `Plus Jakarta Sans` (body) via `next/font/google`
- **Testing:** Playwright (`@playwright/test`) + `@next/playwright` `instant()` regression suite

---

## Project Architecture

### App Router & Rendering Strategy

The application uses Next.js `cacheComponents: true` and `partialPrefetching: true` in [next.config.ts](next.config.ts). All primary routes prerender cleanly into static HTML shells:

| Route | Source | Rendering | Purpose |
| --- | --- | --- | --- |
| `/` | `src/app/page.tsx` | Static (`○`) | Editorial hero with neighborhood/launch search and layered SVG facade |
| `/lancamentos` | `src/app/lancamentos/page.tsx` | Static (`○`) | Curated launch catalog with `FavoriteButton` and eager `prefetch={true}` links |
| `/lancamentos/[slug]` | `src/app/lancamentos/[slug]/page.tsx` | Partial Prerender (`◐`) / Static (`○` for `prime-view`) | Launch detail page; `generateStaticParams()` prerenders `/lancamentos/prime-view` |
| `/robots.txt` | `src/app/robots.ts` | Static | Crawler directives and sitemap reference |
| `/sitemap.xml` | `src/app/sitemap.ts` | Static | Dynamic sitemap generated from `LANCAMENTOS` |
| `/icon.svg` | `src/app/icon.svg` | Static | Brand staircase app icon |

`src/app/lancamentos/[slug]/page.tsx` wraps `LancamentoDetalheContent` in a `<Suspense>` boundary (`LancamentoDetalheFallback`) to keep the navigation shell instant while resolving route `params` and validating slugs via `notFound()`.

### Directory Structure

```text
.
├── .github/workflows/e2e.yml      # CI pipeline: lint, tsc, Playwright instant() E2E
├── e2e/instant-navigation.spec.ts # Instant navigation & prefetching E2E assertions
├── instant-nav.rig.md             # Test rig contract for local Playwright verification
├── next.config.ts                 # Cache Components, Partial Prefetching, images, Turbopack CSS
├── playwright.config.ts           # Starts production build with EXPOSE_TESTING_API=1
├── public/
│   ├── images/lancamentos/        # Property photography (e.g. prime-view.webp)
│   └── videos/                    # Optional hero backdrop video assets
└── src/
    ├── app/
    │   ├── globals.css            # Tailwind v4 theme tokens, shadows, keyframe animations
    │   ├── layout.tsx             # Root metadata, viewport, Google fonts, pt-BR shell
    │   ├── page.tsx               # Home route
    │   ├── robots.ts              # robots.txt metadata route
    │   ├── sitemap.ts             # sitemap.xml metadata route
    │   └── lancamentos/
    │       ├── page.tsx           # /lancamentos catalog route
    │       └── [slug]/page.tsx    # /lancamentos/[slug] detail route + generateMetadata
    ├── components/
    │   ├── hero-svg/              # Layered animated SVG architecture & foliage components
    │   ├── FavoriteButton.tsx     # Client favorite toggle synced to localStorage via useSyncExternalStore
    │   ├── Footer.tsx             # Site footer with static TerracoLogo and WhatsApp CTA
    │   ├── HeroAnimatedBackdrop.tsx # Motion- and visibility-aware video backdrop component
    │   ├── HeroIllustration.tsx   # Positioned hero SVG backdrop with edge gradient masks
    │   ├── HeroSearch.tsx         # Server hero layout + quick neighborhood links
    │   ├── HeroSearchForm.tsx     # Client search bar with datalist suggestions
    │   ├── HeroSvgPrototype.tsx   # Composes hero-svg layers into a responsive SVG scene
    │   ├── LaunchExplorer.tsx     # Catalog card for LANCAMENTOS with eager prefetching
    │   ├── Navbar.tsx             # Sticky pill header with skip link and Suspense-wrapped links
    │   ├── NavbarLinks.tsx        # Client active-route link indicator (usePathname)
    │   ├── PrimeViewLanding.tsx   # Launch detail card, specs list, WhatsApp CTA, and JSON-LD
    │   └── TerracoLogo.tsx        # TerracoStairsMark + animated/static wordmark
    ├── data/
    │   └── lancamentos.ts         # Static catalog (LANCAMENTOS), search helpers, WhatsApp URL builder
    └── lib/
        └── site.ts                # Centralized SITE_NAME and SITE_URL resolution
```

### Data & State Model

- **Static Catalog (`src/data/lancamentos.ts`):** Launch entries (`Lancamento`) are stored in-memory in `LANCAMENTOS` and queried via `getLancamentoBySlug()` and `filterLancamentos()`. No database or external API is required at runtime.
- **Client Persistence (`src/components/FavoriteButton.tsx`):** Favorite toggles persist slugs in `localStorage` under `terraco:favoritos` using `useSyncExternalStore` with cross-tab `storage` and custom `terraco-favorites-change` event listeners.
- **Lead Conversion:** CTAs construct pre-filled `https://wa.me/...` links via `buildWhatsAppUrl()`. Note that `WHATSAPP_NUMBER` is currently a placeholder (`5511999999999`) to be replaced before production launch.

### SEO Architecture

- **Site URL & Canonical Links:** `src/lib/site.ts` reads `NEXT_PUBLIC_SITE_URL` (defaulting to `http://localhost:3000`) for `metadataBase`, canonical links (`alternates.canonical`), `robots.txt`, `sitemap.xml`, and JSON-LD URLs.
- **Social & Search Metadata:** `src/app/lancamentos/[slug]/page.tsx` generates per-launch `title`, `description`, `alternates.canonical`, `openGraph`, and `twitter` metadata (`summary_large_image` using the launch's `.webp` image). Unknown slugs return `robots: { index: false, follow: false }` and `404`.
- **Structured Data:** `src/components/PrimeViewLanding.tsx` embeds sanitized Schema.org JSON-LD (`BreadcrumbList` + `RealEstateListing` / `ApartmentComplex`) directly in the prerendered HTML.

---

## Local Development & Verification

```bash
# Install dependencies
npm install

# Run Next.js development server (Turbopack)
npm run dev

# Run vinext development server (Vite + Cloudflare Workers runtime)
npm run dev:vinext

# Lint and type-check (including generated Cloudflare Worker types)
npm run lint && npx tsc --noEmit

# Production builds
npm run build         # Standard Next.js production build
npm run build:vinext  # Vite + Cloudflare Workers production build (prerenders static routes)

# Preview built Cloudflare Worker locally in workerd
npm run start:vinext

# Run Playwright instant() E2E suite (builds with EXPOSE_TESTING_API=1)
npm run test:e2e
```

### Environment Variables

| Variable | Required in Production | Default | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Yes | `http://localhost:3000` | Public origin used for `metadataBase`, canonicals, OpenGraph, JSON-LD, `sitemap.xml`, and `robots.txt` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Yes | `""` | WhatsApp destination number (digits only, DDI + DDD + number) used by `buildWhatsAppUrl()` |
| `EXPOSE_TESTING_API` | No (`1` for E2E only) | Unset | Enables `experimental.exposeTestingApiInProductionBuild` in `next.config.ts` for `@next/playwright` |

---

## Cloudflare Workers Deployment

This project is configured to run on **Cloudflare Workers** via `vinext`, `@vinext/cloudflare`, and the Cloudflare CLI (`cf`), while keeping standard `next dev` / `next build` / `next start` intact:

- **`cloudflare.config.ts`:** Defines Worker `terraco-website` (`vinext/server/fetch-handler`, `compatibilityDate: "2026-11-19"`), `ASSETS` binding, static assets routing, and Workers Logs & Traces observability (`observability.enabled` + `observability.traces.enabled`).
- **`vite.config.ts`:** Configures `vinext` with `staticAssetsAdapter()` (`--cdn-cache=static-assets`, `--data-cache=none`, `--image-optimization=none`, `prerender: { routes: "*" }`) and `@cloudflare/vite-plugin`.
- **`postcss.config.mjs`:** Compiles Tailwind CSS v4 (`@tailwindcss/postcss`) under Vite (since Vite does not execute `turbopack.rules`).
- **`tsconfig.json` & `eslint.config.mjs`:** Include `.cloudflare/types` for Worker type-checking and ignore `.cloudflare/**`, `.vinext/**`, and `dist/**`.

### Deploy Steps

1. Authenticate with Cloudflare (or set `CLOUDFLARE_API_TOKEN` in CI):
   ```bash
   npx cf auth login
   ```
2. Set `NEXT_PUBLIC_SITE_URL` to your production domain and replace the placeholder `WHATSAPP_NUMBER` in `src/data/lancamentos.ts`.
3. If deploying directly from a local workspace, ensure unused gitignored template folders (`public/assets/`, `public/images/standins/`) are not present in `public/` so they are not uploaded as Worker assets.
4. Build and deploy:
   ```bash
   npm run deploy:vinext
   ```

