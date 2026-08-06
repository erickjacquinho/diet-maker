# Category: Fields

Category ID: `fields`  
Lifecycle: `stable`  
Decision reference: `CAT-2026-07-31-fields`  
Allowed traits: `async`, `nutrition-context`, `read-only`  
Current consumers: `ui-input`, `atom-input`, `atom-field-trigger`, `molecule-taco-search-input`, `ui-textarea`, `molecule-form-field`

Normative foundations: [color](../../04-color-system.md), [typography](../../05-typography-system.md), [geometry](../../06-geometry-and-desktop-layout.md), [motion and layers](../../07-icons-motion-and-layers.md), [states and accessibility](../../08-states-and-accessibility.md).

## Purpose

Capturar, editar ou consultar texto, número e busca com label, ajuda, validação e valor inequívocos.

## Includes

Input textual/numérico/search, textarea e composição FormField. Todo campo possui label programaticamente associado, inclusive quando o layout o oculta visualmente.

## Excludes

Escolhas em lista pertencem a `selection`; comandos pertencem a `actions`; valores puramente exibidos pertencem a `data-display`.

## Relationship map

Usa `feedback` para validação, `loading` em busca assíncrona e `nutrition-domain` por trait para unidades e regras de conteúdo. `read-only` preserva legibilidade e não equivale a disabled.

## Base anatomy

Obrigatórios: label, control e área reservada para helper/validation. Opcionais: leading icon, unidade fixa, trailing action e descrição. Proibidos: label somente em placeholder, múltiplas trailing actions e feedback sem associação.

## Geometry

Input possui altura `control-standard` (36); compacto (32) apenas em tabela ou toolbar. Padding horizontal `control-inline`; gap label-control `space-inline`. Textarea tem mínimo `textarea-min-height` (80), resize vertical e padding `space-related`. Radius `radius-control`, borda 1px. Field group usa `space-related` entre label/control/feedback e `space-component` entre campos.

## Typography

Label `field-label`; valor `field-value`; placeholder `field-placeholder`; ajuda `helper`; erro `validation-error`; sucesso explícito `validation-success`; unidade embutida `metric-unit`.

## Tokens by part

| Part | Property | Token |
| --- | --- | --- |
| control | background/text/border | `surface` / `text-primary` / `border-control-essential` |
| placeholder | text | `text-muted` |
| label | text | `text-secondary` |
| helper | text | `text-muted` |
| invalid | border/text | `error` / `error` |
| success | border/text | `success` / `success` |
| read-only | background/text | `surface-subtle` / `text-primary` |
| disabled | background/text/border | `disabled-soft` / `disabled` / `border-subtle` |
| focus | ring/offset | `primary-focus` / `focus-ring-offset` |

## Allowed variants

`text`, `number`, `search`, `password` e `textarea`; density `standard` ou `compact` sob as restrições de geometria; estados `read-only` e `invalid`. Unidade pode ser prefixo/sufixo fixo e não editável. Search pode ter uma única ação de limpar.

## State matrix

| State | Background | Text | Border | Icon | Cursor | Motion | Semantic announcement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| default | `surface` | `text-primary`/`text-muted` | `border-control-essential` | `text-muted` | text | none | label e valor |
| hover | `surface` | preservado | `border-hover` | preservado | text | border-color 120ms | none |
| pressed | N/A — campo usa focus, não pressed | N/A | N/A | N/A | N/A | N/A | N/A |
| focus-visible | `surface` | `text-primary` | 1px + ring | `text-secondary` | text | none | label e instrução |
| selected | N/A — seleção de texto é nativa, não variante | N/A | N/A | N/A | N/A | N/A | N/A |
| disabled | `disabled-soft` | `disabled` | `border-subtle` | `disabled` | not-allowed | none | disabled nativo |
| loading | `surface` | valor preservado | `border-control-essential` | spinner | wait | spinner linear | `aria-busy=true` |
| error | `surface` | `text-primary` | `error` | `error` | text | none | mensagem ligada por `aria-describedby` |
| empty | `surface` | `text-muted` placeholder | `border-control-essential` | `text-muted` | text | none | label e placeholder |
| read-only | `surface-subtle` | `text-primary` | `border-subtle` | `text-muted` | default | none | `readonly` e valor |

## Interaction and keyboard

Edição segue controles HTML. Tab entra no control e depois em trailing action. Esc limpa apenas em search quando documentado; Enter envia somente quando o form declarar submit. Setas e seleção textual mantêm comportamento nativo.

## Accessibility

Label por `for`/`id`; helper e erro por `aria-describedby`; invalid por `aria-invalid`; required sem depender de cor. Campos numéricos declaram unidade fora do valor. Target 32+, foco 2px/offset 2 e contraste WCAG 2.2 AA.

## Composition

FormField possui label, control e mensagem. Leading/trailing adornments não recebem foco salvo ação real. Grid de campos é responsabilidade de `structure`; campo não define margem externa.

## Content and overflow

Valor de input é uma linha; textarea quebra palavras e expande verticalmente. Label pode quebrar em duas linhas. Mensagens não truncam. Números usam locale pt-BR na apresentação, mas valor submetido permanece canônico.

## Forbidden decisions

Placeholder como label; esconder erro; disabled para leitura; height fora de 32/36; textarea menor que 80; border acima de 1px; radius pill; cor/size local; validação apenas por cor; ação decorativa focável.

## Current examples

`ui-input` é o primitivo; `atom-input` aplica receita; `molecule-taco-search-input` combina busca assíncrona e domínio; `ui-textarea` e `molecule-form-field` são propostas registradas.

## Category acceptance

Passa quando label, tipo, unidade, densidade, feedback, read-only/disabled e comportamento de teclado são resolvidos sem decisão local e a mensagem de erro é anunciada.

## Change history

- `CAT-2026-07-31-fields`: categoria estabilizada para texto, número, search e textarea.
