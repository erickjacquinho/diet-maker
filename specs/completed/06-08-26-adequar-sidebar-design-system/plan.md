# Implementation Plan: Adequação da Sidebar ao Design System

**Branch**: `06-08-26-adequar-sidebar-design-system` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/06-08-26-adequar-sidebar-design-system/spec.md`

## Summary

Corrigir a sidebar migrada para que sua geometria, tokens, tipografia, iconografia, movimento, estados acessíveis e composição correspondam ao Design System. O plano mantém as seis rotas flat e o shell desktop, transforma a aplicação em dona do pathname/modelo por meio de um adapter, elimina affordances falsas de perfil e ações sem callback, adiciona skip link e sincroniza os artefatos do catálogo.

A mudança será implementada por `/speckit-implement` depois da aprovação humana deste SDD. Este documento não implementa código.

## Technical Context

**Language/Version**: TypeScript/React no projeto Next.js App Router existente.

**Primary Dependencies**: Next.js navigation context, React, Lucide icons, Shadcn/Radix primitives existentes, Tailwind/token classes, Vitest e Testing Library já presentes no repositório.

**Storage**: N/A para esta feature; o provider continua em memória, sem cookie/localStorage.

**Testing**: Vitest/Testing Library para contratos determinísticos; `type-check`, ESLint, auditoria Atomic Design, verificadores do Design System e validação manual desktop.

**Target Platform**: Web desktop a partir de 1024px, tema claro.

**Project Type**: Aplicação web local desktop com App Router.

**Performance Goals**: Não adicionar chamadas de rede, listeners globais ou persistência; manter mudança de largura/estado dentro dos presets de motion e sem layout shift além de 224/64.

**Constraints**: Preservar seis rotas, ordem/URLs, estado inicial, ausência de Ctrl/Cmd+B e composição Shadcn genérica; cumprir WCAG 2.2 AA e a constituição local.

**Scale/Scope**: Um organismo, quatro moléculas, um primitivo sidebar, um template shell, um adapter app, modelo de navegação, catálogo e testes focados.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Atomic Design Architecture | `ui` permanece genérico; molecules não sobem para organism; organism compõe; template recebe slot; adapter fica em `app`. | PASS |
| II. Canonical Design System | Category navigation será consultada antes dos profiles; tokens, geometria, estados e governança são referenciados; novos valores exigem decisão. | PASS |
| III. Desktop Scope and Accessibility | Escopo 1024px/light; 224/64; WCAG 2.2 AA; teclado, focus ring, nomes, disabled e reduced motion no contrato. | PASS |
| IV. Test-First Quality and Isolation | Testes novos sob `tests/`, determinísticos, isolados e precedendo implementação nas tarefas. | PASS |
| V. Spec-Driven Execution | O plano será executado por `/speckit-implement`; o SDD não modifica código nem declara homologação visual sem evidência manual. | PASS |

Não há violação constitucional que exija Complexity Tracking.

## Research Summary (Phase 0)

As decisões foram consolidadas em [research.md](./research.md):

- category navigation é a fonte primária para 224/64, 36px, icon-16, tipografia, border-divider, foco e topologia flat;
- rail recebe border-divider sem converter itens em controles com borda;
- reduced motion zera duração/remove transformações, mas mantém estado e foco;
- `src/app/navigation/SidebarNavigationAdapter.tsx` fornece pathname/items e `SidebarNav` deixa de depender de `usePathname`;
- perfil só é acionável com `onOpenAccount`; Salvar/Abrir sem handler ficam visíveis disabled com razão acessível;
- skip link usa `#main-content`;
- catálogo e validação manual são obrigatórios porque os gates atuais não detectam toda divergência visual/semântica.

Todos os unknowns do technical context foram resolvidos ou marcados como N/A. Não há lacunas de contexto no desenho.

## Design and Architecture

### 1. Context boundary

`SidebarNavigationAdapter` será o boundary da aplicação. Ele resolve pathname e entrega a configuração flat atual para `SidebarNav`. O organismo recebe dados/estado por props e continua responsável pela composição visual; não importa `next/navigation`.

`AppLayoutShell` receberá a sidebar por slot (`sidebar: React.ReactNode`) para não importar uma camada `app` superior. `src/app/layout.tsx` comporá o adapter dentro do slot e continuará dono da integração da aplicação.

### 2. Generic primitive boundary

`src/components/ui/sidebar.tsx` continuará sem domínio. As correções permitidas nessa camada são apenas aliases/geometry, border do rail, classes/estados genéricos, focus ring, reduced motion e preservação da API Shadcn. Labels, routes, callbacks, ações locais e profile permanecem nas moléculas/organism.

### 3. Visual and motion correction

- Mapear widths aos aliases de 224/64.
- Aplicar border-divider apenas no rail esquerdo padrão.
- Substituir valores locais por tokens documentados para gap/padding/radius/typography/icon size.
- Normalizar menu item e submenu para a categoria navigation, incluindo 36px para subitens.
- Corrigir typography roles de brand, group label, nav item, compact actions e metadata.
- Garantir `icon-16` e focus ring 2px/offset 2.
- Aplicar reduced-motion efetivo a rail, collapse, chevron, tooltip, popover e submenu.

### 4. Interaction correction

- `SidebarBrand` conserva link e toggle, mas expõe a identidade completa no collapsed state.
- `SidebarUserProfile` recebe `onOpenAccount`; sem callback renderiza identidade não interativa.
- `SidebarQuickActions` recebe handlers individuais; sem handler usa disabled nativo e descrição acessível de indisponibilidade.
- `AppLayoutShell` adiciona skip link e `main#main-content` focável.
- Grupo futuro conserva disclosure/ancestor/child semantics e não expõe grupo vazio.

### 5. Catalog synchronization

Atualizar profiles e registry depois que os sources/exports/consumers estiverem estabilizados. O status documental distinguirá “implementado/documentado” de “homologação visual dependente de evidência manual”.

## Project Structure

### Documentation (this feature)

```text
specs/06-08-26-adequar-sidebar-design-system/
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── sidebar-navigation.md
├── checklists/
│   ├── requirements.md
│   ├── navigation.md
│   └── design-system.md
├── plan.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx
│   └── navigation/
│       ├── SidebarNavigationAdapter.tsx
│       └── sidebar-navigation-config.ts
├── components/
│   ├── ui/
│   │   └── sidebar.tsx
│   ├── molecules/
│   │   ├── SidebarBrand.tsx
│   │   ├── SidebarNavItem.tsx
│   │   ├── SidebarQuickActions.tsx
│   │   └── SidebarUserProfile.tsx
│   ├── organisms/
│   │   ├── SidebarNav.tsx
│   │   └── sidebar-navigation-model.ts
│   └── templates/
│       └── AppLayoutShell.tsx
tests/
├── components/ui/sidebar.test.tsx
├── components/organisms/sidebar-nav.test.tsx
├── components/organisms/sidebar-navigation-model.test.ts
├── components/organisms/sidebar-nav-conformance.test.tsx
├── components/app/sidebar-navigation-adapter.test.tsx
└── components/templates/app-layout-shell.test.tsx
design-system/
├── components/categories/navigation.md
├── components/profiles/ui/sidebar.md
├── components/profiles/organisms/sidebar-nav.md
├── components/profiles/molecules/sidebar-*.md
└── components/registry.json
```

**Structure Decision**: Manter o projeto single-app existente. A nova pasta `src/app/navigation` é um adapter de contexto, não uma nova camada de componentes; o template recebe slot para preservar a hierarquia Atomic Design. O modelo puro pode continuar próximo ao organism, desde que a configuração de produção seja propriedade do adapter.

## Implementation Phases

### Phase A — Contract and failing coverage

1. Atualizar testes/fixtures para pathname/items explícitos e adicionar cobertura de tokens, semantics, disabled, account, skip link, reduced motion e ausência de `usePathname`.
2. Confirmar contratos em `data-model.md` e `contracts/sidebar-navigation.md` antes da implementação.

### Phase B — Application boundary and shell

1. Criar o adapter e mover para ele o `usePathname` e a configuração flat de produção.
2. Alterar `AppLayoutShell` para receber sidebar por slot, adicionar skip link e `main#main-content`.
3. Atualizar `src/app/layout.tsx` para compor adapter + shell.

### Phase C — Sidebar and molecule corrections

1. Ajustar `ui/sidebar.tsx` apenas nos contratos genéricos de geometria, borda, tokens, motion, focus e submenu.
2. Ajustar `SidebarBrand`, `SidebarNavItem`, `SidebarUserProfile` e `SidebarQuickActions` para os props/semântica definidos.
3. Ajustar `SidebarNav` para consumir pathname/items, preservar flat default e manter grupos futuros.

### Phase D — Verification and catalog

1. Rodar testes focados e gates estáticos.
2. Atualizar category/profile/registry/consumers sem declarar conformidade visual sem evidência.
3. Executar quickstart manual em 1024px+, reduced motion, foco, tooltips/popovers, disabled, skip link e rotas.

## Post-Design Constitution Check

| Gate | Evidence in design | Status |
|---|---|---|
| Atomic boundaries | Adapter em `app`, shell por slot, organism sem `usePathname`, primitive sem produto. | PASS |
| Canonical tokens | `navigation.md`, geometry/motion/states e profiles são referências obrigatórias das tarefas. | PASS |
| Desktop/a11y | 1024px, 224/64, 36px, icon-16, focus, WCAG, reduced motion e skip link em spec/contract/quickstart. | PASS |
| Test isolation | Testes determinísticos, sem rede/estado global, com gates e evidência manual separados. | PASS |
| Spec-driven execution | Tasks serão executadas por `/speckit-implement`; nenhum código será alterado neste SDD. | PASS |

## Complexity Tracking

Nenhuma violação constitucional ou nova camada de produto foi introduzida; o adapter é uma fronteira de aplicação exigida pelo ownership de rota.
