# Data Model: Layer Inventory and Context

**Feature**: [Adequação da Hierarquia de Camadas](spec.md)

This feature has no persisted business data. The model below describes the records used by the implementation plan, deterministic validator and Design System contract.

## LayerToken

| Field | Type | Allowed values | Meaning |
|---|---|---|---|
| name | string | z-base through z-tooltip | Canonical semantic token |
| value | integer | 0, 10, 20, 30, 40, 50, 60, 70, 80, 90 | Central Tailwind value |
| category | string | base, raised, sticky, navigation, dropdown, popover, overlay, modal, toast, tooltip | Visual responsibility |
| source | path | 07 document or tailwind.config.js | Authoritative definition |

## LayerContext

| Field | Type | Allowed values | Meaning |
|---|---|---|---|
| kind | enum | default, modal, local-overlap | Rendering context |
| owner | path | component or consumer path | Component that declares the context |
| portal | boolean | true or false | Whether Radix renders through a portal |
| expectedToken | LayerToken | canonical token | Token resolved by the context |
| rationale | string | required | Why the context is needed |

Rules:

- default resolves to the component family token.
- modal resolves to z-modal only for content that must sit above a modal backdrop/content context.
- local-overlap resolves to z-raised only when a positioned sibling is actually overlapped.
- tooltip always resolves to z-tooltip.
- overlay resolves to z-overlay and must not be reused as content.

## LayerOccurrence

| Field | Type | Required | Meaning |
|---|---|---|---|
| file | path | yes | Source or test file |
| line | integer | yes | Exact declaration location |
| component | string | yes | Component, page or test subject |
| family | enum | yes | dialog, sheet, dropdown, select, popover, tooltip, local |
| current | string | yes | Existing token or raw value |
| context | LayerContext | yes | Default, modal or local overlap |
| expected | LayerToken | yes | Expected canonical token |
| action | enum | yes | keep, replace, remove, document, test |
| severity | enum | yes | info, warning, error |

## Invariants

1. Every runtime and test LayerOccurrence has a canonical expected token or action remove.
2. No occurrence may introduce a numeric value outside tailwind.config.js.
3. Sheet content cannot share the overlay token with its backdrop.
4. Dropdown/select default cannot use the popover token.
5. Modal context must be explicit for portal content nested conceptually inside Dialog or Sheet.
6. Validator output includes file and line for every error.

