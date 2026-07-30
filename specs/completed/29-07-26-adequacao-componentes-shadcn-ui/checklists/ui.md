# UI Refactoring Requirements Quality Checklist: Shadcn Integration

**Purpose**: Validate requirement quality and completeness for the refactoring of 100% of UI components to Shadcn.
**Created**: 29/07/2026
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [x] CHK001 - Are requirements defined for all 6 page routes in `src/app`? [Completeness, Spec §FR-001]
- [x] CHK002 - Are requirements defined for all legacy custom components in `src/components/atoms`? [Completeness, Spec §FR-002, §FR-003, §FR-006]
- [x] CHK003 - Are accessibility requirements (ESC key to close, focus trapping, overlay dimming) specified for all modals? [Completeness, Spec §User Story 1]
- [x] CHK004 - Are replacement requirements documented for raw `<select>` tags in patient and food forms? [Completeness, Spec §FR-004]

## Requirement Clarity

- [x] CHK005 - Is the variant mapping for each `Button` state (default, secondary, outline, destructive, ghost) explicitly defined? [Clarity, Spec §FR-002]
- [x] CHK006 - Is the structural transition from div-overlay modals to Shadcn `Dialog` and `Sheet` explicitly specified? [Clarity, Spec §FR-001, §FR-008]
- [x] CHK007 - Are `Card` component sub-elements (`CardHeader`, `CardTitle`, `CardContent`) specified for containers? [Clarity, Spec §FR-005]

## Requirement Consistency

- [x] CHK008 - Are `Input` styling and prop requirements consistent across form inputs and search inputs (`TacoSearchInput`)? [Consistency, Spec §FR-003]
- [x] CHK009 - Are modal dismissal behaviors consistent across all 6 application screens? [Consistency, Spec §User Story 1]

## Scenario & Edge Case Coverage

- [x] CHK010 - Are requirements defined for handling long content lists within `DialogContent` using `ScrollArea`? [Edge Case, Spec §Edge Cases]
- [x] CHK011 - Are requirements defined for maintaining controlled input state during dynamic table row edits? [Edge Case, Spec §Edge Cases]

## Acceptance Criteria & Measurability

- [x] CHK012 - Can "100% elimination of raw HTML element tags (`<button>`, `<input>`, `<select>`) in favor of `@/components/ui/*`" be objectively verified? [Measurability, Spec §SC-001]
- [x] CHK013 - Can zero regression in existing user journeys be objectively tested? [Measurability, Spec §SC-002]
