# Design-System Stacking Contract Checklist: Adequação da hierarquia z-index

**Purpose**: Validar se os requisitos do contrato de empilhamento são completos, claros, consistentes e prontos para planejamento.
**Created**: 2026-08-06
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [x] O inventário diferencia ocorrências explícitas de utilities `z-*` e consumidores semânticos que geram camadas. [Completeness, Spec §Contexto e diagnóstico]
- [x] Cada família de overlay relevante possui requisito próprio ou herda explicitamente o contrato de `overlays`. [Coverage, Spec §FR-004–FR-010]
- [x] Os seis usos numéricos, o `SheetContent`, o `DatePickerField` e a busca de ingredientes têm decisão de migração identificável. [Traceability, Spec §Inventário inicial]

## Requirement Clarity

- [x] A especificação define a diferença operacional entre `z-dropdown`, `z-popover`, `z-overlay` e `z-modal`. [Clarity, Spec §FR-002, §FR-007]
- [x] O contexto `modal` é descrito como variação semântica fechada, sem permitir valores numéricos ou classes livres. [Clarity, Spec §FR-005–FR-006]
- [x] O termo “overlay aprovado” está limitado à composição com primitives/contratos existentes e preserva foco, dismissal e teclado. [Clarity, Spec §FR-010]

## Requirement Consistency

- [x] Os requisitos não confundem camada Atomic com camada visual de empilhamento. [Consistency, Spec §User Story 1]
- [x] O padrão `z-overlay` para backdrop e `z-modal` para conteúdo modal é consistente em Dialog e Sheet. [Consistency, Spec §FR-004]
- [x] A baseline parcial de `SelectContent layer="modal"` é tratada como existente, mas exige documentação e teste antes de ser considerada homologada. [Assumption, Spec §Assumptions]

## Acceptance Criteria Quality

- [x] Os critérios de sucesso incluem contagem de ocorrências, ausência de tokens proibidos e consistência documental. [Measurability, Spec §SC-001–SC-004]
- [x] Os critérios de comportamento cobrem overlay isolado, overlay aninhado, confirmação secundária, foco, Escape e zoom. [Coverage, Spec §SC-005]
- [x] A especificação define um resultado verificável para a prevenção de regressões futuras. [Operational, Spec §SC-007]

## Edge Cases and Dependencies

- [x] Resultados vazios, longos e roláveis da busca de ingredientes estão explicitamente cobertos. [Edge Case, Spec §Edge Cases]
- [x] A ausência de `z-sticky`, `z-navigation` e `z-toast` é documentada como achado da auditoria, evitando inferência de tokens novos. [Completeness]
- [x] O escopo exclui mudanças de negócio e exige execução posterior via `/speckit-implement`. [Dependency, Spec §FR-014–FR-015, §Out of Scope]

## Notes

- Nenhum item permanece pendente; os checklists validam qualidade da especificação, não a execução da migração.
