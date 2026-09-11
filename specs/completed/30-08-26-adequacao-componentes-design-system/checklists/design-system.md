# Design-system adequation requirements checklist

**Purpose**: Revisar qualidade dos requisitos de adequação, não testar implementação.
**Created**: 2026-08-30
**Feature**: [spec.md](../spec.md)
**Audience**: autor e revisor, antes do planejamento; profundidade padrão com foco em governança e regressão visual/funcional.

## Requirement Completeness

- [x] CHK001 Todas as famílias e conexões necessárias estão nominalmente delimitadas? [Completeness, Spec §FR-001, §FR-002]
- [x] CHK002 As informações exigidas para fontes, exports, ownership e consumidores estão definidas? [Completeness, Spec §FR-003]
- [x] CHK003 Os critérios para completar perfis sem duplicar categoria estão explícitos? [Completeness, Spec §FR-005, §FR-006]
- [x] CHK004 A especificação cobre correção de implementação além de regularização documental? [Completeness, Spec §FR-007, §US2]

## Requirement Clarity

- [x] CHK005 Adequação está distinguida de redesign e alteração normativa? [Clarity, Spec §NFR-001, §Scope and exclusions]
- [x] CHK006 Uma única categoria principal está distinguida de composição e traits? [Clarity, Spec §FR-003, §Edge Cases]
- [x] CHK007 Contagem histórica está distinguida de baseline atual verificável? [Clarity, Spec §FR-004, §Contexto confirmado e dependências]
- [x] CHK008 Valores literais documentais estão distinguidos de defeitos reais no código? [Clarity, Spec §FR-006, §Edge Cases]

## Requirement Consistency

- [x] CHK009 Permissão de editar perfis/cadastro é compatível com proteção dos fundamentos? [Consistency, Spec §NFR-001]
- [x] CHK010 Preservação funcional é compatível com migração estrutural e compatibilidade? [Consistency, Spec §FR-008]
- [x] CHK011 Homologação documental está separada de implementação e aprovação humana? [Consistency, Spec §FR-013, §NFR-006]
- [x] CHK012 A proibição de flexibilizar auditoria cobre exclusões e remoção de cobertura válida? [Consistency, Spec §FR-014]

## Acceptance Criteria Quality

- [x] CHK013 Cobertura total do inventário tem denominador delimitado? [Measurability, Spec §SC-001, §FR-001, §FR-002]
- [x] CHK014 Ausência de contradição documental possui fonte de comparação definida? [Measurability, Spec §SC-002, §NFR-001]
- [x] CHK015 Sucesso de jornada tem cenários independentes identificados? [Measurability, Spec §SC-003, §US1, §US2, §US3]
- [x] CHK016 Falha global fora do escopo impede alegação de aprovação global? [Measurability, Spec §SC-004]
- [x] CHK017 Preservação normativa e privacidade possuem critérios de zero alteração/gravação? [Measurability, Spec §SC-005]
- [x] CHK018 Evidência visual e teclado abrangem todas as famílias afetadas? [Measurability, Spec §SC-006]

## Scenario and Edge Case Coverage

- [x] CHK019 Fluxos nominais de busca, seleção, importação, substituição e consulta estão cobertos? [Coverage, Spec §US2]
- [x] CHK020 Estados vazios, indisponíveis e erros recuperáveis estão definidos ou herdados explicitamente? [Coverage, Spec §FR-009, §Edge Cases]
- [x] CHK021 Casos de aliases e implementações distintas são tratados antes de remoção? [Coverage, Spec §FR-008, §Edge Cases]
- [x] CHK022 Valores ausentes são distinguidos de zero e snapshots protegidos? [Coverage, Spec §FR-011]
- [x] CHK023 Concorrência exige preservação e coordenação de conflitos? [Coverage, Spec §FR-015]
- [x] CHK024 Achados novos fora de escopo têm tratamento explícito? [Coverage, Spec §SC-004, §Edge Cases]

## Non-Functional Requirements

- [x] CHK025 Plataforma, teclado, foco, zoom e movimento reduzido têm fonte normativa definida? [Completeness, Spec §NFR-002]
- [x] CHK026 Proteção de dados exclui acesso de teste ao banco pessoal? [Completeness, Spec §NFR-003]
- [x] CHK027 Preservação de paginação/virtualização e ausência de nova dependência estão especificadas? [Completeness, Spec §NFR-004]
- [x] CHK028 Testes determinísticos precedem implementação e não mudam globais compartilhados? [Completeness, Spec §FR-012, §NFR-005]

## Dependencies and Ambiguities

- [x] CHK029 As dependências concorrentes e o estado histórico das auditorias estão registrados? [Dependency, Spec §Contexto confirmado e dependências]
- [x] CHK030 A passagem para implementação depende de aprovação humana separada? [Clarity, Spec §NFR-006]

## Notes

30/30 requisitos avaliados; nenhuma lacuna ignorada. Referências remetem à
especificação, não comprovam que componentes já estejam conformes. Não houve
necessidade de novas perguntas; escopo e preservação foram definidos na conversa.

