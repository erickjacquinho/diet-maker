# Tasks: Compactação do quadro de contexto da dieta

**Input**: Design documents from `/specs/001-compactar-contexto-dieta/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/diet-context-card.md`, `quickstart.md`

**Tests**: Required by the project constitution. Test assertions must precede the corresponding implementation tasks.

**Organization**: Tasks are grouped by user story so the compact context card can be validated independently from the rest of the diet page.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the baseline and confirm the affected boundary before changing the visual composition.

- [ ] T001 Run the baseline checks from `specs/001-compactar-contexto-dieta/quickstart.md` and record pre-existing findings without modifying unrelated files.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create deterministic test coverage for the existing card and mode selector before implementation.

- [ ] T002 [P] Extend `tests/components/templates/diet-builder-template.test.tsx` with assertions scoped to `diet-context-card`: one patient name, one weight value, one `Modelo de dieta` group, and unchanged external header, macro and meal regions.
- [ ] T003 [P] Extend `tests/components/molecules/diet-mode-switcher.test.tsx` with embedded-mode assertions for the concise title, hidden cycle-only controls in simple mode, revealed cycle controls, selected state and arrow-key focus movement.

**Checkpoint**: The desired composition and behavior are testable without changing application source files.

---

## Phase 3: User Story 1 - Identificar o paciente e escolher o modelo da dieta (Priority: P1) 🎯 MVP

**Goal**: Make the single context surface scannable by placing patient identity on the left and diet mode selection on the right without changing any behavior outside the card.

**Independent Test**: Render the template in simple and carb-cycling modes, inspect only `diet-context-card`, and confirm patient identity, mode group, unique weight and keyboard/selected states while all outside regions remain unchanged.

### Implementation for User Story 1

- [ ] T004 [US1] Update the internal two-column composition in `src/components/templates/DietBuilderTemplate.tsx` to preserve one `Surface`, use tokenized spacing, stretch the vertical divider across the card content, and keep the patient region before the diet-mode region in DOM order.
- [ ] T005 [US1] Refine the embedded presentation in `src/components/molecules/DietModeSwitcher.tsx` so the mode title and segmented options stay direct and compact, while conditional variation controls, labels, selection state and keyboard behavior remain unchanged.
- [ ] T006 [US1] Verify the diet context payload in `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx` keeps `patientGoalDescription` objective-only and does not append the patient weight, changing only that field if the implementation exposes duplicated weight inside the card.

**Checkpoint**: The card is visually compact, patient information appears once on the left, diet options remain usable on the right, and the page outside the card is unchanged.

---

## Phase 4: Polish & Cross-Cutting Validation

**Purpose**: Validate visual, accessibility, design-system and regression requirements.

- [ ] T007 Run `npx vitest run tests/components/templates/diet-builder-template.test.tsx tests/components/templates/diet-builder-template.surface.test.tsx tests/components/molecules/diet-mode-switcher.test.tsx`, then run `npm run type-check` and `npm run lint`; fix only regressions caused by this feature in the affected files.
- [ ] T008 [P] Run `npm run verify:design-system-legacy` and `npm run audit:atomic-design`; confirm no new token, layer, arbitrary spacing or primitive-preservation findings are introduced by `src/components/templates/DietBuilderTemplate.tsx`, `src/components/molecules/DietModeSwitcher.tsx` or `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`.
- [ ] T009 [P] Execute the manual scenarios in `specs/001-compactar-contexto-dieta/quickstart.md` at 1024px, 1280px and 1440px for simple mode, carb cycling and long patient content; record evidence that the breadcrumb and all regions outside `diet-context-card` remain unchanged.
- [ ] T010 Perform the final UI/UX review against `specs/001-compactar-contexto-dieta/contracts/diet-context-card.md` and `design-system/components/categories/structure.md`, `data-display.md` and `selection.md`, checking hierarchy, density, focus visibility, readable labels and absence of duplicate patient information.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies; establishes the baseline.
- **Phase 2 (Foundational)**: Depends on T001; creates the failing or incomplete assertions before implementation.
- **Phase 3 (US1)**: Depends on T002 and T003; implements the card after its behavior is testable.
- **Phase 4 (Polish)**: Depends on T004, T005 and T006; validates the completed card and regression boundaries.

### User Story Dependencies

- **US1 (P1)**: Independent after the foundational tests; this is the complete MVP for the requested visual change.

### Parallel Opportunities

- T002 and T003 can run in parallel because they modify different test files.
- T008 and T009 can run in parallel after the implementation tasks because one is automated audit and the other is visual/manual validation.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001–T003.
2. Implement T004–T006.
3. Run T007 and inspect the card in simple mode and carb-cycling mode.
4. Stop for review if the compact context card meets the contract.

### Incremental Delivery

1. Establish the baseline and deterministic assertions.
2. Refine the single surface and its two existing child compositions.
3. Validate behavior and accessibility.
4. Run design-system audits and manual desktop review.

### Required Execution Gate

This task list is documentation only. Implementation must be started through `/speckit-implement` after human validation of the SDD artifacts; do not edit application source files as part of SDD generation.
