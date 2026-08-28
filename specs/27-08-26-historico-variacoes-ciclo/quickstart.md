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

## Accessibility scenario

- Reach the expansion control with the keyboard.
- Activate it with the keyboard and verify that the open/closed state is announced by its accessible name/state.
- Move through the variation rows and ensure each value has semantic column context and pronounced units.
- Confirm visible focus and that color is not the only indication of variation type or state.
