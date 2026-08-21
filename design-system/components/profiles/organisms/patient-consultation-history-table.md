# PatientConsultationHistoryTable

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-patient-consultation-history-table` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/PatientConsultationHistoryTable.tsx` |
| Public exports | `ConsolidatedConsultationUpdate`, `PatientConsultationHistoryTableProps` (types), `PatientConsultationHistoryTable` (component) |

## Purpose

Coordenar a exibição da tabela de histórico de consultas com registros de dietas, avaliações físicas e acordeão expansível.

## Category inheritance

Herda integralmente [data-display](../../categories/data-display.md). Trait autorizado: `nutrition-context`.

## Specific anatomy

Tabela com cabeçalho de metadados, colunas de data, badges de tipo, resumo de macros e valores corporais, e acordeão com detalhes de dieta e avaliação física.

## Allowed variants

Variante única de histórico tabular de consultas.

## Particular states

Linhas ativas recebem destaque de borda verde `border-l-success`. Linhas expansíveis exibem cards de métricas compactos e ações de navegação.

## Composition

Compõe `molecule-data-table`, `atom-badge`, `atom-icon-button`, `molecule-metric-box` e `ui-button`.

## Content rules

Valores numéricos utilizam numerais tabulares `tabular-nums`.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de consumidores é o campo `consumers` do registro; atualmente `src/app/pacientes/[id]/page.tsx`.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- estado expansível alterna ícones de seta e exibe os cards detalhados.

## Implementation status

Implementado em `organism` e homologado documentalmente no catálogo.
