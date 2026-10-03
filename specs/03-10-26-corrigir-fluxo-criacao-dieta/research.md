# Research: Corrigir Integridade e Recuperação na Criação de Dieta

## Context

The repository already has canonical nutrition snapshots, optional prescription weight, stable draft/revision IDs, a local diet repository, a profile checkpoint session, and focused tests for snapshot round-trips and save recovery. This feature should repair the conversion and result-handling paths and reuse those contracts.

The contracts consulted are `refs/dieta-db/01-fluxo-paciente-dieta.md`, `06-catalogo-de-alimentos-e-customizados.md`, `07-receitas-e-refeicoes-prontas.md`, `08-snapshots-versionamento-e-integridade-clinica.md`, ADR-003, ADR-009, the PRD, and the project constitution.

## R1 — Recalculate edited items from their captured nutrition base

**Decision**: Keep the source snapshot as the reference for an unchanged food and recompute prescribed quantity and nutrients from its frozen reference values. When the nutrition source changes, capture the selected source and its provenance as the new snapshot before saving.

**Rationale**: `NutritionSnapshot` already contains source identity/version, reference quantity/nutrients, prescribed quantity/nutrients, energy source, calculation version, conversions, and composition. `scaleNutrition` already scales from a reference instead of scaling rounded presentation values. The editor currently rehydrates snapshots into legacy items; quantity/substitution handlers then change legacy fields without changing the snapshot, while the adapter returns any existing snapshot unchanged.

**Alternatives considered**:
- Preserve the old snapshot unconditionally: rejected because the confirmed item can disagree with what the editor shows.
- Re-read the current catalog on every edit: rejected because edits to a catalog item would silently alter a draft already in progress.
- Recalculate from captured reference values and the deliberately selected new source: selected because it uses existing domain contracts and preserves reproducibility.

## R2 — Validate all nutrition sources already supported by the editor

**Decision**: Preserve valid snapshots from TACO foods, account-custom foods, recipes, and ready-meal insertions through diet confirmation. Validation continues checking identity, provenance, positive quantities, nonnegative nutrients, parent relationships, and snapshot completeness.

**Rationale**: The current editor enables library sources; the domain models these source kinds and library insertion creates their snapshots. `validateDietForConfirmation` currently rejects every item whose snapshot source type is not `SYSTEM_TACO`. This conflicts with Decisions 06–08 and blocks confirmation of valid snapshots from existing editor/library paths. Without aligning this validation boundary, snapshot-preserving edits and library insertions cannot complete a valid save.

**Alternatives considered**:
- Restrict the editor to TACO: rejected because it removes existing supported library flows and is outside this repair.
- Weaken snapshot validation generally: rejected because it risks persisting incomplete clinical data.
- Accept only modeled, complete source types while keeping all existing value/provenance checks: selected.

## R3 — Preserve prescription weight without fabricating historical values

**Decision**: Carry `weightReferenceKg` through the legacy/canonical editor conversion and use it for g/kg calculations. If an existing prescription has no recoverable reference, leave it absent and show g/kg as unavailable; do not substitute the current profile weight. Do not add a manual historical-backfill screen or database migration.

**Rationale**: `DietEditableDocument` and `DietPlan` already support the optional field, and the relational schema stores it. New drafts capture the current profile weight. The legacy adapter drops the field and the legacy calculation branch uses the current patient weight. Existing values lost before this repair cannot be reconstructed safely from the current profile.

**Alternatives considered**:
- Backfill with current profile weight: rejected because it can misstate historical clinical metrics.
- Add a manual data-repair workflow: rejected for this feature; the user asked for the identified flow repairs, and absent historical evidence is not recoverable through a new screen.
- Preserve available values, keep absent values unknown, and protect new/future prescriptions: selected.

## R4 — Separate local diet confirmation from file checkpoint status

**Decision**: Preserve the local save outcome when the subsequent `.nutridiet` checkpoint fails. Return a distinct checkpoint-pending outcome that includes the confirmed local result, navigate to the patient profile, and rely on the existing profile sync status/retry control. Do not retry the diet mutation as a file-save retry.

**Rationale**: `saveDietAsActive` can confirm and remove the draft before `ConfirmedOperationCoordinator` marks the workspace dirty and syncs the profile file. `ProfileSession` already represents `pending`/`paused` checkpoint states, `SidebarNav` already offers “Salvar alterações”/“Reautorizar arquivo”, and `SessionAwareAppShell` attempts sync after route changes.

**Alternatives considered**:
- Treat the thrown checkpoint error as diet rollback: rejected because local confirmation already occurred and the draft may already be removed.
- Add a second file retry system in the diet editor: rejected because the profile session and sidebar already own checkpoint recovery.
- Return a truthful partial outcome, then reuse existing profile sync recovery: selected.

## R5 — Reconcile uncertain commits and retry only the unfinished operation

**Decision**: Before enabling retry after `RESULT_UNKNOWN`, query by the stable diet ID. If confirmed, report the commit, clean only the confirmed draft revision, and checkpoint without resubmitting the clinical mutation; if absent, allow retry with the same ID; if unresolved, preserve the draft and require review. Keep `CLEANUP_PENDING` distinct from `CHECKPOINT_PENDING` and repeat only the unfinished cleanup/checkpoint after a confirmed commit.

**Rationale**: The existing application already exposes `reconcileUnknownSave`, the repository supports stable IDs and expected versions, and draft storage supports revision-conditional removal. No generalized retry log or new operation ledger is needed.

## R6 — Gate navigation, editing, and loading outcomes

**Decision**: Gate editor-owned exits that require a flush only after `flushDraft` returns `SAVED`; a thrown, invalidated, or superseded result keeps the editor open. Disable the page save shortcut while an edit dialog is open, then use a native inert region and a central mutation guard during explicit confirmation; background autosave stays nonblocking. Expose a loading error state with retry/back action instead of mapping every open failure to a null diet and indefinite spinner.

**Rationale**: The existing save status and draft revision are already tracked, but status `saving` is also used by nonblocking background autosave; explicit confirmation therefore needs a distinct busy signal. `DietBuilderTemplate` can lock its existing editor region, and current modal focus traps block the Save button; disabling the page shortcut prevents bypassing that state. Back and cycle-matrix actions do not gate on flush success; the PDF/page preview actions already do. `useDietPresets` currently swallows open errors and the page renders only a spinner when state is absent.

**Alternatives considered**:
- Add route-global navigation interception: rejected because the specified outgoing paths are known and can use their existing flush hooks.
- Add new save/loading frameworks: rejected because existing page state, application outcomes, and profile session can express these states.
- Guard the known mutation/navigation entry points and retain a small explicit load state: selected.

## Technology and research agents

No new dependency, external service, storage format, or runtime integration is required. Existing TypeScript/Next.js, React, Vitest, PGlite/IndexedDB, diet repositories, and profile-session mechanisms are retained. No unresolved external research or technology selection remained, so no research-agent dispatch was needed.
