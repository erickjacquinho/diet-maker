# Tasks: Padronização e Centralização de Dropdowns e Listas

**Input**: Design documents from `specs/19-08-26-padronizacao-dropdowns-e-listas/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

## Format: `[TaskID] [skill: $skill-name] [P?] [Story?] Description`

- **[skill: ...]**: Specialized skill assigned to the task
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3])
- Includes exact file paths in descriptions

---

## Phase 1: Setup & Primitives

**Purpose**: Definição de tipos compartilhados e ajuste dos primitivos base

- [x] T001 [skill: frontend-architecture-mindset] [P] Create and export SelectOption types in src/components/atoms/select-field-types.ts
- [x] T002 [skill: shadcn] [P] Verify and refine base Radix primitive wrappers in src/components/ui/select.tsx and src/components/ui/dropdown-menu.tsx

---

## Phase 2: Foundational (Componentes Pai Padronizados)

**Purpose**: Implementação dos componentes pai centralizados que bloqueiam a migração das telas

**⚠️ CRITICAL**: A migração dos formulários e templates depende da conclusão desta fase

- [x] T003 [skill: tdd] [P] Create unit tests for SelectField in tests/components/atoms/SelectField.test.tsx
- [x] T004 [skill: shadcn] Implement standardized parent component SelectField in src/components/atoms/SelectField.tsx
- [x] T005 [skill: frontend-architecture-mindset] Export SelectField in src/components/atoms/index.ts and src/components/molecules/index.ts
- [x] T006 [skill: tdd] [P] Create unit tests for ActionDropdown in tests/components/molecules/ActionDropdown.test.tsx
- [x] T007 [skill: shadcn] Implement standardized parent component ActionDropdown in src/components/molecules/ActionDropdown.tsx
- [x] T008 [skill: frontend-architecture-mindset] Export ActionDropdown in src/components/molecules/index.ts

**Checkpoint**: Componentes pai padronizados implementados e testados com cobertura unitária.

---

## Phase 3: User Story 1 - Seleção Consistente em Formulários e Modais Clínicos (Priority: P1) 🎯 MVP

**Goal**: Migrar todos os dropdowns/selects de formulários clínicos e administrativos para o componente pai `SelectField`

**Independent Test**: Abrir cada um dos 7 modais e o cabeçalho de filtros, validando renderização, seleção por clique/teclado e fechamento determinístico

- [x] T009 [skill: shadcn] [P] [US1] Migrate CreatePatientModal to use SelectField in src/components/molecules/CreatePatientModal.tsx
- [x] T010 [skill: shadcn] [P] [US1] Migrate EditPatientModal to use SelectField in src/components/molecules/EditPatientModal.tsx
- [x] T011 [skill: shadcn] [P] [US1] Migrate CreatePresetModal to use SelectField in src/components/molecules/CreatePresetModal.tsx
- [x] T012 [skill: shadcn] [P] [US1] Migrate CustomFoodModal to use SelectField in src/components/molecules/CustomFoodModal.tsx
- [x] T013 [skill: shadcn] [P] [US1] Migrate NextEventModal to use SelectField in src/components/molecules/NextEventModal.tsx
- [x] T014 [skill: shadcn] [P] [US1] Migrate CopyVariationModal to use SelectField in src/components/molecules/CopyVariationModal.tsx
- [x] T015 [skill: shadcn] [P] [US1] Migrate FoodFilterHeader to use SelectField in src/components/organisms/foods/FoodFilterHeader.tsx
- [x] T016 [skill: tdd] [US1] Verify and run regression tests for all migrated modal and filter forms with npm test

**Checkpoint**: Todos os formulários clínicos e filtros operam sobre o componente pai padronizado.

---

## Phase 4: User Story 2 - Menus de Ações e Listas de Opções Padronizadas (Priority: P2)

**Goal**: Centralizar menus de ação suspensa no componente pai `ActionDropdown`

**Independent Test**: Abrir o menu "Mais ações" na tela de elaboração de dieta e disparar as ações de WhatsApp e PDF com sucesso

- [x] T017 [skill: shadcn] [US2] Migrate header action dropdown in DietBuilderTemplate to use ActionDropdown in src/components/templates/DietBuilderTemplate.tsx
- [x] T018 [skill: tdd] [US2] Add integration test for DietBuilderTemplate action dropdown in tests/components/templates/DietBuilderTemplate.test.tsx

**Checkpoint**: Menus contextuais e ações de workflow padronizados.

---

## Phase 5: User Story 3 - Eliminação de Estilos Hardcoded e Listas Descentralizadas (Priority: P3)

**Goal**: Eliminar listas inline flutuantes e auditar ausência total de hardcode de estilos

**Independent Test**: Inspeção estática de código e catálogo do design system validando zero `style={{ ... }}` e zero listas soltas

- [x] T019 [skill: shadcn] [US3] Refactor category selection and remove inline search dropdown in CreateRecipeModal in src/components/molecules/CreateRecipeModal.tsx
- [x] T020 [skill: ui-ux-pro-max] [US3] Update Design System Showcase component catalog and spec grid in src/app/design-system/components/sections/ComponentSpecGrid.tsx
- [x] T021 [skill: code-reviewer-expert] [US3] Perform static audit across src/ to ensure zero hardcoded inline styles (style={{ ... }}) and zero ad-hoc list dropdowns exist

**Checkpoint**: Base de código 100% livre de estilos inline de dropdown e de listas descentralizadas.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificação final integrada, cobertura de testes e validação do quickstart

- [x] T022 [skill: general] Run full project test suite and typecheck with npm test and npm run typecheck
- [x] T023 [skill: general] Execute quickstart.md validation checklist in specs/19-08-26-padronizacao-dropdowns-e-listas/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup & Primitives (Phase 1)**: Sem dependências.
- **Foundational (Phase 2)**: Depende da Fase 1 - BLOQUEIA todas as histórias de usuário.
- **User Story 1 (Phase 3)**: Depende da Fase 2 - Pode ser executada em paralelo após a Fase 2.
- **User Story 2 (Phase 4)**: Depende da Fase 2.
- **User Story 3 (Phase 5)**: Depende das Fases 2 e 3.
- **Polish (Phase 6)**: Depende da conclusão de todas as fases anteriores.

### Parallel Opportunities

- `T001` e `T002` podem rodar em paralelo.
- `T003` e `T006` (testes unitários dos novos componentes) podem rodar em paralelo.
- `T009` a `T015` (migração de cada modal) modificam arquivos independentes e podem rodar em paralelo.

---

## Implementation Strategy

### MVP First (User Story 1)

1. Concluir Fase 1 (Setup) e Fase 2 (Foundational: `SelectField` e `ActionDropdown`).
2. Executar Fase 3 (User Story 1: Migração dos 7 modais e filtros para `SelectField`).
3. Validar regressão com `npm test`.

### Incremental Delivery

1. Fase 1 + Fase 2: Fundações padronizadas prontas.
2. Fase 3: Formulários e modais padronizados (MVP).
3. Fase 4: Menus de ação padronizados.
4. Fase 5: Eliminação de listas ad-hoc e validação no showcase.
5. Fase 6: Validação global de testes e tipagem.
