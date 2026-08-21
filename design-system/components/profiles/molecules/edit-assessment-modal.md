# EditAssessmentModal

## Identity

| Field | Value |
| --- | --- |
| Component ID | `molecule-edit-assessment-modal` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `molecule` |
| Target layer | `molecule` |
| Sources | `src/components/molecules/EditAssessmentModal.tsx` |
| Public exports | `EditAssessmentModalProps` (type), `EditAssessmentModal` (component) |

## Purpose

Coordenar a criação e edição de uma avaliação física, capturando medidas corporais e apresentando BF, massa gorda e massa magra calculados automaticamente.

## Category inheritance

Herda integralmente [overlays](../../categories/overlays.md) e compõe os campos previstos em [fields](../../categories/fields.md). Trait autorizado: `nutrition-context`. Fundamentos globais e categorias prevalecem sobre este perfil.

## Specific anatomy

Dialog com header acessível, descrição, formulário rolável com peso atual em linha inteira e circunferências em duas colunas, além de footer fixo de ações. O primeiro grupo contém peso atual e todas as circunferências na ordem do contrato do produto; o grupo inferior apresenta Body fat, massa gorda e massa magra em três `MetricBox` somente leitura.

## Visual contract

- Usa `ui-dialog`, `ui-input` e `ui-button` sem alterar os primitives.
- Mantém `surface`, `border-subtle`, `radius-surface`, padding de dialog e tipografia dos contratos de overlays/fields.
- Resultados derivados usam `MetricBox` com superfície `boxed`; não são campos editáveis nem `disabled`.
- O body é a única região rolável, com padding interno para preservar o focus ring dos inputs; header e footer permanecem visíveis dentro do viewport desktop.

## Allowed variants

Somente `create` e `edit` no título e no fluxo de persistência. Não expõe props livres de cor, tipografia, radius, spacing ou densidade.

## Particular states

Enquanto medidas obrigatórias estiverem incompletas, os resultados derivados permanecem vazios. Entradas inválidas exibem erro contextual com `role="alert"` e bloqueiam o submit. Gêneros diferentes de Masculino/Feminino não produzem cálculo.

## Composition

Base declarada: `ui-dialog`. Compõe `ui-input` e `ui-button`. O cálculo é delegado a `src/lib/bodyFat.ts`; pacientes, persistência e histórico permanecem nas rotas consumidoras.

## Content rules

Labels devem manter unidade explícita (`kg`, `cm` ou `%`) e associação `label`/`id`. Os textos visíveis usam português do produto: “Nova Avaliação Física”, “Editar Avaliação Física”, “Body fat”, “Massa gorda” e “Massa magra”.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de consumidores é o campo `consumers` de `design-system/components/registry.json`: perfil do paciente e consulta de uma avaliação existente.

## Acceptance criteria

- identidade, fonte, exports, categoria, trait e consumidores coincidem com o registro;
- Dialog preserva title, description, foco Radix, fechamento por Escape, footer e body rolável;
- campos possuem labels associados, unidades explícitas e estado read-only sem uso de disabled;
- nenhum cálculo, persistência ou regra de paciente é duplicado no primitive ou na rota;
- o cálculo de domínio permanece centralizado em módulo reutilizável.

## Implementation status

Implementado em `molecule` e homologado no catálogo após a validação estrita de Atomic Design e Design System.
