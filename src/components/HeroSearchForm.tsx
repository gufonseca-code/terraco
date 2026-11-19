"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface HeroSearchFormProps {
  suggestions: string[];
}

export function HeroSearchForm({ suggestions }: HeroSearchFormProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
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

  function handleClear() {
    setQuery("");
    inputRef.current?.focus();
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Buscar lançamentos"
      className="flex items-center gap-2 rounded-pill border border-border-subtle bg-elevated p-1.5 pl-5 max-w-lg shadow-chip transition-[border-color,box-shadow] duration-150 hover:border-ink/25 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 focus-within:shadow-card"
    >
      <label htmlFor="hero-search" className="sr-only">
        Buscar por bairro ou lançamento
      </label>
      <input
        ref={inputRef}
        id="hero-search"
        type="search"
        enterKeyHint="search"
        list="terraco-sugestoes"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Bairro ou lançamento"
        className="w-full min-w-0 bg-transparent py-2.5 pr-2 text-sm sm:text-base text-ink placeholder:text-ink-muted focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {query.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpar busca"
          className="inline-flex min-h-[40px] shrink-0 items-center rounded-pill px-3 text-xs font-medium text-ink-muted transition-colors duration-150 hover:bg-surface/70 hover:text-ink cursor-pointer"
        >
          Limpar
        </button>
      )}
      <button
        type="submit"
        className="terraco-btn terraco-btn-moss inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-pill bg-brand px-5 sm:px-6 py-2.5 text-sm font-semibold leading-[1.35] text-ink-inverse hover:bg-brand-hover cursor-pointer"
      >
        <span>Explorar</span>
        <span className="hidden sm:inline">&nbsp;imóveis</span>
      </button>
      <datalist id="terraco-sugestoes">
        {suggestions.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
    </form>
  );
}
