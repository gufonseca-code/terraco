import { expect, test, type Page } from "@playwright/test";

declare global {
  interface Window {
    __terracoSpaMarker?: boolean;
  }
}

/**
 * Angular-native instant navigation & prerendered shell verification helper.
 * - For initial hard loads (`options?.baseURL` provided): verifies that Angular SSR/Prerendering
 *   renders the static shell and route content immediately with zero loading skeletons and zero page errors.
 * - For client-side SPA navigations (`options?.baseURL` omitted): sets a window marker before the navigation
 *   action and asserts that Angular Router transitions in-place without a full document reload, with zero
 *   loading skeletons and zero runtime errors.
 */
async function instant(
  page: Page,
  action: () => Promise<void>,
  options?: { baseURL?: string }
): Promise<void> {
  const pageErrors: string[] = [];
  const onPageError = (error: Error) => {
    pageErrors.push(error.message);
  };
  page.on("pageerror", onPageError);

  try {
    if (!options?.baseURL) {
      await page.evaluate(() => {
        window.__terracoSpaMarker = true;
      });
    }

    await action();

    if (!options?.baseURL) {
      const spaMarkerPreserved = await page.evaluate(
        () => window.__terracoSpaMarker === true
      );
      expect(spaMarkerPreserved).toBe(true);
    }

    await expect(page.getByLabel("Carregando lançamento")).toHaveCount(0);
    expect(pageErrors).toEqual([]);
  } finally {
    page.off("pageerror", onPageError);
  }
}

test.describe("Instant navigation", () => {
  test("renders / static shell immediately on initial load", async ({
    page,
    baseURL,
  }) => {
    await instant(
      page,
      async () => {
        await page.goto("/");
        await expect(page.getByTestId("site-header")).toBeVisible();
        await expect(
          page
            .getByTestId("site-header")
            .getByRole("link", { name: "Terraço, página inicial" })
        ).toBeVisible();
        await expect(page.getByTestId("site-navbar")).toBeVisible();
        await expect(
          page
            .getByTestId("site-navbar")
            .getByRole("link", { name: "Lançamentos", exact: true })
        ).toBeVisible();
        await expect(
          page.locator("app-botanical-arch-motif svg")
        ).toBeVisible();
        await expect(
          page.getByRole("heading", {
            level: 1,
            name: "Seu próximo canto, sem burocracia.",
          })
        ).toBeVisible();
        await expect(
          page.getByRole("combobox", { name: "Buscar por bairro ou lançamento" })
        ).toBeVisible();
      },
      { baseURL }
    );
  });

  test("renders /lancamentos static shell immediately on initial load", async ({
    page,
    baseURL,
  }) => {
    await instant(
      page,
      async () => {
        await page.goto("/lancamentos");
        await expect(page.getByTestId("site-header")).toBeVisible();
        await expect(
          page
            .getByTestId("site-header")
            .getByRole("link", { name: "Terraço, página inicial" })
        ).toBeVisible();
        await expect(page.getByTestId("site-navbar")).toBeVisible();
        await expect(
          page
            .getByTestId("site-navbar")
            .getByRole("link", { name: "Lançamentos", exact: true })
        ).toHaveAttribute("aria-current", "page");
        await expect(
          page.getByTestId("lancamentos-cover-image")
        ).toHaveCount(3);
        await expect(
          page.getByTestId("lancamentos-cover-image").first()
        ).toBeVisible();
        await expect(
          page.getByRole("heading", { level: 1, name: "Lançamentos" })
        ).toBeVisible();
        await expect(
          page.getByRole("heading", { level: 2, name: "Prime View" })
        ).toBeVisible();
        await expect(
          page.getByRole("link", { name: "Conhecer lançamento" }).first()
        ).toBeVisible();
      },
      { baseURL }
    );
  });

  test("renders prerendered /lancamentos/prime-view immediately on initial load", async ({
    page,
    baseURL,
  }) => {
    await instant(
      page,
      async () => {
        await page.goto("/lancamentos/prime-view");
        await expect(page.getByTestId("site-header")).toBeVisible();
        await expect(
          page
            .getByTestId("site-header")
            .getByRole("link", { name: "Terraço, página inicial" })
        ).toBeVisible();
        await expect(page.getByTestId("site-navbar")).toBeVisible();
        await expect(
          page
            .getByTestId("site-navbar")
            .getByRole("link", { name: "Lançamentos", exact: true })
        ).toHaveAttribute("aria-current", "page");
        await expect(page.getByTestId("launch-hero-image")).toBeVisible();
        await expect(
          page.getByRole("heading", { level: 1, name: "Prime View" })
        ).toBeVisible();
        await expect(
          page.getByText("Estoril, Belo Horizonte - MG", { exact: true })
        ).toBeVisible();
        await expect(
          page
            .getByLabel("Navegação estrutural")
            .getByRole("link", { name: "Lançamentos" })
        ).toBeVisible();
      },
      { baseURL }
    );
  });

  test("renders not-found on unknown /lancamentos/[slug]", async ({ page }) => {
    const response = await page.goto("/lancamentos/slug-nao-listado");
    expect([200, 404]).toContain(response?.status());
    await expect(
      page.getByRole("heading", { level: 1, name: "404" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "This page could not be found.",
      })
    ).toBeVisible();
  });

  test("navigates instantly from / to /lancamentos", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    await instant(page, async () => {
      await page
        .getByRole("navigation", { name: "Navegação principal" })
        .getByRole("link", { name: "Lançamentos" })
        .click();
      await page.waitForURL((url) => url.pathname === "/lancamentos");
      await expect(
        page.getByRole("heading", { level: 1, name: "Lançamentos" })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { level: 2, name: "Prime View" })
      ).toBeVisible();
    });
  });

  test("prefetches product title when navigating from /lancamentos CTA link to /lancamentos/prime-view", async ({
    page,
  }) => {
    await page.goto("/lancamentos", { waitUntil: "networkidle" });
    const link = page
      .getByRole("link", {
        name: "Conhecer lançamento",
        exact: true,
      })
      .first();
    await expect(link).toBeVisible();

    await instant(page, async () => {
      await link.click();
      await page.waitForURL(
        (url) => url.pathname === "/lancamentos/prime-view"
      );
      await expect(
        page.getByRole("link", { name: "Terraço, página inicial" }).first()
      ).toBeVisible();
      await expect(
        page.getByRole("contentinfo").getByText("Belo Horizonte, MG")
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { level: 1, name: "Prime View" })
      ).toBeVisible();
      await expect(page.getByLabel("Carregando lançamento")).toHaveCount(0);
    });
  });

  test("prefetches product title when navigating from /lancamentos title link to /lancamentos/prime-view", async ({
    page,
  }) => {
    await page.goto("/lancamentos", { waitUntil: "networkidle" });
    const link = page.getByRole("link", {
      name: "Prime View",
      exact: true,
    });
    await expect(link).toBeVisible();

    await instant(page, async () => {
      await link.click();
      await page.waitForURL(
        (url) => url.pathname === "/lancamentos/prime-view"
      );
      await expect(
        page.getByRole("link", { name: "Terraço, página inicial" }).first()
      ).toBeVisible();
      await expect(
        page.getByRole("contentinfo").getByText("Belo Horizonte, MG")
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { level: 1, name: "Prime View" })
      ).toBeVisible();
      await expect(page.getByLabel("Carregando lançamento")).toHaveCount(0);
    });
  });

  test("prefetches product title when navigating from /lancamentos image link to /lancamentos/prime-view", async ({
    page,
  }) => {
    await page.goto("/lancamentos", { waitUntil: "networkidle" });
    const link = page.getByRole("link", {
      name: "Conhecer Prime View",
      exact: true,
    });
    await expect(link).toBeVisible();

    await instant(page, async () => {
      await link.click();
      await page.waitForURL(
        (url) => url.pathname === "/lancamentos/prime-view"
      );
      await expect(
        page.getByRole("link", { name: "Terraço, página inicial" }).first()
      ).toBeVisible();
      await expect(
        page.getByRole("contentinfo").getByText("Belo Horizonte, MG")
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { level: 1, name: "Prime View" })
      ).toBeVisible();
      await expect(page.getByLabel("Carregando lançamento")).toHaveCount(0);
    });
  });

  test("navigates instantly from /lancamentos/prime-view back to /lancamentos", async ({
    page,
  }) => {
    await page.goto("/lancamentos/prime-view", {
      waitUntil: "networkidle",
    });

    await instant(page, async () => {
      await page
        .getByLabel("Navegação estrutural")
        .getByRole("link", { name: "Lançamentos" })
        .click();
      await page.waitForURL((url) => url.pathname === "/lancamentos");
      await expect(
        page.getByRole("heading", { level: 1, name: "Lançamentos" })
      ).toBeVisible();
    });
  });

  test("serves prerendered SSR HTML and SEO metadata for routes, robots.txt, and sitemap.xml", async ({
    request,
  }) => {
    const homeRes = await request.get("/");
    expect(homeRes.status()).toBe(200);
    const homeHtml = await homeRes.text();
    expect(homeHtml).toContain("<title>Terraço — Seu próximo canto, sem burocracia</title>");
    expect(homeHtml).toContain('property="og:title"');
    expect(homeHtml).toContain("Seu próximo canto, sem burocracia.");

    const lancamentosRes = await request.get("/lancamentos");
    expect(lancamentosRes.status()).toBe(200);
    const lancamentosHtml = await lancamentosRes.text();
    expect(lancamentosHtml).toMatch(/<title>.*Terraço.*<\/title>/);
    expect(lancamentosHtml).toContain('property="og:title"');
    expect(lancamentosHtml).toContain("Prime View");

    const detailRes = await request.get("/lancamentos/prime-view");
    expect(detailRes.status()).toBe(200);
    const detailHtml = await detailRes.text();
    expect(detailHtml).toMatch(/<title>.*Prime View.*<\/title>/);
    expect(detailHtml).toContain('property="og:title"');
    expect(detailHtml).toContain("Estoril");
    expect(detailHtml).toContain("Belo Horizonte - MG");
    expect(detailHtml).toContain("application/ld+json");

    const robotsRes = await request.get("/robots.txt");
    expect(robotsRes.status()).toBe(200);
    const robotsTxt = await robotsRes.text();
    expect(robotsTxt).toMatch(/User-Agent:\s*\*/i);
    expect(robotsTxt).toMatch(/Sitemap:\s*https?:\/\/.+\/sitemap\.xml/i);

    const sitemapRes = await request.get("/sitemap.xml");
    expect(sitemapRes.status()).toBe(200);
    const sitemapXml = await sitemapRes.text();
    expect(sitemapXml).toContain("<urlset");
    expect(sitemapXml).toContain("/lancamentos");
    expect(sitemapXml).toContain("/lancamentos/prime-view");
  });

  test("renders botanical motif SVG in SVG namespace, submits hero search, and persists favorites toggle", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Verify the botanical motif SVG renders in the http://www.w3.org/2000/svg namespace with non-zero geometry
    const svgCheck = await page.evaluate(() => {
      const svg = document.querySelector("app-botanical-arch-motif svg");
      if (!svg) return null;
      return {
        svgNamespace: svg.namespaceURI,
        rectWidth: svg.getBoundingClientRect().width,
        rectHeight: svg.getBoundingClientRect().height,
        childCount: svg.children.length,
      };
    });

    expect(svgCheck).not.toBeNull();
    expect(svgCheck?.svgNamespace).toBe("http://www.w3.org/2000/svg");
    expect(svgCheck?.rectWidth).toBeGreaterThan(50);
    expect(svgCheck?.rectHeight).toBeGreaterThan(50);
    expect(svgCheck?.childCount).toBeGreaterThan(0);

    // Verify the footer Risograph cobogó SVG renders in the SVG namespace with non-zero geometry
    const footerSvgCheck = await page.evaluate(() => {
      const svg = document.querySelector("app-footer-cobogo-backdrop svg");
      if (!svg) return null;
      return {
        svgNamespace: svg.namespaceURI,
        rectWidth: svg.getBoundingClientRect().width,
        rectHeight: svg.getBoundingClientRect().height,
        childCount: svg.children.length,
      };
    });

    expect(footerSvgCheck).not.toBeNull();
    expect(footerSvgCheck?.svgNamespace).toBe("http://www.w3.org/2000/svg");
    expect(footerSvgCheck?.rectWidth).toBeGreaterThan(200);
    expect(footerSvgCheck?.rectHeight).toBeGreaterThan(100);
    expect(footerSvgCheck?.childCount).toBeGreaterThan(0);

    const footer = page.getByRole("contentinfo");
    await expect(
      footer.getByRole("link", { name: "Lançamentos", exact: true })
    ).toBeVisible();
    await expect(
      footer.getByRole("link", { name: "Falar no WhatsApp", exact: true })
    ).toBeVisible();

    // Verify hero search input, clear button, and submission to /lancamentos?q=Estoril
    const searchInput = page.getByRole("combobox", {
      name: "Buscar por bairro ou lançamento",
    });
    await searchInput.fill("Buritis");
    const clearBtn = page.getByRole("button", { name: "Limpar busca" });
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(searchInput).toHaveValue("");

    await searchInput.fill("Estoril");
    await instant(page, async () => {
      await page.getByRole("button", { name: /Explorar/i }).click();
      await page.waitForURL(
        (url) =>
          url.pathname === "/lancamentos" &&
          url.searchParams.get("q") === "Estoril"
      );
      await expect(
        page.getByRole("heading", { level: 2, name: "Prime View" })
      ).toBeVisible();
    });

    // Verify Favorites toggle button updates aria-pressed and localStorage('terraco:favoritos')
    const favButton = page.getByRole("button", {
      name: "Salvar Prime View nos favoritos",
    });
    await expect(favButton).toBeVisible();
    await expect(favButton).toHaveAttribute("aria-pressed", "false");
    await favButton.click();

    const activeFavButton = page.getByRole("button", {
      name: "Remover Prime View dos favoritos",
    });
    await expect(activeFavButton).toBeVisible();
    await expect(activeFavButton).toHaveAttribute("aria-pressed", "true");

    const storedFavorites = await page.evaluate(() =>
      JSON.parse(window.localStorage.getItem("terraco:favoritos") ?? "[]")
    );
    expect(storedFavorites).toEqual(["prime-view"]);
  });

  test("shows Falar no WhatsApp button above the fold on mobile for /lancamentos/prime-view", async ({
    page,
    baseURL,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await instant(
      page,
      async () => {
        await page.goto("/lancamentos/prime-view");
        const whatsappBtn = page
          .locator("#homepage")
          .getByRole("link", {
            name: "Falar no WhatsApp",
          });
        await expect(whatsappBtn).toBeVisible();
        const box = await whatsappBtn.boundingBox();
        expect(box).not.toBeNull();
        expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(667);

        const footerBox = await page.locator("#contato").boundingBox();
        expect(footerBox).not.toBeNull();
        expect(footerBox?.y ?? 0).toBeGreaterThanOrEqual(667);
      },
      { baseURL }
    );
  });

  test("keeps footer below the fold without scrolling on desktop and mobile", async ({
    page,
    baseURL,
  }) => {
    for (const viewport of [
      { width: 1280, height: 720 },
      { width: 375, height: 667 },
    ]) {
      await page.setViewportSize(viewport);
      for (const route of ["/lancamentos", "/lancamentos/prime-view"]) {
        await instant(
          page,
          async () => {
            await page.goto(route);
            const footerBox = await page.locator("#contato").boundingBox();
            expect(footerBox).not.toBeNull();
            expect(footerBox?.y ?? 0).toBeGreaterThanOrEqual(viewport.height);
          },
          { baseURL }
        );
      }
    }
  });
});
