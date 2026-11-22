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

export function filterLancamentos(
  query: string,
  activeFilter: string,
  items: readonly Lancamento[] = LANCAMENTOS
): Lancamento[] {
  const normalized = query.trim().toLowerCase();

  return items.filter((item) => {
    const matchesFilter =
      activeFilter === 'Todos' ||
      item.quartos.toLowerCase().includes(activeFilter.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase() === activeFilter.toLowerCase());

    if (!matchesFilter) return false;
    if (!normalized) return true;

    const searchable = [
      item.nome,
      item.construtora,
      item.bairro,
      item.cidade,
      item.quartos,
      item.tipologias,
      item.resumo,
      ...item.tags,
    ]
      .join(' ')
      .toLowerCase();

    return searchable.includes(normalized);
  });
}

export function getLancamentoBySlug(slug: string): Lancamento | undefined {
  return LANCAMENTOS.find((item) => item.slug === slug);
}
