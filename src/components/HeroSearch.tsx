import { HeroIllustration } from "./HeroIllustration";
import { HeroSearchForm } from "./HeroSearchForm";

export function HeroSearch() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative flex-1 overflow-hidden"
    >
      <div className="mx-auto grid h-full max-w-7xl items-center gap-6 sm:gap-8 pl-6 pr-0 pt-4 lg:grid-cols-12 lg:gap-4 lg:pl-12 lg:pt-0">
        {/* Coluna esquerda: Headline + Search Bar em pílula */}
        <div className="lg:col-span-6 pr-6 lg:pr-4 space-y-6 sm:space-y-8 z-10 pt-24 pb-4 sm:pb-8 lg:py-0">
          <h1
            id="hero-heading"
            className="hero-enter-title font-display text-4xl sm:text-5xl lg:text-[3.75rem] font-bold tracking-tight text-ink leading-[1.06] max-w-[13ch] text-balance"
          >
            Seu próximo canto, sem burocracia.
          </h1>

          <HeroSearchForm />
        </div>

        {/* Coluna direita: Parte superior da ilustração preenchendo a tela */}
        <div className="lg:col-span-6 self-end">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}
