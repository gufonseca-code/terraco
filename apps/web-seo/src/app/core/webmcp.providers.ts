import {
  type EnvironmentProviders,
  inject,
  provideExperimentalWebMcpTools,
} from '@angular/core';
import { BairrosService } from './bairros.service';
import { filterLancamentos } from './lancamentos.data';
import { LancamentosService } from './lancamentos.service';
import { SITE_URL } from './site.config';

/**
 * Registers read-only WebMCP imperative tools via Angular's built-in
 * `provideExperimentalWebMcpTools` so AI agents can query Belo Horizonte
 * real estate launches and neighborhood guides directly.
 */
export function provideTerracoWebMcpTools(): EnvironmentProviders {
  return provideExperimentalWebMcpTools([
    {
      name: 'list_launches',
      description:
        'Lista os lançamentos imobiliários selecionados pelo Terraço em Belo Horizonte, com filtro opcional por termo de busca ou bairro.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'Termo opcional para filtrar por nome do empreendimento, bairro ou tipologia (ex: "Estoril", "2 quartos", "Prime View").',
          },
          bairro: {
            type: 'string',
            description:
              'Nome opcional do bairro em Belo Horizonte (ex: "Estoril", "Santa Efigênia", "Serrano").',
          },
        },
        additionalProperties: false,
      } as const,
      annotations: {
        readOnlyHint: true,
      },
      execute: async (input) => {
        const lancamentosService = inject(LancamentosService);
        const all = await lancamentosService.loadLancamentos();
        const query =
          typeof input?.query === 'string' ? input.query.trim() : '';
        const bairro =
          typeof input?.bairro === 'string' ? input.bairro.trim() : 'Todos';

        const filtered = filterLancamentos(query, bairro || 'Todos', all);
        return JSON.stringify(
          filtered.map((item) => ({
            slug: item.slug,
            nome: item.nome,
            bairro: item.bairro,
            cidade: item.cidade,
            badge: item.badge,
            quartos: item.quartos,
            metragem: item.metragem,
            vagas: item.vagas,
            entrega: item.entrega ?? null,
            precoAPartirDe: item.precoAPartirDe ?? null,
            url: `${SITE_URL}/lancamentos/${item.slug}`,
          })),
        );
      },
    },
    {
      name: 'get_launch_details',
      description:
        'Retorna detalhes completos de um lançamento imobiliário específico pelo slug (ex: "prime-view", "upside-square", "horizon").',
      inputSchema: {
        type: 'object',
        properties: {
          slug: {
            type: 'string',
            description:
              'Identificador slug do lançamento (ex: "prime-view", "upside-square", "horizon").',
          },
        },
        required: ['slug'],
        additionalProperties: false,
      } as const,
      annotations: {
        readOnlyHint: true,
      },
      execute: async (input) => {
        const lancamentosService = inject(LancamentosService);
        const slug = typeof input?.slug === 'string' ? input.slug.trim() : '';
        const item = await lancamentosService.loadBySlug(slug);
        if (!item) {
          return JSON.stringify({ error: `Lançamento não encontrado: ${slug}` });
        }
        return JSON.stringify({
          slug: item.slug,
          nome: item.nome,
          construtora: item.construtora ?? null,
          tagline: item.tagline,
          bairro: item.bairro,
          cidade: item.cidade,
          endereco: item.endereco,
          quartos: item.quartos,
          metragem: item.metragem,
          tipologias: item.tipologias,
          vagas: item.vagas,
          entrega: item.entrega ?? null,
          precoAPartirDe: item.precoAPartirDe ?? null,
          diferenciais: item.diferenciais,
          url: `${SITE_URL}/lancamentos/${item.slug}`,
        });
      },
    },
    {
      name: 'list_neighborhoods',
      description:
        'Lista os guias de bairros de Belo Horizonte cobertos pelo Terraço, com resumo e links para cada bairro.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      } as const,
      annotations: {
        readOnlyHint: true,
      },
      execute: async () => {
        const bairrosService = inject(BairrosService);
        const bairros = await bairrosService.loadBairros();
        return JSON.stringify(
          bairros.map((b) => ({
            slug: b.slug,
            nome: b.nome,
            regiao: b.regiao,
            resumo: b.resumo,
            url: `${SITE_URL}/bairros/${b.slug}`,
          })),
        );
      },
    },
  ]);
}
