# UX Requirements Quality Checklist: Adequação da Lista de Pacientes

**Purpose**: Validate the completeness, clarity and consistency of the requirements for the desktop patient-list experience
**Created**: 2026-08-04
**Feature**: [spec.md](../spec.md)
**Audience**: Reviewer of the implementation plan and visual migration
**Depth**: Standard

## Requirement Completeness

- [x] Are the main-content scope and the explicit exclusion of the sidebar documented? [Completeness, Spec §Contexto e escopo]
- [x] Are the card-to-table replacement and continuous-list behavior explicitly defined? [Completeness, Spec §FR-001]
- [x] Are all required table columns and the profile-opening affordance named? [Completeness, Spec §FR-002]
- [x] Are the toolbar contents, count behavior and new-patient action specified together? [Completeness, Spec §FR-010–FR-011]
- [x] Are loading, empty-list, no-results, missing-body-fat and missing-next-event states covered? [Coverage, Spec §FR-014]

## Requirement Clarity

- [x] Is the meaning and vertical order of the two record indicators unambiguous? [Clarity, Spec §FR-003–FR-004]
- [x] Is the body-fat metric distinguished from the excluded current-weight metric? [Clarity, Spec §FR-005]
- [x] Is the body-fat delta format, including percent symbol and elapsed days, explicit? [Clarity, Spec §FR-006]
- [x] Is the absence-of-data message defined without implying a fabricated measurement? [Clarity, Spec §FR-007]
- [x] Is the priority sequence explicit without requiring a visible priority-sort control? [Clarity, Spec §FR-008]
- [x] Are event state, type and date requirements specific for overdue, today, future and absent events? [Clarity, Spec §FR-009]
- [x] Is the terminology for body-fat variation consistent with the requirement to avoid `p.p.`? [Consistency, Spec §FR-006 and Edge Cases]

## Requirement Consistency

- [x] Do the table, search and ordering requirements preserve one continuous sequence after filtering? [Consistency, Spec §FR-008 and FR-010]
- [x] Do the profile-navigation requirements avoid conflicting nested actions? [Consistency, Spec §FR-012]
- [x] Do the indicator requirements preserve alignment when either or both records are absent? [Consistency, Spec §FR-004 and Edge Cases]
- [x] Are the approved labels `Recomposição`, `Evolução de gordura` and `Próximo acompanhamento` used consistently? [Consistency, Spec §FR-002 and Contexto e escopo]

## Acceptance Criteria Quality

- [x] Can the continuous-table outcome be objectively distinguished from the discarded card grid? [Measurability, Spec §SC-001]
- [x] Can the priority order and deterministic tie-breaking be objectively evaluated? [Measurability, Spec §SC-002]
- [x] Can BF presence, comparison availability and weight exclusion be objectively evaluated? [Measurability, Spec §SC-003]
- [x] Can keyboard reachability, visible focus and non-color communication be objectively evaluated? [Measurability, Spec §SC-005]

## Scenario and Edge Case Coverage

- [x] Are requirements defined for insufficient historical assessments and missing comparison data? [Edge Case, Spec §Edge Cases]
- [x] Are invalid or missing event dates intentionally mapped to the no-event state? [Edge Case, Spec §Edge Cases]
- [x] Are deterministic ordering requirements defined for patients sharing an event date? [Edge Case, Spec §Edge Cases]
- [x] Are long objectives and desktop-width constraints addressed without introducing mobile scope? [Coverage, Spec §Edge Cases and Out of Scope]

## Non-Functional Requirements

- [x] Are desktop minimum width, design-system usage and light-theme boundaries explicit? [Non-Functional, Spec §FR-015 and Assumptions]
- [x] Are semantic table structure, accessible caption, column scope, focus and icon naming requirements explicit? [Accessibility, Spec §FR-013]
- [x] Is color prohibited as the sole channel for record and event meaning? [Accessibility, Spec §FR-004–FR-005 and SC-005]
- [x] Are the local/offline-first boundary and absence of external integrations documented? [Dependency, Spec §Assumptions and Out of Scope]

## Ambiguities and Assumptions

- [x] Is the source and precedence of current and previous body-fat assessments stated? [Assumption, Spec §Assumptions]
- [x] Is the historical meaning of a diet indicator stated independently from the next diet event? [Assumption, Spec §Assumptions]
- [x] Is reuse of the existing patient-registration flow distinguished from redesigning that flow? [Scope, Spec §FR-017 and Out of Scope]
