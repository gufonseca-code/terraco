"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  Car,
  MapPin,
  Maximize2,
  Search,
  Sparkles,
} from "lucide-react";
import {
  LANCAMENTOS,
  formatCurrencyBRL,
  type Lancamento,
} from "@/data/lancamentos";
import { HeroIllustration } from "./HeroIllustration";

const QUICK_FILTERS = [
  "Todos",
  "2 quartos",
  "3 quartos",
  "Varanda",
  "Sol da manhã",
] as const;

const COVER_STYLES: Record<Lancamento["corCapa"], string> = {
  ipe: "bg-accent/20 border-accent/30",
  moss: "bg-brand/15 border-brand/25",
  guava: "bg-highlight/20 border-highlight/30",
};

export function LaunchExplorer() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("Todos");

  const filteredLaunches = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return LANCAMENTOS.filter((item) => {
      const matchesFilter =
        activeFilter === "Todos" ||
        item.quartos.toLowerCase().includes(activeFilter.toLowerCase()) ||
        item.tags.some(
          (tag) => tag.toLowerCase() === activeFilter.toLowerCase()
        );

      if (!matchesFilter) return false;
      if (!normalized) return true;

      const searchable = [
        item.nome,
        item.bairro,
        item.cidade,
        item.quartos,
        item.resumo,
        ...item.tags,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalized);
    });
  }, [query, activeFilter]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const section = document.getElementById("lancamentos");
    section?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-ink leading-[1.08]">
                Seu próximo canto, sem burocracia.
              </h1>
              <p className="max-w-xl text-lg text-ink-muted leading-relaxed">
                Lançamentos imobiliários selecionados a dedo, com informações
                claras e atendimento direto no WhatsApp.
              </p>
            </div>

            {/* Barra de busca em pílula (referência do mockup) */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-[28px] sm:rounded-pill bg-elevated border border-border-subtle p-2 shadow-card max-w-xl"
            >
              <label htmlFor="hero-search" className="sr-only">
                Buscar imóveis por bairro, cidade ou nome
              </label>
              <div className="flex flex-1 items-center gap-3 pl-3 pr-2 py-1.5">
                <Search className="h-5 w-5 shrink-0 text-ink-muted" />
                <input
                  id="hero-search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por bairro, cidade ou lançamento..."
                  className="w-full bg-transparent text-sm sm:text-base text-ink placeholder:text-ink-muted/80"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-pill bg-brand px-6 py-3 text-sm font-semibold text-ink-inverse transition-colors hover:bg-brand-hover cursor-pointer"
              >
                Explorar imóveis
              </button>
            </form>

            {/* Chips rápidos */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
              <span className="font-medium mr-1">Destaques:</span>
              {["Vila Madalena", "Pinheiros", "Perdizes"].map((bairro) => (
                <button
                  key={bairro}
                  type="button"
                  onClick={() => {
                    setQuery(bairro);
                    document
                      .getElementById("lancamentos")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-pill border border-border-subtle bg-elevated px-3 py-1 font-medium text-ink transition-colors hover:bg-surface cursor-pointer"
                >
                  {bairro}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* CATÁLOGO DE LANÇAMENTOS */}
      <section
        id="lancamentos"
        className="mx-auto max-w-6xl px-6 py-12 md:py-16 scroll-mt-20"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-surface px-3 py-1 text-xs font-semibold text-ink">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              Curadoria Terraço
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-ink">
              Lançamentos em destaque
            </h2>
          </div>

          {/* Filtros rápidos */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtros">
            {QUICK_FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-pill px-4 py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? "bg-brand text-ink-inverse"
                      : "bg-elevated border border-border-subtle text-ink-muted hover:text-ink hover:bg-surface"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        {filteredLaunches.length === 0 ? (
          <div className="rounded-lg border border-border-subtle bg-elevated p-12 text-center shadow-card">
            <p className="font-display text-xl font-semibold text-ink mb-2">
              Nenhum lançamento encontrado para &ldquo;{query}&rdquo;
            </p>
            <p className="text-sm text-ink-muted mb-6">
              Tente buscar por outro bairro ou limpe os filtros para ver todos os
              empreendimentos.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveFilter("Todos");
              }}
              className="rounded-pill bg-brand px-5 py-2.5 text-sm font-semibold text-ink-inverse hover:bg-brand-hover cursor-pointer"
            >
              Mostrar todos os lançamentos
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredLaunches.map((item) => (
              <article
                key={item.slug}
                className="group flex flex-col overflow-hidden rounded-lg border border-border-subtle bg-elevated shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-floating"
              >
                {/* Área visual do card */}
                <div
                  className={`relative h-48 border-b p-5 flex flex-col justify-between ${COVER_STYLES[item.corCapa]}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-block rounded-pill bg-highlight px-3 py-1 text-xs font-semibold text-ink-inverse">
                      {item.badge}
                    </span>
                    <span className="rounded-pill bg-elevated/90 px-3 py-1 text-xs font-medium text-ink">
                      {item.entrega}
                    </span>
                  </div>

                  {/* Grafismo sutil Degraus */}
                  <div className="flex items-end justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink">
                      <MapPin className="h-3.5 w-3.5 text-brand" />
                      {item.bairro}, {item.cidade}
                    </span>
                    <svg
                      viewBox="0 0 64 64"
                      fill="none"
                      className="h-8 w-8 text-ink/20"
                      aria-hidden="true"
                    >
                      <rect x="30" y="13" width="26" height="9" rx="2.5" fill="currentColor" />
                      <rect x="19" y="27.5" width="37" height="9" rx="2.5" fill="currentColor" />
                      <rect x="8" y="42" width="48" height="9" rx="2.5" fill="currentColor" />
                    </svg>
                  </div>
                </div>

                {/* Conteúdo do card */}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl font-semibold text-ink mb-2">
                    {item.nome}
                  </h3>
                  <p className="text-sm text-ink-muted leading-relaxed mb-4 line-clamp-2">
                    {item.resumo}
                  </p>

                  {/* Metadados */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-ink-muted mb-4">
                    <span className="inline-flex items-center gap-1">
                      <BedDouble className="h-3.5 w-3.5 text-brand" />
                      {item.quartos}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Maximize2 className="h-3.5 w-3.5 text-brand" />
                      {item.metragem}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Car className="h-3.5 w-3.5 text-brand" />
                      {item.vagas}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-sm bg-surface px-2.5 py-1 text-xs font-semibold text-ink-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Rodapé do card */}
                  <div className="mt-auto flex items-center justify-between gap-3 pt-4 border-t border-border-subtle">
                    <div>
                      <span className="block text-[11px] uppercase tracking-wider text-ink-muted">
                        A partir de
                      </span>
                      <span className="text-lg font-bold text-ink tabular-nums">
                        {formatCurrencyBRL(item.precoAPartirDe)}
                      </span>
                    </div>

                    <Link
                      href={`/lancamentos/${item.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-pill bg-brand px-4 py-2.5 text-xs sm:text-sm font-semibold text-ink-inverse transition-colors hover:bg-brand-hover"
                    >
                      <span>Ver detalhes</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* COMO FUNCIONA */}
      <section
        id="como-funciona"
        className="mx-auto max-w-6xl px-6 py-12 md:py-16 scroll-mt-20"
      >
        <div className="rounded-lg border border-border-subtle bg-surface/70 p-8 md:p-12">
          <div className="max-w-xl mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-2">
              Simples do começo ao fim
            </h2>
            <p className="text-sm md:text-base text-ink-muted">
              Sem cadastros intermináveis ou ligações indesejadas. Você escolhe
              o ritmo da conversa.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Explore os lançamentos",
                desc: "Filtre por bairro, metragem ou estilo de vida e veja apenas oportunidades selecionadas.",
              },
              {
                step: "02",
                title: "Conheça cada detalhe",
                desc: "Acesse a página do empreendimento para conferir plantas, localização e diferenciais.",
              },
              {
                step: "03",
                title: "Chame no WhatsApp",
                desc: "Tire dúvidas, peça a tabela atualizada ou agende uma visita em um clique.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-md bg-elevated border border-border-subtle p-6"
              >
                <span className="inline-block rounded-pill bg-accent/25 px-3 py-1 text-xs font-bold text-ink mb-4 tabular-nums">
                  {item.step}
                </span>
                <h3 className="font-display text-lg font-semibold text-ink mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
