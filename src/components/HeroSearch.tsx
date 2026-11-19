import Link from "next/link";
import { LANCAMENTOS, SEARCH_SUGGESTIONS } from "@/data/lancamentos";
import { HeroIllustration } from "./HeroIllustration";
import { HeroSearchForm } from "./HeroSearchForm";

const QUICK_NEIGHBORHOODS = Array.from(
  new Set(LANCAMENTOS.map((item) => item.bairro))
);

export function HeroSearch() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative flex flex-1 flex-col overflow-hidden lg:justify-center"
    >
      {/* Rail editorial alinhado à Navbar */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="relative space-y-6 py-6 sm:space-y-8 sm:py-10 lg:max-w-[50%] lg:space-y-9 lg:py-20">
          {/* Véu sutil de Creme Papel no mobile para preservar contraste sobre a fachada */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-6 top-0 -bottom-20 -z-10 bg-gradient-to-b from-canvas/95 via-canvas/92 via-78% to-transparent md:hidden"
          />
          <div className="terraco-reveal space-y-4">
            <h1
              id="hero-heading"
              className="font-display text-[clamp(2.5rem,5vw,3.85rem)] font-bold leading-[1.06] tracking-[-0.025em] text-ink max-w-[13ch] text-balance"
            >
              Seu próximo canto, sem burocracia.
            </h1>

            <p className="text-base sm:text-lg leading-[1.55] text-ink-muted max-w-[42ch] md:max-w-[30ch] lg:max-w-[42ch]">
              Lançamentos em Belo Horizonte, direto no WhatsApp.
            </p>
          </div>

          <div className="terraco-reveal-delay space-y-3">
            <HeroSearchForm suggestions={SEARCH_SUGGESTIONS} />

            <nav
              aria-label="Bairros em destaque"
              className="flex flex-wrap items-center gap-x-6 gap-y-1 pl-1"
            >
              {QUICK_NEIGHBORHOODS.map((bairro) => (
                <Link
                  key={bairro}
                  href={`/lancamentos?q=${encodeURIComponent(bairro)}`}
                  className="terraco-link-underline inline-flex min-h-[44px] items-center text-sm font-medium text-ink-muted transition-colors duration-150 hover:text-ink focus-visible:text-ink"
                >
                  {bairro}
                </Link>
              ))}
              <Link
                href="/lancamentos"
                className="terraco-link-underline inline-flex min-h-[44px] items-center text-sm font-semibold text-brand transition-colors duration-150 hover:text-brand-hover focus-visible:text-brand-hover"
              >
                Ver lançamentos
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Fachada arquitetônica ancorada na borda direita e base do viewport */}
      <HeroIllustration />
    </section>
  );
}
