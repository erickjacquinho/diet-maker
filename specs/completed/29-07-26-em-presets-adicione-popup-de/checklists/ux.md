# Requirements Quality Checklist: UX & Data Multiplicative Presets

**Purpose**: Validate requirement quality for backdrop confirmation and multiplicative patient macro calculation
**Created**: 2026-07-29
**Feature**: [spec.md](file:///c:/Programmer/diet-maker/specs/29-07-26-em-presets-adicione-popup-de/spec.md)

## Requirement Completeness

- [ ] CHK001 - Are interaction requirements defined for backdrop click dismissal on the preset dialog? [Completeness, Spec §FR-001]
- [ ] CHK002 - Are options for the confirmation dialog ("Descartar", "Continuar Editando") explicitly specified? [Completeness, Spec §FR-002]
- [ ] CHK003 - Are state preservation requirements defined when discarding is cancelled? [Completeness, Spec §FR-003]

## Requirement Clarity

- [ ] CHK004 - Is the formula for resolving multiplicative macro options (`g/kg × weightKg`) unambiguously documented? [Clarity, Spec §FR-004]
- [ ] CHK005 - Is the behavior specified when applying presets to a patient with non-zero vs zero/missing weight? [Clarity, Spec §FR-005]

## Scenario & Edge Case Coverage

- [ ] CHK006 - Are requirements defined for when the form is pristine (unmodified) when backdrop is clicked? [Coverage, Edge Case]
- [ ] CHK007 - Is rounding precision specified for multiplicative gram calculations and total calorie sums? [Coverage, Spec §FR-004]
