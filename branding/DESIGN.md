# DESIGN.md — Identidade Visual **Terraço**

> **Posicionamento:** Imobiliária digital *warm tech* brasileira — clara, humana, urbana e descomplicada.  
> **Direção Visual:** Estética urbana de cidades brasileiras (varandas, cobogós, ruas arborizadas) com calor tátil e precisão digital.

---

## 1. Símbolo & Logotipo (**Degraus**)

O logotipo da **Terraço** combina o símbolo geométrico **Degraus** (três patamares horizontais escalonados que remetem a terraços em níveis e à evolução de fase) com o wordmark em **serifa arredondada** (*Recoleta* ou *Fraunces*).

### Versões Oficiais
* **Web Lockup (Horizontal / Empilhado):** Símbolo **Degraus** + wordmark `Terraço` em Grafite Quente (`#1E1D1B`) sobre fundo Creme Papel (`#F8F5EA`), ou invertido em Creme Papel + Amarelo Ipê (`#EEB506`) sobre Verde Musgo (`#2E5B46`) / Grafite Quente (`#1E1D1B`).
* **App Icon / Favicon:** Apenas o símbolo **Degraus** (3 barras arredondadas em proporção ascendente) centralizado no *squircle* em Amarelo Ipê (`#EEB506`) com barras em Grafite Quente (`#1E1D1B`).
* **Supergraphic:** As 3 barras do símbolo podem ser ampliadas como grafismo de fundo, divisória de seção ou moldura em pôsteres, kits de boas-vindas e redes sociais.

### Regras de Uso
* **Área de respiro mínima:** `1×` a altura da barra superior do símbolo ao redor de todo o lockup.
* **Tamanho mínimo:** `24px` de altura para o lockup completo na web; `16px` para o símbolo isolado em favicons.
* **Proibido:** Aplicar gradientes 3D, distorcer as proporções dos degraus, ou usar azul corporativo como fundo principal.

---

## 2. Paleta de Cores (**Ipê & Grafite**)

Seguimos a regra **60-30-10** para manter leveza visual e evitar a frieza do branco `#FFFFFF` e do preto `#000000` puros.

| Token | Hex | Papel na Interface | Proporção |
| :--- | :--- | :--- | :--- |
| `color.bg.canvas` | `#F8F5EA` | **Creme Papel** — Fundo principal de páginas e app | 60% |
| `color.bg.surface` | `#F1E9D8` | **Areia Suave** — Cards secundários, inputs e barras | 60% |
| `color.bg.elevated` | `#FFFDF9` | **Branco Quente** — Cards elevados e modais | 60% |
| `color.text.primary` | `#1E1D1B` | **Grafite Quente** — Textos principais e wordmark | 30% |
| `color.text.secondary` | `#57534E` | **Grafite Médio** — Subtítulos, metadados e legendas | 30% |
| `color.brand.primary` | `#2E5B46` | **Verde Musgo Urbano** — CTAs principais, headers escuros e links ativos | 30% |
| `color.brand.primaryHover` | `#234736` | Estado hover/pressed de botões principais | — |
| `color.brand.accent` | `#EEB506` | **Amarelo Ipê Solar** — Ícone do app, destaques de marca e grafismos | 10% |
| `color.brand.highlight` | `#ED7467` | **Rosa Goiaba** — Favoritos e microinterações táteis (usar com ícone Grafite Quente `#1E1D1B` para contraste AA) | 10% |
| `color.border.subtle` | `#E4DCCB` | **Borda Areia** — Divisórias e contornos de cards (`1px`) | — |
| `color.border.strong` | `#CFC5B2` | **Borda Areia Forte** — Contornos destacados e estados hover | — |

### Estados Semânticos
* **Sucesso / Disponível:** `#2E5B46` (texto/borda) sobre `#E4F0EA` (fundo suave)
* **Atenção / Destaque:** `#8A6500` (texto) sobre `#FEF3C7` (fundo suave)
* **Erro / Indisponível:** `#B9382E` (texto) sobre `#FDE8E6` (fundo suave)

---

## 3. Tipografia

O contraste entre uma **serifa orgânica** nos títulos e uma **sans-serif geométrica amigável** nos dados garante carisma sem sacrificar a legibilidade de preços, metragens e endereços.

* **Display & Headlines (`font.family.display`):** `'Fraunces', Georgia, serif`
  * *Uso:* Wordmark, títulos de seção, hero banners e títulos de cards (sempre retos, sem itálico, com `text-wrap: balance` e peso `400` ou `500`).
  * *Configuração:* Em **Fraunces** (Google Fonts), configurar `font-variation-settings: "SOFT" 100, "WONK" 1`.
* **UI, Preços & Corpo (`font.family.sans`):** `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif`
  * *Uso:* Navegação, filtros, cards de imóveis, valores (`R$`), formulários e botões (peso `400` no corpo e `500` em ações/rótulos).
  * *Dica:* Para preços e tabelas comparativas, ative `font-variant-numeric: tabular-nums`.

### Escala Tipográfica (Enxuta e Consistente)
| Token | Tamanho | Line-Height | Peso | Uso |
| :--- | :--- | :--- | :--- | :--- |
| `type.display.xl` | `48px` (`3rem`) | `1.06` | `500` | Hero principal desktop (tracking `-0.03em`) |
| `type.display.lg` | `36px` (`2.25rem`) | `1.12` | `500` | Títulos de seção (tracking `-0.025em`) |
| `type.heading.md` | `20px–24px` | `1.20` | `500` | Títulos de cards e modais (sempre menores que títulos de seção) |
| `type.body.md` | `16px` (`1rem`) | `1.55` | `400` | Corpo padrão fora de cards (`15px` dentro de cards) |
| `type.ui.label` | `14px` (`0.875rem`) | `1.35` | `500` | Botões (`13px` dentro de cards), filtros e labels |
| `type.ui.meta` | `13px` (`0.8125rem`) | `1.40` | `400` | Metadados discretos e rótulos de ficha (piso mínimo; evitar badges decorativos) |

---

## 4. Espaçamento, Bordas, Sombras & Material 3 Expressive

* **Grid Base:** Múltiplos de `4px` (`4, 8, 12, 16, 24, 32, 48, 64`).
* **Escala de Formas (`radius` — alinhada ao M3 Expressive):**
  * `radius.xs`: `4px` (microelementos)
  * `radius.sm`: `8px` (inputs, divisões internas de *connected button groups*)
  * `radius.m3md`: `12px` (alvo de *shape morphing* em chips e toggles selecionados)
  * `radius.md`: `16px` (botões secundários, cards de seleção de plantas, miniaturas)
  * `radius.lg`: `24px` (containers de seção, modais)
  * `radius.xl`: `28px` (cards de lançamentos e cards flutuantes expressivos)
  * `radius.pill`: `9999px` (CTAs principais, chips em repouso, *floating toolbars*, barras de busca)
* **Física de Movimento (*M3 Expressive Springs*):**
  * **Spatial Spring Fast (`--ease-spring-fast`, `320ms`):** *shape morphing* em chips, botões conectados e toggle de favorito (leve *overshoot* tátil).
  * **Spatial Spring Default (`--ease-spring-default`, `420ms`):** entrada de *floating toolbars*, popovers e cards.
  * **Effects (`--ease-ui`, `160ms`):** mudanças de cor, borda e opacidade (sem *overshoot*, `damping: 1.0`).
  * Sempre respeitar `@media (prefers-reduced-motion: reduce)` desligando molas e reduzindo transições a cor/opacidade.
* **Padrões M3 Expressive adotados na Web (`apps/web-seo`):**
  * **Expressive Filter Chips:** `rounded-pill` em repouso → *morph* para `12px` quando `[aria-pressed="true"]`.
  * **Connected Button Groups:** `gap: 3px`, pontas externas `pill`, divisões internas `8px` → item ativo *morph* para `pill` com preenchimento tonal **Verde Musgo**.
  * **Expressive Toggle Icon Button (Favorito):** círculo (`pill`) → *squircle* (`14px`) em **Rosa Goiaba** quando salvo.
  * **Expressive Tonal Cards:** contêiner `28px` em **Branco Quente** (`#FFFDF9`), fotografia enquadrada internamente (`20px`) e rodapé de especificações em **Areia Suave** (`#F1E9D8`), sem bordas pesadas.
  * **Floating Toolbar:** barra flutuante `pill` no rodapé mobile com entrada vertical em mola.
* **Sombras Quentes (nunca cinza frio ou preto puro):**
  * `shadow.chip`: `0 2px 8px -2px rgba(30, 29, 27, 0.08)`
  * `shadow.card`: `0 8px 24px -6px rgba(30, 29, 27, 0.07)`
  * `shadow.cardHover`: `0 14px 32px -10px rgba(30, 29, 27, 0.11)`
  * `shadow.moss`: `0 10px 24px -8px rgba(46, 91, 70, 0.30)`
  * `shadow.floating`: `0 24px 56px -14px rgba(30, 29, 27, 0.14), 0 4px 12px -2px rgba(30, 29, 27, 0.05)`

---

## 5. Direção de Arte & Ilustração

* **Estilo:** Ilustrações editoriais com traço limpo e textura leve (*risograph*), retratando a vida urbana brasileira na escala humana — prédios residenciais com **cobogós**, varandas com samambaias, ruas arborizadas com ipês, ciclistas e cafés de esquina.
* **Regra de Cor nas Ilustrações:** Usar exclusivamente a paleta **Ipê & Grafite** (`#EEB506`, `#2E5B46`, `#ED7467`, `#F8F5EA`, `#1E1D1B`).
* **O que evitar:** Fotos frias de banco de imagem com corretores de terno, prédios espelhados corporativos ou ícones clichês de telhado/chave.

---

## 6. Tom de Voz & Microcopy

A **Terraço** fala como um amigo organizado que conhece bem a cidade: direto, transparente e acolhedor.

| Contexto | Evitar (Tradicional/Frio) | Usar (**Terraço Warm Tech**) |
| :--- | :--- | :--- |
| **Hero / Chamada** | *Encontre seu imóvel ideal.* | *Seu próximo canto, sem burocracia.* |
| **Botão de Busca** | *Pesquisar Propriedades* | *Explorar imóveis* |
| **Card de Imóvel** | *Unidade disponível para locação* | *Sem fiador · Sol da manhã* |
| **Boas-vindas** | *Cadastro efetuado com sucesso.* | *Entra, a casa é sua.* |
| **Agendamento** | *Solicitação de visita enviada.* | *Visita marcada! Só chegar.* |

---

## 7. Arquivos de Tokens
* [tokens.json](./tokens.json) — Formato W3C Design Tokens (Figma / Style Dictionary).
* [tokens.css](./tokens.css) — Variáveis CSS prontas para uso em web apps.
