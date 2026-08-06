# Data Model: Sidebar Navigation

## `SidebarNavigationItem`

Discriminated union used by the `SidebarNav` organism. It is a presentation model, not persisted domain data.

```ts
type SidebarNavigationItem = SidebarRouteItem | SidebarGroupItem
```

### `SidebarRouteItem`

| Field | Type | Required | Rules |
|---|---|---:|---|
| `kind` | `'route'` | yes | Discriminator for a direct destination. |
| `href` | `string` | yes | Existing route URL; no route is created or rewritten by this feature. |
| `label` | `string` | yes | Names the destination and is the accessible name when collapsed. |
| `icon` | `LucideIcon` | yes | Existing Lucide icon or a future approved icon. |
| `match` | `'exact' \| 'prefix' \| 'patients-prefix'` | no | Defaults to the current route-matching behavior; patient routes preserve their dedicated prefix behavior. |

### `SidebarGroupItem`

| Field | Type | Required | Rules |
|---|---|---:|---|
| `kind` | `'group'` | yes | Discriminator for a future parent/child group. |
| `id` | `string` | yes | Stable local identity unique within the navigation model. |
| `label` | `string` | yes | Names the group and its disclosure control. |
| `icon` | `LucideIcon` | no | Decorative when a visible label is present. |
| `children` | `SidebarRouteItem[]` | yes | Empty groups are not rendered. |
| `defaultOpen` | `boolean` | no | Presentation default only; no persistence is introduced. |

## Default production model

`DEFAULT_NAVIGATION_ITEMS` contains, in the current order, six `SidebarRouteItem` records:

1. `/pacientes` — Pacientes
2. `/presets` — Presets de Dietas
3. `/refeicoes-prontas` — Refeições Prontas
4. `/receitas` — Receitas Culinárias
5. `/alimentos` — Planilha de Alimentos
6. `/design-system` — Guia Design System

No record is a `group` in the production default for this delivery.

## Derived state

| State | Source | Meaning |
|---|---|---|
| `sidebarPresentation` | Shadcn `SidebarProvider` | `expanded` or `collapsed`; controlled by `initialCollapsed` only at initialization. |
| `routeIsActive` | `pathname` + `SidebarRouteItem.match` | Exact, prefix, or patient-prefix current-state calculation. |
| `groupIsActive` | Child derived state | True when any future child is current. |
| `groupIsOpen` | Local disclosure state | Expanded/collapsed future group state; not persisted. |
| `shortcutEnabled` | Provider option | False for this delivery. |

## Invariants

- Every production route remains a first-level item with its existing `href`.
- A route item is rendered as a real link, never as a button used as a route.
- A group with zero children is omitted and has no disclosure control.
- A current child makes its ancestor discoverable as active when groups are introduced.
- Collapsed presentation retains accessible names for leaf links; future groups must expose a keyboard-operable child surface before they are enabled in production.
- `onSave` and `onOpen` remain optional and no-op-safe.
- No navigation model or sidebar presentation state is stored in cookies, local storage, or nutrition-domain data.
