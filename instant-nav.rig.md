# instant-nav rig: terraco-website

- BUILD: `EXPOSE_TESTING_API=1 npm run build && npm run start -- --port ${PLAYWRIGHT_PORT:-3100}` (managed by `playwright.config.ts` `webServer`)
- EXPOSE: `EXPOSE_TESTING_API=1` sets `experimental.exposeTestingApiInProductionBuild: true` in `next.config.ts`
- RUN: `PLAYWRIGHT_PORT=3105 npm run test:e2e -- --workers=1` (sets `baseURL` to `http://localhost:3105` in `playwright.config.ts`; also accepts `PLAYWRIGHT_BASE_URL`)
- TEST USER: public; no authentication; state: static in-memory `LANCAMENTOS` catalog (`prime-view`), locale `pt-BR`
- DRIFT: none known; catalog data is static in `src/data/lancamentos.ts` and `generateStaticParams` includes `prime-view`
- CONTRACTS:
  - `/lancamentos` CTA link `"Conhecer lançamento"` (`href="/lancamentos/prime-view"`) -> `/lancamentos/prime-view`: App Shell (`Navbar`, `Footer`) and product title `<h1>Prime View</h1>` ready before click; viewport trigger
  - `/lancamentos` card title link `"Prime View"` (`href="/lancamentos/prime-view"`) -> `/lancamentos/prime-view`: App Shell (`Navbar`, `Footer`) and product title `<h1>Prime View</h1>` ready before click; viewport trigger
  - `/lancamentos` card image link `"Conhecer Prime View"` (`href="/lancamentos/prime-view"`) -> `/lancamentos/prime-view`: App Shell (`Navbar`, `Footer`) and product title `<h1>Prime View</h1>` ready before click; viewport trigger
- LOOP: local build -> start -> test via Playwright `webServer` on a dedicated `PLAYWRIGHT_PORT` (stops server on exit) -> edit -> repeat; agent limits: none for local runs
- LIVENESS: n/a; local build and start
- WALLS: Pre-existing `next-server` on port `3100` when `reuseExistingServer: !process.env.CI` is active in `playwright.config.ts` can serve a stale build if port `3100` is reused; resolved by setting a fresh `PLAYWRIGHT_PORT=3105` (or stopping the listener on `3100` before running).
