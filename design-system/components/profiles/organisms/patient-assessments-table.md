# PatientAssessmentsTable

## Identity

| Field | Value |
| --- | --- |
| Component ID | `organism-patient-assessments-table` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `organism` |
| Target layer | `organism` |
| Sources | `src/components/organisms/patient/PatientAssessmentsTable.tsx` |
| Public exports | `PatientAssessmentsTableProps` (type), `AssessmentTableRow` (compound-part), `AssessmentTableExpandedRow` (compound-part), `PatientAssessmentsTable` (component) |

## Purpose

Apresentar avaliações físicas do paciente em tabela com detalhe expandível.

## Category inheritance

Herda [data-display](../../categories/data-display.md). Trait autorizado: `nutrition-context`.

## Specific anatomy

`DataTable` com identificação da avaliação, data, medidas e expansão de detalhes; as duas rows são parts do mesmo arquivo/família.

## Allowed variants

Somente ordenação, expansão, seleção e paginação já oferecidas pelo contrato do consumidor.

## Particular states

Vazio, carregando, erro, somente leitura e expansão seguem a tabela canônica; ausência de uma medida recebe texto explícito.

## Composition

Compõe `molecule-data-table`, métricas/labels e `AssessmentTableRow`/`AssessmentTableExpandedRow`. Não transforma dados em inputs desabilitados.

## Content rules

Medidas, unidades, data e comparação preservam precisão recebida; cor não é a única indicação de evolução.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

Perfil do paciente e histórico de consultas.

## Acceptance criteria

- parts estão enumeradas e mantêm associação semântica;
- headers, caption, chaves e expansão são acessíveis;
- valores e callbacks existentes não são recalculados ou persistidos pela tabela.

## Implementation status

Implementado em `organism`; perfil criado para fechar ownership e contrato tabular.
