# Implementation Plan: Unificação de Superfícies e Composição Atomic

**Branch**: `05-08-26-unificar-superficies-atomic` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/05-08-26-unificar-superficies-atomic/spec.md`

## Summary

Criar um contrato visual único de superfície e um wrapper atômico `Surface` sobre o primitivo genérico Shadcn `Card`. Os componentes de produto passam a compor essa base para manter conteúdo, dados, ações e estados próprios sem repetir classes de fundo, borda, raio, padding ou elevação.

A implementação deve preservar `src/components/ui/card.tsx` como primitivo limpo, concentrar as receitas em `src/design-system/recipes.ts`, criar o contrato documental de `Surface` e migrar os consumidores priorizados, incluindo `MetricBox`, `MacroMetricCard`, `RecipeCard`, `MealItemRow`, `MacroTrackerHeader`, `MealCardContainer` e `MetricBoxGroup`.

## Technical Context

**Language/Version**: TypeScript 5.7, React 19, Next.js 15

**Primary Dependencies**: React, Tailwind CSS 3.4, class-variance-authority, `@/design-system`, `@/components/ui/card`

**Storage**: N/A; no persistent data or domain model changes

**Testing**: Vitest 4, Testing Library, TypeScript type-check, ESLint, Atomic Design audit and component catalog audit

**Target Platform**: Web desktop, minimum 1024px, light theme

**Project Type**: Next.js desktop web application with Atomic Design component hierarchy

**Performance Goals**: No measurable regression in render or interaction performance for the migrated consumers; the base must remain stateless and have no runtime data fetching

**Constraints**: Preserve Shadcn primitives, use canonical design-system tokens, avoid duplicated surface classes, avoid boolean-prop proliferation, preserve WCAG 2.2 AA behavior and existing consumer states

**Scale/Scope**: One generic surface wrapper, one shared surface recipe/contract, approximately seven named component families plus directly discovered visual-surface consumers, with no route or persistence changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Result |
|---|---|---|
| I. Atomic Design Architecture | `Surface` stays generic, consumers remain in their current/target layers, and no imports point to a higher layer. | PASS with design guardrails |
| II. Canonical Design System | Surface variants inherit canonical surfaces/tokens; no visual values are invented in consumers. | PASS |
| III. Desktop Scope and Accessibility | No mobile/dark-mode expansion; focus, semantics, contrast and states remain explicit. | PASS |
| IV. Test-First Quality and Isolation | Contracts and regression tests are planned before consumer migration. | PASS |
| V. Spec-Driven Execution | This plan ends before implementation; execution must use `/speckit-implement` after human validation. | PASS |

## Research Summary

Research decisions and rejected alternatives are recorded in [research.md](./research.md).

## Project Structure

### Documentation (this feature)

```text
specs/05-08-26-unificar-superficies-atomic/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── surface.contract.md
│   └── atomic-composition.contract.md
├── checklists/
│   ├── requirements.md
│   └── architecture.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ui/
│   │   └── card.tsx                         # preserve generic Shadcn primitive
│   ├── atoms/
│   │   ├── Surface.tsx                      # new generic product wrapper
│   │   └── index.ts                         # public atom export
│   ├── molecules/
│   │   ├── MetricBox.tsx                    # compose Surface
│   │   ├── MacroMetricCard.tsx              # compose Surface
│   │   ├── RecipeCard.tsx                   # compose Surface
│   │   └── MealItemRow.tsx                  # classify/migrate visual surface
│   ├── organisms/
│   │   ├── MetricBoxGroup.tsx               # compose Surface for group shell
│   │   ├── MacroTrackerHeader.tsx            # compose Surface
│   │   └── MealCardContainer.tsx             # compose Surface
│   └── templates/
│       └── DietBuilderTemplate.tsx           # migrate direct surface consumers
├── design-system/
│   ├── recipes.ts                            # shared surface recipe
│   └── types.ts                              # shared surface types if required
└── app/                                      # route consumers audited, no domain changes

tests/
├── components/atoms/                         # Surface contract tests
├── components/molecules/                     # consumer regression tests
├── components/organisms/                     # group/container regression tests
└── design-system/                            # recipe/catalog compliance tests
```

**Structure Decision**: Use the existing single Next.js project and its current `ui → atoms → molecules → organisms → templates → app` dependency direction. `src/components/ui/card.tsx` remains the low-level Shadcn primitive. `src/components/atoms/Surface.tsx` is the product-generic composition boundary and may depend on UI primitives and design-system recipes, but never on domain or higher Atomic layers.

## Design and Implementation Phases

### Phase 0 — Contract and inventory

1. Record the current Card/MetricBox/surface consumers and classify every visual `div` as reusable surface, layout-only markup or explicit exception.
2. Freeze the `Surface` API around the canonical `default`/`subtle` variants, `compact`/`standard`/`highlight` densities, and composition; do not add boolean mode flags.
3. Define the shared visual recipe and the mapping from existing `MetricBox.surface` modes, keeping `tinted` as consumer semantics and `inline` as a no-surface mode.

### Phase 1 — Base and contract tests

1. Add the `Surface` atom and export it through the atom barrel.
2. Add unit tests for default, subtle, density, the `shadow-none` elevation policy, class composition, semantic passthrough and accessibility-preserving markup; cover tinted and inline through consumer mapping tests rather than as Surface variants.
3. Add a design-system profile and registry entry for `atom-surface`.
4. Preserve `ui-card.tsx` as generic and remove no public Shadcn exports.

### Phase 2 — Consumer migration

1. Migrate `MetricBox` first, preserving its content API and all current tones/layouts.
2. Migrate `MacroMetricCard` and preserve badge/progress/g/kg content.
3. Migrate `RecipeCard`, `MealItemRow`, `MetricBoxGroup`, `MacroTrackerHeader` and `MealCardContainer` according to their layer and category contracts.
4. Audit direct template/page surfaces and migrate only true reusable surfaces; leave layout-only divs and domain-specific inner treatments classified.

### Phase 3 — Documentation and validation

1. Update component profiles, category consumers, registry primitive bases and migration statuses.
2. Add regression assertions for existing consumer anatomy and states.
3. Run Atomic, design-system, type, lint, unit and whitespace checks.
4. Compare visual baselines for the main routes and record any approved exception.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| `Surface` duplicates `Card` rather than composing it | Keep `Card` as the only low-level Shadcn primitive and test `Surface` as a wrapper boundary. |
| New variants become a boolean matrix | Use named variants and composition; reject `isRaised`, `isTinted`, `hasBorder` combinations. |
| Migration changes density or spacing | Preserve consumer snapshots/tests and compare route baselines before/after each migration group. |
| Domain semantics leak into the base | Keep nutrition tones/content in molecules and categories, not in `Surface` or `ui/card.tsx`. |
| Existing dirty worktree masks unrelated changes | Limit implementation to feature files and explicitly listed consumers; review `git diff --name-only`. |

## Post-Design Constitution Check

| Gate | Result |
|---|---|
| No higher-layer imports from `Surface` or `ui/Card` | PASS by structure decision |
| No domain rules in Shadcn primitive | PASS by contract |
| Canonical tokens and categories are referenced rather than redefined | PASS; enforced by task and audit |
| Tests precede consumer migration | PASS in phase order |
| No runtime implementation in this SDD | PASS; handoff is to human validation and `/speckit-implement` |

## Complexity Tracking

No constitution violations identified. Introducing `Surface` is justified as a product-generic wrapper because the existing consumers need one reusable composition boundary while `Card` must remain a clean Shadcn primitive.
