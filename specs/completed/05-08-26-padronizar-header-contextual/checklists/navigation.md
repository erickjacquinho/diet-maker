# Navigation Requirements Checklist: Header contextual para fluxos hierárquicos

**Purpose**: Validar a completude, clareza e consistência dos requisitos de navegação contextual antes do planejamento.
**Created**: 2026-08-05
**Feature**: [spec.md](../spec.md)

**Focus**: Fluxos hierárquicos, breadcrumb, retorno contextual, acessibilidade e limites entre páginas, rotas globais e modais.
**Audience**: Revisão de requisitos e planejamento de implementação.

## Requirement Completeness

- [x] CHK001 Os requisitos cobrem o fluxo principal lista de pacientes → perfil → dieta/consulta? [Completeness, Spec §User Story 1, FR-006, FR-007]
- [x] CHK002 O requisito define o comportamento de uma futura página sequencial, sem exigir alteração desta especificação? [Completeness, Spec §User Story 2, FR-009]
- [x] CHK003 A preservação de ações existentes no topo está explicitamente coberta? [Completeness, Spec §User Story 3, FR-005]

## Requirement Clarity

- [x] CHK004 O termo "página sequencial" está definido por uma relação explícita com uma rota pai? [Clarity, Spec §FR-009, Key Entities]
- [x] CHK005 Os destinos de retorno estão determinados para cada transição mapeada? [Clarity, Spec §FR-002, FR-007]
- [x] CHK006 Os rótulos dinâmicos e a regra de ocultar identificadores técnicos estão definidos? [Clarity, Spec §FR-004, Edge Cases]
- [x] CHK007 A distinção entre header contextual, navegação global e modal está sem ambiguidade? [Clarity, Spec §FR-008, FR-009, Edge Cases]

## Requirement Consistency

- [x] CHK008 O uso do nome dinâmico do paciente está consistente entre cenários, requisitos e assumptions? [Consistency, Spec §User Story 1, FR-004, Assumptions]
- [x] CHK009 A regra de não aplicar o header a páginas globais é consistente com o escopo inicial? [Consistency, Spec §User Story 2, FR-006, FR-009]
- [x] CHK010 A preservação de ações é compatível com a composição de retorno, título e breadcrumb? [Consistency, Spec §User Story 3, FR-005]

## Acceptance Criteria Quality

- [x] CHK011 Os critérios de sucesso são mensuráveis e verificáveis sem depender de uma implementação específica? [Measurability, Spec §SC-001–SC-005]
- [x] CHK012 Cada história possui teste independente e cenários Given/When/Then observáveis? [Acceptance Criteria, Spec §User Story 1–3]

## Scenario and Edge Case Coverage

- [x] CHK013 Os requisitos cobrem estados de paciente ausente, dieta nova, consulta sem dieta e nome longo? [Edge Case Coverage, Spec §Edge Cases]
- [x] CHK014 O limite entre busca de alimento em modal e futura rota própria está explicitamente definido? [Scope, Spec §FR-008, Edge Cases]
- [x] CHK015 A especificação cobre teclado, foco visível, links e heading hierarchy para os controles do header? [Non-Functional Coverage, Spec §FR-010, SC-004]

## Dependencies and Assumptions

- [x] CHK016 A diferença entre a rota solicitada conceitualmente e a rota existente está registrada? [Assumption, Spec §Assumptions]
- [x] CHK017 A dependência do primitivo de breadcrumb e a responsabilidade do componente de produto estão separadas? [Dependency, Spec §FR-011, FR-012]
- [x] CHK018 A execução posterior via `/speckit-implement` e a não declaração de implementação concluída estão registradas? [Assumption, Spec §Assumptions]

## Notes

- Todos os itens passaram na revisão de requisitos; não há lacuna bloqueante para o planejamento.
