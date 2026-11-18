import Image from "next/image";

export function HeroIllustration() {
  return (
    <div className="relative w-full h-[460px] sm:h-[540px] lg:h-screen overflow-hidden select-none flex items-start justify-end">
      <Image
        src="/images/hero-terraco.jpg"
        alt="Ilustração isométrica de uma mulher tomando café no terraço de um prédio brasileiro com cobogós e varandas"
        width={1142}
        height={2048}
        priority
        quality={95}
        className="w-full max-w-[520px] lg:max-w-[600px] xl:max-w-[660px] h-[155%] sm:h-[160%] lg:h-[165%] object-cover object-top"
      />
    </div>
  );
}
