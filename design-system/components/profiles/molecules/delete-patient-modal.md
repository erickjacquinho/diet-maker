# DeletePatientModal

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-delete-patient-modal` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/DeletePatientModal.tsx` |
| Public exports | `DeletePatientModalProps` (type), `DeletePatientModal` (component) |

## Purpose

Exibir confirmação de exclusão permanente de um cadastro de paciente e seus dados associados.

## Category inheritance

Herda integralmente [overlays](../../categories/overlays.md). Trait autorizado: `destructive`.

## Specific anatomy

Dialog com aviso em destaque de erro/destrutivo e botões de confirmação destrutiva e cancelamento.

## Allowed variants

Variante única de confirmação destrutiva.

## Particular states

Confirmação aciona o callback de exclusão e cancelamento fecha o modal.

## Composition

Base declarada: `ui-dialog`. Compõe `ui-button`.

## Content rules

Texto de aviso deve informar expressamente as consequências irrecuperáveis da exclusão.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de consumidores é o campo `consumers` do registro; atualmente `src/app/pacientes/[id]/page.tsx`.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- botão de confirmação utiliza a variante `destructive`.

## Implementation status

Implementado em `molecule` e homologado documentalmente no catálogo.
