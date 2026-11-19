import Image from "next/image";
import heroTerracoBg from "../../public/images/hero-terraco-bg.jpg";

export function HeroIllustration() {
  return (
    <div className="terraco-reveal-delay relative ml-auto flex min-h-[300px] w-[92%] flex-1 overflow-hidden select-none sm:min-h-[380px] sm:w-[80%] lg:pointer-events-none lg:absolute lg:inset-y-0 lg:right-0 lg:ml-0 lg:min-h-0 lg:w-[44vw] lg:max-w-[720px] xl:w-[45vw]">
      <Image
        src={heroTerracoBg}
        alt="Ilustração editorial de fachada residencial brasileira com varandas ensolaradas, portas em amarelo ipê e rosa goiaba, guarda-corpos em grafite e plantas tropicais"
        fill
        sizes="(min-width: 1280px) 45vw, (min-width: 1024px) 44vw, (min-width: 640px) 80vw, 92vw"
        priority
        loading="eager"
        decoding="sync"
        fetchPriority="high"
        quality={95}
        className="object-cover object-left-top"
      />
      {/* Transição sutil na borda esquerda para fusão limpa com o fundo Creme Papel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-canvas via-canvas/30 to-transparent sm:w-14"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-canvas to-transparent lg:hidden"
      />
    </div>
  );
}
