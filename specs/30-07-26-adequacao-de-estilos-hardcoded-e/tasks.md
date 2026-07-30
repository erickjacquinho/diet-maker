# Tasks: Adequação de Estilos Hardcoded e Arquitetura de Componentes em src/app

**Feature**: Adequação de Estilos Hardcoded e Arquitetura de Componentes
**Plan**: [plan.md](./plan.md)
**Spec**: [spec.md](./spec.md)

## Phase 1: Setup & Auditoria de Tokens

- [ ] T001 [skill: vercel-composition-patterns] Mapear utilitários semânticos no Design System e em `src/app/globals.css` para substituição de cores e tamanhos brutas em [src/app/globals.css](file:///c:/Programmer/diet-maker/src/app/globals.css)

## Phase 2: Foundational Components (Atomic Design Level 2 & 3)

- [ ] T002 [P] [skill: shadcn] Extrair modal de cadastro e edição de alimentos customizados de `src/app/alimentos/page.tsx` para componente reutilizável em [src/components/molecules/CustomFoodModal.tsx](file:///c:/Programmer/diet-maker/src/components/molecules/CustomFoodModal.tsx)
- [ ] T003 [P] [skill: shadcn] Extrair modal de cadastro de paciente de `src/app/pacientes/page.tsx` para componente reutilizável em [src/components/molecules/CreatePatientModal.tsx](file:///c:/Programmer/diet-maker/src/components/molecules/CreatePatientModal.tsx)
- [ ] T004 [P] [skill: shadcn] Extrair modais de edição de paciente e avaliação física de `src/app/pacientes/[id]/page.tsx` para componentes reutilizáveis em [src/components/molecules/EditPatientModal.tsx](file:///c:/Programmer/diet-maker/src/components/molecules/EditPatientModal.tsx) e [src/components/molecules/EditAssessmentModal.tsx](file:///c:/Programmer/diet-maker/src/components/molecules/EditAssessmentModal.tsx)
- [ ] T005 [P] [skill: shadcn] Extrair modais de criação de preset e descarte em `src/app/presets/page.tsx` para componente em [src/components/molecules/CreatePresetModal.tsx](file:///c:/Programmer/diet-maker/src/components/molecules/CreatePresetModal.tsx)
- [ ] T006 [P] [skill: shadcn] Extrair modal de receitas em `src/app/receitas/page.tsx` para componente em [src/components/molecules/CreateRecipeModal.tsx](file:///c:/Programmer/diet-maker/src/components/molecules/CreateRecipeModal.tsx)
- [ ] T007 [P] [skill: shadcn] Extrair modal de blocos de refeições prontas em `src/app/refeicoes-prontas/page.tsx` para componente em [src/components/molecules/CreateReadyMealModal.tsx](file:///c:/Programmer/diet-maker/src/components/molecules/CreateReadyMealModal.tsx)

## Phase 3: User Story 1 - Elimination of Hardcoded Colors & Arbitrary Sizes in Pages

- [ ] T008 [US1] Refatorar utilitários de cores brutas e tamanhos arbitrários em [src/app/alimentos/page.tsx](file:///c:/Programmer/diet-maker/src/app/alimentos/page.tsx)
- [ ] T009 [US1] Refatorar utilitários de cores brutas e tamanhos arbitrários em [src/app/pacientes/page.tsx](file:///c:/Programmer/diet-maker/src/app/pacientes/page.tsx)
- [ ] T010 [US1] Refatorar utilitários de cores brutas e tamanhos arbitrários em [src/app/pacientes/[id]/page.tsx](file:///c:/Programmer/diet-maker/src/app/pacientes/[id]/page.tsx)
- [ ] T011 [US1] Refatorar utilitários de cores brutas e tamanhos arbitrários em [src/app/pacientes/[id]/consulta/[date]/page.tsx](file:///c:/Programmer/diet-maker/src/app/pacientes/[id]/consulta/[date]/page.tsx)
- [ ] T012 [US1] Refatorar utilitários de cores brutas e tamanhos arbitrários em [src/app/pacientes/[id]/dieta/[dietaId]/page.tsx](file:///c:/Programmer/diet-maker/src/app/pacientes/[id]/dieta/[dietaId]/page.tsx)
- [ ] T013 [US1] Refatorar utilitários de cores brutas e tamanhos arbitrários em [src/app/presets/page.tsx](file:///c:/Programmer/diet-maker/src/app/presets/page.tsx)
- [ ] T014 [US1] Refatorar utilitários de cores brutas e tamanhos arbitrários em [src/app/receitas/page.tsx](file:///c:/Programmer/diet-maker/src/app/receitas/page.tsx)
- [ ] T015 [US1] Refatorar utilitários de cores brutas e tamanhos arbitrários em [src/app/refeicoes-prontas/page.tsx](file:///c:/Programmer/diet-maker/src/app/refeicoes-prontas/page.tsx)
- [ ] T016 [US1] Encapsular previews de tokens dinâmicos mantendo a página limpa em [src/app/design-system/page.tsx](file:///c:/Programmer/diet-maker/src/app/design-system/page.tsx)

## Phase 4: Polish & Build Validation

- [ ] T017 [skill: code-reviewer-expert] Validar compilação limpa do projeto Next.js executando `npm run build`
- [ ] T018 [skill: ui-ux-pro-max] Verificar ausência de regressões visuais ou de responsividade em tela
