# Checklist de qualidade dos requisitos: hierarquia e contexto do perfil

**Purpose**: Validar se os requisitos de UX descrevem uma hierarquia clara, contextual e acessível para o perfil do paciente.

**Created**: 2026-08-04

**Feature**: [spec.md](../spec.md)

**Focus**: hierarquia de informação, estados temporais, ausência de dieta, acessibilidade e preservação do histórico.

**Depth**: Standard — revisão de requisitos antes do planejamento.

**Audience**: Reviewer de produto e design.

## Requirement Completeness

- [x] CHK001 — A ordem de prioridade entre dados pessoais, indicadores, acompanhamento, plano vigente e histórico está explicitamente definida? [Completeness, Spec §FR-001]
- [x] CHK002 — A especificação cobre tanto o cenário com dieta vigente quanto o cenário sem dieta vigente? [Coverage, Spec §FR-004–FR-006]
- [x] CHK003 — A permanência dos detalhes de macros no fluxo da dieta e no histórico está registrada como limite de escopo? [Completeness, Spec §FR-005, Assumptions]
- [x] CHK004 — Os requisitos definem o que acontece quando avaliações, nomes, totais ou datas estão ausentes? [Edge Case Coverage, Spec §Edge Cases]

## Requirement Clarity

- [x] CHK005 — O termo “plano vigente” está diferenciado de “meta manual” e “registro histórico”? [Clarity, Spec §FR-012]
- [x] CHK006 — “Resumo compacto” possui conteúdo mínimo e limite de densidade observável? [Measurability, Spec §FR-004–FR-005, SC-003]
- [x] CHK007 — A origem temporal e o status exigidos para um plano estão explicitamente nomeados? [Clarity, Spec §FR-004]
- [x] CHK008 — A expressão “visualização discreta” do acompanhamento está ancorada na prioridade de informação, sem exigir uma medida visual inventada? [Clarity, Spec §FR-009, SC-001]

## Requirement Consistency

- [x] CHK009 — A remoção do quadro de metas manuais é consistente com a manutenção de metas manuais para edição ou uso interno? [Consistency, Spec §FR-003, Assumptions]
- [x] CHK010 — A regra da medição corporal mais recente não conflita com a preservação dos valores históricos? [Consistency, Spec §FR-007–FR-008, Edge Cases]
- [x] CHK011 — A regra de não inventar macros no estado vazio é consistente com a apresentação resumida de macros quando existe uma dieta vigente? [Consistency, Spec §FR-005–FR-006, SC-004]

## Acceptance Criteria Quality

- [x] CHK012 — Os critérios de sucesso medem tempo de localização, densidade do resumo, origem dos dados e acessibilidade? [Measurability, Spec §SC-001–SC-007]
- [x] CHK013 — Cada jornada possui um teste independente que entrega valor sem depender da implementação de outras jornadas? [Acceptance Criteria, Spec §User Scenarios]

## Scenario and Edge Case Coverage

- [x] CHK014 — Os requisitos contemplam ausência de avaliação, ausência de dieta, múltiplas versões e dados atualizados em momentos diferentes? [Scenario Coverage, Spec §Edge Cases]
- [x] CHK015 — O requisito para nome ou objetivo longo preserva a identidade e as ações principais sem impor uma solução visual específica? [Edge Case Coverage, Spec §Edge Cases]

## Non-Functional Requirements

- [x] CHK016 — Acessibilidade, teclado, foco visível, desktop e consistência com o design system estão definidos como restrições verificáveis? [Non-Functional, Spec §FR-010–FR-011, SC-006–SC-007]
- [x] CHK017 — As premissas deixam explícito que não há nova integração, migração ou fonte de persistência nesta primeira versão? [Dependencies & Assumptions, Spec §Assumptions]

## Ambiguities and Traceability

- [x] CHK018 — Pelo menos 80% dos itens possuem referência a requisito, critério, seção ou marcador de qualidade rastreável? [Traceability, Spec §FR-001–FR-012, SC-001–SC-007]
- [x] CHK019 — Não há termos vagos como “intuitivo”, “robusto” ou “atual” sem definição contextual ou temporal? [Ambiguity, Spec §FR-008, FR-012]
- [x] CHK020 — A especificação identifica explicitamente o que continua fora do escopo para impedir que o SDD seja interpretado como refatoração do fluxo completo de dieta? [Scope Boundary, Spec §Assumptions]

## Review Notes

- Nenhuma pergunta interativa foi necessária: o contexto fornecido já define a prioridade, os estados e a separação entre perfil e dieta.
- O checklist valida a qualidade dos requisitos; não é um roteiro de teste da implementação.
