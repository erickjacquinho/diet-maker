# PatientDietsTable

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-patient-diets-table` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/patient/PatientDietsTable.tsx` |
| Public exports | `PatientDietsTableProps` (type), `DietTableRow` (compound-part), `PatientDietsTable` (component) |

## Purpose

Listar dietas históricas do paciente para consulta e ações já autorizadas.

## Category inheritance

Herda [data-display](../../categories/data-display.md). Trait autorizado: `nutrition-context`.

## Specific anatomy

`DataTable` com data/status/contexto nutricional e `DietTableRow` como part da mesma família.

## Allowed variants

Somente consulta, ordenação, seleção e paginação já disponíveis no consumidor.

## Particular states

Vazio, erro, loading, seleção e somente leitura preservam o significado do histórico; snapshot confirmado não vira draft.

## Composition

Compõe `molecule-data-table`, `MacroSummary`, badges e ações canônicas. Cálculo, arquivamento e persistência pertencem à aplicação.

## Content rules

Data, status, calorias/macros e unidades exibem os valores armazenados com precisão; zero e ausência permanecem distintos.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

Perfil do paciente, histórico de consultas e ações de consulta/importação.

## Acceptance criteria

- `DietTableRow` mantém semântica e associação com headers;
- tabela usa estado interno canônico e chaves estáveis;
- consulta não altera snapshot, origem ou dados persistidos.

## Implementation status

Implementado em `organism`; perfil criado para fechar o contrato tabular e nutricional.
