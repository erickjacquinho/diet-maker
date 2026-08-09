# Implementation Plan: Shadcn DataTable para todas as tabelas

**Branch**: `07-08-26-data-table-shadcn` | **Date**: 2026-08-07 | **Spec**: [spec.md](spec.md)

## Summary

Criar uma molécula `DataTable<TData>` genérica baseada nos primitivos canônicos de `src/components/ui/table.tsx`, migrar todos os consumidores de tabelas de dados identificados no aplicativo, remover o gerenciamento externo de tabelas e preservar os fluxos de alimentos, pacientes e histórico de consultas. A composição compartilhada ficará fora de `src/components/ui` para manter os primitivos Shadcn limpos e será registrada na categoria `data-display` do Design System.

## Technical Context

**Language/Version**: TypeScript 5.7, React 19, Next.js 15 App Router  
**Primary Dependencies**: React, Next.js, Lucide React, Shadcn local primitives, Vitest, Testing Library  
**Removed Dependency**: `@tanstack/react-table` from `package.json`, `package-lock.json` and source imports  
**Storage**: Existing localStorage/in-memory stores; no new persistence or network calls  
**Testing**: Vitest, Testing Library, TypeScript, ESLint, Next build and Design System verifiers  
**Target Platform**: Web desktop, 1024px and wider; mobile/tablet/dark mode out of scope  
**Project Type**: Next.js web application  
**Performance Goals**: Synchronous client-side sort/pagination/expansion for current local data volumes, with no new network work  
**Constraints**: Keep `ui/table.tsx` generic; no domain imports in DataTable; use canonical tokens; no new arbitrary Tailwind values or Hex literals  

## Constitution Check

*Gates evaluated before implementation:* 

- **Atomic Design Architecture**: PASS. `DataTable` is a generic molecule composed from `ui/table`; domain behavior remains in organisms and hooks.
- **Canonical Design System**: PASS with migration work. The implementation must inherit `data-display`, update the new molecule profile/registry, and run strict verifiers.
- **Desktop Scope and Accessibility**: PASS. The plan covers semantic tables, captions, scopes, keyboard operation, visible focus, state announcements and WCAG 2.2 AA at desktop widths.
- **Test-First Quality and Isolation**: PASS. Contract and consumer tests are planned under `tests/`; no global or external data mutation is introduced by the component.
- **Spec-Driven Execution**: PASS. Tasks will be executed only through `/speckit-implement` after human approval.

## Architecture and Design

### Component boundaries

```text
src/components/ui/table.tsx
  -> src/components/molecules/DataTable.tsx
    -> src/components/organisms/foods/FoodTableSection.tsx
    -> src/components/organisms/PatientListTable.tsx
    -> src/components/organisms/PatientConsultationHistoryTable.tsx
```

- `ui/table.tsx` remains the canonical semantic compound family and is not modified for domain behavior.
- `molecules/DataTable.tsx` owns shared table structure, generic typed columns, caption, states, controlled sorting, pagination and expansion hooks.
- `FoodTableSection` owns food column definitions, food callbacks and the page-specific page size.
- `PatientListTable` owns patient headers and composes the existing patient row behavior through the generic row-rendering contract.
- `PatientConsultationHistoryTable` owns expanded-date state and composes the existing consultation row behavior through the generic row-rendering contract.
- `useFoodSearchPage` owns filtering and the generic sort state; it no longer imports a third-party table type.

### Data flow

1. Existing page hooks and stores produce filtered domain rows.
2. Each organism maps its domain data to generic DataTable columns and callbacks.
3. DataTable resolves generic sort values and the visible page, then renders the canonical compound table.
4. Consumer callbacks handle favorite/edit/navigation/expansion actions.
5. No new fetch, persistence, route, or server boundary is introduced.

### Shared API decisions

The API is documented in [data-model.md](data-model.md) and [contracts/data-table.md](contracts/data-table.md). It supports a normal column/cell path and a controlled row-renderer path for existing complex organisms. It does not expose domain-specific props, multi-sort, virtualization, selection, column hiding or server-side pagination.

### Design System integration

- Inherit the stable `data-display` category rather than creating a new category.
- Add `design-system/components/profiles/molecules/data-table.md` with identity, purpose, API, state matrix, accessibility and consumers.
- Add `molecule-data-table` to `design-system/components/registry.json` with source and consumer references.
- Keep `ui-table` profile/source unchanged.

## Project Structure and File Impact

```text
src/components/molecules/DataTable.tsx                         # NEW shared molecule
src/components/molecules/index.ts                              # EXPORT DataTable
src/components/organisms/foods/FoodTableSection.tsx             # MIGRATE consumer
src/components/organisms/foods/useFoodTableColumns.tsx          # REFAC to DataTable column contract
src/hooks/useFoodSearchPage.ts                                  # REFAC sort state type
src/components/organisms/PatientListTable.tsx                   # MIGRATE consumer
src/components/organisms/patient/PatientListTableRow.tsx        # ADAPT row renderer contract
src/components/organisms/PatientConsultationHistoryTable.tsx    # MIGRATE consumer
src/components/organisms/patient/ConsultationHistoryRow.tsx     # ADAPT expanded row contract
package.json                                                     # REMOVE external table dependency
package-lock.json                                                # REMOVE resolved dependency entries
design-system/components/profiles/molecules/data-table.md       # NEW component profile
design-system/components/profiles/organisms/food-table-section.md # NEW consumer profile
design-system/components/registry.json                           # REGISTER molecule and consumers
tests/components/molecules/data-table.test.tsx                   # NEW contract tests
tests/components/organisms/foods/food-table-section.test.tsx     # NEW food flow tests
tests/components/organisms/patient-list-table.test.tsx           # UPDATE regression coverage
tests/app/pacientes/patient-profile-history.test.tsx             # UPDATE expansion coverage
```

No change is planned for `src/components/ui/table.tsx`, the page-level empty cards, storage models or routes.

## Implementation Phases

### Phase 1: Setup and audit

- Verify the active feature anchor and enumerate every table consumer in `src/`.
- Remove the external table dependency using the package manager and confirm lockfile cleanup.
- Capture the baseline behavior and affected tests before changing consumers.

### Phase 2: Foundational DataTable molecule

- Implement the generic typed API from `data-model.md` using only Shadcn table primitives.
- Add sortable headers with keyboard semantics, empty/loading/error/read-only states, stable row IDs, optional pagination and the complex-row/expanded-row hooks.
- Export the molecule and register its profile/consumer mapping.
- Add contract tests for semantics, states, sorting, pagination and expansion.

### Phase 3: Food table migration (US2)

- Replace TanStack column definitions with the DataTable contract.
- Move sorting/pagination behavior to the generic DataTable and replace `SortingState` with the local generic contract.
- Preserve food filtering, favorites, custom-food editing, labels, units and empty state.
- Add focused tests for filters, sort direction, page boundaries and action isolation.

### Phase 4: Patient list migration (US3)

- Replace the manual table shell with DataTable while preserving `PatientListTableRow` behavior.
- Keep the real profile link, row keyboard activation, indicators, priority styling and page-level empty states.
- Extend the existing organism tests to assert the shared DataTable contract and no duplicate navigation.

### Phase 5: Consultation history migration (US4)

- Replace the manual table shell with DataTable while preserving `ConsultationHistoryRow` and its expanded subrow.
- Keep one controlled expanded date, accessible expand/collapse state and independent consultation/diet/assessment actions.
- Extend history and visual tests for table caption, row expansion, action isolation and empty state.

### Phase 6: Polish and verification

- Audit zero external table imports/dependencies and all table consumers.
- Run unit/integration tests, type-check, lint, build, Design System verification and link verification.
- Review tokens, states, keyboard behavior and generated registry/profile consistency.

## Test Plan

### Unit/contract

- Generic DataTable renders caption, header scopes, stable rows and custom cells.
- Empty, loading and error states are announced and occupy the expected table structure.
- Sortable headers toggle direction and expose state; pagination disables invalid controls.
- Row and expanded-row rendering preserve stable keys and inner-action isolation.

### Consumer regression

- Foods: filters, ordering, pagination, favorite/edit callbacks and empty result.
- Patients: semantic headings, indicators, real links, Enter/Space navigation and search states.
- History: date grouping, expansion/recollection, detail actions and no-history state.

### Static/integration

- `rg` returns no `@tanstack/react-table`, `useReactTable` or `react-table` references in tracked source/manifest/lockfile.
- `npm run verify:design-system` accepts the new molecule profile and registry entry while preserving `ui-table` isolation.
- `npm run type-check`, `npm run lint`, `npm run build`, `npm run test` and `npm run verify:links` pass.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Generic API becomes coupled to patient/food concepts | Keep all props generic; add contract tests that reject domain imports and document the molecule boundary. |
| Food sorting/pagination regression after removing TanStack | Add dedicated food tests for each sortable column, page boundary and filter/sort interaction before finishing migration. |
| Row click conflicts with inner actions | Preserve existing stop-propagation behavior and assert callbacks in patient/history tests. |
| Expanded history breaks table semantics | Keep expanded content in a TableRow/TableCell subrow, test caption/row roles and preserve stable date IDs. |
| Design System catalog drifts from code | Update registry/profile in the same task and run strict verifiers before completion. |

## Definition of Done

- All tasks are checked in `tasks.md`.
- All identified data-table consumers use the shared DataTable.
- No external table library remains in manifest, lockfile or source.
- Existing food, patient and consultation flows pass their regression tests.
- Shared component tests and full project quality commands pass.
- Design System profile/registry, tokens and accessibility checks are synchronized.
