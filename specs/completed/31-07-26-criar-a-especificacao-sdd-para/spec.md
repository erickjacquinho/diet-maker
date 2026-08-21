# Feature Specification: Regras Visuais por Categoria de Componentes

**Feature Branch**: `31-07-26-criar-a-especificacao-sdd-para`

**Created**: 2026-07-31

**Status**: Draft

**Input**: Consolidar o Design System do NutriDiet em regras normativas por categoria visual, separando categoria visual de camada Atomic Design e tornando as regras aplicáveis aos componentes atuais e futuros.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar uma categoria visual normativa (Priority: P1)

Como implementador humano ou agente, quero identificar a categoria visual de um componente e encontrar nela todas as decisões compartilhadas de aparência, estado, comportamento e acessibilidade, para implementar sem inventar valores ou combinações locais.

**Why this priority**: As categorias são o mecanismo principal de padronização. Sem elas, fichas individuais repetem regras, divergem e não orientam componentes futuros.

**Independent Test**: Selecionar uma categoria do catálogo e verificar que ela determina, sem decisões abertas, anatomia-base, dimensões, spacing, tipografia, tokens, variantes, estados, interação, movimento, acessibilidade, composição e proibições.

**Acceptance Scenarios**:

1. **Given** um componente de ação, **When** o implementador consulta a categoria correspondente, **Then** encontra receitas completas para ação textual, ação com ícone, prioridade, tamanhos e todos os estados aplicáveis.
2. **Given** duas categorias diferentes, **When** suas regras são comparadas, **Then** responsabilidades compartilhadas e diferenças específicas estão explícitas sem duplicação contraditória.
3. **Given** uma propriedade visual permitida globalmente, **When** ela não é permitida pela categoria, **Then** o implementador não pode escolhê-la localmente.

---

### User Story 2 - Classificar componentes atuais e futuros em dois eixos (Priority: P1)

Como mantenedor do design system, quero classificar cada componente por camada Atomic Design e por categoria visual, para que responsabilidade arquitetural e estilo não sejam confundidos.

**Why this priority**: Atomic Design responde onde o componente vive e do que depende; a categoria visual responde como ele se apresenta e se comporta. Misturar os eixos produz classificações incorretas e regras pouco reutilizáveis.

**Independent Test**: Escolher componentes de camadas Atomic diferentes que compartilham uma categoria visual e verificar que herdam a mesma receita visual sem alterar suas responsabilidades arquiteturais.

**Acceptance Scenarios**:

1. **Given** um componente atual, **When** ele é consultado no registro, **Then** sua camada atual, camada-alvo, categoria visual e ficha individual estão identificadas separadamente.
2. **Given** um `TacoSearchInput`, **When** sua classificação é lida, **Then** ele aparece como molecule no eixo Atomic Design e como campo de busca no eixo visual.
3. **Given** um componente atual na camada Atomic incorreta, **When** ele é registrado, **Then** a documentação preserva a localização real, declara a camada-alvo e não falsifica a implementação.
4. **Given** um componente futuro, **When** sua proposta é avaliada, **Then** ela precisa herdar uma categoria existente ou justificar formalmente a evolução ou criação de uma categoria.

---

### User Story 3 - Consultar uma ficha individual sem duplicação (Priority: P2)

Como implementador, quero que a ficha de um componente contenha somente identidade, categoria herdada, anatomia específica, variantes permitidas, exceções justificadas, estados particulares e composição, para compreender suas particularidades sem reler regras globais duplicadas.

**Why this priority**: A ficha individual continua necessária para descrever diferenças reais, mas não pode se transformar em uma segunda fonte dos valores compartilhados.

**Independent Test**: Selecionar uma ficha e rastrear cada decisão visual até uma regra de categoria ou exceção formal, sem encontrar valores compartilhados redefinidos localmente.

**Acceptance Scenarios**:

1. **Given** uma ficha sem exceções, **When** ela é revisada, **Then** todas as decisões compartilhadas são herdadas por referência à categoria.
2. **Given** uma necessidade que diverge da categoria, **When** a ficha propõe uma exceção, **Then** registra motivo, escopo, impacto, aprovação e efeito sobre componentes futuros.
3. **Given** uma regra compartilhada alterada, **When** a categoria é atualizada, **Then** fichas que a herdam não precisam repetir a mesma alteração.

---

### User Story 4 - Auditar completude e consistência (Priority: P2)

Como revisor, quero executar uma verificação objetiva do catálogo, para impedir aprovação de componentes sem registro, categoria, ficha, estados aplicáveis ou rastreabilidade de tokens.

**Why this priority**: Regras documentais sem verificação degradam silenciosamente e voltam a depender de interpretação humana.

**Independent Test**: Introduzir controladamente cada tipo de inconsistência coberta e confirmar que a auditoria identifica o item nominalmente e retorna ao estado válido após a correção.

**Acceptance Scenarios**:

1. **Given** uma fonte de componente atual sem entrada no registro, **When** a auditoria é executada, **Then** ela falha identificando a fonte ausente.
2. **Given** uma entrada sem categoria ou ficha obrigatória, **When** a auditoria é executada, **Then** ela falha identificando o componente e o campo ausente.
3. **Given** uma ficha que redefine valor global ou usa decisão aberta, **When** a auditoria é executada, **Then** ela falha indicando a regra violada.
4. **Given** o catálogo completo, **When** a auditoria é executada, **Then** ela confirma cobertura integral e zero inconsistências.

---

### User Story 5 - Evoluir categorias com governança (Priority: P3)

Como mantenedor, quero um processo explícito para criar, alterar, dividir, fundir, depreciar ou remover categorias, para que componentes futuros não fragmentem a linguagem visual.

**Why this priority**: A estabilidade do sistema depende de impedir que uma necessidade isolada vire uma nova categoria ou variante sem análise de reutilização.

**Independent Test**: Avaliar uma proposta de componente que não cabe integralmente em categoria existente e verificar que o processo conduz a composição, variante, evolução de categoria ou nova categoria com decisão registrada.

**Acceptance Scenarios**:

1. **Given** uma proposta parcialmente coberta, **When** ela é revisada, **Then** composição e variante são avaliadas antes de criar nova categoria.
2. **Given** uma nova categoria aprovada, **When** ela entra no catálogo, **Then** possui propósito, limites, relações, receitas completas, consumidores iniciais e registro da decisão.
3. **Given** uma categoria depreciada, **When** um novo componente é proposto, **Then** a categoria depreciada não pode ser usada e o substituto é indicado.

### Edge Cases

- Um compound component com várias partes públicas pertence a uma categoria principal; partes com comportamento visual autônomo devem ter sub-receitas explícitas na mesma especificação.
- Um componente pode combinar traits de outras categorias, mas deve possuir exatamente uma categoria principal responsável por seu contrato visual e declarar cada trait adicional.
- Um componente puramente estrutural pode não possuir estados interativos; cada estado não aplicável deve ser marcado com justificativa objetiva.
- Uma proposta sem arquivo de implementação deve permanecer `proposed` e não conta como componente atual coberto.
- Um primitive Shadcn/Radix permanece genérico mesmo quando wrappers ou composições de domínio herdam categorias específicas.
- Um componente atual encontrado fora da camada-alvo continua registrado pelo caminho real e recebe status de migração arquitetural.
- Uma necessidade visual exclusiva de uma única tela não cria automaticamente categoria ou variante; primeiro deve ser expressa por composição dos contratos existentes.
- Conflitos entre documentos normativos devem bloquear homologação até existir uma única regra prevalente e os roteadores documentais serem sincronizados.
- A entrada ou remoção de um arquivo de componente após a baseline deve alterar automaticamente a expectativa de cobertura da auditoria.
- Categorias que parecem equivalentes por estilo, mas têm semântica, interação ou acessibilidade diferentes, não devem ser fundidas somente para reduzir quantidade.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O design system MUST possuir uma arquitetura documental explícita em três níveis: fundamentos globais, categorias visuais e fichas individuais.
- **FR-002**: Fundamentos globais MUST permanecer como única fonte de tokens, tipografia, cores, spacing, radius, bordas, layers, movimento e requisitos gerais de acessibilidade.
- **FR-003**: O catálogo MUST definir categorias visuais normativas para ações, campos, seleção, navegação, superfícies, dados, feedback, overlays, carregamento, domínio nutricional e estrutura.
- **FR-004**: Cada categoria MUST declarar propósito, critérios de inclusão, critérios de exclusão, relações com outras categorias e exemplos de componentes atuais.
- **FR-005**: Cada categoria MUST definir anatomia-base e partes obrigatórias, opcionais e proibidas.
- **FR-006**: Cada categoria MUST definir dimensões, spacing, alinhamento, densidade, radius, bordas, layers e overflow aplicáveis usando somente fundamentos globais.
- **FR-007**: Cada categoria MUST mapear toda função textual a um style semântico existente, sem permitir tamanho, peso, cor, line-height ou tracking local.
- **FR-008**: Cada categoria MUST definir tokens por parte e por propriedade, sem repetir valores primitivos quando existir token semântico ou de componente.
- **FR-009**: Cada categoria interativa MUST especificar `default`, `hover`, `pressed`, `focus-visible`, `selected`, `disabled`, `loading`, `error`, `empty` e `read-only`, declarando justificadamente os estados não aplicáveis.
- **FR-010**: Cada categoria MUST definir interação, teclado, foco, anúncio semântico, movimento e comportamento sob preferência de movimento reduzido.
- **FR-011**: Cada categoria MUST definir variantes permitidas, combinações proibidas e limites de proliferação de variantes.
- **FR-012**: Cada categoria MUST definir regras de composição, nesting, proximidade e relações permitidas com outras categorias.
- **FR-013**: Cada categoria MUST listar decisões proibidas e anti-patterns capazes de produzir inconsistência visual ou semântica.
- **FR-014**: Atomic Design MUST ser documentado como eixo independente da categoria visual.
- **FR-015**: O eixo Atomic Design MUST determinar responsabilidade, dependências e localização entre `ui`, atoms, molecules, organisms, templates e pages.
- **FR-016**: O eixo de categoria visual MUST determinar aparência, estados, interação visual e comportamento compartilhado, independentemente da camada Atomic.
- **FR-017**: Todo componente MUST possuir exatamente uma categoria visual principal e MAY declarar traits adicionais sem criar múltiplas fontes principais.
- **FR-018**: O registro MUST representar separadamente camada atual, camada-alvo, categoria principal, traits, natureza genérica ou de domínio, lifecycle, fontes atuais, símbolos públicos, ficha e consumidores.
- **FR-019**: O registro MUST cobrir a baseline de 39 arquivos atuais de componentes sem assumir que existência de arquivo significa conformidade.
- **FR-020**: `Textarea`, `FormField`, `Spinner` e `Skeleton` MUST ser registrados como propostas justificadas e MUST NOT ser apresentados como implementados.
- **FR-021**: Cada ficha individual MUST declarar identidade, propósito, categoria herdada, anatomia específica, variantes permitidas, estados particulares, composição e critérios de aceite.
- **FR-022**: Fichas individuais MUST NOT repetir regras compartilhadas já normatizadas pela categoria.
- **FR-023**: Toda diferença entre ficha e categoria MUST ser registrada como exceção com motivo, escopo, impacto, aprovação, prazo de revisão e decisão sobre generalização futura.
- **FR-024**: Componentes atuais arquiteturalmente mal classificados MUST preservar no registro seu caminho real e declarar camada-alvo e migração necessária.
- **FR-025**: Compound components MUST enumerar todas as partes públicas e indicar quais regras pertencem à família principal e quais pertencem a sub-receitas.
- **FR-026**: Uma proposta de componente futuro MUST demonstrar herança de categoria existente antes de ser aceita.
- **FR-027**: Quando nenhuma categoria cobrir uma proposta, o processo MUST avaliar composição, nova variante e evolução de categoria antes da criação de nova categoria.
- **FR-028**: A criação ou alteração de categoria MUST registrar problema recorrente, consumidores, alternativas avaliadas, impacto, compatibilidade e decisão de governança.
- **FR-029**: Categorias MUST possuir lifecycle explícito com estados proposto, experimental, estável, depreciado e removido.
- **FR-030**: Categorias depreciadas MUST indicar substituto e MUST NOT aceitar novos consumidores.
- **FR-031**: A auditoria MUST detectar toda fonte de componente atual sem entrada no registro e toda entrada que aponta para fonte inexistente.
- **FR-032**: A auditoria MUST detectar entradas atuais sem categoria principal, ficha, símbolos públicos ou estado de lifecycle.
- **FR-033**: A auditoria MUST detectar fichas ou categorias sem seções obrigatórias, estados aplicáveis, critérios de aceite ou rastreabilidade aos fundamentos.
- **FR-034**: A auditoria MUST detectar decisões abertas, valores visuais não permitidos, tokens inexistentes e redefinições locais de regras compartilhadas.
- **FR-035**: A auditoria MUST apresentar erros nominais e acionáveis, permitindo identificar documento, componente, categoria e regra violada.
- **FR-036**: A documentação MUST separar claramente estado documental, estado implementado, conformidade visual e necessidade de migração.
- **FR-037**: Os índices humanos MUST apontar para categorias e fichas sem duplicar seus contratos normativos.
- **FR-038**: As fontes normativas e roteadores do projeto MUST ser sincronizados para que nenhuma regra histórica concorra com o catálogo vigente.
- **FR-039**: O resultado MUST respeitar o produto exclusivamente web desktop a partir de `1024px`, sem especificar mobile, tablet ou dark mode.
- **FR-040**: O resultado MUST preservar a genericidade dos primitives Shadcn/Radix e impedir acoplamento de domínio na camada `ui`.
- **FR-041**: O resultado MUST cobrir WCAG 2.2 AA, foco visível e operação por teclado aplicável, respeitando as dimensões compactas e standard definidas pelo design system desktop.
- **FR-042**: A execução deste SDD MUST produzir somente documentação normativa, registro, checklists e validadores; MUST NOT alterar a estilização ou arquitetura de `src/`.
- **FR-043**: Especificações detalhadas de telas e migração visual do código MUST permanecer fora do escopo e ser tratadas após a homologação deste catálogo.

### Key Entities

- **Fundamento global**: Regra transversal já aprovada que fornece tokens e limites visuais consumidos pelas categorias.
- **Categoria visual**: Contrato reutilizável que governa aparência, partes, variantes, estados, interação, acessibilidade e composição de uma família de componentes.
- **Trait visual**: Conjunto secundário e explicitamente limitado de regras reutilizadas por um componente sem substituir sua categoria principal.
- **Entrada de componente**: Registro verificável que relaciona identidade, fontes, símbolos públicos, eixos Atomic e visual, lifecycle, ficha e consumidores.
- **Ficha individual**: Documento enxuto que aplica uma categoria a um componente e contém apenas suas particularidades normativas.
- **Exceção**: Divergência aprovada e rastreável entre uma ficha e sua categoria, com escopo e revisão definidos.
- **Decisão de categoria**: Registro de criação, evolução, divisão, fusão, depreciação ou remoção de categoria.
- **Resultado de auditoria**: Conjunto nominal de violações ou confirmação de cobertura e consistência integral.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos 39 arquivos atuais de componentes aparecem no registro com camada atual, camada-alvo, categoria principal, lifecycle, símbolos públicos e ficha correspondente.
- **SC-002**: 100% das categorias possuem todas as áreas normativas exigidas e zero decisão textual aberta.
- **SC-003**: 100% das fichas atuais rastreiam suas regras compartilhadas a uma categoria e contêm zero duplicação normativa não justificada.
- **SC-004**: As quatro propostas justificadas aparecem como `proposed`, e nenhuma é contabilizada como implementação existente.
- **SC-005**: Para uma amostra contendo pelo menos um componente de cada categoria, dois revisores independentes identificam as mesmas dimensões, tokens, styles tipográficos, variantes e estados sem decisão adicional.
- **SC-006**: A auditoria identifica corretamente 100% dos casos controlados de fonte sem registro, categoria ausente, ficha incompleta, estado ausente, token inválido, valor não permitido e decisão aberta.
- **SC-007**: A auditoria final reporta zero fonte atual descoberta sem cobertura, zero entrada inválida, zero categoria incompleta e zero ficha atual incompleta.
- **SC-008**: 100% das referências normativas e roteadores ativos apontam para a mesma arquitetura de categorias e não tratam artefatos históricos como vigentes.
- **SC-009**: Nenhum arquivo sob `src/` é alterado durante a entrega deste escopo.
- **SC-010**: Uma proposta simulada de componente futuro pode ser classificada, documentada e auditada usando o processo sem criar valor visual local.

## Scope Boundaries

### Included

- Arquitetura normativa em três níveis.
- Taxonomia e contratos completos de categorias visuais.
- Relação ortogonal entre Atomic Design e categorias visuais.
- Registro dos componentes atuais e propostas justificadas.
- Fichas individuais enxutas e política formal de exceções.
- Governança e lifecycle de categorias.
- Auditoria automatizada de cobertura e consistência documental.
- Sincronização de índices, roteadores e fontes normativas afetadas.

### Excluded

- Alteração de componentes, estilos, tokens executáveis ou páginas em `src/`.
- Migração visual do código atual.
- Especificações detalhadas de composição e layout de cada rota.
- Mobile, tablet, mobile-first e dark mode.
- Criação de nova direção estética ou revisão dos fundamentos já aprovados.
- Declaração de conformidade implementada antes da migração e dos testes correspondentes.

## Dependencies

- Guia canônico atual em `design-system/`.
- Regras operacionais de Atomic Design e preservação Shadcn.
- Inventário real em `src/components/` usado apenas para leitura e cobertura.
- Roteadores documentais e constituição do projeto, que precisam refletir a fonte canônica vigente.

## Assumptions

- Os fundamentos visuais aprovados permanecem válidos e não serão rediscutidos neste escopo.
- A baseline contém 39 arquivos TSX de componentes atuais distribuídos entre `ui`, atoms, molecules, organisms e templates.
- Um arquivo pode exportar vários símbolos públicos; cobertura será medida por arquivo e por símbolo público.
- Categorias visuais podem atravessar várias camadas Atomic Design.
- Traits adicionais são permitidos apenas quando não criam segunda categoria principal nem conflito de regras.
- A especificação de categorias precede a ficha individual para impedir que o inventário atual determine indevidamente as regras futuras.
- Documentos históricos serão preservados quando úteis, mas marcados como não normativos ou substituídos.
