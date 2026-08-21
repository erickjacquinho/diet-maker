# Architecture Requirements Checklist: Unificação de Superfícies e Composição Atomic

**Purpose**: Validar se os requisitos arquiteturais, de composição e de migração estão completos, claros e rastreáveis antes do plano.
**Created**: 2026-08-05
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [x] CHK001 - A especificação define o contrato visual compartilhado para superfície, densidade, borda, raio, padding, elevação e estados aplicáveis? [Completeness, Spec §FR-001]
- [x] CHK002 - Todos os consumidores explicitamente citados possuem uma decisão de composição, migração ou exceção? [Completeness, Spec §FR-007, §SC-001]
- [x] CHK003 - A especificação cobre a atualização do catálogo de componentes e das fichas individuais? [Completeness, Spec §FR-011]
- [x] CHK004 - Os requisitos definem cobertura de testes para base, consumidores, camadas e regressões? [Completeness, Spec §FR-012]

## Requirement Clarity

- [x] CHK005 - A diferença entre o primitivo UI `Card`, o wrapper `Surface` e os componentes especializados está inequívoca? [Clarity, Spec §FR-004, §FR-013]
- [x] CHK006 - O significado de “div hardcoded” está limitado a superfícies visuais reutilizáveis e não impede divs legítimas de layout? [Clarity, Spec §FR-008, §Edge Cases]
- [x] CHK007 - As variantes de `Surface` estão descritas por nomes e responsabilidades, sem depender de combinações implícitas de booleanos? [Clarity, Spec §FR-003]
- [x] CHK008 - O escopo de “componentes relacionados” está delimitado pelos consumidores nomeados e pelo inventário do runtime? [Clarity, Spec §Assumptions, §FR-007]

## Requirement Consistency

- [x] CHK009 - A preservação do `Card` genérico é consistente com a criação de um wrapper de produto sobre ele? [Consistency, Spec §Decisão arquitetural inicial, §FR-004]
- [x] CHK010 - A exigência de uma única base visual é consistente com a manutenção de `Card` como primitivo Shadcn? [Consistency, Spec §FR-001, §FR-004, §FR-013]
- [x] CHK011 - As regras de Atomic Design impedem dependências ascendentes sem contradizer a composição dos consumidores? [Consistency, Spec §User Story 3, §FR-002, §FR-007]
- [x] CHK012 - A preservação visual está limitada a mudanças intencionais e não contradiz a eliminação de estilos duplicados? [Consistency, Spec §User Story 4, §FR-010, §SC-006]

## Acceptance Criteria Quality

- [x] CHK013 - É possível medir a cobertura documental dos componentes do escopo sem depender de julgamento visual subjetivo? [Measurability, Spec §SC-001]
- [x] CHK014 - É possível identificar objetivamente uma superfície migrada, uma exceção registrada e uma repetição não classificada? [Measurability, Spec §SC-002, §FR-008]
- [x] CHK015 - Os critérios de sucesso distinguem ausência de dependências ascendentes, acoplamento de domínio e lacunas documentais? [Measurability, Spec §SC-003]
- [x] CHK016 - O critério de regressão visual define quais propriedades devem permanecer equivalentes? [Clarity, Spec §SC-006]

## Scenario and Edge Case Coverage

- [x] CHK017 - Os requisitos cobrem superfícies inline sem borda, raio ou elevação duplicados? [Edge Case, Spec §Edge Cases]
- [x] CHK018 - Os requisitos cobrem variantes tinted sem acoplar `Surface` ao domínio nutricional? [Edge Case, Spec §FR-002, §Edge Cases]
- [x] CHK019 - Os requisitos cobrem conteúdo opcional e estados vazios sem gerar estrutura vazia ou copy de domínio na base? [Coverage, Spec §Edge Cases, §FR-010]
- [x] CHK020 - Os requisitos cobrem superfícies interativas e preservação do foco/semântica de controles internos? [Coverage, Spec §User Story 4, §Edge Cases]

## Dependencies and Assumptions

- [x] CHK021 - A dependência do design system canônico, das regras Atomic e da preservação Shadcn está explicitamente reconhecida? [Dependency, Spec §Assumptions]
- [x] CHK022 - A especificação deixa claro que não haverá alteração de rotas, dados ou regras nutricionais? [Scope, Spec §Out of Scope]
- [x] CHK023 - A etapa de implementação está separada da validação humana e do fluxo obrigatório de execução de planos? [Dependency, Spec §Out of Scope]

## Traceability and Ambiguities

- [x] CHK024 - Cada decisão arquitetural principal possui requisitos funcionais e critérios de sucesso correspondentes? [Traceability, Spec §FR-001–FR-013, §SC-001–SC-006]
- [x] CHK025 - Não restam termos vagos como “componente relacionado”, “equivalente” ou “regressão visual” sem definição no plano? [Ambiguity, Spec §FR-007, §SC-006]

## Review result

Reviewed on 2026-08-05. All 25 architecture checks pass at the specification level; runtime conformance remains a `/speckit-implement` validation responsibility.

## Runtime implementation evidence

- [x] `npm run audit:atomic-design` — 100% conformidade, 74/74 arquivos conformes e 0 violações.
- [x] `npm run verify:design-system` — 40 arquivos fonte atuais cobertos, 0 exports visuais descobertos, 11 categorias homologadas, 4 componentes propostos especificados e 0 findings bloqueantes.
- [x] `npm run verify:design-system-legacy` — 0 findings legados em 94 arquivos.
- [x] A suíte focada de Surface/consumidores tem evidência aprovada de 9 arquivos e 18 testes; type-check, lint e `git diff --check` passam. Uma repetição posterior excedeu o timeout por inicialização dos workers, sem falha de asserção.
- [x] A suíte completa `npm test` tem execução terminal aprovada de 75 arquivos e 286 testes; as repetições posteriores excederam o timeout por instabilidade do pool de workers, sem falha de asserção.
