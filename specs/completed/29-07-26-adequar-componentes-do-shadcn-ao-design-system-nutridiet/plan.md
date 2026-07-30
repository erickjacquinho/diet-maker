# Implementation Plan: Adequação dos Componentes Shadcn ao Design System NutriDiet

**Branch**: `main` | **Date**: 2026-07-29 | **Spec**: [spec.md](file:///c:/Programmer/diet-maker/specs/29-07-26-adequar-componentes-do-shadcn-ao-design-system-nutridiet/spec.md)

**Input**: Feature specification from `specs/29-07-26-adequar-componentes-do-shadcn-ao-design-system-nutridiet/spec.md`

## Summary

Refatorar os 14 componentes UI shadcn atualmente instalados em `src/components/ui/` para alinhamento 100% com o Design System NutriDiet (*Swiss Warm Minimalist Flat Design*). Isso envolve a substituição de classes utilitárias genéricas do Tailwind por tokens semânticos (`warm-*`), imposição de raio de borda tokenizado (`rounded-2xl`, `rounded-xl`, `rounded-full`), remoção completa de sombras (`shadow-none`) e aplicação da tipografia `Plus Jakarta Sans` e `Inter`.

## Technical Context

**Language/Version**: TypeScript 5.x / Next.js 14+ (App Router)

**Primary Dependencies**: React 18/19, Radix UI primitives, Tailwind CSS, class-variance-authority (`cva`), `clsx`, `tailwind-merge`, Lucide React

**Storage**: N/A (Componentes UI puros)

**Testing**: React Testing Library / Jest / Playwright

**Target Platform**: Web Browsers (Responsive Desktop & Mobile)

**Project Type**: Next.js Fullstack Web Application (Component Layer)

**Performance Goals**: 60fps animações / micro-interações (150-200ms transitions), zero render blocking, zero CSS footprint desnecessário

**Constraints**: Swiss Warm Minimalist Flat Design (Zero box-shadow, zero gradients, 1px solid borders, WCAG AA contrast)

**Scale/Scope**: 14 componentes UI em `src/components/ui/`

## Constitution Check

*GATE: All checks pass.*
- Zero box-shadow: Pass (Remover `shadow`, `shadow-sm`, `shadow-md`, `shadow-lg` de todos os 14 componentes)
- Zero gradients: Pass (Usar apenas cores sólidas `warm-*`)
- Raio de borda estrito: Pass (`rounded-2xl` para Cards/Modais, `rounded-xl` para Inputs/Botões, `rounded-full` para Badges)
- Iconografia: Pass (Usar Lucide React exclusivamente)

## Project Structure

### Documentation (this feature)

```text
specs/29-07-26-adequar-componentes-do-shadcn-ao-design-system-nutridiet/
├── plan.md              # Este arquivo
├── research.md          # Pesquisa de mapeamento de tokens e variantes cva
├── data-model.md        # Mapeamento dos contratos de props e tokens por componente
├── quickstart.md        # Guia de teste e validação dos componentes refatorados
├── contracts/           # Especificação das interfaces de cada componente UI
│   └── ui-components.md
└── tasks.md             # Lista de tarefas executáveis (Phase 2)
```

### Source Code

```text
src/
└── components/
    └── ui/
        ├── badge.tsx
        ├── button.tsx
        ├── card.tsx
        ├── dialog.tsx
        ├── dropdown-menu.tsx
        ├── input.tsx
        ├── popover.tsx
        ├── scroll-area.tsx
        ├── select.tsx
        ├── separator.tsx
        ├── sheet.tsx
        ├── table.tsx
        ├── tabs.tsx
        └── tooltip.tsx
```

**Structure Decision**: Modificar diretamente os 14 arquivos existentes em `src/components/ui/` para preservar imports existentes `@/components/ui/*`.
