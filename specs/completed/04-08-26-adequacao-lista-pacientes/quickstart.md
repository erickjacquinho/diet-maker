# Quickstart: Validação da Lista de Pacientes

## Prerequisites

- Node.js and the repository dependencies installed.
- The project checked out on branch `tela-pacientes`.
- A desktop viewport at or above `1024px`.
- Local patient data containing at least one patient in each event state, two assessments for one patient, only one assessment for another, and historical diet presence combinations.

## Automated checks

Run from `C:\Programmer\diet-maker`:

```powershell
npm run type-check
npm test -- tests/lib/patient-list-view.test.ts tests/components/organisms/patient-list-table.test.tsx tests/app/pacientes/page.test.tsx
npm run lint
npm run verify:design-system
```

Expected outcomes:

- TypeScript reports no errors.
- Projection tests cover priority order, filtering, BF formatting, comparison period, missing history and record flags.
- Table tests cover semantic headers, accessible row navigation, icons, indicators and event states.
- Page tests cover toolbar placement, search count, new-patient action and empty/no-results states.
- Design-system validation reports no unregistered component or token violation introduced by the change.

## Manual visual validation

1. Start the app with `npm run dev`.
2. Open `/pacientes` in a desktop browser at a width of at least `1024px`.
3. Ignore the global sidebar and inspect only the main content area.
4. Confirm the page header contains `Pacientes` and the preparation subtitle.
5. Confirm the toolbar contains search, patient count and `+ Novo paciente` aligned to the right; confirm `Prioridade do acompanhamento` is absent as a control.
6. Confirm the panel contains a single continuous table with headers `Paciente`, `Objetivo`, `Evolução de gordura`, `Próximo acompanhamento` and the chevron action column.
7. Confirm the patient cell contains name, age, the Mars/Venus gender icon followed by two vertically reserved record-indicator slots.
8. Confirm the top indicator means physical assessment and the bottom indicator means historical diet; inspect combinations where either slot is empty.
9. Confirm the body-fat cell shows current BF and a delta such as `−0,4% 20d`; confirm no current-weight metric is present.
10. Confirm order is overdue, today, upcoming by date and no next event, with no visual group separators.
11. Confirm row hover/focus remains visible and Enter/Space from a focused row opens the patient profile.
12. Test search by patient name and objective, including a no-results state and restored count after clearing the query.
13. Open `+ Novo paciente` and confirm the existing registration modal remains available.

## Reference comparison

Use [refs/pacientes-list-view.html](../../refs/pacientes-list-view.html) as the visual reference for the main content only. Do not copy its inline CSS and do not evaluate its sidebar as part of this feature.

## Validation record

- Executado em 04/08/2026 com viewport desktop de `1440x900` usando um paciente com duas avaliações e dieta histórica.
- Confirmados: painel `Lista de pacientes`, toolbar com busca/contagem/`+ Novo paciente`, ausência de `Prioridade do acompanhamento`, colunas aprovadas, BF `24,7% BF`, delta `−0,4% 20d`, dois indicadores verticais, ícone Venus, chevron e evento textual.
- Não foram observados erros de console durante a navegação automatizada.
- Suíte validada em três blocos: `36` arquivos e `156` testes aprovados; `npm run type-check`, `npm run lint` e `npm run verify:design-system` aprovados.
