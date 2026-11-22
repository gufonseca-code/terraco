export interface LaunchMediaItem {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface LaunchDocItem {
  titulo: string;
  url: string;
}

export interface Lancamento {
  slug: string;
  nome: string;
  construtora: string;
  tagline: string;
  bairro: string;
  cidade: string;
  uf: string;
  endereco: string;
  badge: string;
  tags: string[];
  quartos: string;
  metragem: string;
  tipologias: string;
  vagas: string;
  precoAPartirDe?: number;
  entrega?: string;
  resumo: string;
  corCapa: 'moss' | 'ipe' | 'guava';
  imagem: string;
  imagemWidth: number;
  imagemHeight: number;
  imagemAlt: string;
  diferenciais: string[];
  whatsappMensagem: string;
  galeria?: LaunchMediaItem[];
  bookUrl?: string;
  plantasUrls?: LaunchDocItem[];
  published?: boolean;
  order?: number;
  updatedAt?: string | null;
}

export const WHATSAPP_NUMBER = '5531997469588';

export function buildWhatsAppUrl(mensagem: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
}

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

export const LANCAMENTOS: Lancamento[] = [];

export const SEARCH_SUGGESTIONS: string[] = [];

export const QUICK_NEIGHBORHOODS: string[] = [];

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function filterLancamentos(
  query: string,
  activeFilter: string,
  items: readonly Lancamento[] = LANCAMENTOS
): Lancamento[] {
  const normalizedQuery = normalizeSearchText(query);
  const normalizedFilter = normalizeSearchText(activeFilter);
  const queryTokens = normalizedQuery
    ? normalizedQuery.split(/\s+/).filter(Boolean)
    : [];

  return items.filter((item) => {
    const matchesFilter =
      !normalizedFilter ||
      normalizedFilter === 'todos' ||
      normalizeSearchText(item.bairro) === normalizedFilter ||
      normalizeSearchText(item.cidade) === normalizedFilter ||
      normalizeSearchText(item.construtora) === normalizedFilter ||
      normalizeSearchText(item.quartos).includes(normalizedFilter) ||
      normalizeSearchText(item.tipologias).includes(normalizedFilter) ||
      item.tags.some((tag) => {
        const normalizedTag = normalizeSearchText(tag);
        return (
          normalizedTag === normalizedFilter ||
          normalizedTag.includes(normalizedFilter)
        );
      });

    if (!matchesFilter) return false;
    if (queryTokens.length === 0) return true;

    const searchable = normalizeSearchText(
      [
        item.nome,
        item.construtora,
        item.bairro,
        item.cidade,
        item.quartos,
        item.tipologias,
        item.metragem,
        item.resumo,
        ...item.tags,
        ...item.diferenciais,
      ].join(' ')
    );

    return queryTokens.every((token) => searchable.includes(token));
  });
}

export function getLancamentoBySlug(slug: string): Lancamento | undefined {
  return LANCAMENTOS.find((item) => item.slug === slug);
}
