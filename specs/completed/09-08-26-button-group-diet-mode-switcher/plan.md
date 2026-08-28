# Implementation Plan: Button Group Diet Mode Switcher

**Branch**: `09-08-26-button-group-diet-mode-switcher` | **Date**: 2026-08-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/09-08-26-button-group-diet-mode-switcher/spec.md`

## Summary

Substituição dos botões isolados e cards em grid na seleção de modo de dieta e variações de ciclo no componente [`DietModeSwitcher.tsx`](file:///c:/Programmer/diet-maker/src/components/molecules/DietModeSwitcher.tsx) por componentes **Toggle Group / Button Group** shadcn. A implementação preserva o comportamento e geometria vanilla dos botões shadcn, aplicando os tokens de cores, hover e estado selecionado (`selected`) do nosso design system para garantir uma navegação fluida, clara e de baixo footprint visual.

## Technical Context

**Language/Version**: TypeScript / React 19 / Next.js App Router  
**Primary Dependencies**: `lucide-react`, `tailwindcss`, `@radix-ui/react-toggle-group` / `shadcn/ui` (`ToggleGroup`, `Tabs`), `clsx`, `tailwind-merge` (`cn`)  
**Storage**: Client State / `dietStore.ts` (local storage)  
**Testing**: Manual / Webapp UI testing  
**Target Platform**: Modern Web Browsers (Desktop & Mobile)  
**Project Type**: Next.js React Web Application  
**Performance Goals**: Instant visual feedback (<50ms state transition)  
**Constraints**: Sem alteração brusca na geometria base do botão vanilla shadcn; preservação integral das props de `DietModeSwitcherProps`.

## Constitution Check

*GATE: All principles from design system governance & architecture boundaries pass.*

- **Design System Tokens**: Utilizar exclusivamente tokens semânticos (`bg-surface`, `bg-surface-subtle`, `border-border-subtle`, `text-text-primary`, `text-text-muted`, `bg-primary`, `border-success`, `hover:bg-surface-hover`).
- **Component Boundaries**: Modificar a apresentação interna de `DietModeSwitcher.tsx` sem alterar o contrato externo exportado.

## Project Structure

### Documentation (this feature)

```text
specs/09-08-26-button-group-diet-mode-switcher/
├── spec.md                   # Especificação funcional e cenários de aceite
├── plan.md                   # Este plano de implementação
├── checklists/
│   └── requirements.md       # Quality checklist das especificações
└── tasks.md                  # Tarefas de implementação com skill assignments
```

### Source Code Impact

```text
src/
├── components/
│   ├── ui/
│   │   └── toggle-group.tsx  # Componente UI shadcn ToggleGroup (ou import existente)
│   └── molecules/
│       ├── DietModeSwitcher.tsx  # Componente refatorado para usar Button Group / ToggleGroup
│       └── index.ts
```

**Structure Decision**: Refatorar `DietModeSwitcher.tsx` para compor `ToggleGroup` e `ToggleGroupItem` (ou `Tabs` segmentados shadcn) mantendo 100% das props existentes.

## Complexity Tracking

Nenhuma violação constitucional detectada.
