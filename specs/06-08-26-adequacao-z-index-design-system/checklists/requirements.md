# Specification Quality Checklist: Adequação da hierarquia z-index ao Design System

**Purpose**: Validar completude, clareza, consistência e mensurabilidade da especificação de adequação de camadas.
**Created**: 2026-08-06
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] A especificação separa diagnóstico do estado atual, resultado desejado e escopo de implementação posterior. [Clarity]
- [x] O texto mantém o foco em consistência de camadas, overlays e acessibilidade, sem expandir para uma reescrita visual. [Scope]
- [x] O vocabulário `z-dropdown`, `z-popover`, `z-overlay` e `z-modal` é definido e usado de forma consistente. [Consistency]
- [x] O documento distingue fatos observados no runtime de decisões propostas para a migração. [Traceability]

## Requirement Completeness

- [x] Todas as 19 ocorrências explícitas e os 10 consumidores semânticos estão representados no diagnóstico e nos critérios de sucesso. [Completeness, Spec §Contexto e diagnóstico]
- [x] Os requisitos cobrem primitives, molecules, organisms e páginas que usam empilhamento. [Coverage, Spec §FR-001–FR-010]
- [x] Os requisitos tratam usos conformes, divergências de token, contexto modal e overlays locais. [Coverage, Spec §FR-004–FR-010]
- [x] O escopo fora da feature está explicitamente delimitado. [Completeness, Spec §Out of Scope]

## Acceptance Criteria Quality

- [x] Cada história possui teste independente e cenários Given/When/Then observáveis. [Measurability]
- [x] Os critérios de sucesso usam contagens e estados verificáveis sem depender de uma implementação específica. [Measurability, Spec §SC-001–SC-007]
- [x] A especificação define gates e ausência de findings bloqueantes como parte da homologação. [Acceptance, Spec §SC-006]

## Scenario and Edge-Case Coverage

- [x] O comportamento de overlays aninhados em dialogs/sheets está especificado. [Coverage, Spec §Edge Cases]
- [x] Escape, foco, dismissal, zoom de 200%, resultados vazios e conteúdo longo estão cobertos. [Edge Cases]
- [x] A ausência de `z-sticky`, `z-navigation` e `z-toast` é tratada como resultado de auditoria, não como lacuna silenciosa. [Completeness]

## Non-Functional Requirements

- [x] Acessibilidade, teclado, foco visível, contraste e reduced motion permanecem exigidos pelos contratos existentes. [Accessibility, Spec §User Story 2]
- [x] O requisito de detecção automática de novas divergências está definido. [Operational, Spec §FR-012, §SC-007]
- [x] A preservação de dados, rotas, cálculos e escopo desktop está explicitamente registrada. [Compatibility, Spec §FR-014]

## Notes

- A API `SelectContent layer="modal"` é uma alteração já presente no worktree e deve ser tratada como baseline parcial durante o planejamento.
- O gate atual do catálogo passa, mas não substitui o novo gate específico de classificação de z-index descrito na especificação.
