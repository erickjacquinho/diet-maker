# Category: Surfaces

Category ID: `surfaces`  
Lifecycle: `stable`  
Decision reference: `CAT-2026-07-31-surfaces`  
Allowed traits: `interactive-surface`  
Current consumers: `ui-card`, `ui-scroll-area`, `ui-separator`

Normative foundations: [color](../../04-color-system.md), [typography](../../05-typography-system.md), [geometry](../../06-geometry-and-desktop-layout.md), [motion and layers](../../07-icons-motion-and-layers.md), [states and accessibility](../../08-states-and-accessibility.md).

## Purpose

Agrupar conteúdo relacionado e separar regiões por proximidade, tom e borda discreta sem criar hierarquia artificial.

## Includes

Cards, containers locais, áreas roláveis e divisores. Uma superfície representa agrupamento visual, não estrutura global de página.

## Excludes

Shells e grids pertencem a `structure`; overlays flutuantes a `overlays`; linhas de dados a `data-display`; cards nutricionais mantêm `nutrition-domain` como categoria principal.

## Relationship map

Recebe conteúdo de qualquer categoria. `interactive-surface` adiciona foco/hover sem permitir ação interativa aninhada concorrente. ScrollArea e Separator são partes de apoio, não novas categorias.

## Base anatomy

Card: root e content obrigatórios; header/footer opcionais. ScrollArea: viewport e scrollbar. Separator: linha sem conteúdo. Proibidos: card dentro de card sem mudança semântica, header vazio e superfície usada apenas para sombra.

## Geometry

Card padrão usa padding `surface-standard` (16), destaque `surface-highlight` (20), compacto `surface-compact` (12); radius `radius-surface`; borda 1px. Gap interno `space-component`, header/content `space-related`. Cards de página não têm sombra. Scrollbar não altera largura do conteúdo. Separator mede 1px.

## Typography

Título `card-title`; descrição `body-secondary`; corpo `body`; metadado `metadata`; footer herda estilos de seus componentes. Separator não contém texto.

## Tokens by part

| Part | Property | Token |
| --- | --- | --- |
| root | background/border | `surface` / `border-subtle` |
| subtle surface | background/border | `surface-subtle` / `border-divider` |
| interactive hover | background/border | `surface-hover` / `border-hover` |
| title | text | `text-primary` |
| description | text | `text-secondary` |
| separator | color | `border-divider` |
| scrollbar | thumb/track | `border-hover` / `transparent` |
| focus | ring/offset | `primary-focus` / `focus-ring-offset` |

## Allowed variants

Card `standard`, `compact`, `highlight`; surface `default` ou `subtle`; separator horizontal/vertical; ScrollArea vertical ou bidirecional quando o conteúdo exigir. `interactive-surface` somente quando toda a superfície possui uma ação primária.

## State matrix

| State | Background | Text | Border | Icon | Cursor | Motion | Semantic announcement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| default | `surface` | por conteúdo | `border-subtle` | por conteúdo | default | none | grupo quando nomeado |
| hover | N/A estática; interativa usa `surface-hover` | preservado | `border-hover` | preservado | pointer se interativa | color 120ms | none |
| pressed | N/A estática; interativa usa `surface-subtle` | preservado | preservado | preservado | pointer | color 120ms | none |
| focus-visible | N/A estática; interativa recebe ring | preservado | 1px + ring | preservado | pointer | none | nome da ação |
| selected | N/A base; seleção pertence a `selection` | N/A | N/A | N/A | N/A | N/A | N/A |
| disabled | N/A superfície estática; interativa usa tokens disabled | `disabled` | `border-subtle` | `disabled` | not-allowed | none | indisponível |
| loading | estrutura preservada | preservado/skeleton | preservado | spinner opcional | wait | recipe de loading | `aria-busy=true` no region |
| error | `error-soft` somente em surface de mensagem | `text-primary` | `error-border` | `error` | default | none | alert quando aplicável |
| empty | `surface-subtle` | `text-secondary` | `border-subtle` | `text-muted` | default | none | empty title/message |
| read-only | estado natural da superfície estática | preservado | preservado | preservado | default | none | none |

## Interaction and keyboard

Superfície estática não entra no Tab. Interativa usa link/button estendido semanticamente e Enter/Space conforme o elemento; ações internas independentes proíbem clique no root. Scroll segue teclado/plataforma sem sequestrar setas.

## Accessibility

Use section/article apenas com semântica real e nome quando necessário. Separator decorativo usa role none; semântico usa separator. ScrollArea preserva foco visível e zoom 200%. Contraste de borda não substitui contraste de texto.

## Composition

Header agrupa título/descrição/ações; content possui o conteúdo principal; footer contém ações ou resumo. Ações têm sua própria categoria. Superfície não controla margem externa.

## Content and overflow

Títulos quebram até duas linhas; descrições não truncam informação crítica. Conteúdo largo usa ScrollArea apenas se não puder reflow. Empty usa `empty-title` e `body-secondary`.

## Forbidden decisions

Shadow em card/página; radius maior que `radius-surface`; border acima de 1px; card para cada bloco sem agrupamento; card interativo com button aninhado; padding local; separator como decoração excessiva.

## Current examples

`ui-card` expõe partes compostas; `ui-scroll-area` contém overflow; `ui-separator` divide grupos sem aumentar contraste.

## Category acceptance

Passa quando agrupamento, padding, radius, borda, overflow e interatividade podem ser escolhidos por variante/trait sem escala local ou nesting ambíguo.

## Change history

- `CAT-2026-07-31-surfaces`: superfícies flat estabilizadas com radius 8 e borda discreta de 1px.
