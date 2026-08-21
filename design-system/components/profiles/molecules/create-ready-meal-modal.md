# CreateReadyMealModal

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-create-ready-meal-modal` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/CreateReadyMealModal.tsx` |
| Public exports | `ReadyMealFormData`, `CreateReadyMealModalProps` (types), `CreateReadyMealModal` (component) |

## Purpose

Montar um bloco de refeição pronta com horário sugerido, macros e resumo de alimentos.

## Category inheritance

Herda integralmente [overlays](../../categories/overlays.md) e compõe campos e ações do sistema. Trait autorizado: `nutrition-context`.

## Specific anatomy

Dialog com título acessível, identificação do bloco, horário, seção de macros, resumo de itens e footer de ações.

## Allowed variants

Somente criação. Não expõe props de estilo, density ou infraestrutura do dialog.

## Particular states

O formulário inicia com defaults de macros e só submete com nome preenchido; o payload normalizado é entregue ao consumidor.

## Composition

Base declarada: `ui-dialog`. Compõe `ui-input`, `ui-button` e `molecule-auto-kcal-section`. Cálculo e persistência permanecem na rota consumidora.

## Content rules

Macros e horário devem manter unidades/contexto explícitos; o resumo de alimentos é texto auxiliar.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de consumidores é o campo `consumers` do registro; atualmente `src/app/refeicoes-prontas/page.tsx`.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- formulário e cálculo local não vazam para a rota;
- dialog mantém title, body rolável e footer acessível.

## Implementation status

Implementado em `molecule` e homologado documentalmente no catálogo.
