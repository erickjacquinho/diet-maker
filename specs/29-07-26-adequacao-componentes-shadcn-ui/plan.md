# Implementation Plan: Adequação de 100% dos Componentes de Telas e Modais ao Design System Shadcn

**Branch**: `29-07-26-adequacao-componentes-shadcn-ui` | **Date**: 29/07/2026 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/29-07-26-adequacao-componentes-shadcn-ui/spec.md`

## Summary

Mapear 100% dos arquivos em `src/` (telas em `src/app`, modais e componentes em `src/components/atoms`, `molecules`, `organisms` e `templates`) e executar a substituição de elementos HTML nativos (`<button>`, `<input>`, `<select>`, `<table`) e overlays customizados (`fixed inset-0`) por componentes derivados do Shadcn/Radix em `@/components/ui/` (`Button`, `Input`, `Select`, `Dialog`, `Sheet`, `Card`, `Badge`, `Table`, `Tabs`, `Tooltip`, `DropdownMenu`, `Popover`, `ScrollArea`, `Separator`).

## Technical Context

**Language/Version**: TypeScript / React 19 / Next.js 15 App Router

**Primary Dependencies**: Tailwind CSS, Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-select`, `@radix-ui/react-dropdown-menu`, etc.), Lucide React icons, `clsx`, `tailwind-merge`.

**Storage**: LocalStore / React state (`patientsStore.ts`, `tacoStore.ts`).

**Testing**: React Testing Library / Playwright webapp verification.

**Target Platform**: Web (Desktop & Mobile Responsive).

**Project Type**: Next.js Web Application.

**Performance Goals**: Renderização fluida a 60fps sem rerenders desnecessários ao abrir/fechar modais.

**Constraints**: Preservar 100% da reatividade, estado dos formulários e handlers de eventos sem regressão.

**Scale/Scope**: 100% dos componentes em `/src` (6 rotas de páginas, 14 componentes base Shadcn em `src/components/ui`, 12 componentes em `src/components/atoms`, `molecules`, `organisms`, `templates`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Princípio de Consistência Visual: Todos os componentes interativos devem derivar de `@/components/ui/`.
- [x] Princípio de Acessibilidade Radix: Modais devem usar primitivos acessíveis Radix (`Dialog`, `Sheet`).
- [x] Princípio de Não-Regressão: Manter APIs e props em `atoms/*` onde for mantido para compatibilidade.

## Project Structure

### Documentation (this feature)

```text
specs/29-07-26-adequacao-componentes-shadcn-ui/
├── spec.md              # Especificação de requisitos
├── plan.md              # Plano de implementação (este arquivo)
├── research.md          # Pesquisa e inventário de componentes em /src
├── data-model.md        # Mapeamento de componentes e migrações UI
├── quickstart.md        # Guia de validação das telas e modais
└── checklists/
    ├── requirements.md  # Checklist de qualidade dos requisitos
    └── ui.md            # Checklist de adequação Shadcn UI
```

### Source Code Layout

```text
src/
├── app/
│   ├── alimentos/page.tsx                      # Tela Tabela TACO + Modais
│   ├── pacientes/page.tsx                      # Tela Lista Pacientes + Modal Cadastro
│   ├── pacientes/[id]/page.tsx                 # Detalhes Paciente + Modal Novo Plano
│   ├── pacientes/[id]/dieta/[dietaId]/page.tsx # Montador de Dieta + Modais Refeição/TACO
│   ├── presets/page.tsx                        # Presets + Modal Criar Preset
│   └── refeicoes-prontas/page.tsx              # Refeições Prontas + Modal
├── components/
│   ├── atoms/                                  # Legacy Atoms (Button, Input, Badge, IconButton, Avatar, ProgressBar)
│   ├── molecules/                              # MacroMetricCard, MealItemRow, PatientBadgeHeader, TacoSearchInput
│   ├── organisms/                              # MacroTrackerHeader, MealCardContainer, SidebarNav
│   ├── templates/                              # AppLayoutShell, DietBuilderTemplate
│   └── ui/                                     # 14 Shadcn primitives (button, input, select, dialog, sheet, card, badge, table, etc.)
└── design-system/
    └── tokens.ts
```

**Structure Decision**: Aplicação Next.js App Router com arquitetura atômica e primitives do Shadcn em `src/components/ui/`.
