# Category: Overlays

Category ID: `overlays`  
Lifecycle: `stable`  
Decision reference: `CAT-2026-07-31-overlays`  
Allowed traits: `async`, `read-only`, `nutrition-context`, `destructive`  
Current consumers: `ui-dialog`, `ui-dropdown-menu`, `ui-popover`, `ui-sheet`, `ui-tooltip`, `organism-food-search-modal`, `organism-read-only-diet-modal`

Normative foundations: [color](../../04-color-system.md), [typography](../../05-typography-system.md), [geometry](../../06-geometry-and-desktop-layout.md), [motion and layers](../../07-icons-motion-and-layers.md), [states and accessibility](../../08-states-and-accessibility.md).

## Purpose

Exibir conteúdo temporário acima do fluxo com camada, foco, posicionamento, fechamento e retorno ao contexto de origem previsíveis.

## Includes

Dialog, sheet, popover, dropdown menu e tooltip. Modais de busca/consulta continuam overlays mesmo quando contêm domínio nutricional.

## Excludes

Cards no fluxo pertencem a `surfaces`; navegação persistente a `navigation`; toast tem categoria principal `feedback`; sidebar persistente não é sheet neste produto desktop.

## Relationship map

Compõe `actions`, `fields`, `selection`, `feedback` e conteúdo de domínio. Usa primitivos Radix/Shadcn para portal, foco e dismissal. Traits alteram conteúdo/semântica, não a infraestrutura do overlay.

## Base anatomy

Overlay modal: portal, backdrop, content, title, description opcional, close e actions. Popover/menu/tooltip: trigger, portal e content; arrow opcional. Proibidos: modal sem title acessível, botão fechar duplicado e overlay dentro de tooltip.

## Geometry

Dialog usa padding `dialog` (24), radius `radius-surface`, borda 1px e container apropriado ao conteúdo; sheet ocupa borda lateral e mantém largura desktop definida pelo perfil. Popover/menu usa padding 8/12, radius `radius-control`, min-width do trigger quando escolha. Tooltip usa padding `badge`. Gap interno `space-component`.

## Typography

Dialog title `dialog-title`; description `body-secondary`; conteúdo `body`; menu item `nav-item`; menu label `overline`; shortcut `metadata`; tooltip `helper`; footer actions usam styles de `actions`.

## Tokens by part

| Part | Property | Token |
| --- | --- | --- |
| modal content | background/border/elevation | `surface` / `border-subtle` / `shadow-overlay` |
| floating content | background/border/elevation | `surface` / `border-subtle` / `shadow-floating` |
| backdrop | background/layer | `overlay-backdrop` / `z-overlay` |
| item hover | background/text | `surface-hover` / `text-primary` |
| destructive item | text/icon | `error` / `error` |
| focus | ring/offset | `primary-focus` / `focus-ring-offset` |
| tooltip | background/text | `text-primary` / `canvas` |

## Allowed variants

`dialog` para decisão/tarefa bloqueante; `sheet` para painel contextual extenso; `popover` para conteúdo leve; `menu` para comandos; `tooltip` para explicação breve. Modal/non-modal segue o primitivo e não é escolha estética.

## State matrix

| State | Background | Text | Border | Icon | Cursor | Motion | Semantic announcement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| default | `surface` | `text-primary` | `border-subtle` | `text-muted` | default | entrance recipe | title/role |
| hover | container preservado; item `surface-hover` | item `text-primary` | preservado | preservado | pointer em item | color 120ms | none |
| pressed | item `surface-subtle` | preservado | preservado | preservado | pointer | color 120ms | none |
| focus-visible | preservado | preservado | 1px + ring no item | preservado | pointer | none | item/name |
| selected | item `primary-soft` | `primary` | preservado | `primary` | pointer | none | checked/selected |
| disabled | preservado | `disabled` | preservado | `disabled` | not-allowed | none | disabled |
| loading | estrutura preservada | conteúdo/skeleton | preservado | spinner | wait | loading recipe | region busy |
| error | `error-soft` na mensagem interna | `text-primary` | `error-border` local | `error` | default | none | alert interno |
| empty | `surface-subtle` na região | `text-secondary` | preservado | `text-muted` | default | none | nenhuma opção/resultado |
| read-only | `surface` | `text-primary` | `border-subtle` | `text-muted` | default | entrance recipe | dialog de consulta |

## Interaction and keyboard

Trigger abre por click/Enter/Space. Modal prende foco, inicia no primeiro controle útil ou title focável e retorna ao trigger. Esc fecha salvo operação irreversível ativa; click no backdrop fecha somente conteúdo descartável. Menus usam setas/Home/End; tooltip não recebe conteúdo interativo.

## Accessibility

Preservar Radix/Shadcn e ARIA APG: role, title, description, modal state, focus trap e return focus. Backdrop sem blur. Close sempre nomeado. Tooltip complementa, nunca substitui label. Contraste AA, zoom 200% e reduced motion.

## Composition

Header contém title/description; body é a única região rolável; footer contém actions. Overlay não aninha outro modal; popover pode abrir dialog apenas fechando-se primeiro. Destructive requer confirmação explícita.

## Content and overflow

Title é curto e único. Body rola quando excede viewport; header/footer permanecem visíveis. Menus truncam labels não críticos com tooltip; dialog não trunca mensagens. Tooltip é uma frase, sem markdown/ações.

## Forbidden decisions

Reimplementar foco/portal fora do primitivo; modal sem title; backdrop blur; fechar erro destrutivo por backdrop; tooltip interativo; nesting modal; shadow em conteúdo não flutuante; `transition-all`, scale ou bounce; z-index local.

## Current examples

Primitivos `ui-dialog`, `ui-sheet`, `ui-popover`, `ui-dropdown-menu`, `ui-tooltip`; composições `organism-food-search-modal` e `organism-read-only-diet-modal`.

## Category acceptance

Passa quando tipo, trigger, camada, foco inicial/retorno, dismissal, scroll, title, ações e estados async são definidos e testáveis sem decisão local.

## Change history

- `CAT-2026-07-31-overlays`: categoria estabilizada preservando infraestrutura Radix/Shadcn.
