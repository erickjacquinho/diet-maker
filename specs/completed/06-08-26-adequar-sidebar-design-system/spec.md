# Feature Specification: Adequação da Sidebar ao Design System

**Feature Branch**: `06-08-26-adequar-sidebar-design-system`

**Created**: 2026-08-06

**Status**: Proposed

**Input**: User description: "Analisar a nova sidebar implementada, apontar o que precisa ser melhorado para adequação ao Design System e criar um SDD completo de correção, destacando decisões para qualquer regra ambígua."

## Context and Scope

A sidebar baseada no primitivo Shadcn já está integrada ao NutriDiet, mas ainda possui divergências visuais, semânticas, de acessibilidade, de tokens, de composição e de catálogo. Esta feature especifica a correção dessas divergências sem alterar o escopo de produto.

O resultado deve preservar a experiência desktop atual: tema claro, suporte a partir de 1024px, sidebar expandida de 224px, sidebar recolhida de 64px, estado inicial recolhido quando solicitado, ausência de persistência e ausência de atalho global Ctrl/Cmd+B. As seis rotas atuais permanecem flat e acessíveis no primeiro nível. O contrato deve continuar preparado para grupos/submenus futuros, sem reorganizar a produção nesta entrega.

O trabalho inclui código da sidebar e do shell, testes determinísticos, validação manual desktop e sincronização dos perfis/registry do Design System. Não inclui implementação de novos menus de conta, mudanças de rotas, persistência, mobile/tablet, dark mode ou alteração de conteúdo das páginas.

## Clarifications

### Session 2026-08-06

As decisões abaixo foram consolidadas antes da especificação e eliminam as ambiguidades que poderiam mudar o escopo da correção:

| Tema | Decisão | Consequência verificável |
|---|---|---|
| Perfil do nutricionista | Deve ser uma entrada real de conta quando `onOpenAccount` existir; sem callback, permanece informativo e não aparenta ser interativo. | O componente não renderiza `cursor-pointer`, hover ou controle sem ação quando não houver callback. |
| Salvar/Abrir sem handlers | Permanecem visíveis, porém `disabled`, com motivo acessível. | O usuário entende que as ações ainda não estão disponíveis; não há clique sem efeito nem erro não tratado. |
| Ownership de rotas | Um adaptador da aplicação fornece `pathname` e os itens; `SidebarNav` não chama `usePathname` nem escolhe a configuração de produção. | O organismo fica reutilizável e testável por props; o app layout concentra o contexto de rota. |
| Densidade de submenu | Subitens usam altura canônica de 36px. | A altura não é definida por `h-7` ou outro valor local. |
| Skip link | Adicionar e normatizar o skip link para `#main-content`. | O link aparece ao receber foco, move foco para o conteúdo principal e tem texto em pt-BR. |
| Motivo das ações disabled | Usar descrição acessível explícita: “A ação Salvar ainda não está disponível nesta tela.” e equivalente para Abrir. | A razão não depende apenas de opacidade ou tooltip. |
| Superfície da conta | O SDD especifica o ponto de extensão (`onOpenAccount`), não o conteúdo de um popover/menu de conta. | Um menu real de conta será uma feature separada se for necessário. |

Não há lacunas de decisão pendentes. Decisões futuras sobre a taxonomia de grupos, conteúdo da conta ou ativação de atalhos ficam fora deste escopo e exigem nova decisão documentada.

## User Scenarios & Testing

### User Story 1 - Usar a sidebar com identidade e acessibilidade consistentes (Priority: P1)

Como nutricionista, quero que a sidebar preserve sua identidade, dimensões e navegação enquanto respeita os tokens e estados do Design System, para trabalhar sem perda de contexto visual ou acessível.

**Why this priority**: É a correção de base; qualquer interação posterior depende de geometria, hierarquia, foco e nomes acessíveis consistentes.

**Independent Test**: Inspecionar a sidebar expandida e recolhida em viewport desktop, percorrer todos os controles por teclado, executar o cenário com `prefers-reduced-motion` e comparar dimensões, tokens, labels e estados com os perfis canônicos.

**Acceptance Scenarios**:

1. **Given** a sidebar is expanded at a supported desktop width, **When** its rail and sections are inspected, **Then** the rail measures 224px, has the canonical right border, and uses only documented design-system tokens for spacing, color, typography, radius, icon size and motion.
2. **Given** a sidebar is collapsed, **When** the brand and route controls are focused or exposed by tooltip, **Then** the complete product/destination name remains available and no identity is reduced to the single initial “N”.
3. **Given** a user navigates with keyboard, **When** focus reaches any action, route, disclosure or collapse control, **Then** the control has a visible focus ring, a semantic role, a usable accessible name and no focus indicator is clipped.
4. **Given** the user has enabled reduced motion, **When** the rail, menu, chevron, tooltip or popover changes state, **Then** non-essential transitions are removed or reduced without removing the state change or focus feedback.
5. **Given** a representative future submenu fixture contains child destinations, **When** the fixture is shown, **Then** its child items use the 36px canonical height and its expanded/current/focus semantics remain discoverable.

### User Story 2 - Interagir com conta, ações locais e conteúdo principal de forma honesta (Priority: P1)

Como nutricionista, quero que cada elemento visual comunique corretamente se possui ação e quero alcançar o conteúdo principal por teclado, para não depender de affordances falsas ou atravessar toda a navegação.

**Why this priority**: Falsos controles e ausência de skip link afetam diretamente acessibilidade, compreensão e uso diário.

**Independent Test**: Render o shell com e sem callbacks de conta, Salvar e Abrir; exercitar teclado e leitor de tela; usar o skip link; e observar que os estados disabled explicam sua causa sem lançar erro.

**Acceptance Scenarios**:

1. **Given** `onOpenAccount` is provided, **When** the profile is focused and activated by pointer, Enter or Space, **Then** it exposes a semantic account entry and invokes the callback once.
2. **Given** `onOpenAccount` is absent, **When** the profile is displayed in either presentation, **Then** it remains an identity surface without cursor, hover, button semantics or an apparent no-op action.
3. **Given** `onSave` or `onOpen` is absent, **When** the corresponding action is displayed, **Then** it remains visible and disabled, exposes the action label and its localized reason through accessible description, and cannot invoke an undefined handler.
4. **Given** a save/open handler is supplied, **When** the corresponding control is activated, **Then** it invokes only the supplied handler and preserves the same label, icon meaning and collapsed tooltip.
5. **Given** the shell has received focus, **When** the user focuses the skip link and activates it, **Then** focus moves to the main content landmark identified by `#main-content` and the link is visually available only in its focused state.
6. **Given** the shell is rendered with the sidebar collapsed or expanded, **When** main content is scrolled, **Then** the content keeps its existing independent scroll region and the sidebar remains persistent without layout shift beyond its defined width transition.

### User Story 3 - Isolar contexto de aplicação e preservar evolução futura (Priority: P2)

Como mantenedor, quero que a sidebar receba contexto de rota por contrato e que o catálogo reflita a composição real, para evoluir a navegação sem acoplamento a Next.js ou divergência documental.

**Why this priority**: A separação reduz acoplamento e torna os próximos grupos de navegação mais seguros, embora não seja uma mudança visível obrigatória para o usuário final.

**Independent Test**: Renderizar `SidebarNav` com pathname e itens artificiais, renderizar o adaptador da aplicação com as seis rotas atuais, verificar que o organismo não importa `usePathname`, e comparar sources/exports/consumers com o registry e os perfis.

**Acceptance Scenarios**:

1. **Given** an application adapter has a pathname and navigation model, **When** it renders the product organism, **Then** the organism derives current state only from those props and does not read route context directly.
2. **Given** the production adapter is rendered, **When** its model is inspected, **Then** all six current destinations remain first-level links in their existing order and URLs.
3. **Given** a future group is supplied as data, **When** a child route is current, **Then** the child exposes the page-current state and the parent exposes discoverability/expanded state without changing the current production topology.
4. **Given** the source and catalog are reviewed together, **When** profiles and registry consumers are compared, **Then** the primitive boundary, molecule sources, organism composition, exports and app/template consumers match the implemented contract.

## Edge Cases

- A pathname is empty, unknown or does not match any item; the sidebar remains usable without falsely marking a destination current.
- A nested patient pathname matches the documented parent route rule; no unrelated item is marked current.
- A future group has no children; no empty disclosure or empty submenu surface is exposed.
- A future group has a current child while the sidebar is collapsed; child reachability and parent context remain available through the documented collapsed interaction.
- The profile callback is removed between renders; the profile loses interactive affordances without retaining stale behavior.
- Only one of `onSave` and `onOpen` is provided; each action independently communicates its own enabled/disabled state and reason.
- A tooltip, popover, submenu or focus ring reaches the rail edge; the surface is not clipped by stacking or overflow rules.
- A reduced-motion preference is active while a component is already open or collapsed; the current state remains stable and only motion changes.
- The skip link target is absent in a consumer shell; the product shell contract must make the target mandatory and tests must fail before integration is considered complete.
- A consumer renders `SidebarNav` without the app adapter; the organism must not silently read route context or invent production routes.

## Requirements

### Functional Requirements

- **FR-001**: The product MUST remain desktop-only from 1024px, light-theme and without mobile/tablet/dark-mode behavior in this feature.
- **FR-002**: The expanded sidebar MUST measure 224px and the collapsed sidebar MUST measure 64px, using the canonical component aliases.
- **FR-003**: The default left rail MUST expose the canonical right border and the right-side variant MUST preserve the corresponding side behavior without double borders.
- **FR-004**: Sidebar geometry, colors, radii, spacing, typography, icon sizes and state motion MUST consume documented tokens; undocumented utility values MUST NOT be introduced for these concerns.
- **FR-005**: Sidebar and submenu icons MUST render at the canonical 16px size unless a component profile explicitly defines another size.
- **FR-006**: Brand, group labels, navigation items, compact actions and submenu items MUST use the typography roles defined by their category/profile rather than heading or legal-text substitutions.
- **FR-007**: Rail, collapse control, menu item, chevron, tooltip and popover transitions MUST honor the reduced-motion preference while retaining state feedback and visible focus.
- **FR-008**: Every interactive sidebar element MUST expose semantic name/role/value, keyboard operation, visible focus and non-color-only state indication according to WCAG 2.2 AA and the canonical state contract.
- **FR-009**: The collapsed brand MUST expose the complete “NutriDiet Pro Local” identity through its accessible name or equivalent tooltip; the avatar initial alone is insufficient.
- **FR-010**: `SidebarUserProfile` MUST accept `onOpenAccount`; with the callback it MUST be a keyboard-operable account entry, and without it MUST be noninteractive in both visual and semantic affordance.
- **FR-011**: `SidebarQuickActions` MUST render Salvar and Abrir visibly in both presentations; each action without its handler MUST be disabled and MUST expose the localized reason defined in the decision table.
- **FR-012**: Each supplied Salvar/Abrir handler MUST be invoked only by its matching control, without changing the action label, icon meaning or collapsed tooltip contract.
- **FR-013**: `AppLayoutShell` MUST expose a skip link with the text “Pular para o conteúdo principal” targeting `#main-content`; the main landmark MUST own that id and accept focus.
- **FR-014**: The shell MUST retain a persistent sidebar and an independent main scroll region at the supported desktop widths.
- **FR-015**: `SidebarNav` MUST receive `pathname` and navigation items from an application adapter and MUST NOT import or call `usePathname`.
- **FR-016**: The application adapter MUST own the production pathname source and six-item flat navigation configuration, preserving existing order, labels and URLs.
- **FR-017**: `SidebarNav` MUST remain able to render a supplied parent/child navigation model, including parent disclosure, child current state, ancestor discoverability and the collapsed interaction contract.
- **FR-018**: Future submenu items MUST use the canonical 36px height, focus ring and submenu spacing; empty groups MUST not expose an empty control.
- **FR-019**: The generic `src/components/ui` primitives MUST remain free of NutriDiet route names, account copy, local-file actions or application callbacks.
- **FR-020**: The component registry and profiles MUST document the real primitive base, sources, exports, consumers, states, route-adapter boundary and migration status for the sidebar composition.
- **FR-021**: The feature MUST add deterministic automated coverage for visual/token contracts that current gates do not detect, semantic names and roles, disabled reasons, account callback behavior, reduced motion, skip link, route ownership and catalog synchronization.
- **FR-022**: The feature MUST include a manual desktop acceptance record covering geometry, focus, reduced motion, tooltips/popovers, disabled actions, skip link, route continuity and catalog evidence.

### Non-Functional Requirements

- **NFR-001**: No new persistent state, cookie/local-storage write, global Ctrl+B/Cmd+B listener, route URL or nutrition-domain data mutation may be introduced.
- **NFR-002**: Automated tests MUST be deterministic, isolated under `tests/`, and must not depend on network, external services or a real browser session for unit assertions.
- **NFR-003**: The implementation MUST preserve atomic boundaries: `ui` remains generic, molecules remain lower-layer components, the organism owns composition, and app context is supplied by the app adapter.
- **NFR-004**: No success criterion may declare visual conformity solely from static gates; manual inspection is required for geometry, focus, motion, clipping and accessible presentation.
- **NFR-005**: The change MUST not alter unrelated design-system categories or introduce new tokens without a documented governance decision and registry impact.

## Key Entities

- **Sidebar presentation state**: Expanded or collapsed visual state with the fixed desktop widths 224px and 64px; it is ephemeral for this feature and not persisted.
- **Sidebar navigation item**: A route or future group containing label, icon, href/children and active-state rules supplied by the application adapter.
- **Sidebar action**: Profile, Salvar or Abrir control with label, optional callback, enabled/disabled state, accessible description and collapsed tooltip representation.
- **Application navigation adapter**: Application-owned boundary that resolves pathname and production navigation data before passing them to `SidebarNav`.
- **Design-system catalog entry**: Registry/profile record describing category, atomic layer, primitive base, sources, exports, consumers and validation status.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of current six destinations remain reachable through the production sidebar with unchanged labels, order and URLs.
- **SC-002**: The production rail measures exactly 224px expanded and 64px collapsed at the supported desktop viewport, with the canonical border present on the left rail.
- **SC-003**: 100% of sidebar interactive elements have a non-empty accessible name, semantic role, keyboard path and visible focus indication in the focused review scenarios.
- **SC-004**: With reduced motion enabled, 0 non-essential rail/menu/chevron/tooltip/popover transitions remain active while all state changes and focus feedback remain available.
- **SC-005**: With missing callbacks, Salvar/Abrir are visible and disabled with a programmatically available reason, and the profile has no interactive affordance; with supplied callbacks, each callback is invoked only by its matching control.
- **SC-006**: The skip link moves focus to `#main-content` in the shell acceptance scenario without changing the sidebar state or route.
- **SC-007**: The organism source contains no direct `usePathname` import/call, and the adapter test demonstrates pathname/item injection for both production and fixture navigation models.
- **SC-008**: The current focused test suite, type-check, lint, atomic audit and design-system gates produce zero blocking findings attributable to the feature; manual acceptance is recorded separately.
- **SC-009**: Registry and profiles list all changed sidebar primitives/compositions, their real source/export/consumer relationships and their lifecycle status with no catalog audit finding.

## Assumptions

- The existing six production route definitions and current navigation model are the source for preserving route order and URLs.
- The app adapter may pass future callbacks from the application, but this feature only specifies the profile callback seam and does not build the account surface.
- “Tokenized” means a value already documented in the canonical design-system token or component profile; a needed new value requires a separate governance update rather than a local utility.
- Existing Shadcn primitives remain in `src/components/ui`; product-specific wrappers and molecules may compose them without exposing their generic API to pages.
- The current initial collapsed behavior, no persistence and no active Ctrl/Cmd+B behavior remain unchanged.
- The final manual review is performed on a supported desktop viewport and includes keyboard and reduced-motion scenarios.

## Out of Scope

- Implementing an account menu/popover, authentication flow or profile editing.
- Changing routes, route URLs, route order, page content, patient/diet data or local-file serialization.
- Adding mobile, tablet, responsive drawer, dark mode or touch-specific behavior.
- Enabling Ctrl+B/Cmd+B, adding sidebar persistence or adding a command palette.
- Reorganizing production routes into visible submenu groups.
- Refactoring unrelated components or design-system debt outside the sidebar, shell and directly referenced catalog entries.
