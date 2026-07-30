# Implementation Plan: Duplos Botões no Card de Dieta (Read-Only e Editar)

**Branch**: `29-07-26-2-botoes-no-card-de` | **Date**: 2026-07-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/29-07-26-2-botoes-no-card-de/spec.md`

## Summary

Substituir o botão único "Abrir no Construtor de Dietas >" no card de prescrição dietética do prontuário do paciente (`src/app/pacientes/[id]/page.tsx`) por uma área de ação dupla contendo:
1. Botão "Ver Dieta" (ou "Visualizar Dieta") à esquerda que abre uma modal/dialog em formato **Read-Only** para visualizar a prescrição completa (refeições, horários, alimentos, macronutrientes).
2. Botão de Ícone de Edição (lápis) posicionado à direita da área de ações para navegar diretamente ao Construtor de Dietas (`/pacientes/[id]/dieta/[dietaId]`).

## Technical Context

**Language/Version**: TypeScript / React 19 / Next.js (App Router)

**Primary Dependencies**: Lucide React icons (`Eye`, `Pencil`, `Utensils`, `X`), Shadcn UI Dialog, Tailwind CSS

**Storage**: State local / Store de pacientes (`src/lib/patientsStore.ts`)

**Testing**: React Testing Library / Playwright webapp testing

**Target Platform**: Web browsers (Desktop & Mobile)

**Project Type**: Next.js Web Application

**Performance Goals**: Abertura instantânea da modal Read-Only (< 100ms) sem requisições adicionais desnecessárias.

**Constraints**: Preservar o design system mineral/warm (tons warm-card, warm-border, warm-charcoal, warm-emerald).

## Constitution Check

*GATE: All checks pass.*
- Sem complexidade desnecessária.
- Reuso dos componentes existentes do design system.

## Project Structure

### Documentation (this feature)

```text
specs/29-07-26-2-botoes-no-card-de/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code

```text
src/
├── app/
│   └── pacientes/
│       └── [id]/
│           └── page.tsx                      # Card de dieta + Estado da modal Read-Only
├── components/
│   ├── molecules/
│   │   └── ReadOnlyDietModal.tsx             # Modal de visualização somente leitura da dieta
│   └── ui/                                   # Componentes Shadcn (Dialog, Button, etc.)
```

**Structure Decision**: Criar/garantir o componente `ReadOnlyDietModal` em `src/components/molecules/ReadOnlyDietModal.tsx` e integrá-lo em `src/app/pacientes/[id]/page.tsx`.
