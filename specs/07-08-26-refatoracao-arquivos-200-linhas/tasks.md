# Tasks: Refatoração, Componentização e Limpeza de Código (>200 Linhas)

**Feature**: Refatoração, Componentização e Limpeza de Código (>200 Linhas)
**Spec**: [spec.md](file:///c:/Programmer/diet-maker/specs/07-08-26-refatoracao-arquivos-200-linhas/spec.md)
**Plan**: [plan.md](file:///c:/Programmer/diet-maker/specs/07-08-26-refatoracao-arquivos-200-linhas/plan.md)

## Task Summary

Total de tarefas: 24 tarefas organizadas por fases independentes e atribuídas com as skills especializadas do projeto.

---

## Phase 1: Setup & Preparação da Estrutura

- [X] T001 [skill: vercel-composition-patterns] Validar inventário e contagem inicial de linhas nos 20 arquivos em `src/`
- [X] T002 [skill: vercel-composition-patterns] Criar diretórios para recebimento dos subcomponentes extraídos sob `src/components/molecules/assessment/`, `src/components/organisms/diet/` e `src/app/design-system/components/sections/`

---

## Phase 2: User Story 1 - Decomposição de Páginas, Organisms e Modais (P1)

- [X] T003 [P] [US1] [skill: vercel-composition-patterns] Refatorar e decompor [`DesignSystemShowcase.tsx`](file:///c:/Programmer/diet-maker/src/app/design-system/components/DesignSystemShowcase.tsx) (567 L) extraindo seções para `sections/`
- [X] T004 [P] [US1] [skill: vercel-composition-patterns] Refatorar [`EditAssessmentModal.tsx`](file:///c:/Programmer/diet-maker/src/components/molecules/EditAssessmentModal.tsx) (410 L) extraindo sub-formulários sob `assessment/`
- [X] T005 [P] [US1] [skill: vercel-composition-patterns] Refatorar [`sidebar.tsx`](file:///c:/Programmer/diet-maker/src/components/ui/sidebar.tsx) (380 L) extraindo subcomponentes utilitários internos
- [X] T006 [P] [US1] [skill: vercel-composition-patterns] Refatorar [`src/app/pacientes/[id]/consulta/[date]/page.tsx`](file:///c:/Programmer/diet-maker/src/app/pacientes/[id]/consulta/[date]/page.tsx) (366 L) extraindo subviews da consulta
- [X] T007 [P] [US1] [skill: vercel-composition-patterns] Refatorar [`PatientConsultationHistoryTable.tsx`](file:///c:/Programmer/diet-maker/src/components/organisms/PatientConsultationHistoryTable.tsx) (292 L) extraindo `ConsultationRow` e `ConsultationActionsMenu`
- [X] T008 [P] [US1] [skill: vercel-composition-patterns] Refatorar [`DietBuilderTemplate.tsx`](file:///c:/Programmer/diet-maker/src/components/templates/DietBuilderTemplate.tsx) (286 L) aplicando slots compostos de cabeçalho e resumo
- [X] T009 [P] [US1] [skill: vercel-composition-patterns] Refatorar [`SidebarNav.tsx`](file:///c:/Programmer/diet-maker/src/components/organisms/SidebarNav.tsx) (279 L) convertendo para Compound Components (`SidebarNav.Group`, `SidebarNav.Item`)
- [X] T010 [P] [US1] [skill: vercel-composition-patterns] Refatorar [`FoodTableSection.tsx`](file:///c:/Programmer/diet-maker/src/components/organisms/foods/FoodTableSection.tsx) (233 L) extraindo `FoodTableRow` e paginador
- [X] T011 [P] [US1] [skill: vercel-composition-patterns] Refatorar [`PatientProfileHeader.tsx`](file:///c:/Programmer/diet-maker/src/components/organisms/PatientProfileHeader.tsx) (227 L) extraindo estatísticas rápidas e avatar
- [X] T012 [P] [US1] [skill: vercel-composition-patterns] Refatorar [`FoodSearchModal.tsx`](file:///c:/Programmer/diet-maker/src/components/molecules/FoodSearchModal.tsx) (215 L) extraindo subcomponentes da busca
- [X] T013 [P] [US1] [skill: vercel-composition-patterns] Refatorar [`src/app/pacientes/[id]/page.tsx`](file:///c:/Programmer/diet-maker/src/app/pacientes/[id]/page.tsx) (208 L) extraindo abas do perfil do paciente
- [X] T014 [P] [US1] [skill: vercel-composition-patterns] Refatorar [`PatientListTable.tsx`](file:///c:/Programmer/diet-maker/src/components/organisms/PatientListTable.tsx) (207 L) extraindo `PatientTableRow`
- [X] T015 [P] [US1] [skill: vercel-composition-patterns] Refatorar [`CustomFoodModal.tsx`](file:///c:/Programmer/diet-maker/src/components/molecules/CustomFoodModal.tsx) (206 L) extraindo grid de nutrientes
- [X] T016 [P] [US1] [skill: vercel-composition-patterns] Refatorar [`src/app/presets/page.tsx`](file:///c:/Programmer/diet-maker/src/app/presets/page.tsx) (202 L) extraindo grid de presets
- [X] T017 [P] [US1] [skill: vercel-composition-patterns] Refatorar [`calendar.tsx`](file:///c:/Programmer/diet-maker/src/components/ui/calendar.tsx) (201 L) simplificando estilizações internas
- [X] T018 [P] [US1] [skill: vercel-composition-patterns] Refatorar [`src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`](file:///c:/Programmer/diet-maker/src/app/pacientes/[id]/dieta/[dietaId]/page.tsx) (200 L) extraindo acordeão de refeições

---

## Phase 3: User Story 2 - Modularização de Custom Hooks e Stores (P2)

- [X] T019 [P] [US2] [skill: frontend-architecture-mindset] Desacoplar [`useDietBuilderPage.ts`](file:///c:/Programmer/diet-maker/src/hooks/useDietBuilderPage.ts) (471 L) em `useDietCalculations.ts` e `useMealActions.ts`
- [X] T020 [P] [US2] [skill: frontend-architecture-mindset] Modularizar [`patientsStore.ts`](file:///c:/Programmer/diet-maker/src/lib/patientsStore.ts) (385 L) em slices coesos
- [X] T021 [P] [US2] [skill: frontend-architecture-mindset] Extrair utilitários puros de [`patientListView.ts`](file:///c:/Programmer/diet-maker/src/lib/patientListView.ts) (348 L)
- [X] T022 [P] [US2] [skill: frontend-architecture-mindset] Modularizar [`dietStore.ts`](file:///c:/Programmer/diet-maker/src/lib/dietStore.ts) (205 L) extraindo funções puras de macronutrientes

---

## Phase 4: Polish & Validação Global

- [X] T023 [skill: general] Executar script de validação de contagem de linhas e confirmar que nenhum arquivo fonte em `src/` ultrapassa 200 linhas
- [ ] T024 [skill: general] Executar a suíte de testes (`npm run test`) e build (`npm run build`) para garantir zero regressões

---

## Dependency Graph & Order

1. **Phase 1 (Setup)** → Desbloqueia todas as refatorações paralelas da Phase 2 e Phase 3.
2. **Phase 2 & Phase 3 (US1 & US2)** → Podem ser executadas em paralelo por arquivo/módulo.
3. **Phase 4 (Validação Global)** → Depende da conclusão de todas as refatorações.
