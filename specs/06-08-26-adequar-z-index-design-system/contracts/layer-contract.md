# Layer Contract: Semantic Z-Index

**Feature**: [Adequação da Hierarquia de Camadas](../spec.md)

## Canonical mapping

| Component responsibility | Default token | Modal-context token | Notes |
|---|---|---|---|
| Base content | z-base | not applicable | Normal document flow |
| Local elevated overlap | z-raised | not applicable | Only when visual overlap is real |
| Sticky content | z-sticky | not applicable | Persistent local navigation/content |
| Navigation | z-navigation | not applicable | Application navigation |
| Dropdown and Select content | z-dropdown | z-modal | Modal context must be explicit |
| Popover content | z-popover | z-modal | Default remains non-modal |
| Dialog/Sheet backdrop | z-overlay | z-overlay | Backdrop only |
| Dialog/Sheet content | z-modal | z-modal | Content above its backdrop |
| Toast | z-toast | z-toast | Global feedback |
| Tooltip | z-tooltip | z-tooltip | Highest transient help layer |

## Public component rules

- DialogOverlay and SheetOverlay render z-overlay.
- DialogContent and SheetContent render z-modal.
- DropdownMenuContent and DropdownMenuSubContent render z-dropdown.
- SelectContent renders z-dropdown by default and may resolve to z-modal through an explicit modal context.
- PopoverContent renders z-popover by default and may resolve to z-modal through an explicit modal context.
- TooltipContent renders z-tooltip.
- A consumer must not add an arbitrary z-index class to compensate for a primitive contract.
- A local element must remove its layer declaration when no overlap exists; otherwise it uses z-raised.

## Context rules

- Context is selected by the component owner, not inferred from DOM ancestry.
- The modal context is allowed only when the content is conceptually opened from a Dialog or Sheet and must remain interactive above that modal.
- Context options must be generic and reusable; they must not encode a page-specific name.
- Portals, focus management, dismissal and keyboard navigation remain owned by the underlying Radix primitive.

## Documentation rules

Affected category/profile/registry documents must describe the same default and contextual mapping. A profile cannot claim z-popover for Select while the canonical layer document claims z-dropdown.

## Validation contract

A conforming validator reports:

- file and line;
- family and current token;
- expected token or remove action;
- severity;
- reproducible rule identifier.

Forbidden findings include raw z-10, arbitrary z-[N], style.zIndex, dropdown/select mapped to z-popover, and overlay/content confusion in Sheet.

