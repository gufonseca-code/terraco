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
| `color.brand.highlight` | `#ED7467` | **Rosa Goiaba** — Badges (*"Novo"*, *"Sem fiador"*), favoritos e alertas gentis | 10% |
| `color.border.subtle` | `#E4DCCB` | **Borda Areia** — Divisórias e contornos de cards (`1px`) | — |
| `color.border.strong` | `#CFC5B2` | **Borda Areia Forte** — Contornos destacados e estados hover | — |

### Estados Semânticos
* **Sucesso / Disponível:** `#2E5B46` (texto/borda) sobre `#E4F0EA` (fundo suave)
* **Atenção / Destaque:** `#8A6500` (texto) sobre `#FEF3C7` (fundo suave)
* **Erro / Indisponível:** `#B9382E` (texto) sobre `#FDE8E6` (fundo suave)

---

## 3. Tipografia

O contraste entre uma **serifa orgânica** nos títulos e uma **sans-serif geométrica amigável** nos dados garante carisma sem sacrificar a legibilidade de preços, metragens e endereços.

* **Display & Headlines (`font.family.display`):** `'Recoleta', 'Fraunces', Georgia, serif`
  * *Uso:* Wordmark, títulos de seção, hero banners e mensagens de boas-vindas.
  * *Dica:* Se usar **Fraunces** (Google Fonts / gratuita), configure `font-variation-settings: "SOFT" 100, "WONK" 1`.
* **UI, Preços & Corpo (`font.family.sans`):** `'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif`
  * *Uso:* Navegação, filtros, cards de imóveis, valores (`R$`), formulários e botões.
  * *Dica:* Para preços e tabelas comparativas, ative `font-variant-numeric: tabular-nums`.

### Escala Tipográfica
| Token | Tamanho | Line-Height | Peso | Uso |
| :--- | :--- | :--- | :--- | :--- |
| `type.display.xl` | `48px` (`3rem`) | `1.10` | `700` | Hero principal desktop |
| `type.display.lg` | `36px` (`2.25rem`) | `1.15` | `700` | Títulos de seção |
| `type.heading.md` | `24px` (`1.5rem`) | `1.25` | `600` | Títulos de cards em destaque / modais |
| `type.body.lg` | `18px` (`1.125rem`) | `1.55` | `400` | Subtítulos e textos de apoio |
| `type.body.md` | `16px` (`1rem`) | `1.50` | `400` | Corpo padrão e descrições de imóveis |
| `type.ui.label` | `14px` (`0.875rem`) | `1.35` | `600` | Botões, filtros e labels |
| `type.ui.badge` | `12px` (`0.75rem`) | `1.20` | `600` | Tags (*"Sol da manhã"*, *"Aceita pet"*) |

---

## 4. Espaçamento, Bordas & Sombras

* **Grid Base:** Múltiplos de `4px` (`4, 8, 12, 16, 24, 32, 48, 64`).
* **Cantos Arredondados (`radius`):**
  * `radius.sm`: `8px` (inputs, tags pequenas)
  * `radius.md`: `16px` (botões secundários, miniaturas)
  * `radius.lg`: `24px` (cards de imóveis, modais)
  * `radius.pill`: `9999px` (botões CTA principais, badges, barras de busca)
* **Sombras Quentes (nunca cinza frio ou preto puro):**
  * `shadow.card`: `0 8px 24px -6px rgba(30, 29, 27, 0.08)`
  * `shadow.floating`: `0 16px 40px -8px rgba(30, 29, 27, 0.12)`

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
