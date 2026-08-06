# UX Requirements Quality Checklist: Reorganização do cabeçalho da criação de dieta

**Purpose**: Validar se os requisitos descrevem uma hierarquia de interface clara, contextual e acessível para a tela de criação de dieta.  
**Created**: 2026-08-05  
**Feature**: [spec.md](../spec.md)  
**Focus**: posição dos controles, prioridade das ações, modo da dieta, contexto do paciente, refeições e acessibilidade.  
**Depth**: Standard — revisão de requisitos antes do planejamento.  
**Audience**: Reviewer de produto, design e implementação.

**Note**: Este checklist valida a qualidade dos requisitos; não é um roteiro de teste da implementação.

## Requirement Completeness

- [x] CHK001 — A ordem entre navegação/título, modo da dieta, contexto/metas e refeições está explicitamente definida? [Completeness, Spec §FR-001, FR-012]
- [x] CHK002 — A especificação separa a ação primária das ações contextuais e secundárias? [Completeness, Spec §FR-003–FR-006]
- [x] CHK003 — Os estados simples, ciclo de carboidratos e refeições vazias possuem requisitos próprios? [Coverage, Spec §FR-007–FR-008, FR-015]
- [x] CHK004 — A preservação dos comportamentos atuais está delimitada sem ampliar o escopo para dados ou regras nutricionais? [Scope, Spec §FR-010, Assumptions]

## Requirement Clarity

- [x] CHK005 — A expressão “única ação primária” está associada a um rótulo e a uma posição verificáveis? [Clarity, Spec §FR-003, SC-003]
- [x] CHK006 — As localizações de Nova Refeição, Escalar, Ajustar Metas, WhatsApp e PDF estão descritas sem interpretações concorrentes? [Clarity, Spec §FR-004–FR-006]
- [x] CHK007 — “Progressivamente” está contextualizado pelos controles que aparecem quando o ciclo de carboidratos é selecionado? [Clarity, Spec §FR-008, User Story 3]
- [x] CHK008 — A relação entre o contexto do paciente e a ausência de repetição em cabeçalhos concorrentes está explícita? [Clarity, Spec §FR-009]

## Requirement Consistency

- [x] CHK009 — A exigência de manter apenas uma CTA primária é consistente com a ação única do estado vazio de refeições? [Consistency, Spec §FR-003, FR-015, Edge Cases]
- [x] CHK010 — A distribuição de ações por região é consistente com a ordem de leitura prescrita? [Consistency, Spec §FR-005, FR-012]
- [x] CHK011 — A preservação dos comportamentos existentes é compatível com o reposicionamento visual dos controles? [Consistency, Spec §FR-010, SC-004]
- [x] CHK012 — O escopo desktop a partir de 1024px é consistente entre requisitos, casos-limite e premissas? [Consistency, Spec §FR-014, Edge Cases, Assumptions]

## Acceptance Criteria Quality

- [x] CHK013 — Os critérios de sucesso medem descoberta do cabeçalho, ordem do modo e continuidade das ações? [Measurability, Spec §SC-001–SC-004]
- [x] CHK014 — A cobertura de sobreposição, ocultação e nomeação de controles é objetivamente avaliável? [Measurability, Spec §SC-005]
- [x] CHK015 — A exigência de operação por teclado possui uma meta mensurável e inclui foco visível? [Measurability, Spec §SC-006, FR-011]
- [x] CHK016 — A consistência visual com a tela de paciente está definida como resultado comparável, e não apenas como preferência subjetiva? [Acceptance Criteria, Spec §SC-007]

## Scenario Coverage

- [x] CHK017 — A jornada principal de orientação, retorno e salvamento está coberta por cenários independentes? [Scenario Coverage, Spec §User Story 1–2]
- [x] CHK018 — A jornada alternativa de ciclo de carboidratos cobre a revelação dos controles condicionais? [Scenario Coverage, Spec §User Story 3]
- [x] CHK019 — A jornada de ações contextuais cobre tanto refeições quanto compartilhamento/exportação? [Scenario Coverage, Spec §User Story 4]

## Edge Case Coverage

- [x] CHK020 — A especificação aborda largura mínima desktop, textos longos, ausência de ações opcionais e dieta sem refeições? [Edge Case Coverage, Spec §Edge Cases]
- [x] CHK021 — O comportamento de fechamento e retorno de foco do agrupamento de ações secundárias está documentado? [Edge Case Coverage, Spec §Edge Cases, User Story 4]
- [x] CHK022 — A falha de salvamento está coberta sem introduzir uma nova estratégia de persistência? [Recovery, Spec §Edge Cases, FR-010]

## Non-Functional Requirements

- [x] CHK023 — Acessibilidade, teclado, foco, nomes acessíveis e WCAG 2.2 AA estão definidos para toda a interface interativa? [Non-Functional, Spec §FR-011, SC-006]
- [x] CHK024 — O requisito de reutilização do design system e da estrutura da tela de paciente está explícito sem criar dependência de um novo padrão? [Non-Functional, Spec §FR-013, SC-007]
- [x] CHK025 — O limite desktop e a exclusão de variantes mobile/tablet estão registrados como requisito e premissa? [Non-Functional, Spec §FR-014, Assumptions]

## Dependencies & Assumptions

- [x] CHK026 — A dependência dos comportamentos atuais de salvamento, metas, escala, compartilhamento, exportação e refeições está identificada? [Dependencies, Spec §FR-010, Assumptions]
- [x] CHK027 — Está explícito que não haverá nova fonte de dados, migração de persistência ou regra nutricional? [Assumption, Spec §Assumptions]
- [x] CHK028 — O papel do nutricionista e o contexto de uso desktop estão identificados? [Audience, Spec §User Stories, Assumptions]

## Ambiguities & Traceability

- [x] CHK029 — Pelo menos 80% dos itens deste checklist possuem referência a requisito, critério, cenário, edge case ou premissa? [Traceability, Spec §FR-001–FR-015, SC-001–SC-007]
- [x] CHK030 — Não há marcadores de clarificação, placeholders ou termos vagos sem contexto operacional? [Ambiguity, Spec §Requirements, Assumptions]
- [x] CHK031 — Os termos ação primária, ação contextual, ação secundária, modo da dieta, contexto do paciente e estado vazio são usados de forma consistente? [Terminology, Spec §User Stories, FR-003–FR-015]

## Review Notes

- A checagem de clarificação não encontrou perguntas críticas que mudassem o escopo ou a estratégia de validação.
- Os itens foram avaliados como aprovados porque cada requisito relevante possui cobertura em cenários, edge cases ou critérios de sucesso.
