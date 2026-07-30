# Tasks: Módulo de Receitas Culinárias

**Input**: Design documents from `specs/30-07-26-criacao-do-modulo-de-receitas/`

**Prerequisites**: plan.md (required), spec.md (required)

## Phase 1: Setup

- [x] T001 [skill: backend-architect-ddd] Criar arquivo de modelo e armazenamento local em `src/lib/recipesStore.ts` com funções `getRecipesFromStorage`, `saveRecipeToStorage`, `deleteRecipeFromStorage` e cálculo por porção.

---

## Phase 2: Foundational

- [x] T002 [skill: vercel-composition-patterns] Criar componente de linha de ingrediente em `src/components/molecules/RecipeIngredientRow.tsx` para exibição e ajuste de quantidade de alimentos da TACO na receita.

---

## Phase 3: User Story 1 - Catálogo e Criação de Receitas Culinárias (Priority: P1) 🎯 MVP

**Goal**: Permitir montar receitas com ingredientes da TACO, rendimento de porções, modo de preparo e cálculo automático por porção.

- [x] T003 [P] [US1] [skill: tdd] Criar testes unitários em `src/lib/__tests__/recipesStore.test.ts` para validação de divisão proporcional de macronutrientes por porção.
- [x] T004 [P] [US1] [skill: vercel-composition-patterns] Criar o componente de cartão de receita em `src/components/molecules/RecipeCard.tsx` exibindo foto/ícone, tempo de preparo, rendimento e macros por porção.
- [x] T005 [US1] [skill: vercel-composition-patterns] Criar a página da rota em `src/app/receitas/page.tsx` com catálogo em grid, busca por palavra-chave, modal de criação/edição integrando a busca da TACO e o componente `AutoKcalSection`.

---

## Phase 4: User Story 2 - Navegação e Acesso Centralizado às Receitas (Priority: P2)

**Goal**: Adicionar atalho para o novo módulo no menu lateral da aplicação.

- [x] T006 [P] [US2] [skill: vercel-composition-patterns] Atualizar o componente de navegação em `src/components/organisms/SidebarNav.tsx` adicionando a rota `/receitas` com o rótulo "Receitas Culinárias" e ícone `Utensils`.

---

## Phase 5: User Story 3 - Inserção de Receitas nos Planos Alimentares (Priority: P3)

**Goal**: Permitir selecionar receitas do catálogo e inseri-las diretamente na elaboração da dieta de um paciente.

- [x] T007 [P] [US3] [skill: vercel-composition-patterns] Atualizar a busca de alimentos na montagem de dietas (`src/components/molecules/TacoSearchInput.tsx` / `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`) para incluir atalho de inserção de porção de receita cadastrada.

---

## Phase 6: Verification & Polish

- [x] T008 [skill: webapp-testing] Executar suíte de testes (`npm test`) e verificação de tipagem TypeScript (`npx tsc --noEmit`).
