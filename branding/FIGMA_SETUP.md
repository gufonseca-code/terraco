# FIGMA_SETUP.md — Design System Terraço

> Base: `branding/DESIGN.md` + `branding/tokens.json` + `branding/tokens.css`  
> Este guia te leva do zero a um design system funcional no Figma, estilo por estilo, componente por componente.

---

## 0. Antes de começar

Crie um novo arquivo no Figma (ex.: `Terraço — Design System`).  
Recomendo criar uma página chamada `00-Settings` com os tokens brutos (cores, tipografia, espaçamento, raio, sombra) e uma página `01-Styles` com os estilos publicados, além de `02-Components` para os componentes.

---

## 1. Cores (Fill Styles)

No Figma, crie um **Local Style > Fill** para cada token abaixo. Nomeie com o caminho `/` para aparecer agrupado no painel de estilos.

| Nome no Figma | Hex | Uso |
| :--- | :--- | :--- |
| `Color/Background/Canvas` | `#F8F5EA` | Fundo principal de páginas e app |
| `Color/Background/Surface` | `#F1E9D8` | Cards secundários, inputs, barras |
| `Color/Background/Elevated` | `#FFFDF9` | Cards elevados, modais |
| `Color/Text/Primary` | `#1E1D1B` | Textos principais, wordmark |
| `Color/Text/Secondary` | `#57534E` | Subtítulos, metadados, legendas |
| `Color/Brand/Primary` | `#2E5B46` | CTAs principais, headers escuros, links ativos |
| `Color/Brand/Primary/Hover` | `#234736` | Hover/pressed de botões principais |
| `Color/Brand/Accent` | `#EEB506` | Ícone do app, destaques, grafismos |
| `Color/Brand/Highlight` | `#ED7467` | Favoritos e microinterações táteis (ícone `#1E1D1B` para contraste AA) |
| `Color/Border/Subtle` | `#E4DCCB` | Divisórias, contornos de cards (1px) |
| `Color/Border/Strong` | `#CFC5B2` | Contornos destacados e estados hover |
| `Color/Semantic/Success/Text` | `#2E5B46` | Sucesso — texto e borda |
| `Color/Semantic/Success/Bg` | `#E4F0EA` | Sucesso — fundo suave |
| `Color/Semantic/Attention/Text` | `#8A6500` | Atenção — texto |
| `Color/Semantic/Attention/Bg` | `#FEF3C7` | Atenção — fundo suave |
| `Color/Semantic/Error/Text` | `#B9382E` | Erro — texto e borda |
| `Color/Semantic/Error/Bg` | `#FDE8E6` | Erro — fundo suave |

**Dica:** no painel de estilos, use `/` para criar pastas automáticas (ex.: `Color/Background/Canvas` aparece sob `Color > Background > Canvas`).

---

## 2. Tipografia (Text Styles)

Crie um **Local Style > Text** para cada estilo. Fontes:  
*Display:* `Fraunces` (no Google Fonts, configure `font-variation-settings: "SOFT" 100, "WONK" 1`; sempre reto, sem itálico, pesos `400` ou `500`).  
*Sans:* `Plus Jakarta Sans` (pesos `400` no corpo e `500` em ações/labels).

| Nome no Figma | Família | Peso | Tamanho | Line-height | Uso |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Text/Display/XL` | Fraunces | 500 | 48px | 1.06 | Hero principal desktop |
| `Text/Display/LG` | Fraunces | 500 | 36px | 1.12 | Títulos de seção |
| `Text/Heading/MD` | Fraunces | 500 | 24px | 1.20 | Títulos de cards em destaque / modais |
| `Text/Body/MD` | Plus Jakarta Sans | 400 | 16px | 1.55 | Corpo padrão (`15px` dentro de cards) |
| `Text/UI/Label` | Plus Jakarta Sans | 500 | 14px | 1.35 | Botões (`13px` em cards), filtros, labels |
| `Text/UI/Meta` | Plus Jakarta Sans | 400 | 13px | 1.40 | Metadados discretos e rótulos de ficha |

**Dica de preços:** para valores (`R$`) e tabelas comparativas, ative `font-variant-numeric: tabular-nums` (no Figma, painel de tipo > figura tabular).

---

## 3. Espaçamento (Layout Grid / Spacing)

O grid base é múltiplo de `4px`: `4, 8, 12, 16, 24, 32, 48, 64`.

No Figma, não existe "estilo de espaçamento" nativo. Duas opções:

1. **Documentação visual:** crie um quadro em `00-Settings` com retângulos de `4×4`, `8×8`, `16×16`, etc., rotulados com o token (`--space-xs`, `--space-sm`, …).
2. **Grid de layout:** defina um Layout Grid de 8px (ou 4px) nos quadros principais para guiar o alinhamento.

---

## 4. Bordas arredondadas (Corner Radius)

Não há estilo nativo de raio no Figma. Documente em `00-Settings` e aplique manualmente nos componentes:

| Token | Valor | Uso |
| :--- | :--- | :--- |
| `Radius/SM` | `8px` | Inputs, tags pequenas |
| `Radius/MD` | `16px` | Botões secundários, miniaturas |
| `Radius/LG` | `24px` | Cards de imóveis, modais |
| `Radius/Pill` | `9999px` (ou o máximo que o Figma permitir) | Botões CTA principais, badges, barras de busca |

---

## 5. Sombras (Effect Styles)

Crie um **Local Style > Effect** (Drop Shadow) para cada sombra. Nunca use cinza frio ou preto puro.

| Nome no Figma | X | Y | Blur | Espalhamento | Cor | Opacidade |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Shadow/Card` | 0 | 8 | 24 | -6 | `#1E1D1B` | 8% |
| `Shadow/Floating` | 0 | 16 | 40 | -8 | `#1E1D1B` | 12% |

No Figma, insira a cor `#1E1D1B` e ajuste a opacidade no seletor de cor do efeito.

---

## 6. Componentes (Componentes Principais)

Crie em `02-Components` como **Main Components** e publique no time (se for um arquivo de library).

### 6.1 Botão Primário (CTA)
* Preenchimento: `Color/Brand/Primary` (`#2E5B46`).
* Texto: `Text/UI/Label`, `Color/Text/Inverse` (`#F8F5EA`).
* Raio: `Radius/Pill` (`9999px`).
* Hover: troque preenchimento para `Color/Brand/Primary/Hover` (`#234736`).
* Padding: `12px 24px` (ajuste ao conteúdo).

### 6.2 Botão Secundário
* Preenchimento: `Color/Background/Surface` ou `Color/Background/Elevated`.
* Borda: `1px` `Color/Border/Subtle`.
* Texto: `Text/UI/Label`, `Color/Text/Primary`.
* Raio: `Radius/Pill` (`9999px`).

### 6.3 Card de Imóvel
* Preenchimento: `Color/Background/Elevated` (`#FFFDF9`).
* Borda: `1px` `Color/Border/Subtle`.
* Raio: `Radius/XL` (`28px`).
* Sombra: `Shadow/Card`.
* Conteúdo: imagem de capa enquadrada (`20px`), metadado de bairro (`Text/UI/Meta`), título `Text/Heading/MD`, CTA `Radius/Pill` e rodapé tonal (`Color/Background/Surface`) com specs (`tabular-nums`), sem badges decorativos.

### 6.4 Botão de Favorito (Toggle)
* Repouso: `Color/Background/Elevated` com borda `1px` `Color/Border/Subtle`, ícone `Color/Text/Primary`, raio `Radius/Pill`.
* Salvo: `Color/Brand/Highlight` (`#ED7467`), ícone preenchido `Color/Text/Primary` (`#1E1D1B`, contraste AA > 6:1), raio `14px` (*squircle*).

### 6.5 Input
* Fundo: `Color/Background/Surface`.
* Borda: `1px` `Color/Border/Subtle`.
* Raio: `Radius/SM` (`8px`).
* Texto: `Text/Body/MD`, `Color/Text/Primary`.
* Padding: `12px 16px`.

### 6.6 Barra de Busca
* Preenchimento: `Color/Background/Elevated` ou `Color/Brand/Accent` se quiser destaque forte.
* Raio: `Radius/Pill`.
* Sombra opcional: `Shadow/Card`.
* Ícone de lupa: `Color/Text/Secondary`.

---

## 7. Importar tokens automaticamente (Tokens Studio)

Se quiser evitar criar estilo por estilo manualmente, use o plugin **Tokens Studio for Figma** (anteriormente Figma Tokens):

1. Instale o plugin "Tokens Studio" no Figma.
2. No plugin, escolha **Import > JSON** e carregue `branding/tokens.json`.
3. Mapeie os tokens para estilos locais do Figma (cores → Fill Styles, tipografia → Text Styles, sombras → Effect Styles).
4. Publique os estilos como library para usar em outros arquivos.

O arquivo `tokens.json` está no formato W3C Design Tokens e é compatível com o Tokens Studio e com Style Dictionary.

---

## 8. Regras de uso (resumo de DESIGN.md)

* **Área de respiro mínima:** `1×` a altura da barra superior do símbolo Degraus ao redor do lockup.
* **Tamanho mínimo:** `24px` de altura para o lockup completo na web; `16px` para o símbolo isolado (favicon).
* **Proibido:** gradientes 3D, distorcer proporções dos degraus, azul corporativo como fundo principal.
* **Não usar:** fotos frias de banco de imagem com corretores de terno, prédios espelhados corporativos, ícones clichês de telhado/chave.
* **Ilustrações:** traço editorial risograph, vida urbana brasileira (cobogós, varandas com samambaias, ruas com ipês), exclusivamente com a paleta Ipê & Grafite.

---

## 9. Checklist de conclusão

- [ ] Página `00-Settings` criada com cores, tipografia, espaçamento, raios e sombras documentados
- [ ] 18 Fill Styles de cor criados em `01-Styles`
- [ ] 7 Text Styles criados em `01-Styles`
- [ ] 2 Effect Styles de sombra criados em `01-Styles`
- [ ] Tokens importados via Tokens Studio (opcional, usando `branding/tokens.json`)
- [ ] Componentes principais criados: botão primário, secundário, card de imóvel, badge, input, barra de busca
- [ ] Library publicada no time Figma (se aplicável)
