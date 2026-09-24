# Data Workflows Checklist: Persistência e desempenho dos perfis de pacientes

**Purpose**: Avaliar completude, clareza e mensuração dos requisitos de saves e consultas clínicas.
**Created**: 2026-09-17
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [x] CHK001 — O papel do `.nutridiet` como save principal está separado dos dados locais pendentes? [Completude, Spec §FR-001–FR-002]
- [x] CHK002 — Os gatilhos de checkpoint cobrem salvamento explícito, navegação com alterações e nova tentativa? [Cobertura, Spec §FR-003–FR-004]
- [x] CHK003 — A lista e os históricos do perfil mantêm os dados e as ações que já existem? [Completude, Spec §FR-010–FR-014]

## Requirement Clarity

- [x] CHK004 — Está claro quando o arquivo não deve ser regravado? [Clareza, Spec §FR-003–FR-005]
- [x] CHK005 — A diferença entre falha local, arquivo pendente e save concluído está explícita? [Clareza, Spec §FR-001, FR-007]
- [x] CHK006 — O limite de 25 é aplicado após busca/agrupamento/ordenação globais no banco, preservando ordem e total? [Clareza, Spec §FR-010–FR-012]

## Requirement Consistency

- [x] CHK007 — Recuperação local, checkpoint e status de save usam o mesmo significado de “pendente”? [Consistência, Spec §FR-001–FR-008]
- [x] CHK008 — A restauração resolve alterações pendentes antes de substituir os dados? [Consistência, Spec §FR-009, Edge Cases]

## Acceptance Criteria Quality

- [x] CHK009 — Os limites de tempo e volumes de referência são mensuráveis e cobrem lista e perfil? [Mensurabilidade, Spec §SC-001–SC-002]
- [x] CHK010 — A equivalência nutricional tem critérios que incluem ciclo e arredondamento? [Mensurabilidade, Spec §SC-005]

## Scenario and Edge Case Coverage

- [x] CHK011 — Salvar, navegar sem alterações, falhar, tentar novamente e reabrir estão cobertos? [Cobertura, Spec §User Story 1, Edge Cases]
- [x] CHK012 — Estados vazios, páginas no limite, erros de consulta e restauração inválida estão cobertos? [Cobertura, Spec §Edge Cases]
- [x] CHK013 — Abertura do resumo e do cardápio completo estão separadas no requisito? [Cobertura, Spec §FR-013, User Story 3]

## Non-Functional Requirements

- [x] CHK014 — Desempenho, acessibilidade e escopo da Conta estão explícitos? [Cobertura, Spec §SC-001–SC-006, FR-010, FR-015]

## Dependencies and Assumptions

- [x] CHK015 — Conta única, uma aba, operação local e ausência de sincronização estão documentadas? [Premissa, Spec §Assumptions, Out of Scope]
- [x] CHK016 — Compatibilidade de arquivos `.nutridiet` e ausência de migração de dados de teste estão documentadas? [Dependência, Spec §FR-016]

## Ambiguities and Conflicts

- [x] CHK017 — Edição externa do arquivo durante uma sessão e colaboração foram explicitamente excluídas? [Limite, Spec §Out of Scope]
- [x] CHK018 — Todos os termos “save principal”, “área local”, “draft” e “checkpoint” são usados de forma consistente? [Consistência, Spec §Key Entities]

## Notes

- Checklist de qualidade de requisitos; não substitui testes da implementação.
