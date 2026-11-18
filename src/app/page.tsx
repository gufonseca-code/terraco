import { Navbar } from "@/components/Navbar";
import { HeroSearch } from "@/components/HeroSearch";

export default function Home() {
  return (
    <div className="flex min-h-dvh lg:h-dvh lg:min-h-[640px] lg:overflow-hidden flex-col bg-canvas">
      <Navbar />
      <main
        id="conteudo-principal"
        tabIndex={-1}
        className="flex-1 flex flex-col"
      >
        <HeroSearch />
      </main>
    </div>
  );
}
