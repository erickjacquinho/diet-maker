# Actions

Category ID: `actions`
Lifecycle: `stable`
Decision reference: `CAT-TEST-ACTIONS`
Allowed traits: none
Current consumers: `ui-button`

## Purpose
Executar ações explícitas.

## Includes
Controles que disparam uma ação.

## Excludes
Navegação e seleção persistente.

## Relationship map
Compõe feedback e loading.

## Base anatomy
Container, label e ícone opcional.

## Geometry
Usa somente receitas canônicas de controle.

## Typography
Usa `button-label` ou `button-label-compact`.

## Tokens by part
Container e conteúdo referenciam tokens de componente.

## Allowed variants
Primary, secondary, ghost, danger e link.

## State matrix
| State | Background | Text | Border | Icon | Cursor | Motion | Semantic announcement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| default | category | category | category | category | pointer | none | name |
| hover | category | category | category | category | pointer | none | none |
| pressed | category | category | category | category | pointer | none | none |
| focus-visible | category | category | category | category | pointer | none | name |
| selected | N/A — actions do not store selection | N/A | N/A | N/A | N/A | N/A | N/A |
| disabled | category | category | category | category | not-allowed | none | disabled |
| loading | category | category | category | spinner | wait | canonical | busy |
| error | N/A — errors are feedback | N/A | N/A | N/A | N/A | N/A | N/A |
| empty | N/A — actions require a name | N/A | N/A | N/A | N/A | N/A | N/A |
| read-only | N/A — actions are enabled or disabled | N/A | N/A | N/A | N/A | N/A | N/A |

## Interaction and keyboard
Enter e Space ativam buttons.

## Accessibility
Nome acessível e foco visível são obrigatórios.

## Composition
Ícone e label respeitam ordem prevista.

## Content and overflow
Label permanece legível e não quebra em duas linhas.

## Forbidden decisions
Não existem cores ou tamanhos locais.

## Current examples
`ui-button`.

## Category acceptance
Nenhuma decisão compartilhada permanece aberta.

## Change history
`CAT-TEST-ACTIONS` criou a categoria.

## Foundations

- [04 — Cores](../../04-color-system.md)
- [05 — Tipografia](../../05-typography-system.md)
- [06 — Geometria](../../06-geometry-and-desktop-layout.md)
- [07 — Ícones](../../07-icons-motion-and-layers.md)
- [08 — Estados](../../08-states-and-accessibility.md)
