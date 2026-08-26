# UX Requirements Checklist: Refeições reutilizáveis no modal de seleção de alimentos

**Purpose**: Validar se os requisitos do fluxo de seleção, reutilização e configuração de refeições estão completos, claros e simples para o nutricionista.
**Created**: 2026-08-26
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [ ] CHK001 - A especificação define separadamente o fluxo de alimentos, refeições prontas e receitas no modal? [Completeness, Spec §FR-001–FR-003]
- [ ] CHK002 - A especificação cobre a composição completa, as gramaturas, os totais e as opções que precisam acompanhar uma refeição pronta? [Completeness, Spec §FR-004–FR-005, FR-009]
- [ ] CHK003 - O fluxo de salvamento define os dados mínimos para os dois tipos reutilizáveis, refeição pronta e receita? [Completeness, Spec §FR-007–FR-010]
- [ ] CHK004 - O fluxo de opções define seleção do macro, cálculo proporcional, edição posterior e persistência do contexto? [Completeness, Spec §FR-011–FR-016]

## Requirement Clarity

- [ ] CHK005 - O termo “refeição pronta” está distinguido de “receita” e de “opção de refeição” em todos os pontos relevantes? [Clarity, Spec §Key Entities, Assumptions]
- [ ] CHK006 - A regra de aplicação na refeição ativa deixa claro que a composição é acrescentada e não substitui itens existentes? [Clarity, Spec §Acceptance Scenarios 1.4, FR-006]
- [ ] CHK007 - O requisito de equivalência identifica claramente que a gramatura sugerida pode ser alterada pelo nutricionista depois do cálculo? [Clarity, Spec §FR-013–FR-015]
- [ ] CHK008 - Os requisitos deixam explícito que todos os campos de quantidade usam somente gramas e não deixam espaço para medidas caseiras? [Clarity, Spec §FR-018, SC-006]

## Requirement Consistency

- [ ] CHK009 - A prioridade de opções completas como alternativa principal é consistente com a permanência da substituição individual como ação rápida? [Consistency, Spec §User Story 3.5, FR-017, Assumptions]
- [ ] CHK010 - A regra de cancelamento sem autosave é consistente com os fluxos de seleção, salvamento e edição de opção? [Consistency, Spec §Edge Cases, FR-019–FR-020]
- [ ] CHK011 - As regras de aplicação de refeições prontas e receitas são compatíveis com os modelos conceituais definidos nas entidades? [Consistency, Spec §FR-005, FR-010, Key Entities]

## Acceptance Criteria Quality

- [ ] CHK012 - Os critérios de sucesso medem a redução de trabalho e confirmações no fluxo principal, em vez de apenas descrever a existência das telas? [Measurability, Spec §SC-001, SC-003]
- [ ] CHK013 - A preservação de dados da refeição pronta está expressa como resultado verificável e completo? [Acceptance Criteria, Spec §SC-002]
- [ ] CHK014 - A intenção de rapidez e simplicidade possui um limite mensurável de tempo ou de interações no plano de validação? [Gap, Acceptance Criteria, Spec §SC-001–SC-004]

## Scenario and Edge Case Coverage

- [ ] CHK015 - Os requisitos cobrem estados vazios e ausência de correspondência sem degradar o fluxo de alimentos? [Coverage, Spec §Edge Cases, SC-005]
- [ ] CHK016 - Os requisitos definem o comportamento para alimentos indisponíveis, quantidades inválidas e referência igual a zero? [Coverage, Spec §Edge Cases, FR-008, FR-013]
- [ ] CHK017 - Os requisitos explicitam o que acontece quando o modal ou editor é cancelado no meio de uma alteração? [Recovery, Spec §Edge Cases, FR-019]

## Non-Functional and Boundary Requirements

- [ ] CHK018 - A especificação define requisitos de teclado, foco e mensagens associadas a erro para todas as superfícies interativas? [Accessibility, Spec §FR-021]
- [ ] CHK019 - Os limites de escopo para autosave, exportação, escala visual e medidas caseiras estão repetidos de forma consistente nas histórias, requisitos e premissas? [Boundary, Spec §FR-020, SC-006, Assumptions]
- [ ] CHK020 - As dependências dos contratos atuais de TACO, refeições, receitas e substituição individual estão identificadas sem pressupor uma integração externa não descrita? [Dependency, Spec §Contexto da revisão, Assumptions]

## Ambiguities and Decisions

- [ ] CHK021 - A especificação registra a decisão de aplicar a refeição pronta no card atual, sem criar um novo card a partir do modal? [Decision, Spec §Assumptions]
- [ ] CHK022 - A especificação deixa claro quais dados próprios de preparo pertencem à receita e quais dados são necessários para a aplicação na dieta? [Gap, Spec §User Story 2, Key Entities]
