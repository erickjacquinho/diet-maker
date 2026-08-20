# Tasks: Adequação e Centralização da Página de Elaboração de Dieta

**Input**: Design documents from `specs/20-08-26-adequar-pagina-dieta-nova/`

**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/`

**Organization**: Tasks are grouped by phase and user story with assigned specialized skills.

---

## Phase 1: Setup & Design Tokens

**Purpose**: Expandir o átomo Badge com as variantes oficiais de macronutrientes para eliminar código duplicado.

- [ ] T001 [skill: design-system] [P] Estender variantes de macronutrientes (`protein`, `carbohydrate`, `fat`, `kcal`) em `src/components/ui/badge.tsx` e `src/components/atoms/Badge.tsx`.
- [ ] T002 [skill: design-system] [P] Adicionar teste unitário de variantes de macronutrientes do Badge em `tests/components/atoms/Badge.test.tsx`.

---

## Phase 2: User Story 1 - Experiência Visual e Funcional Idêntica sem Hardcode Estrutural (Priority: P1)

**Goal**: Adequar `MealCardContainer`, `DietMealsSection`, `MacroTrackerHeader`, `MealItemRow` e `DietBuilderTemplate` para utilizarem exclusivamente átomos `Surface`, `Button`, `IconButton`, `Badge` e remover conflitos de classes Tailwind.

- [ ] T003 [skill: shadcn] [US1] Refatorar `src/components/organisms/MealCardContainer.tsx` substituindo `<Card>` por `<Surface variant="default">`, corrigindo classes duplicadas (`p-5 p-6`, `flex-col flex-row`, `w-full w-auto`), adotando `EditIconButton` para edição inline de nome/hora e utilizando `<Badge variant="protein|carbohydrate|fat|kcal">`.
- [ ] T004 [skill: shadcn] [US1] Refatorar `src/components/molecules/MealItemRow.tsx` aplicando `<Badge variant="protein|carbohydrate|fat|kcal">`, `<FieldTrigger>` para o gatilho de edição de gramatura e token canônico `bg-success-soft` no grip de ordenação.
- [ ] T005 [skill: shadcn] [US1] Refatorar `src/components/organisms/diet/DietMealsSection.tsx` substituindo `<Card>` no empty state por `<Surface variant="subtle">` com ícone em `bg-success-soft text-success`.
- [ ] T006 [skill: shadcn] [US1] Refatorar `src/components/organisms/MacroTrackerHeader.tsx` corrigindo a classe de grid conflitante para `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4` e limpando overrides manuais de padding.
- [ ] T007 [skill: shadcn] [US1] Refatorar `src/components/templates/DietBuilderTemplate.tsx` padronizando importações de botões e limpando fallbacks de layout.

---

## Phase 3: User Story 2 - Preservação Integral de Modais e Fluxos Operacionais (Priority: P2)

**Goal**: Limpar classes conflitantes e padronizar componentes nos modais de busca TACO, escala, cópia, metas e WhatsApp, além de implementar os handlers pendentes.

- [ ] T008 [skill: nextjs-fullstack-master] [US2] Implementar `handleDuplicateMeal` em `src/hooks/useDietMealActions.ts` e conectá-lo ao `MealCardContainerProps` em `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`.
- [ ] T009 [skill: nextjs-fullstack-master] [US2] Conectar o handler `onVariationsCountChange` em `src/hooks/useDietBuilderPage.ts` e passá-lo para `DietBuilderTemplate` para alternância reativa de variações de carboidratos.
- [ ] T010 [skill: shadcn] [US2] Refatorar `src/components/molecules/FoodSearchModal.tsx` e `src/components/molecules/food-search/FoodSearchResultsList.tsx` corrigindo classes conflitantes (`flex-col flex-row`), padronizando tokens de cor semânticos e itens de lista.
- [ ] T011 [skill: shadcn] [US2] Revisar e padronizar `src/components/molecules/ScaleDietModal.tsx`, `src/components/molecules/CopyVariationModal.tsx`, `src/components/molecules/AdjustDietGoalsModal.tsx` e `src/components/molecules/WhatsAppShareModal.tsx` garantindo conformidade com o Design System.

---

## Phase 4: User Story 3 - Conformidade com Auditoria Automatizada e Regras de Governança (Priority: P3)

**Goal**: Garantir 0 violações de auditoria legada, 100% de conformidade com Atomic Design e 100% de aprovação nos testes do Vitest.

- [ ] T012 [skill: tdd] [US3] Atualizar/estender a suíte de testes de superfície e integração em `tests/components/templates/diet-builder-template.test.tsx` e `tests/components/templates/diet-builder-template.surface.test.tsx`.
- [ ] T013 [skill: code-reviewer-expert] [US3] Executar `node scripts/audit-atomic-design.mjs` e `node scripts/verify-design-system-legacy.mjs` confirmando 0 violações nos arquivos do construtor de dietas.
- [ ] T014 [skill: tdd] [US3] Executar a suíte completa de testes do Vitest confirmando 100% de sucesso.
