# Checklist de Requisitos: Refatoração da documentação do design-system

**Purpose**: Validar a qualidade e completude dos requisitos antes do planejamento.
**Created**: 2026-08-02
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [ ] CHK001 - O escopo de conversão cobre todas as áreas acionáveis listadas (tokens, cores, tipografia, geometria, ícones/motion, estados, decisão de componentes, limites arquiteturais)? [Completeness, Spec §FR-001]
- [ ] CHK002 - Está especificado o destino dos dados executáveis de `design-system/components/`? [Completeness, Spec §FR-004]
- [ ] CHK003 - Está especificado o destino dos documentos de intenção/processo/roadmap? [Completeness, Spec §FR-002]
- [ ] CHK004 - O roteamento de `AGENTS.md` está coberto como requisito? [Completeness, Spec §FR-008]

## Requirement Clarity

- [ ] CHK005 - A relação entre `design-system/` (canônico) e `.agents/rules/` (extração operacional) está explícita e sem ambiguidade? [Clarity, Spec §FR-001, §Clarifications]
- [ ] CHK006 - O critério de "no máximo dois passos" para encontrar valores oficiais é mensurável? [Clarity, Spec §SC-005]
- [ ] CHK007 - O destino do plano (`docs/plan/`) está nomeado de forma inequívoca? [Clarity, Spec §Assumptions]

## Requirement Consistency

- [ ] CHK008 - FR-001 (extração) e a manutenção da canonicidade em `design-system/` não se contradizem? [Consistency, Spec §FR-001, §FR-003]
- [ ] CHK009 - A preservação do snapshot LEG (FR-006) é coerente com a simplificação dos documentos 01–15? [Consistency, Spec §FR-006, §Edge Cases]
- [ ] CHK010 - SC-006 (entrega via PR/CI) é coerente com as demais sucess criteria? [Consistency, Spec §SC-006]

## Acceptance Criteria Quality

- [ ] CHK011 - As sucess criteria são mensuráveis e objetivamente verificáveis? [Acceptance Criteria, Spec §SC-001..§SC-006]
- [ ] CHK012 - Cada requisito funcional possui critério de aceite verificável? [Acceptance Criteria, Spec §FR-001..§FR-008]

## Scenario Coverage

- [ ] CHK013 - Os fluxos de navegação do mantenedor (P1) e do agente (P2) estão cobertos nos user stories? [Coverage, Spec §User Story 1-2]
- [ ] CHK014 - A preservação dos dados executáveis (P3) está coberta como jornada independente? [Coverage, Spec §User Story 3]

## Edge Case Coverage

- [ ] CHK015 - Os riscos de links quebrados, snapshot LEG, `feature.json` e scripts de verificação estão cobertos? [Edge Case, Spec §Edge Cases]
- [ ] CHK016 - A constituição (`constitution.md`) está protegida contra perda de canonicidade? [Edge Case, Spec §Edge Cases]

## Non-Functional Requirements

- [ ] CHK017 - A verificação contínua (verify:design-system, verify:design-system-legacy, verify:links, test, lint, type-check) está especificada? [Non-Functional, Spec §FR-007]

## Dependencies & Assumptions

- [ ] CHK018 - As premissas de preservação de `components/`, destino `docs/plan/` e entrega via PR/CI estão documentadas? [Assumption, Spec §Assumptions]

## Ambiguities & Conflicts

- [ ] CHK019 - Não restam termos ambíguos como "simplificar" ou "o que for possível" sem referência a critério concreto? [Ambiguity, Spec §FR-002, §FR-003]
- [ ] CHK020 - A decisão de canonicidade (Q1) está registrada em Clarifications e refletida nos requisitos? [Traceability, Spec §Clarifications, §FR-001]
