# UX Requirements Checklist: Tabela de variações no histórico de ciclo

**Purpose**: Avaliar completude, clareza, consistência e mensurabilidade dos requisitos da experiência tabular de variações.
**Created**: 2026-08-27
**Feature**: [spec.md](../spec.md)

**Note**: Este checklist valida a qualidade dos requisitos escritos, não a implementação.

## Requirement Completeness

- [x] CHK001 Os requisitos definem todos os valores necessários por variação — nome, dias, macros, calorias e refeições? [Completeness, Spec §FR-002–FR-004]
- [x] CHK002 O escopo diferencia claramente o resumo da prescrição dos detalhes das variações? [Completeness, Spec §FR-001, §FR-010]
- [x] CHK003 O comportamento de dietas simples está explicitamente protegido contra alterações? [Completeness, Spec §FR-013]
- [x] CHK004 Os estados sem variações, sem dias e sem refeições estão todos descritos? [Completeness, Spec §FR-007–FR-009]

## Requirement Clarity

- [x] CHK005 O formato dos dias está especificado como uma única coluna, com rótulos canônicos separados por vírgula e espaço? [Clarity, Spec §Clarifications, §FR-004]
- [x] CHK006 O significado de “altura padrão” está associado a uma linha sem segunda faixa de conteúdo e a um mínimo verificável? [Clarity, Spec §FR-005, §NFR-003]
- [x] CHK007 A regra para nomes longos e conteúdo textual excedente define como preservar a consulta completa sem aumentar a linha? [Clarity, Spec §FR-005, §Edge Cases]
- [x] CHK008 A ordem de exibição das variações e dos dias está explicitamente definida? [Clarity, Spec §FR-004, §FR-014]

## Requirement Consistency

- [x] CHK009 A exigência de linhas de variação independentes é consistente com a exigência de altura padrão e com a remoção da grade de cards? [Consistency, Spec §FR-005–FR-006]
- [x] CHK010 A preservação da média semanal ponderada é consistente entre os cenários de uso, requisitos funcionais e critérios de sucesso? [Consistency, Spec §US2, §FR-001, §SC-002]
- [x] CHK011 A decisão de manter cabeçalhos semanticamente disponíveis é consistente com a intenção de uma apresentação visual discreta? [Consistency, Spec §FR-012, §NFR-002]

## Acceptance Criteria Quality

- [x] CHK012 Os critérios de sucesso quantificam a escala mínima de variações e a ausência de perda de dados? [Measurability, Spec §SC-001]
- [x] CHK013 O tempo esperado para identificar os dados de uma variação está definido de forma objetiva? [Measurability, Spec §SC-003]
- [x] CHK014 A preservação da altura, resumo, status e ações possui um resultado observável? [Measurability, Spec §SC-002]
- [x] CHK015 A cobertura de acessibilidade possui um critério percentual verificável? [Measurability, Spec §SC-006]

## Scenario and Edge Case Coverage

- [x] CHK016 Os cenários principal, alternativo e de expansão/recolhimento estão descritos com estado inicial, ação e resultado? [Coverage, Spec §US1–US3]
- [x] CHK017 A especificação cobre explicitamente de uma até oito variações e indica o comportamento esperado acima do caso comum? [Coverage, Spec §US1, §Edge Cases, §NFR-003]
- [x] CHK018 A especificação define o comportamento não destrutivo para dados históricos incompletos ou inconsistentes? [Coverage, Spec §Edge Cases]
- [x] CHK019 A especificação define a separação entre expandir detalhes e acionar visualizar, editar ou excluir? [Coverage, Spec §US3, §FR-010]

## Non-Functional Requirements

- [x] CHK020 Os requisitos de desktop, sem mobile/tablet, estão explícitos e coerentes com as restrições do produto? [Completeness, Spec §NFR-001, §Assumptions]
- [x] CHK021 Os requisitos de acessibilidade cobrem semântica, foco, teclado, nomes, estados e unidades? [Completeness, Spec §FR-011–FR-012, §NFR-002]
- [x] CHK022 Os requisitos visuais apontam para tokens e padrões canônicos sem criar uma linguagem local? [Completeness, Spec §NFR-005]

## Dependencies and Assumptions

- [x] CHK023 As suposições sobre leitura somente, dados canônicos de dias, refeições ausentes e média ponderada estão documentadas? [Assumption, Spec §Assumptions]
- [x] CHK024 Os limites de escopo excluem persistência nova, edição inline, alteração do construtor e sincronização externa? [Scope, Spec §Assumptions]

## Ambiguities and Conflicts

- [x] CHK025 Não restam escolhas abertas entre visão por dia, matriz de sete colunas e linhas por variação; a decisão de uma coluna compacta está registrada? [Ambiguity, Spec §Clarifications, §FR-004]
- [x] CHK026 Não há conflito entre “cabeçalho visualmente discreto” e a exigência de contexto acessível para os valores? [Conflict, Spec §FR-012, §NFR-002]

## Notes

- A resolução de caminhos padrão do checklist reportou que `plan.md` ainda não existe; isso é esperado porque o fluxo SDD exige checklist antes de plan.
- Todos os itens passaram na revisão textual do spec.md; nenhum item depende de implementação para ser considerado completo.
