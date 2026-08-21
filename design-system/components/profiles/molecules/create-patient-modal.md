# CreatePatientModal

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-create-patient-modal` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/CreatePatientModal.tsx` |
| Public exports | `CreatePatientFormData`, `CreatePatientModalProps` (types), `CreatePatientModal` (component) |

## Purpose

Coletar os dados cadastrais e metas nutricionais iniciais de um paciente antes da persistência.

## Category inheritance

Herda integralmente [overlays](../../categories/overlays.md) e compõe campos e ações do sistema. Trait autorizado: `nutrition-context`.

## Specific anatomy

Dialog com título acessível, formulário de identificação, contato, medidas e objetivo, seguido por footer de cancelar e salvar.

## Allowed variants

Somente criação. Não expõe props de cor, tipografia, radius, espaçamento ou infraestrutura do dialog.

## Particular states

Campos iniciam com defaults do produto; o submit exige nome e o consumidor recebe um payload normalizado.

## Composition

Base declarada: `ui-dialog`. Compõe `ui-input`, `ui-select` e `ui-button`. Cálculo e persistência permanecem na rota consumidora.

## Content rules

Labels devem estar associados aos controles e metas devem indicar unidade ou contexto quando aplicável.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de consumidores é o campo `consumers` do registro; atualmente `src/app/pacientes/page.tsx`.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- estado de formulário permanece no modal e regras de persistência permanecem na rota;
- dialog mantém title, foco Radix, body e footer acessíveis.

## Implementation status

Implementado em `molecule` e homologado documentalmente no catálogo.
