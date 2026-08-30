# Requirements Checklist: Variações de Refeições

**Purpose**: Avaliar completude, clareza, consistência, mensurabilidade e cobertura dos requisitos de variações de refeições.
**Created**: 2026-08-28
**Feature**: [spec.md](../spec.md)

**Note**: Este checklist avalia a qualidade dos requisitos escritos, não a implementação.

## Requirement Completeness

- [x] CHK001 Os requisitos cobrem tanto o estado inicial sem variações quanto a criação progressiva de opções? [Completeness, Spec §FR-001–FR-006]
- [x] CHK002 Os requisitos cobrem a aplicação da feature na Dieta Simples e em cada dia do Ciclo de Carboidratos? [Completeness, Spec §FR-017–FR-018]
- [x] CHK003 A duplicação completa de uma refeição com suas variações está documentada? [Completeness, Spec §FR-019]
- [x] CHK004 A compatibilidade com dietas existentes sem variações está explicitamente definida? [Completeness, Spec §FR-020]
- [x] CHK005 Os requisitos cobrem as ações de alimentos que devem permanecer restritas à variação ativa? [Completeness, Spec §FR-011]
- [x] CHK006 A exclusão de exportação para paciente, PDF e WhatsApp está claramente delimitada? [Completeness, Spec §Assumptions]

## Requirement Clarity

- [x] CHK007 O termo “variação ativa” está definido como a opção aberta para edição e cálculo? [Clarity, Spec §Key Entities, FR-009, FR-013]
- [x] CHK008 A regra de cópia da opção aberta para a última posição está especificada sem interpretações alternativas? [Clarity, Spec §FR-003–FR-006]
- [x] CHK009 A separação entre identidade compartilhada e composição independente está explícita? [Clarity, Spec §FR-007, FR-010]
- [x] CHK010 O formato fixo e sequencial dos badges está definido? [Clarity, Spec §FR-008]
- [x] CHK011 O limite máximo de cinco opções e o comportamento no limite estão definidos? [Clarity, Spec §FR-005, FR-023, Edge Cases]
- [x] CHK012 A regra de seleção da Variação 1 ao reabrir a dieta está diferenciada da seleção automática da nova variação criada? [Clarity, Spec §FR-006, FR-014]

## Requirement Consistency

- [x] CHK013 As regras de criação, seleção e numeração são consistentes entre as histórias do usuário, os requisitos e os critérios de sucesso? [Consistency, Spec §User Stories 1–2, FR-003–FR-006, SC-001–SC-002]
- [x] CHK014 As regras de exclusão, renumeração, seleção da última restante e retorno ao estado normal são consistentes entre si? [Consistency, Spec §User Story 4, FR-015–FR-016, Edge Cases]
- [x] CHK015 A especificação distingue consistentemente variação do dia do ciclo e variação da refeição? [Consistency, Spec §User Story 5, FR-017–FR-018]
- [x] CHK016 A liberdade de alterar macros é consistente com o cálculo exclusivo da opção ativa? [Consistency, Spec §FR-010, FR-012–FR-013]
- [x] CHK017 A regra de duplicação do grupo completo é distinta da edição restrita à opção ativa? [Consistency, Spec §FR-011, FR-019, Assumptions]

## Acceptance Criteria Quality

- [x] CHK018 Os critérios de sucesso permitem medir a transformação de uma refeição comum em um grupo sem duplicar o horário? [Acceptance Criteria, Spec §SC-001]
- [x] CHK019 Os critérios de sucesso medem cópia fiel, abertura automática e inserção na última posição? [Acceptance Criteria, Spec §SC-002]
- [x] CHK020 Os critérios de sucesso medem independência entre alimentos, quantidades e macros? [Acceptance Criteria, Spec §SC-003]
- [x] CHK021 Os critérios de sucesso medem limite, exclusão, renumeração e seleção resultante? [Acceptance Criteria, Spec §SC-004–SC-005]
- [x] CHK022 Os critérios de sucesso medem que somente a opção ativa participa dos totais? [Acceptance Criteria, Spec §SC-006]
- [x] CHK023 O critério de compatibilidade define um resultado objetivo para dietas sem variações? [Measurability, Spec §SC-007]
- [x] CHK024 O critério de acessibilidade define operação por teclado, estado selecionado e foco visível? [Acceptance Criteria, Spec §SC-008, FR-022]
- [x] CHK025 O critério de desempenho define um limite observável para a troca de opção e atualização dos totais? [Measurability, Spec §SC-011]

## Scenario Coverage

- [x] CHK026 O fluxo primário de criação e edição está coberto desde uma refeição comum até uma nova opção editável? [Coverage, Spec §User Stories 1–2]
- [x] CHK027 O fluxo alternativo de criar uma nova opção a partir de qualquer opção aberta está coberto? [Coverage, Spec §User Story 1, FR-004]
- [x] CHK028 O fluxo de exceção para o limite máximo está coberto com preservação das opções existentes? [Exception Flow, Spec §User Story 1, FR-005, FR-023]
- [x] CHK029 O fluxo de recuperação após exclusão está coberto até o retorno ao estado sem badges? [Recovery, Spec §User Story 4, FR-015–FR-016]
- [x] CHK030 O isolamento entre dias do Ciclo de Carboidratos está coberto? [Coverage, Spec §User Story 5, FR-018]

## Edge Case Coverage

- [x] CHK031 O comportamento de uma refeição vazia ao criar uma variação está definido? [Edge Case, Spec §Edge Cases]
- [x] CHK032 O comportamento quando a opção removida não era a última está definido? [Edge Case, Spec §Edge Cases, FR-015]
- [x] CHK033 A especificação define o que ocorre quando os macros das opções divergem? [Edge Case, Spec §FR-012, Edge Cases]
- [x] CHK034 A especificação protege contra exclusão acidental das demais opções ou da refeição inteira? [Edge Case, Spec §Edge Cases]
- [x] CHK035 A independência da cópia após duplicação da refeição está definida? [Edge Case, Spec §FR-019, Edge Cases]

## Non-Functional Requirements

- [x] CHK036 As restrições de plataforma desktop e a exclusão de mobile/tablet estão explicitamente documentadas? [Completeness, Spec §Assumptions]
- [x] CHK037 Os requisitos de acessibilidade dos controles selecionáveis estão definidos para nome, estado, foco e teclado? [Accessibility, Spec §FR-022, SC-008]
- [x] CHK038 A expectativa de atualização rápida está quantificada sem depender de tecnologia específica? [Performance, Spec §SC-011]
- [x] CHK039 A especificação deixa claro que não há novas permissões, autenticação ou integração externa? [Security/Dependency, Spec §Assumptions]
- [x] CHK040 A privacidade dos dados e o escopo local existente não são alterados pela feature? [Security/Privacy, Spec §Assumptions]

## Dependencies & Assumptions

- [x] CHK041 As dependências em relação às ações atuais de alimentos estão documentadas? [Dependency, Spec §FR-011, Assumptions]
- [x] CHK042 A dependência em relação ao cálculo nutricional existente está delimitada? [Dependency, Spec §Assumptions]
- [x] CHK043 A suposição de que a seleção inicial sempre é a Variação 1 está explícita? [Assumption, Spec §FR-014, Assumptions]
- [x] CHK044 A suposição de que o limite de cinco opções não é configurável está explícita? [Assumption, Spec §FR-005, Assumptions]
- [x] CHK045 O que está fora do escopo nesta entrega está documentado para evitar expansão indevida? [Scope, Spec §Assumptions]

## Ambiguities & Conflicts

- [x] CHK046 A terminologia usa “grupo de refeição”, “variação de refeição” e “contexto do plano” de forma consistente? [Terminology, Spec §Key Entities]
- [x] CHK047 Não há conflito entre “mesmo card”, “uma opção por vez” e “duplicação do grupo completo”? [Conflict, Spec §FR-009, FR-019, SC-001]
- [x] CHK048 A diferença entre compartilhar nome/horário e manter alimentos/macros independentes está sem ambiguidade? [Ambiguity, Spec §FR-007, FR-010]
- [x] CHK049 A especificação identifica claramente o que é comportamento inicial, o que é comportamento após criação e o que ocorre ao reabrir? [Clarity, Spec §FR-003, FR-006, FR-014]
- [x] CHK050 Todos os requisitos funcionais possuem cenários ou critérios de sucesso correspondentes? [Traceability, Spec §FR-001–FR-023, §User Scenarios & Testing, §Success Criteria]

## Notes

- O checklist foi criado como um artefato adicional de qualidade dos requisitos; o checklist `requirements.md` gerado durante Specify foi preservado.
- Todas as decisões funcionais confirmadas na conversa estão representadas no `spec.md`.
- Nenhum item foi deixado sem resolução; detalhes de arquitetura e decomposição de tarefas serão tratados na fase Plan.
