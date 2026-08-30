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

Exibir confirmação explícita de arquivamento lógico de um cadastro de paciente,
mantendo seus dados e relações clínicas preservados para consulta.

## Category inheritance

Herda integralmente [overlays](../../categories/overlays.md). Trait autorizado: `destructive`.

## Specific anatomy

Dialog com aviso em destaque de ação destrutiva reversível, confirmação
prolongada por `HoldToDeleteButton`, mensagem de preservação e ações de
cancelamento/arquivamento.

## Allowed variants

Variante única de confirmação destrutiva para arquivamento.

## Particular states

Confirmação prolongada aciona `onConfirmArchive`; o modal fecha somente quando
o callback assíncrono conclui com sucesso. Falhas permanecem no modal como
alerta recuperável e permitem nova tentativa. Cancelamento fecha sem mutação.

## Composition

Base declarada: `ui-dialog`. Compõe `ui-button`.

## Content rules

Texto deve distinguir arquivamento de exclusão física e informar que o paciente
sai da lista ativa enquanto dietas, avaliações e demais relações históricas são
preservadas. O nome do paciente deve permanecer interpolado com escape do React.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de consumidores é o campo `consumers` do registro; atualmente `src/app/pacientes/[id]/page.tsx`.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- botão de confirmação utiliza a variante `destructive`;
- confirmação exige retenção de 1,5 segundo e possui label/title acessíveis;
- estado pendente desabilita ações concorrentes;
- falha de persistência é anunciada com `role="alert"` sem fechar o dialog;
- o primitive `ui-dialog` e o átomo `HoldToDeleteButton` não recebem vocabulário de storage.

## Implementation status

Implementado em `molecule` e homologado documentalmente no catálogo.
