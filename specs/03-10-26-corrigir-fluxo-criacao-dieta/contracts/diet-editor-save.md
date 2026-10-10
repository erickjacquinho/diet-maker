# Diet Editor Save Contract

This contract describes user-visible save, navigation, snapshot, and load states. It uses the existing local diet repository, draft store, and profile checkpoint surface.

## Snapshot and weight behavior

| Event | Required outcome |
| --- | --- |
| Change quantity on an existing item | Keep source/version and frozen reference values; update prescribed quantity and recompute nutrients from that reference. |
| Substitute an item | Replace source identity and snapshot with the selected item's complete source/version/nutrition; preserve its prescribed quantity and valid provenance. |
| Insert a supported library source | Keep its captured snapshot and provenance; the diet confirmation validator accepts all modeled source kinds when their snapshot is complete. |
| Open a plan with `weightReferenceKg` | Use that exact weight for g/kg; never replace it with today's profile weight. |
| Open a legacy plan without a recoverable weight reference | Leave g/kg unavailable; do not fabricate a value or open a historical backfill flow. |

## Save result and next action

| Result | User-facing state | Next action |
| --- | --- | --- |
| `COMMITTED` | Prescription confirmed and profile checkpoint complete. | Return to patient profile. |
| `CLEANUP_PENDING` | Prescription confirmed locally; draft cleanup is pending. | Offer cleanup-only retry against the confirmed revision; never resubmit the diet mutation. |
| `CHECKPOINT_PENDING` | Prescription confirmed locally; `.nutridiet` checkpoint is pending. | Return to patient profile; reuse its pending/paused sync indicator and file-sync retry. Keep cleanup state if it is also pending. |
| `ROLLED_BACK` | Prescription was not confirmed; draft remains available. | Correct the cause and retry explicitly. |
| `VERSION_CONFLICT` | Base plan/revision changed; draft remains available. | Require review; do not overwrite the newer plan. |
| `RESULT_UNKNOWN` | Commit outcome is not known. | Reconcile by stable diet ID before enabling retry. |

Reconciliation results:

- **Committed**: report the confirmed plan, clean only the matching draft revision, and checkpoint the workspace without resubmitting the diet mutation. If that file sync fails, transition to checkpoint pending.
- **Not committed**: keep the draft and allow an explicit retry with the same reserved target ID.
- **Review required**: preserve the draft, show a review state, and block another submit.
- **Cleanup pending**: commit remains confirmed; retry only revision-checked draft cleanup.

## Navigation and editing

- The editor may leave through its back control or cycle-matrix action only after the required draft flush returns `SAVED`; preview routes that already flush keep the same gate.
- A thrown, `SUPERSEDED`, `INVALIDATED`, missing, or otherwise non-`SAVED` flush keeps the user on the editor with a recovery action.
- Ctrl+S/Cmd+S cannot start page confirmation while an edit dialog is open. Explicit Save makes the existing editor region inert before its final flush begins and until a terminal outcome; callbacks also reject mutations during that interval.
- Background autosave remains nonblocking; the user can continue editing while it writes a revision.
- Global app navigation and closing the browser are outside this editor-owned flush contract.

## Opening states

- `loading`: patient and editable draft are being opened.
- `ready`: patient and draft are available.
- `error`: show the domain cause in actionable language and offer retry or safe return. An error must not render as an indefinite spinner.

Busy, error, and recovery information must be available to keyboard and assistive-technology users and cannot rely only on color.
