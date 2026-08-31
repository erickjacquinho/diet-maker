# Comandos da baseline

Executados em `C:/Programmer/diet-maker`, com
`SPECIFY_FEATURE_DIRECTORY=specs/30-08-26-adequacao-componentes-design-system`.

## Resultado resumido

- `check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks`: PASS; feature e tasks localizados.
- `npm run type-check`: PASS.
- `npm run lint`: PASS.
- `npm run verify:design-system`: PASS; 40 fontes, 0 uncovered exports, 0 blocking findings.
- `npm run verify:table`: 0 erros e 5 avisos TABLE016 (MacroSummary, ConsultationHistoryExpandedRow e PatientListTableRow sem cadastro próprio).
- `npm run audit:atomic-design`: PASS; 148 arquivos, 100%, 0 violações.
- `npm run audit:z-index -- --strict`: PASS; 0 findings em 459 arquivos.
- `npm run verify:design-system-legacy -- --strict`: 2 findings LEG011 (`ReadOnlyDietModal.tsx:48` e `DietBuilderTemplate.tsx:161`, ambos `text-sm`).
- `npm run verify:links`: PASS; 244 Markdown, 458 links locais.
- `npm run build`: PASS; Next.js 15.5.22 compilou e gerou 10 páginas estáticas.
- `npm test`: exit 1. Falhas observadas nos testes de legacy cutover, contexto de pacientes, auditoria legada e `useDietMealActions`; a execução também emitiu `Not implemented: navigation to another Document` e foi encerrada após não apresentar progresso.

O teste global foi executado antes de qualquer alteração desta feature. O resultado
não é usado como justificativa para relaxar expectativas ou remover cobertura.

