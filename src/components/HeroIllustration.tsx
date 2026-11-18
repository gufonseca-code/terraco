import Image from "next/image";
import heroTerracoImg from "../../public/images/hero-terraco.jpg";

export function HeroIllustration() {
  return (
    <div className="relative w-full h-[430px] sm:h-[540px] lg:h-dvh overflow-hidden select-none flex items-start justify-end">
      <Image
        src={heroTerracoImg}
        alt="Ilustração isométrica de uma mulher tomando café no terraço de um prédio brasileiro com cobogós e varandas"
        sizes="(min-width: 1024px) 1200px, (min-width: 640px) 1080px, 750px"
        priority
        loading="eager"
        decoding="sync"
        fetchPriority="high"
        quality={95}
        className="w-full max-w-[520px] lg:max-w-[600px] xl:max-w-[660px] h-[155%] sm:h-[160%] lg:h-[165%] object-cover object-top"
      />
    </div>
  );
}
