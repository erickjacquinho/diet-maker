# Feature Specification: Alinhamento da Arquitetura de Primitivos e Filhos

**Feature Branch**: `05-08-26-alinhamento-primitivos-componentes`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "Alinhar a arquitetura das pastas de componentes primitivos e seus filhos, sem alterar as rules existentes."

## User Scenarios & Testing

### User Story 1 - Entender e preservar o contrato dos primitivos (Priority: P1)

Como pessoa desenvolvedora do produto, quero que cada família primitiva e suas partes públicas tenham um contrato claro, para saber o que pertence à raiz, o que pertence aos filhos e como o componente deve ser consumido.

**Why this priority**: O contrato dos primitivos é a base para qualquer refatoração posterior. Sem ele, cada camada pode continuar criando variantes ou wrappers conflitantes.

**Independent Test**: A auditoria consegue listar todas as famílias primitivas, suas partes públicas, sua categoria visual, sua camada e seus consumidores sem depender de decisões implícitas em uma página.

**Acceptance Scenarios**:

1. **Given** as 16 famílias primitivas existentes, **When** o catálogo arquitetural é consultado, **Then** cada família possui uma entrada única com raiz, partes públicas e fonte de comportamento identificadas.
2. **Given** uma família compound como Dialog, Select, DropdownMenu, Card ou Table, **When** seu contrato é revisado, **Then** fica explícito quais partes fornecem contexto/comportamento e quais partes fornecem estrutura visual.
3. **Given** um primitivo cujo elemento raiz é visual, como Input, Button, Badge ou Separator, **When** seu contrato é revisado, **Then** a aparência padrão pertence ao próprio primitivo e não a uma página específica.

### User Story 2 - Consumir primitives e atoms sem duplicação (Priority: P1)

Como pessoa desenvolvedora, quero uma política consistente para escolher entre `src/components/ui` e `src/components/atoms`, para evitar wrappers transparentes e contratos duplicados.

**Why this priority**: Hoje Button, Badge e Input possuem caminhos de consumo sobrepostos, o que permite que a mesma responsabilidade visual seja alterada em mais de uma camada.

**Independent Test**: A auditoria de dependências identifica o caminho canônico de cada consumidor e não encontra wrappers sem comportamento, sem semântica ou sem identidade visual adicional.

**Acceptance Scenarios**:

1. **Given** um consumidor que precisa apenas do comportamento genérico de um primitivo, **When** o componente é escolhido, **Then** ele usa diretamente a família em `src/components/ui`.
2. **Given** um consumidor que precisa de identidade, semântica ou defaults oficiais do produto, **When** o componente é escolhido, **Then** ele usa um atom com valor adicional documentado.
3. **Given** um wrapper que apenas repassa propriedades para um primitivo, **When** a arquitetura é revisada, **Then** ele é removido, consolidado ou explicitamente marcado para migração.
4. **Given** uma molecule, **When** suas dependências são analisadas, **Then** ela não importa nem reexporta um organism.

### User Story 3 - Preservar a identidade visual sem overrides locais (Priority: P1)

Como pessoa responsável pelo produto, quero que os primitivos usem os tokens canônicos e que as páginas definam composição, não uma nova identidade para cada controle.

**Why this priority**: A estrutura compound já existe, mas parte dos arquivos ainda usa tokens legados e várias páginas redefinem cores, tipografia, altura e estados via `className`.

**Independent Test**: Uma auditoria de estilos identifica que os primitivos escopados usam os tokens atuais e que overrides recorrentes de identidade foram convertidos em variantes ou wrappers com contrato.

**Acceptance Scenarios**:

1. **Given** um primitivo com tokens legados, **When** sua implementação é alinhada, **Then** suas cores, tipografia, geometria e estados usam os tokens canônicos aplicáveis.
2. **Given** o mesmo override visual repetido em duas ou mais superfícies, **When** a repetição é identificada, **Then** ela é representada por uma variante ou componente de camada superior, em vez de permanecer duplicada em páginas.
3. **Given** uma página que precisa alterar grid, largura ou espaçamento externo, **When** ela compõe um componente, **Then** pode controlar layout sem redefinir o contrato visual interno do primitivo.
4. **Given** uma caixa de métrica ou superfície bege do produto, **When** sua categoria é analisada, **Then** ela permanece como componente de superfície/métrica do produto e não é classificada como menu contextual ou dropdown.

### User Story 4 - Manter catálogo, testes e consumidores sincronizados (Priority: P2)

Como mantenedor do design system, quero que registry, testes e consumidores reflitam a estrutura real, para que futuras alterações sejam verificáveis e rastreáveis.

**Why this priority**: O registry possui consumidores incompletos para algumas famílias e os testes genéricos não incluem todas as famílias existentes na pasta `ui`.

**Independent Test**: Os validadores e testes conseguem relacionar cada família primitiva aos seus arquivos, partes públicas e cenários de isolamento/acessibilidade correspondentes.

**Acceptance Scenarios**:

1. **Given** uma família presente em `src/components/ui`, **When** o catálogo é validado, **Then** sua entrada, origem, categoria, status e partes públicas estão sincronizados.
2. **Given** um consumidor real de DropdownMenu ou Select, **When** o registry é auditado, **Then** o consumidor aparece na lista correspondente.
3. **Given** Calendar e Spinner como famílias públicas, **When** a suíte de contratos primitivos é executada, **Then** elas não ficam excluídas por listas estáticas desatualizadas.
4. **Given** uma alteração em uma parte compound, **When** os testes de contrato são executados, **Then** comportamento de teclado, foco, nome acessível, estados de carregamento/erro/vazio aplicáveis e composição pública permanecem verificáveis.

### Edge Cases

- Quando uma parte compound é exportada publicamente mas não é usada diretamente por uma página, ela continua registrada como parte do contrato da família.
- Quando um componente parece visualmente semelhante a um primitivo, mas possui regra de domínio, ele permanece na camada de produto adequada e não é movido para `src/components/ui`.
- Quando uma variante ocorre somente uma vez e não representa um contrato reutilizável, ela permanece como composição local de layout, desde que não redefina tokens sem justificativa.
- Quando um primitivo ainda possui consumidores legados durante a migração, a compatibilidade pública é preservada até a migração do consumidor ser concluída.
- Quando registry e código discordam, o estado documentado é tratado como migration-required até que a evidência do código e a entrada do catálogo sejam reconciliadas.
- Quando uma página precisa de uma densidade ou estado não previsto, a decisão deve ser registrada como variante, wrapper ou item fora de escopo; não deve ser criada uma exceção silenciosa.

## Requirements

### Functional Requirements

- **FR-001**: O sistema MUST catalogar as 16 famílias primitivas existentes em `src/components/ui`, incluindo suas raízes, partes públicas, categoria visual, fonte comportamental e consumidores conhecidos.
- **FR-002**: Cada família compound MUST possuir uma entrada arquitetural única, com suas partes públicas relacionadas à mesma família, sem fragmentar filhos dependentes de contexto em famílias independentes.
- **FR-003**: O contrato de cada família MUST distinguir responsabilidade de contexto/comportamento, estrutura visual, estados, acessibilidade e composição.
- **FR-004**: Primitivos em `src/components/ui` MUST permanecer genéricos, sem regras de domínio ou dependências de camadas superiores.
- **FR-005**: A arquitetura MUST impedir dependências de uma camada atômica para uma camada superior, incluindo imports ou reexports de organisms em molecules.
- **FR-006**: Cada wrapper em `src/components/atoms` MUST possuir valor adicional verificável em pelo menos uma destas dimensões: identidade visual, semântica, acessibilidade, default oficial ou composição reutilizável.
- **FR-007**: Wrappers transparentes de Button, Badge, Input ou equivalentes MUST ser removidos, consolidados ou documentados como migration-required antes da conclusão da migração.
- **FR-008**: O projeto MUST definir e aplicar um caminho canônico de consumo entre `src/components/ui` e `src/components/atoms`, preservando uso direto de primitivos quando não houver contrato de produto superior.
- **FR-009**: Os primitivos escopados MUST substituir tokens visuais legados por tokens canônicos equivalentes, sem inventar valores locais não previstos no design system.
- **FR-010**: Overrides recorrentes de cor, tipografia, geometria ou estados MUST ser convertidos em variantes ou componentes de camada superior quando representarem um contrato reutilizável.
- **FR-011**: Páginas e templates MUST permanecer responsáveis principalmente por layout e composição, sem redefinir silenciosamente o contrato visual interno dos primitivos.
- **FR-012**: O registry MUST refletir os arquivos reais, status, camada, categoria, partes públicas e consumidores conhecidos de todas as famílias primitivas e wrappers mantidos.
- **FR-013**: A cobertura de testes MUST incluir todas as 16 famílias primitivas, seus contratos de isolamento e os cenários de acessibilidade aplicáveis.
- **FR-014**: O processo MUST validar que as alterações preservam APIs públicas, composição compound, operação por teclado, foco visível e nomes acessíveis aplicáveis.
- **FR-015**: Nenhuma alteração deverá ser feita em `.agents/rules/atomic-design.md`, `.agents/rules/shadcn-preservation.md` ou outras rules durante esta iniciativa.
- **FR-016**: A documentação da iniciativa MUST distinguir o estado atual, o estado-alvo, itens implementados, itens conformes e itens migration-required.

### Key Entities

- **Família Primitiva**: Componente público de `src/components/ui`, como Select, Dialog, Card ou Table, com raiz e partes relacionadas.
- **Parte Compound**: Export público filho de uma família primitiva, responsável por contexto, estado, estrutura ou apresentação de um slot específico.
- **Wrapper Atom**: Componente em `src/components/atoms` que acrescenta valor verificável sobre um primitivo ou implementa um atom de produto sem equivalente genérico.
- **Consumidor**: Página, template, organism, molecule ou atom que importa e compõe uma família ou parte pública.
- **Registro de Componente**: Entrada do catálogo que conecta ID, camada, categoria, origem, exports, status e consumidores.
- **Contrato Visual**: Conjunto de tokens, variantes, estados, geometria, acessibilidade e limites de composição atribuídos a um componente.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% das 16 famílias primitivas possuem uma entrada catalogada com todas as partes públicas identificadas.
- **SC-002**: A auditoria de dependências encontra 0 imports ou reexports de organismos dentro de molecules e 0 imports de camadas superiores dentro de `src/components/ui`.
- **SC-003**: 100% dos atoms mantidos possuem uma justificativa documentada de valor adicional, e nenhum wrapper transparente permanece sem status ou plano de migração.
- **SC-004**: 100% dos primitivos escopados passam pela auditoria de tokens sem uso não justificado de tokens visuais legados.
- **SC-005**: 100% dos consumidores catalogados de DropdownMenu, Select e demais famílias públicas aparecem no registry ou são marcados explicitamente como migration-required.
- **SC-006**: Os testes e validadores cobrem 16 de 16 famílias primitivas e terminam sem falhas de isolamento, contrato público ou acessibilidade aplicáveis.
- **SC-007**: Nenhuma página precisa repetir uma combinação visual oficial já convertida em variante ou wrapper de produto.
- **SC-008**: A validação humana consegue identificar, para cada alteração, a camada responsável, o contrato afetado, o teste correspondente e o status de migração em até 5 minutos por família.

## Assumptions

- O escopo permanece desktop web a partir de 1024px, seguindo a constituição e o design system existentes.
- O comportamento público dos componentes deve ser preservado durante a reorganização, salvo quando uma inconsistência for explicitamente marcada como migration-required.
- As rules existentes são suficientes e ficam fora do escopo; esta iniciativa não altera arquivos sob `.agents/rules/`.
- O design system canônico existente é a fonte para tokens, categorias e contratos; novos tokens ou regras visuais não serão inventados localmente.
- A implementação futura será executada somente após validação humana deste SDD por `/speckit-implement`.
- Não há alteração de banco de dados, API externa, autenticação ou modelo de domínio nesta iniciativa.
- O worktree pode conter alterações preexistentes; a implementação deverá preservar mudanças não relacionadas.
