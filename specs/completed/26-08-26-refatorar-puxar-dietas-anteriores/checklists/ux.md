# UX Requirements Checklist: Refatoração do botão Puxar Metas Anteriores com Modal de Seleção de Dietas

**Purpose**: Validar se os requisitos do fluxo de seleção e duplicação/importação de dietas anteriores estão completos, claros e aderentes às necessidades do nutricionista.
**Created**: 2026-08-26
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [x] CHK001 - A especificação define o comportamento do botão principal tanto para quando há dietas quanto para quando não há dietas cadastradas? [Completeness, Spec §FR-001, FR-002]
- [x] CHK002 - A especificação descreve detalhadamente todos os dados exibidos na tabela de seleção (data, nome, modo, calorias, macros, quantidade de refeições)? [Completeness, Spec §FR-004]
- [x] CHK003 - A especificação define duas ações separadas e explícitas: 'Puxar apenas os macros' e 'Puxar todas as refeições'? [Completeness, Spec §FR-006, FR-008, FR-009]
- [x] CHK004 - A regra de duplicação explicita o isolamento total da nova dieta em relação à dieta histórica original? [Completeness, Spec §FR-010, Assumptions]

## Requirement Clarity

- [x] CHK005 - A distinção entre 'Puxar apenas os macros' (atualiza metas) e 'Puxar todas as refeições' (duplica composição) está expressa sem ambiguidade? [Clarity, Spec §FR-008, FR-009]
- [x] CHK006 - O estado dos botões de ação na ausência de seleção na tabela está claramente definido como desabilitado? [Clarity, Spec §FR-007]
- [x] CHK007 - A ordenação padrão da listagem de dietas (mais recente para mais antiga) está formalizada? [Clarity, Spec §FR-005]

## Requirement Consistency

- [x] CHK008 - O fluxo de duplicação preserva o identificador dietaId: 'nova' para que o salvamento resulte em um novo registro no histórico do paciente? [Consistency, Spec §FR-010, User Story 2]
- [x] CHK009 - O fechamento/cancelamento do modal sem confirmação garante o descarte de alterações sem efeitos colaterais? [Consistency, Spec §FR-012, Edge Cases]

## Acceptance Criteria Quality

- [x] CHK010 - Os critérios de sucesso definem resultados mensuráveis de eficiência (número de cliques para seleção)? [Measurability, Spec §SC-001]
- [x] CHK011 - Os critérios de precisão matemática e integridade da transferência de dados estão formulados com metas verificáveis (100% de precisão)? [Measurability, Spec §SC-002, SC-003]
- [x] CHK012 - A inatividade do botão para pacientes sem histórico possui critério de verificação observável (100% dos acessos)? [Measurability, Spec §SC-004]

## Scenario and Edge Case Coverage

- [x] CHK013 - A especificação cobre o comportamento quando a dieta selecionada possui modo Ciclo de Carboidratos? [Coverage, Spec §Edge Cases, Clarifications]
- [x] CHK014 - A especificação cobre o cenário em que já existem refeições parciais na nova dieta antes de puxar todas as refeições? [Coverage, Spec §Acceptance Scenarios 2.3, Clarifications]
- [x] CHK015 - A especificação cobre dietas anteriores que possuam apenas metas definidas mas zero refeições? [Coverage, Spec §Edge Cases]

## Non-Functional and Boundary Requirements

- [x] CHK016 - A interface do modal atende às exigências de acessibilidade desktop WCAG 2.2 AA (foco visível, navegação por teclado, tecla Escape)? [Accessibility, Spec §FR-012, FR-013, SC-005]
- [x] CHK017 - O componente do modal respeita a hierarquia do Atomic Design e consome os tokens canônicos do Design System? [Design System, Spec §FR-013, Constitution]
