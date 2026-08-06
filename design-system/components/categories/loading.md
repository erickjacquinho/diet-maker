# Category: Loading

Category ID: `loading`  
Lifecycle: `stable`  
Decision reference: `CAT-2026-07-31-loading`  
Allowed traits: `async`, `nutrition-macro`  
Current consumers: `atom-progress-bar`, `atom-spinner`, `atom-skeleton`, `ui-spinner`

Normative foundations: [color](../../04-color-system.md), [typography](../../05-typography-system.md), [geometry](../../06-geometry-and-desktop-layout.md), [motion and layers](../../07-icons-motion-and-layers.md), [states and accessibility](../../08-states-and-accessibility.md).

## Purpose

Representar espera ou progresso sem deslocar layout, bloquear compreensão ou confundir carregamento com resultado.

## Includes

Progress determinado, spinner indeterminado e skeleton estrutural. Loading embutido em outro componente herda esta receita, mantendo a categoria principal do host.

## Excludes

Sucesso/erro pertencem a `feedback`; estado empty não é loading; placeholders de campo pertencem a `fields`; gráficos nutricionais não são progress sem operação em curso.

## Relationship map

Trait `async` convoca a receita adequada. `nutrition-macro` colore progress apenas quando o preenchimento representa a quantidade daquele macro, nunca uma espera genérica.

## Base anatomy

Progress: track + indicator + label/value acessível. Spinner: glyph + label acessível. Skeleton: blocos que espelham a anatomia final. Proibidos: spinner e skeleton simultâneos para a mesma região, progresso sem contexto e skeleton que inventa conteúdo.

## Geometry

Progress track tem altura 6, radius `radius-compact`; indicator ocupa largura proporcional. Spinner usa icon-16 em control e icon-20 em região. Skeleton conserva dimensões do conteúdo e radius equivalente à parte simulada, nunca round salvo avatar.

## Typography

Label `helper`; percentual `metric-compact`; status regional `body-small`; texto skeleton não renderiza caracteres. Button loading mantém style do label original invisível visualmente para conservar largura.

## Tokens by part

| Part | Property | Token |
| --- | --- | --- |
| track | background | `surface-subtle` |
| generic indicator | background | `primary` |
| macro indicator | background | `macro-*` |
| spinner | color | `primary` ou `currentColor` no host |
| skeleton base | background | `surface-subtle` |
| skeleton highlight | background | `surface-hover` |
| label | text | `text-secondary` |

## Allowed variants

`determinate` usa progress; `indeterminate-inline` usa spinner; `indeterminate-structural` usa skeleton. Macro progress aceita protein/carbohydrate/fat. Tamanho de spinner 16/20; skeleton é composto por partes nomeadas no perfil consumidor.

## State matrix

| State | Background | Text | Border | Icon | Cursor | Motion | Semantic announcement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| default | track/skeleton token | `text-secondary` | none | `primary` | wait/default | progress 240ms/spinner linear | label operacional |
| hover | N/A — indicador não é interativo | N/A | N/A | N/A | N/A | N/A | N/A |
| pressed | N/A — indicador não é interativo | N/A | N/A | N/A | N/A | N/A | N/A |
| focus-visible | N/A — indicador não recebe foco | N/A | N/A | N/A | N/A | N/A | N/A |
| selected | N/A — loading não representa seleção | N/A | N/A | N/A | N/A | N/A | N/A |
| disabled | N/A no indicador; host decide disabled | N/A | N/A | N/A | N/A | N/A | N/A |
| loading | tokens da variante | label opcional | none | spinner quando indeterminado | wait | recipe permitida | `aria-busy` ou progress value |
| error | N/A — transiciona para `feedback` | N/A | N/A | N/A | N/A | N/A | N/A |
| empty | N/A — transiciona para empty do host | N/A | N/A | N/A | N/A | N/A | N/A |
| read-only | N/A — operação não é modo editável | N/A | N/A | N/A | N/A | N/A | N/A |

## Interaction and keyboard

Indicadores não recebem pointer nem teclado. Ação de cancelar é um componente `actions` separado. Host bloqueia repetição quando necessário e preserva foco no controle que iniciou a operação.

## Accessibility

Região assíncrona usa `aria-busy`; progress determinado usa `progressbar` com min/max/now; indeterminado possui label acessível sem anúncio repetitivo. Reduced motion remove shimmer e mantém spinner não perturbador/representação estática.

## Composition

Use um indicador dominante por região. Spinner inline ocupa o slot de ícone; skeleton substitui conteúdo, não envolve conteúdo real. Progress pode acompanhar label/value em stack `space-inline`.

## Content and overflow

Labels descrevem operação (“Carregando alimentos”), não apenas “Aguarde”. Percentual é inteiro localizado. Skeleton não exibe texto; dimensões devem evitar layout shift.

## Forbidden decisions

Spinner de página inteira para conteúdo estruturado; shimmer agressivo; cores de macro em loading genérico; animação bounce/scale; duração local; indicador focável; skeleton e spinner concorrentes; progresso falso.

## Current examples

`atom-progress-bar` é atual; `atom-spinner` e `atom-skeleton` são propostas formalizadas para eliminar implementações locais.

## Category acceptance

Passa quando tipo de espera, região, dimensões, anúncio, reduced motion, transição para data/empty/error e prevenção de layout shift estão determinados.

## Change history

- `CAT-2026-07-31-loading`: categoria estabilizada com progress 6, spinner 16/20 e skeleton estrutural.
