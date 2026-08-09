# Quickstart Validation Guide: Shadcn DataTable

**Feature**: [spec.md](spec.md)

## Prerequisites

From the repository root:

```powershell
npm install
```

## Automated validation

Run in this order:

```powershell
npm run test
npm run type-check
npm run lint
npm run build
npm run verify:design-system
npm run verify:links
```

Then audit the external table library and all consumers:

```powershell
rg -n "@tanstack/react-table|useReactTable|react-table" src package.json package-lock.json
rg -n "<Table|<table|TableHeader|TableBody|TableRow|TableCell" src
```

Expected outcomes:

- The first command returns no TanStack/table-library references.
- Every data-table consumer is accounted for and uses the shared DataTable.
- The canonical `src/components/ui/table.tsx` remains generic and isolated.
- All automated quality commands exit with status 0.

## Scenario A: Food table

1. Run `npm run dev`.
2. Open `http://localhost:3000/alimentos`.
3. Search for a food and apply category, preparation and macro filters.
4. Sort by name, kcal and at least one macro column in both directions.
5. Move through pages when more than 15 rows exist.
6. Toggle a favorite and edit a custom food.
7. Clear filters until the empty state appears.

Expected: filtering precedes sorting, pagination remains valid, actions do not navigate or reset unrelated state, headers expose their sort state, and the table does not introduce a new network request.

## Scenario B: Patient list

1. Open `http://localhost:3000/pacientes` with at least one patient.
2. Confirm caption, headers, priority, history indicators and gender icon.
3. Open a profile with a mouse click.
4. Focus a row and activate it with Enter and Space.
5. Search for a non-existent patient and clear the search.

Expected: the row and its real link do not double-trigger navigation; empty states remain informative.

## Scenario C: Consultation history

1. Open a patient profile with at least one diet or assessment.
2. Confirm the history table caption and five visible headers.
3. Expand and collapse a consultation row with the icon button.
4. Open the consultation, view the diet and edit the assessment where available.
5. Open a patient with no history.

Expected: only the selected date expands, actions remain independent, details stay associated with the row, and the empty state is announced.
