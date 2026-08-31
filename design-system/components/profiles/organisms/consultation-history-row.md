# ConsultationHistoryRow

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-consultation-history-row` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/patient/ConsultationHistoryRow.tsx` |
| Public exports | `ConsultationHistoryRowProps` (type), `ConsultationHistoryRow` (compound-part), `ConsultationHistoryExpandedRow` (compound-part) |

## Purpose

Fornecer a linha e o detalhe expandido do histórico de consultas como uma família compound.

## Category inheritance

Herda [data-display](../../categories/data-display.md). Trait autorizado: `nutrition-context`.

## Specific anatomy

`ConsultationHistoryRow` apresenta o resumo; `ConsultationHistoryExpandedRow` apresenta detalhes associados na linha expandida.

## Allowed variants

Somente resumo/expandido conforme o estado controlado pela tabela pai.

## Particular states

Expandido, fechado, vazio e somente leitura preservam a associação; dados ausentes são explicitados.

## Composition

Compõe células tabulares, `MacroSummary`, badges e links/ações existentes. As duas parts compartilham ownership e não ganham perfis duplicados.

## Content rules

Data, tipo, estado e resumo nutricional conservam labels e unidades; detalhe não soma opções mutuamente exclusivas.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

`PatientConsultationHistoryTable` e seus testes de expansão.

## Acceptance criteria

- as duas parts permanecem dentro da semântica de `TableBody`;
- expansão e associação de detalhes são acessíveis;
- callbacks, links e snapshots não são alterados pela apresentação.

## Implementation status

Implementado em `organism`; família compound documentada para resolver ownership do aviso TABLE016.
