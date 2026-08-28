# Implementation Plan: Adequação e Centralização da Página de Elaboração de Dieta

**Branch**: `20-08-26-adequar-pagina-dieta-nova` | **Date**: 2026-08-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/20-08-26-adequar-pagina-dieta-nova/spec.md`

## Summary

Adequação arquitetural, visual e de código da rota de elaboração de dieta (`src/app/pacientes/[id]/dieta/[dietaId]/page.tsx`), substituindo elementos `Card` genéricos por átomos canônicos `Surface`, adicionando variantes semânticas oficiais de macronutrientes (`protein`, `carbohydrate`, `fat`, `kcal`) ao átomo `Badge`, eliminando conflitos de classes Tailwind (`p-5 p-6`, `flex-col flex-row`, `w-full w-auto`, `grid-cols-1 grid-cols-2`), utilizando `EditIconButton` e `FieldTrigger`, implementando os handlers pendentes de duplicação de refeição e variação de contagem, garantindo 0 hardcodes e conformidade estrita com o Design System.

## Technical Context

**Language/Version**: TypeScript 5.4+ / React 19 / Next.js 15 App Router
**Primary Dependencies**: Tailwind CSS, Lucide React, Shadcn UI primitives, Sonner, Design System canônico (`@/design-system`, `@/components/atoms`, `@/components/molecules`, `@/components/organisms`, `@/components/templates`)
**Storage**: `localStorage` através de `src/lib/dietStore.ts` e `src/lib/tacoStore.ts`
**Testing**: Vitest + React Testing Library (`tests/components/templates/diet-builder-template.test.tsx`, `tests/components/templates/diet-builder-template.surface.test.tsx`)
**Target Platform**: Web Desktop (>= 1024px)
**Project Type**: Next.js App Router Single-Page Workflow Application
**Performance Goals**: Renderização instantânea sem layout shift ou flashes de estilo
**Constraints**: WCAG 2.2 AA, Atomic Design estrito (`ui -> atoms -> molecules -> organisms -> templates -> app`), 0 hardcoded colors/opacities/styles, fidelidade visual 100% idêntica.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Atomic Design Architecture**: Todos os componentes residem em suas camadas canônicas (`atoms`, `molecules`, `organisms`, `templates`).
- [x] **Canonical Design System**: Consome tokens oficiais (`bg-success-soft`, `text-macro-protein`, `border-border-subtle`, etc.) sem valores literais.
- [x] **Desktop Scope and Accessibility**: Mantém roles, aria-labels, navegação por teclado e escopo desktop >= 1024px.
- [x] **Test-First Quality**: Testes unitários e de superfície verificam a hierarquia e integridade das ações.
- [x] **Spec-Driven Execution**: Artefatos completos em `specs/20-08-26-adequar-pagina-dieta-nova/`.

## Project Structure

### Documentation (this feature)

```text
specs/20-08-26-adequar-pagina-dieta-nova/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   └── requirements.md
├── contracts/
│   └── diet-builder-refactor.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   └── pacientes/
│       └── [id]/
│           └── dieta/
│               └── [dietaId]/
│                   └── page.tsx
├── components/
│   ├── atoms/
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── FieldTrigger.tsx
│   │   ├── IconButton.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Surface.tsx
│   ├── molecules/
│   │   ├── ActionDropdown.tsx
│   │   ├── AdjustDietGoalsModal.tsx
│   │   ├── CopyVariationModal.tsx
│   │   ├── DietModeSwitcher.tsx
│   │   ├── FoodSearchModal.tsx
│   │   ├── food-search/
│   │   │   └── FoodSearchResultsList.tsx
│   │   ├── MacroMetricCard.tsx
│   │   ├── MealItemRow.tsx
│   │   ├── PageContextHeader.tsx
│   │   ├── ScaleDietModal.tsx
│   │   └── WhatsAppShareModal.tsx
│   ├── organisms/
│   │   ├── MacroTrackerHeader.tsx
│   │   ├── MealCardContainer.tsx
│   │   ├── PatientProfileHeader.tsx
│   │   └── diet/
│   │       ├── DietContextSection.tsx
│   │       └── DietMealsSection.tsx
│   └── templates/
│       ├── DietBuilderTemplate.tsx
│       └── dietBuilderTemplateTypes.ts
├── hooks/
│   ├── useDietBuilderModals.ts
│   ├── useDietBuilderPage.ts
│   ├── useDietCalculations.ts
│   ├── useDietMealActions.ts
│   └── useDietPresets.ts
└── lib/
    ├── dietStore.ts
    ├── presetUtils.ts
    └── tacoStore.ts
```

## Complexity Tracking

Nenhuma violação constitucional.
