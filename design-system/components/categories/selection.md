# Category: Selection

Category ID: `selection`  
Lifecycle: `stable`  
Decision reference: `CAT-2026-07-31-selection`  
Allowed traits: `async`, `nutrition-context`  
Current consumers: `ui-select`, `ui-tabs`, `organism-diet-mode-switcher`

Normative foundations: [color](../../04-color-system.md), [typography](../../05-typography-system.md), [geometry](../../06-geometry-and-desktop-layout.md), [motion and layers](../../07-icons-motion-and-layers.md), [states and accessibility](../../08-states-and-accessibility.md).

## Purpose

Permitir escolher exatamente uma ou várias opções de um conjunto conhecido e tornar a seleção persistente visual e semanticamente.

## Includes

Select, tabs, radio/checkbox futuros e opções segmentadas. A opção altera estado, modo ou valor; não executa operação independente.

## Excludes

Comandos pertencem a `actions`; rotas globais a `navigation`; entrada livre a `fields`; itens de menu que executam comandos a `overlays`.

## Relationship map

Select usa popup de `overlays`; tabs podem controlar painéis de `surfaces`; `nutrition-context` adiciona copy/unidades sem mudar seleção. Cada componente possui uma categoria principal.

## Base anatomy

Obrigatórios: group/trigger, opções, indicador selecionado e nome do conjunto. Opcionais: label, descrição, ícone e painel associado. Proibidos: opção sem label, seleção somente por cor e ação aninhada.

## Geometry

Triggers e tabs têm altura 32 ou 36; padding horizontal `control-inline`; gap `space-inline`; radius `radius-control`; borda 1px quando contida. Grupos usam `space-control-group`. Indicador de tab tem 1px ou background `primary-soft`, nunca muda a altura.

## Typography

Trigger/select usa `field-value`; placeholder `field-placeholder`; tab usa `tab-label`; opções usam `nav-item`; descrição usa `helper`; badge complementar usa `badge-label`.

## Tokens by part

| Part | Property | Token |
| --- | --- | --- |
| group | background/border | `surface-subtle` / `border-subtle` |
| option | background/text | `transparent` / `text-secondary` |
| option hover | background/text | `surface-hover` / `text-primary` |
| selected | background/text/border | `primary-soft` / `primary` / `primary-border` |
| trigger | background/border | `surface` / `border-control-essential` |
| focus | ring/offset | `primary-focus` / `focus-ring-offset` |
| disabled | foreground/background | `disabled` / `disabled-soft` |

## Allowed variants

`single`, `multiple` e `tab`; presentation `contained` ou `line` apenas para tabs; density compact/standard. Diet mode usa `single` contido. Multiple exige indicador por opção e resumo textual no trigger.

## State matrix

| State | Background | Text | Border | Icon | Cursor | Motion | Semantic announcement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| default | `transparent`/`surface` | `text-secondary` | 1px quando trigger | `text-muted` | pointer | none | label e estado |
| hover | `surface-hover` | `text-primary` | `border-hover` | `text-secondary` | pointer | color 120ms | none |
| pressed | `surface-subtle` | `text-primary` | preservado | preservado | pointer | color 120ms | none |
| focus-visible | preservado | preservado | 1px + ring | preservado | pointer | none | opção e posição |
| selected | `primary-soft` | `primary` | `primary-border` | `primary` | pointer | color 120ms | selected/checked |
| disabled | `disabled-soft` | `disabled` | `border-subtle` | `disabled` | not-allowed | none | disabled |
| loading | valor atual preservado | `text-secondary` | preservado | spinner | wait | spinner linear | `aria-busy=true` |
| error | `error-soft` | `text-primary` | `error` | `error` | pointer | none | mensagem associada |
| empty | `surface-subtle` | `text-muted` | `border-subtle` | none | default | none | nenhuma opção disponível |
| read-only | N/A — seleção não editável vira `data-display` | N/A | N/A | N/A | N/A | N/A | N/A |

## Interaction and keyboard

Tabs: setas movem foco, Home/End extremos e ativação segue modo manual explícito. Select: Enter/Space abre, setas navegam, Enter escolhe e Esc fecha. Checkbox usa Space. Tab entra uma vez no conjunto e segue roving tabindex.

## Accessibility

Use padrões ARIA de tabs, listbox, radio ou checkbox via Radix/Shadcn. Nome do grupo obrigatório; selected/checked programático; painel ligado à tab; foco visível; target 32+; contraste AA e reduced motion.

## Composition

Opções podem conter ícone, label e descrição curta. Badge informativo não pode capturar interação. Tabs controlam um painel por tab; select delega portal/foco a `overlays`.

## Content and overflow

Labels de tab são uma linha e não truncam em fluxos críticos; lista pode rolar. Opção longa quebra em duas linhas. Trigger resume múltiplas escolhas por contagem, não concatena lista ilimitada.

## Forbidden decisions

Usar primary como ação; seleção somente por cor; misturar tabs de navegação e modo no mesmo grupo; border acima de 1px; pill; scroll horizontal de tabs como solução de responsividade; valores visuais locais.

## Current examples

`ui-select` implementa escolha em popup; `ui-tabs` implementa painéis; `organism-diet-mode-switcher` representa seleção única de modo.

## Category acceptance

Passa quando cardinalidade, seleção inicial, indicador, teclado, empty/error/loading e painel resultante são determinados e anunciados sem decisão local.

## Change history

- `CAT-2026-07-31-selection`: categoria estabilizada para select, tabs e escolhas futuras.
