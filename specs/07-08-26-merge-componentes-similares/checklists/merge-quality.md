# Merge Quality Checklist: Merge Seletivo de Componentes Similares

**Purpose**: Validar se os requisitos de composição, separação de domínios e preservação de contratos estão completos, claros e rastreáveis antes da implementação.
**Created**: 2026-08-07
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [ ] CHK001 - Os seis grupos de candidatos estão explicitamente enumerados e possuem critério de decisão? [Completeness, Spec §FR-001]
- [ ] CHK002 - O requisito define quais componentes e fluxos estão fora do escopo do merge? [Completeness, Spec §FR-008–FR-009]
- [ ] CHK003 - A especificação cobre o catálogo, os perfis e os estados de depreciação/remoção afetados? [Completeness, Spec §FR-012]

## Requirement Clarity

- [ ] CHK004 - A diferença entre merge direto, unidade interna compartilhada, manutenção separada e remoção de alias está definida sem ambiguidade? [Clarity, Spec §FR-001]
- [ ] CHK005 - Os limites de responsabilidade de metas, refeições/ingredientes, pacientes e busca TACO estão claros para cada consumidor? [Clarity, Spec §FR-003–FR-006]
- [ ] CHK006 - O termo “comportamento comum” está associado a valores, validações, estados ou ações observáveis? [Clarity, Spec §FR-003–FR-007]

## Requirement Consistency

- [ ] CHK007 - Os requisitos de composição estão consistentes com a proibição de um modal universal baseado em boolean flags? [Consistency, Spec §FR-009]
- [ ] CHK008 - A preservação dos primitivos de `src/components/ui` está alinhada com as regras de camada e com a possibilidade de wrappers de domínio? [Consistency, Spec §FR-009–FR-010]
- [ ] CHK009 - As exclusões de `MetricBox`, `MacroMetricCard`, `RecipeCard`, `MealCardContainer`, `DataTable` e `SidebarNav` não contradizem os candidatos priorizados? [Consistency, Spec §FR-008]

## Acceptance Criteria Quality

- [ ] CHK010 - Os critérios de sucesso têm métricas verificáveis e não dependem de uma implementação específica? [Measurability, Spec §SC-001–SC-006]
- [ ] CHK011 - A definição de conclusão exige evidência por candidato, e não somente uma validação global? [Traceability, Spec §SC-001]
- [ ] CHK012 - O critério de reutilização evita abstrações criadas sem pelo menos dois consumidores reais ou sem justificativa documental? [Clarity, Spec §SC-005]

## Scenario and Edge-Case Coverage

- [ ] CHK013 - Os cenários primários, alternativos e de erro estão definidos para metas, linhas, pacientes e busca TACO? [Coverage, Spec §US2, Edge Cases]
- [ ] CHK014 - Os casos de valores vazios, inválidos, zero, sem resultados, erro, foco, teclado e descarte de alterações estão explicitamente cobertos? [Coverage, Spec §Edge Cases]
- [ ] CHK015 - A especificação define como preservar ou desfazer uma decisão individual caso a composição introduza regressão? [Recovery, Spec §FR-011, Assumptions]

## Non-Functional Requirements

- [ ] CHK016 - Acessibilidade, tokens canônicos, Atomic Design e escopo desktop estão definidos como requisitos de qualidade, não apenas como intenção? [Non-Functional, Spec §FR-010, SC-003, SC-006]
- [ ] CHK017 - A especificação define que a reorganização não pode alterar de forma observável valores, mensagens, ações ou estados dos fluxos críticos? [Regression, Spec §SC-002]

## Dependencies and Assumptions

- [ ] CHK018 - As dependências documentais e o uso posterior de `/speckit-implement` estão explícitos sem declarar a implementação como concluída? [Dependency, Spec §Assumptions]
- [ ] CHK019 - A hipótese sobre a remoção do alias deprecated de `Input` exige nova verificação de consumidores antes da remoção? [Assumption, Spec §Edge Cases, Assumptions]

## Notes

- Os itens validam a qualidade dos requisitos e a cobertura do escopo; não são testes de execução do código.
- Cada item possui referência à especificação para preservar rastreabilidade durante o planejamento e a implementação.
