# Feature Specification: Unificação de Superfícies e Composição Atomic

**Feature Branch**: `05-08-26-unificar-superficies-atomic`

**Created**: 2026-08-05

**Status**: Draft

**Input**: Criar um SDD de merge para unificar a base visual das superfícies/boxes do app e adequar `Card`, `MetricBox`, `MacroMetricCard` e componentes relacionados ao padrão Atomic Design do projeto, seguindo composição reutilizável e evitando `div`s com estilos de caixa hardcoded.

## Contexto e objetivo

O app possui várias superfícies visuais semelhantes, mas implementadas por caminhos diferentes: o primitivo Shadcn `Card`, o `MetricBox` com classes próprias e `div`s que repetem fundo, borda, raio, padding ou sombra. Essa duplicação permite que caixas visualmente equivalentes se afastem entre si e obriga cada componente novo a recriar uma superfície.

Esta feature define uma única base de superfície reutilizável para o produto, preserva o primitivo Shadcn genérico e migra os componentes de conteúdo para composição sobre essa base. O resultado esperado é que componentes complexos expressem conteúdo e comportamento próprios sem repetir o contrato visual da caixa.

## Decisão arquitetural inicial

- `Card` em `src/components/ui` permanece um primitivo Shadcn genérico, sem regras de domínio nutricional.
- `Surface` será o wrapper atômico genérico do produto, composto sobre `Card` e responsável pela superfície visual compartilhada.
- Receitas visuais de superfície ficam no design system; consumidores não inventam combinações locais de fundo, borda, raio, padding ou elevação.
- `MetricBox`, `MacroMetricCard`, `RecipeCard`, `MealItemRow`, `MacroTrackerHeader`, `MealCardContainer`, `MetricBoxGroup` e superfícies equivalentes passam a compor `Surface` quando possuírem uma caixa visual.
- `div` continua permitido para layout interno, mas não para repetir uma superfície reutilizável.

## User Scenarios & Testing

### Canonical surface mapping

`Surface` reutiliza as variantes canônicas `default` e `subtle`, as densidades `compact`, `standard` e `highlight`, e a política `shadow-none` da categoria `surfaces`. Os modos públicos atuais de `MetricBox.surface` não são renomeados: `boxed` usa `subtle`, `raised` usa `default`, `tinted` usa a base com tratamento semântico aprovado pelo consumidor, e `inline` permanece sem caixa como layout interno/exceção classificada.

### User Story 1 - Criar uma superfície visual única (Priority: P1)

Como mantenedor do design system, quero ter uma base de superfície visual reutilizável, para que novas caixas e componentes não precisem recriar estilos de container.

**Why this priority**: A base compartilhada é a dependência de todos os componentes migrados e reduz a divergência visual antes de qualquer migração de consumidor.

**Independent Test**: Revisar o contrato de `Surface` e verificar que suas variantes canônicas, densidades, política `shadow-none`, estados e semântica são suficientes para reproduzir as superfícies atuais sem classes de geometria repetidas nos consumidores.

**Acceptance Scenarios**:

1. **Given** um componente genérico sem regra de domínio, **When** ele precisa de uma superfície visual, **Then** pode compor `Surface` com conteúdo via `children` e uma variante explícita.
2. **Given** duas superfícies com o mesmo papel visual, **When** a receita compartilhada é alterada, **Then** ambas mantêm o mesmo contrato visual sem edição de classes duplicadas.
3. **Given** uma necessidade de superfície que não cabe nas variantes existentes, **When** ela é proposta, **Then** a decisão passa pelo design system antes de receber uma classe local.

### User Story 2 - Compor componentes especializados sobre a base (Priority: P1)

Como implementador, quero que componentes como `MetricBox` e `MacroMetricCard` reutilizem a mesma superfície, para que sua implementação se concentre em conteúdo, dados e interação.

**Why this priority**: Esses componentes são consumidores visíveis e atualmente representam os dois padrões mais importantes: métrica compacta e card nutricional composto.

**Independent Test**: Inspecionar os componentes migrados e confirmar que nenhuma superfície visual interna repete diretamente o contrato base, enquanto label, valor, badge, progresso, ações e estados próprios permanecem intactos.

**Acceptance Scenarios**:

1. **Given** um `MetricBox` boxed, raised, tinted ou inline, **When** ele é renderizado, **Then** os modos com caixa usam `Surface`, o modo tinted preserva apenas o tratamento semântico aprovado e o modo inline não cria uma caixa duplicada; em todos os casos o componente mantém sua anatomia de label, valor e caption.
2. **Given** um `MacroMetricCard`, **When** ele é renderizado com badge, progresso ou proporção g/kg, **Then** o conteúdo específico permanece no componente e a caixa vem da superfície compartilhada.
3. **Given** um componente de conteúdo como receita, refeição ou linha de alimento, **When** ele exige uma superfície, **Then** compõe a base sem copiar a combinação de tokens da caixa.

### User Story 3 - Adequar a hierarquia Atomic e os consumidores (Priority: P1)

Como revisor do projeto, quero que a base e seus consumidores estejam nas camadas Atomic corretas, para que dependências apontem para baixo e o domínio não vaze para primitivos genéricos.

**Why this priority**: A reutilização só é sustentável se a base não depender de moléculas/organismos e se os consumidores não colocarem regras de domínio em `src/components/ui`.

**Independent Test**: Executar a auditoria de composição e catálogo, verificando que `Surface` é genérico, os componentes especializados permanecem nas camadas adequadas e não existem imports ascendentes.

**Acceptance Scenarios**:

1. **Given** o primitivo `Card`, **When** sua implementação é revisada, **Then** ele permanece agnóstico e sem dados ou regras nutricionais.
2. **Given** `Surface`, **When** sua camada e dependências são revisadas, **Then** ele pode usar o primitivo UI e o design system, mas não importa molecules, organisms, templates ou domínio.
3. **Given** uma página que precisa de uma caixa, **When** o catálogo é consultado, **Then** existe um componente apropriado antes de recorrer a uma `div` com tokens de superfície repetidos.

### User Story 4 - Preservar aparência e comportamento existentes (Priority: P2)

Como usuário do NutriDiet, quero que as telas continuem reconhecíveis após a unificação, para que a refatoração não altere conteúdo, densidade ou ações sem uma decisão explícita.

**Why this priority**: A feature é uma consolidação arquitetural; mudanças de produto ou de conteúdo estão fora do objetivo.

**Independent Test**: Comparar as telas consumidoras antes e depois da migração por estados default, hover, focus-visible, selected, disabled, loading, error, empty e read-only quando aplicáveis.

**Acceptance Scenarios**:

1. **Given** uma tela com dados, **When** a superfície é migrada, **Then** o conteúdo e a hierarquia visual permanecem equivalentes aos contratos existentes.
2. **Given** uma tela com estado vazio ou loading, **When** a superfície é migrada, **Then** a mensagem, ação e acessibilidade do estado permanecem preservadas.
3. **Given** um componente com ações internas, **When** ele é composto sobre a superfície, **Then** o foco, a semântica e a independência dos controles internos não são prejudicados.

## Edge Cases

- Superfícies inline, como células de `MetricBoxGroup`, não devem receber borda, raio ou elevação duplicados da superfície externa.
- Uma superfície tinted deve preservar a associação entre tom nutricional e tokens no consumidor/categoria apropriado, sem transformar `Surface` em componente de domínio ou colorir genericamente todo card.
- Componentes com conteúdo opcional não devem gerar padding, header ou footer vazios apenas por usarem a base.
- Um consumidor que precise de uma superfície interativa deve declarar a semântica de link ou botão no componente apropriado; a base não deve transformar toda caixa em elemento interativo.
- Estados vazios de páginas e listas devem continuar sendo estados do componente hospedeiro; `Surface` não deve embutir copy de domínio.
- A migração não deve remover estilos de componentes que são apenas layout interno sem responsabilidade de superfície.
- Variantes visuais não devem proliferar como combinação de múltiplos booleanos; novas diferenças devem ser expressas por variantes nomeadas ou composição.

## Requirements

### Functional Requirements

- **FR-001**: O sistema deve definir um contrato único para superfícies visuais reutilizáveis, cobrindo superfície, densidade, borda, raio, elevação, padding, estados aplicáveis e semântica.
- **FR-002**: O sistema deve disponibilizar `Surface` como componente genérico da camada Atomic apropriada, sem dados ou regras do domínio nutricional.
- **FR-003**: `Surface` deve aceitar conteúdo por composição (`children`) e as variantes canônicas explícitas `default` e `subtle`, evitando uma API baseada em múltiplos booleanos para modos visuais.
- **FR-004**: O primitivo Shadcn `Card` deve permanecer limpo, genérico e preservado de regras específicas dos componentes de nutrição.
- **FR-005**: `MetricBox` deve compor `Surface` e manter sua API de conteúdo, incluindo label, value, caption, icon, tone, size e layout, eliminando a implementação local duplicada da caixa.
- **FR-006**: `MacroMetricCard` deve compor `Surface` e manter badge, progresso, valores atuais/alvo, proporção g/kg e cores de macro como responsabilidades próprias.
- **FR-007**: Consumidores de superfície relacionados, incluindo `RecipeCard`, `MealItemRow`, `MacroTrackerHeader`, `MealCardContainer` e `MetricBoxGroup`, devem ser classificados e migrados conforme sua camada Atomic e categoria visual.
- **FR-008**: O sistema deve identificar todas as superfícies locais hardcoded nos consumidores do escopo e classificá-las como composição da base, layout interno legítimo ou exceção documentada.
- **FR-009**: Nenhum consumidor migrado deve repetir diretamente a combinação de tokens de fundo, borda, raio, padding ou elevação que já pertence ao contrato de `Surface`, salvo exceção registrada.
- **FR-010**: A implementação deve preservar a semântica, acessibilidade, conteúdo, ações e estados existentes dos componentes migrados.
- **FR-011**: A documentação do design system deve registrar `Surface`, seus consumidores, camada, categoria visual, lifecycle, composição e exceções no catálogo canônico.
- **FR-012**: Testes devem cobrir a API de composição, variantes, estados, isolamento Atomic, ausência de dependências ascendentes e regressões dos consumidores principais.
- **FR-013**: A especificação e o plano devem distinguir claramente o primitivo UI `Card`, o wrapper atômico `Surface` e os componentes de conteúdo que os compõem.

### Key Entities

- **Surface contract**: contrato visual compartilhado para superfícies genéricas, com variantes e estados permitidos.
- **Surface consumer**: componente que compõe a superfície para exibir conteúdo próprio, sem reimplementar o contrato visual.
- **Atomic layer**: camada arquitetural do componente (`ui`, `atom`, `molecule`, `organism`, `template` ou `app`).
- **Visual category**: categoria normativa principal herdada pelo componente, especialmente `surfaces`, `data-display` ou `nutrition-domain`.
- **Exception record**: registro explícito para qualquer consumidor que não possa usar a base por uma diferença real de semântica ou anatomia.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% dos componentes listados no escopo possuem uma decisão documentada de composição, migração ou exceção.
- **SC-002**: 100% das superfícies visuais migradas usam a base compartilhada ou uma exceção registrada; nenhuma permanece como repetição não classificada de tokens de caixa.
- **SC-003**: A auditoria Atomic/design system não encontra dependências ascendentes, componentes UI acoplados ao domínio ou superfícies sem entrada documental.
- **SC-004**: Os testes dos consumidores principais permanecem verdes para os estados e interações previamente cobertos.
- **SC-005**: Uma nova superfície compatível pode ser criada compondo a base sem copiar classes visuais de outro consumidor.
- **SC-006**: A comparação visual das rotas principais não identifica mudança não intencional de geometria, hierarquia, foco ou contraste nos componentes migrados.

## Assumptions

- A primeira versão da base será denominada `Surface`; o nome pode ser ajustado no plano somente se o catálogo existente justificar outro termo sem criar duplicidade.
- O primitivo `Card` continuará sendo o fundamento Shadcn de baixo nível; a adaptação do produto acontecerá por composição, wrapper e receitas do design system.
- O escopo inicial cobre os consumidores atuais encontrados no catálogo e no runtime, não uma reescrita completa de todas as páginas.
- A hierarquia Atomic vigente e a preservação dos primitivos Shadcn são obrigatórias, mesmo quando o código atual possui divergências documentadas.
- O produto continua desktop-only a partir de 1024px, com tema claro e tokens canônicos já definidos.
- Não haverá mudança de modelo de dados, persistência, rotas ou regras nutricionais.

## Out of Scope

- Migrar Breadcrumb, Sidebar, ContextMenu, DropdownMenu, Select, Combobox ou Empty.
- Alterar o conteúdo ou a lógica de negócio de métricas, receitas, refeições ou macros.
- Criar um novo sistema de temas, dark mode ou suporte mobile/tablet.
- Executar a implementação nesta etapa do SDD; a implementação dependerá de validação humana e deverá passar por `/speckit-implement`.
