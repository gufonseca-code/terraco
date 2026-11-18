import type { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LaunchExplorer } from "@/components/LaunchExplorer";

export const metadata: Metadata = {
  title: "Lançamentos selecionados em São Paulo",
  description:
    "Explore lançamentos residenciais na Vila Madalena, Pinheiros e Perdizes com plantas claras e visita marcada no WhatsApp.",
};

async function LaunchExplorerWithParams({
  searchParams,
}: Pick<PageProps<"/lancamentos">, "searchParams">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const tag = typeof params.tag === "string" ? params.tag : "";

  return (
    <LaunchExplorer
      key={`${q}::${tag}`}
      initialQuery={q}
      initialTag={tag}
    />
  );
}

export default function LancamentosPage({
  searchParams,
}: PageProps<"/lancamentos">) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <Navbar />
      <main
        id="conteudo-principal"
        tabIndex={-1}
        className="flex-1 flex flex-col"
      >
        <Suspense fallback={<LaunchExplorer />}>
          <LaunchExplorerWithParams searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
