# Implementation Plan: Revisão e Refatoração de Componentes e src/app

**Branch**: `specs/30-07-26-revisao-e-refatoracao-de-componentes` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/30-07-26-revisao-e-refatoracao-de-componentes/spec.md`

## Summary

Executar a refatoração do design system e das páginas em `src/app` aplicando as diretrizes de **Vercel Composition Patterns** e **Code Reviewer Expert**:
1. **Consolidação de Átomos**: Unificar `IconButton`, `EditIconButton` e `DeleteIconButton` no módulo `Button.tsx`; migrar variantes de cores do `Badge.tsx` para `cva` no `ui/badge.tsx`; simplificar exportações de `Input.tsx`.
2. **Composição na Sidebar**: Transformar as 4 moléculas da Sidebar (`SidebarBrand`, `SidebarNavItem`, `SidebarUserProfile`, `SidebarQuickActions`) em um padrão *Compound Component* (`SidebarNav`), reduzindo arquivos soltos e isolados.
3. **Adequação de 100% dos Arquivos de `src/app`**: Refatorar todas as páginas (`/pacientes`, `/pacientes/[id]`, `/pacientes/[id]/consulta/[date]`, `/pacientes/[id]/dieta/[dietaId]`, `/alimentos`, `/presets`, `/receitas`, `/refeicoes-prontas`, `/design-system`) para utilizar as novas assinaturas de componentes unificados, garantindo estrita tipagem TypeScript (sem `any`), tratamento de erros e sem mutação direta de estados.

## Technical Context

**Language/Version**: TypeScript 5.x / Next.js 15 (App Router) / React 19

**Primary Dependencies**: Tailwind CSS, Lucide React, Radix UI Primitives (`@/components/ui/*`), Class Variance Authority (`cva`)

**Storage**: `localStorage` (via `patientsStore.ts`, `recipesStore.ts`, `tacoStore.ts`)

**Testing**: Vitest (`npm run test`)

**Target Platform**: Browser / Desktop (Next.js SSR + Client Components)

**Project Type**: Web Application

**Performance Goals**: Zero avisos de renderização React, zero inconsistências visuais, tempo de build acelerado pelo menor número de componentes soltos.

**Constraints**: Preservar compatibilidade de imports e re-exports em `@/components/atoms` e `@/components/molecules`.

## Constitution Check

- **Component Architecture**: Sem proliferação de boolean props; uso de composição e variantes explícitas.
- **State Management**: Estado mantido no nível do container/page ou via hooks customizados isolados.
- **Type Safety**: Proibido `any`, asserções cegas de tipo ou supressão com `@ts-ignore`.

## Project Structure

### Documentation (this feature)

```text
specs/30-07-26-revisao-e-refatoracao-de-componentes/
├── spec.md
├── plan.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code Refactoring Targets

```text
src/
├── components/
│   ├── atoms/
│   │   ├── Button.tsx           # [MODIFY] Consolidar Button + IconButton + CreateButton + SecondaryActionButton + EditIconButton + DeleteIconButton
│   │   ├── IconButton.tsx       # [DELETE/REFACTOR] Re-exportar a partir de Button.tsx ou descontinuar arquivo solto
│   │   ├── Badge.tsx            # [MODIFY] Delegar variantes de cor diretamente para cva em ui/badge.tsx
│   │   ├── Input.tsx            # [MODIFY] Re-exportar primitivo ui/input.tsx
│   │   └── index.ts             # [MODIFY] Atualizar exportações
│   ├── molecules/
│   │   ├── SidebarBrand.tsx     # [MERGE] Integrar ao Compound Component SidebarNav
│   │   ├── SidebarNavItem.tsx   # [MERGE] Integrar ao Compound Component SidebarNav
│   │   ├── SidebarUserProfile.tsx # [MERGE] Integrar ao Compound Component SidebarNav
│   │   ├── SidebarQuickActions.tsx # [MERGE] Integrar ao Compound Component SidebarNav
│   │   └── index.ts             # [MODIFY] Atualizar exportações
│   ├── organisms/
│   │   └── SidebarNav.tsx       # [MODIFY] Implementar padrão Compound Component
│   └── ui/
│       ├── badge.tsx            # [MODIFY] Adicionar variantes cva (emerald, rose, amber, teal, blue)
│       └── button.tsx           # [MODIFY] Manter primitivos base cva
└── app/
    ├── alimentos/page.tsx       # [MODIFY] Adequar aos novos componentes
    ├── design-system/page.tsx   # [MODIFY] Atualizar vitrine do Design System
    ├── pacientes/
    │   ├── page.tsx             # [MODIFY] Adequar listagem e modal de cadastro
    │   └── [id]/
    │       ├── page.tsx         # [MODIFY] Adequar perfil do paciente
    │       ├── consulta/[date]/page.tsx # [MODIFY] Adequar formulário de consulta
    │       └── dieta/[dietaId]/page.tsx # [MODIFY] Adequar montador de dieta
    ├── presets/page.tsx         # [MODIFY] Adequar grid de presets
    ├── receitas/page.tsx        # [MODIFY] Adequar cadastro de receitas
    └── refeicoes-prontas/page.tsx # [MODIFY] Adequar refeições prontas
```
