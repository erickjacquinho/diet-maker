# Implementation Plan: Correção Universal de Cálculo de Calorias a partir de Macros

**Branch**: `30-07-26-correcao-de-todos-os-calculos` | **Date**: 30/07/2026 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/30-07-26-correcao-de-todos-os-calculos/spec.md`

## Summary

Substituição universal de todas as entradas estáticas e manuais de calorias pelo cálculo automático derivado de macronutrientes ($4 \times \text{Prot} + 4 \times \text{Carb} + 9 \times \text{Gord}$), estruturando a arquitetura de componentes sob o padrão de composição do Vercel (`vercel-composition-patterns`).

## Technical Context

**Language/Version**: TypeScript / React 19 / Next.js (App Router)

**Primary Dependencies**: React, Tailwind CSS, Lucide React, Vitest, `@/lib/presetUtils`

**Storage**: localStorage (`nutridiet_patients`, `nutridiet_presets`, etc.)

**Testing**: Vitest + React Testing Library

**Target Platform**: Web Browsers (Desktop & Mobile)

**Project Type**: Next.js Fullstack Web Application

**Performance Goals**: Renderização reativa instantânea (< 16ms / 60fps) ao manipular valores de macros.

**Constraints**: Seguir princípios do `vercel-composition-patterns` (sem proliferação de boolean props, desacoplamento de estado e uso de componentes compostos reusáveis).

## Constitution Check

- **Pass**: Projeto utiliza arquitetura limpa de componentes em `src/components/molecules` e `src/components/organisms`.
- **Pass**: Funções puras de domínio concentradas em `src/lib/presetUtils.ts`.

## Project Structure

### Documentation (this feature)

```text
specs/30-07-26-correcao-de-todos-os-calculos/
├── plan.md
├── spec.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── molecules/
│   │   ├── AutoKcalSection.tsx       # Componente composto reutilizável de cálculo automático
│   │   ├── ReadOnlyDietModal.tsx     # Modal de leitura de dieta com macros
│   │   └── MealItemRow.tsx           # Linha de alimento/refeição
│   └── organisms/
│       ├── MealCardContainer.tsx     # Card de refeição com macros e calorias
│       └── MacroTrackerHeader.tsx    # Cabeçalho de acompanhamento de metas
├── lib/
│   ├── presetUtils.ts                # Função pura calculatePresetCalories(proteinG, carbsG, fatsG)
│   └── patientsStore.ts              # Persistência e regras de paciente
└── app/
    ├── pacientes/
    │   └── page.tsx                  # Cadastro de novos pacientes com AutoKcalSection
    ├── pacientes/[id]/
    │   └── page.tsx                  # Edição de paciente e metas com AutoKcalSection
    └── presets/
        └── page.tsx                  # Criador e visualizador de presets nutricionais
```

**Structure Decision**: Utilizar o componente `AutoKcalSection` nos pontos de edição de metas de paciente e refeição, e garantir que a função pura `calculatePresetCalories` seja invocada consistentemente em todos os pontos de cálculo de Kcal.
