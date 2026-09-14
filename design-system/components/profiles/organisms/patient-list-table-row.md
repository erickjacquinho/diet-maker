# PatientListTableRow

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-patient-list-table-row` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/patient/PatientListTableRow.tsx` |
| Public exports | `PatientListTableRowProps` (type), `PatientListTableRow` (compound-part) |

## Purpose

Renderizar a linha de um paciente mantendo a semântica da tabela e o link de navegação.

## Category inheritance

Herda [data-display](../../categories/data-display.md). Nenhum trait adicional.

## Specific anatomy

Linha com nome/link, indicadores de histórico, objetivo, evolução corporal, próximo evento e affordance de abertura.

## Allowed variants

Somente os estados de dados e prioridade existentes na lista; não cria altura ou cor arbitrária.

## Particular states

Sem avaliação, sem dieta, sem próximo evento e nome longo têm texto/indicadores acessíveis; foco e hover são herdados.

## Composition

Compõe `next/link`, ícones Lucide e células da tabela pai. Não coloca uma tabela ou botão interativo concorrente dentro da row.

## Content rules

Data, idade, objetivo, BF e indicadores possuem labels; prioridade e ausência não dependem apenas de cor.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

`PatientListTable`.

## Acceptance criteria

- row, cells e link mantêm semântica e teclado;
- navegação não dispara duas vezes;
- indicadores têm descrição textual e dados sem comparação não inventam delta.

## Implementation status

Implementado em `organism`; part documentada para resolver ownership do aviso TABLE016.
