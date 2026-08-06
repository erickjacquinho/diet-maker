# Sidebar

## Identity

| Field | Value |
| --- | --- |
| Component ID | `ui-sidebar` |
| Nature | `ui-generic` |
| Lifecycle | `implemented` |
| Current layer | `ui` |
| Target layer | `ui` |
| Sources | `src/components/ui/sidebar.tsx` |
| Public exports | `SidebarProvider` (component), `SidebarProviderProps` (type), `Sidebar` (component), `SidebarProps` (type), `SidebarHeader`/`SidebarContent`/`SidebarFooter`/`SidebarGroup`/`SidebarGroupLabel`/`SidebarGroupContent`/`SidebarMenu`/`SidebarMenuItem` (compound-parts), `SidebarMenuButton` (component), `SidebarMenuButtonProps` (type), `SidebarMenuSub`/`SidebarMenuSubItem` (compound-parts), `SidebarMenuSubButton` (component), `SidebarMenuSubButtonProps` (type), `SidebarTrigger` (compound-part), `useSidebar` (hook) |

## Purpose

Fornecer a família genérica de primitives para um rail persistente, com estado expanded/collapsed e slots para header, conteúdo, grupos, menus e footer. O componente não conhece rotas, marca, perfil, ações de produto ou dados nutricionais.

## Category inheritance

Herda integralmente [navigation](../../categories/navigation.md). Trait autorizado: `collapsible`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Provider, rail, structural slots, menu slots, submenu slots e trigger compõem a família genérica. A anatomia não impõe a lista de rotas nem o conteúdo das moléculas de produto.

## Allowed variants

`side`: left/right; `variant`: sidebar/floating/inset; `collapsible`: offcanvas/icon/none; estado visual: expanded/collapsed. A composição de produto usa `side="left"`, `variant="sidebar"` e `collapsible="icon"`.

## Particular states

Expanded, collapsed, active, focus-visible, disabled e conteúdo vazio são estados observáveis dos slots. O provider permanece sem persistência e sem shortcut por default.

## Primitive API

`SidebarProvider` owns the controlled/uncontrolled open state and exposes `useSidebar`; `Sidebar` renders the rail; the remaining exports are structural and interactive slots. `SidebarMenuButton` and `SidebarMenuSubButton` accept `asChild` for composition with real links. `SidebarTrigger` delegates to the same toggle action.

The default provider is intentionally in-memory and has no cookie, localStorage or global keyboard listener. Persistence and a shortcut are explicit opt-in props for a future product decision. `Sidebar` supports `side`, `variant` and `collapsible` without introducing product-specific variants.

## State and focus behavior

Expanded uses `--cmp-sidebar-width-expanded` (224px); collapsed uses `--cmp-sidebar-width-collapsed` (64px). Menu buttons expose `data-active`, preserve focus-visible ring treatment, and keep their accessible label when the visual text is hidden. The provider does not install shortcut behavior unless `shortcutKey` is supplied, and editable targets are excluded.

## Composition

This file documents generic UI only. Product navigation is composed in `organism-sidebar-nav`; route matching, labels, groups, identity, quick actions and profile data must remain outside `src/components/ui`.

## Content rules

Labels, routes, icons and product actions are supplied by consumers. `asChild` may compose real links, but the primitive does not create destinations.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de consumidores está em `design-system/components/registry.json`.

## Acceptance criteria

The provider exposes one collapse action, the rail preserves accessible labels in both states, and generic slots do not import product molecules or route data.

## Implementation status

Implementado em `ui`; perfil homologado documentalmente. Homologação não declara conformidade visual sem a evidência manual correspondente.
