import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LaunchExplorer } from "@/components/LaunchExplorer";

export const metadata: Metadata = {
  title: "Lançamentos",
  description:
    "Novolar Prime View no Estoril, Belo Horizonte: 2 quartos com suíte, 49 a 103 m² e lazer completo.",
};

export default function LancamentosPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <Navbar />
      <main id="homepage" tabIndex={-1} className="flex flex-1 flex-col">
        <LaunchExplorer />
      </main>
      <Footer />
    </div>
  );
}
