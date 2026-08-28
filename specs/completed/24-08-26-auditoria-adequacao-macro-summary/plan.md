# Implementation Plan: Auditoria e Adequação do Componente MacroSummary

**Feature Directory**: `specs/24-08-26-auditoria-adequacao-macro-summary` | **Date**: 2026-08-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/24-08-26-auditoria-adequacao-macro-summary/spec.md`

## Summary

Auditar todas as implementações do componente `MacroSummary` e aplicar aprimoramentos arquiteturais:
1. Impedir quebra de linha interna nos elementos de macronutrientes e calorias (`whitespace-nowrap flex-nowrap`).
2. Introduzir a propriedade explícita `showKcal?: boolean` para controle flexível de exibição de calorias.
3. Assegurar conformidade em todos os consumidores na aplicação (cards, tabelas, modais) e nos testes automatizados.

## Technical Context

**Language/Version**: TypeScript 5.7 / React 19 / Next.js 15
**Primary Dependencies**: Tailwind CSS, class-variance-authority, lucide-react
**Testing**: Vitest 4.1, @testing-library/react
**Target Platform**: Desktop Web (Tailwind tokens a partir de 1024px)
**Project Type**: Next.js App Router (Atomic Design: Atoms / Molecules / Organisms)
**Performance Goals**: Renderização síncrona instantânea sem re-renders desnecessários
**Constraints**: Sem breakpoints móveis arbitrários (`sm:`/`md:`), classes restritas a tokens semânticos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Design System Tokens**: Utiliza exclusivamente `text-macro-protein`, `text-macro-carbohydrate`, `text-macro-fat`, `text-text-primary`, `text-text-muted`. [PASS]
- **Atomic Design Hierarchy**: `MacroSummary` reside na camada de moléculas (`src/components/molecules/MacroSummary.tsx`) e é re-exportado para consumo direto. [PASS]
- **Sem HTML Proibido**: Utiliza elementos `span` e `div` sem elementos restritos não encapsulados. [PASS]
- **Sem Dependências Circulares**: Componente isolado sem efeitos colaterais. [PASS]

## Project Structure

### Documentation (this feature)

```text
specs/24-08-26-auditoria-adequacao-macro-summary/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   ├── requirements.md
│   └── macro-summary-quality.md
├── contracts/
│   └── macro-summary-component.ts
└── tasks.md
```

### Source Code

```text
src/
├── components/
│   ├── molecules/
│   │   ├── MacroSummary.tsx
│   │   ├── CarbCyclingVariationPanel.tsx
│   │   ├── CycleMatrixModal.tsx
│   │   ├── ReadOnlyDietModal.tsx
│   │   └── food-search/FoodSearchResultsList.tsx
│   └── organisms/
│       └── patient/
│           ├── ConsultationHistoryRow.tsx
│           └── PatientDietsTable.tsx
tests/
├── components/
│   └── molecules/
│       ├── MacroSummary.test.tsx
│       └── CarbCyclingVariationPanel.test.tsx
└── organisms/
    └── patient-diets-table.test.tsx
```

## Structure Decision

O componente `MacroSummary` é a fonte única de verdade para exibição inline de macronutrientes e calorias. A anatomia do componente é ajustada para `flex flex-nowrap items-center whitespace-nowrap` e `showKcal` é suportado como flag booleana explícita.
