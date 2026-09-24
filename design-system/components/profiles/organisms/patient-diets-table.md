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

Prévia de até 10 registros no perfil e histórico completo paginado remotamente nas páginas do paciente; a expansão permanece disponível em ambos.

## Particular states

Vazio, erro, loading, seleção e somente leitura preservam o significado do histórico; snapshot confirmado não vira draft.

## Composition

Compõe `molecule-data-table`, `MacroSummary`, badges e ações canônicas. Cálculo, arquivamento e persistência pertencem à aplicação.

## Content rules

Data, status, calorias/macros e unidades exibem os valores armazenados com precisão; zero e ausência permanecem distintos.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

Perfil do paciente, páginas de histórico completo e histórico de consultas.

## Acceptance criteria

- `DietTableRow` mantém semântica e associação com headers;
- tabela usa estado interno canônico e chaves estáveis;
- paginação remota recebe apenas a página consultada, preservando a ordem da aplicação;
- consulta não altera snapshot, origem ou dados persistidos.

## Implementation status

Implementado em `organism`; perfil criado para fechar o contrato tabular e nutricional.
