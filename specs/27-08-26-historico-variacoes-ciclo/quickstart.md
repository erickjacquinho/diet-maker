# Quickstart: Validar a tabela de variações no histórico

## Prerequisites

- Node.js and the repository dependencies are installed.
- The project is checked out at the feature worktree.
- Validation is performed in the desktop scope, at or above 1024px.

## Automated validation

Run the focused component, selector, and profile-history scenarios:

```powershell
npx vitest run tests/lib/patient-profile-selectors.test.ts tests/components/organisms/patient-diets-table.test.tsx tests/app/pacientes/patient-profile-history.test.tsx
```

Expected outcome:

- The weighted weekly average remains unchanged for a carb-cycle prescription.
- A cycle with four or more variations produces one detail row per variation.
- Assigned days use one comma-separated column, for example `Ter, Qui`, in canonical weekly order.
- The parent row keeps its standard height after expansion and re-collapse.
- No cards, overlap, clipped critical values, or second content line are required by the scenarios.
- Missing days, missing meals, and no-variation states remain explicit.
- Simple diets and existing view/edit/delete actions retain their behavior.

The compact variation table uses the following reading order: `Variação`, `Dias`,
`Proteína`, `Carboidratos`, `Gorduras`, `Calorias`, `Refeições`. Each variation
remains one semantic table row, including records with `Nenhum dia atribuído` or
`Nenhuma refeição`; a cycle with no records shows `Este ciclo não possui variações
configuradas.` after expansion.

Run static validation:

```powershell
npm run type-check
npm run lint
```

The table resolver and project audits remain useful conformance checks:

```powershell
npm run resolve:table -- --target src/components/organisms/patient/PatientDietsTable.tsx --json
npm run verify:table -- --target src/components/organisms/patient/PatientDietsTable.tsx --strict
npm run verify:design-system -- --strict
```

Any pre-existing baseline findings must be recorded separately from findings introduced by this feature. The target feature must not add new table or design-system errors.

Observed automated validation on 2026-08-28:

- Focused Vitest: passed, 3 files and 28 tests.
- `npm run type-check`: passed.
- `npm run lint`: passed.
- Table resolver: passed; target uses the canonical `DataTable` and `Table` primitives, with no arbitrary table classes.
- `npm run verify:table -- --target src/components/organisms/patient/PatientDietsTable.tsx --strict`: passed with 0 errors and 1 pre-existing warning for the uncatalogued `MacroSummary` child.
- `npm run verify:design-system -- --strict`: remains a pre-existing baseline failure involving registry/profile drift and other components, including the target's missing registry entry; no new target-specific error was introduced by this feature.
- `npm test -- --reporter=verbose`: the full suite exceeded the repository hook's 90-second limit and reported pre-existing overlay z-index, design-system catalog, and legacy-audit failures outside this feature; the focused feature suite remains green.

## Manual scenario

1. Start the desktop application with `npm run dev`.
2. Open a patient profile containing a carb-cycling prescription with at least four variations.
3. Expand the prescription using the named control.
4. Read the expanded view from top to bottom:
   - each variation occupies one predictable row;
   - days appear in one column as `Ter, Qui` or the corresponding canonical sequence;
   - macros, calories, and meals retain explicit units;
   - unassigned days or zero meals use explicit empty text;
   - the parent prescription row remains the standard height and still exposes its existing actions.
5. Collapse the details and confirm the parent row returns to the same state without changing its summary.
6. Repeat with a simple diet and confirm no cycle details are offered.

Edge-case checks:

- Run the same scenario with 1, 3, 4, and 8 variations; the detail table row count
  must be the variation count plus its single header row.
- Use a variation whose source days are out of order, such as `qui`, `ter`; the
  rendered value must be `Ter, Qui`.
- Use a long variation name and confirm the row remains single-line while the full
  value remains available through the cell's accessible title/text.

## Accessibility scenario

- Reach the expansion control with the keyboard.
- Activate it with the keyboard and verify that the open/closed state is announced by its accessible name/state.
- Move through the variation rows and ensure each value has semantic column context and pronounced units.
- Confirm visible focus and that color is not the only indication of variation type or state.

Observed manual validation on 2026-08-28:

- Production server (`next start`) with Playwright: passed at 1024px and 1440px.
- Eight variation rows remained visible in vertical order; the parent and all variation rows measured 44px (`h-table-row`).
- `Ter, Qui`, no-day and no-meal states were visible; expansion and re-collapse worked through the named control.
- An initial development-server attempt was inconclusive because HMR/static assets returned 400 responses; the final production-server run passed after rebuilding in isolation.
