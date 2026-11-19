import { describe, expect, it } from "vitest";
import { env } from "cloudflare:workers";
import {
  LANCAMENTOS,
  buildWhatsAppUrl,
  filterLancamentos,
  getLancamentoBySlug,
} from "../../src/data/lancamentos";
import { SITE_NAME, SITE_URL } from "../../src/lib/site";

describe("Workers runtime environment", () => {
  it("runs inside workerd with Web Crypto and ASSETS binding", async () => {
    expect(typeof crypto.randomUUID()).toBe("string");
    expect(env).toBeDefined();

    const assetResponse = await env.ASSETS.fetch(
      "https://example.com/images/lancamentos/prime-view.webp"
    );
    expect(assetResponse.status).toBe(200);
    await assetResponse.body?.cancel();
  });

  it("loads site metadata constants and launch catalog in workerd", () => {
    expect(SITE_NAME).toBe("Terraço");
    expect(SITE_URL).toMatch(/^https?:\/\//);
    expect(LANCAMENTOS.length).toBeGreaterThan(0);

    const primeView = getLancamentoBySlug("prime-view");
    expect(primeView?.nome).toBe("Prime View");
    expect(getLancamentoBySlug("inexistente")).toBeUndefined();

    expect(filterLancamentos("Estoril", "Todos")).toHaveLength(1);
    expect(filterLancamentos("BairroInexistente", "Todos")).toHaveLength(0);

    const whatsappUrl = buildWhatsAppUrl("Olá!");
    expect(whatsappUrl).toContain("https://wa.me/");
    expect(whatsappUrl).toContain(encodeURIComponent("Olá!"));
  });
});
