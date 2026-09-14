# Backup Requirements Quality Checklist: Backup manual simples

**Purpose**: Validar completude, clareza, consistência e cobertura dos requisitos do backup manual antes do planejamento
**Created**: 2026-09-12
**Feature**: [spec.md](../spec.md)

**Audience**: Autor e revisor do SDD antes do plano de implementação
**Depth**: Formal, cobrindo requisitos funcionais, recuperação, segurança, acessibilidade e limites da Fase 6

## Requirement Completeness

- [x] CHK001 A especificação define separadamente exportação e restauração como jornadas de valor independentes? [Completeness, Spec §User Story 1, §User Story 2]
- [x] CHK002 O escopo dos dados confirmados incluídos no backup cobre perfil, biblioteca, pacientes, registros clínicos, dietas vigentes, históricos e arquivados? [Completeness, Spec §FR-002]
- [x] CHK003 A especificação identifica explicitamente dados excluídos, incluindo drafts, autosave e edições temporárias? [Completeness, Spec §FR-005]
- [x] CHK004 O contrato do cabeçalho versionado e seus campos obrigatórios está documentado? [Completeness, Spec §FR-004, §Key Entities]
- [x] CHK005 O escopo exclui explicitamente senha, criptografia, nuvem, sincronização, automação, mesclagem e múltiplas bases? [Completeness, Spec §FR-017, §Assumptions]
- [x] CHK006 A especificação registra dependências da Fase 4, da Fase 5, da Conta única e do bloqueio de segunda aba? [Completeness, Spec §Assumptions]

## Requirement Clarity

- [x] CHK007 O termo “dados confirmados” está delimitado por contraste com drafts e estados temporários? [Clarity, Spec §FR-002, §FR-005, §Key Entities]
- [x] CHK008 “Substituir toda a base” está definido como operação sem mesclagem e com confirmação explícita? [Clarity, Spec §FR-010]
- [x] CHK009 Os critérios de validade do arquivo especificam identificador, versões, tipos, IDs, relações, identidade da Conta local, Conta única e vigência única por paciente? [Clarity, Spec §FR-008]
- [x] CHK010 A especificação distingue falha antes da escrita, falha durante a escrita, cancelamento e sucesso da restauração? [Clarity, Spec §User Story 2, §FR-012, §FR-014]
- [x] CHK011 O significado de “arquivo válido”, “compatível” e “inconsistente” é observável nos cenários e requisitos? [Clarity, Spec §FR-008, §FR-014, §Edge Cases]
- [x] CHK012 O tempo máximo de três minutos está associado ao fluxo do usuário e não ao tempo de escolha do local do arquivo? [Clarity, Spec §SC-004]

## Requirement Consistency

- [x] CHK013 Os requisitos de exportação são consistentes com a regra de que o backup não transforma drafts em prescrições? [Consistency, Spec §FR-005, §Acceptance Scenarios]
- [x] CHK014 Os requisitos de restauração são consistentes com a substituição total e a ausência de mesclagem? [Consistency, Spec §FR-010, §FR-017, §Assumptions]
- [x] CHK015 Os requisitos de privacidade não introduzem proteção contraditória com a decisão de não usar senha ou criptografia? [Consistency, Spec §FR-016, §Assumptions]
- [x] CHK016 Os requisitos de atomicidade e os cenários de falha preservam o mesmo resultado: base anterior íntegra ou arquivo inteiro restaurado? [Consistency, Spec §FR-012, §Edge Cases]
- [x] CHK017 O escopo desktop e a acessibilidade estão alinhados com os critérios de sucesso e não introduzem suporte mobile fora da V1? [Consistency, Spec §FR-018, §SC-005, §Assumptions]

## Acceptance Criteria Quality

- [x] CHK018 Os critérios de sucesso quantificam recuperação dos dados confirmados, rejeição prévia, integridade após falhas e tempo de conclusão? [Measurability, Spec §SC-001–SC-004]
- [x] CHK019 Os critérios de sucesso são verificáveis sem depender de uma tecnologia, framework ou API específica? [Measurability, Spec §Success Criteria]
- [x] CHK020 A especificação define sucesso e falha de exportação sem confundir a entrega do arquivo com garantia de armazenamento pelo usuário? [Clarity, Spec §User Story 1, §Assumptions]
- [x] CHK021 A especificação define como medir acessibilidade e operação por teclado nos caminhos principais? [Measurability, Spec §FR-018, §SC-005]

## Scenario Coverage

- [x] CHK022 O fluxo primário de exportação cobre Conta populada e Conta com estados temporários? [Coverage, Spec §User Story 1]
- [x] CHK023 O fluxo primário de restauração cobre arquivo válido, confirmação e recarga do contexto? [Coverage, Spec §User Story 2]
- [x] CHK024 Os fluxos alternativos cobrem cancelamento, Conta vazia, dados arquivados e registros clínicos vazios? [Coverage, Spec §Edge Cases]
- [x] CHK025 Os fluxos de exceção cobrem arquivo inválido, versão não suportada, relações órfãs, IDs duplicados e vigência duplicada? [Coverage, Spec §Edge Cases, §FR-008, §FR-014]
- [x] CHK026 Os fluxos de recuperação cobrem rollback, interrupção, escrita pendente, draft e edição ativa sem importação parcial? [Coverage, Spec §FR-011, §FR-012, §Edge Cases]
- [x] CHK027 O comportamento de uma segunda aba está incluído como cenário de concorrência e não como nova funcionalidade de colaboração? [Coverage, Spec §Edge Cases, §Assumptions]

## Edge Case Coverage

- [x] CHK028 A especificação define a resposta para arquivo vazio, truncado, malformado ou contendo instruções executáveis? [Edge Case, Spec §FR-009, §Edge Cases]
- [x] CHK029 A especificação define a resposta para falha de geração ou download sem alterar a base? [Edge Case, Spec §User Story 1, §Edge Cases]
- [x] CHK030 A especificação define que cancelamento ou erro não deixa uma importação parcial? [Edge Case, Spec §FR-014, §SC-003]
- [x] CHK031 A especificação define a resolução explícita de drafts e gravações pendentes antes de restaurar? [Edge Case, Spec §FR-011]

## Non-Functional Requirements

- [x] CHK032 Os requisitos de segurança e privacidade informam leitura por terceiros, ausência de criptografia/senha e ausência de logs clínicos? [Security, Spec §FR-015, §FR-016, §SC-006]
- [x] CHK033 Os requisitos de operação offline e ausência de rede estão explicitamente delimitados? [Non-Functional, Spec §FR-017, §SC-006]
- [x] CHK034 Os requisitos de acessibilidade cobrem teclado, nome/role/value, foco visível e WCAG 2.2 AA? [Accessibility, Spec §FR-018, §SC-005]
- [x] CHK035 Os requisitos de confiabilidade definem atomicidade e preservação da base anterior após falhas? [Reliability, Spec §FR-012, §SC-003]
- [x] CHK036 Os requisitos de observabilidade proíbem dados clínicos em logs sem exigir um mecanismo de telemetria fora do escopo? [Observability, Spec §FR-015, §SC-006]

## Dependencies & Assumptions

- [x] CHK037 As dependências das etapas 4 e 5 estão declaradas sem reabrir o escopo dessas etapas? [Dependency, Spec §Assumptions]
- [x] CHK038 A especificação declara a premissa de uma Conta e um profissional por base local? [Assumption, Spec §Assumptions]
- [x] CHK039 A especificação declara que restauração não converte versões incompatíveis nem preserva drafts incompatíveis? [Dependency, Spec §FR-017, §Assumptions]
- [x] CHK040 Os itens fora da V1 distinguem claramente backup manual desta fase de autenticação, nuvem, criptografia, assinatura e backup automático? [Scope, Spec §FR-017, §Assumptions]

## Ambiguities & Conflicts

- [x] CHK041 Não restam marcadores `[NEEDS CLARIFICATION]`, TODOs ou termos de decisão aberta na especificação? [Ambiguity, Spec integral]
- [x] CHK042 A terminologia usa consistentemente Conta, dados confirmados, draft, arquivo mestre, restauração e substituição? [Consistency, Spec integral]
- [x] CHK043 Os requisitos não prometem sigilo, autoria, recuperação automática ou mesclagem que foram excluídos do escopo? [Conflict, Spec §FR-016, §FR-017, §Assumptions]

## Notes

- Checklist gerado como teste de qualidade dos requisitos; não valida código ou execução da implementação.
- Nenhuma questão adicional foi necessária na clarificação: as Decisões 11, 13 e 14 definem os limites funcionais e de proteção da Fase 6.
