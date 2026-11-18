import { Navbar } from "@/components/Navbar";
import { HeroSearch } from "@/components/HeroSearch";

export default function Home() {
  return (
    <div className="flex min-h-screen lg:h-screen lg:overflow-hidden flex-col bg-canvas">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <HeroSearch />
      </main>
    </div>
  );
}
