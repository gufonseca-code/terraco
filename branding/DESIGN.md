# DESIGN.md — Identidade Visual **Terraço**

> **Posicionamento:** Plataforma imobiliária digital *warm tech* brasileira — calma, transparente, humana e centrada no morador.  
> **Direção Visual:** Estética residencial de bairros arborizados brasileiros (varandas ensolaradas, cobogós, folhagens tropicais e luz natural) unida à clareza, leveza e precisão de produtos digitais contemporâneos (*Claude, Nubank, Notion, Airbnb*).

---

## 1. Símbolo & Logotipo (**Terraço**)

O logotipo da **Terraço** mantém o nome e a assinatura visual da marca: o símbolo geométrico **Degraus** (três patamares horizontais escalonados que remetem a terraços em níveis e evolução de fase) combinado ao wordmark em **serifa arredondada expressiva** (*Fraunces*).

### Versões Oficiais
* **Web Lockup (Horizontal / Empilhado):** Símbolo **Degraus** + wordmark `Terraço` em Grafite Quente (`#1C1B19`) sobre fundo Papel Limpo (`#FAF8F4`), ou invertido em Papel Limpo (`#FAF8F4`) sobre Verde Folha Urbano (`#1F6F50`) / Grafite Quente (`#1C1B19`).
* **Wordmark Specimen (Editorial):** Uso isolado do wordmark `Terraço` em serifa arredondada pesada (`#1C1B19`) permitido em cabeçalhos editoriais, capas e peças onde a marca já esteja contextualizada.
* **App Icon / Favicon:** Símbolo **Degraus** centralizado no *squircle* em Verde Folha Urbano (`#1F6F50`) com barras em Papel Limpo (`#FAF8F4`), ou em Amarelo Solar (`#F7C957`) com barras em Grafite Quente (`#1C1B19`).

### Regras de Uso
* **Área de respiro mínima:** `1×` a altura da barra superior do símbolo ao redor de todo o lockup.
* **Tamanho mínimo:** `24px` de altura para o lockup completo na web; `16px` para o símbolo isolado em favicons.
* **Proibido:** Aplicar gradientes 3D, distorcer as proporções dos degraus ou usar azul corporativo frio como fundo principal.

---

## 2. Paleta de Cores (**Bairro Arborizado & Warm Tech**)

Adotamos uma base neutra clara e quente que valoriza a fotografia real de arquitetura e reduz a fadiga visual, reservando o **Terracota/Coral** para ações principais e o **Verde Folha Urbano** para status, localização e indicadores positivos.

| Token | Hex | Papel na Interface | Proporção |
| :--- | :--- | :--- | :--- |
| `color.bg.canvas` | `#FAF8F4` | **Papel Limpo** — Fundo principal da página e do app (calmo e luminoso) | 65% |
| `color.bg.surface` | `#F3EFE6` | **Areia Clara** — Faixas tonais, superfícies de apoio e barras sutis | 15% |
| `color.bg.elevated` | `#FFFFFF` | **Branco Puro** — Superfícies elevadas pontuais, popovers e modais | 5% |
| `color.text.primary` | `#1C1B19` | **Grafite Quente** — Textos principais, títulos e wordmark | 10% |
| `color.text.secondary` | `#5C5852` | **Grafite Médio** — Subtítulos, metadados e legendas | — |
| `color.text.inverse` | `#FAF8F4` | **Papel Claro** — Texto sobre superfícies escuras (`#1C1B19` ou `#1F6F50`) | — |
| `color.action.primary` | `#F06A36` | **Terracota Solar (Primary Action)** — CTA principal de cada dobra e ações-chave | 5% |
| `color.action.primaryHover` | `#D95724` | Estado hover/pressed de botões principais (e base quando exigir contraste AA extra) | — |
| `color.action.primarySoft` | `#FDECE5` | Preenchimento suave de destaque ativo ou seleção | — |
| `color.brand.leaf` | `#1F6F50` | **Urban Leaf Green** — Badges de status, indicadores de bairro e etapas concluídas | 5% |
| `color.brand.leafHover` | `#17573E` | Estado hover de elementos em Verde Folha | — |
| `color.brand.leafSoft` | `#E5F2EC` | Fundo suave para tags semânticas e disponibilidade | — |
| `color.brand.solar` | `#F7C957` | **Amarelo Solar** — Detalhes luminosos, destaques editoriais e ilustrações | 5% |
| `color.brand.solarSoft` | `#FFF6DC` | Fundo suave de realce editorial | — |
| `color.border.subtle` | `rgba(28, 27, 25, 0.10)` | **Divisória Sutil** — Linhas estruturais e separadores limpos (`1px`) | — |
| `color.border.strong` | `rgba(28, 27, 25, 0.22)` | **Contorno Ativo** — Estados de foco e bordas de controles interativos | — |

### Regras de Contraste & Uso de Cor
* **Foco único de ação:** Cada tela ou dobra deve ter **no máximo um ponto focal** em Terracota (`#F06A36` / `#D95724`). Não espalhar dezenas de botões laranjas na mesma viewport.
* **Contraste garantido:** Sobre `#F06A36` / `#D95724`, usar texto `#FFFFFF` (em botões `>= 14px` semibold/medium, preferir `#D95724` ou `#C24818` quando necessário para contraste AA confortável). Sobre `#F7C957`, usar sempre texto `#1C1B19`.
* **Bloqueio de monotonia:** Alternar a base clara (`#FAF8F4`) com faixas tonais em Areia Clara (`#F3EFE6`) e pelo menos um bloco de alto contraste em **Grafite Quente (`#1C1B19`)** ou **Verde Folha Urbano (`#1F6F50`)** na página.

---

## 3. Tipografia & Hierarquia Editorial

O contraste entre uma **serifa orgânica e acolhedora** nos títulos e uma **sans-serif geométrica limpa** nos dados cria tensão visual contemporânea sem perder legibilidade em dispositivos móveis.

* **Display & Headlines (`font.family.display`):** `'Fraunces', Georgia, serif`
  * *Uso:* Wordmark, títulos de hero, títulos de seção e nomes de empreendimentos (`text-wrap: balance`, peso `400` ou `500`).
  * *Configuração:* `font-variation-settings: "SOFT" 100, "WONK" 1`.
* **UI, Dados & Corpo (`font.family.sans`):** `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif`
  * *Uso:* Navegação, filtros interativos, metragens, valores (`R$`), prazos de entrega e botões.
  * *Precisão numérica:* Ativar `font-variant-numeric: tabular-nums` em todos os preços, áreas (`m²`), distâncias e contadores.

### Escala Tipográfica
| Token | Tamanho | Line-Height | Peso | Uso |
| :--- | :--- | :--- | :--- | :--- |
| `type.display.xl` | `48px–56px` | `1.04` | `500` | Hero principal desktop (tracking `-0.03em`) |
| `type.display.lg` | `32px–40px` | `1.10` | `500` | Títulos de seção (tracking `-0.025em`) |
| `type.heading.md` | `20px–24px` | `1.20` | `500` | Títulos de empreendimentos e blocos editoriais |
| `type.body.md` | `16px` (`1rem`) | `1.55` | `400` | Texto corrido e descrições principais |
| `type.ui.label` | `14px` (`0.875rem`) | `1.35` | `500` | Botões, chips de filtro e controles |
| `type.ui.meta` | `13px` (`0.8125rem`) | `1.40` | `400` | Rótulos técnicos, bairro, entrega e metadados |

---

## 4. Filosofia *Human-Centered* & Regras Anti-"AI Slop"

Para atrair um público jovem adulto e evitar o visual genérico de templates automatizados, toda interface deve seguir estas diretrizes estruturais:

1. **Menos *Cards*, Mais Superfície Viva:**
   * **Não** envolva todo conteúdo em retângulos brancos arredondados com sombra (`bg-elevated`). Deixe textos, listas, fotografias e filtros pousarem diretamente sobre `#FAF8F4` ou `#F3EFE6`, organizados por tipografia, alinhamento e linhas sutis (`1px`).
   * **Proibido *box-inside-a-box*:** Nunca coloque uma subcaixa arredondada com fundo distinto dentro de outro card (ex.: grade de especificações dentro de uma caixa cinza dentro de um card branco).
2. **Fotografia Como Protagonista (Estilo Editorial / Airbnb):**
   * Imagens de imóveis, varandas, interiores e ruas de Belo Horizonte devem ter respiro e proporção generosa, sem molduras pesadas ou botões `w-full` espremidos no meio do card cortando a leitura.
3. **Interação Direta & Sem Fricção (Estilo Notion / Nubank):**
   * Filtros e simuladores devem responder instantaneamente na interface com chips compactos e feedback claro, sem exigir formulários longos ou cadastro prévio.
4. **Prioridade *Mobile-First* e Controle de Scroll:**
   * **Nunca** empilhe 3 ou mais cards verticais grandes em sequência no mobile. Use trilhos horizontais com `overflow-x-auto snap-x snap-mandatory` (mostrando ~82% da largura do item para insinuar o próximo) ou layouts horizontais compactos.
   * **Nunca** empilhe grupos de filtros em colunas únicas verticais no mobile; use `flex flex-wrap gap-2` com chips proporcionais ao conteúdo.
   * Mantenha espaçamentos verticais enxutos no mobile (`py-12` a `py-16`) para que cada dobra entregue valor imediato.
5. **Variação Real de Ritmo:**
   * Evite repetir a mesma estrutura de seção (ex.: título à esquerda + caixa à direita) mais de duas vezes seguidas. Alterne vitrine fotográfica, barra de descoberta interativa, faixa editorial de alto contraste e navegação limpa.

---

## 5. Layout, Formas & Movimento (*M3 Expressive*)

* **Container & Grid:** Largura máxima de `1280px` (`max-w-7xl`), padding lateral de `16px` (mobile), `24px` (tablet) e `32px` (desktop).
* **Escala de Raios:**
  * `radius.sm`: `8px` (inputs e divisões internas)
  * `radius.md`: `14px` (chips selecionados, miniaturas e controles táteis)
  * `radius.lg`: `20px` (fotografias editoriais e painéis de destaque)
  * `radius.xl`: `28px` (containers principais pontuais)
  * `radius.pill`: `9999px` (CTAs principais, chips em repouso e barras de busca)
* **Sombras Quentes (uso econômico):**
  * `shadow.chip`: `0 2px 8px rgba(28, 27, 25, 0.06)`
  * `shadow.card`: `0 8px 24px rgba(28, 27, 25, 0.05)`
  * `shadow.floating`: `0 16px 40px rgba(28, 27, 25, 0.08)`
* **Movimento & Acessibilidade:**
  * Transições rápidas e responsivas (`150ms–250ms`, `cubic-bezier(0.2, 0, 0, 1)`) com *shape morphing* sutil entre `pill` e `14px` em chips/toggles ativos.
  * Respeitar obrigatoriamente `@media (prefers-reduced-motion: reduce)` zerando deslocamentos e molas.

---

## 6. Direção de Arte: Fotografia & Ilustração *Risograph*

* **Fotografia Principal (70% do peso visual):** Luz natural quente, varandas com plantas, interiores vividos, pessoas conversando em casa e ruas arborizadas de Belo Horizonte.
* **Ilustração *Risograph* & Arcos Botânicos (30% de acento editorial):** Ilustrações leves de prédios com cobogós, varandas e arcos com samambaias e costela-de-adão nas cores da paleta (`#1F6F50`, `#F06A36`, `#F7C957`, `#1C1B19`), usadas pontualmente no Hero, em estados vazios ou em destaques de bairro — sem poluir a interface inteira.

---

## 7. Tom de Voz & Microcopy

Claro, direto e acolhedor — como conversar com alguém que conhece bem Belo Horizonte e respeita a sua decisão:

| Contexto | Evitar (Imobiliário Tradicional) | Usar (**Terraço Warm Tech**) |
| :--- | :--- | :--- |
| **Chamada Principal** | *Encontre o imóvel dos seus sonhos.* | *Seu próximo canto em BH, sem burocracia.* |
| **Ação Principal** | *Solicitar Atendimento* | *Explorar lançamentos* |
| **Ficha Técnica** | *Consulte condições com nossos corretores.* | *Plantas, valores e entrega abertos na página.* |
| **Contato** | *Preencha o formulário para receber contato.* | *Chame no WhatsApp só sobre o que interessa.* |

---

## 8. Arquivos de Tokens
* [tokens.json](./tokens.json) — Definições estruturadas do Design System.
* [tokens.css](./tokens.css) — Variáveis CSS aplicadas na aplicação web.
```

Com o `DESIGN.md` e os tokens atualizados, a base visual já está alinhada à nova direção. Quando quiser, podemos desenhar juntos a **nova arquitetura da homepage** (seção por seção, sem o excesso de cards) antes de gerar o prompt para o agente implementar!