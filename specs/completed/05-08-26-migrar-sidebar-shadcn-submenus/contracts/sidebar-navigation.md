# UI Contract: Sidebar Navigation

## Product entry point

`SidebarNav` remains the only product-facing sidebar entry point for templates and pages.

### Preserved public exports

- `SidebarNavProps`
- `SidebarBrandProps`
- `SidebarNavItemProps`
- `SidebarUserProfileProps`
- `SidebarQuickActionsProps`
- `useSidebarContext`
- `SidebarNavComponent`
- `SidebarNav`

Existing molecule module paths remain valid. They are implementation-bearing molecules after migration, not upward reexports from the organism.

### Product props

```ts
interface SidebarNavProps {
  doctorName?: string
  doctorRole?: string
  onSave?: () => void
  onOpen?: () => void
  initialCollapsed?: boolean
  navigationItems?: SidebarNavigationItem[]
  children?: React.ReactNode
}
```

`navigationItems` is optional and defaults to the six-item flat production model. Existing callers continue to compile and retain the same defaults.

## Primitive composition contract

The organism may import the following generic local primitives:

- `SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarFooter`;
- `SidebarGroup`, `SidebarGroupContent`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`;
- future-group support: `Collapsible`, `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton`;
- `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent`;
- existing `Button`, `IconButton`, and `Avatar` product atoms.

Generic primitives MUST NOT import route names, NutriDiet labels, doctor data, callbacks, or the product navigation model.

## State contract

- `initialCollapsed=true` maps to Shadcn `defaultOpen=false`.
- `initialCollapsed=false` maps to Shadcn `defaultOpen=true`.
- The visible collapse control calls Shadcn `toggleSidebar` and is operable by pointer, Enter, and Space.
- `useSidebarContext()` projects `isCollapsed` and `toggleCollapse` from the Shadcn context without storing a second state.
- Persistence is disabled.
- Ctrl+B/Cmd+B is disabled in this delivery; future activation must be an explicit provider option.

## Navigation semantics

- Root navigation uses a named `nav` landmark and an ordered list/menu structure.
- Route links use real link semantics and expose `aria-current="page"` only for the current route.
- Future group disclosures expose `aria-expanded`, a stable accessible name, and a keyboard path.
- Active descendants make future ancestors discoverable as active.
- Collapsed leaf items retain accessible names and tooltips.
- Future collapsed groups use a keyboard-operable sub-navigation surface before production exposure.

## Visual contract

- Expanded width: 224px.
- Collapsed width: 64px.
- Light semantic tokens only.
- Existing brand, profile, quick-action labels/callbacks, tooltip behavior, focus ring, overflow, and route order remain intact.
- No mobile/tablet drawer, dark mode, route changes, or generic `SidebarInset` shell replacement.
