"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { HeroIllustration } from "./HeroIllustration";

export function HeroSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/lancamentos?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/lancamentos");
    }
  }

  return (
    <section className="relative flex-1 overflow-hidden">
      <div className="mx-auto grid h-full max-w-7xl items-center gap-8 pl-6 pr-0 pt-6 lg:grid-cols-12 lg:gap-4 lg:pl-12 lg:pt-0">
        {/* Coluna esquerda: Headline + Search Bar em pílula */}
        <div className="lg:col-span-6 pr-6 lg:pr-4 space-y-8 z-10 pt-24 pb-8 lg:py-0">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.75rem] font-bold tracking-tight text-ink leading-[1.06] max-w-[13ch]">
            Seu próximo canto, sem burocracia.
          </h1>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 rounded-pill border border-border-subtle bg-elevated p-1.5 pl-4 shadow-card max-w-md sm:max-w-lg"
          >
            <label htmlFor="hero-search" className="sr-only">
              Buscar por bairro ou lançamento
            </label>
            <Search className="h-5 w-5 shrink-0 text-ink-muted" />
            <input
              id="hero-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por bairro ou imóvel..."
              className="w-full min-w-0 bg-transparent py-2 text-sm sm:text-base text-ink placeholder:text-ink-muted/75 focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-pill bg-brand px-5 py-2.5 text-sm font-semibold text-ink-inverse transition-colors hover:bg-brand-hover cursor-pointer"
            >
              Explorar imóveis
            </button>
          </form>
        </div>

        {/* Coluna direita: Parte superior da ilustração preenchendo a tela */}
        <div className="lg:col-span-6 self-end">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}
