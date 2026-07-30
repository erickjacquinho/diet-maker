# Implementation Plan: Módulo de Receitas Culinárias

**Branch**: `30-07-26-criacao-do-modulo-de-receitas` | **Date**: 30/07/2026 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/30-07-26-criacao-do-modulo-de-receitas/spec.md`

## Summary

Implementação do módulo completo de Receitas Culinárias (`/receitas`), permitindo agrupar alimentos da tabela TACO, definir número de porções e modo de preparo, com cálculo dinâmico de macronutrientes por porção utilizando a arquitetura composta do `vercel-composition-patterns` e o componente `AutoKcalSection`.

## Technical Context

**Language/Version**: TypeScript / React 19 / Next.js (App Router)

**Primary Dependencies**: React, Lucide React, Tailwind CSS, `@/components/molecules/AutoKcalSection`, `@/lib/tacoStore`

**Storage**: `localStorage` (`nutridiet_recipes`)

**Testing**: Vitest + React Testing Library

**Target Platform**: Web Browsers (Desktop & Mobile)

**Project Type**: Next.js Web Application

**Performance Goals**: Filtragem e cálculo reativo instantâneo em tempo de digitação (< 16ms / 60fps).

**Constraints**: Adotar o padrão `vercel-composition-patterns` (componentes pequenos, compostos, estado elevado no container do modal).

## Project Structure

### Documentation (this feature)

```text
specs/30-07-26-criacao-do-modulo-de-receitas/
├── plan.md
├── spec.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   └── receitas/
│       └── page.tsx                  # Página catálogo e gerenciador de receitas
├── components/
│   ├── molecules/
│   │   ├── RecipeCard.tsx            # Card de exibição da receita em grid
│   │   └── RecipeIngredientRow.tsx   # Linha de ingrediente com gramagem e remoção
│   └── organisms/
│       ├── SidebarNav.tsx            # Navegação lateral com novo atalho
│       └── RecipeBuilderModal.tsx    # Modal de montagem da receita
└── lib/
    ├── recipesStore.ts               # Armazenamento e utilitários da entidade Recipe
    └── presetUtils.ts                # Regra pura de cálculo atwater (calculatePresetCalories)
```

**Structure Decision**: Criar uma nova rota `/receitas` e uma store isolada em `recipesStore.ts` que consome alimentos da `tacoStore.ts` e calcula as frações por porção.
