# Category: Data Display

Category ID: `data-display`  
Lifecycle: `stable`  
Decision reference: `CAT-2026-07-31-data-display`  
Allowed traits: `identity`, `nutrition-context`  
Current consumers: `ui-table`, `molecule-data-table`, `atom-avatar`, `molecule-patient-badge-header`, `molecule-metric-box`, `organism-food-table-section`, `organism-patient-list-table`, `organism-patient-consultation-history-table`

Normative foundations: [color](../../04-color-system.md), [typography](../../05-typography-system.md), [geometry](../../06-geometry-and-desktop-layout.md), [motion and layers](../../07-icons-motion-and-layers.md), [states and accessibility](../../08-states-and-accessibility.md).

## Purpose

Apresentar dados comparáveis, identidades e metadados com hierarquia, alinhamento e leitura inequívocos, sem sugerir edição.

## Includes

Tabelas, células, métricas genéricas, avatar e cabeçalho de identidade. Dados nutricionais especializados pertencem a `nutrition-domain` e herdam fundamentos de dados.

## Excludes

Inputs pertencem a `fields`; escolhas a `selection`; badges de status a `feedback`; cards/containers a `surfaces`.

## Relationship map

É normalmente composta dentro de `surfaces` e `structure`. `identity` adiciona avatar/fallback. `nutrition-context` adiciona unidades, mas semântica de macros exige categoria `nutrition-domain` ou trait permitido nela.

## Base anatomy

Tabela: caption acessível, header, body, rows e cells. Métrica: label, value e unit opcional. Identidade: visual/fallback, nome e metadado opcional. Proibidos: header vazio, número sem unidade quando ambíguo e avatar sem fallback.

## Geometry

Table header mínimo 40; row mínimo 44; cells usam padding inline `space-related` e block `space-inline`. Números alinham à direita e na baseline por padrão; tabelas compactas de seleção podem centralizar valores numéricos curtos quando isso melhora a leitura comparativa. Texto fica à esquerda. Avatar usa 32, 36 ou 44 e `radius-round`. Table border/divider 1px. Conteúdo pode rolar horizontalmente somente dentro de ScrollArea nomeada.

## Typography

Header `table-header`; cell `table-cell`; ênfase `table-cell-strong`; número `table-number`; metadado `metadata`; ID técnico `data-id`; métricas `metric-standard`/`metric-compact`; unidade `metric-unit`; identidade principal `body-strong`.

## Tokens by part

| Part | Property | Token |
| --- | --- | --- |
| header | background/text | `surface-subtle` / `text-secondary` |
| row | background/border | `surface` / `border-divider` |
| row hover | background | `surface-hover` |
| primary value | text | `text-primary` |
| metadata | text | `text-muted` |
| avatar | background/text/border | `primary-soft` / `primary` / `primary-border` |
| empty | background/text | `surface-subtle` / `text-secondary` |

## Allowed variants

Tabela `standard` ou `compact`; row `static` ou `interactive`; métrica `compact`, `standard`, `large` ou `hero` conforme hierarquia já definida; avatar 32/36/44. Zebra striping não é variante permitida.

## State matrix

| State | Background | Text | Border | Icon | Cursor | Motion | Semantic announcement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| default | `surface` | `text-primary` | `border-divider` | `text-muted` | default | none | headers e valor |
| hover | N/A estático; row interativa `surface-hover` | preservado | preservado | preservado | pointer | color 120ms | none |
| pressed | N/A estático; row interativa `surface-subtle` | preservado | preservado | preservado | pointer | color 120ms | none |
| focus-visible | N/A estático; row interativa recebe ring | preservado | 1px + ring | preservado | pointer | none | nome da ação |
| selected | `primary-soft` quando tabela selecionável | `text-primary` | `primary-border` | `primary` | default | none | selected |
| disabled | N/A dados não são disabled; ações internas tratam estado | N/A | N/A | N/A | N/A | N/A | N/A |
| loading | estrutura/skeleton | `text-muted` | preservado | spinner opcional | wait | recipe de loading | tabela/região busy |
| error | `error-soft` | `text-primary` | `error-border` | `error` | default | none | mensagem de erro |
| empty | `surface-subtle` | `text-secondary` | `border-subtle` | `text-muted` | default | none | título e orientação de empty |
| read-only | estado natural | preservado | preservado | preservado | default | none | none |

## Interaction and keyboard

Dados estáticos não recebem foco. Sort headers são buttons com nome/direção; row interativa usa link/button único e teclado correspondente. Seleção de rows segue `selection`; ações em cells permanecem focáveis separadamente.

## Accessibility

Use table semântica, caption, `scope` e sort state. Avatar decorativo quando nome adjacente; imagem informativa tem alt. Valores não dependem de cor, unidades são pronunciáveis, foco 2px/offset 2 e contraste AA.

## Composition

Tabela pode conter badges, actions e valores, cada qual sob sua categoria. Não colocar cards dentro de cells. Cabeçalho de identidade combina avatar e textos com `space-related`.

## Content and overflow

Números usam dígitos tabulares, locale pt-BR e alinhamento à direita por padrão; tabelas compactas de seleção podem declarar centralização contextual. Células textuais podem truncar com título/expansão; dados críticos quebram. Empty ocupa todas as colunas. IDs podem usar ellipsis com cópia acessível.

## Forbidden decisions

Centralizar números comparáveis fora de tabelas compactas de seleção ou sem justificativa contextual; remover headers visuais sem alternativa; zebra; usar cor como único significado; altura de row abaixo de 44; border acima de 1px; font size local; transformar dado read-only em input disabled.

## Current examples

`ui-table` fornece a família compound; `atom-avatar` aplica identidade/fallback; `molecule-patient-badge-header` combina identidade e contexto do paciente.

## Category acceptance

Passa quando significado, header, unidade, alinhamento, densidade, empty/loading/error e leitura assistiva são definidos para cada dado.

## Change history

- `CAT-2026-07-31-data-display`: categoria estabilizada para tabelas, métricas genéricas e identidade.
