# NextEventModal

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-next-event-modal` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/NextEventModal.tsx` |
| Public exports | `NextEventModalProps` (type), `NextEventModal` (component) |

## Purpose

Permitir o agendamento ou reagendamento do próximo acompanhamento do paciente.

## Category inheritance

Herda integralmente [overlays](../../categories/overlays.md). Trait autorizado: `nutrition-context`.

## Specific anatomy

Dialog com DatePickerField para seleção de data, Select para tipo de atualização e botões de ação.

## Allowed variants

Criação e edição de acompanhamento.

## Particular states

Quando há acompanhamento definido, exibe ação de remoção.

## Composition

Base declarada: `ui-dialog`. Compõe `molecule-date-picker-field`, `ui-select` e `ui-button`.

## Content rules

Data deve ser válida e selecionada no calendário.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de consumidores é o campo `consumers` do registro; atualmente `src/app/pacientes/[id]/page.tsx`.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- permite reagendar e remover a data com confirmação.

## Implementation status

Implementado em `molecule` e homologado documentalmente no catálogo.
