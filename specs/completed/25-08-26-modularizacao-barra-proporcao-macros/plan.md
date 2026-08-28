# Implementation Plan: Modularização da Barra de Proporção de Macronutrientes

**Feature Directory**: `specs/25-08-26-modularizacao-barra-proporcao-macros` | **Date**: 25/08/2026 | **Spec**: [spec.md](./spec.md)

## Summary

Expandir a molécula [`MacroProportionBar`](file:///c:/Programmer/diet-maker/src/components/molecules/MacroProportionBar.tsx) para suportar todas as variações de uso (título opcional, calorias por macro, percentual total, mensagens customizadas de estado vazio e layout responsivo) e refatorar todos os pontos consumidores do sistema (especialmente [`AdjustDietGoalsModal.tsx`](file:///c:/Programmer/diet-maker/src/components/molecules/AdjustDietGoalsModal.tsx) e [`MealCardContainer.tsx`](file:///c:/Programmer/diet-maker/src/components/organisms/MealCardContainer.tsx)), eliminando 100% de código hardcoded/duplicado e viabilizando o reuso instantâneo em qualquer tela.

## Technical Context

**Language/Version**: TypeScript 5+ / React 19 / Next.js 15 App Router  
**Primary Dependencies**: Tailwind CSS, Lucide React, Design System recipes & tokens  
**Testing**: Vitest / React Testing Library  
**Target Platform**: Web Desktop (>= 1024px)  
**Project Type**: Atomic Design React Component Library / Application  
**Performance Goals**: Render síncrono instantâneo (< 5ms) com memoização de cálculos matemáticos  
**Constraints**: Respeito estrito à Ordem Canônica Normativa (`P → C → G → Kcal`) e WCAG 2.2 AA  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I - Atomic Design Architecture**: `MacroProportionBar` reside em `src/components/molecules/` e não importa organismos ou templates.
- [x] **Principle II - Canonical Design System**: Utiliza exclusivamente os tokens semânticos normativos (`bg-macro-protein`, `bg-macro-carbohydrate`, `bg-macro-fat`, `text-macro-*`).
- [x] **Principle III - Desktop Scope & Accessibility**: Compatível com desktop, possui tags ARIA completas e contraste visual AA.
- [x] **Principle IV - Test-First Quality**: Testes unitários cobrem cenários com dados, valores zerados, props opcionais e interações de consumidores.
- [x] **Principle V - Spec-Driven Execution**: Execução estruturada via SDD com artefatos auditáveis.

## Project Structure

### Documentation (this feature)

```text
specs/25-08-26-modularizacao-barra-proporcao-macros/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── macro-proportion-bar.contract.ts
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code

```text
src/
├── components/
│   ├── molecules/
│   │   ├── MacroProportionBar.tsx   # Molécula flexível de proporção de macros
│   │   ├── AdjustDietGoalsModal.tsx # Consumidor refatorado
│   │   └── index.ts                 # Exportação da molécula
│   └── organisms/
│       └── MealCardContainer.tsx    # Consumidor padronizado
tests/
└── components/
    └── molecules/
        ├── macro-proportion-bar.test.tsx
        └── adjust-diet-goals-modal.test.tsx
```
