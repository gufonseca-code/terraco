import { expect, test } from "@playwright/test";

test.describe("Cloudflare Workers runtime (workerd)", () => {
  test("serves prerendered routes and unoptimized static assets", async ({
    page,
  }) => {
    const homeResponse = await page.goto("/");
    expect(homeResponse?.status()).toBe(200);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Seu próximo canto, sem burocracia.",
      })
    ).toBeVisible();

    await page
      .getByRole("navigation", { name: "Navegação principal" })
      .getByRole("link", { name: "Lançamentos" })
      .click();
    await page.waitForURL((url) => url.pathname === "/lancamentos");

    const coverImage = page.getByTestId("lancamentos-cover-image");
    await expect(coverImage).toBeVisible();
    await expect(coverImage).toHaveAttribute(
      "src",
      "/images/lancamentos/prime-view.webp"
    );

    await page
      .getByRole("link", { name: "Conhecer lançamento", exact: true })
      .click();
    await page.waitForURL(
      (url) => url.pathname === "/lancamentos/prime-view"
    );
    await expect(
      page.getByRole("heading", { level: 1, name: "Prime View" })
    ).toBeVisible();
  });

  test("handles 404 routes, metadata endpoints, and protects private static cache", async ({
    page,
    request,
  }) => {
    const notFoundResponse = await page.goto("/lancamentos/slug-nao-listado");
    expect([200, 404]).toContain(notFoundResponse?.status());
    await expect(
      page.getByRole("heading", { level: 1, name: "404" })
    ).toBeVisible();

    const robotsResponse = await request.get("/robots.txt");
    expect(robotsResponse.status()).toBe(200);
    expect(await robotsResponse.text()).toContain("Sitemap:");

    const sitemapResponse = await request.get("/sitemap.xml");
    expect(sitemapResponse.status()).toBe(200);
    expect(await sitemapResponse.text()).toContain("/lancamentos/prime-view");

    for (const assetPath of [
      "/favicon.ico",
      "/icon.svg",
      "/apple-touch-icon.png",
      "/images/lancamentos/prime-view.webp",
    ]) {
      const assetResponse = await request.get(assetPath);
      expect(assetResponse.status(), assetPath).toBe(200);
    }

    const privateCacheResponse = await request.get(
      "/_vinext/static-cache/index.json"
    );
    expect(privateCacheResponse.status()).toBe(404);
  });
});
