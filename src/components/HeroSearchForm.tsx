"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { SEARCH_SUGGESTIONS } from "@/data/lancamentos";

export function HeroSearchForm() {
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
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Buscar lançamentos"
      className="hero-enter-form flex items-center gap-1.5 sm:gap-2 rounded-pill border border-border-subtle bg-elevated p-1.5 pl-3.5 sm:pl-4 shadow-card max-w-md sm:max-w-lg transition-[border-color,box-shadow] duration-150 focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-brand/25"
    >
      <label htmlFor="hero-search" className="sr-only">
        Buscar por bairro ou imóvel
      </label>
      <Search className="h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />
      <input
        id="hero-search"
        type="search"
        enterKeyHint="search"
        list="terraco-sugestoes"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Bairro ou imóvel..."
        className="w-full min-w-0 rounded-pill bg-transparent px-2 py-2.5 text-sm sm:text-base text-ink placeholder:text-ink-muted [&::-webkit-search-cancel-button]:hidden"
      />
      {query.length > 0 && (
        <button
          type="button"
          onClick={() => setQuery("")}
          aria-label="Limpar busca"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-pill text-ink-muted transition-colors hover:bg-surface hover:text-ink cursor-pointer"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
      <button
        type="submit"
        className="terraco-btn inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-pill bg-brand px-4 sm:px-5 py-2.5 text-sm font-semibold text-ink-inverse hover:bg-brand-hover cursor-pointer"
      >
        Explorar imóveis
      </button>
      <datalist id="terraco-sugestoes">
        {SEARCH_SUGGESTIONS.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
    </form>
  );
}
