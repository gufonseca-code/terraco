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
    quartos: '1 e 2 quartos com suíte',
    metragem: '49 a 103 m²',
    tipologias: 'Tipo, Garden, PCD e Coberturas Lineares',
    vagas: '1 e 2 vagas',
    resumo:
      'Condomínio fechado no Estoril com ampla vista panorâmica para Belo Horizonte, terreno de 5.855,90 m² e lazer completíssimo entregue mobiliado e decorado, a poucos minutos do Buritis.',
    corCapa: 'moss',
    imagem: '/images/lancamentos/prime-view/cover.webp',
    imagemWidth: 1024,
    imagemHeight: 614,
    imagemAlt:
      'Fachada contemporânea do residencial Prime View no Estoril, Belo Horizonte',
    diferenciais: [
      'Ampla vista panorâmica para a cidade em terreno de 5.855,90 m² com 2 elevadores por torre',
      'Lazer completíssimo entregue mobiliado e decorado: piscinas adulto e infantil com prainha, espaço gourmet panorâmico, salão de festas, churrasqueira, academia, crossfit zone, praça dos esportes, espaço fogo, pet place e playground',
      'Praticidade no dia a dia com coworking, espaço influencer, espaço beauty, ferramentas compartilhadas, bicicletário com bike wash, horta e pomar compartilhados, guarda-entregas e Novomarket',
      'Condomínio fechado com portaria 24h, eclusas de pedestres e veículos e selo Sempre Verde de sustentabilidade',
      'Localização estratégica a 2 min da Av. Barão Homem de Melo e poucos minutos do Buritis, escolas, supermercados e Shopping Paragem',
    ],
    whatsappMensagem:
      'Oi! Gostaria de receber as plantas, valores e condições do Prime View (Estoril).',
    galeria: [
      {
        url: '/images/lancamentos/prime-view/piscina.webp',
        alt: 'Piscina adulto com solarium e vista da torre do Prime View no Estoril',
        width: 800,
        height: 550,
      },
      {
        url: '/images/lancamentos/prime-view/espaco-gourmet.webp',
        alt: 'Espaço gourmet panorâmico mobiliado e decorado com vista para Belo Horizonte',
        width: 800,
        height: 1050,
      },
      {
        url: '/images/lancamentos/prime-view/living-integrado.webp',
        alt: 'Salas de estar e jantar integradas à cozinha do Prime View',
        width: 802,
        height: 1283,
      },
      {
        url: '/images/lancamentos/prime-view/garden.webp',
        alt: 'Área externa privativa de unidade Garden do Prime View',
        width: 800,
        height: 1277,
      },
      {
        url: '/images/lancamentos/prime-view/planta-tipo-49m2.webp',
        alt: 'Planta humanizada do apartamento tipo de 2 quartos com suíte (49,38 m²) do Prime View',
        width: 491,
        height: 489,
      },
    ],
    published: true,
    order: 1,
  },
  {
    slug: 'upside-square',
    nome: 'Upside Square',
    construtora: 'Patrimar (Grupo Patrimar)',
    tagline: 'Essencial é viver bem.',
    bairro: 'Santa Efigênia',
    cidade: 'Belo Horizonte',
    uf: 'MG',
    endereco: 'Santa Efigênia, Belo Horizonte - MG',
    badge: 'Lançamento',
    tags: ['Certificado EDGE', 'Torre única', 'Lazer completo'],
    quartos: 'Studios, 1 quarto e 2 suítes',
    metragem: '30 a 122 m²',
    tipologias: 'Studio, Garden, 2 Suítes e High Garden',
    vagas: '',
    resumo:
      'Torre única da Patrimar no coração do Santa Efigênia, com certificado internacional EDGE de sustentabilidade, plantas versáteis de 30 a 122 m² e lazer completo a poucos minutos da Praça Floriano Peixoto, Shopping Boulevard e área hospitalar.',
    corCapa: 'ipe',
    imagem: '/images/lancamentos/upside-square/cover.webp',
    imagemWidth: 641,
    imagemHeight: 1024,
    imagemAlt:
      'Fachada contemporânea do residencial Upside Square no bairro Santa Efigênia, Belo Horizonte',
    diferenciais: [
      'Certificado EDGE de sustentabilidade ainda na fase de projeto: 25% de economia de energia, 26% de economia de água e 33% na energia incorporada aos materiais',
      'Lazer completo em torre única: piscina climatizada, espaço grill, gourmet com terraço, fitness interno e externo, solarium, espaço fogo, playground e pet place',
      'Comodidades que valorizam sua rotina: coworking/espaço conteúdo, lavanderia, i-storage delivery, bicicletas e patinetes elétricos compartilhados, tool sharing e serviços pay-per-use (Grab & Go)',
      'Segurança completa com guarita 24h, antecâmara de pedestres, área de delivery com acesso independente e controle de acesso biométrico ou facial',
      'Localização privilegiada na região central de BH, a poucos minutos da Praça Floriano Peixoto, Shopping Boulevard, Hospital da Unimed, Santa Casa e Faculdade de Medicina da UFMG',
    ],
    whatsappMensagem:
      'Oi! Gostaria de receber as plantas, valores e condições do Upside Square (Santa Efigênia).',
    galeria: [
      {
        url: '/images/lancamentos/upside-square/piscina-climatizada.webp',
        alt: 'Piscina climatizada com vista panorâmica para Belo Horizonte no Upside Square',
        width: 800,
        height: 467,
      },
      {
        url: '/images/lancamentos/upside-square/espaco-grill.webp',
        alt: 'Espaço grill contemporâneo entregue mobiliado e decorado no Upside Square',
        width: 802,
        height: 812,
      },
      {
        url: '/images/lancamentos/upside-square/terraco-gourmet.webp',
        alt: 'Terraço do espaço gourmet ao entardecer no Upside Square em Santa Efigênia',
        width: 800,
        height: 426,
      },
      {
        url: '/images/lancamentos/upside-square/studio-decorado.webp',
        alt: 'Perspectiva ilustrada de unidade Studio integrada com vista urbana no Upside Square',
        width: 800,
        height: 452,
      },
      {
        url: '/images/lancamentos/upside-square/planta-2-suites-58m2.webp',
        alt: 'Planta humanizada do apartamento tipo de 2 suítes (58 m²) do Upside Square',
        width: 660,
        height: 401,
      },
    ],
    published: true,
    order: 2,
  },
  {
    slug: 'horizon',
    nome: 'Horizon',
    construtora: 'Novolar (uma empresa do Grupo Patrimar)',
    tagline: 'Seu novo ponto alto.',
    bairro: 'Serrano',
    cidade: 'Belo Horizonte',
    uf: 'MG',
    endereco: 'Rua Imperial, 250 - Serrano, Belo Horizonte - MG',
    badge: 'Lançamento',
    tags: ['Torre única', 'Vista livre', 'Lazer completo'],
    quartos: '1 e 2 quartos com suíte',
    metragem: '52 a 83 m²',
    tipologias: 'Tipo com varanda e Garden',
    vagas: 'Vaga de garagem',
    resumo:
      'Torre única cercada por Área de Preservação Permanente (APP) no Serrano, na continuidade da Av. Abílio Machado, com varandas em todas as unidades, vista livre e lazer completo entregue montado e mobiliado.',
    corCapa: 'guava',
    imagem: '/images/lancamentos/horizon/cover.webp',
    imagemWidth: 641,
    imagemHeight: 576,
    imagemAlt:
      'Fachada da torre única do residencial Horizon cercado por área verde no bairro Serrano, Belo Horizonte',
    diferenciais: [
      'Torre única em terreno de 6.673 m² com 4 elevadores, cercada por Área de Preservação Permanente (APP) e vista privilegiada para a cidade',
      'Varanda em todas as unidades, opções Garden de até 83 m², piso em porcelanato, bancadas em granito e previsão de ar-condicionado na sala e suíte',
      'Lazer completo entregue montado e mobiliado: piscinas adulto e infantil com prainha, espaço gourmet com varanda, salão de festas com terraço, churrasqueira, academia, sauna com descanso, espaço kids e playground',
      'Comodidades no condomínio com coworking, espaço beauty, espaço massagem, bicicletário com bike wash, ferramentas compartilhadas, guarda-entregas, lavanderia e Novomarket',
      'Condomínio fechado com portaria 24h e eclusa para veículos e pedestres, em localização estratégica no Serrano conectando Belo Horizonte e Contagem',
    ],
    whatsappMensagem:
      'Oi! Gostaria de receber as plantas, valores e condições do Horizon (Serrano).',
    galeria: [
      {
        url: '/images/lancamentos/horizon/piscina-vista.webp',
        alt: 'Piscina adulto com prainha e vista para área verde preservada no Horizon',
        width: 596,
        height: 476,
      },
      {
        url: '/images/lancamentos/horizon/espaco-gourmet.webp',
        alt: 'Espaço gourmet integrado ao lazer do residencial Horizon no Serrano',
        width: 467,
        height: 242,
      },
      {
        url: '/images/lancamentos/horizon/living-integrado.webp',
        alt: 'Salas de estar e jantar integradas à varanda e cozinha no Horizon',
        width: 596,
        height: 440,
      },
      {
        url: '/images/lancamentos/horizon/varanda.webp',
        alt: 'Varanda integrada à sala de estar dos apartamentos do Horizon',
        width: 595,
        height: 490,
      },
      {
        url: '/images/lancamentos/horizon/planta-tipo-56m2.webp',
        alt: 'Planta humanizada do apartamento tipo de 2 quartos com suíte e varanda (56,89 m²) do Horizon',
        width: 540,
        height: 381,
      },
    ],
    published: true,
    order: 3,
  },
];

export const SEARCH_SUGGESTIONS: string[] = [
  'Estoril',
  'Santa Efigênia',
  'Serrano',
  'Prime View',
  'Upside Square',
  'Horizon',
];

export const QUICK_NEIGHBORHOODS: string[] = [
  'Estoril',
  'Santa Efigênia',
  'Serrano',
];

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
