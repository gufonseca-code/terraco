import { Navbar } from "@/components/Navbar";
import { HeroSearch } from "@/components/HeroSearch";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <Navbar />
      <main
        id="homepage"
        tabIndex={-1}
        className="flex flex-1 flex-col"
      >
        <HeroSearch />
      </main>
    </div>
  );
}
