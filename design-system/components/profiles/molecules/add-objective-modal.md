# AddObjectiveModal

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-add-objective-modal` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/AddObjectiveModal.tsx` |
| Public exports | `AddObjectiveModalProps` (type), `AddObjectiveModal` (component) |

## Purpose

Permitir o cadastro de um novo objetivo clínico ou esportivo para inclusão na lista do paciente.

## Category inheritance

Herda integralmente [overlays](../../categories/overlays.md). Trait autorizado: `nutrition-context`.

## Specific anatomy

Dialog com formulário simples de descrição do objetivo e footer de confirmação/cancelamento.

## Allowed variants

Variante única de criação de objetivo.

## Particular states

O modal reseta o input ao abrir e confirma ao submeter texto válido.

## Composition

Base declarada: `ui-dialog`. Compõe `ui-input` e `ui-button`.

## Content rules

Rótulo e botão devem utilizar verbo no imperativo.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de consumidores é o campo `consumers` do registro; atualmente `src/app/pacientes/[id]/page.tsx`.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- dialog mantém foco e acessibilidade nativos do Radix.

## Implementation status

Implementado em `molecule` e homologado documentalmente no catálogo.
