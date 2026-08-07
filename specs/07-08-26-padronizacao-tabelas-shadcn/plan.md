# Implementation Plan: Padronização de Tabelas com Shadcn Data Table

**Branch**: `specs/07-08-26-padronizacao-tabelas-shadcn` | **Date**: 2026-08-07 | **Spec**: [spec.md](spec.md)

## Summary

Substituir o uso da biblioteca externa `@tanstack/react-table` e a marcação manual de tabelas HTML por um componente genérico e reutilizável Shadcn `DataTable` (`src/components/ui/data-table.tsx`). O plano engloba a criação do novo primitivo em `components/ui`, a desinstalação de `@tanstack/react-table` e a refatoração das 3 tabelas ativas da aplicação (`FoodTableSection`, `PatientListTable` e `PatientConsultationHistoryTable`).

## Technical Context

**Language/Version**: TypeScript 5.7 / React 19 / Next.js 15 App Router  
**Primary Dependencies**: Next.js, React, Tailwind CSS, Lucide React, Shadcn Primitives (`@/components/ui/table`)  
**Storage**: LocalStorage / In-memory store  
**Testing**: Vitest / TypeScript Type Checker  
**Target Platform**: Web Browsers (Desktop & Tablet)  
**Project Type**: Next.js Web Application  
**Performance Goals**: Instant client-side table rendering without additional bundle size  
**Constraints**: Zero external table libraries (`@tanstack/react-table` removed), 100% Shadcn Design System compliance  
**Scale/Scope**: 3 main tables in application  

## Constitution Check

*GATE: All gates passed.*
- Preserva todas as funcionalidades existentes de ordenação, navegação e expansão de detalhes.
- Não introduz dependências adicionais.
- Mantém o padrão Atomic Design (`src/components/ui/` -> `organisms/`).

## Project Structure

### Documentation (this feature)

```text
specs/07-08-26-padronizacao-tabelas-shadcn/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── checklists/
    ├── requirements.md  # Requirements quality checklist
    └── data-table.md    # Data table checklist
```

### Source Code Impacted

```text
src/
├── components/
│   ├── ui/
│   │   ├── table.tsx              # Base Shadcn primitive (preserved)
│   │   └── data-table.tsx         # [NEW] Reusable generic DataTable component
│   └── organisms/
│       ├── PatientListTable.tsx                  # [REFAC] Converted to DataTable
│       ├── PatientConsultationHistoryTable.tsx   # [REFAC] Converted to DataTable
│       ├── foods/
│       │   ├── FoodTableSection.tsx              # [REFAC] Removed tanstack, converted to DataTable
│       │   └── useFoodTableColumns.tsx           # [DELETE] Unused tanstack column file
│       └── patient/
│           └── ConsultationHistoryRow.tsx        # Adjusted for DataTable subrows if needed
├── hooks/
│   └── useFoodSearchPage.ts                      # [REFAC] Removed tanstack SortingState types
package.json                                      # [REFAC] Removed @tanstack/react-table
```

## Complexity Tracking

| Item | Status | Notes |
|------|--------|-------|
| Generic `DataTable` component | Simple | Clean abstraction over `@/components/ui/table` |
| `@tanstack/react-table` removal | Direct | Uninstalls package and removes imports |
