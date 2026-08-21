# Implementation Plan: Adequação de Componentes Shadcn e Vercel Composition Patterns

**Branch**: `07-08-26-adequacao-componentes-shadcn` | **Date**: 2026-08-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/07-08-26-adequacao-componentes-shadcn/spec.md`

## Summary

Substituir 100% dos componentes e estruturas identificadas na auditoria como divergentes do Shadcn UI e Vercel Composition Patterns por primitivas oficiais de `@/components/ui`, garantindo total compatibilidade visual, acessibilidade e integridade dos testes unitários.

## Technical Context

**Language/Version**: TypeScript / React 19 (Next.js 15 App Router)

**Primary Dependencies**: `@/components/ui/*` (Radix UI / Shadcn primitives), `lucide-react`, `tailwind-variants` (`recipes`), `clsx`, `tailwind-merge` (`cn`).

**Storage**: Local storage / React State (Sem alterações de banco de dados).

**Testing**: Vitest / React Testing Library (`npm run test`).

**Target Platform**: Next.js Web Application (Desktop & Mobile responsive).

**Project Type**: Web Application (React Components Design System).

**Performance Goals**: Renderização sem re-renders desnecessários (<16ms por frame), animações aceleradas por GPU.

**Constraints**: Preservar 100% das props públicas existentes nos componentes para evitar quebras em páginas dependentes.

**Scale/Scope**: 8 arquivos de componentes principais em `src/components` + componentes secundários compostos.

## Constitution Check

- **Zero Breaking Changes**: Todas as props existentes serão mantidas ou estendidas. PASS.
- **Acessibilidade WAI-ARIA**: Primitivas Shadcn garantem `aria-*`, suporte a leitor de tela e foco via teclado. PASS.
- **Design Tokens Consistency**: As variantes continuarão utilizando as cores semânticas Tailwind do projeto (`bg-surface`, `text-primary`, etc.). PASS.

## Project Structure

### Documentation (this feature)

```text
specs/07-08-26-adequacao-componentes-shadcn/
├── spec.md              # Feature Specification
├── plan.md              # Implementation Plan
├── research.md          # Technical decisions and architectural rationale
├── data-model.md        # Component interfaces and prop mappings
├── quickstart.md        # Manual and automated verification guide
├── checklists/
│   ├── requirements.md  # Requirements quality checklist
│   └── design-system.md # Design system refactoring checklist
└── tasks.md             # Implementation tasks breakdown
```

### Source Code Layout

```text
src/components/
├── atoms/
│   ├── Avatar.tsx       # Refatorar -> @/components/ui/avatar
│   ├── ProgressBar.tsx  # Refatorar -> @/components/ui/progress
│   └── FieldTrigger.tsx # Refatorar -> SelectTrigger / Button
├── molecules/
│   ├── MetricBox.tsx    # Refatorar -> Card / Separator
│   ├── TacoSearchInput.tsx # Refatorar -> InputGroup composition
│   ├── MealItemRow.tsx  # Refatorar -> Badge semântico
│   └── RecipeIngredientRow.tsx # Refatorar -> Badge semântico
├── organisms/
│   ├── PatientConsultationHistoryTable.tsx # Refatorar -> @/components/ui/table
│   ├── MetricBoxGroup.tsx # Refatorar -> Card / Separator
│   └── MealCardContainer.tsx # Refatorar -> Empty state / Badge
└── templates/
    └── DietBuilderTemplate.tsx # Refatorar -> Empty state semântico
```

**Structure Decision**: Single React Next.js codebase layout maintaining atomic design hierarchy.
