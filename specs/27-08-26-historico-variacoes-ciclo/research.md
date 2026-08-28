# Research: Tabela de variações no histórico de ciclo

## Decision 1: Use variation rows inside the existing expansion

**Decision**: Replace the current card grid with one compact row per historical variation. Keep the parent prescription as the single longitudinal history row.

**Rationale**: The profile history compares prescriptions, while the expanded content explains one prescription's internal variation set. A row-per-variation view grows linearly, preserves a stable row contract, and avoids the wrapping and uneven heights produced by a fixed three-column card grid.

**Alternatives considered**:

- One row per weekday: useful for daily execution, but it repeats the same variation across multiple days and makes the historical variation itself less prominent.
- Seven-column weekday matrix: precise for assignment auditing, but wider and visually heavier than needed for a read-only profile history.
- Keep cards and add more responsive columns: still couples readability to available width and allows the expanded region to become increasingly tall and fragmented.

## Decision 2: Use one comma-separated days column

**Decision**: Format assigned days as one value such as `Ter, Qui`, using canonical weekly order.

**Rationale**: The user selected a single column. The cycle editor already models days from a fixed seven-day domain, so the maximum text remains bounded while the table remains compact and easy to scan. A single text value also prevents day chips from wrapping into additional lines.

**Alternatives considered**:

- Dot-separated labels such as `Ter · Qui`: rejected by the clarified requirement.
- Stacked day labels: conflicts with standard row height.
- Seven dedicated day columns: deferred as a possible future audit view, not required for the profile history.

## Decision 3: Consume normalized historical snapshots

**Decision**: Keep using the existing profile selector output, including the weighted weekly summary and variation snapshots. Do not make the table read storage directly and do not change the persisted diet plan.

**Rationale**: The selector is already the boundary that translates stored full plans into historical records. Reusing it prevents divergent values between the profile summary and its expansion, keeps the organism read-only, and limits the feature to presentation.

**Alternatives considered**:

- Re-read the full plan from storage in the table: duplicates data access and can diverge from the page's already selected history.
- Persist a second presentation schema: unnecessary for a read-only view and increases migration risk.

## Decision 4: Preserve semantic context while keeping the view visually simple

**Decision**: Keep headers or equivalent accessible column context even if the visual treatment is discreet.

**Rationale**: The project data-display contract requires table context, pronounced units, keyboard operation, and non-color meaning. Removing the header entirely would make compactness depend on undocumented column position and weaken assistive-technology comprehension.

## Local sources reviewed

- `src/components/organisms/patient/PatientDietsTable.tsx` — current parent row, expansion state, and card-grid details.
- `src/components/molecules/DataTable.tsx` — canonical table molecule, expansion insertion point, and row/cell composition.
- `src/components/ui/table.tsx` — semantic table primitives and standard header/row token usage.
- `src/lib/patientProfileSelectors.ts` — historical summary and cycle variation normalization.
- `src/lib/patientsStoreTypes.ts` — historical variation fields and read-only snapshot shape.
- `src/lib/dietStore.ts` — canonical day labels and weighted cycle-average behavior.
- `design-system/components/categories/data-display.md` — minimum row height, semantic context, overflow, and accessibility requirements.
- `design-system/components/profiles/molecules/data-table.md` — expansion and controlled table contract.
- `.specify/memory/constitution.md` — atomic design, canonical design system, desktop accessibility, test-first, and SDD gates.
