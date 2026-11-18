"use client";

import { Search } from "lucide-react";

interface HeroSearchProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSearchSubmit: () => void;
}

export function HeroSearch({
  query,
  onQueryChange,
  onSearchSubmit,
}: HeroSearchProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearchSubmit();
  }

  return (
    <section
      className="hero hero--split"
      data-enter=""
      aria-labelledby="hero-h"
    >
      <div className="wrap">
        <div className="hero-text grid hero__grid">
          <div className="hero__text span-5">
            <p className="hero__kicker">
              <span className="dot" aria-hidden="true" />
              Vila Madalena, Pinheiros e Perdizes · 3 lançamentos
            </p>
            <h1 id="hero-h">
              Lançamentos imobiliários em São Paulo, sem burocracia.
            </h1>
            <p className="hero__lead">
              Curadoria de apartamentos na planta a partir de R$ 485.000, com
              planta clara e visita marcada no WhatsApp.
            </p>

            <form
              onSubmit={handleSubmit}
              className="terraco-search-wrap"
              role="search"
              aria-label="Buscar lançamentos"
            >
              <label htmlFor="hero-search" className="terraco-search__label">
                Buscar por bairro ou imóvel
              </label>
              <div className="terraco-search">
                <Search
                  className="h-5 w-5 shrink-0 text-ink-muted"
                  aria-hidden="true"
                />
                <input
                  id="hero-search"
                  type="text"
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder="Ex.: Vila Madalena, 2 quartos, varanda..."
                  className="terraco-search__input"
                />
                <button type="submit" className="btn btn--primary">
                  Ver imóveis
                </button>
              </div>
            </form>
          </div>

          <div className="hero__media span-6 start-7">
            <img
              src="/images/hero-terraco.jpg"
              alt="Ilustração isométrica de uma mulher tomando café no terraço de um prédio brasileiro com cobogós e varandas"
              width={1142}
              height={2048}
              fetchPriority="high"
            />
            <div className="ly-float">
              <div className="ly-float__row">
                <span>Vila Madalena</span>
                <span>Entrega 2027</span>
              </div>
              <div className="ly-float__title">
                Residencial Ipê Amarelo · 2 quartos
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
