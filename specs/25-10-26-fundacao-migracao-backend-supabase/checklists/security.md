# Security Requirements Checklist: Fundação da migração para o backend Supabase (F0)

**Purpose**: Validar a qualidade dos requisitos de isolamento, privilégios, chaves e exposição ao navegador antes do plano
**Created**: 2026-10-26
**Feature**: [spec.md](../spec.md)
**Depth/Audience**: Gate formal para revisão de PR; a F0 altera o projeto de produção.

## Requirement Completeness

- [x] CHK001 Os caminhos de acesso do servidor ao banco estão enumerados e restritos às funções de transação? [Completeness, Spec §FR-011, §FR-012]
- [x] CHK002 A origem da identidade da conta está definida como exclusivamente a sessão validada? [Completeness, Spec §FR-009, §FR-009a]
- [x] CHK003 Os atributos do papel de runtime estão especificados por completo, com os limites de tempo quantificados (5 s / 10 s)? [Completeness, Spec §FR-001]
- [x] CHK004 Os privilégios do runtime em `app.accounts` estão definidos por operação? [Completeness, Spec §FR-008]
- [x] CHK005 A revogação para os papéis de navegador cobre schemas, tabelas, funções e objetos futuros, inclusive o `EXECUTE` global padrão de `PUBLIC`? [Coverage, Spec §FR-003, §FR-004, §FR-007]
- [x] CHK006 A proibição de `SECURITY DEFINER` está explícita para todas as funções da fundação? [Completeness, Spec §FR-007, §FR-009a]
- [x] CHK007 O local de armazenamento, o escopo de ambiente e o backup da KEK estão especificados? [Completeness, Spec §FR-015, §FR-016]
- [x] CHK008 A separação entre a KEK das contas e a `SERVER_MASTER_KEY` está especificada com uma regra verificável? [Completeness, Spec §FR-014]
- [x] CHK009 A exigência de TLS com verificação de certificado e hostname no remoto está especificada? [Completeness, Spec §FR-022, US6-3]
- [x] CHK010 A confirmação humana para ações remotas e o smoke com login em produção têm um responsável definido? [Completeness, Spec §FR-022b]

## Requirement Clarity

- [x] CHK011 O conjunto de "variáveis sensíveis" está definido sem ambiguidade (lista explícita + regra por nome)? [Clarity, Spec §FR-019]
- [x] CHK012 O escopo de arquivos da varredura do bundle (assets estáticos e pré-renderizados) e o que fica fora (respostas dinâmicas → F1) estão claros? [Clarity, Spec §FR-017]
- [x] CHK013 Os padrões proibidos se mantêm atualizados com as migrations, sem uma lista manual? [Clarity, Spec §FR-017]
- [x] CHK014 A restrição de imports do cliente é definida sobre o grafo transitivo, e não só sobre imports diretos? [Clarity, Spec §FR-018]
- [x] CHK015 "Alerta de segurança" está quantificado por nível (`warn`/`error`) e tipo? [Clarity, Spec §FR-020]

## Scenario & Edge Case Coverage

- [x] CHK016 O comportamento sem nenhum contexto (conta ou usuário) está definido? [Coverage, Spec §FR-009a, US1-1]
- [x] CHK017 O comportamento com contexto vazio, malformado ou de conta inexistente está definido? [Edge Case, US1-6, Edge Cases]
- [x] CHK018 O vazamento de contexto entre conexões reaproveitadas pelo pooler está coberto por um requisito verificável? [Coverage, US4-2, Edge Cases]
- [x] CHK019 Os contextos `app.user_id` e `app.account_id` simultâneos e divergentes estão tratados? [Edge Case, Edge Cases]
- [x] CHK020 A exclusão no Auth de um usuário com conta está definida? [Coverage, Spec §FR-006, US1-7]
- [x] CHK021 A perda de senha no rename (MD5) está prevista? [Edge Case, Spec §FR-001] — resolvida pela rotação obrigatória da senha logo após o rename.

## Consistency & Traceability

- [x] CHK022 Os requisitos de não vazamento de valores secretos são consistentes entre carregador de chave, varredura e CI? [Consistency, Spec §NFR-003, §FR-014, §FR-017]
- [x] CHK023 Os limites do modelo de ameaças (credencial roubada, sem E2EE) estão registrados para não serem lidos como garantia? [Traceability, Spec §Limites conhecidos]
- [x] CHK024 As exclusões de segurança (endurecimento do Auth → F1, auditoria → F3, DTO de respostas dinâmicas → F1) estão declaradas? [Consistency, Spec §Fora do escopo]
- [x] CHK025 O impacto LGPD da F0 está delimitado (nenhum dado pessoal novo além do vínculo de UUIDs)? [Coverage, Spec §Limites conhecidos]

## Notes

- Avaliação de 2026-10-26: CHK006, CHK009, CHK010, CHK013, CHK014, CHK019, CHK021, CHK023 e CHK025 falharam na primeira leitura. A spec foi corrigida (FR-007, FR-009a, FR-017, FR-018, FR-022, FR-022b, FR-001, "Limites conhecidos" e Edge Cases), e todos os itens passam.
