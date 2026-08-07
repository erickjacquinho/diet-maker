# Implementation Tasks: Adequação de Componentes Shadcn e Vercel Composition Patterns

**Feature**: Adequação de Componentes Shadcn
**Branch**: `07-08-26-adequacao-componentes-shadcn`
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Phase 1: Foundational & Atom Components (US1)

**Goal**: Refatorar os componentes atom visuais base para compor com primitivas Shadcn UI de forma totalmente compatível.

- [ ] T001 [skill: shadcn] [US1] Refatorar `src/components/atoms/Avatar.tsx` para compor com `@/components/ui/avatar` e `AvatarFallback` em `src/components/atoms/Avatar.tsx`
- [ ] T002 [skill: shadcn] [US1] Refatorar `src/components/atoms/ProgressBar.tsx` para utilizar a primitiva `@/components/ui/progress` em `src/components/atoms/ProgressBar.tsx`
- [ ] T003 [skill: shadcn] [US1] Refatorar `src/components/atoms/FieldTrigger.tsx` para compor com `SelectTrigger` do `@/components/ui/select` em `src/components/atoms/FieldTrigger.tsx`

## Phase 2: Organisms & Tables (US2)

**Goal**: Substituir a tabela HTML nativa por `@/components/ui/table` no histórico de consultas.

- [ ] T004 [skill: shadcn] [US2] Refatorar `PatientConsultationHistoryTable` para utilizar `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` em `src/components/organisms/PatientConsultationHistoryTable.tsx`
- [ ] T005 [skill: shadcn] [US2] Refatorar `MetricBox` e `MetricBoxGroup` para compor com `Card` e `Separator` em `src/components/molecules/MetricBox.tsx` e `src/components/organisms/MetricBoxGroup.tsx`

## Phase 3: Empty States, Badges & Layout Compositions (US3 & US4)

**Goal**: Padronizar mensagens de estado vazio, tags semânticas e simplificação de props.

- [ ] T006 [skill: shadcn] [US3] Substituir caixas de estado vazio com borda tracejada por componentes semânticos em `src/components/organisms/MealCardContainer.tsx` e `src/components/templates/DietBuilderTemplate.tsx`
- [ ] T007 [skill: shadcn] [US3] Padronizar pílulas e tags de macronutrientes com `Badge` semânticos do Shadcn em `src/components/molecules/MealItemRow.tsx` e `src/components/molecules/RecipeIngredientRow.tsx`
- [ ] T008 [skill: vercel-composition-patterns] [US4] Ajustar o layout do `TacoSearchInput` para composição padronizada com ícone de busca em `src/components/molecules/TacoSearchInput.tsx`

## Phase 4: Verification & Polish

**Goal**: Executar validação automatizada e garantir integridade total do design system.

- [ ] T009 [skill: code-reviewer-expert] Executar a suíte de testes unitários `npm run test` e verificar 100% de aprovação sem regressões em `src/components`
