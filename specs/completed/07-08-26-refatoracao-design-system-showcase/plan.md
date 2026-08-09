# Implementation Plan: Refatoração da Página /design-system (Showcase Visual)

**Branch**: `refatoracao-design-system-showcase` | **Date**: 2026-08-07 | **Spec**: [spec.md](file:///c:/Programmer/diet-maker/specs/07-08-26-refatoracao-design-system-showcase/spec.md)

**Input**: Feature specification from `specs/07-08-26-refatoracao-design-system-showcase/spec.md`

## Summary

Refatorar completamente a página `/design-system` para transformá-la de uma listagem de texto/JSON em uma Galeria Showcase de Design System viva e interativa. A nova experiência apresentará os tokens de design (cores com swatches e contrastes, escala tipográfica editável, spacing e elevação) e todos os componentes (Átomos, Moléculas e Organismos) com controles de variantes em tempo real (Playground) e alternância entre o "Modo Showcase Cliente" (apresentação visual de alto nível) e "Modo Dev Spec" (snippets e tokens).

## Technical Context

**Language/Version**: TypeScript / React 19 / Next.js App Router
**Primary Dependencies**: Tailwind CSS, Lucide React, Design System recipes (`@/design-system`)
**Storage**: N/A (Estado local reativo em memória)
**Testing**: Playwright webapp testing / Vitest
**Target Platform**: Desktop Web (≥1024px)
**Project Type**: Web Application Design System Showcase
**Performance Goals**: Renderização inicial <200ms, transições de estado instantâneas (<50ms)
**Constraints**: Sem dependências pesadas adicionais de Storybook; total conformidade com WCAG 2.2 AA.
**Scale/Scope**: ~30 componentes cadastrados (Átomos, Moléculas, Organismos) e 40+ tokens de design.

## Constitution Check

*GATE: Passed*
- **Atomic Design Architecture**: Respeitada integralmente. O showcase apresentará separação estrita de Átomos, Moléculas e Organismos.
- **Canonical Design System**: As fontes da verdade (`@/design-system`, `globals.css`) alimentam diretamente o showcase visual.
- **Desktop Scope and Accessibility**: Target desktop ≥1024px, suporte total a navegação por teclado e verificação visual de contraste WCAG AA.
- **Test-First Quality**: Planos de teste visual e interatividade integrados no Quickstart.
- **Spec-Driven Execution**: SDD completo criado com rastreabilidade total.

## Project Structure

### Documentation (this feature)

```text
specs/07-08-26-refatoracao-design-system-showcase/
├── spec.md              # Especificação de requisitos e histórias de usuário
├── plan.md              # Este plano de implementação
├── research.md          # Pesquisa de arquitetura e decisões de design
├── data-model.md        # Entidades e esquema dos tokens/componentes no showcase
├── quickstart.md        # Guia de teste e validação rápida
├── contracts/           # Contratos de interface dos componentes de showcase
│   └── showcase-api.md
└── checklists/
    ├── requirements.md  # Checklist de qualidade da especificação
    └── ui-ux-showcase.md# Checklist de validação visual e UX
```

### Source Code (repository root)

```text
src/
├── app/
│   └── design-system/
│       ├── page.tsx                             # Página principal refatorada do Showcase
│       └── components/
│           ├── ShowcaseHeader.tsx               # Banner principal da marca NutriDiet
│           ├── TokenSwatchesSection.tsx         # Exibição gráfica dos tokens (cores, tipos, spacing)
│           ├── ComponentPlayground.tsx          # Sandbox de teste interativo de componentes
│           ├── CompositionGallery.tsx           # Showcase de montagens de telas/fluxos
│           └── ViewModeToggle.tsx               # Toggle entre Modo Cliente e Modo Dev Spec
```

**Structure Decision**: Componentes auxiliares de exibição organizados isoladamente dentro de `src/app/design-system/components/` para evitar poluição do repositório principal de componentes.

## Complexity Tracking

*Nenhuma violação constitucional identificada.*
