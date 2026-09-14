# Requirements Quality Checklist: Conta e pacientes

**Purpose**: Avaliar completude, clareza, consistência, mensurabilidade e cobertura dos requisitos da etapa 2
**Created**: 2026-08-30
**Feature**: [spec.md](../spec.md)
**Audience**: Revisor humano do SDD antes do planejamento
**Depth**: Standard

## Requirement Completeness

- [x] CHK001 A especificação define a Conta local, seu contexto ativo e a fronteira de propriedade dos pacientes? [Completeness, Spec §Contexto e objetivo, FR-001]
- [x] CHK002 Todos os atributos cadastrais, temporais, de versão e arquivamento do paciente estão explicitamente listados? [Completeness, Spec §Key Entities, FR-002]
- [x] CHK003 As operações de criação, consulta, listagem, edição, arquivamento e restauração estão cobertas por requisitos e jornadas? [Completeness, Spec §User Stories 2–5, FR-003–FR-012]
- [x] CHK004 O catálogo de objetivos padrão/personalizados e seu vínculo com a Conta estão documentados sem duplicar a fonte de verdade? [Completeness, Spec §User Story 4, FR-008–FR-009]
- [x] CHK005 A especificação distingue o que é entregue nesta etapa do que será preservado para dietas, avaliações, acompanhamentos e backup futuros? [Completeness, Spec §Escopo, §Dependências e limites entre etapas]

## Requirement Clarity

- [x] CHK006 As regras de normalização de nome, contatos e objetivos são específicas o suficiente para produzir o mesmo resultado em entradas equivalentes? [Clarity, Spec §Edge Cases, FR-002, FR-008]
- [x] CHK007 Os limites para idade, altura, peso e metas estão definidos sem deixar valores negativos, ausentes ou não numéricos ambíguos? [Clarity, Spec §Edge Cases, User Story 2]
- [x] CHK008 O termo “arquivar” está claramente diferenciado de apagar/excluir fisicamente em todos os fluxos relevantes? [Clarity, Spec §User Story 5, FR-010]
- [x] CHK009 O contrato de restauração está delimitado como operação autorizada sem tela administrativa nesta etapa? [Clarity, Spec §Fora de escopo, User Story 5, FR-012]
- [x] CHK010 Os estados de carregamento, lista vazia, nenhum resultado, não encontrado e erro recuperável têm significados distintos? [Clarity, Spec §User Story 2, FR-004]

## Requirement Consistency

- [x] CHK011 Os limites da etapa 2 são consistentes com a divisão de etapas da Decisão 14 e não atribuem persistência de dietas ou avaliações a esta entrega? [Consistency, Spec §Escopo, §Dependências, source Decision 14]
- [x] CHK012 A regra de preservar histórico permanece consistente com a regra de não alterar registros relacionados ao editar dados cadastrais atuais? [Consistency, Spec §User Story 3, FR-015, SC-003]
- [x] CHK013 Todos os fluxos usam a Conta ativa validada, sem permitir que a interface escolha livremente um `accountId`? [Consistency, Spec §User Story 1, FR-001, FR-013]
- [x] CHK014 A fronteira futura de drafts locais é compatível com o fato de que o armazenamento de drafts não é implementado nesta etapa? [Consistency, Spec §Dependências e limites entre etapas, FR-011, Assumptions]

## Acceptance Criteria Quality

- [x] CHK015 Os critérios de sucesso convertem o objetivo de uso em resultados observáveis, incluindo o limite de 1 segundo para lista/perfil na fixture representativa? [Measurability, Spec §SC-002, §NFR-005]
- [x] CHK016 Há uma relação verificável entre os cenários de aceite das cinco jornadas e os critérios de sucesso correspondentes? [Traceability, Spec §User Scenarios & Testing, §Success Criteria]
- [x] CHK017 A idempotência de objetivos personalizados está expressa com resultado objetivo, sem depender de interpretação visual? [Measurability, Spec §User Story 4, FR-008, SC-005]
- [x] CHK018 Conflitos de versão e ausência de sobrescrita silenciosa têm resultado de aceitação explícito? [Acceptance Criteria, Spec §User Story 3, FR-007, SC-004]

## Scenario Coverage

- [x] CHK019 O fluxo primário de criar paciente, retornar à lista e abrir o perfil está descrito como jornada independente? [Coverage, Spec §User Story 2]
- [x] CHK020 Os fluxos alternativos de cancelar, fechar e descartar alterações estão documentados para criação e edição? [Coverage, Spec §User Story 3, FR-006]
- [x] CHK021 Os erros de validação, persistência, paciente inexistente, Conta inválida e conflito de versão têm comportamento de recuperação definido? [Exception Flow, Spec §Edge Cases, FR-016]
- [x] CHK022 O fluxo de recuperação após falha de arquivamento preserva o estado anterior e separa qualquer limpeza local futura? [Recovery, Spec §User Story 5, FR-016]
- [x] CHK023 O fluxo de restauração cobre reativação, incremento de versão, preservação histórica e comportamento quando o paciente já está ativo? [Coverage, Spec §User Story 5, §Edge Cases, FR-012]

## Edge Case Coverage

- [x] CHK024 A especificação cobre duplicidade de objetivos após normalização e o efeito de retirar uma opção já utilizada? [Edge Case, Spec §User Story 4, §Edge Cases, FR-009]
- [x] CHK025 A especificação distingue falha de leitura de lista vazia e define o comportamento para identificadores inexistentes? [Edge Case, Spec §User Story 2, FR-004]
- [x] CHK026 O comportamento de todas as mutações clínicas para pacientes arquivados está definido sem apagar seus filhos? [Edge Case, Spec §User Story 5, FR-010–FR-011]
- [x] CHK027 O descarte dos dados legados de teste está especificado como ausência de leitura, conversão e gravação simultânea? [Edge Case, Spec §Fora de escopo, FR-018, SC-006]

## Non-Functional Requirements

- [x] CHK028 A plataforma mínima desktop, o breakpoint de 1024px e as exclusões de mobile/tablet/dark mode estão explícitos? [Completeness, Spec §NFR-001, Assumptions]
- [x] CHK029 Os requisitos de acessibilidade cobrem teclado, foco visível, retorno de foco, semântica e confirmação acessível para a ação destrutiva? [Coverage, Spec §NFR-002, SC-007]
- [x] CHK030 O requisito offline limita-se aos recursos previamente preparados e não promete funcionamento remoto ou PWA? [Clarity, Spec §NFR-004, §NFR-007, SC-008]
- [x] CHK031 O isolamento de Conta e a ausência de autenticação online estão alinhados com os limites de privacidade da V1? [Security, Spec §User Story 1, FR-001, FR-013, §Fora de escopo]
- [x] CHK032 Os estados de envio, sucesso, erro e conflito exigem feedback acionável e evitam sucesso falso? [Observability, Spec §NFR-003, FR-016]

## Dependencies & Assumptions

- [x] CHK033 A aprovação da etapa 1 aparece como pré-condição explícita, incluindo persistência, transação, migration e bloqueio de segunda aba? [Dependency, Spec §Dependências e limites entre etapas, Assumptions]
- [x] CHK034 As dependências com dietas, avaliações, consultas e drafts futuros estão documentadas sem gerar tarefas implícitas nesta etapa? [Dependency, Spec §Fora de escopo, §Dependências]
- [x] CHK035 A dependência do design system canônico e da constituição para desktop e acessibilidade está identificada? [Dependency, Spec §NFR-001–NFR-002, Assumptions]
- [x] CHK036 A fixture sintética, a escala representativa e a reprodutibilidade da validação estão definidas como premissas mensuráveis? [Assumption, Spec §NFR-004–NFR-005, Assumptions]

## Ambiguities & Conflicts

- [x] CHK037 Não há marcadores `[NEEDS CLARIFICATION]`, placeholders de template ou decisões abertas no texto normativo? [Ambiguity, Spec §Validation Notes]
- [x] CHK038 A terminologia canônica distingue Conta, paciente ativo/arquivado, objetivo personalizado, histórico, draft e registro relacionado? [Terminology, Spec §Key Entities, §Edge Cases]
- [x] CHK039 As exclusões, requisitos funcionais, requisitos não funcionais e critérios de sucesso não apresentam conflito sobre persistência, arquivamento ou escopo de tela? [Conflict, Spec §Escopo, §Requirements, §Success Criteria]

## Notes

- Foco selecionado: qualidade de requisitos para domínio/persistência local,
  escopo clínico, fluxos de erro/recuperação, acessibilidade e isolamento por
  Conta.
- O checklist avalia a especificação escrita; não valida implementação, código
  ou execução dos testes.
- A checagem completa do Spec Kit exigiu `plan.md`, inexistente neste estado
  por causa da ordem SDD obrigatória; o checklist foi gerado com base em
  `spec.md` e nas decisões 02, 03, 05 e 14.
