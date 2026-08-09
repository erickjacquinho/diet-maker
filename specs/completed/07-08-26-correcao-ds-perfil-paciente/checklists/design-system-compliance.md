# Checklist: Qualidade dos Requisitos de Conformidade ao Design System na Página de Perfil do Paciente

**Purpose**: Validar a completude, clareza, consistência e mensurabilidade dos requisitos descritos em `spec.md`  
**Created**: 2026-08-07  
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [ ] CHK001 Are all typography token mappings (`textStyle(...)`) specified for every text element on the Patient Profile page? [Completeness, Spec §FR-001]
- [ ] CHK002 Are allowed component sizes (`compact` 32px and `standard` 36px) explicitly defined for all interactive buttons and triggers? [Completeness, Spec §FR-004]
- [ ] CHK003 Are design system surface types (`Surface`, `MetricBox`) documented for all card and section containers? [Completeness, Spec §FR-004, §FR-005]

## Requirement Clarity & Precision

- [ ] CHK004 Is the prohibition of ad-hoc typography overrides (`font-bold`, `font-semibold`, `tracking-tight`) quantified and unambiguous across all specification sections? [Clarity, Spec §FR-002]
- [ ] CHK005 Are the specific replacement text styles (`caption`, `body-secondary`, `helper`) clearly assigned for every former usage of `text-style-legal`? [Clarity, Spec §FR-003]

## Requirement Consistency

- [ ] CHK006 Do architectural boundary requirements consistently prohibit direct imports of `@/components/ui/` in page components? [Consistency, Spec §FR-007]
- [ ] CHK007 Are color token usage requirements aligned with the four canonical color families (warm neutrals, primary blue, macro colors, feedback)? [Consistency, Spec §FR-008]

## Scenario & Edge Case Coverage

- [ ] CHK008 Are requirements clearly specified for zero-state scenarios when a patient has no diet or assessment history? [Coverage, Edge Case]
- [ ] CHK009 Are fallback indicator rules (e.g., dash `—` with `muted` tone) specified for undefined body composition values? [Coverage, Edge Case]

## Measurability & Verification

- [ ] CHK010 Can the 100% compliance criteria be objectively verified via static code linting and automated test execution? [Measurability, Spec §SC-001, §SC-004]
