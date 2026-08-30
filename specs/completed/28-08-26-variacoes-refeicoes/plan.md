# Implementation Plan: Variações de Refeições

**Branch**: `variacoes-refeicoes` | **Date**: 2026-08-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from [spec.md](spec.md)

**Planning status**: Ready for task generation; implementation is intentionally not included in this phase.

## Summary

Adicionar opções completas e independentes dentro de uma mesma refeição, com no máximo cinco variações, seleção por tabs e cálculo baseado somente na opção ativa. A evolução será compatível com o formato atual: a refeição existente continuará representando a primeira opção e uma coleção opcional armazenará as opções adicionais. A interface permanecerá com o mesmo card quando houver uma única opção e comporá o card existente com o primitivo canônico de tabs quando houver duas ou mais.

## Technical Context


**Language/Version**: TypeScript 5.7, React 19, Next.js 15.1

**Primary Dependencies**: Radix Tabs via `src/components/ui/tabs.tsx`, Lucide React, Tailwind CSS, Sonner, Next.js App Router

**Storage**: Estado local existente de dietas por paciente; formato aditivo compatível com `FullDietPlan`, `simpleMeals` e `CarbCyclingVariation.meals`

**Testing**: Vitest, Testing Library, TypeScript no-emit, ESLint e auditorias do design system

**Target Platform**: Aplicação web desktop a partir de 1024px, offline-first/local

**Project Type**: Aplicação web desktop com construtor de dietas

**Performance Goals**: Para grupos com até cinco opções, pelo menos 95% das trocas de tab devem atualizar alimentos e totais em até 500ms, sem cálculo de opções inativas.

**Constraints**: Preservar o card de opção única; máximo de cinco opções; nome e horário compartilhados; alimentos e macros independentes; apenas opção ativa nos totais; funcionamento na Dieta Simples e em cada dia do Ciclo de Carboidratos; acessibilidade WCAG 2.2 AA; sem mudanças de exportação nesta entrega; sem alterações de domínio em `src/components/ui`.

**Scale/Scope**: Uma a cinco opções por grupo de refeição, múltiplos grupos por plano, dois contextos de plano (simples e ciclo), sem novos serviços externos.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Evidence |
| --- | --- | --- |
| I. Atomic Design Architecture | PASS | A solução compõe o `MealCardContainer` existente com `ui-tabs`; regras de domínio permanecem em hooks/lib e nenhum primitivo genérico recebe tipos de dieta. |
| II. Canonical Design System | PASS | A categoria `selection`, o perfil `ui-tabs`, o perfil `organism-meal-card-container` e as regras de tokens/estados são referências do design; não há nova categoria visual. |
| III. Desktop Scope and Accessibility | PASS | O plano mantém o escopo desktop, prevê semântica de tabs, foco visível, teclado, estado selecionado e movimento reduzido. |
| IV. Test-First Quality and Isolation | PASS | O plano inclui helpers puros, testes de transição, cálculos, isolamento por contexto e testes do card sem dependência de dados externos. |
| V. Spec-Driven Execution | PASS | Os artefatos estão sob a pasta da feature e a implementação futura deverá ser executada somente por `/speckit-implement`. |

## Project Structure

### Documentation (this feature)

```text
specs/28-08-26-variacoes-refeicoes/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/meal-variations.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   └── pacientes/[id]/dieta/[dietaId]/page.tsx
├── components/
│   ├── organisms/MealCardContainer.tsx
│   ├── organisms/diet/DietMealsSection.tsx
│   ├── molecules/MealItemRow.tsx
│   ├── ui/tabs.tsx
│   └── templates/dietBuilderTemplateTypes.ts
├── hooks/
│   ├── useDietBuilderPage.ts
│   ├── useDietCalculations.ts
│   ├── useDietMealActions.ts
│   └── useDietBuilderModals.ts
└── lib/
    ├── dietStore.ts
    ├── macroCalculations.ts
    ├── dietDuplication.ts
    └── mealVariations.ts

tests/
├── fixtures/meal-variations.ts
├── app/pacientes/dedicated-carb-cycling-page.test.tsx
├── hooks/useDietBuilderPage.test.ts
├── lib/meal-variations.test.ts
├── lib/dietDuplication.test.ts
├── hooks/useDietMealActions.test.ts
├── hooks/useDietCalculations.test.ts
└── components/organisms/meal-card-container.test.tsx

design-system/components/
├── profiles/organisms/meal-card-container.md
└── registry.json
```

**Structure Decision**: Evoluir o domínio em `src/lib`, preservar a hierarquia atual de hooks, organismo, moléculas e primitivos, e manter os testes sob `tests/`. O novo helper de domínio será agnóstico de interface; o organismo será responsável apenas por compor o card existente com a seleção visual. A página continuará conectando dados reais e callbacks, sem mover regras de negócio para `src/components/ui`.

## Current implementation evidence

- `src/lib/dietStore.ts` define `DietMeal` com `id`, `name`, `time` e `items`; `FullDietPlan` possui `simpleMeals` e refeições dentro de cada `CarbCyclingVariation`.
- `src/hooks/useDietCalculations.ts` deriva `currentMeals` do modo simples ou do dia ativo e calcula os totais a partir dos `items` projetados.
- `src/hooks/useDietMealActions.ts` concentra criação, duplicação, cópia, colagem, edição, substituição, exclusão e reordenação de alimentos/refeições.
- `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx` adapta as refeições para `MealCardContainerProps` e conecta modais e ações.
- `src/components/organisms/MealCardContainer.tsx` já possui o header, resumo, tabela, estado vazio e ações que devem permanecer visualmente estáveis.
- `src/components/ui/tabs.tsx` já fornece `Tabs`, `TabsList`, `TabsTrigger` e `TabsContent`; o primitivo deve permanecer genérico.

## Design decisions

### 1. Compatibility-first meal representation

Keep the existing `DietMeal.items` as Variação 1 and add optional extra variation records. A pure helper exposes an ordered conceptual list so UI, calculations and actions do not repeat the base-plus-extra interpretation. Adding the first option creates the first extra record; deleting the first option promotes the next option to the base field through the same helper.

### 2. Context-aware active selection

The page state holds the active variation by diet context + meal group. In simple mode the key identifies the plan and meal group. In carbohydrate cycling it also includes the cycle-day variation. The persisted plan does not store the editor’s active tab. Missing selections resolve to the first option; creation selects the appended option; deletion selects the last remaining option.

### 3. Active-option projection

The calculation and UI layers receive a projection in which each meal group exposes the selected option’s `items` and totals. Mutations write through a target containing context, meal id and option id. This preserves current card/item APIs conceptually while preventing writes to inactive options.

### 4. Conditional tab composition

For one conceptual option, render the current card anatomy unchanged. For two to five options, compose the existing `Tabs` family around the same meal card content, with one panel per option and labels derived from position. The meal name/time remain shared and no second meal card is inserted.

## Implementation sequence

1. Introduce the optional variation data shape and pure helpers for listing, labeling, cloning, appending, removing, normalizing and resolving active options.
2. Add compatibility normalization for old meals and fresh identity generation for newly cloned option/item data.
3. Add scoped selection state for simple plans and cycle-day contexts, including default, create and delete transitions.
4. Route existing food operations through the active option target and preserve current undo/copy/paste behavior where it applies to the open option.
5. Update active-meal projection and macro aggregation so exactly one option per meal group contributes to the current context.
6. Extend the meal-card contract with controlled option data and variation callbacks; compose the existing tabs only for multi-option groups; keep single-option visuals unchanged.
7. Wire add/delete variation, shared name/time edits, limit feedback and full-group meal duplication through the page and hooks.
8. Cover simple mode, every cycle-day context, legacy data, empty meals, five-option limit, renumbering, last-option selection, macro isolation and duplicate independence.
9. Update the MealCardContainer design-system profile and registry consumers/API metadata if the public contract changes; run the design-system audits.

## Error handling and recovery

- Invalid or absent optional variation data is treated as a single-option meal using the existing `items`, preserving the base meal rather than failing the entire plan.
- The add action is guarded by the five-option invariant and gives explicit feedback when unavailable.
- Deletion always computes the next active option from the post-delete ordered list; it never leaves a dangling selected id.
- New option and item copies receive fresh identities so an edit cannot mutate the source by shared reference.
- A failed update must leave the previous meal group intact; state transitions should use immutable replacement at the group boundary.

## Testing strategy

- Pure domain tests cover normalization, option labels, append-from-active, max-five guard, delete-and-renumber, last-remaining selection, deep cloning and legacy meals.
- Calculation tests cover one active option per group, differing macro values, switching active options and isolation between cycle days.
- Hook tests cover target routing for add/remove/substitute/duplicate/reorder/quantity/scale actions and full-group duplication.
- Component tests cover single-option unchanged anatomy, multi-option tab semantics, automatic selection of a newly added option, limit state, deletion fallback and keyboard semantics.
- Existing regression suites for diet storage, duplication, meal card and cycle modes must remain green.
- Validation commands and the 95%/500ms tab-switch measurement are consolidated in [quickstart.md](quickstart.md).

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Inactive alternatives are accidentally included in totals | Centralize active-option projection and test totals with intentionally different macros. |
| Old saved diets break when opened | Keep `items` as the base representation and normalize optional extras without destructive migration. |
| A cycle-day selection leaks into another day | Include the cycle-day context in selection and mutation targets; test two days with similar meals. |
| Tabs alter the single-option card layout | Render variation controls conditionally and preserve the existing single-option branch. |
| New controls violate the design-system contract | Reuse `ui-tabs`, canonical tokens and states; update the MealCardContainer profile/registry in the same change set. |
| Cloned objects share mutable references | Deep-copy option and item records with fresh ids in one domain helper. |

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations are expected; no complexity exception is required.
