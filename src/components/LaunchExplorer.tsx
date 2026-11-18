"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  Car,
  MapPin,
  Maximize2,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import {
  LANCAMENTOS,
  SEARCH_SUGGESTIONS,
  filterLancamentos,
  formatCurrencyBRL,
  type Lancamento,
} from "@/data/lancamentos";

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

function normalizeInitialFilter(tagParam?: string): string {
  if (!tagParam) return "Todos";
  const found = QUICK_FILTERS.find(
    (filter) => filter.toLowerCase() === tagParam.trim().toLowerCase()
  );
  return found ?? "Todos";
}

interface LaunchExplorerProps {
  initialQuery?: string;
  initialTag?: string;
}

export function LaunchExplorer({
  initialQuery = "",
  initialTag = "",
}: LaunchExplorerProps) {
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<string>(() =>
    normalizeInitialFilter(initialTag)
  );

  function syncUrl(nextQuery: string, nextFilter: string) {
    const params = new URLSearchParams();
    if (nextQuery.trim()) {
      params.set("q", nextQuery.trim());
    }
    if (nextFilter !== "Todos") {
      params.set("tag", nextFilter);
    }
    const qs = params.toString();
    const nextUrl = qs ? `/lancamentos?${qs}` : "/lancamentos";
    window.history.replaceState(null, "", nextUrl);
  }

  function handleQueryChange(nextQuery: string) {
    setQuery(nextQuery);
    syncUrl(nextQuery, activeFilter);
  }

  function handleFilterChange(nextFilter: string) {
    setActiveFilter(nextFilter);
    syncUrl(query, nextFilter);
  }

  function handleClearAll() {
    setQuery("");
    setActiveFilter("Todos");
    syncUrl("", "Todos");
  }

  const filteredLaunches = useMemo(
    () => filterLancamentos(query, activeFilter),
    [query, activeFilter]
  );

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const section = document.getElementById("resultados-lancamentos");
    section?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      {/* CABEÇALHO DO CATÁLOGO */}
      <section className="mx-auto w-full max-w-6xl px-6 pt-32 pb-8 md:pt-36 md:pb-10">
        <div className="space-y-6">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-surface px-3.5 py-1.5 text-xs font-semibold text-ink">
              <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
              Curadoria Terraço · São Paulo
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-[1.1] text-balance">
              Lançamentos selecionados
            </h1>
            <p className="text-base sm:text-lg text-ink-muted leading-relaxed">
              Plantas claras, bairros caminháveis e atendimento direto no
              WhatsApp sem cadastro longo.
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Barra de busca em pílula */}
            <form
              onSubmit={handleSearchSubmit}
              role="search"
              aria-label="Filtrar lançamentos"
              className="flex w-full max-w-xl items-center gap-1.5 sm:gap-2 rounded-pill border border-border-subtle bg-elevated p-1.5 pl-3.5 sm:pl-4 shadow-card transition-[border-color,box-shadow] duration-150 focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-brand/25"
            >
              <label htmlFor="catalog-search" className="sr-only">
                Buscar por bairro, cidade ou lançamento
              </label>
              <Search
                className="h-5 w-5 shrink-0 text-ink-muted"
                aria-hidden="true"
              />
              <input
                id="catalog-search"
                type="search"
                enterKeyHint="search"
                list="catalog-sugestoes"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Buscar bairro ou lançamento..."
                className="w-full min-w-0 rounded-pill bg-transparent px-2 py-2 text-sm sm:text-base text-ink placeholder:text-ink-muted [&::-webkit-search-cancel-button]:hidden"
              />
              {query.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleQueryChange("")}
                  aria-label="Limpar busca"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-pill text-ink-muted transition-colors hover:bg-surface hover:text-ink cursor-pointer"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
              <button
                type="submit"
                className="terraco-btn inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-pill bg-brand px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-ink-inverse hover:bg-brand-hover cursor-pointer"
              >
                Buscar
              </button>
              <datalist id="catalog-sugestoes">
                {SEARCH_SUGGESTIONS.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </form>

            {/* Bairros em destaque */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
              <span className="font-semibold text-ink mr-1">Bairros:</span>
              {LANCAMENTOS.map((item) => {
                const isSelected =
                  query.trim().toLowerCase() === item.bairro.toLowerCase();
                return (
                  <button
                    key={item.slug}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() =>
                      handleQueryChange(isSelected ? "" : item.bairro)
                    }
                    className={`terraco-btn inline-flex min-h-[36px] items-center rounded-pill border px-3.5 py-1.5 text-xs font-semibold cursor-pointer ${
                      isSelected
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-border-subtle bg-elevated text-ink hover:bg-surface"
                    }`}
                  >
                    {item.bairro}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CATÁLOGO DE LANÇAMENTOS */}
      <section
        id="resultados-lancamentos"
        className="mx-auto w-full max-w-6xl px-6 pb-12 md:pb-16 scroll-mt-24"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-border-subtle">
          <p
            aria-live="polite"
            className="text-sm font-medium text-ink-muted tabular-nums"
          >
            {filteredLaunches.length === 1
              ? "1 lançamento disponível"
              : `${filteredLaunches.length} lançamentos disponíveis`}
            {activeFilter !== "Todos" ? ` · filtro: ${activeFilter}` : ""}
            {query.trim() ? ` · busca: “${query.trim()}”` : ""}
          </p>

          {/* Filtros rápidos */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filtros por característica"
          >
            {QUICK_FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleFilterChange(filter)}
                  className={`terraco-btn inline-flex min-h-[44px] items-center rounded-pill px-4 py-2 text-xs sm:text-sm font-semibold cursor-pointer ${
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
          <div className="rounded-lg border border-border-subtle bg-elevated p-10 sm:p-12 text-center shadow-card">
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink mb-2">
              Nenhum lançamento encontrado
              {query.trim() ? ` para “${query.trim()}”` : ""}
            </h2>
            <p className="text-sm sm:text-base text-ink-muted mb-6 max-w-md mx-auto">
              Tente buscar por outro bairro (Vila Madalena, Pinheiros ou
              Perdizes) ou limpe os filtros para ver todos os empreendimentos.
            </p>
            <button
              type="button"
              onClick={handleClearAll}
              className="terraco-btn inline-flex min-h-[44px] items-center justify-center rounded-pill bg-brand px-6 py-2.5 text-sm font-semibold text-ink-inverse hover:bg-brand-hover cursor-pointer"
            >
              Mostrar todos os lançamentos
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredLaunches.map((item, index) => (
              <article
                key={item.slug}
                className="terraco-card group flex flex-col overflow-hidden rounded-lg border border-border-subtle bg-elevated shadow-card hover:border-ink/20"
              >
                {/* Área visual do card */}
                <Link
                  href={`/lancamentos/${item.slug}`}
                  className={`relative block h-52 overflow-hidden border-b ${COVER_STYLES[item.corCapa]}`}
                  aria-label={`Ver detalhes de ${item.nome}`}
                >
                  <Image
                    src={item.imagem}
                    alt={item.imagemAlt}
                    width={item.imagemWidth}
                    height={item.imagemHeight}
                    loading="eager"
                    priority={index === 0}
                    sizes="(min-width: 1024px) 360px, (min-width: 768px) 46vw, 94vw"
                    className="terraco-card-media absolute inset-0 h-full w-full object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-ink/15"
                  />

                  <div className="relative z-10 flex h-full flex-col justify-between p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-block rounded-pill bg-highlight px-3 py-1 text-xs font-bold text-ink shadow-sm">
                        {item.badge}
                      </span>
                      <span className="rounded-pill bg-elevated/95 px-3 py-1 text-xs font-semibold text-ink shadow-sm">
                        {item.entrega}
                      </span>
                    </div>

                    <div className="flex items-end justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-pill bg-elevated/95 px-3 py-1 text-xs font-semibold text-ink shadow-sm">
                        <MapPin
                          className="h-3.5 w-3.5 text-brand"
                          aria-hidden="true"
                        />
                        {item.bairro}, {item.cidade}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Conteúdo do card */}
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-display text-xl font-semibold text-ink mb-2">
                    <Link
                      href={`/lancamentos/${item.slug}`}
                      className="hover:text-brand transition-colors"
                    >
                      {item.nome}
                    </Link>
                  </h2>
                  <p className="text-sm text-ink-muted leading-relaxed mb-4 line-clamp-2">
                    {item.resumo}
                  </p>

                  {/* Metadados */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-ink-muted mb-4">
                    <span className="inline-flex items-center gap-1">
                      <BedDouble
                        className="h-3.5 w-3.5 text-brand"
                        aria-hidden="true"
                      />
                      {item.quartos}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Maximize2
                        className="h-3.5 w-3.5 text-brand"
                        aria-hidden="true"
                      />
                      {item.metragem}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Car
                        className="h-3.5 w-3.5 text-brand"
                        aria-hidden="true"
                      />
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
                      <span className="block text-xs font-medium text-ink-muted">
                        A partir de
                      </span>
                      <span className="text-lg font-bold text-ink tabular-nums">
                        {formatCurrencyBRL(item.precoAPartirDe)}
                      </span>
                    </div>

                    <Link
                      href={`/lancamentos/${item.slug}`}
                      className="terraco-btn inline-flex min-h-[44px] items-center gap-1.5 rounded-pill bg-brand px-4 py-2.5 text-xs sm:text-sm font-semibold text-ink-inverse hover:bg-brand-hover"
                    >
                      <span>Ver detalhes</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
        className="mx-auto w-full max-w-6xl px-6 py-8 md:py-12 scroll-mt-24"
      >
        <div className="rounded-lg border border-border-subtle bg-surface/70 p-8 md:p-12">
          <div className="max-w-xl mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-2">
              Simples do começo ao fim
            </h2>
            <p className="text-sm md:text-base text-ink-muted leading-relaxed">
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
