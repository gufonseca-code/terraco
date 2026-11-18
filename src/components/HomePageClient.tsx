"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LANCAMENTOS,
  buildWhatsAppUrl,
  formatCurrencyBRL,
  type Lancamento,
} from "@/data/lancamentos";
import { HeroSearch } from "./HeroSearch";

const QUICK_FILTERS = [
  "Todos",
  "2 quartos",
  "3 quartos",
  "Varanda",
  "Sol da manhã",
] as const;

export function HomePageClient() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("Todos");
  const [selectedLaunch, setSelectedLaunch] = useState<string>(
    LANCAMENTOS[0].nome
  );

  useEffect(() => {
    const el = document.getElementById("como-funciona");
    if (!el || el.classList.contains("is-live")) return;
    const loadMoments = new Function(
      'return import("/assets/moments/moments.js")'
    ) as () => Promise<{ mount: (node: Element) => Promise<unknown> }>;
    loadMoments()
      .then((mod) => mod.mount(el))
      .catch(() => {});
  }, []);

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

  function handleHeroSearchSubmit() {
    const target = document.getElementById("lancamentos");
    target?.scrollIntoView({ behavior: "smooth" });
  }

  function handleSelectForVisit(launch: Lancamento) {
    setSelectedLaunch(launch.nome);
    const target = document.getElementById("agendar");
    target?.scrollIntoView({ behavior: "smooth" });
  }

  const whatsappDirectHref = buildWhatsAppUrl(
    `Oi! Gostaria de agendar uma visita para conhecer o ${selectedLaunch}.`
  );

  return (
    <main id="top">
      <HeroSearch
        query={query}
        onQueryChange={setQuery}
        onSearchSubmit={handleHeroSearchSubmit}
      />

      {/* Seção 2: Lançamentos selecionados */}
      <section
        className="section"
        id="lancamentos"
        aria-labelledby="lancamentos-h"
      >
        <div className="wrap">
          <div className="section-head">
            <h2 id="lancamentos-h">
              Lançamentos em São Paulo.{" "}
              <span className="muted">
                Vila Madalena, Pinheiros e Perdizes.
              </span>
            </h2>
            <div
              className="terraco-filters"
              role="group"
              aria-label="Filtrar lançamentos por característica"
              style={{ marginTop: "var(--s-4)" }}
            >
              {QUICK_FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className="terraco-filter"
                  aria-pressed={activeFilter === filter}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {filteredLaunches.length > 0 ? (
            <div className="grid">
              {filteredLaunches.map((item) => (
                <article key={item.slug} className="card launch-card span-4">
                  <div className="launch-card__media">
                    <img
                      src={item.imagem}
                      alt={item.imagemAlt}
                      width={960}
                      height={640}
                      loading="lazy"
                      decoding="async"
                      data-source="stand-in"
                      data-subject="stand-in"
                    />
                  </div>

                  <div className="launch-card__body">
                    <div className="launch-card__meta">
                      <span>
                        {item.bairro}, {item.cidade}
                      </span>
                      <span className="launch-card__badge">{item.badge}</span>
                    </div>

                    <h3 className="launch-card__title">{item.nome}</h3>
                    <p>{item.resumo}</p>
                    <p className="launch-card__specs">
                      {item.quartos} · {item.metragem} · {item.vagas} ·{" "}
                      {item.entrega}
                    </p>

                    <div className="launch-card__foot">
                      <span className="launch-card__price">
                        A partir de {formatCurrencyBRL(item.precoAPartirDe)}
                      </span>
                      <button
                        type="button"
                        className="link"
                        onClick={() => handleSelectForVisit(item)}
                      >
                        Agendar visita
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="booking-panel">
              <p>
                Nenhum lançamento encontrado para &ldquo;{query}&rdquo;. Limpe a
                busca ou escolha outro filtro para ver os três empreendimentos.
              </p>
              <div className="btn-row">
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => {
                    setQuery("");
                    setActiveFilter("Todos");
                  }}
                >
                  Mostrar todos os imóveis
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Seção 3: Momento photo-chapters — Como funciona a curadoria */}
      <section
        className="section"
        id="como-funciona"
        data-moment="photo-chapters"
        aria-labelledby="como-funciona-h"
        suppressHydrationWarning
      >
        <div className="wrap mo-ph">
          <div className="mo-ph__head">
            <h2 id="como-funciona-h">Como a Terraço escolhe cada prédio</h2>
            <p>
              Três etapas antes de você pisar no decorado, para visitar só o que
              faz sentido na rotina.
            </p>
          </div>
          <ol className="mo-ph__list">
            <li className="mo-ph__ch">
              <figure className="mo-ph__pic">
                <img
                  src="/images/standins/photo-f150095329.jpg"
                  alt="Fachada residencial contemporânea clara com janelas amplas sob sol da manhã"
                  width={1280}
                  height={826}
                  data-source="stand-in"
                  data-subject="stand-in"
                />
              </figure>
              <h3>1. Curadoria de bairro e luz</h3>
              <p>
                Selecionamos edifícios em ruas arborizadas da zona oeste, com
                varanda aproveitável e boa incidência de sol.
              </p>
            </li>
            <li className="mo-ph__ch">
              <figure className="mo-ph__pic">
                <img
                  src="/images/standins/photo-f126438537.jpg"
                  alt="Sala de estar iluminada com marcenaria em madeira clara e cortinas em tom ocre"
                  width={1280}
                  height={853}
                  data-source="stand-in"
                  data-subject="stand-in"
                />
              </figure>
              <h3>2. Valores e planta abertos</h3>
              <p>
                Você confere metragem de área útil, vaga, previsão de entrega e
                preço inicial antes de mandar qualquer mensagem.
              </p>
            </li>
            <li className="mo-ph__ch">
              <figure className="mo-ph__pic">
                <img
                  src="/images/standins/photo-f19041498.jpg"
                  alt="Fachada residencial com brises de madeira, amplos vidros e jardim frontal"
                  width={1280}
                  height={962}
                  data-source="stand-in"
                  data-subject="stand-in"
                />
              </figure>
              <h3>3. Visita no seu horário</h3>
              <p>
                Marcamos o atendimento no decorado pelo WhatsApp ou formulário,
                sem ligações repetidas fora de hora.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* Seção 4: Dark band — Diferenciais */}
      <section
        className="section ground-inverse"
        id="diferenciais"
        aria-labelledby="diferenciais-h"
      >
        <div className="wrap grid grid--top">
          <div className="span-6">
            <div className="section-head">
              <h2 id="diferenciais-h">
                Compra de imóvel na planta sem rodeio.{" "}
                <span className="muted">
                  Informação direta desde o primeiro clique.
                </span>
              </h2>
            </div>
            <ul className="rows">
              <li>
                <span className="rows__name">
                  Preço inicial na vitrine
                  <small>
                    Valores a partir de R$ 485.000 visíveis sem cadastro prévio
                  </small>
                </span>
                <span className="rows__value">3 projetos</span>
              </li>
              <li>
                <span className="rows__name">
                  Plantas com varanda real
                  <small>
                    Metragens de 54 a 92 m² com 2 ou 3 quartos e 1 a 2 vagas
                  </small>
                </span>
                <span className="rows__value">54–92 m²</span>
              </li>
              <li>
                <span className="rows__name">
                  Contato em canal único
                  <small>
                    Conversa direta no WhatsApp com quem conhece a obra
                  </small>
                </span>
                <span className="rows__value">WhatsApp</span>
              </li>
              <li>
                <span className="rows__name">
                  Prazo de entrega claro
                  <small>
                    Empreendimentos com entrega prevista entre 2026 e 2027
                  </small>
                </span>
                <span className="rows__value">2026–2027</span>
              </li>
            </ul>
          </div>

          <div className="span-6 start-7">
            <figure className="section__photo">
              <img
                src="/images/standins/photo-f154597551-960.jpg"
                alt="Ambiente residencial com plantas naturais, piso quente e janela ampla com persianas de madeira"
                width={960}
                height={644}
                loading="lazy"
                decoding="async"
                data-source="stand-in"
                data-subject="stand-in"
              />
            </figure>
          </div>
        </div>
      </section>

      {/* Seção 5: Formulário de agendamento (booking-form) */}
      <section className="section" id="agendar" aria-labelledby="agendar-h">
        <div className="wrap grid grid--top">
          <div className="span-5">
            <div className="section-head">
              <h2 id="agendar-h">Agendar visita nos decorados</h2>
              <p>
                Escolha o empreendimento e o melhor dia para conhecer o projeto
                na Vila Madalena, em Pinheiros ou em Perdizes.
              </p>
            </div>

            <div className="btn-row">
              <a
                className="btn btn--secondary"
                href={whatsappDirectHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                Falar no WhatsApp
              </a>
            </div>
          </div>

          <div className="span-6 start-7">
            <div className="booking-panel">
              <form
                className="form"
                action="mailto:contato@terraco.example"
                method="post"
                encType="text/plain"
                data-endpoint=""
                data-sent="Seu pedido de visita foi enviado. Respondemos no mesmo dia."
                noValidate
              >
                <div className="field">
                  <label htmlFor="f-name">Nome completo</label>
                  <input
                    id="f-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    aria-describedby="f-name-err"
                  />
                  <p className="field__error" id="f-name-err" hidden>
                    Escreva o nome para a reserva da visita.
                  </p>
                </div>

                <div className="field">
                  <label htmlFor="f-email">Email</label>
                  <input
                    id="f-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    aria-describedby="f-email-err"
                  />
                  <p className="field__error" id="f-email-err" hidden>
                    Escreva um email válido com @, como nome@exemplo.com.
                  </p>
                </div>

                <div className="field">
                  <label htmlFor="f-launch">Lançamento de interesse</label>
                  <select
                    id="f-launch"
                    name="launch"
                    value={selectedLaunch}
                    onChange={(e) => setSelectedLaunch(e.target.value)}
                  >
                    {LANCAMENTOS.map((item) => (
                      <option key={item.slug} value={item.nome}>
                        {item.nome} — {item.bairro}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="f-date">Dia e período preferidos</label>
                  <input
                    id="f-date"
                    name="date"
                    type="text"
                    autoComplete="off"
                    required
                    aria-describedby="f-date-err"
                  />
                  <p className="field__error" id="f-date-err" hidden>
                    Informe o dia ou período em que prefere visitar.
                  </p>
                </div>

                <div className="btn-row">
                  <button className="btn btn--primary" type="submit">
                    Agendar visita
                  </button>
                </div>
                <p className="form__status" role="status" data-form-status="" />
                <p className="t-small muted">
                  Atendimento direto no WhatsApp e confirmação no mesmo dia.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
