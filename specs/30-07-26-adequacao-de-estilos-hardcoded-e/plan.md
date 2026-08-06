# Implementation Plan: Adequação de Estilos Hardcoded e Arquitetura de Componentes em src/app

**Branch**: `30-07-26-adequacao-de-estilos-hardcoded-e` | **Date**: 30/07/2026 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/30-07-26-adequacao-de-estilos-hardcoded-e/spec.md`

## Summary

Substituir utilitários de cores brutas (ex: `text-blue-600`, `text-orange-500`, `text-emerald-700`, `bg-rose-50`) e tamanhos arbitrários (`text-[10px]`, `text-[11px]`, `text-[9px]`, `max-h-[90vh]`) em 100% dos 10 arquivos de rota existentes em `src/app` por tokens semânticos e utilitários padronizados do Design System NutriDiet. Desacoplar modais e formulários inline das páginas de rota para a hierarquia do Atomic Design (`src/components/molecules` e `src/components/organisms`), reduzindo acoplamento e preservando os componentes base do Shadcn UI limpos.

## Technical Context

**Language/Version**: TypeScript 5+ / React 19 / Next.js 15 (App Router)

**Primary Dependencies**: Tailwind CSS, Shadcn UI (`@radix-ui`), Lucide React, Sonner

**Storage**: LocalStorage (`tacoStore`, `patientsStore`, `recipesStore`, `dietStore`, `presets`)

**Testing**: Compilação estática Next.js (`npm run build`), testes visuais e funcionais Playwright

**Target Platform**: Web Browsers (Chrome, Edge, Firefox, Safari) em ambiente local/desktop

**Project Type**: Next.js Fullstack Web Application (Client Components & App Router Pages)

**Performance Goals**: Renderização rápida de tabelas nutricionais sem repinturas desnecessárias

**Constraints**: Preservação de 100% dos dados existentes no `localStorage` e fidelidade estética total ao tema Swiss Flat Minimalist

**Scale/Scope**: 10 arquivos de rota sob `src/app` e componentes auxiliares em `src/components/`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Regra Prioritária Nº 1 (Atomic Design)**: As modais e formulários refatorados devem ser alocados estritamente em `src/components/molecules/` ou `src/components/organisms/`.
- **Regra Prioritária Nº 2 (Preservação do Shadcn UI)**: Os componentes base de `src/components/ui/` devem continuar sem acoplamento a regras de negócio locais.

## Project Structure

### Documentation (this feature)

```text
specs/30-07-26-adequacao-de-estilos-hardcoded-e/
├── spec.md              # Especificação de requisitos
├── plan.md              # Este plano de implementação
├── checklists/          # Checklists de qualidade
│   └── design_system.md
└── tasks.md             # Tarefas de implementação
```

### Source Code Structure

```text
src/
├── app/                 # Level 5: Páginas (Next.js App Router - Rotas limpas)
│   ├── alimentos/
│   ├── design-system/
│   ├── pacientes/
│   ├── presets/
│   ├── receitas/
│   └── refeicoes-prontas/
├── components/
│   ├── atoms/           # Level 1: Átomos
│   ├── molecules/       # Level 2: Moléculas (incluindo Modais especializadas)
│   ├── organisms/       # Level 3: Organismos
│   ├── templates/       # Level 4: Templates
│   └── ui/              # Shadcn UI Base Primitivos (Preservados)
└── design-system/
    ├── nutridiet/MASTER.md
    └── tokens.css       # Fonte da verdade dos tokens de design
```

**Structure Decision**: Padrão Atomic Design com Next.js App Router. As páginas em `src/app/` injetam dados e invocam compostos desacoplados em `src/components/`.

## Complexity Tracking

Nenhuma violação identificada. O plano reduz a complexidade ao desacoplar arquivos monolíticos de página em componentes reutilizáveis.
