import { expect, test } from "@playwright/test";
import { instant } from "@next/playwright";

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
        await expect(page.getByTestId("hero-backdrop")).toBeVisible();
        await expect(
          page.getByTestId("hero-backdrop").locator("svg")
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
        ).toBeVisible();
        await expect(
          page.getByRole("heading", { level: 1, name: "Lançamentos" })
        ).toBeVisible();
        await expect(
          page.getByRole("heading", { level: 2, name: "Novolar Prime View" })
        ).toBeVisible();
        await expect(
          page.getByRole("link", { name: "Conhecer lançamento" })
        ).toBeVisible();
      },
      { baseURL }
    );
  });

  test("renders prerendered /lancamentos/novolar-prime-view immediately on initial load", async ({
    page,
    baseURL,
  }) => {
    await instant(
      page,
      async () => {
        await page.goto("/lancamentos/novolar-prime-view");
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
          page.getByRole("heading", { level: 1, name: "Novolar Prime View" })
        ).toBeVisible();
        await expect(
          page.getByText("Estoril, Belo Horizonte, MG")
        ).toBeVisible();
        await expect(
          page.getByRole("link", { name: "Voltar para lançamentos" })
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
        page.getByRole("heading", { level: 2, name: "Novolar Prime View" })
      ).toBeVisible();
    });
  });

  test("prefetches product title when navigating from /lancamentos CTA link to /lancamentos/novolar-prime-view", async ({
    page,
  }) => {
    await page.goto("/lancamentos", { waitUntil: "networkidle" });
    const link = page.getByRole("link", {
      name: "Conhecer lançamento",
      exact: true,
    });
    await expect(link).toBeVisible();

    await instant(page, async () => {
      await link.click();
      await page.waitForURL(
        (url) => url.pathname === "/lancamentos/novolar-prime-view"
      );
      await expect(
        page.getByRole("link", { name: "Terraço, página inicial" }).first()
      ).toBeVisible();
      await expect(
        page.getByRole("contentinfo").getByText("Belo Horizonte, MG")
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { level: 1, name: "Novolar Prime View" })
      ).toBeVisible();
      await expect(page.getByLabel("Carregando lançamento")).toHaveCount(0);
    });
  });

  test("prefetches product title when navigating from /lancamentos title link to /lancamentos/novolar-prime-view", async ({
    page,
  }) => {
    await page.goto("/lancamentos", { waitUntil: "networkidle" });
    const link = page.getByRole("link", {
      name: "Novolar Prime View",
      exact: true,
    });
    await expect(link).toBeVisible();

    await instant(page, async () => {
      await link.click();
      await page.waitForURL(
        (url) => url.pathname === "/lancamentos/novolar-prime-view"
      );
      await expect(
        page.getByRole("link", { name: "Terraço, página inicial" }).first()
      ).toBeVisible();
      await expect(
        page.getByRole("contentinfo").getByText("Belo Horizonte, MG")
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { level: 1, name: "Novolar Prime View" })
      ).toBeVisible();
      await expect(page.getByLabel("Carregando lançamento")).toHaveCount(0);
    });
  });

  test("prefetches product title when navigating from /lancamentos image link to /lancamentos/novolar-prime-view", async ({
    page,
  }) => {
    await page.goto("/lancamentos", { waitUntil: "networkidle" });
    const link = page.getByRole("link", {
      name: "Conhecer Novolar Prime View",
      exact: true,
    });
    await expect(link).toBeVisible();

    await instant(page, async () => {
      await link.click();
      await page.waitForURL(
        (url) => url.pathname === "/lancamentos/novolar-prime-view"
      );
      await expect(
        page.getByRole("link", { name: "Terraço, página inicial" }).first()
      ).toBeVisible();
      await expect(
        page.getByRole("contentinfo").getByText("Belo Horizonte, MG")
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { level: 1, name: "Novolar Prime View" })
      ).toBeVisible();
      await expect(page.getByLabel("Carregando lançamento")).toHaveCount(0);
    });
  });

  test("navigates instantly from /lancamentos/novolar-prime-view back to /lancamentos", async ({
    page,
  }) => {
    await page.goto("/lancamentos/novolar-prime-view", {
      waitUntil: "networkidle",
    });

    await instant(page, async () => {
      await page
        .getByRole("link", { name: "Voltar para lançamentos" })
        .click();
      await page.waitForURL((url) => url.pathname === "/lancamentos");
      await expect(
        page.getByRole("heading", { level: 1, name: "Lançamentos" })
      ).toBeVisible();
    });
  });
});
