# CreatePresetModal

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-create-preset-modal` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/CreatePresetModal.tsx` |
| Public exports | `CreatePresetData`, `CreatePresetModalProps` (types), `CreatePresetModal` (component) |

## Purpose

Montar um preset de dieta com modos de cálculo de macros, peso de referência e descrição.

## Category inheritance

Herda integralmente [overlays](../../categories/overlays.md) e compõe campos, seleção e ações do sistema. Trait autorizado: `nutrition-context`.

## Specific anatomy

Dialog com formulário de título/categoria, três editores de macro, peso condicional, resumo de calorias e descrição, seguido de footer de ações.

## Allowed variants

Somente criação. O modo multiplicativo revela o campo de peso de referência; essa variação é de conteúdo, não de estilo.

## Particular states

O modal mantém rascunho local; fechar com conteúdo preenchido exige confirmação de descarte. Calorias e gramas são derivados do rascunho.

## Composition

Base declarada: `ui-dialog`. Compõe `ui-input`, `ui-select`, `ui-badge` e `ui-button`. Cálculo e persistência são entregues ao consumidor por callback.

## Content rules

Cada macro deve manter nome e unidade; o resumo de calorias deve permanecer somente leitura.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de consumidores é o campo `consumers` do registro; atualmente `src/app/presets/page.tsx`.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- descarte é confirmado quando há rascunho;
- cálculos derivados não são duplicados na rota;
- dialog mantém body rolável e ações acessíveis.

## Implementation status

Implementado em `molecule` e homologado documentalmente no catálogo.
