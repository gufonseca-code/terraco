export interface Lancamento {
  slug: string;
  nome: string;
  bairro: string;
  cidade: string;
  uf: string;
  badge: string;
  tags: string[];
  quartos: string;
  metragem: string;
  vagas: string;
  precoAPartirDe: number;
  entrega: string;
  resumo: string;
  corCapa: "moss" | "ipe" | "guava";
  imagem: string;
  imagemAlt: string;
}

export const WHATSAPP_NUMBER = "5511999999999"; // Substituir pelo número real com DDI + DDD

export function buildWhatsAppUrl(mensagem: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
}

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export const LANCAMENTOS: Lancamento[] = [
  {
    slug: "residencial-ipe-amarelo",
    nome: "Residencial Ipê Amarelo",
    bairro: "Vila Madalena",
    cidade: "São Paulo",
    uf: "SP",
    badge: "Lançamento",
    tags: ["Sol da manhã", "Varanda", "Aceita pet"],
    quartos: "2 quartos",
    metragem: "58 a 72 m²",
    vagas: "1 vaga",
    precoAPartirDe: 540000,
    entrega: "Entrega em 2027",
    resumo:
      "Plantas inteligentes com varanda integrada, cobogós na fachada e lazer no rooftop a poucos minutos do metrô.",
    corCapa: "ipe",
    imagem: "/images/standins/photo-f40344812-960.jpg",
    imagemAlt:
      "Entrada residencial ensolarada com parede branca, porta amarela e palmeiras",
  },
  {
    slug: "edifico-cobogo-sul",
    nome: "Edifício Cobogó Sul",
    bairro: "Pinheiros",
    cidade: "São Paulo",
    uf: "SP",
    badge: "Novo",
    tags: ["2 quartos", "3 quartos", "Bicicletário"],
    quartos: "2 e 3 quartos",
    metragem: "64 a 92 m²",
    vagas: "1 a 2 vagas",
    precoAPartirDe: 690000,
    entrega: "Obras iniciadas",
    resumo:
      "Arquitetura brasileira contemporânea em rua arborizada, com iluminação natural abundante e áreas comuns acolhedoras.",
    corCapa: "moss",
    imagem: "/images/standins/photo-f114225113-960.jpg",
    imagemAlt:
      "Conjunto residencial com terraços escalonados e jardins integrados",
  },
  {
    slug: "casa-das-samambaias",
    nome: "Casa das Samambaias",
    bairro: "Perdizes",
    cidade: "São Paulo",
    uf: "SP",
    badge: "Últimas unidades",
    tags: ["Sol da manhã", "Varanda", "2 quartos"],
    quartos: "2 quartos",
    metragem: "54 a 68 m²",
    vagas: "1 vaga",
    precoAPartirDe: 485000,
    entrega: "Entrega em 2026",
    resumo:
      "Condomínio boutique com poucas unidades, terraço verde compartilhado e acabamento em materiais naturais.",
    corCapa: "guava",
    imagem: "/images/standins/photo-f151566371-960.jpg",
    imagemAlt:
      "Edifício residencial cercado por área verde arborizada sob céu claro",
  },
];
