# Implementation Plan: Adequação da Tipografia da Sidebar

**Branch**: `specs/07-08-26-adequar-sidebar-tipografia` | **Date**: 2026-08-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/07-08-26-adequar-sidebar-tipografia/spec.md`

## Summary

Ajustar a variante `sidebarMenuButtonVariants` em `src/components/ui/sidebar.tsx` para incluir o peso de fonte `font-semibold` (`600`) no estado padrão/inativo, alinhando o componente ao contrato tipográfico `nav-item` estipulado no Design System (`05-typography-system.md`).

## Technical Context

**Language/Version**: TypeScript 5 / React 19 / Next.js (App Router)
**Primary Dependencies**: TailwindCSS, class-variance-authority (cva), Lucide React
**Storage**: N/A
**Testing**: Vitest, Testing Library React
**Target Platform**: Web (Desktop & Mobile Responsive)
**Project Type**: Web application
**Performance Goals**: Renderização sem oscilações visuais ou reflows
**Constraints**: 100% de conformidade com o catálogo tipográfico do `@design-system`
**Scale/Scope**: Componentes `SidebarMenuButton` em `src/components/ui/sidebar.tsx`

## Constitution Check

- Passa em todas as verificações do Design System (`05-typography-system.md`).

## Project Structure

### Documentation (this feature)

```text
specs/07-08-26-adequar-sidebar-tipografia/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan
├── research.md          # Phase 0 decision log
├── data-model.md        # Component & token specs
├── quickstart.md        # Validation guide
├── contracts/           # UI Component contract
│   └── sidebar-navigation.md
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code

```text
src/
├── components/
│   ├── ui/
│   │   └── sidebar.tsx   # Primitiva de UI a ser atualizada
│   └── molecules/
│       └── SidebarNavItem.tsx
```

## Complexity Tracking

Sem violações ou complexidade adicionada.
