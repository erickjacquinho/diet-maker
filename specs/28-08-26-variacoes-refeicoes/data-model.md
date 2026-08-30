# Data Model: Variações de Refeições

**Feature**: [spec.md](spec.md)  
**Related research**: [research.md](research.md)

## Conceptual model

### Meal group

Represents one scheduled meal in the plan. It owns the identity shared by all options.

| Field | Meaning | Rules |
| --- | --- | --- |
| `id` | Stable identity of the meal group | Unique within the diet context |
| `name` | Shared meal name, such as `Almoço` | Edited once for the group |
| `time` | Shared scheduled time | Edited once for the group |
| `items` | Foods of the first option | Existing field; represents Variação 1 |
| `variations` | Additional meal options | Optional for compatibility; at most four extra options |

### Meal variation

Represents an additional independent option of a meal group.

| Field | Meaning | Rules |
| --- | --- | --- |
| `id` | Stable identity of the option | Fresh identity when the option is created or cloned |
| `items` | Foods, amounts and calculated values for the option | Independent from every other option |
| position | Display order in the group | Derived from the base option plus the `variations` array |
| label | User-facing badge | Derived as `Variação N`; never stored as editable text |

The existing `items` field remains the storage representation for Variação 1. The optional `variations` collection stores Variações 2 through 5. Domain helpers should expose the conceptual ordered list of one to five options so callers do not duplicate the base-plus-extra interpretation.

## Invariants

1. A meal group always has at least one option, represented by its current `items`.
2. A meal group has no more than five total options.
3. A group name and time are shared across all options.
4. Foods, amounts, order and calculated macros belong to one option only.
5. Option labels are positional and sequential; they are not user-editable fields.
6. The active option is UI state and defaults to the first option when a diet is opened.
7. Totals use exactly one selected option per meal group.
8. A meal group in one carbohydrate-cycling day cannot mutate a group in another day.
9. A duplicated group and its options must not share mutable item identities with the source group.

## State transitions

| Current state | Action | Result | Active option |
| --- | --- | --- | --- |
| One option | Add variation | Original remains option 1; clone becomes option 2 | New last option |
| Two to four options | Add variation | Active option is cloned and appended | New last option |
| Five options | Add variation | No state change; action unavailable and user receives clear feedback | Existing active option |
| Two or more options | Select option | Same card shows selected option content | Selected option |
| Two or more options | Delete active option | Option removed; remaining options renumbered | Last remaining option |
| Two options | Delete one option | One option remains; variation controls are hidden | Remaining option |
| One option | Reopen diet | Existing normal meal view | Option 1 |
| Any group | Duplicate meal | New group with all options deeply copied | First option of duplicated group unless the UI explicitly opens the new group during creation |

## Context scoping

The active option selection must be scoped by the current diet context and meal group. For simple diets the context is the plan plus meal group. For carbohydrate cycling the context is the plan, cycle-day variation and meal group. This prevents a selected option in one cycle day from being reused accidentally by another day with a similar meal.

## Read and write compatibility

- Reading an older meal without `variations` produces one conceptual option from its existing `items`.
- Writing a meal with no extra option may omit `variations`, preserving the existing single-meal shape.
- Writing a meal with alternatives keeps the original group identity and stores only additional option data.
- Existing historical summaries and patient records remain valid because the original meal identity and first-option fields remain available.
- No patient-facing export shape is expanded in this feature.

## Calculation rules

For each meal group, resolve the active option before calculating the meal total. Aggregate the resolved option from each group into the current diet context. Never aggregate all options in one group. Changing the active option must recalculate the displayed meal summary and diet totals without changing target macros or automatically equalizing option composition.
