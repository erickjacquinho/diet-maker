# Tasks: Refatoração, Componentização e Padrões de Composição Vercel

**Feature Directory**: `specs/07-08-26-refatoracao-composicao-codigo-limpo`
**Plan**: [plan.md](file:///c:/Programmer/diet-maker/specs/07-08-26-refatoracao-composicao-codigo-limpo/plan.md)
**Spec**: [spec.md](file:///c:/Programmer/diet-maker/specs/07-08-26-refatoracao-composicao-codigo-limpo/spec.md)

---

## Phase 1: Setup & Foundational Preparation

- [x] T001 [skill: general] Configuração e validação do ambiente de refatoração em `src/` e `tests/`
- [x] T002 [skill: vercel-composition-patterns] [P] Estabelecer os utilitários de contexto base para Compound Components em `src/components/ui/composition-context.tsx`

---

## Phase 2: User Story 1 (P1) - Decomposição Modular das Páginas e Views Monolíticas

**Goal**: Reduzir todas as páginas extensas de `src/app` para <250 linhas, extraindo hooks de orquestração de estado e subcomponentes de layout.
**Independent Test**: Execução de `npm test` e navegação funcional entre perfil, alimentos e construtor de dietas.

- [x] T003 [skill: vercel-composition-patterns] [US1] Criar custom hook de orquestração de estado `src/hooks/useDietBuilderPage.ts` para desonerar a página principal
- [x] T004 [skill: vercel-composition-patterns] [US1] Decompor a página do construtor de dietas [`src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`](file:///c:/Programmer/diet-maker/src/app/pacientes/%5Bid%5D/dieta/%5BdietaId%5D/page.tsx) em subcomponentes compostos `<DietBuilderHeader>`, `<DietBuilderMealList>`, e `<DietBuilderSummaryFooter>`
- [x] T005 [skill: vercel-composition-patterns] [US1] Extrair hook de busca de alimentos e filtros `src/hooks/useFoodSearchPage.ts`
- [x] T006 [skill: vercel-composition-patterns] [US1] Decompor a página de alimentos [`src/app/alimentos/page.tsx`](file:///c:/Programmer/diet-maker/src/app/alimentos/page.tsx) em compostos `<FoodTableSection>` e `<FoodFilterSection>`
- [x] T007 [skill: vercel-composition-patterns] [US1] Extrair hook do perfil do paciente `src/hooks/usePatientProfilePage.ts`
- [x] T008 [skill: vercel-composition-patterns] [US1] Decompor a página do perfil do paciente [`src/app/pacientes/[id]/page.tsx`](file:///c:/Programmer/diet-maker/src/app/pacientes/%5Bid%5D/page.tsx) em compostos de abas e visões
- [x] T009 [skill: vercel-composition-patterns] [US1] Decompor a página do Showcase de Design System [`src/app/design-system/components/DesignSystemShowcase.tsx`](file:///c:/Programmer/diet-maker/src/app/design-system/components/DesignSystemShowcase.tsx) em seções modulares por categoria de componentes
- [x] T010 [skill: vercel-composition-patterns] [US1] Decompor a página de consulta [`src/app/pacientes/[id]/consulta/[date]/page.tsx`](file:///c:/Programmer/diet-maker/src/app/pacientes/%5Bid%5D/consulta/%5Bdate%5D/page.tsx)
- [x] T011 [skill: vercel-composition-patterns] [US1] Refatorar páginas secundárias [`src/app/presets/page.tsx`](file:///c:/Programmer/diet-maker/src/app/presets/page.tsx), [`src/app/refeicoes-prontas/page.tsx`](file:///c:/Programmer/diet-maker/src/app/refeicoes-prontas/page.tsx), [`src/app/pacientes/page.tsx`](file:///c:/Programmer/diet-maker/src/app/pacientes/page.tsx) e [`src/app/receitas/page.tsx`](file:///c:/Programmer/diet-maker/src/app/receitas/page.tsx)

---

## Phase 3: User Story 2 (P1) - Aplicação dos Vercel Composition Patterns nos Componentes & Modais

**Goal**: Eliminar proliferação de boolean props e reestruturar modais e organismos complexos em Compound Components com contexto encapsulado.
**Independent Test**: Modais e tabelas aceitam composição limpa e passam na verificação de tipos e z-index contract.

- [x] T012 [skill: vercel-composition-patterns] [US2] Refatorar modal complexo [`EditAssessmentModal.tsx`](file:///c:/Programmer/diet-maker/src/components/molecules/EditAssessmentModal.tsx) aplicando Compound Component (`AssessmentModal.Header`, `AssessmentModal.Form`, `AssessmentModal.Actions`)
- [x] T013 [skill: shadcn] [US2] Modularizar o componente de barra lateral [`sidebar.tsx`](file:///c:/Programmer/diet-maker/src/components/ui/sidebar.tsx) separando primitivos de estrutura
- [x] T014 [skill: vercel-composition-patterns] [US2] Refatorar a tabela de histórico [`PatientConsultationHistoryTable.tsx`](file:///c:/Programmer/diet-maker/src/components/organisms/PatientConsultationHistoryTable.tsx) aplicando o padrão `children-over-render-props`
- [x] T015 [skill: vercel-composition-patterns] [US2] Modularizar a navegação da sidebar [`SidebarNav.tsx`](file:///c:/Programmer/diet-maker/src/components/organisms/SidebarNav.tsx)
- [x] T016 [skill: vercel-composition-patterns] [US2] Modularizar o cabeçalho contextual [`PatientProfileHeader.tsx`](file:///c:/Programmer/diet-maker/src/components/organisms/PatientProfileHeader.tsx)
- [x] T017 [skill: vercel-composition-patterns] [US2] Refatorar modal de busca de alimentos [`FoodSearchModal.tsx`](file:///c:/Programmer/diet-maker/src/components/molecules/FoodSearchModal.tsx)
- [x] T018 [skill: vercel-composition-patterns] [US2] Refatorar o template do construtor de dietas [`DietBuilderTemplate.tsx`](file:///c:/Programmer/diet-maker/src/components/templates/DietBuilderTemplate.tsx)
- [x] T019 [skill: vercel-composition-patterns] [US2] Refatorar tabela de pacientes [`PatientListTable.tsx`](file:///c:/Programmer/diet-maker/src/components/organisms/PatientListTable.tsx)
- [x] T020 [skill: vercel-composition-patterns] [US2] Refatorar modais e componentes restantes em `src/components/molecules` e `src/components/ui` (`CustomFoodModal`, `calendar.tsx`, `dropdown-menu.tsx`, `MealCardContainer`, `select.tsx`, `DietModeSwitcher`, `ReadOnlyDietModal`, `EditPatientModal`, `sheet.tsx`, `CreatePresetModal`, `CreatePatientModal`, `MealItemRow`, `NextEventModal`, `DatePickerField`, `dialog.tsx`, `table.tsx`, `MetricBox`, `breadcrumb.tsx`, `AutoKcalSection`)

---

## Phase 4: User Story 3 (P2) - Modularização das Stores de Estado e Seletores

**Goal**: Desacoplar stores Zustand monolíticas usando Slice Pattern e extrair seletores memoizados.
**Independent Test**: Testes de unidade em `src/lib/__tests__` continuam passando 100%.

- [x] T021 [skill: general] [US3] Decompor a store [`patientsStore.ts`](file:///c:/Programmer/diet-maker/src/lib/patientsStore.ts) em slices `patientProfileSlice.ts`, `patientAssessmentSlice.ts` e `patientConsultationSlice.ts`
- [x] T022 [skill: general] [US3] Modularizar utilitários e filtros da lista de pacientes [`patientListView.ts`](file:///c:/Programmer/diet-maker/src/lib/patientListView.ts)
- [x] T023 [skill: general] [US3] Refatorar a store de dietas [`dietStore.ts`](file:///c:/Programmer/diet-maker/src/lib/dietStore.ts) isolando seletores de cálculo nutricional
- [x] T024 [skill: general] [US3] Refatorar as stores secundárias [`tacoStore.ts`](file:///c:/Programmer/diet-maker/src/lib/tacoStore.ts), [`recipesStore.ts`](file:///c:/Programmer/diet-maker/src/lib/recipesStore.ts) e seletores [`patientProfileSelectors.ts`](file:///c:/Programmer/diet-maker/src/lib/patientProfileSelectors.ts)

---

## Phase 5: User Story 4 (P3) - Reorganização e Limpeza dos Testes Automatizados e Scripts

**Goal**: Eliminar duplicação de dados simulados em testes e consolidar utilitários de auditoria.
**Independent Test**: Execução limpa e acelerada de `npm test` e scripts Node.

- [x] T025 [skill: tdd] [US4] Extrair construtores de fixtures para `tests/fixtures/patient-fixtures.ts` e refatorar [`component-catalog.test.mjs`](file:///c:/Programmer/diet-maker/tests/design-system/component-catalog.test.mjs)
- [x] T026 [skill: tdd] [US4] Refatorar testes unitários de stores [`patientsStore.test.ts`](file:///c:/Programmer/diet-maker/src/lib/__tests__/patientsStore.test.ts) e contratos de overlays [`overlay-layer-contract.test.tsx`](file:///c:/Programmer/diet-maker/tests/components/ui/overlay-layer-contract.test.tsx)
- [x] T027 [skill: tdd] [US4] Refatorar a suíte restante em `tests/` (`patient-list-view.test.ts`, `diet-builder-template.test.tsx`, `page-context-navigation.test.tsx`, `edit-assessment-modal.test.tsx`, `z-index-contract.test.ts`, `sidebar.test.tsx`)
- [x] T028 [skill: general] [US4] Refatorar scripts de automação [`verify-design-system-components.mjs`](file:///c:/Programmer/diet-maker/scripts/verify-design-system-components.mjs), [`audit-z-index.mjs`](file:///c:/Programmer/diet-maker/scripts/audit-z-index.mjs), [`audit-atomic-design.mjs`](file:///c:/Programmer/diet-maker/scripts/audit-atomic-design.mjs) e [`capture-design-system-baseline.mjs`](file:///c:/Programmer/diet-maker/scripts/capture-design-system-baseline.mjs) extraindo biblioteca comum de parsing `scripts/utils/ast-helpers.mjs`

---

## Phase 6: Polish & Verification

- [x] T029 [skill: general] Executar compilação TypeScript completa (`npx tsc --noEmit`)
- [x] T030 [skill: tdd] Executar suíte completa de testes unitários e de integração (`npm test`)
- [x] T031 [skill: general] Executar auditorias de z-index e catálogo de componentes para confirmar 0 regressões visuais
