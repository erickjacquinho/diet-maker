# Tasks: Correção Universal de Cálculo de Calorias a partir de Macros

**Input**: Design documents from `specs/30-07-26-correcao-de-todos-os-calculos/`

**Prerequisites**: plan.md (required), spec.md (required)

## Phase 1: Setup

- [x] T001 [skill: vercel-composition-patterns] Auditoria de todos os componentes com entrada/exibição de Kcal e Macros em `src/components/` e `src/app/`

---

## Phase 2: Foundational

- [x] T002 [skill: backend-patterns] Garantir que `calculatePresetCalories(proteinG, carbsG, fatsG)` em `src/lib/presetUtils.ts` é a única fonte da verdade matemática de calorias ($4 \text{Prot} + 4 \text{Carb} + 9 \text{Gord}$)

---

## Phase 3: User Story 1 - Padronização do Cálculo Calórico Automático (Priority: P1) 🎯 MVP

**Goal**: Garantir que todos os cartões de refeição, modais e formulários reculem e exibam a caloria exata derivada de macronutrientes.

**Independent Test**: Modificar valores de macros em qualquer card/modal e verificar se o Kcal é recalculado instantaneamente.

- [x] T003 [P] [US1] [skill: tdd] Criar testes em `src/components/molecules/__tests__/AutoKcalSection.test.tsx` para cobrir recalculação automática e arredondamento
- [x] T004 [P] [US1] [skill: vercel-composition-patterns] Refatorar formulário de criação de pacientes em `src/app/pacientes/page.tsx` para derivar calorias do componente `AutoKcalSection`
- [x] T005 [P] [US1] [skill: vercel-composition-patterns] Refatorar modal de edição de paciente em `src/app/pacientes/[id]/page.tsx` para utilizar `AutoKcalSection`
- [x] T006 [P] [US1] [skill: vercel-composition-patterns] Atualizar exibição de calorias nos cards de refeição em `src/components/organisms/MealCardContainer.tsx` e `src/components/molecules/MealItemRow.tsx` para derivar calorias de macronutrientes do item
- [x] T007 [P] [US1] [skill: vercel-composition-patterns] Atualizar o modal de leitura de dieta em `src/components/molecules/ReadOnlyDietModal.tsx` para garantir sincronia calórica nos resumos das refeições

---

## Phase 4: User Story 2 - Composição de Componentes sem Proliferação de Booleans (Priority: P2)

**Goal**: Estruturar componentes de macro/kcal seguindo os princípios de `vercel-composition-patterns`.

- [x] T008 [P] [US2] [skill: vercel-composition-patterns] Refatorar o componente `AutoKcalSection.tsx` em `src/components/molecules/AutoKcalSection.tsx` garantindo interface desacoplada e sem boolean props
- [x] T009 [P] [US2] [skill: vercel-composition-patterns] Validar reusabilidade do componente no criador de presets em `src/app/presets/page.tsx`

---

## Phase 5: Verification & Polish

- [x] T010 [skill: webapp-testing] Executar suíte completa de testes unitários com Vitest (`npm test`) e checagem de tipos com TypeScript (`npx tsc --noEmit`)
