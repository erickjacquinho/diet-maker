# Feature Specification: Refatoração da documentação do design-system

**Feature Branch**: `02-08-26-refatorar-design-system-rules-plano`

**Created**: 2026-08-02

**Status**: Draft

**Input**: User description: "Refatorar a pasta design-system: converter o que for possível em regras operacionais em `.agents/rules/` (tokens, cores, tipografia, geometria, ícones/motion/camadas, estados/acessibilidade, decisão de componentes) e simplificar o restante em um plano consolidado em `docs/plan/` (fundamentals, tokens-reference, governance, migration-plan), reescrevendo o README como índice e mantendo os dados executáveis de `design-system/components/` intactos."

## Clarifications

### Session 2026-08-02

- Q: Após converter as normas em regras em `.agents/rules/`, quem é a fonte canônica? → A: `design-system/` permanece a fonte canônica; `.agents/rules/` é a extração operacional que agentes usam ao editar código, com ponteiros no README. `constitution.md` permanece como está.
- Q: Como a mudança deve ser entregue? → A: Via commit + pull request, com CI/CD executando; se a CI passar, merge na main.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fonte canônica única, navegável e simplificada (Priority: P1)

Um mantenedor precisa localizar a regra ou o valor visual oficial do NutriDiet (cor, tipografia, spacing, radius, motion, estado, contrato de componente) sem percorrer 15 documentos normativos.

**Why this priority**: A descoberta da fonte canônica é o requisito base; todos os demais fluxos de manutenção dependem dela.

**Independent Test**: Pode ser testado navegando pelo novo `design-system/README.md`: ele indexa cada artefato (regras em `.agents/rules/`, referência de tokens, fundamentos, governança, plano de migração) em um nível de profundidade, sem tabelas normativas duplicadas.

**Acceptance Scenarios**:

1. **Given** um mantenedor que precisa saber o raio oficial de um botão, **When** ele abre o novo README, **Then** ele encontra em no máximo um passo a referência de tokens que contém a tabela de radius, sem duplicação com outra fonte.
2. **Given** um mantenedor editando código, **When** ele consulta `.agents/rules/`, **Then** ele encontra a proibição correspondente (ex.: `rounded-xl`) declarada como regra operacional, sem precisar ler a documentação normativa completa.

---

### User Story 2 - Regras operacionais acionáveis para agentes (Priority: P2)

Um agente (humano ou IA) editando código precisa ser orientado por restrições curtas e verificáveis em `.agents/rules/`, no estilo dos arquivos existentes (`atomic-design.md`, `shadcn-preservation.md`), sem reescrever conteúdo normativo.

**Why this priority**: A conversão de normas em regras é o objetivo central do pedido; sem ela, o refactor é apenas uma reorganização de pastas.

**Independent Test**: Cada regra nova lista proibições e decisões checáveis (ex.: valores proibidos, sequência usar→configurar→variar→compor→criar) e é referenciada pelo `AGENTS.md`.

**Acceptance Scenarios**:

1. **Given** a pasta `.agents/rules/`, **When** o mantenedor lista seu conteúdo, **Then** existem arquivos cobrindo ao menos tokens, cores, tipografia, geometria/layout, ícones/motion/camadas, estados/acessibilidade e decisão de componentes.
2. **Given** um arquivo de regra, **When** ele é lido, **Then** cada regra contém restrições (proibições) e decisões objetivas, no padrão MUST/NÃO do projeto.

---

### User Story 3 - Dados executáveis preservados e verificação intacta (Priority: P2)

O mantenedor precisa que `design-system/components/` (registry, categorias, perfis, contratos) permaneça fonte executável íntegra e que os scripts de verificação continuem passando após a refatoração.

**Why this priority**: Os dados executáveis e os verifiers são o mecanismo que torna a documentação verificável; quebrá-los anularia o valor do sistema.

**Independent Test**: Os comandos de verificação existentes seguem sem erro após a refatoração.

**Acceptance Scenarios**:

1. **Given** a refatoração concluída, **When** `npm run verify:design-system` e `npm run verify:design-system-legacy` são executados, **Then** ambos terminam sem falhas.
2. **Given** o conteúdo movido entre pastas, **When** `npm run verify:links` é executado, **Then** nenhum link documental fica quebrado.

---

### Edge Cases

- Links relativos entre documentos quebram ao mover conteúdo de uma pasta para outra.
- `feature.json` do Spec Kit aponta para outra feature; deve ser alinhado ao diretório atual.
- O snapshot de auditoria LEG (baseline histórico de ocorrências) não pode ser perdido no movimento de `13-implementation-and-compliance.md`.
- A constituição (`constitution.md`) referencia o design system canônico; a refatoração não pode degradá-lo a uma fonte não canônica.
- Código de script de verificação que dependa de caminhos documentais pode quebrar com a reorganização.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema documental DEVE converter conteúdo normativo acionável (tokens, cores, tipografia, geometria/layout, ícones/motion/camadas, estados/acessibilidade, decisão de componentes, limites arquiteturais) em arquivos de regra em `.agents/rules/`, no estilo dos arquivos existentes. As regras são **extração operacional** — `design-system/` permanece a fonte canônica.
- **FR-002**: O sistema documental DEVE simplificar o conteúdo de intenção/processo/roadmap em uma quantidade reduzida de documentos em `docs/plan/`, sem perder informação normativa ou dados de valor.
- **FR-003**: O novo `design-system/README.md` DEVE atuar como índice canônico que roteia para as regras, a referência de tokens, os fundamentos, a governança e o plano de migração.
- **FR-004**: `design-system/components/` (registry.json, categorias, perfis, contratos) DEVE permanecer intacto e ser preservado como fonte executável.
- **FR-005**: Os documentos 12 e 15, quando forem apenas índices humanos redundantes, PODEM ser absorvidos no novo README sem perda de informação.
- **FR-006**: A atualização DEVE ser rastreável: o plano de migração deve preservar o snapshot de auditoria LEG existente.
- **FR-007**: As verificações `npm run verify:design-system`, `verify:design-system-legacy`, `verify:links`, `test`, `lint` e `type-check` DEVEM continuar funcionando após a refatoração.
- **FR-008**: O roteamento em `AGENTS.md` DEVE ser atualizado para apontar para a nova estrutura de regras e planos.

### Key Entities *(include if feature involves data)*

- **Regra operacional (`.agents/rules/`)**: restrição obrigatória e checável aplicada ao editar código; consumida por agentes e roteada por `AGENTS.md`.
- **Referência de tokens**: conjunto de tabelas de valores oficiais (cores, tipografia, spacing, radius, ícones, motion, z-index, opacidade) consumido pela implementação.
- **Registry de componentes**: dados executáveis (registry.json, categorias, perfis, contratos) verificados por script; fonte executável que não deve ser renomeada.
- **Plano de migração**: roadmap ordenado que preserva o baseline de auditoria e define Definition of Done.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A raiz de `design-system/` reduz de 17 para 1 documento (README), com o conteúdo normativo consolidado em `docs/plan/` (4 documentos) e as restrições em `.agents/rules/`, sem perda de conteúdo.
- **SC-002**: `.agents/rules/` passa de 2 para 9-10 arquivos, cobrindo todas as áreas de restrição listadas no pedido.
- **SC-003**: 100% dos links documentais internos válidos após a refatoração (verificado por `npm run verify:links`).
- **SC-004**: Zero falhas em `npm run verify:design-system` e `npm run verify:design-system-legacy` após a conclusão.
- **SC-005**: Um mantenedor consegue encontrar qualquer valor visual oficial (ex.: radius de controle, cor primária) em no máximo dois passos a partir do README.
- **SC-006**: A mudança é entregue por commit + pull request, com CI/CD verde; o merge na main ocorre apenas se a CI passar.

## Assumptions

- A pasta `design-system/components/` é fonte executável e não será reorganizada nesta refatoração.
- O diretório de destino do plano é `docs/plan/` (criado se não existir).
- A fonte canônica permanece em `design-system/`; `.agents/rules/` contém restrições operacionais, coerente com o papel já declarado em `AGENTS.md`.
- O conteúdo normativo é preservado na conversão; a refatoração muda local e forma, não cria nem remove regras de design.
- Documentos em `refs/` e históricos continuam fora de escopo (fontes não concorrentes).
- O snapshot LEG e o estado verificado (seção 18 de `13-implementation-and-compliance.md`) devem ser preservados no plano de migração.
- A entrega será feita via commit + pull request; a CI deve executar as verificações do repositório e, passando, o merge ocorre na main.
