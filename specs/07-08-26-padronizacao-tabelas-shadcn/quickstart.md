# Quickstart Validation Guide: Padronização de Tabelas Shadcn Data Table

**Feature**: [spec.md](spec.md) | **Date**: 2026-08-07

## Validation Scenarios

### Scenario 1: Verification of Library Cleanup
1. Verify `package.json` to ensure `@tanstack/react-table` is not listed.
2. Run code search for `react-table` across `src/` to confirm 0 imports remain.

```powershell
npm run type-check
```

### Scenario 2: Food Table Verification (`/alimentos`)
1. Start the dev server (`npm run dev`).
2. Navigate to `http://localhost:3000/alimentos`.
3. Test search and category filtering.
4. Verify table headers and row formatting render with Shadcn design system styling.

### Scenario 3: Patient List Verification (`/pacientes`)
1. Navigate to `http://localhost:3000/pacientes`.
2. Click on a patient row to ensure navigation works correctly.
3. Verify badges and table columns render properly without layout shifts.

### Scenario 4: Patient Consultation History Verification (`/pacientes/[id]`)
1. Navigate to a patient details page (e.g. `http://localhost:3000/pacientes/patient-1`).
2. Verify consultation history table renders and expanding details works properly.
