# Tasks: Preset Backdrop Confirmation & Patient Multiplicative Macro Recalculation

**Input**: Design documents from `/specs/29-07-26-em-presets-adicione-popup-de/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Grouped by user story to enable independent implementation and testing.

## Format: `[ID] [skill: name] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 [skill: general] Verify project structure and test setup in `src/lib/__tests__/presetUtils.test.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T002 [skill: general] Implement `resolvePresetForPatient` utility in `src/lib/presetUtils.ts` to calculate macro grams and target calories for patients using multiplicative (`g/kg`) or absolute (`g`) values
- [x] T003 [skill: tdd] [P] Add unit tests for `resolvePresetForPatient` in `src/lib/__tests__/presetUtils.test.ts` verifying exact calculations for absolute and multiplicative macros

---

## Phase 3: User Story 1 - Confirmação ao Clicar Fora do Popup de Preset (Priority: P1) 🎯 MVP

**Goal**: Exibir popup de confirmação ao clicar no backdrop (fora do modal) em `/presets` para impedir perda acidental de dados do formulário.

**Independent Test**: Abrir modal de criação de preset em `/presets`, preencher dados e clicar fora. Confirmar que o dialog secundário "Deseja descartar as alterações?" é exibido e respeita a escolha do usuário.

### Implementation for User Story 1

- [x] T004 [skill: frontend-design] [US1] Add confirmation state (`isConfirmDiscardOpen`) and backdrop click handler (`onInteractOutside`) in `src/app/presets/page.tsx`
- [x] T005 [skill: frontend-design] [US1] Add secondary confirmation Dialog component ("Deseja descartar as alterações?") in `src/app/presets/page.tsx` with "Descartar Alterações" and "Continuar Editando" options

---

## Phase 4: User Story 2 - Recálculo de Macros Multiplicativos por Dados do Paciente (Priority: P1)

**Goal**: Garantir que quando presets com opções multiplicativas (`g/kg`) forem carregados para um paciente, as gramas e calorias sejam calculadas dinamicamente com base no peso real do paciente.

**Independent Test**: Invocar `resolvePresetForPatient` ou carregar o preset com um peso de paciente específico e validar que a meta final de calorias e macros reflete `g/kg × peso_do_paciente`.

### Implementation for User Story 2

- [x] T006 [skill: general] [US2] Update preset application/loading logic to invoke `resolvePresetForPatient` whenever a preset is selected/applied to a patient with known weight
- [x] T007 [skill: frontend-design] [P] [US2] Verify preset summary rendering in `/presets` page for multiplicative macro badges

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T008 [skill: tdd] Run automated unit test suite `npm test src/lib/__tests__/presetUtils.test.ts` to verify zero regressions
- [x] T009 [skill: general] Run quickstart validation scenarios
