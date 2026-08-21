# Contract: Canonical Stacking and Overlay Context

## Canonical token contract

| Semantic role | Token | Value | Allowed use |
| --- | --- | ---: | --- |
| Common content | `z-base` | 0 | Flow content |
| Local overlap | `z-raised` | 10 | Icon over input, focused calendar day, local link layer |
| Sticky region | `z-sticky` | 20 | Header/action sticky |
| Persistent navigation | `z-navigation` | 30 | Sidebar/navigation |
| Dropdown/select | `z-dropdown` | 40 | Dropdown and select content |
| Anchored popover | `z-popover` | 50 | Popover content |
| Modal backdrop | `z-overlay` | 60 | Dialog/sheet backdrop |
| Modal content | `z-modal` | 70 | Dialog/sheet content and anchored content explicitly hosted by modal context |
| Toast | `z-toast` | 80 | Floating feedback |
| Tooltip | `z-tooltip` | 90 | Non-interactive auxiliary description |

Numeric utilities, arbitrary utilities and inline static `zIndex` are forbidden. The value table remains owned by the design-system foundation; this contract only maps roles and contexts.

## Overlay context contract

Primitives that can be portalled from a modal may expose a closed semantic layer prop:

```text
layer: default | modal
```

- `default` uses the family token (`z-dropdown` for dropdown/select, `z-popover` for popover).
- `modal` uses `z-modal` and is valid only when the content is opened from an active Dialog/Sheet flow.
- The consumer never supplies a number, arbitrary utility or `!` override.
- The primitive preserves Radix portal, focus, keyboard, collision and dismissal behavior.

The existing `SelectContent layer="modal"` API is the accepted public naming and must be generalized consistently; the final public API must not expose a competing `context` prop.

## Consumer contract

- Pages and domain molecules may request a semantic context but may not own the z-index class.
- `DatePickerField` composes a Popover and delegates layering to the primitive.
- `CreateRecipeModal` composes an approved overlay for ingredient results; a positioned `div` is not an accepted overlay implementation.
- `PatientListTable` and search icons use `z-raised` only when the local overlap is part of their existing anatomy.
- UI primitives remain domain-agnostic and do not import molecules, organisms, app routes or stores.

## Accessibility contract

- Dialog/Sheet backdrop blocks lower interaction; content is above it.
- Select/Popover inside a modal remains keyboard-operable and does not close the parent unexpectedly on Escape.
- Focus returns to the correct trigger after the child overlay closes.
- Tooltip remains non-interactive and supplementary.
- Zoom to 200%, long content, scroll and reduced motion preserve access to the active overlay.

## Audit contract

The z-index gate must emit deterministic findings with:

```text
code, severity, path, line, kind, currentToken, expectedToken, context, message
```

It must report at least:

- numeric or arbitrary z-index utilities;
- static inline `zIndex`;
- token mismatch by primitive family;
- local consumer override of a primitive's stacking token;
- missing or invalid semantic context;
- documentation/profile mapping that contradicts the global token table.

Exit semantics follow the existing design-system audit: `0` no blocking findings, `1` findings, `2` configuration failure.
