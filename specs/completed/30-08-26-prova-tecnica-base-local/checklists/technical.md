# Technical Requirements Quality Checklist: Prova técnica e base local

**Purpose**: Avaliar completude, clareza, consistência e mensurabilidade dos requisitos da PoC do primeiro SDD de Dieta DB.
**Created**: 2026-08-30
**Feature**: [spec.md](../spec.md)

**Audience**: Revisor do SDD antes do planejamento e da implementação.
**Depth**: Revisão padrão, com foco nos riscos de persistência, atomicidade, isolamento, recuperação e decisão do adaptador.

## Requirement Completeness

- [x] CHK001 A finalidade da PoC, o ator responsável e o portão de decisão estão explícitos? [Completeness, Spec §User Stories 1, FR-013]
- [x] CHK002 Os requisitos cobrem persistência, transação, escopo, migration, draft separado, aba única, portabilidade e rede? [Completeness, Spec §FR-002–FR-011]
- [x] CHK003 A composição da fixture sintética e o significado de “representativa” estão definidos? [Completeness, Spec §FR-001, Key Entities]
- [x] CHK004 O relatório exigido inclui versões, modo, resultados, limitações, tempos e decisão de aprovação? [Completeness, Spec §FR-012–FR-013, SC-007]

## Requirement Clarity

- [x] CHK005 “Persistência real” está concretizada por gravação, fechamento e reabertura com comparação dos dados? [Clarity, Spec §FR-002, SC-001]
- [x] CHK006 Atomicidade e rollback estão definidos para falha intermediária, sem permitir registros parciais? [Clarity, Spec §FR-003–FR-004, SC-002]
- [x] CHK007 O momento em que o modo local sem rede é esperado está limitado ao carregamento prévio dos recursos? [Clarity, Spec §US4, FR-011, NFR-005]
- [x] CHK008 O comportamento para versão incompatível, JSON inválido e relações inconsistentes está especificado antes de qualquer alteração? [Clarity, Spec §FR-009–FR-010, Edge Cases]
- [x] CHK009 O bloqueio da segunda aba ocorre antes de abrir, consultar ou editar, e a reabertura após fechar a primeira está definida? [Clarity, Spec §FR-007, US2]

## Requirement Consistency

- [x] CHK010 A fixture representativa está compatível com a exclusão da integração dos módulos completos do produto? [Consistency, Spec §FR-001, Out of Scope]
- [x] CHK011 A separação entre draft local e dados confirmados é consistente entre cenários, requisitos e premissas? [Consistency, Spec §FR-006, US2, Assumptions]
- [x] CHK012 A recomendação PGlite + Drizzle é tratada como objeto de avaliação, sem ser declarada como adaptador aprovado antes do portão? [Consistency, Spec §FR-013, Assumptions]
- [x] CHK013 A exigência de não haver fallback silencioso é consistente com as falhas de armazenamento, importação, migration e rede? [Consistency, Spec §NFR-002, Edge Cases]

## Acceptance Criteria Quality

- [x] CHK014 Os critérios de sucesso quantificam preservação de dados, rollback, bloqueio de abas, migration, portabilidade e operação local? [Measurability, Spec §SC-001–SC-006]
- [x] CHK015 O critério de aprovação exige conjuntamente todos os riscos essenciais, em vez de aceitar uma consulta isolada? [Measurability, Spec §FR-013, SC-007]
- [x] CHK016 A coleta de tempos está distinguida de uma meta de latência e define o que bloqueia a aprovação? [Clarity, Measurability, Spec §NFR-005, SC-007]

## Scenario Coverage

- [x] CHK017 O fluxo principal de inicializar, gravar, fechar e reabrir a base está coberto por uma jornada independente? [Coverage, Spec §User Story 1]
- [x] CHK018 Os fluxos de exceção e recuperação incluem falha de gravação, segunda aba, migration repetida e importação rejeitada? [Coverage, Exception/Recovery, Spec §Edge Cases, US2, US3]
- [x] CHK019 O cenário alternativo de operar sem rede após preparação dos recursos está separado do cenário de recursos ainda não carregados? [Coverage, Alternate, Spec §US4, FR-011]
- [x] CHK020 A recuperação após descarte ou falha de draft está explicitamente impedida de alterar vigência ou histórico? [Coverage, Recovery, Spec §Edge Cases, FR-006]

## Edge Case Coverage

- [x] CHK021 O spec define o comportamento diante de recusa ou esgotamento do armazenamento, preservando o estado anterior? [Edge Case, Spec §Edge Cases, FR-002, NFR-002]
- [x] CHK022 O spec cobre repetição de migration e exige resultado idempotente ou erro controlado? [Edge Case, Spec §Edge Cases, FR-008]
- [x] CHK023 O spec cobre rejeição sem mutação para versão, JSON ou relações inválidas? [Edge Case, Spec §Edge Cases, FR-009–FR-010]

## Non-Functional Requirements

- [x] CHK024 O escopo de navegador desktop, viewport mínimo e uso de dados sintéticos estão explícitos? [Non-Functional, Spec §NFR-001, NFR-003]
- [x] CHK025 A observabilidade mínima exige resultados nominais, passos reproduzíveis e registro das limitações? [Non-Functional, Spec §NFR-002, NFR-004, SC-007]
- [x] CHK026 O requisito offline evita prometer PWA, cache avançado, sincronização ou disponibilidade antes da preparação? [Non-Functional, Scope, Spec §US4, Assumptions, Out of Scope]

## Dependencies & Assumptions

- [x] CHK027 A dependência de recursos previamente carregados, perfil de navegador e fixture versionada está documentada? [Dependency, Assumption, Spec §US4, NFR-004, Assumptions]
- [x] CHK028 A dependência de aprovação desta etapa para os SDDs seguintes e a ausência de migração do legado estão explícitas? [Dependency, Scope, Spec §Assumptions, Out of Scope]

## Ambiguities & Conflicts

- [x] CHK029 Os termos “fixture”, “draft”, “instância ativa”, “base local” e “amostra de portabilidade” têm significado único no documento? [Ambiguity, Spec §Key Entities, Assumptions]
- [x] CHK030 As exclusões deixam claro que a PoC não entrega telas, backup completo, integração clínica ou autenticação online? [Conflict Prevention, Spec §Out of Scope]

## Notes

- Checklist revisado contra `spec.md` após a auditoria de Clarify; todos os itens passaram como requisitos documentais.
- Os itens avaliam a qualidade dos requisitos, não a execução do código ou o comportamento de uma implementação.
