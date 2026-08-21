# Category Requirements Checklist: Regras Visuais por Categoria de Componentes

**Purpose**: Validar se os requisitos definem de modo completo, claro, consistente e mensurável a arquitetura normativa por categorias visuais
**Created**: 2026-07-31
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [x] CHK001 A arquitetura em fundamentos, categorias e fichas individuais está explicitamente definida? [Completeness, Spec §FR-001–FR-002]
- [x] CHK002 O conjunto mínimo de categorias visuais está enumerado sem impedir evolução governada? [Completeness, Spec §FR-003, §FR-027–FR-030]
- [x] CHK003 Os requisitos de categoria cobrem propósito, inclusão, exclusão, relações e exemplos? [Completeness, Spec §FR-004]
- [x] CHK004 Anatomia, geometria, tipografia, tokens, estados, interação, movimento, acessibilidade, variantes, composição e proibições estão exigidos para toda categoria aplicável? [Completeness, Spec §FR-005–FR-013]
- [x] CHK005 Os requisitos distinguem categoria principal de traits adicionais? [Completeness, Spec §FR-017–FR-018]
- [x] CHK006 O registro exige os dois eixos, lifecycle, fontes, símbolos, ficha e consumidores? [Completeness, Spec §FR-018]
- [x] CHK007 A baseline atual e as quatro propostas estão cobertas com estados documentais distintos? [Completeness, Spec §FR-019–FR-020]
- [x] CHK008 As fichas individuais e as exceções possuem conteúdo obrigatório definido? [Completeness, Spec §FR-021–FR-023]
- [x] CHK009 Compound components e componentes mal classificados possuem tratamento explícito? [Completeness, Spec §FR-024–FR-025]
- [x] CHK010 Componentes futuros e evolução de categorias possuem critérios de entrada e decisão? [Completeness, Spec §FR-026–FR-030]
- [x] CHK011 A auditoria cobre inventário, registro, fichas, estados, tokens, valores e decisões abertas? [Completeness, Spec §FR-031–FR-035]

## Requirement Clarity

- [x] CHK012 Está claro que Atomic Design determina responsabilidade e localização, enquanto categoria visual determina estilo e comportamento? [Clarity, Spec §FR-014–FR-016]
- [x] CHK013 A regra de exatamente uma categoria principal por componente é inequívoca? [Clarity, Spec §FR-017]
- [x] CHK014 O uso de traits está limitado de forma a não criar uma segunda fonte principal? [Clarity, Spec §FR-017, Assumptions]
- [x] CHK015 A proibição de duplicação entre categorias e fichas é testável? [Clarity, Spec §FR-022, §SC-003]
- [x] CHK016 Os dados obrigatórios de uma exceção estão definidos sem termos subjetivos? [Clarity, Spec §FR-023]
- [x] CHK017 A diferença entre existência, conformidade documental, conformidade visual e migração está explícita? [Clarity, Spec §FR-036]
- [x] CHK018 O significado de cobertura por arquivo e por símbolo público está documentado? [Clarity, Spec §SC-001, Assumptions]

## Requirement Consistency

- [x] CHK019 A herança das categorias é consistente com a fonte única dos fundamentos globais? [Consistency, Spec §FR-002, §FR-006–FR-008]
- [x] CHK020 As regras de fichas enxutas são consistentes com a exigência de critérios individuais de aceite? [Consistency, Spec §FR-021–FR-023]
- [x] CHK021 O tratamento de primitives genéricos permanece compatível com categorias de wrappers e componentes de domínio? [Consistency, Spec §FR-040, Edge Cases]
- [x] CHK022 A baseline de 39 fontes é consistente com a regra de descoberta de futuras adições e remoções? [Consistency, Spec §FR-019, Edge Cases]
- [x] CHK023 O status `proposed` das quatro fundações é consistente em requisitos e critérios de sucesso? [Consistency, Spec §FR-020, §SC-004]
- [x] CHK024 Conflitos entre fontes normativas possuem regra explícita de sincronização e bloqueio? [Consistency, Spec §FR-038, Edge Cases]

## Acceptance Criteria Quality

- [x] CHK025 A cobertura dos componentes atuais é mensurada em 100% e vinculada a campos observáveis? [Measurability, Spec §SC-001]
- [x] CHK026 A completude de categorias e fichas é mensurada sem depender de julgamento estético subjetivo? [Measurability, Spec §SC-002–SC-003]
- [x] CHK027 A reprodutibilidade por revisores independentes possui amostra e resultado esperado definidos? [Measurability, Spec §SC-005]
- [x] CHK028 A capacidade da auditoria é mensurada contra classes nominais de falha? [Measurability, Spec §SC-006–SC-007]
- [x] CHK029 A consistência das fontes normativas e o isolamento de `src/` possuem resultados binários verificáveis? [Measurability, Spec §SC-008–SC-009]
- [x] CHK030 A capacidade de classificar um componente futuro é demonstrável sem decisão visual local? [Measurability, Spec §SC-010]

## Scenario and Edge Case Coverage

- [x] CHK031 Os fluxos primários de consulta, classificação, especialização, auditoria e evolução estão cobertos por jornadas independentes? [Coverage, User Stories 1–5]
- [x] CHK032 Componentes com múltiplas partes, múltiplos traits e ausência legítima de estados possuem regras de borda? [Coverage, Edge Cases]
- [x] CHK033 Componentes propostos, fontes em camada incorreta e artefatos históricos possuem tratamento sem falsificar o estado atual? [Coverage, Edge Cases, Spec §FR-020, §FR-024, §FR-038]
- [x] CHK034 A necessidade visual isolada de tela está impedida de criar categoria ou variante automaticamente? [Coverage, Edge Cases]
- [x] CHK035 A depreciação impede novos consumidores e exige substituto? [Recovery, Spec §FR-030]

## Non-Functional Requirements and Boundaries

- [x] CHK036 Plataforma desktop, acessibilidade, foco, teclado e dimensões vigentes estão definidos sem reintroduzir requisitos mobile? [Coverage, Spec §FR-039, §FR-041]
- [x] CHK037 O escopo documental exclui expressamente migração de código, telas e mudança da direção estética? [Boundary, Scope Boundaries]
- [x] CHK038 A ausência de requisitos de autenticação, privacidade, escala multiusuário e disponibilidade está coerente com um catálogo documental local sem dados de usuário? [Scope, Key Entities, Excluded]
- [x] CHK039 Dependências e pressupostos distinguem fonte normativa, inventário somente leitura e documentos históricos? [Dependency, Assumptions]
- [x] CHK040 A sincronização da constituição histórica conflitante está coberta como dependência normativa, sem alterar os fundamentos aprovados neste escopo? [Conflict, Spec §FR-038, Dependencies]

## Notes

- Profundidade: formal gate para revisão antes do planejamento e da execução.
- Audiência: mantenedor e revisor de design system em validação de SDD/PR.
- Os 40 itens passaram contra a versão atual de `spec.md`; nenhuma falha de requisito permanece aberta.
- Desempenho operacional, segurança de aplicação e disponibilidade foram conscientemente excluídos porque o escopo produz documentação local e validadores sem dados sensíveis ou serviço em execução.

