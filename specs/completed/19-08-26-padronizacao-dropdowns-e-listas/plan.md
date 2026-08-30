# Implementation Plan: Padronização e Centralização de Dropdowns e Listas

**Branch**: `specs/19-08-26-padronizacao-dropdowns-e-listas` | **Date**: 2026-08-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/19-08-26-padronizacao-dropdowns-e-listas/spec.md`

## Summary

Centralizar e padronizar todos os dropdowns e seletores de listas da aplicação em componentes pai unificados (`SelectField` e `ActionDropdown`), eliminando repetições de markup Radix UI, classes utilitárias dispersas, listas suspensas ad-hoc e estilos hardcoded em todos os 8 modais, cabeçalhos de filtros e telas do produto, em total conformidade com o Atomic Design, a Constituição do projeto e os tokens canônicos do Design System.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Next.js 15 (App Router)

**Primary Dependencies**: `@radix-ui/react-select`, `@radix-ui/react-dropdown-menu`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`

**Storage**: Local storage stores (`patientsStore`, `presetsStore`, `recipesStore`, `readyMealsStore`, `tacoStore`)

**Testing**: Vitest 3.x, `@testing-library/react`, `@testing-library/jest-dom`

**Target Platform**: Web Desktop (>= 1024px) conforme a Constituição do NutriDiet Local Pro

**Project Type**: Next.js Web Application com Atomic Design

**Performance Goals**: Renderização e abertura instantânea de dropdowns (< 50ms), sem vazamento de memória ou re-renderizações desnecessárias

**Constraints**: Zero inline styles (`style={...}`) em componentes de lista, conformidade com WCAG 2.2 AA, navegabilidade total por teclado, respeito às camadas de Atomic Design (`ui → atoms → molecules → organisms → templates → app`)

**Scale/Scope**: 8 modais clínicos e administrativos, 1 cabeçalho de filtros de alimentos, 1 template de elaboração de dieta, catálogo de design system e suíte de testes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Princípio I (Atomic Design)**: `PASS`. Primitivos em `src/components/ui/` permanecem genéricos; componentes pai de seleção `SelectField` e `ActionDropdown` são alocados nas camadas `atoms` e `molecules`; modais e organismos consomem exclusivamente as camadas inferiores.
- **Princípio II (Canonical Design System)**: `PASS`. Todos os triggers e menus consomem as receitas canônicas (`recipes.input`, `recipes.button`) e tokens de espaçamento/elevação (`z-modal`, `z-dropdown`, `rounded-control`, `text-style-*`).
- **Princípio III (Desktop Scope & Accessibility)**: `PASS`. Escopo desktop >= 1024px, suporte completo a navegação por teclado, foco visível e roles ARIA combobox/listbox.
- **Princípio IV (Test-First Quality)**: `PASS`. Testes unitários para `SelectField`, `ActionDropdown` e testes de regressão dos modais.
- **Princípio V (Spec-Driven Execution)**: `PASS`. Rastreabilidade completa entre requisitos, plano e tarefas.

## Project Structure

### Documentation (this feature)

```text
specs/19-08-26-padronizacao-dropdowns-e-listas/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Phase 0 technical research
├── data-model.md        # Phase 1 data contracts & prop models
├── quickstart.md        # Phase 1 verification guide
├── contracts/
│   └── dropdown-contracts.md # Component interface contracts
├── checklists/
│   ├── requirements.md  # Spec quality checklist
│   └── dropdowns.md     # Dropdown quality checklist
└── tasks.md             # Phase 2 implementation tasks
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ui/
│   │   ├── select.tsx               # Primitivo Radix Select com receitas canônicas
│   │   └── dropdown-menu.tsx        # Primitivo Radix DropdownMenu com receitas canônicas
│   ├── atoms/
│   │   ├── SelectField.tsx          # [NEW] Componente pai padronizado de seleção de opções
│   │   ├── Button.tsx               # Botões canônicos
│   │   └── index.ts                 # Exporta SelectField
│   ├── molecules/
│   │   ├── ActionDropdown.tsx       # [NEW] Componente pai padronizado de menu de ações contextuais
│   │   ├── CreatePatientModal.tsx   # [MODIFY] Consome SelectField
│   │   ├── EditPatientModal.tsx     # [MODIFY] Consome SelectField
│   │   ├── CreatePresetModal.tsx    # [MODIFY] Consome SelectField
│   │   ├── CreateRecipeModal.tsx    # [MODIFY] Consome SelectField
│   │   ├── CustomFoodModal.tsx      # [MODIFY] Consome SelectField
│   │   ├── NextEventModal.tsx       # [MODIFY] Consome SelectField
│   │   ├── CopyVariationModal.tsx   # [MODIFY] Consome SelectField
│   │   └── index.ts                 # Exporta ActionDropdown e SelectField
│   ├── organisms/
│   │   └── foods/
│   │       └── FoodFilterHeader.tsx # [MODIFY] Consome SelectField
│   └── templates/
│       └── DietBuilderTemplate.tsx  # [MODIFY] Consome ActionDropdown
└── app/
    └── design-system/               # Atualização dos previews e catálogo de componentes

tests/
├── components/
│   ├── atoms/
│   │   └── SelectField.test.tsx     # [NEW] Testes unitários do componente pai SelectField
│   ├── molecules/
│   │   └── ActionDropdown.test.tsx  # [NEW] Testes unitários do componente pai ActionDropdown
│   └── ui/
│       └── select.test.tsx          # Testes de regressão do primitivo
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Nenhuma | N/A | N/A |
