import { normalizeSearchText } from './format.utils';

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

export interface LaunchEntornoItem {
  local: string;
  tempo: string;
  modo?: 'a-pe' | 'carro';
}

export interface LaunchPilarSubgroup {
  titulo: string;
  itens: string[];
}

export interface LaunchPilarGroup {
  id: 'lazer' | 'praticidade' | 'seguranca' | 'acabamentos';
  label: string;
  itens: string[];
  subgrupos?: LaunchPilarSubgroup[];
}

export interface LaunchFloorPlan {
  id: string;
  titulo: string;
  categoria: string;
  metragem: string;
  quartos: string;
  banhos: string;
  unidades?: string;
  destaque?: string;
  precoAPartirDe?: number;
  entradaExemplo?: number;
  parcelaExemplo?: string;
  imagem: string;
  width: number;
  height: number;
  alt: string;
}

export interface Lancamento {
  slug: string;
  nome: string;
  construtora?: string;
  tagline: string;
  bairro: string;
  cidade: string;
  uf: string;
  endereco: string;
  estrutura?: string;
  projetos?: string;
  registro?: string;
  badge: string;
  tags: string[];
  quartos: string;
  metragem: string;
  tipologias: string;
  vagas: string;
  precoAPartirDe?: number;
  entradaMinima?: number;
  entrega?: string;
  resumo: string;
  corCapa: 'moss' | 'ipe' | 'guava';
  imagem: string;
  imagemWidth: number;
  imagemHeight: number;
  imagemAlt: string;
  diferenciais: string[];
  pilares?: LaunchPilarGroup[];
  entorno?: LaunchEntornoItem[];
  condicoesEspeciais?: string[];
  whatsappMensagem: string;
  galeria?: LaunchMediaItem[];
  plantas?: LaunchFloorPlan[];
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
    construtora: 'Novolar · Grupo Patrimar',
    tagline: 'Vista panorâmica no Estoril com lazer completo entregue decorado.',
    bairro: 'Estoril',
    cidade: 'Belo Horizonte',
    uf: 'MG',
    endereco: 'Rua Paulo Piedade Campos, 2160',
    estrutura: 'Terreno de 5.855,90 m² · 2 torres · 2 elevadores por torre',
    registro:
      'Memorial de Incorporação R-4 da matrícula 167.015 (1º Ofício de Registro de Imóveis de BH) · Patrimônio de Afetação AV-6 · CRECI Patrimar 54.815',
    badge: 'Lançamento',
    tags: ['Vista panorâmica', 'Lazer completo', 'Portaria 24h'],
    quartos: '1 e 2 quartos com suíte',
    metragem: '49,38 a 103,54 m²',
    tipologias: 'Tipo, Garden, PCD e Cobertura Linear',
    vagas: '1 e 2 vagas',
    resumo:
      'Condomínio residencial no Estoril implantado em terreno de 5.855,90 m² com 2 torres e 2 elevadores por torre. Reúne 7 opções de plantas entre Tipo, Garden, PCD e Cobertura Linear de 49,38 a 103,54 m², com áreas comuns entregues mobiliadas e decoradas a 2 minutos a pé da Av. Barão Homem de Melo.',
    corCapa: 'moss',
    imagem: '/images/lancamentos/prime-view/cover.webp',
    imagemWidth: 800,
    imagemHeight: 480,
    imagemAlt:
      'Fachada contemporânea do residencial Prime View no Estoril, Belo Horizonte',
    diferenciais: [
      'Lazer completo entregue mobiliado e decorado: piscinas adulto e infantil, prainha, solarium, salão de festas, churrasqueira, espaço gourmet, espaço fogo, academia, Crossfit Zone, Praça dos Esportes, espaço kids, playground, espaço piquenique, pet place e Mind Space',
      'Praticidade no dia a dia: coworking, espaço influencer, Novomarket, guarda-entregas, bicicletário com bike wash, horta e pomar compartilhados, ferramentas compartilhadas, app Novolar Conecta e previsão de Wi-Fi nas áreas comuns',
      'Segurança e sustentabilidade (Selo Sempre Verde): portaria 24h com eclusa de veículos e pedestres, câmeras, previsão de placas fotovoltaicas, LED com sensor, dual flux, economizadores e previsão de medição individualizada de água',
      'Acabamento dos apartamentos: sala integrada com janela ampla, porcelanato na sala, cozinha e banheiros, bancadas em granito e previsão de ar-condicionado nos quartos',
    ],
    pilares: [
      {
        id: 'lazer',
        label: 'Lazer',
        itens: [
          'Piscinas adulto e infantil',
          'Prainha e solarium',
          'Salão de festas',
          'Churrasqueira',
          'Espaço gourmet',
          'Espaço fogo',
          'Academia e Crossfit Zone',
          'Praça dos Esportes',
          'Espaço kids e playground',
          'Espaço piquenique',
          'Pet place',
          'Mind Space',
        ],
      },
      {
        id: 'praticidade',
        label: 'Praticidade & Serviços',
        itens: [
          'Áreas comuns mobiliadas e decoradas',
          'Coworking',
          'Espaço influencer',
          'Novomarket',
          'Guarda-entregas',
          'Bicicletário com bike wash',
          'Horta e pomar compartilhados',
          'Ferramentas compartilhadas',
          'App Novolar Conecta',
          'Previsão de Wi-Fi nas áreas comuns',
        ],
      },
      {
        id: 'seguranca',
        label: 'Segurança & Sustentabilidade',
        itens: [
          'Portaria 24h com eclusa para veículos e pedestres',
          'Sistema de câmeras',
          'Selo Sempre Verde',
          'Previsão de placas fotovoltaicas',
          'Iluminação em LED com sensor',
          'Sistema dual flux',
          'Dispositivos economizadores de água',
          'Previsão de medição individualizada de água',
        ],
      },
      {
        id: 'acabamentos',
        label: 'Apartamento & Acabamentos',
        itens: [
          'Sala integrada com janela ampla',
          'Porcelanato na sala, cozinha e banheiros',
          'Bancadas em granito',
          'Previsão para ar-condicionado nos quartos',
        ],
      },
    ],
    entorno: [
      { local: 'Arena Foot Beer Estoril', tempo: '2 min', modo: 'a-pe' },
      { local: 'Saída para Av. Barão Homem de Melo', tempo: '2 min', modo: 'a-pe' },
      { local: 'Arena BH Beach', tempo: '6 min', modo: 'a-pe' },
      { local: 'Padaria Pandeli', tempo: '8 min', modo: 'a-pe' },
      { local: 'Droga Raia', tempo: '8 min', modo: 'a-pe' },
      { local: 'Coleguium Buritis', tempo: '10 min', modo: 'a-pe' },
      { local: 'Newton Paiva', tempo: '3 min', modo: 'carro' },
      { local: 'UPA Oeste', tempo: '3 min', modo: 'carro' },
      { local: 'Shopping Paragem', tempo: '4 min', modo: 'carro' },
      { local: 'EPA Supermercado', tempo: '5 min', modo: 'carro' },
      { local: 'Saída para Av. Raja Gabaglia', tempo: '5 min', modo: 'carro' },
      { local: 'Colégio Batista Mineiro', tempo: '6 min', modo: 'carro' },
      { local: 'Madero', tempo: '6 min', modo: 'carro' },
      { local: 'UniBH', tempo: '7 min', modo: 'carro' },
      { local: 'Mercado da Boca', tempo: '7 min', modo: 'carro' },
      { local: 'Colégio Magnum', tempo: '8 min', modo: 'carro' },
    ],
    whatsappMensagem:
      'Oi! Gostaria de receber as plantas e a tabela atualizada do Prime View (Estoril).',
    galeria: [
      {
        url: '/images/lancamentos/prime-view/vista-aerea.webp',
        alt: 'Vista aérea em perspectiva do Prime View no Estoril com vista panorâmica para Belo Horizonte',
        width: 800,
        height: 1280,
      },
      {
        url: '/images/lancamentos/prime-view/piscina.webp',
        alt: 'Piscina adulto com solarium e vista da torre do Prime View no Estoril',
        width: 800,
        height: 550,
      },
      {
        url: '/images/lancamentos/prime-view/deck-piscina.webp',
        alt: 'Deck da piscina com espreguiçadeiras e paisagismo no Prime View',
        width: 800,
        height: 1280,
      },
      {
        url: '/images/lancamentos/prime-view/piscina-infantil.webp',
        alt: 'Piscina infantil integrada ao deck molhado e área de descanso do Prime View',
        width: 800,
        height: 1280,
      },
      {
        url: '/images/lancamentos/prime-view/espaco-gourmet.webp',
        alt: 'Espaço gourmet panorâmico mobiliado e decorado com vista para Belo Horizonte',
        width: 800,
        height: 1050,
      },
      {
        url: '/images/lancamentos/prime-view/salao-festas.webp',
        alt: 'Salão de festas entregue mobiliado e decorado com vista para a área verde do Prime View',
        width: 1400,
        height: 2016,
      },
      {
        url: '/images/lancamentos/prime-view/churrasqueira.webp',
        alt: 'Espaço churrasqueira com bancada e banquetas altas no Prime View',
        width: 800,
        height: 1280,
      },
      {
        url: '/images/lancamentos/prime-view/living-integrado.webp',
        alt: 'Salas de estar e jantar integradas à cozinha do Prime View',
        width: 802,
        height: 1283,
      },
      {
        url: '/images/lancamentos/prime-view/cozinha.webp',
        alt: 'Cozinha e área de serviço integradas com bancada em granito no Prime View',
        width: 1400,
        height: 2038,
      },
      {
        url: '/images/lancamentos/prime-view/suite.webp',
        alt: 'Suíte decorada com iluminação aconchegante dos apartamentos do Prime View',
        width: 1400,
        height: 2038,
      },
      {
        url: '/images/lancamentos/prime-view/quarto-decorado.webp',
        alt: 'Segundo quarto decorado dos apartamentos de 2 quartos do Prime View',
        width: 800,
        height: 1280,
      },
      {
        url: '/images/lancamentos/prime-view/garden.webp',
        alt: 'Área externa privativa de unidade Garden do Prime View',
        width: 800,
        height: 1277,
      },
      {
        url: '/images/lancamentos/prime-view/academia.webp',
        alt: 'Academia equipada com esteiras, bicicletas e vista panorâmica no Prime View',
        width: 1400,
        height: 1030,
      },
      {
        url: '/images/lancamentos/prime-view/crossfit-zone.webp',
        alt: 'Crossfit Zone ao ar livre cercada por área verde no Prime View',
        width: 800,
        height: 1280,
      },
      {
        url: '/images/lancamentos/prime-view/praca-esportes.webp',
        alt: 'Praça de esportes com mesa de ping-pong e jogos ao ar livre no Prime View',
        width: 800,
        height: 652,
      },
      {
        url: '/images/lancamentos/prime-view/espaco-fogo.webp',
        alt: 'Espaço fogo ao ar livre para convivência ao entardecer no Prime View',
        width: 800,
        height: 1280,
      },
      {
        url: '/images/lancamentos/prime-view/playground.webp',
        alt: 'Playground colorido integrado à área de lazer térrea do Prime View',
        width: 800,
        height: 673,
      },
      {
        url: '/images/lancamentos/prime-view/espaco-kids.webp',
        alt: 'Espaço kids coberto, mobiliado e decorado para crianças no Prime View',
        width: 800,
        height: 607,
      },
      {
        url: '/images/lancamentos/prime-view/pet-place.webp',
        alt: 'Pet place gramado e cercado com equipamentos de agilidade no Prime View',
        width: 1400,
        height: 2038,
      },
      {
        url: '/images/lancamentos/prime-view/coworking.webp',
        alt: 'Coworking climatizado com estações de trabalho compartilhadas no Prime View',
        width: 800,
        height: 640,
      },
      {
        url: '/images/lancamentos/prime-view/espaco-influencer.webp',
        alt: 'Espaço Influencer equipado com iluminação e fundo chroma key no Prime View',
        width: 800,
        height: 1280,
      },
      {
        url: '/images/lancamentos/prime-view/espaco-beauty.webp',
        alt: 'Espaço Beauty privativo com lavatório e espelhos no Prime View',
        width: 800,
        height: 1278,
      },
      {
        url: '/images/lancamentos/prime-view/ferramentas-compartilhadas.webp',
        alt: 'Sala de ferramentas compartilhadas equipada para pequenos reparos no Prime View',
        width: 800,
        height: 640,
      },
      {
        url: '/images/lancamentos/prime-view/minimercado.webp',
        alt: 'Minimercado de autoatendimento dentro do condomínio Prime View',
        width: 800,
        height: 1280,
      },
      {
        url: '/images/lancamentos/prime-view/portaria.webp',
        alt: 'Portaria contemporânea com guarita, eclusa de pedestres e acesso de veículos no Prime View',
        width: 800,
        height: 539,
      },
      {
        url: '/images/lancamentos/prime-view/implantacao.webp',
        alt: 'Planta de implantação do Prime View mostrando as duas torres e os itens de lazer e conveniência',
        width: 801,
        height: 565,
      },
    ],
    plantas: [
      {
        id: 'prime-view-tipo-49',
        titulo: 'Tipo 49,38 m²',
        categoria: '2 Quartos',
        metragem: '49,38 m²',
        quartos: '2 quartos com suíte',
        banhos: '2 banhos',
        unidades: 'Finais 01, 02, 07 e 08 · Torres 1 e 2',
        destaque: 'Sala integrada com janela ampla',
        imagem: '/images/lancamentos/prime-view/planta-tipo-49m2.webp',
        width: 491,
        height: 489,
        alt: 'Planta humanizada do apartamento Tipo 49,38 m² (2 quartos com suíte) do Prime View',
      },
      {
        id: 'prime-view-tipo-51',
        titulo: 'Tipo 51,67 m²',
        categoria: '2 Quartos',
        metragem: '51,67 m²',
        quartos: '2 quartos com suíte',
        banhos: '2 banhos',
        unidades: 'Finais 03, 04, 05 e 06 · Torres 1 e 2',
        destaque: 'Planta ampliada com suíte',
        imagem: '/images/lancamentos/prime-view/planta-tipo-51m2.webp',
        width: 1400,
        height: 896,
        alt: 'Planta humanizada do apartamento Tipo 51,67 m² (2 quartos com suíte) do Prime View',
      },
      {
        id: 'prime-view-garden-56',
        titulo: 'Garden 56,77 m²',
        categoria: 'Garden',
        metragem: '56,77 m²',
        quartos: '1 quarto',
        banhos: '1 banho',
        unidades: 'Unidade 103 · Torres 1 e 2',
        destaque: 'Área externa privativa descoberta',
        imagem: '/images/lancamentos/prime-view/planta-garden-56m2.webp',
        width: 491,
        height: 465,
        alt: 'Planta humanizada do apartamento Garden 56,77 m² (1 quarto) do Prime View',
      },
      {
        id: 'prime-view-garden-57',
        titulo: 'Garden 57,57 m²',
        categoria: 'Garden',
        metragem: '57,57 m²',
        quartos: '2 quartos com suíte',
        banhos: '2 banhos',
        unidades: 'Unidades 101, 102, 107 e 108 · Torres 1 e 2',
        destaque: 'Terraço descoberto privativo',
        imagem: '/images/lancamentos/prime-view/planta-garden-57m2.webp',
        width: 1220,
        height: 1200,
        alt: 'Planta humanizada do apartamento Garden 57,57 m² (2 quartos com suíte) do Prime View',
      },
      {
        id: 'prime-view-garden-72',
        titulo: 'Garden 72,27 m²',
        categoria: 'Garden',
        metragem: '72,27 m²',
        quartos: '2 quartos com suíte',
        banhos: '2 banhos',
        unidades: 'Unidades 104, 105 e 106 · Torres 1 e 2',
        destaque: 'Terraço descoberto amplo',
        imagem: '/images/lancamentos/prime-view/planta-garden-72m2.webp',
        width: 1400,
        height: 992,
        alt: 'Planta humanizada do apartamento Garden 72,27 m² (2 quartos com suíte) do Prime View',
      },
      {
        id: 'prime-view-pcd-49',
        titulo: 'PCD 49,38 m²',
        categoria: 'PCD',
        metragem: '49,38 m²',
        quartos: '1 quarto e 1 escritório',
        banhos: '1 banho adaptado',
        unidades: 'Unidades 801, 901, 902, 907 e 908 · Torre 1',
        destaque: 'Planta adaptada com escritório',
        imagem: '/images/lancamentos/prime-view/planta-pcd-49m2.webp',
        width: 1220,
        height: 1158,
        alt: 'Planta humanizada do apartamento PCD 49,38 m² (1 quarto e 1 escritório) do Prime View',
      },
      {
        id: 'prime-view-cobertura-103',
        titulo: 'Cobertura Linear 103,54 m²',
        categoria: 'Cobertura',
        metragem: '103,54 m²',
        quartos: '2 quartos com suíte',
        banhos: '2 banhos',
        unidades: 'Unidade 1004 · Torre 2',
        destaque: 'Terraço panorâmico linear',
        imagem: '/images/lancamentos/prime-view/planta-cobertura-103m2.webp',
        width: 1400,
        height: 726,
        alt: 'Planta humanizada da Cobertura Linear 103,54 m² (2 quartos com suíte) do Prime View',
      },
    ],
    published: true,
    order: 1,
  },
  {
    slug: 'upside-square',
    nome: 'Upside Square',
    construtora: 'Patrimar',
    tagline: 'Essencial é viver bem.',
    bairro: 'Santa Efigênia',
    cidade: 'Belo Horizonte',
    uf: 'MG',
    endereco: 'Rua Domingos Vieira, nº 176',
    estrutura: 'Torre única · Terreno de 1.453,35 m² · 4º ao 21º pavimento',
    projetos:
      'Torres Miranda (Arquitetura), Piacesi (Áreas Comuns) e Forma Garden (Paisagismo)',
    badge: 'Lançamento',
    tags: ['Certificado EDGE', 'Torre única', 'Lazer completo'],
    quartos: 'Studios, 1 quarto e 2 suítes',
    metragem: '30,10 a 122,25 m²',
    tipologias: 'Studio, 1 Quarto, 2 Suítes, Garden e High Garden',
    vagas: 'Sob consulta conforme tipologia',
    precoAPartirDe: 596403,
    entradaMinima: 47712,
    entrega: 'Março/2030',
    resumo:
      'Torre única do 4º ao 21º pavimento em terreno de 1.453,35 m² no coração de Santa Efigênia, assinada por Torres Miranda (Arquitetura), Piacesi (Áreas Comuns) e Forma Garden (Paisagismo). Conta com certificação internacional EDGE, plantas de 30,10 a 122,25 m² e mobilidade a pé para a Praça Floriano Peixoto, Hospital da Unimed e Shopping Boulevard.',
    corCapa: 'ipe',
    imagem: '/images/lancamentos/upside-square/cover.webp',
    imagemWidth: 640,
    imagemHeight: 400,
    imagemAlt:
      'Fachada contemporânea do residencial Upside Square no bairro Santa Efigênia, Belo Horizonte',
    diferenciais: [
      'Lazer completo: piscina climatizada, solarium, fitness, fitness externo, espaço grill, espaço gourmet, terraço gourmet, espaço fogo e playground',
      'Praticidade incluída e pay-per-use: I-storage/guarda-entregas, lavanderia compartilhada, coworking/espaço conteúdo, bicicletário, 2 e-bikes e 2 patinetes elétricos compartilhados, tool sharing, pet place, app Meu Patrimar, Grab & Go, manutenção básica e Maid Service',
      'Segurança e sustentabilidade (Certificação EDGE): guarita 24h, antecâmara para pedestres, delivery independente, CFTV, Patrimar Access com biometria e reconhecimento facial, 25% de economia de energia, 26% de economia de água, placas fotovoltaicas, dual flux e previsão de recarga para carro elétrico',
      'Infraestrutura nos apartamentos: medição individualizada de água e previsão para ar-condicionado',
    ],
    pilares: [
      {
        id: 'lazer',
        label: 'Lazer',
        itens: [
          'Piscina climatizada',
          'Solarium',
          'Fitness',
          'Fitness externo',
          'Espaço grill',
          'Espaço gourmet',
          'Terraço gourmet',
          'Espaço fogo',
          'Playground',
        ],
      },
      {
        id: 'praticidade',
        label: 'Praticidade & Serviços',
        itens: [],
        subgrupos: [
          {
            titulo: 'Incluídos no condomínio',
            itens: [
              'I-storage / guarda-entregas',
              'Lavanderia compartilhada',
              'Coworking / espaço conteúdo',
              'Bicicletário',
              '2 e-bikes e 2 patinetes elétricos compartilhados',
              'Tool sharing',
              'Pet place',
              'App Meu Patrimar',
            ],
          },
          {
            titulo: 'Pay-per-use',
            itens: ['Grab & Go', 'Manutenção básica', 'Maid Service'],
          },
        ],
      },
      {
        id: 'seguranca',
        label: 'Segurança & Sustentabilidade',
        itens: [
          'Guarita 24h com antecâmara para pedestres',
          'Delivery independente e CFTV',
          'Patrimar Access com biometria e reconhecimento facial',
          'Certificação EDGE: 25% economia de energia e 26% economia de água',
          'Placas fotovoltaicas',
          'Sistema dual flux',
          'Previsão para recarga de carro elétrico',
          'Medição individualizada de água',
          'Previsão para ar-condicionado',
        ],
      },
    ],
    entorno: [
      { local: 'Praça Floriano Peixoto', tempo: '3 min', modo: 'a-pe' },
      { local: 'Hospital da PM', tempo: '4 min', modo: 'a-pe' },
      { local: 'Chopp da Fábrica', tempo: '4 min', modo: 'a-pe' },
      { local: 'Tem Hortifrutti', tempo: '5 min', modo: 'a-pe' },
      { local: 'Hospital da Unimed', tempo: '5 min', modo: 'a-pe' },
      { local: 'Santa Casa de BH', tempo: '6 min', modo: 'a-pe' },
      { local: 'Faculdades Dom Helder Câmara', tempo: '6 min', modo: 'a-pe' },
      { local: 'Cobasi', tempo: '6 min', modo: 'a-pe' },
      { local: 'Shopping Boulevard', tempo: '7 min', modo: 'a-pe' },
      { local: 'Teatro Sesiminas', tempo: '7 min', modo: 'a-pe' },
      { local: 'Shopping Boulevard', tempo: '3 min', modo: 'carro' },
      { local: 'Hospital da Unimed', tempo: '3 min', modo: 'carro' },
      { local: 'Santa Casa', tempo: '3 min', modo: 'carro' },
      { local: 'Laboratório Hermes Pardini', tempo: '5 min', modo: 'carro' },
      { local: 'Faculdade de Medicina da UFMG', tempo: '6 min', modo: 'carro' },
      { local: 'Hospital João XXIII', tempo: '7 min', modo: 'carro' },
      { local: 'Parque Municipal', tempo: '7 min', modo: 'carro' },
    ],
    condicoesEspeciais: [
      'Studios a partir de R$ 596.403 (Studio 502 · 30,10 m² · entrada a partir de R$ 47.712)',
      'Fluxo de obra estruturado com entrega prevista para março de 2030',
      'Opções de 1 quarto, 2 suítes, Garden e High Garden com tabela disponível sob consulta',
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
        url: '/images/lancamentos/upside-square/piscina-vista-ampla.webp',
        alt: 'Área da piscina climatizada integrada ao espaço grill e academia no Upside Square',
        width: 803,
        height: 584,
      },
      {
        url: '/images/lancamentos/upside-square/fachada-tarde.webp',
        alt: 'Fachada contemporânea da torre única do Upside Square ao entardecer no Santa Efigênia',
        width: 803,
        height: 1282,
      },
      {
        url: '/images/lancamentos/upside-square/espaco-grill.webp',
        alt: 'Espaço grill contemporâneo entregue mobiliado e decorado no Upside Square',
        width: 802,
        height: 812,
      },
      {
        url: '/images/lancamentos/upside-square/espaco-gourmet.webp',
        alt: 'Salão gourmet amplo entregue mobiliado e decorado no Upside Square',
        width: 803,
        height: 331,
      },
      {
        url: '/images/lancamentos/upside-square/terraco-gourmet.webp',
        alt: 'Terraço do espaço gourmet ao entardecer no Upside Square em Santa Efigênia',
        width: 800,
        height: 426,
      },
      {
        url: '/images/lancamentos/upside-square/fitness.webp',
        alt: 'Espaço fitness interno equipado com vista para o Santa Efigênia no Upside Square',
        width: 803,
        height: 1281,
      },
      {
        url: '/images/lancamentos/upside-square/fitness-externo.webp',
        alt: 'Área de fitness externo para treinos funcionais ao ar livre no Upside Square',
        width: 801,
        height: 534,
      },
      {
        url: '/images/lancamentos/upside-square/coworking.webp',
        alt: 'Coworking e espaço conteúdo compartilhado no condomínio Upside Square',
        width: 802,
        height: 422,
      },
      {
        url: '/images/lancamentos/upside-square/lavanderia.webp',
        alt: 'Lavanderia compartilhada equipada no Upside Square',
        width: 388,
        height: 408,
      },
      {
        url: '/images/lancamentos/upside-square/grab-and-go.webp',
        alt: 'Mercadinho Grab & Go pay-per-use no condomínio Upside Square',
        width: 387,
        height: 410,
      },
      {
        url: '/images/lancamentos/upside-square/bicicletario.webp',
        alt: 'Bicicletário com bicicletas e patinetes elétricos compartilhados no Upside Square',
        width: 752,
        height: 512,
      },
      {
        url: '/images/lancamentos/upside-square/playground.webp',
        alt: 'Playground ao ar livre com área verde no Upside Square',
        width: 505,
        height: 501,
      },
      {
        url: '/images/lancamentos/upside-square/pet-place.webp',
        alt: 'Pet place gramado dedicado aos animais de estimação no Upside Square',
        width: 427,
        height: 285,
      },
      {
        url: '/images/lancamentos/upside-square/hall-entrada.webp',
        alt: 'Hall de entrada social com portaria e controle de acesso no Upside Square',
        width: 801,
        height: 528,
      },
      {
        url: '/images/lancamentos/upside-square/apartamento-decorado.webp',
        alt: 'Perspectiva ilustrada de unidade decorada com sala de jantar e dormitório no Upside Square',
        width: 803,
        height: 1282,
      },
      {
        url: '/images/lancamentos/upside-square/studio-decorado.webp',
        alt: 'Perspectiva ilustrada de unidade Studio integrada com vista urbana no Upside Square',
        width: 800,
        height: 452,
      },
      {
        url: '/images/lancamentos/upside-square/living-studio.webp',
        alt: 'Sala de estar e jantar integrada com marcenaria contemporânea no Upside Square',
        width: 803,
        height: 1065,
      },
      {
        url: '/images/lancamentos/upside-square/living-2-suites.webp',
        alt: 'Living integrado com cozinha e sala de jantar em apartamento de 2 suítes no Upside Square',
        width: 671,
        height: 452,
      },
      {
        url: '/images/lancamentos/upside-square/suite-decorado.webp',
        alt: 'Suíte máster decorada com closet envidraçado e iluminação embutida no Upside Square',
        width: 673,
        height: 450,
      },
      {
        url: '/images/lancamentos/upside-square/home-office-decorado.webp',
        alt: 'Ambiente de estar e home office com iluminação natural no Upside Square',
        width: 671,
        height: 313,
      },
      {
        url: '/images/lancamentos/upside-square/terraco-high-garden.webp',
        alt: 'Terraço descoberto privativo das unidades High Garden ao pôr do sol no Upside Square',
        width: 803,
        height: 1280,
      },
    ],
    plantas: [
      {
        id: 'upside-studio-30',
        titulo: 'Studio 30 m²',
        categoria: 'Studio',
        metragem: '30,10 a 35,33 m²',
        quartos: 'Studio',
        banhos: '1 banho',
        unidades: 'Studio 502 · Finais 01 a 04, 07 e 08',
        destaque: 'Ambiente integrado com bancada gourmet',
        precoAPartirDe: 596403,
        entradaExemplo: 47712,
        parcelaExemplo: '34x R$ 965 + 5 interm.',
        imagem: '/images/lancamentos/upside-square/planta-studio-30m2.webp',
        width: 600,
        height: 654,
        alt: 'Planta humanizada do Studio 30 m² (30,10 a 35,33 m²) do Upside Square',
      },
      {
        id: 'upside-studio-32',
        titulo: 'Studio 32 m²',
        categoria: 'Studio',
        metragem: '32,07 m²',
        quartos: 'Studio',
        banhos: '1 banho',
        unidades: 'Final 11 (apts 511 a 1411)',
        destaque: 'Layout longitudinal funcional',
        precoAPartirDe: 648270,
        entradaExemplo: 51862,
        parcelaExemplo: '34x R$ 1.049 + 5 interm.',
        imagem: '/images/lancamentos/upside-square/planta-studio-32m2.webp',
        width: 640,
        height: 438,
        alt: 'Planta humanizada do Studio 32 m² (32,07 m²) do Upside Square',
      },
      {
        id: 'upside-studio-33',
        titulo: 'Studio 33 m²',
        categoria: 'Studio',
        metragem: '33,05 m²',
        quartos: 'Studio',
        banhos: '1 banho',
        unidades: 'Final 10 (apts 510 a 1410)',
        destaque: 'Área de estar ampliada',
        precoAPartirDe: 674151,
        entradaExemplo: 53932,
        parcelaExemplo: '34x R$ 1.091 + 5 interm.',
        imagem: '/images/lancamentos/upside-square/planta-studio-33m2.webp',
        width: 679,
        height: 440,
        alt: 'Planta humanizada do Studio 33 m² (33,05 m²) do Upside Square',
      },
      {
        id: 'upside-studio-garden-39',
        titulo: 'Studio Garden 39 m²',
        categoria: 'Garden',
        metragem: '38,89 m²',
        quartos: 'Studio',
        banhos: '1 banho',
        unidades: 'Apts 401 a 404, 407 e 408',
        destaque: 'Terraço descoberto privativo',
        precoAPartirDe: 643021,
        entradaExemplo: 51442,
        parcelaExemplo: '34x R$ 1.040 + 5 interm.',
        imagem: '/images/lancamentos/upside-square/planta-studio-garden-39m2.webp',
        width: 542,
        height: 630,
        alt: 'Planta humanizada do Studio Garden 39 m² (38,89 m²) do Upside Square',
      },
      {
        id: 'upside-studio-garden-40',
        titulo: 'Studio Garden 40 m²',
        categoria: 'Garden',
        metragem: '40 m²',
        quartos: 'Studio',
        banhos: '1 banho',
        unidades: 'Apt 410',
        destaque: 'Terraço descoberto privativo',
        imagem: '/images/lancamentos/upside-square/planta-studio-garden-40m2.webp',
        width: 716,
        height: 418,
        alt: 'Planta humanizada do Studio Garden 40 m² do Upside Square',
      },
      {
        id: 'upside-1-quarto-40',
        titulo: '1 Quarto 40 m²',
        categoria: '1 Quarto',
        metragem: '38,84 a 40,44 m²',
        quartos: '1 quarto',
        banhos: '1 banho',
        unidades: 'Apts 1603 a 2103',
        destaque: 'Andares altos com quarto separado',
        precoAPartirDe: 927678,
        entradaExemplo: 74214,
        parcelaExemplo: '34x R$ 1.501 + 5 interm.',
        imagem: '/images/lancamentos/upside-square/planta-1-quarto-40m2.webp',
        width: 328,
        height: 834,
        alt: 'Planta humanizada do apartamento 1 Quarto 40 m² (38,84 a 40,44 m²) do Upside Square',
      },
      {
        id: 'upside-garden-1-quarto-58',
        titulo: 'Garden 1 Quarto 58 m²',
        categoria: 'Garden',
        metragem: '58,66 m²',
        quartos: '1 quarto',
        banhos: '1 banho',
        unidades: 'Apt 409',
        destaque: 'Terraço descoberto amplo',
        precoAPartirDe: 895839,
        entradaExemplo: 71667,
        parcelaExemplo: '34x R$ 1.449 + 5 interm.',
        imagem: '/images/lancamentos/upside-square/planta-garden-1-quarto-58m2.webp',
        width: 496,
        height: 717,
        alt: 'Planta humanizada do Garden 1 Quarto 58 m² (58,66 m²) do Upside Square',
      },
      {
        id: 'upside-2-suites-58',
        titulo: '2 Suítes 58 m²',
        categoria: '2 Suítes',
        metragem: '58,06 a 66,62 m²',
        quartos: '2 suítes',
        banhos: '2 banhos + lavabo',
        unidades: 'Apts 612 a 1412',
        destaque: '2 suítes independentes + lavabo',
        precoAPartirDe: 1097902,
        entradaExemplo: 87832,
        parcelaExemplo: '34x R$ 1.776 + 5 interm.',
        imagem: '/images/lancamentos/upside-square/planta-2-suites-58m2.webp',
        width: 660,
        height: 401,
        alt: 'Planta humanizada do apartamento 2 Suítes 58 m² (58,06 a 66,62 m²) do Upside Square',
      },
      {
        id: 'upside-garden-2-suites-62',
        titulo: 'Garden 2 Suítes 62 m²',
        categoria: 'Garden',
        metragem: '62,23 m²',
        quartos: '2 suítes',
        banhos: '2 banhos + lavabo',
        unidades: 'Apt 512',
        destaque: 'Terraço descoberto privativo',
        imagem: '/images/lancamentos/upside-square/planta-garden-2-suites-62m2.webp',
        width: 713,
        height: 427,
        alt: 'Planta humanizada do Garden 2 Suítes 62 m² (62,23 m²) do Upside Square',
      },
      {
        id: 'upside-garden-2-suites-66',
        titulo: 'Garden 2 Suítes 66 m²',
        categoria: 'Garden',
        metragem: '66,18 m²',
        quartos: '2 suítes',
        banhos: '2 banhos + lavabo',
        unidades: 'Apt 513',
        destaque: 'Terraço descoberto + lavabo',
        precoAPartirDe: 1186754,
        entradaExemplo: 94940,
        parcelaExemplo: '34x R$ 1.920 + 5 interm.',
        imagem: '/images/lancamentos/upside-square/planta-garden-2-suites-66m2.webp',
        width: 340,
        height: 625,
        alt: 'Planta humanizada do Garden 2 Suítes 66 m² (66,18 m²) do Upside Square',
      },
      {
        id: 'upside-high-garden-1-quarto-62',
        titulo: 'High Garden 1 Quarto 62 m²',
        categoria: 'High Garden',
        metragem: '62,30 m²',
        quartos: '1 quarto',
        banhos: '1 banho',
        unidades: 'Apt 1503 (15º andar)',
        destaque: 'Terraço panorâmico em andar alto',
        precoAPartirDe: 1104158,
        entradaExemplo: 88333,
        parcelaExemplo: '34x R$ 1.786 + 5 interm.',
        imagem: '/images/lancamentos/upside-square/planta-high-garden-1-quarto-62m2.webp',
        width: 355,
        height: 629,
        alt: 'Planta humanizada do High Garden 1 Quarto 62 m² (62,30 m²) do Upside Square',
      },
      {
        id: 'upside-high-garden-1-suite-109',
        titulo: 'High Garden 1 Suíte 109 m²',
        categoria: 'High Garden',
        metragem: '109,46 m²',
        quartos: '2 quartos (1 suíte)',
        banhos: '2 banhos',
        unidades: 'Apt 1501 (15º andar)',
        destaque: 'Amplo terraço descoberto em L',
        precoAPartirDe: 1812864,
        entradaExemplo: 145029,
        parcelaExemplo: '34x R$ 2.933 + 5 interm.',
        imagem: '/images/lancamentos/upside-square/planta-high-garden-1-suite-109m2.webp',
        width: 440,
        height: 601,
        alt: 'Planta humanizada do High Garden 1 Suíte 109 m² (109,46 m²) do Upside Square',
      },
      {
        id: 'upside-high-garden-2-suites-122',
        titulo: 'High Garden 2 Suítes 122 m²',
        categoria: 'High Garden',
        metragem: '122,25 m²',
        quartos: '2 suítes',
        banhos: '2 banhos + lavabo',
        unidades: 'Apt 1502 (15º andar)',
        destaque: 'Maior terraço panorâmico da torre',
        precoAPartirDe: 1979666,
        entradaExemplo: 158373,
        parcelaExemplo: '34x R$ 3.203 + 5 interm.',
        imagem: '/images/lancamentos/upside-square/planta-high-garden-2-suites-122m2.webp',
        width: 508,
        height: 782,
        alt: 'Planta humanizada do High Garden 2 Suítes 122 m² (122,25 m²) do Upside Square',
      },
    ],
    published: true,
    order: 2,
  },
  {
    slug: 'horizon',
    nome: 'Horizon',
    construtora: 'Novolar · Grupo Patrimar',
    tagline: 'Seu novo ponto alto.',
    bairro: 'Serrano',
    cidade: 'Belo Horizonte',
    uf: 'MG',
    endereco: 'Rua Imperial, nº 250',
    estrutura:
      'Torre única · Terreno de 6.673 m² · 4 elevadores · Área de preservação permanente no entorno',
    badge: 'Lançamento',
    tags: ['Torre única', 'Vista livre', 'Lazer completo'],
    quartos: '1 e 2 quartos com suíte',
    metragem: '52,36 a 83,34 m²',
    tipologias: 'Tipo com varanda e Garden',
    vagas: 'Vaga de garagem',
    resumo:
      'Torre única em terreno de 6.673 m² com 4 elevadores e área de preservação permanente no entorno no bairro Serrano. Oferece 6 plantas entre apartamentos Tipo com varanda e Garden de 52,36 a 83,34 m², lazer completo e comodidades integradas a poucos minutos da Av. Abílio Machado.',
    corCapa: 'guava',
    imagem: '/images/lancamentos/horizon/cover.webp',
    imagemWidth: 640,
    imagemHeight: 400,
    imagemAlt:
      'Fachada da torre única do residencial Horizon cercado por área verde no bairro Serrano, Belo Horizonte',
    diferenciais: [
      'Lazer completo: piscinas adulto e infantil, prainha, solarium, salão de festas com varanda, churrasqueira, espaço gourmet com varanda/terraço, espaço kids, playground, sauna e descanso, espaço massagem, spa, ducha e academia',
      'Comodidades inclusas e sob demanda: bicicletário, bike wash, ferramentas compartilhadas, coworking, espaço beauty, espaço massagem, guarda-entregas, app Novolar Conecta, além de Novomarket e lavanderia sob demanda',
      'Segurança e sustentabilidade (Selo Sempre Verde): portaria 24h, eclusa de veículos e pedestres, hall enclausurado, câmeras, fechadura eletromagnética, previsão para placas fotovoltaicas, LED com sensor, dual flux, economizadores e previsão de medição individualizada de água e gás',
      'Acabamento dos apartamentos: salas integradas, varandas em todas as unidades, porcelanato na sala, varanda, cozinha e banheiros, bancadas em granito e previsão para ar-condicionado na sala e suíte',
    ],
    pilares: [
      {
        id: 'lazer',
        label: 'Lazer',
        itens: [
          'Piscinas adulto e infantil',
          'Prainha e solarium',
          'Salão de festas com varanda',
          'Churrasqueira',
          'Espaço gourmet com varanda/terraço',
          'Espaço kids e playground',
          'Sauna e descanso',
          'Espaço massagem, spa e ducha',
          'Academia',
        ],
      },
      {
        id: 'praticidade',
        label: 'Comodidades',
        itens: [],
        subgrupos: [
          {
            titulo: 'Inclusas no condomínio',
            itens: [
              'Bicicletário e bike wash',
              'Ferramentas compartilhadas',
              'Coworking',
              'Espaço beauty',
              'Espaço massagem',
              'Guarda-entregas',
              'App Novolar Conecta',
            ],
          },
          {
            titulo: 'Sob demanda',
            itens: ['Novomarket', 'Lavanderia'],
          },
        ],
      },
      {
        id: 'seguranca',
        label: 'Segurança & Sustentabilidade',
        itens: [
          'Portaria 24h com eclusa de veículos e pedestres',
          'Hall enclausurado, câmeras e fechadura eletromagnética',
          'Selo Sempre Verde',
          'Previsão de placas fotovoltaicas',
          'Iluminação em LED com sensor',
          'Sistema dual flux e dispositivos economizadores',
          'Previsão de medição individualizada de água e gás',
        ],
      },
      {
        id: 'acabamentos',
        label: 'Apartamento & Acabamentos',
        itens: [
          'Salas integradas',
          'Varandas em todas as unidades',
          'Porcelanato na sala, varanda, cozinha e banheiros',
          'Bancadas em granito',
          'Previsão para ar-condicionado na sala e suíte',
        ],
      },
    ],
    entorno: [
      { local: 'Academia em Forma', tempo: '1 min' },
      { local: 'Pit Stop Lanches', tempo: '1 min' },
      { local: 'Praça Sol Nascente', tempo: '1 min' },
      { local: 'Comércio Av. Abílio Machado', tempo: '2 min' },
      { local: 'Villefort Atacado e Varejo', tempo: '2 min' },
      { local: 'Arena 7 BH', tempo: '3 min' },
      { local: 'Colégio CEM', tempo: '3 min' },
      { local: 'Colégio Chromos', tempo: '3 min' },
      { local: 'Smart Fit', tempo: '4 min' },
      { local: 'Drogaria Araújo', tempo: '4 min' },
      { local: 'EPA Supermercados', tempo: '4 min' },
      { local: 'Mart Minas', tempo: '4 min' },
      { local: 'Topázio Mall', tempo: '4 min' },
      { local: 'Laboratório Hermes Pardini', tempo: '7 min' },
      { local: 'Parque Ursulina de Andrade', tempo: '9 min' },
      { local: 'Hospital Alberto Cavalcanti', tempo: '10 min' },
    ],
    whatsappMensagem:
      'Oi! Gostaria de receber as plantas e a tabela atualizada do Horizon (Serrano).',
    galeria: [
      {
        url: '/images/lancamentos/horizon/piscina-vista.webp',
        alt: 'Piscina adulto com prainha e vista para área verde preservada no Horizon',
        width: 596,
        height: 476,
      },
      {
        url: '/images/lancamentos/horizon/piscina-solarium.webp',
        alt: 'Piscina adulto e solarium com vista livre no residencial Horizon',
        width: 596,
        height: 476,
      },
      {
        url: '/images/lancamentos/horizon/espaco-gourmet.webp',
        alt: 'Espaço gourmet integrado à varanda e ao lazer do residencial Horizon no Serrano',
        width: 467,
        height: 242,
      },
      {
        url: '/images/lancamentos/horizon/salao-festas.webp',
        alt: 'Salão de festas integrado ao terraço no Horizon',
        width: 467,
        height: 242,
      },
      {
        url: '/images/lancamentos/horizon/churrasqueira.webp',
        alt: 'Churrasqueira com área de convivência no lazer do Horizon',
        width: 466,
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
        url: '/images/lancamentos/horizon/suite.webp',
        alt: 'Suíte decorada do residencial Horizon no bairro Serrano',
        width: 596,
        height: 356,
      },
      {
        url: '/images/lancamentos/horizon/quarto.webp',
        alt: 'Segundo quarto com layout versátil no apartamento decorado do Horizon',
        width: 592,
        height: 594,
      },
      {
        url: '/images/lancamentos/horizon/fitness.webp',
        alt: 'Academia equipada e climatizada com vista livre no Horizon',
        width: 596,
        height: 238,
      },
      {
        url: '/images/lancamentos/horizon/sauna-descanso.webp',
        alt: 'Sauna com área de descanso no pavimento de lazer do Horizon',
        width: 596,
        height: 381,
      },
      {
        url: '/images/lancamentos/horizon/espaco-massagem.webp',
        alt: 'Espaço massagem entregue equipado no residencial Horizon',
        width: 524,
        height: 366,
      },
      {
        url: '/images/lancamentos/horizon/playground.webp',
        alt: 'Playground externo integrado ao lazer do Horizon',
        width: 595,
        height: 244,
      },
      {
        url: '/images/lancamentos/horizon/espaco-kids.webp',
        alt: 'Espaço kids montado e mobiliado no Horizon',
        width: 524,
        height: 286,
      },
      {
        url: '/images/lancamentos/horizon/coworking.webp',
        alt: 'Coworking compartilhado entregue mobiliado no Horizon',
        width: 550,
        height: 407,
      },
      {
        url: '/images/lancamentos/horizon/espaco-beauty.webp',
        alt: 'Espaço beauty exclusivo para os moradores do Horizon',
        width: 596,
        height: 382,
      },
      {
        url: '/images/lancamentos/horizon/bicicletario.webp',
        alt: 'Bicicletário organizado nas áreas comuns do Horizon',
        width: 575,
        height: 243,
      },
      {
        url: '/images/lancamentos/horizon/bike-wash.webp',
        alt: 'Espaço bike wash para manutenção e lavagem de bicicletas no Horizon',
        width: 481,
        height: 464,
      },
      {
        url: '/images/lancamentos/horizon/ferramentas-compartilhadas.webp',
        alt: 'Oficina de ferramentas compartilhadas do condomínio Horizon',
        width: 596,
        height: 422,
      },
      {
        url: '/images/lancamentos/horizon/lavanderia.webp',
        alt: 'Lavanderia compartilhada instalada no Horizon',
        width: 450,
        height: 397,
      },
      {
        url: '/images/lancamentos/horizon/portaria-fachada.webp',
        alt: 'Portaria 24 horas com acesso de pedestres e paisagismo no Horizon',
        width: 596,
        height: 436,
      },
      {
        url: '/images/lancamentos/horizon/lazer-perspectiva.webp',
        alt: 'Perspectiva aérea da área de lazer do Horizon junto à Área de Preservação Permanente',
        width: 596,
        height: 436,
      },
      {
        url: '/images/lancamentos/horizon/implantacao.webp',
        alt: 'Implantação do residencial Horizon na Rua Imperial, 250',
        width: 584,
        height: 737,
      },
    ],
    plantas: [
      {
        id: 'horizon-tipo-54-08',
        titulo: 'Tipo 54,11 m²',
        categoria: '2 Quartos',
        metragem: '54,11 m²',
        quartos: '2 quartos com suíte e varanda',
        banhos: '2 banhos',
        unidades: 'Final 08',
        destaque: 'Varanda e salas integradas',
        imagem: '/images/lancamentos/horizon/planta-tipo-54m2-08.webp',
        width: 409,
        height: 324,
        alt: 'Planta humanizada do apartamento Tipo 54,11 m² (2 quartos com suíte e varanda, Final 08) do Horizon',
      },
      {
        id: 'horizon-tipo-54-03',
        titulo: 'Tipo 54,29 m²',
        categoria: '2 Quartos',
        metragem: '54,29 m²',
        quartos: '2 quartos com suíte e varanda',
        banhos: '2 banhos',
        unidades: 'Final 03',
        destaque: 'Suíte reservada e varanda',
        imagem: '/images/lancamentos/horizon/planta-tipo-54m2-03.webp',
        width: 409,
        height: 456,
        alt: 'Planta humanizada do apartamento Tipo 54,29 m² (2 quartos com suíte e varanda, Final 03) do Horizon',
      },
      {
        id: 'horizon-tipo-56-05',
        titulo: 'Tipo 56,89 m²',
        categoria: '2 Quartos',
        metragem: '56,89 m²',
        quartos: '2 quartos com suíte e varanda',
        banhos: '2 banhos',
        unidades: 'Final 05',
        destaque: 'Salas amplas integradas à varanda',
        imagem: '/images/lancamentos/horizon/planta-tipo-56m2.webp',
        width: 540,
        height: 381,
        alt: 'Planta humanizada do apartamento Tipo 56,89 m² (2 quartos com suíte e varanda, Final 05) do Horizon',
      },
      {
        id: 'horizon-garden-52-106',
        titulo: 'Garden 52,36 m²',
        categoria: '1 Quarto Garden',
        metragem: '52,36 m²',
        quartos: '1 quarto com área privativa',
        banhos: '1 banho',
        unidades: 'Unidade 106',
        destaque: 'Área privativa descoberta integrada',
        imagem: '/images/lancamentos/horizon/planta-garden-52m2.webp',
        width: 409,
        height: 324,
        alt: 'Planta humanizada do apartamento Garden 52,36 m² (1 quarto com área privativa, Unidade 106) do Horizon',
      },
      {
        id: 'horizon-garden-76-103',
        titulo: 'Garden 76,10 m²',
        categoria: '2 Quartos Garden',
        metragem: '76,10 m²',
        quartos: '2 quartos com suíte e área privativa',
        banhos: '2 banhos',
        unidades: 'Unidade 103',
        destaque: 'Duas áreas privativas descobertas',
        imagem: '/images/lancamentos/horizon/planta-garden-76m2.webp',
        width: 409,
        height: 559,
        alt: 'Planta humanizada do apartamento Garden 76,10 m² (2 quartos com suíte e área privativa, Unidade 103) do Horizon',
      },
      {
        id: 'horizon-garden-83-108',
        titulo: 'Garden 83,34 m²',
        categoria: '2 Quartos Garden',
        metragem: '83,34 m²',
        quartos: '2 quartos com suíte e varanda',
        banhos: '2 banhos',
        unidades: 'Unidade 108',
        destaque: 'Ampla área privativa em L com varanda',
        imagem: '/images/lancamentos/horizon/planta-garden-83m2.webp',
        width: 476,
        height: 458,
        alt: 'Planta humanizada do apartamento Garden 83,34 m² (2 quartos com suíte e varanda, Unidade 108) do Horizon',
      },
    ],
    published: true,
    order: 3,
  },
  {
    slug: 'brumadinho-165',
    nome: 'Brumadinho 165',
    tagline: 'Studios compactos em localização estratégica no Prado.',
    bairro: 'Prado',
    cidade: 'Belo Horizonte',
    uf: 'MG',
    endereco: 'Rua Brumadinho, 165, esquina com Rua Chapecó',
    estrutura:
      '31 unidades · Studios em torno de 29 m² · Elevador · Rooftop de convivência · Condomínio econômico',
    badge: 'Lançamento',
    tags: [
      'Studio ~29 m²',
      'Rooftop de convivência',
      'Condomínio econômico',
      'Prado',
    ],
    quartos: 'Studios compactos',
    metragem: 'Em torno de 29 m²',
    tipologias: 'Studio (5 layouts)',
    vagas: '12 carro e 18 moto (vendidas à parte)',
    resumo:
      'Um empreendimento contemporâneo em uma esquina estratégica do Prado, pensado para quem valoriza praticidade, mobilidade e um jeito atual de viver a cidade. Reúne 31 unidades de studios compactos em torno de 29 m² com cinco alternativas ilustrativas de layout, elevador, rooftop de convivência e condomínio econômico, a apenas 3,9 km da Praça Sete. Conta ainda com 12 vagas de carro e 18 vagas de moto vendidas à parte.',
    corCapa: 'moss',
    imagem: '/images/lancamentos/brumadinho-165/cover.webp',
    imagemWidth: 800,
    imagemHeight: 1047,
    imagemAlt:
      'Fachada contemporânea do Brumadinho 165 na esquina da Rua Brumadinho com Rua Chapecó, no Prado, Belo Horizonte',
    diferenciais: [
      '31 unidades de studios compactos em torno de 29 m² com cinco alternativas ilustrativas de layout',
      'Rooftop de convivência pensado para encontros, pausas e momentos ao ar livre, com espaço fitness e área de estar',
      'Elevador e condomínio econômico em uma esquina estratégica do Prado',
      '12 vagas de carro e 18 vagas de moto vendidas à parte',
      'A apenas 3,9 km da Praça Sete, com acesso facilitado ao Centro de BH, Av. Francisco Sá, Av. do Contorno e Av. Amazonas',
    ],
    pilares: [
      {
        id: 'lazer',
        label: 'Rooftop & Convivência',
        itens: [
          'Rooftop de convivência ao ar livre',
          'Espaço fitness no rooftop',
          'Mesas e áreas de estar com paisagismo',
          'Vista urbana do Prado',
        ],
      },
      {
        id: 'praticidade',
        label: 'Produto & Praticidade',
        itens: [
          '31 unidades exclusivas',
          'Studios em torno de 29 m²',
          '5 variações ilustrativas de layout',
          'Elevador',
          'Condomínio econômico',
          '12 vagas de carro vendidas à parte',
          '18 vagas de moto vendidas à parte',
        ],
      },
    ],
    entorno: [
      { local: 'Praça Sete', tempo: '3,9 km' },
      { local: 'Av. Francisco Sá', tempo: 'Acesso imediato' },
      { local: 'Av. Amazonas', tempo: 'Acesso facilitado' },
      { local: 'Av. do Contorno', tempo: 'Acesso facilitado' },
      { local: 'Hospital Mater Dei', tempo: 'Região hospitalar' },
      { local: 'Hospital Felício Rocho', tempo: 'Região hospitalar' },
      { local: 'Colégio Pio XII', tempo: 'Entorno próximo' },
      { local: 'VerdeMar', tempo: 'Entorno próximo' },
    ],
    whatsappMensagem:
      'Oi! Gostaria de receber mais informações e disponibilidade do Brumadinho 165 (Prado).',
    galeria: [
      {
        url: '/images/lancamentos/brumadinho-165/cover.webp',
        alt: 'Perspectiva da fachada do Brumadinho 165 na esquina da Rua Brumadinho com Rua Chapecó, no Prado',
        width: 1400,
        height: 1833,
      },
      {
        url: '/images/lancamentos/brumadinho-165/rooftop-convivencia.webp',
        alt: 'Rooftop de convivência ao entardecer com mesas, guarda-sol e vista urbana no Brumadinho 165',
        width: 1526,
        height: 674,
      },
      {
        url: '/images/lancamentos/brumadinho-165/rooftop-perspectiva-3d.webp',
        alt: 'Perspectiva 3D do rooftop de convivência e lazer com espaço fitness no Brumadinho 165',
        width: 1600,
        height: 897,
      },
      {
        url: '/images/lancamentos/brumadinho-165/localizacao-prado.webp',
        alt: 'Mapa aéreo da localização estratégica do Brumadinho 165 no Prado, próximo ao Hospital Mater Dei, Hospital Felício Rocho, Colégio Pio XII, VerdeMar, Av. Francisco Sá, Av. do Contorno e Av. Amazonas',
        width: 1600,
        height: 1139,
      },
    ],
    plantas: [
      {
        id: 'brumadinho-layout-01',
        titulo: 'Layout 01',
        categoria: 'Studio ~29 m²',
        metragem: 'Em torno de 29 m²',
        quartos: 'Studio',
        banhos: '1 banho',
        destaque: 'Variação ilustrativa de layout',
        imagem: '/images/lancamentos/brumadinho-165/layout-01.webp',
        width: 340,
        height: 400,
        alt: 'Planta humanizada Layout 01 do studio de aproximadamente 29 m² do Brumadinho 165',
      },
      {
        id: 'brumadinho-layout-02',
        titulo: 'Layout 02',
        categoria: 'Studio ~29 m²',
        metragem: 'Em torno de 29 m²',
        quartos: 'Studio',
        banhos: '1 banho',
        destaque: 'Variação ilustrativa de layout',
        imagem: '/images/lancamentos/brumadinho-165/layout-02.webp',
        width: 635,
        height: 282,
        alt: 'Planta humanizada Layout 02 do studio de aproximadamente 29 m² do Brumadinho 165',
      },
      {
        id: 'brumadinho-layout-03',
        titulo: 'Layout 03',
        categoria: 'Studio ~29 m²',
        metragem: 'Em torno de 29 m²',
        quartos: 'Studio',
        banhos: '1 banho',
        destaque: 'Variação ilustrativa de layout',
        imagem: '/images/lancamentos/brumadinho-165/layout-03.webp',
        width: 340,
        height: 475,
        alt: 'Planta humanizada Layout 03 do studio de aproximadamente 29 m² do Brumadinho 165',
      },
      {
        id: 'brumadinho-layout-04',
        titulo: 'Layout 04',
        categoria: 'Studio ~29 m²',
        metragem: 'Em torno de 29 m²',
        quartos: 'Studio',
        banhos: '1 banho',
        destaque: 'Variação ilustrativa de layout',
        imagem: '/images/lancamentos/brumadinho-165/layout-04.webp',
        width: 1175,
        height: 885,
        alt: 'Planta humanizada Layout 04 do studio de aproximadamente 29 m² do Brumadinho 165',
      },
      {
        id: 'brumadinho-layout-05',
        titulo: 'Layout 05',
        categoria: 'Studio ~29 m²',
        metragem: 'Em torno de 29 m²',
        quartos: 'Studio',
        banhos: '1 banho',
        destaque: 'Variação ilustrativa de layout',
        imagem: '/images/lancamentos/brumadinho-165/layout-05.webp',
        width: 385,
        height: 447,
        alt: 'Planta humanizada Layout 05 do studio de aproximadamente 29 m² do Brumadinho 165',
      },
    ],
    published: true,
    order: 4,
  },
];

export const SEARCH_SUGGESTIONS: string[] = [
  'Estoril',
  'Prado',
  'Santa Efigênia',
  'Serrano',
  'Prime View',
  'Upside Square',
  'Horizon',
  'Brumadinho 165',
];

export const QUICK_NEIGHBORHOODS: string[] = [
  'Estoril',
  'Prado',
  'Santa Efigênia',
  'Serrano',
];

export function scoreLancamentoForObjetivo(
  item: Lancamento,
  objetivo: string | null | undefined
): number {
  const normalizedObjetivo = normalizeSearchText(objetivo ?? '');
  if (!normalizedObjetivo) {
    return 0;
  }

  const haystack = normalizeSearchText(
    [
      item.quartos,
      item.tipologias,
      item.resumo,
      item.bairro,
      ...item.tags,
      ...(item.condicoesEspeciais ?? []),
      ...item.diferenciais,
    ].join(' ')
  );

  let score = 0;

  if (normalizedObjetivo.includes('aluguel')) {
    if (haystack.includes('repasse caixa') || haystack.includes('entrada parcelada')) {
      score += 3;
    }
    if (haystack.includes('itbi') || haystack.includes('fgts') || haystack.includes('bonus')) {
      score += 2;
    }
    if (typeof item.precoAPartirDe === 'number' && item.precoAPartirDe > 0) {
      if (item.precoAPartirDe <= 450_000) score += 3;
      else if (item.precoAPartirDe <= 650_000) score += 1;
    }
    if (haystack.includes('1 quarto') || haystack.includes('2 quartos')) {
      score += 1;
    }
    return score;
  }

  if (normalizedObjetivo.includes('upgrade')) {
    if (haystack.includes('cobertura') || haystack.includes('garden')) score += 3;
    if (haystack.includes('suite')) score += 2;
    if (haystack.includes('2 vagas') || haystack.includes('lazer completo')) score += 2;
    if (haystack.includes('vista panoramica') || haystack.includes('varanda')) score += 1;
    return score;
  }

  if (normalizedObjetivo.includes('investir')) {
    if (haystack.includes('studio') || haystack.includes('1 quarto')) score += 3;
    if (haystack.includes('coworking') || haystack.includes('novomarket')) score += 2;
    if (
      haystack.includes('santa efigenia') ||
      haystack.includes('estoril') ||
      haystack.includes('prado')
    ) {
      score += 2;
    }
    if (haystack.includes('edge') || haystack.includes('patrimar')) score += 1;
    return score;
  }

  return 0;
}

export function rankLancamentosByObjetivo(
  items: readonly Lancamento[],
  objetivo: string | null | undefined
): Lancamento[] {
  const normalizedObjetivo = normalizeSearchText(objetivo ?? '');
  if (!normalizedObjetivo) {
    return [...items];
  }

  return [...items]
    .map((item, index) => ({
      item,
      index,
      score: scoreLancamentoForObjetivo(item, normalizedObjetivo),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.item);
}

export function filterLancamentos(
  query: string,
  activeFilter: string,
  items: readonly Lancamento[] = LANCAMENTOS,
  tipologiaFilter = 'Todas',
  objetivoFilter: string | null = null
): Lancamento[] {
  const normalized = normalizeSearchText(query);
  const normalizedTipologia = normalizeSearchText(tipologiaFilter);

  const filtered = items.filter((item) => {
    const matchesFilter =
      activeFilter === 'Todos' ||
      normalizeSearchText(item.quartos).includes(normalizeSearchText(activeFilter)) ||
      item.tags.some(
        (tag) => normalizeSearchText(tag) === normalizeSearchText(activeFilter)
      );

    if (!matchesFilter) return false;

    if (normalizedTipologia && normalizedTipologia !== 'todas') {
      const tipologiaHaystack = normalizeSearchText(
        `${item.quartos} ${item.tipologias} ${item.resumo} ${item.tags.join(' ')}`
      );
      if (!tipologiaHaystack.includes(normalizedTipologia)) {
        return false;
      }
    }

    if (!normalized) return true;

    const searchable = normalizeSearchText(
      [
        item.nome,
        item.construtora ?? '',
        item.bairro,
        item.cidade,
        item.quartos,
        item.tipologias,
        item.resumo,
        ...item.tags,
      ].join(' ')
    );

    return searchable.includes(normalized);
  });

  return rankLancamentosByObjetivo(filtered, objetivoFilter);
}

export function getLancamentoBySlug(slug: string): Lancamento | undefined {
  return LANCAMENTOS.find((item) => item.slug === slug);
}
