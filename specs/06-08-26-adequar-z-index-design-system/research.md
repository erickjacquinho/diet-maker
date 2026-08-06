# Research: Hierarquia de Camadas

**Feature**: [Adequação da Hierarquia de Camadas](spec.md)
**Date**: 2026-08-06

## Decision 1: The canonical scale is the 07 Design System layer

**Decision**: Use the tokens and values from design-system/07-icons-motion-and-layers.md, also represented in tailwind.config.js.

**Rationale**: This is the normative layer model and it already expresses the intended semantic order from base through tooltip. Replacing it with local numeric values would create a second source of truth.

**Rejected alternatives**:

- Preserve every existing class because some already render correctly: rejected because semantic misuse remains invisible until components are nested.
- Add a new token for every component: rejected because the Design System explicitly defines a finite reusable scale.

## Decision 2: Dropdown and Select use z-dropdown by default

**Decision**: DropdownMenuContent, DropdownMenuSubContent and SelectContent use z-dropdown in ordinary non-modal contexts.

**Rationale**: The canonical scale names z-dropdown for dropdown and select content, while z-popover is reserved for PopoverContent. This distinction makes intent auditable and prevents dropdowns from jumping over unrelated popovers.

**Rejected alternative**: Keep z-popover for Select because the current profile says so; rejected because it conflicts with the normative 07 document and the category contract.

## Decision 3: Modal context is explicit

**Decision**: A reusable primitive that can appear inside a modal may accept an explicit contextual layer that resolves to z-modal. The default remains the component's ordinary semantic token.

**Rationale**: Portals detach the rendered node from the visual subtree. An explicit context prevents a generic popover or select from being globally elevated while still allowing a select or calendar to remain interactive inside DialogContent or SheetContent.

**Rejected alternatives**:

- Always use z-modal for all Select and Popover content: rejected because it collapses the distinction between modal and non-modal overlays.
- Depend only on DOM ancestry: rejected because Radix portals do not preserve visual ancestry in the DOM.
- Put z-index on every consumer with arbitrary classes: rejected because it spreads policy into screens and reintroduces raw overrides.

## Decision 4: Local z-10 is removed unless the overlap is real

**Decision**: Remove z-10 from search icons when the icon does not overlap a positioned sibling; use z-raised only when the element must visibly sit above a field or decoration.

**Rationale**: z-raised is the semantic replacement for a real local elevation. A declaration with no layering purpose adds noise and hides the true source of stacking bugs.

**Rejected alternative**: Blindly replace every z-10 with z-raised; rejected because unnecessary stacking declarations still make future layering harder to reason about.

## Decision 5: Validation is textual plus behavioral

**Decision**: Combine a deterministic inventory/audit with focused component tests and existing repository checks.

**Rationale**: Textual checks catch forbidden values and wrong tokens everywhere; behavioral tests catch portal ordering, interactivity and accessibility regressions that text alone cannot prove.

**Rejected alternative**: Rely only on screenshots or manual browser inspection; rejected because it is non-deterministic and cannot cover every consumer.

## Decision 6: Documentation is part of the contract

**Decision**: Update the affected Design System profiles and registry only when the public contract/export changes.

**Rationale**: The project treats profiles, categories, registry and implementation as a single source of truth. The Select profile conflict must be removed even if the runtime API stays the same.

**Rejected alternative**: Document behavior only in the feature folder; rejected because future component maintainers consult the canonical catalog.

