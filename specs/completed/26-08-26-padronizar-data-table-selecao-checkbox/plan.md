# Implementation Plan: Padronização do Componente DataTable com Seleção e Checkbox Canônico

**Branch**: 26-08-26-padronizar-data-table-selecao-checkbox | **Date**: 2026-08-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from specs/26-08-26-padronizar-data-table-selecao-checkbox/spec.md

## Summary

Padronizar a experiência de tabelas em todo o sistema criando o átomo canônico Checkbox (@/components/atoms/Checkbox.tsx) e estendendo a molécula DataTable (@/components/molecules/DataTable.tsx) com suporte declarativo a seleção (mode: 'single' | 'multi'), estados acessíveis (checked, unchecked, indeterminate), posicionamento fixo padronizado (1ª coluna w-10), tipografia e cabeçalho fixo com rolagem suave (stickyHeader). Refatorar as tabelas de alimentos para consumir essa infraestrutura padronizada sem regressões.

## Technical Context

**Language/Version**: TypeScript 5.x / Next.js 14+ (React 18/19 App Router)

**Primary Dependencies**: React, Tailwind CSS, Lucide React (Check), Radix UI (primitivas existentes)

**Storage**: N/A (componente puro de UI controlado via props)

**Testing**: Vitest, @testing-library/react

**Target Platform**: Web Desktop (>= 1024px)

**Project Type**: Web Application / Design System UI Component Molecule & Atom

**Performance Goals**: Renderização determinística, 0 re-renderizações desnecessárias em listas de até centenas de itens, rolagem a 60fps

**Constraints**: Desktop >= 1024px, WCAG 2.2 AA (teclado + focus ring visível), Atomic Design estrito (primitivas em ui e átomos em toms sem dependência de domínio)

**Scale/Scope**: Todas as tabelas do aplicativo (busca de alimentos TACO, substituição, pacientes, histórico de consultas, dietas, avaliações)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Princípio I (Atomic Design Architecture)**: PASS. O novo Checkbox reside em src/components/atoms/Checkbox.tsx e consome apenas @/lib/utils e ícones lucide-react. O DataTable reside em src/components/molecules/DataTable.tsx e consome átomos/ui. Zero dependências reversas ou acoplamento com entidades de domínio (	acoStore, patientsStore).
- **Princípio II (Canonical Design System)**: PASS. Consome exclusivamente tokens de cor semânticos (g-primary, g-surface-subtle, order-border-subtle, 	ext-macro-*), tipografia (	ext-style-chart-micro, 	ext-style-legal), geometria (ounded-compact) e focus ring (ocus-visible:ring-primary-focus).
- **Princípio III (Desktop Scope and Accessibility)**: PASS. Escopo desktop >= 1024px. Acessibilidade WCAG 2.2 AA completa (ole=checkbox, ria-checked, ria-label, navegação por teclado e foco visível).
- **Princípio IV (Test-First Quality and Isolation)**: PASS. Testes unitários dedicados para o átomo Checkbox e para a molécula DataTable com seleção em 	ests/.
- **Princípio V (Spec-Driven Execution)**: PASS. Executado estritamente via fluxo SDD.

## Project Structure

### Documentation (this feature)

`	ext
specs/26-08-26-padronizar-data-table-selecao-checkbox/
├── spec.md              # Feature specification
├── plan.md              # This file (Implementation plan)
├── research.md          # Phase 0 output (Decisions and rationale)
├── data-model.md        # Phase 1 output (Types and contracts)
├── quickstart.md        # Phase 1 output (Validation scenarios)
├── contracts/           # Phase 1 output (Interface contracts)
│   └── data-table-selection-contract.md
├── checklists/          # Checklists
│   ├── requirements.md
│   ├── data-table-selection.md
│   └── visual-consistency.md
└── tasks.md             # Phase 2 output (/speckit-tasks command)
`

### Source Code (repository root)

`	ext
src/
├── components/
│   ├── atoms/
│   │   ├── Checkbox.tsx                                 # NOVO: Átomo Checkbox Canônico
│   │   └── index.ts                                     # Export do Checkbox
│   ├── molecules/
│   │   ├── DataTable.tsx                                # MODIFICAR: Suporte a selection e stickyHeader
│   │   ├── data-table/
│   │   │   ├── types.ts                                 # MODIFICAR: DataTableSelectionConfig & Props
│   │   │   └── utils.ts                                 # MODIFICAR: Utilitários de seleção
│   │   ├── FoodSearchModal.tsx                          # MODIFICAR: Uso do DataTable
│   │   ├── SubstituteFoodModal.tsx                      # MODIFICAR: Uso do DataTable
│   │   └── food-search/
│   │       └── FoodSearchResultsList.tsx               # MODIFICAR: Refatoração para usar DataTable
tests/
├── components/
│   ├── atoms/
│   │   └── Checkbox.test.tsx                            # NOVO: Testes do átomo Checkbox
│   └── molecules/
│       ├── data-table.test.tsx                          # MODIFICAR: Testes de seleção do DataTable
│       ├── food-search-modal.test.tsx                   # Validar não-regressão
│       └── substitute-food-modal.test.tsx               # Validar não-regressão
`

**Structure Decision**: A estrutura segue rigorosamente o padrão Atomic Design do projeto, criando o átomo Checkbox em src/components/atoms/, estendendo DataTable em src/components/molecules/data-table/ e refatorando os consumidores especializados em src/components/molecules/.

## Complexity Tracking

> Nenhuma violação constitucional detectada. Nenhuma complexidade extra injustificada.
