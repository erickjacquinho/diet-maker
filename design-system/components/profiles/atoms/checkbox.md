# Checkbox

## Identity

| Field | Value |
| --- | --- |
| Component ID | `atom-checkbox` |
| Nature | `product-generic` |
| Lifecycle | `implemented` |
| Current layer | `atom` |
| Target layer | `atom` |
| Sources | `src/components/atoms/Checkbox.tsx` |
| Public exports | `CheckboxState`, `CheckboxProps` (types), `Checkbox` (component) |

## Purpose

Compartilhar o controle de seleção já usado no DataTable com a seleção de variações dos modais.

## Category inheritance

Herda integralmente [selection](../../categories/selection.md). Sem traits adicionais. Fundamentos globais e categoria prevalecem.

## Specific anatomy

Button com role checkbox, indicador de seleção e nome acessível obrigatório.

## Allowed variants

Estado controlado por checked: boolean ou indeterminate; não oferece variantes visuais.

## Particular states

Indeterminate anuncia mixed. Disabled bloqueia a mudança; estado assíncrono é controlado pelo consumidor.

## Composition

Base declarada: `ui-button`. Compõe indicador Lucide e mantém a receita existente do DataTable, sem dependência de domínio.

## Content rules

aria-label identifica a opção; className e ref seguem atributos nativos do botão.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

`molecule-data-table` e `organism-create-ready-meals-from-diet-modal`.

## Acceptance criteria

- checked e mixed são programáticos;
- clique, Enter e Space preservam interação nativa;
- seleção não aciona a linha pai;
- disabled impede alterações;
- foco e geometria permanecem na receita canônica.

## Implementation status

Implementado com a receita anteriormente interna do DataTable; contrato homologado documentalmente e verificado nos testes de seleção e modal.
