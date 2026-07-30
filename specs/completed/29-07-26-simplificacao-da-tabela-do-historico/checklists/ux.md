# UX & Functional Requirements Checklist: Simplificação do Histórico e Modal Editar Paciente

**Purpose**: Validate requirements quality, completeness, and clarity for patient table simplification and edit patient modal dropdowns  
**Created**: 29/07/2026  
**Feature**: [spec.md](../spec.md)  

## Requirement Completeness

- [x] CHK001 - Are cell formatting requirements explicitly defined for single-line display in "Dados Dietéticos"? [Completeness, Spec §FR-01]
- [x] CHK002 - Are cell formatting requirements explicitly defined for single-line display in "Valores Corporais"? [Completeness, Spec §FR-02]
- [x] CHK003 - Are non-interactive badge behavior requirements specified for "Tipo de Registro"? [Completeness, Spec §FR-03]
- [x] CHK004 - Are select dropdown options defined for Gênero and Objetivo? [Completeness, Spec §FR-07, §FR-08]

## Requirement Clarity & Measurability

- [x] CHK005 - Is the layout position of the `+ Novo` button specified relative to the Objetivo dropdown? [Clarity, Spec §FR-09]
- [x] CHK006 - Is the interaction sequence for opening the "Novo Objetivo" popup modal clearly documented? [Clarity, Spec §FR-10]
- [x] CHK007 - Are local storage key and Toast confirmation requirements explicitly quantified? [Measurability, Spec §FR-12]

## Scenario & Edge Case Coverage

- [x] CHK008 - Are requirements defined for fallback handling when pre-existing patient gender/objective values fall outside default lists? [Edge Case, Spec §FR-07, §FR-08]
- [x] CHK009 - Are requirements specified for event propagation prevention on the "Abrir >" button? [Edge Case, Spec §FR-06]
- [x] CHK010 - Are responsive behavior and design token usage requirements documented? [Non-Functional, Spec §NFR-01]
