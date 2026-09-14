# Clinical Persistence Requirements Checklist: Persistência de avaliações e acompanhamento

**Purpose**: Avaliar completude, clareza, consistência, mensurabilidade e cobertura dos requisitos clínicos antes do planejamento
**Created**: 2026-09-11
**Feature**: [spec.md](../spec.md)

**Note**: Este checklist valida a qualidade dos requisitos escritos, não a implementação.

## Requirement Completeness

- [x] CHK001 Os requisitos de criação, reabertura, edição, consulta e listagem de avaliações estão documentados? [Completeness, Spec §User Story 1–2, FR-001–FR-008]
- [x] CHK002 Os requisitos de criação, substituição e remoção do próximo acompanhamento estão documentados? [Completeness, Spec §User Story 3, FR-009–FR-012]
- [x] CHK003 As projeções de avaliação recente, última atividade, lista, perfil e linha do tempo estão cobertas? [Completeness, Spec §User Story 4, FR-007, FR-012–FR-013]
- [x] CHK004 A preservação de dados ao arquivar e o bloqueio de novas mutações clínicas estão definidos? [Completeness, Spec §User Story 2, FR-016]
- [x] CHK005 O corte do armazenamento legado está explicitamente limitado aos módulos desta etapa e sem migração ou gravação paralela? [Completeness, Spec §Escopo, FR-019]
- [x] CHK006 O comportamento da tela de consulta por data está definido sem introduzir uma entidade clínica implícita? [Completeness, Spec §Consulta por data, FR-024]

## Requirement Clarity

- [x] CHK007 A identidade, propriedade, data clínica, versão e ciclo de edição de uma avaliação estão definidos sem termos ambíguos? [Clarity, Spec §FR-001–FR-006]
- [x] CHK008 A regra de no máximo um próximo acompanhamento por paciente e os tipos permitidos estão explícitos? [Clarity, Spec §FR-009–FR-010]
- [x] CHK009 A distinção entre registros confirmados e estados temporários está clara para atividade e linha do tempo? [Clarity, Spec §FR-013]
- [x] CHK010 A regra de ordenação para avaliações na mesma data possui exigência de desempate determinístico? [Clarity, Spec §Edge Cases, FR-005]
- [x] CHK011 O significado de data civil sem horário e sem deslocamento por fuso está documentado? [Clarity, Spec §Edge Cases, Assumptions]
- [x] CHK012 As condições de rollback, conflito de versão e preservação do formulário estão descritas de forma observável? [Clarity, Spec §User Story 1–3, FR-006, FR-011, FR-017]

## Requirement Consistency

- [x] CHK013 Os requisitos de escopo por Conta e paciente são consistentes entre atores, histórias, requisitos funcionais e critérios de sucesso? [Consistency, Spec §Atores, User Story 5, FR-015, SC-004]
- [x] CHK014 A política para paciente arquivado é consistente entre leitura histórica e bloqueio de mutações? [Consistency, Spec §Atores, FR-016]
- [x] CHK015 A derivação de atividade não conflita com a proibição de duplicar dados clínicos no cadastro do paciente? [Consistency, Spec §FR-007, FR-013–FR-014]
- [x] CHK016 A consulta somente leitura é consistente entre escopo, requisitos, entidades e exclusões? [Consistency, Spec §Consulta por data, Fora de escopo, FR-024, Key Entities]
- [x] CHK017 A preservação das Etapas 1–4 está alinhada aos limites e requisitos de compatibilidade? [Consistency, Spec §Dependências, NFR-006]

## Acceptance Criteria Quality

- [x] CHK018 Os critérios de persistência após reabertura estabelecem resultado integral e ausência de duplicatas? [Measurability, Spec §SC-001]
- [x] CHK019 Os critérios de atomicidade exigem zero registros parciais e zero projeções divergentes? [Measurability, Spec §SC-002]
- [x] CHK020 A cardinalidade do acompanhamento é objetivamente verificável em todos os fluxos de mutação e cancelamento? [Measurability, Spec §SC-003]
- [x] CHK021 Os limites de desempenho especificam percentual, duração e contexto de medição? [Measurability, Spec §NFR-003, SC-007]
- [x] CHK022 O corte legado possui um resultado auditável de zero leitura, escrita, fallback ou gravação paralela? [Measurability, Spec §SC-009]

## Scenario and Edge-Case Coverage

- [x] CHK023 Os fluxos primários, alternativos, de exceção e recuperação estão cobertos para avaliações e acompanhamentos? [Coverage, Spec §User Stories 1–3]
- [x] CHK024 Os requisitos tratam duplo salvamento, edição desatualizada e arquivamento durante uma mutação? [Coverage, Spec §Edge Cases]
- [x] CHK025 Os requisitos tratam falhas parciais sem permitir divergência entre registro clínico e projeções? [Recovery, Spec §FR-017, NFR-001]
- [x] CHK026 As medidas opcionais, normalização bilateral e preenchimento assistido possuem limites definidos? [Coverage, Spec §User Story 1, Edge Cases, Assumptions]
- [x] CHK027 Datas passadas de acompanhamento e múltiplas avaliações na mesma data estão explicitamente cobertas? [Coverage, Spec §Edge Cases]

## Non-Functional Requirements

- [x] CHK028 Privacidade, isolamento de escopo e rejeição sem exposição estão especificados para toda leitura e mutação? [Security, Spec §FR-015, NFR-002]
- [x] CHK029 Operação offline e ausência de dependências remotas silenciosas estão definidas de forma verificável? [Reliability, Spec §NFR-004, SC-008]
- [x] CHK030 Acessibilidade por teclado, foco, nomes, estados acessíveis e plataforma desktop mínima estão documentadas? [Accessibility, Spec §NFR-005, SC-006]
- [x] CHK031 Determinismo, dados sintéticos e isolamento dos testes estão definidos? [Testability, Spec §NFR-007]

## Dependencies, Assumptions and Boundaries

- [x] CHK032 As dependências das Etapas 1–4 e a separação da Etapa 6 estão explicitadas? [Dependency, Spec §Dependências e limites]
- [x] CHK033 As suposições de Conta única, aba única, dados legados de teste e ausência de migração estão documentadas? [Assumption, Spec §Assumptions]
- [x] CHK034 Autenticação online, sincronização, agenda, prontuário ampliado e backup estão inequivocamente fora do escopo? [Boundary, Spec §Fora de escopo]
- [x] CHK035 A preservação das fórmulas, campos e fluxos existentes evita decisões funcionais implícitas no planejamento? [Assumption, Spec §FR-022, Assumptions]

## Notes

- Profundidade: portão formal de revisão antes do planejamento.
- Público: autor e revisor humano do SDD.
- Focos prioritários: integridade clínica, isolamento por Conta e paciente, recuperação de falhas e corte do legado.
