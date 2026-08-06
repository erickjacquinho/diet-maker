# Reproducibility review

Review date: 2026-07-31
Review method: one representative component per visual category, comparing registry entry → category contract → individual profile. The reviewer checked that category owns shared rules and the profile contains only family-specific decisions.

| Category | Representative | Registry | Category/profile alignment | Concordance |
| --- | --- | --- | --- | --- |
| `actions` | `ui-button` | `ui` / `async` | Button variants and loading specialize actions without redefining geometry. | PASS |
| `fields` | `ui-input` | `ui` | Input inherits label, value, focus and validation rules. | PASS |
| `selection` | `ui-select` | `ui` | Trigger/content/options preserve selection semantics and overlay composition. | PASS |
| `navigation` | `organism-sidebar-nav` | `organism` / `collapsible` | Shell coordination is structural; item visuals remain navigation-owned. | PASS |
| `surfaces` | `ui-card` | `ui` | Compound parts use surface anatomy; no card shadow or local radius. | PASS |
| `data-display` | `ui-table` | `ui` | Table parts preserve headers, rows, numeric alignment and empty/loading states. | PASS |
| `feedback` | `ui-badge` | `ui` | Badge is a status label, not a button; severity and macro semantics remain distinct. | PASS |
| `overlays` | `ui-dialog` | `ui` | Radix focus/dismissal is preserved; profile names parts without copying the state matrix. | PASS |
| `loading` | `atom-progress-bar` | `atom` / `nutrition-macro` | Progress owns determined progress; macro trait only adds nutrient color semantics. | PASS |
| `nutrition-domain` | `molecule-macro-metric-card` | `molecule` / `nutrition-macro` | Metric profile names nutrient anatomy and inherits macro tokens from the category. | PASS |
| `structure` | `template-app-layout-shell` | `template` / `collapsible` | Shell owns regions and sidebar slots, never child styling. | PASS |

## Independent agreement

The same two-axis classification was reached for all eleven samples: Atomic layer determines composition/dependencies, while the category determines visual/interaction inheritance. No sample required an unrecorded variant, token, state, or exception. The canonical strict audit and full test suite both pass after the review.
