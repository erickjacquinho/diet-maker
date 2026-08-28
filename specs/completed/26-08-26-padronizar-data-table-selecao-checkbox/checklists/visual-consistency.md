# Visual & Layout Checklist: Padronização do Componente DataTable com Seleção e Checkbox Canônico

**Purpose**: Validar a qualidade dos requisitos visuais, tipográficos, espaçamentos e cabeçalhos fixos da tabela
**Created**: 2026-08-26
**Feature**: [spec.md](../spec.md)

## Requirement Completeness & Tokens

- [x] CHK013 Are canonical typography tokens specified for all table header elements? [Completeness, Spec §FR-008, §US-2]
- [x] CHK014 Are standard padding, height, and surface background tokens defined for header and body rows? [Completeness, Spec §FR-008, §US-2]
- [x] CHK015 Are alignment rules and tabular figure requirements specified for numeric versus text columns? [Clarity, Spec §US-2]

## Layout & Sticky Header Coverage

- [x] CHK016 Are sticky header requirements defined for bounded container and modal use cases? [Completeness, Spec §FR-009, §US-3]
- [x] CHK017 Is column width synchronization during vertical scrolling specified without layout shift? [Consistency, Spec §FR-009, §US-3]
- [x] CHK018 Are empty, loading, and error states required to span the entire column count including selection? [Consistency, Spec Edge Cases]

## Migration & Non-Regression Coverage

- [x] CHK019 Are migration requirements defined for FoodSearchResultsList and SubstituteFoodModal? [Completeness, Spec §FR-010]
- [x] CHK020 Is non-regression required for all pre-existing DataTable consumers (Patients, History, Diets, Assessments)? [Consistency, Spec §FR-011]


## Notes

- Checklist focused on visual coherence, tokens, and non-regression across all application tables.
