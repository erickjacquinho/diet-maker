# Requirements Quality Checklist: Onboarding de Profile e Sessão por Save

**Purpose**: Validar clareza, completude e cobertura dos requisitos de entrada, sessão em memória e sincronização com arquivo local.
**Created**: 2026-09-12
**Feature**: [spec.md](../spec.md)
**Audience**: Reviewer
**Depth**: Standard

## Requirement Completeness

- [x] CHK001 — A especificação define o ponto de entrada sem profile e o resultado esperado para qualquer rota interna? [Completeness, Spec §User Story 1, FR-001–FR-005]
- [x] CHK002 — Os fluxos Criar profile e Carregar profile estão descritos como jornadas independentes? [Completeness, Spec §User Story 2–3, FR-006–FR-014]
- [x] CHK003 — A especificação define a persistência durável exclusivamente pelo arquivo `.nutridiet`? [Completeness, Spec §User Story 4, FR-017–FR-019]
- [x] CHK004 — O conteúdo mínimo do profile e a preservação dos dados clínicos confirmados estão documentados? [Completeness, Spec §Key Entities, FR-010, FR-013]
- [x] CHK005 — O requisito de sincronização automática após salvamento explícito está documentado? [Completeness, Spec §FR-024, SC-008]

## Requirement Clarity

- [x] CHK006 — O termo sessão ativa está definido por uma condição observável e por um limite de vida explícito? [Clarity, Spec §Key Entities, Assumptions]
- [x] CHK007 — O comportamento de `/Home` quando já existe sessão ativa está especificado sem ambiguidade? [Clarity, Spec §User Story 1, Acceptance Scenario 3]
- [x] CHK008 — Os campos, obrigatoriedade, disposição e estados do formulário de criação estão definidos? [Clarity, Spec §User Story 2, FR-007–FR-008]
- [x] CHK009 — O significado de "carregar profile" está delimitado como seleção de arquivo `.nutridiet` do computador? [Clarity, Spec §User Story 3, FR-011]
- [x] CHK010 — O limite entre alterações intermediárias e operações explicitamente confirmadas está definido? [Clarity, Spec §User Story 4, FR-024, Assumptions]

## Requirement Consistency

- [x] CHK011 — Os requisitos de sessão em memória são consistentes com a ausência de armazenamento em host, navegador e servidor? [Consistency, Spec §FR-017–FR-019, Assumptions]
- [x] CHK012 — A escolha de gravação no arquivo local é consistente com o uso de HD e de pasta do Google Drive sincronizada? [Consistency, Spec §Clarifications, Assumptions]
- [x] CHK013 — A restauração como substituição sem mesclagem está consistente em onboarding, entidades e limites? [Consistency, Spec §User Story 3, Assumptions]
- [x] CHK014 — Os requisitos impedem fallback silencioso para um armazenamento que contradiga a decisão de privacidade? [Consistency, Spec §FR-025, Edge Cases]

## Acceptance Criteria Quality

- [x] CHK015 — Os cenários de aceite cobrem criação, carregamento, bloqueio de rota, erro, cancelamento e sessão ativa? [Acceptance Criteria, Spec §User Stories 1–4]
- [x] CHK016 — Os critérios de sucesso quantificam tempo, cobertura e preservação dos dados sem depender de uma tecnologia específica? [Measurability, Spec §Success Criteria]
- [x] CHK017 — Existe critério verificável para um backup real contendo pelo menos um paciente em outra origem? [Measurability, Spec §FR-022, SC-003]
- [x] CHK018 — Existe critério verificável para confirmar que o arquivo associado é atualizado após salvar? [Measurability, Spec §SC-008]

## Scenario and Edge Case Coverage

- [x] CHK019 — O fluxo de recuperação para arquivo inválido, incompatível, incompleto ou cancelado está especificado? [Scenario Coverage, Spec §User Story 3, Edge Cases, FR-012–FR-016]
- [x] CHK020 — O comportamento diante de permissão negada, revogada, arquivo movido ou arquivo indisponível está especificado? [Recovery Coverage, Spec §Edge Cases, FR-025]
- [x] CHK021 — A especificação cobre reload, fechamento de aba, troca de porta, host, preview e production sem recuperação automática? [Scenario Coverage, Spec §User Story 4, Edge Cases, SC-005]
- [x] CHK022 — O caso de save válido sem pacientes e de save com pacientes arquivados/históricos está coberto? [Edge Case Coverage, Spec §Edge Cases, FR-013]

## Non-Functional Requirements

- [x] CHK023 — Os requisitos de acessibilidade incluem rótulos, teclado, foco, loading e feedback de erro para o onboarding? [Coverage, Spec §FR-021, SC-007]
- [x] CHK024 — Os limites de privacidade deixam claro que dados clínicos não são enviados para o host e que o arquivo é controlado pelo profissional? [Security/Privacy, Spec §User Story 4, FR-017, Assumptions]
- [x] CHK025 — O escopo desktop e as fronteiras de integração direta com Google Drive estão explícitos? [Scope, Spec §Assumptions]

## Dependencies, Assumptions and Ambiguities

- [x] CHK026 — A especificação registra que a pasta do Google Drive precisa estar disponível como pasta local sincronizada? [Dependency, Spec §Clarifications, Assumptions]
- [x] CHK027 — O comportamento quando a permissão de escrita não pode ser obtida preserva os dados em memória sem armazenamento alternativo? [Dependency/Recovery, Spec §FR-025]
- [x] CHK028 — Todas as decisões críticas antes abertas foram incorporadas em uma seção de clarificações sem marcadores pendentes? [Ambiguity, Spec §Clarifications]

## Notes

- Foco selecionado: UX de onboarding, controle de acesso às rotas, portabilidade do save e confiabilidade da sincronização local.
- Nenhuma pergunta adicional de checklist foi necessária; o pedido, as clarificações e os limites do escopo já são explícitos.
- Os itens avaliam a qualidade dos requisitos escritos, não a execução do código.
