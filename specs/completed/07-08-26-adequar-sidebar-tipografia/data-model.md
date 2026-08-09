# Phase 1: Data Model & Component Specs

## Sidebar Menu Item Typography State

### Entities & Tokens

- **TextStyle: nav-item**
  - Font Size: `13px` (`style-nav-item`)
  - Line Height: `18px`
  - Font Weight: `600` (`font-semibold`)
  - Color Tokens: `text-sidebar-foreground` (inactive state), `text-sidebar-primary` (active state)
  - Active Background: `bg-sidebar-primary-soft`
  - Hover Accent: `bg-sidebar-accent`, `text-sidebar-accent-foreground`

- **Component: SidebarMenuButton**
  - Primitive Source: `src/components/ui/sidebar.tsx`
  - Consumer Molecules: `SidebarNavItem`, `SidebarQuickActions`, `SidebarUserProfile`
