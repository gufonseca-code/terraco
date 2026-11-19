import { HeroSvgPrototype } from "./HeroSvgPrototype";

export function HeroIllustration() {
  return (
    <div
      data-testid="hero-backdrop"
      className="terraco-reveal-delay pointer-events-none absolute inset-y-0 right-0 w-[96%] overflow-hidden select-none sm:w-[82%] md:w-[54%] lg:w-[44vw] lg:max-w-[720px] xl:w-[45vw]"
    >
      <HeroSvgPrototype className="h-full w-full" />
      {/* Transição sutil na borda esquerda para fusão limpa com o fundo Creme Papel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-canvas via-canvas/45 to-transparent sm:w-20 md:w-44 md:via-canvas/90 lg:w-14 lg:via-canvas/30"
      />
    </div>
  );
}
