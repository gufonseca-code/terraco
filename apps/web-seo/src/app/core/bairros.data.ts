export interface BairroFaqItem {
  pergunta: string;
  resposta: string;
}

export interface BairroGuide {
  slug: string;
  nome: string;
  regiao: string;
  cidade: string;
  uf: string;
  tituloSeo: string;
  descricaoSeo: string;
  resumo: string;
  mobilidade: string;
  servicos: string;
  perfilImoveis: string;
  matchBairros: string[];
  nearbyBairros?: string[];
  faqs: BairroFaqItem[];
}

export const BAIRROS_BH: readonly BairroGuide[] = [
  {
    slug: 'estoril',
    nome: 'Estoril',
    regiao: 'Região Oeste',
    cidade: 'Belo Horizonte',
    uf: 'MG',
    tituloSeo: 'Lançamentos no Estoril, Belo Horizonte | Terraço',
    descricaoSeo:
      'Guia do bairro Estoril em Belo Horizonte: mobilidade pela Av. Barão Homem de Melo, proximidade ao Buritis e lançamentos de apartamentos novos.',
    resumo:
      'Bairro residencial tranquilo na Região Oeste de Belo Horizonte, em cota elevada com vista panorâmica para a cidade e acesso rápido ao Buritis e à Av. Barão Homem de Melo.',
    mobilidade:
      'Conexão direta pela Av. Barão Homem de Melo, com acesso rápido ao Anel Rodoviário, à Av. Raja Gabaglia e ao corredor do Buritis, facilitando o deslocamento para a Zona Sul e o Centro.',
    servicos:
      'Rotina bem atendida por supermercados, farmácias, padarias, escolas e academias no próprio bairro e no entorno imediato do Shopping Paragem e da Av. Professor Mário Werneck.',
    perfilImoveis:
      'Predomínio de condomínios residenciais contemporâneos de 1 e 2 quartos com suíte, plantas entre 49 e 103 m², varanda ou área garden e lazer completo entregue decorado.',
    matchBairros: ['Estoril'],
    faqs: [
      {
        pergunta: 'Como é morar no bairro Estoril em Belo Horizonte?',
        resposta:
          'O Estoril combina ruas residenciais tranquilas com vista aberta para a cidade e a conveniência de estar colado ao Buritis. É procurado por casais e famílias que buscam condomínios modernos com boa circulação e menos trânsito interno.',
      },
      {
        pergunta: 'Quais são as principais vias de acesso do Estoril?',
        resposta:
          'O acesso principal se dá pela Av. Barão Homem de Melo, que liga o bairro ao Anel Rodoviário, à Av. Raja Gabaglia e às vias de acesso ao Buritis, Palmeiras e Nova Suíça.',
      },
      {
        pergunta: 'O Estoril fica próximo ao Buritis e a supermercados?',
        resposta:
          'Sim. O Estoril faz divisa imediata com o Buritis, ficando a poucos minutos de carro de supermercados, escolas, do Shopping Paragem e do polo gastronômico da Av. Professor Mário Werneck.',
      },
      {
        pergunta: 'Qual é o perfil dos lançamentos imobiliários no Estoril?',
        resposta:
          'Os lançamentos recentes no Estoril concentram apartamentos de 1 e 2 quartos com suíte, opções Garden e coberturas lineares, com foco em segurança 24h, vista panorâmica e lazer completo no condomínio.',
      },
    ],
  },
  {
    slug: 'santa-efigenia',
    nome: 'Santa Efigênia',
    regiao: 'Região Centro-Sul / Leste',
    cidade: 'Belo Horizonte',
    uf: 'MG',
    tituloSeo: 'Lançamentos em Santa Efigênia, Belo Horizonte | Terraço',
    descricaoSeo:
      'Guia do bairro Santa Efigênia em BH: polo médico-hospitalar, metrô, Praça Floriano Peixoto, Shopping Boulevard e lançamentos de studios e 2 suítes.',
    resumo:
      'Bairro tradicional na região central de Belo Horizonte, referência pelo polo médico-hospitalar, pela Praça Floriano Peixoto e pela facilidade de fazer o dia a dia a pé ou de metrô.',
    mobilidade:
      'Atendido pela Estação Santa Efigênia do metrô e cortado por eixos como a Av. dos Andradas, Av. do Contorno e Av. Brasil, com acesso rápido à Savassi, Funcionários e Centro.',
    servicos:
      'Concentra importantes hospitais (Hospital da Unimed, Santa Casa, Hospital das Clínicas e Faculdade de Medicina da UFMG), além do Shopping Boulevard, escolas, cafés e comércio de rua consolidado.',
    perfilImoveis:
      'Forte demanda de moradia prática e locação de curta ou longa duração, com destaque para torres únicas contemporâneas que reúnem studios, 1 quarto e apartamentos de 2 suítes.',
    matchBairros: ['Santa Efigênia'],
    faqs: [
      {
        pergunta: 'Por que o Santa Efigênia é tão procurado para morar e investir?',
        resposta:
          'A proximidade à área hospitalar, à Faculdade de Medicina da UFMG, ao Shopping Boulevard e ao metrô mantém liquidez constante tanto para quem trabalha na região central quanto para investidores focados em locação.',
      },
      {
        pergunta: 'O bairro Santa Efigênia tem acesso fácil ao metrô?',
        resposta:
          'Sim. A Estação Santa Efigênia do metrô fica na Av. dos Andradas e conecta o bairro rapidamente ao Centro, à Pampulha e a Contagem, além da ampla oferta de linhas de ônibus na Av. do Contorno e Av. Brasil.',
      },
      {
        pergunta: 'Quais tipos de apartamentos novos existem no Santa Efigênia?',
        resposta:
          'Os projetos recentes priorizam plantas versáteis entre 30 e 122 m², combinando studios compactos, unidades de 1 quarto e opções de 2 suítes com lazer completo, coworking e serviços compartilhados.',
      },
      {
        pergunta: 'Quais áreas de lazer e conveniência ficam próximas ao bairro?',
        resposta:
          'Além da Praça Floriano Peixoto, muito usada para caminhadas e lazer ao ar livre, o bairro está ao lado do Shopping Boulevard, do Parque Municipal e de bares e restaurantes do Santa Tereza e Funcionários.',
      },
    ],
  },
  {
    slug: 'serrano',
    nome: 'Serrano',
    regiao: 'Região Noroeste',
    cidade: 'Belo Horizonte',
    uf: 'MG',
    tituloSeo: 'Lançamentos no Serrano, Belo Horizonte | Terraço',
    descricaoSeo:
      'Guia do bairro Serrano em BH: continuidade da Av. Abílio Machado ao lado do Castelo, áreas verdes preservadas e lançamentos de 2 quartos com suíte.',
    resumo:
      'Bairro em expansão na Região Noroeste de Belo Horizonte, na continuidade da Av. Abílio Machado ao lado do Castelo, combinando áreas verdes preservadas e bom custo-benefício.',
    mobilidade:
      'Ligação direta pela Av. Abílio Machado e proximidade à Av. Heráclito Mourão de Miranda e ao Anel Rodoviário, conectando com praticidade a Pampulha, o bairro Castelo e Contagem.',
    servicos:
      'Comércio de bairro completo ao longo da Av. Abílio Machado e da Rua Serrana, com supermercados, bancos, farmácias, escolas, academias e acesso rápido aos serviços do Castelo e da Pampulha.',
    perfilImoveis:
      'Excelente relação entre metragem, lazer e valor por metro quadrado, com destaque para apartamentos novos de 1 e 2 quartos com suíte, varanda, garagem e condomínios cercados por área verde.',
    matchBairros: ['Serrano'],
    faqs: [
      {
        pergunta: 'Onde fica localizado o bairro Serrano em Belo Horizonte?',
        resposta:
          'O Serrano fica na Região Noroeste de BH, na continuidade da Av. Abílio Machado, fazendo divisa com o bairro Castelo, o Jardim Alvorada e o município de Contagem.',
      },
      {
        pergunta: 'Qual é o diferencial dos lançamentos no Serrano?',
        resposta:
          'Os empreendimentos recentes oferecem ótimo custo-benefício para quem busca 2 quartos com suíte e varanda em condomínio fechado, frequentemente com vista livre para áreas verdes e lazer completo entregue mobiliado.',
      },
      {
        pergunta: 'O Serrano tem comércio e serviços por perto?',
        resposta:
          'Sim. A região conta com o corredor comercial da Av. Abílio Machado — um dos mais completos da Região Noroeste — além da proximidade a supermercados, escolas e restaurantes do bairro Castelo.',
      },
      {
        pergunta: 'Como é o acesso do Serrano para a Pampulha e o Centro?',
        resposta:
          'O deslocamento ocorre pela Av. Abílio Machado e pela Av. Heráclito Mourão de Miranda em direção à Pampulha e à Av. Presidente Antônio Carlos, além de ligação rápida ao Anel Rodoviário.',
      },
    ],
  },
  {
    slug: 'buritis',
    nome: 'Buritis',
    regiao: 'Região Oeste',
    cidade: 'Belo Horizonte',
    uf: 'MG',
    tituloSeo: 'Lançamentos no Buritis, Belo Horizonte | Terraço',
    descricaoSeo:
      'Guia do bairro Buritis em BH: UniBH, Parque Aggeo Pio Sobrinho, gastronomia na Av. Professor Mário Werneck e oportunidades na região Oeste.',
    resumo:
      'Um dos bairros mais procurados por famílias e jovens profissionais na Região Oeste de Belo Horizonte, com vida própria, parques arborizados e forte polo gastronômico e universitário.',
    mobilidade:
      'Estruturado em torno da Av. Professor Mário Werneck e conectado à Av. Barão Homem de Melo, Av. Raja Gabaglia e Anel Rodoviário, fazendo divisa imediata com o bairro Estoril.',
    servicos:
      'Reúne o campus do UniBH, o Parque Municipal Aggeo Pio Sobrinho, escolas tradicionais, supermercados, academias, clínicas e uma ampla variedade de bares, cafés e restaurantes.',
    perfilImoveis:
      'Alta procura por apartamentos modernos de 2 e 3 quartos com lazer completo. Pela escassez de terrenos disponíveis dentro do Buritis, muitos compradores também avaliam lançamentos vizinhos no Estoril.',
    matchBairros: ['Buritis'],
    nearbyBairros: ['Estoril'],
    faqs: [
      {
        pergunta: 'Por que o Buritis é um dos bairros mais buscados de BH?',
        resposta:
          'O Buritis funciona como um bairro autossuficiente: oferece escolas, faculdade (UniBH), supermercados, gastronomia variada na Av. Professor Mário Werneck e contato com o verde no Parque Aggeo Pio Sobrinho.',
      },
      {
        pergunta: 'Por que há menos lançamentos novos dentro do próprio Buritis?',
        resposta:
          'Por ser um bairro já bastante consolidado e adensado, há menos terrenos amplos disponíveis para novos condomínios com lazer completo. Por isso, empreendimentos no bairro vizinho Estoril acabam atendendo quem quer morar a poucos minutos da Mário Werneck.',
      },
      {
        pergunta: 'O Estoril é uma boa alternativa para quem procura apartamento no Buritis?',
        resposta:
          'Sim. O Estoril faz divisa direta com o Buritis, permite acessar os mesmos serviços e escolas em poucos minutos e costuma oferecer terrenos maiores, vista panorâmica e saída mais ágil pela Av. Barão Homem de Melo.',
      },
      {
        pergunta: 'Como saber quando surgir um novo lançamento no Buritis?',
        resposta:
          'Você pode cadastrar seu WhatsApp no alerta desta página para ser avisado pela equipe da Terraço assim que um novo empreendimento no Buritis entrar em pré-lançamento.',
      },
    ],
  },
];

export function getBairroBySlug(slug: string): BairroGuide | undefined {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }
  return BAIRROS_BH.find((bairro) => bairro.slug === normalized);
}
