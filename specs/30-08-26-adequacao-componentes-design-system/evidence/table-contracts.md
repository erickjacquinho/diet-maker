# Contratos tabulares resolvidos

**Data**: 2026-08-30
**Skill**: `proj-table-adequation-v2`
**Canonical molecule**: `src/components/molecules/DataTable.tsx`
**Types**: `src/components/molecules/data-table/types.ts`

Foram executados `npm run resolve:table -- --target <path> --json` e
`npm run verify:table -- --target <path> --strict` para os sete alvos
delimitados, além da auditoria completa. A API viva resolvida exige `data`,
`columns`, `getRowId`, `caption` e `emptyMessage`; suporta `loading`, erro,
somente leitura, sort, paginação, seleção single/multi, sticky header,
`table-compact`/`table-modal`, virtualização e rows expandidas.

## Alvos e estado

| Alvo | Resultado do resolver/auditor | Filhos/contrato a preservar |
| --- | --- | --- |
| `src/components/molecules/ImportPreviousDietModal.tsx` | 0 erros; TABLE016 | `MacroSummary`, seleção/expansão e erro assíncrono |
| `src/components/molecules/food-search/ReadyMealSearchResultsList.tsx` | 0 erros | resultados, seleção, empty interno |
| `src/components/molecules/food-search/RecipeSearchResultsList.tsx` | 0 erros | porções/nutrientes, seleção, empty interno |
| `src/components/organisms/patient/PatientAssessmentsTable.tsx` | 0 erros | rows/expansão e unidades |
| `src/components/organisms/patient/PatientDietsTable.tsx` | 0 erros; TABLE016 | `MacroSummary`, histórico corrente |
| `src/components/organisms/PatientConsultationHistoryTable.tsx` | 0 erros; TABLE016 x2 | `MacroSummary`, `ConsultationHistoryExpandedRow` |
| `src/components/organisms/PatientListTable.tsx` | 0 erros; TABLE016 | `PatientListTableRow`, link focável |

A auditoria completa retornou `12/12 targets without errors`, `0 errors` e
cinco avisos TABLE016. Os avisos são mantidos visíveis até T010/T028
resolverem ownership e cadastro; não são removidos por supressão.

Nenhuma API, componente `DataTable`/`Checkbox`, token, categoria ou validador
foi alterado nesta resolução.
