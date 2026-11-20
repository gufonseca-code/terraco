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

export const LANCAMENTOS: Lancamento[] = [
  {
    slug: 'prime-view',
    nome: 'Prime View',
    construtora: 'Novolar (uma empresa do Grupo Patrimar)',
    tagline: 'Vista para sua nova vida.',
    bairro: 'Estoril',
    cidade: 'Belo Horizonte',
    uf: 'MG',
    endereco: 'Rua Paulo Piedade Campos, 2160 - Estoril, Belo Horizonte - MG',
    badge: 'Lançamento',
    tags: ['Vista panorâmica', 'Lazer completo', 'Portaria 24h'],
    quartos: '2 quartos com suíte',
    metragem: '49 a 103 m²',
    tipologias: 'Tipo, Garden e Coberturas Lineares',
    vagas: '1 e 2 vagas',
    resumo:
      'Vista panorâmica para a cidade e lazer completíssimo mobiliado e decorado no Estoril, a poucos minutos do Buritis.',
    corCapa: 'moss',
    imagem: '/images/lancamentos/prime-view.webp',
    imagemWidth: 1024,
    imagemHeight: 614,
    imagemAlt:
      'Fachada contemporânea do residencial Prime View no Estoril, Belo Horizonte',
    diferenciais: [
      'Vista panorâmica para a cidade',
      'Lazer completíssimo entregue mobiliado e decorado (piscinas, espaço gourmet com vista, academia, coworking, pet place, espaço fogo e minimercado)',
      'Condomínio fechado com portaria 24h e eclusa',
      'Localização estratégica a 2 min da Av. Barão Homem de Melo, a poucos minutos do Buritis',
    ],
    whatsappMensagem:
      'Oi! Gostaria de receber as plantas, valores e condições do Prime View (Estoril).',
  },
];

export const SEARCH_SUGGESTIONS: string[] = Array.from(
  new Set([
    ...LANCAMENTOS.map((item) => item.bairro),
    ...LANCAMENTOS.map((item) => item.nome),
    ...LANCAMENTOS.flatMap((item) => item.tags),
  ])
);

export const QUICK_NEIGHBORHOODS: string[] = Array.from(
  new Set(LANCAMENTOS.map((item) => item.bairro))
);

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
