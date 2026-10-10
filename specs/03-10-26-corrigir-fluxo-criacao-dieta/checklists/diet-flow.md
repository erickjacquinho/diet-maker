# Diet Flow Requirements Checklist: Integridade e Recuperação da Criação de Dieta

**Purpose**: Avaliar se os requisitos do fluxo de dieta são completos, claros, consistentes e cobrem falhas e recuperação.
**Created**: 2026-10-03
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [x] CHK001 Os sete achados da auditoria estão rastreáveis a requisitos funcionais, sem adicionar integração Jev ao produto? [Completeness, Spec §FR-001–FR-014, Out of Scope]
- [x] CHK002 Os requisitos preservam os limites de Conta, paciente ativo e vigência única durante edição e reconciliação? [Coverage, Spec §FR-004, FR-008, FR-012]
- [x] CHK003 A atualização de snapshot define origem, quantidade e nutrientes para edição de porção e substituição? [Completeness, Spec §FR-001–FR-003]
- [x] CHK004 Os tipos de origem já oferecidos no editor são cobertos pelo contrato de snapshot e confirmação? [Completeness, Spec §FR-015, Story 1]
- [x] CHK005 O contrato especifica o que acontece com planos históricos sem peso de referência recuperável? [Completeness, Spec §FR-005, Edge Cases]

## Requirement Clarity

- [x] CHK006 É explícito que peso de referência pertence à prescrição e permanece estável após mudança do cadastro? [Clarity, Spec §FR-004–FR-005]
- [x] CHK007 Está claro quando g/kg fica indisponível e que peso atual não pode ser inferido para dietas históricas sem referência? [Clarity, Spec §FR-005, Assumptions]
- [x] CHK008 Está claro que a falha de checkpoint, após commit local, retorna à ficha do paciente e repete somente a sincronização do arquivo? [Clarity, Spec §Clarifications, Story 2, FR-007]
- [x] CHK009 Os estados de sucesso, limpeza pendente, checkpoint pendente, rollback, conflito e revisão necessária têm significados distintos? [Clarity, Spec §FR-013]
- [x] CHK010 Cada resultado de reconciliação determina se pode haver nova tentativa, qual identidade reutiliza e como conclui o checkpoint depois de confirmar commit? [Clarity, Spec §Story 2, FR-008]

## Requirement Consistency

- [x] CHK011 A regra de snapshot reproduzível é consistente entre novas dietas, dietas copiadas e dietas reabertas? [Consistency, Spec §Story 1, FR-001–FR-003]
- [x] CHK012 A recuperação de limpeza pendente e de checkpoint pendente evita repetir a mutação clínica? [Consistency, Spec §Story 2, FR-006–FR-008, FR-013]
- [x] CHK013 Os gates de saída, o atalho bloqueado em diálogos e o lock nativo distinguem confirmação explícita de autosave em segundo plano? [Consistency, Spec §Story 3, FR-009–FR-010]

## Acceptance Criteria Quality

- [x] CHK014 Os critérios de sucesso medem fidelidade de item, peso, estados de gravação, navegação e acessibilidade? [Measurability, Spec §SC-001–SC-009]
- [x] CHK015 Os critérios descrevem resultados observáveis sem depender de framework, banco ou mecanismo de armazenamento? [Technology Agnostic, Spec §Success Criteria]

## Scenario Coverage

- [x] CHK016 As jornadas cobrem criação nova, edição recuperada, cópia, confirmação, saída do editor e erro de carregamento? [Coverage, Spec §User Scenarios]
- [x] CHK017 Os cenários cobrem caminhos alternativos e de recuperação para rollback, resultado incerto, cleanup pendente e checkpoint pendente? [Recovery, Spec §Story 2, Edge Cases]

## Edge Case Coverage

- [x] CHK018 As condições de flush falho, superado ou invalidado estão diferenciadas e impedem abandonar a revisão atual? [Edge Case, Spec §Story 3, FR-009]
- [x] CHK019 As falhas de paciente arquivado, dieta inexistente, fonte indisponível e perfil sem peso têm resultado definido? [Edge Case, Spec §Story 1, Story 4, Edge Cases]

## Non-Functional Requirements

- [x] CHK020 Estados ocupado, erro e recuperação têm requisitos de teclado e tecnologia assistiva compatíveis com WCAG 2.2 AA? [Accessibility, Spec §Story 4, FR-014, SC-008]
- [x] CHK021 Está explícito que a feature preserva o modo offline-first e não acrescenta serviço externo ou requisito de performance fora do escopo? [Constraint, Spec §Assumptions, Out of Scope]

## Dependencies & Assumptions

- [x] CHK022 As fontes normativas para snapshots, g/kg, salvamento e checkpoint estão identificadas e não entram em conflito? [Dependency, Spec §References]
- [x] CHK023 A ausência de integração Jev no runtime está distinguida do uso de Jev como apoio à auditoria? [Assumption, Spec §Assumptions, Out of Scope]

## Ambiguities & Conflicts

- [x] CHK024 Não há decisão pendente sobre inferência de peso histórico nem caminho de recuperação do checkpoint? [Ambiguity, Spec §Clarifications, FR-005, FR-007]
- [x] CHK025 Os estados de limpeza pendente e checkpoint pendente não são descritos como falha total nem como sucesso completo? [Conflict, Spec §Story 2, FR-007, FR-013]

## Notes

- Escopo de checklist: qualidade dos requisitos para revisão e planejamento; não é uma suíte de teste de implementação.

