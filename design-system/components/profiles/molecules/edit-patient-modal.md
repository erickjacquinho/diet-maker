# EditPatientModal

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-edit-patient-modal` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/EditPatientModal.tsx` |
| Public exports | `EditPatientModalProps` (type), `EditPatientModal` (component) |

## Purpose

Editar dados cadastrais, objetivo e metas de um paciente com proteção contra descarte acidental.

## Category inheritance

Herda integralmente [overlays](../../categories/overlays.md) e compõe campos e ações do sistema. Trait autorizado: `nutrition-context`.

## Specific anatomy

Dialog com header acessível, formulário rolável de cadastro e metas, footer de cancelar/salvar e confirmação secundária para descartar alterações.

## Allowed variants

Somente edição de um paciente recebido por prop. Não expõe styling livre nem substitui o primitive Radix.

## Particular states

O rascunho é isolado do paciente persistido; fechamento por Escape, backdrop ou cancelar abre confirmação quando existem alterações não salvas.

## Composition

Base declarada: `ui-dialog`. Compõe `ui-input`, `ui-select`, `ui-button` e `atom-secondary-action-button`. Persistência e criação de objetivos permanecem no consumidor.

## Content rules

Labels devem estar associados aos controles; objetivo e gênero devem permanecer selecionáveis por teclado.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de consumidores é o campo `consumers` do registro; atualmente `src/app/pacientes/[id]/page.tsx`.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- alterações não salvas são confirmadas antes do descarte;
- persistência não fica dentro do primitive ou do modal;
- dialog mantém title, descrição, foco e footer acessíveis.

## Implementation status

Implementado em `molecule` e homologado documentalmente no catálogo.
