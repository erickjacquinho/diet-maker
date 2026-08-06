# Feature Specification: Migração da Sidebar para Shadcn com Submenus

**Feature Branch**: `05-08-26-migrar-sidebar-shadcn-submenus`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "Adequar a sidebar atual do NutriDiet ao componente Sidebar do shadcn/ui sem perder nenhuma funcionalidade existente. A migração deve preservar a navegação global, brand NutriDiet, modo expandido e recolhido, larguras e identidade visual do design system, estado ativo por rota, tooltips no modo recolhido, perfil do nutricionista, ações Salvar/Abrir, integração com AppLayoutShell e compatibilidade desktop. O novo desenho deve permitir submenus de navegação e o atalho de teclado Ctrl+B no Windows/Cmd+B no macOS para alternar a sidebar. Manter SidebarNav como organismo e wrapper de produto; usar o Sidebar do shadcn como primitivo interno, sem espalhar dependência genérica pelas páginas. Não implementar agora: produzir um SDD completo com spec, clarificações, checklists, plano, tarefas rastreáveis e análise final."

## Context and Scope

The NutriDiet desktop application already has a persistent custom `SidebarNav` organism with brand, route links, collapsed and expanded presentations, tooltips, user profile, and local-file quick actions. The product now needs nested navigation without losing current reachability or visual identity. The change will adopt the Shadcn Sidebar primitive behind the product-owned organism, keeping product-specific composition and public behavior inside the organism layer.

The feature covers the persistent desktop navigation shell and its navigation interactions. It does not change route URLs, page content, file persistence, nutrition-domain behavior, mobile layout, tablet behavior, dark mode, or the semantics of action buttons.

## Clarifications

### Session 2026-08-05

- Q: Quais rotas devem formar os primeiros submenus? → A: Opção C — não reorganizar as rotas existentes nesta entrega; manter todos os destinos atuais no nível principal e preparar apenas o suporte técnico para submenus futuros.
- Q: O atalho Ctrl+B/Cmd+B deve ser obrigatório nesta entrega? → A: Opção B — preparar o suporte técnico, mas não ativar o atalho nesta entrega.

## User Scenarios & Testing

### User Story 1 - Navigate the application without losing existing behavior (Priority: P1)

As a nutritionist, I want the application sidebar to continue exposing the existing destinations, brand, current route, profile, and local-file actions after the migration so that the navigation change does not disrupt my daily workflow.

**Why this priority**: Preserving current navigation and actions is the non-negotiable baseline for the migration.

**Independent Test**: Exercise the application shell on every current route in both sidebar presentations and confirm that all current destinations, identity elements, profile information, and quick actions remain available with the same meaning.

**Acceptance Scenarios**:

1. **Given** the application is opened with the sidebar expanded, **When** the nutritionist selects any current destination, **Then** the existing route opens and the selected destination has a persistent, non-color-only current-state indication.
2. **Given** the application is opened with the sidebar collapsed, **When** the nutritionist focuses or points to a route icon, **Then** the complete destination name is available without expanding the sidebar.
3. **Given** the sidebar displays the NutriDiet brand, profile, and local-file actions, **When** the migration is complete, **Then** each item preserves its label, accessible name, destination or callback, and relative placement.
4. **Given** the shell is rendered by `AppLayoutShell`, **When** the sidebar changes presentation, **Then** the main content remains visible, scrollable, and independent of the sidebar state.

### User Story 2 - Prepare nested navigation groups (Priority: P2)

As a product maintainer, I want the sidebar navigation contract to support collapsible submenu groups in the future so that related destinations can be organized later without another primitive migration or page-level coupling.

**Why this priority**: The current delivery intentionally preserves the existing flat navigation; future submenu capability is prepared without changing the visible route organization now.

**Independent Test**: Render a representative navigation hierarchy fixture containing a parent and child destination through the product-owned wrapper, verify its disclosure and active-state contract, and verify that the production hierarchy still renders all current destinations as first-level links.

**Acceptance Scenarios**:

1. **Given** a navigation hierarchy fixture has child destinations, **When** its submenu control is activated, **Then** the product-owned wrapper exposes or hides the children and announces its expanded state.
2. **Given** a child destination in the fixture is the current route, **When** the wrapper is rendered, **Then** its parent group is discoverable as active and the child destination is visibly and programmatically current.
3. **Given** a future submenu fixture is open, **When** the sidebar is collapsed, **Then** the child destinations remain discoverable through the documented accessible collapsed-state interaction.
4. **Given** the production navigation hierarchy is rendered for this delivery, **When** the sidebar is inspected, **Then** all existing destinations remain first-level links and no new submenu grouping changes the current visible organization.

### User Story 3 - Prepare keyboard toggle integration (Priority: P3)

As a product maintainer, I want the sidebar toggle action to remain isolated behind the product wrapper so that a future Ctrl+B/Cmd+B integration can reuse it without changing route state or adding page-level coupling.

**Why this priority**: The current delivery does not activate a global keyboard shortcut; it only preserves a safe integration seam while prioritizing the existing sidebar behavior.

**Independent Test**: Verify that the visible toggle remains fully operable and that Ctrl+B/Cmd+B does not register as an active global sidebar shortcut in this delivery; verify that a future adapter can delegate to the same product-owned toggle action.

**Acceptance Scenarios**:

1. **Given** the application shell is focused, **When** the nutritionist presses Ctrl+B on Windows or Cmd+B on macOS, **Then** no new global shortcut behavior is activated in this delivery and the current route remains unchanged.
2. **Given** the product-owned wrapper exposes its toggle action, **When** a future keyboard adapter delegates to that action, **Then** it can reuse the same expanded/collapsed transition without changing the current route.
3. **Given** the nutritionist uses the visible collapse/expand control, **When** the control is activated by pointer, Enter, or Space, **Then** it preserves the existing sidebar state transition and visible focus behavior.

### Edge Cases

- A deep route must mark the correct existing destination without falsely introducing an ancestor submenu in the current flat navigation hierarchy.
- A route with no matching navigation item must leave the sidebar usable and must not falsely mark an unrelated destination as current.
- A future submenu definition with no child destinations must not render an empty group or a non-functional disclosure control.
- Collapsing the sidebar while a future submenu fixture is open must not discard the current route, current-state indication, or ability to reopen the group.
- `initialCollapsed` must continue to determine the initial presentation when provided; the feature does not introduce persisted sidebar preferences unless separately approved.
- Missing optional `onSave` or `onOpen` callbacks must not make the shell fail or produce an uncaught interaction error.
- A tooltip, submenu surface, or focus indicator must not be clipped by the sidebar or main content stacking context.

## Requirements

### Functional Requirements

- **FR-001**: The application MUST preserve all current sidebar destinations and their existing route URLs.
- **FR-002**: The application MUST preserve programmatic current-route detection for exact routes and nested routes, including the current patient-route behavior.
- **FR-003**: The application MUST preserve expanded and collapsed desktop presentations, including the product-defined sidebar widths of 224px expanded and 64px collapsed.
- **FR-004**: The application MUST preserve the NutriDiet brand link, title, subtitle, avatar treatment, and accessible tooltip behavior in both presentations.
- **FR-005**: The application MUST preserve the nutritionist profile name, role, avatar treatment, and collapsed-state accessible information.
- **FR-006**: The application MUST preserve the Salvar and Abrir local-file actions, their callbacks, labels, icon-only accessible names, and tooltip information.
- **FR-007**: The application MUST preserve `AppLayoutShell` integration so the sidebar remains persistent while the main content owns its existing scroll region.
- **FR-008**: The application MUST support a data-driven navigation hierarchy containing route links and collapsible submenu groups without requiring pages to know the Sidebar primitive API.
- **FR-009**: The application MUST expose every current destination as a first-level link in the initial production navigation hierarchy and MUST NOT reorganize the existing visible routes into submenu groups in this delivery; the data contract and product-owned wrapper MUST remain capable of representing future parent/child groups.
- **FR-010**: For any future parent/child group represented by the navigation contract, the application MUST expose submenu expanded/collapsed state through accessible semantics, visible focus, keyboard activation, and a clear visual affordance that follows the navigation category contract.
- **FR-011**: For any future child destination represented by the navigation contract, when that child is current, the application MUST preserve both the child current state and the discoverability of its ancestor group.
- **FR-012**: In the current collapsed presentation, the application MUST keep every production route discoverable by accessible label or tooltip; future submenu children MUST have a documented keyboard-operable collapsed interaction before they are exposed to users.
- **FR-013**: The product-owned wrapper MUST keep its sidebar toggle action available as an integration seam for a future operating-system-specific shortcut, but MUST NOT register or activate Ctrl+B on Windows or Cmd+B on macOS in this delivery.
- **FR-014**: If a future shortcut adapter is introduced, it MUST not intercept equivalent key input while focus is inside an input, textarea, select-like editable control, or contenteditable region.
- **FR-015**: The visible sidebar toggle MUST remain the active product control, MUST be operable by pointer, Enter, and Space, and MUST expose the same action that a future shortcut adapter would delegate to.
- **FR-016**: The migration MUST keep product-specific behavior inside the `SidebarNav` organism or its approved child compositions; generic Shadcn primitives MUST remain free of nutrition-domain rules.
- **FR-017**: The migration MUST preserve the project’s desktop-only scope, light theme, semantic tokens, typography, geometry, focus ring, tooltip, overflow, and motion requirements.
- **FR-018**: The migration MUST preserve the public `SidebarNav` product contract, including `SidebarNavProps`, `SidebarBrandProps`, `SidebarNavItemProps`, `SidebarUserProfileProps`, `SidebarQuickActionsProps`, `useSidebarContext`, and the existing compound component exports, or document any intentional breaking change before implementation; existing consumers MUST NOT need to import the generic Sidebar primitive directly.
- **FR-019**: The feature MUST include deterministic tests for production route current state, expanded/collapsed behavior, future-submenu semantics using a representative hierarchy fixture, visible-toggle keyboard activation, shortcut non-activation/readiness boundaries, tooltip access, callback preservation, and shell integration.
- **FR-020**: The feature MUST update the component registry/profile and relevant design-system documentation so the documented `SidebarNav` composition, primitive base, consumers, and migration status match the implemented source.

### Non-Functional Requirements

- **NFR-001**: All sidebar and submenu interactive elements MUST be operable by keyboard and expose a visible focus indicator meeting WCAG 2.2 AA requirements.
- **NFR-002**: The navigation landmark, route links, current-route state, submenu state, and control names MUST remain available to assistive technologies without relying on color alone.
- **NFR-003**: The sidebar MUST remain stable at the supported desktop minimum of 1024px and MUST NOT introduce mobile or tablet behavior in this feature.
- **NFR-004**: The migration MUST not introduce a second independent sidebar state source that can diverge from the Shadcn-backed product wrapper.
- **NFR-005**: The initial migration MUST not require new persistence, external services, route changes, or nutrition-domain data changes.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of the current sidebar destinations remain reachable from the migrated sidebar with their existing URLs.
- **SC-002**: 100% of the current expanded/collapsed, brand, profile, and local-file action scenarios retain their existing outcome and accessible name.
- **SC-003**: 100% of the representative future-submenu hierarchy fixtures expose a documented expanded state, an active descendant state, and a keyboard-operable disclosure path, while the production navigation remains flat in this delivery.
- **SC-004**: The visible sidebar toggle remains fully operable without changing route context, no global Ctrl+B/Cmd+B shortcut is active in this delivery, and the product-owned toggle action is available for a future adapter.
- **SC-005**: 0 current sidebar-related regression findings remain in type-check, unit/accessibility tests, component-catalog validation, or the relevant desktop acceptance scenarios before implementation is considered complete.
- **SC-006**: The migrated sidebar preserves the design-system geometry contract of 224px expanded and 64px collapsed, with no undocumented visual exception.

## Assumptions

- The user is a nutritionist using the existing NutriDiet desktop application at 1024px or wider.
- Existing route URLs and page ownership remain unchanged.
- The Shadcn Sidebar primitive is used as an internal base; `SidebarNav` remains the product-facing organism.
- The initial collapsed state remains an input to the product organism and is not persisted in local storage by this feature.
- The Ctrl+B/Cmd+B shortcut is not activated in this delivery; any future adapter will be scoped to toggling the sidebar, not to direct navigation to routes.
- Existing profile and local-file callbacks remain optional and preserve their current no-op-safe behavior when absent.
- The production navigation remains flat in this delivery; submenu support is prepared through the data contract and product-owned wrapper for a future topology decision.

## Out of Scope

- Replacing `AppLayoutShell` with a generic page-layout component.
- Changing route URLs, route ownership, page content, patient data, diet data, or local-file formats.
- Adding mobile, tablet, dark-mode, responsive drawer, or bottom-navigation behavior.
- Adding a command palette or shortcuts for every individual route.
- Replacing product atoms/molecules with direct page-level imports of generic Shadcn primitives.
- Reworking unrelated design-system debt outside the sidebar migration.
