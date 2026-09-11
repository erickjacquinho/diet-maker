# Domain Requirements Checklist: Biblioteca reutilizável por Conta

**Purpose**: Validar completude, clareza e rastreabilidade dos requisitos de domínio da biblioteca
**Created**: 2026-09-01
**Feature**: [spec.md](../spec.md)

**Note**: Este checklist avalia a qualidade dos requisitos, não a implementação.

## Requirement Completeness

- [x] CHK001 - Os requisitos cobrem alimentos customizados, receitas e refeições prontas? [Completeness, Spec §User Stories 1–3]
- [x] CHK002 - O proprietário da Conta e o isolamento cross-account estão explicitamente definidos? [Completeness, Spec §FR-001, §FR-013]
- [x] CHK003 - As regras de inserção da biblioteca no rascunho e confirmação posterior da dieta estão documentadas? [Completeness, Spec §FR-011, §FR-012]
- [x] CHK004 - A decisão de não migrar dados legados nem manter fontes concorrentes está registrada? [Completeness, Spec §FR-014, §Assumptions]

## Requirement Clarity

- [x] CHK005 - Os estados ACTIVE e ARCHIVED e seus efeitos sobre novas seleções estão definidos sem ambiguidade? [Clarity, Spec §FR-004, §FR-016]
- [x] CHK006 - As regras para exclusão física versus arquivamento por dependência estão explícitas? [Clarity, Spec §Edge Cases]
- [x] CHK007 - A distinção entre TACO, alimento customizado, receita, refeição pronta e DietDraft está documentada? [Clarity, Spec §Overview, §Key Entities]
- [x] CHK008 - O limite de composição não recursiva está definido para receitas e refeições prontas? [Clarity, Spec §User Story 2–3, §FR-007, §FR-009]

## Requirement Consistency

- [x] CHK009 - Os requisitos de versionamento e snapshot são consistentes entre origem da biblioteca, rascunho e dieta confirmada? [Consistency, Spec §FR-006, §FR-010, §FR-012]
- [x] CHK010 - A regra de TACO somente leitura é consistente com o uso de ingredientes em receitas? [Consistency, Spec §FR-002, §FR-007]
- [x] CHK011 - As regras de falha atômica são consistentes para todos os agregados e seus filhos? [Consistency, Spec §FR-015, §Edge Cases]

## Acceptance Criteria Quality

- [x] CHK012 - Cada user story possui teste independente e cenários Given/When/Then observáveis? [Acceptance Criteria, Spec §User Stories 1–3]
- [x] CHK013 - Os critérios de sucesso quantificam isolamento, preservação de snapshot, atomicidade e ausência de confirmação prematura? [Measurability, Spec §SC-001–SC-004]
- [x] CHK014 - A meta de busca inferior a 100 ms está associada a uma fixture representativa e não a uma afirmação vaga de desempenho? [Measurability, Spec §NFR-002, §SC-005]

## Scenario and Edge Case Coverage

- [x] CHK015 - Os requisitos contemplam entradas inválidas, valores não finitos, campos ausentes e rendimento inválido? [Edge Case, Spec §Edge Cases]
- [x] CHK016 - Os requisitos contemplam arquivamento ou remoção da origem após uso em snapshot? [Recovery, Spec §User Story 1, §User Story 3]
- [x] CHK017 - Os requisitos contemplam falhas de salvamento sem filhos ou versões parcialmente persistidos? [Exception Flow, Spec §FR-015, §SC-004]
- [x] CHK018 - Os requisitos contemplam identificadores inexistentes e referências de outra Conta sem divulgação de dados? [Security, Spec §FR-013, §Edge Cases]

## Non-Functional Requirements

- [x] CHK019 - Acessibilidade desktop, teclado, foco, nomes acessíveis e contraste estão definidos para as superfícies da biblioteca? [Coverage, Spec §NFR-001]
- [x] CHK020 - A ausência de rede, login, colaboração, backup e abas simultâneas está delimitada para evitar expansão de escopo? [Scope, Spec §NFR-004, §Assumptions]
- [x] CHK021 - A exigência de testes determinísticos e reproduzíveis está explicitamente vinculada aos cenários de risco? [Coverage, Spec §NFR-003]

## Dependencies and Assumptions

- [x] CHK022 - A dependência do banco local canônico, das portas existentes, do DietDraftStore e dos snapshots clínicos está registrada? [Dependency, Spec §Assumptions]
- [x] CHK023 - A manutenção do dataset TACO está explicitamente fora do escopo desta etapa? [Scope, Spec §Assumptions]
- [x] CHK024 - A política de descarte dos stores legados está alinhada com a decisão aprovada pelo usuário? [Assumption, Spec §Assumptions]

## Notes

- Todos os itens passaram na revisão da especificação; não há lacunas de
  requisito pendentes para o planejamento.
