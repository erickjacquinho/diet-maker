# Feature Specification: Header contextual para fluxos hierárquicos

**Feature Branch**: `05-08-26-padronizar-header-contextual`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "Padronizar o header contextual para fluxos que abrem sequencialmente, começando pelo fluxo de pacientes, perfil, dieta e consulta, com botão voltar, título e breadcrumb; documentar o padrão para páginas futuras e criar uma especificação SDD para sua implementação."

## User Scenarios & Testing

### User Story 1 - Navegar em contexto dentro do fluxo clínico (Priority: P1)

Como nutricionista, quero saber em qual contexto clínico estou e retornar diretamente ao nível anterior, para navegar entre pacientes, perfil, dieta e consulta sem perder a orientação.

**Why this priority**: O fluxo clínico é a principal navegação sequencial do produto e atualmente usa headers diferentes em cada tela.

**Independent Test**: Abrir um paciente, uma dieta e uma consulta e verificar que cada tela apresenta título, breadcrumb contextual e retorno para o nível pai correto.

**Acceptance Scenarios**:

1. **Given** que o usuário está na lista de pacientes, **When** abre um paciente, **Then** o perfil mostra `Pacientes > <nome do paciente>` e um controle de retorno para a lista.
2. **Given** que o usuário está no perfil de um paciente, **When** abre uma dieta, **Then** a tela mostra `Pacientes > <nome do paciente> > Dieta` e retorna para o perfil desse paciente.
3. **Given** que o usuário está no perfil de um paciente, **When** abre uma consulta, **Then** a tela mostra `Pacientes > <nome do paciente> > Consulta` e retorna para o perfil desse paciente.
4. **Given** que o usuário está em uma consulta, **When** seleciona a dieta vinculada, **Then** a dieta mantém o contexto do paciente e retorna para o perfil do mesmo paciente.

### User Story 2 - Usar o mesmo padrão em uma nova página sequencial (Priority: P2)

Como pessoa desenvolvedora, quero uma regra documentada para identificar quando uma página deve receber o header contextual, para incluir novos níveis de navegação sem duplicar decisões visuais e de acessibilidade.

**Why this priority**: O padrão deve continuar consistente quando novos fluxos, como um cadastro de alimento em rota própria, forem implementados.

**Independent Test**: Avaliar uma nova rota com origem explícita em outra página e confirmar que a documentação define seus itens de breadcrumb, destino de retorno e exclusões.

**Acceptance Scenarios**:

1. **Given** uma página que representa um novo nível de uma rota existente, **When** sua implementação é planejada, **Then** a equipe consegue definir pai, retorno, título e breadcrumb usando o padrão documentado.
2. **Given** um modal aberto dentro da própria página, **When** não existe mudança de rota, **Then** o modal não recebe o header contextual da página.
3. **Given** uma página acessada diretamente pela navegação global, **When** não existe origem hierárquica obrigatória, **Then** ela mantém o header global próprio e não recebe um botão voltar contextual.

### User Story 3 - Preservar ações de página existentes (Priority: P3)

Como usuário do fluxo de dieta ou consulta, quero continuar acessando as ações da página enquanto o header é padronizado, para que a mudança de navegação não remova operações existentes.

**Why this priority**: Dieta e consulta já possuem ações no topo que precisam continuar disponíveis e acessíveis.

**Independent Test**: Abrir dieta e consulta e confirmar que as ações existentes continuam visíveis, operáveis por teclado e separadas do controle de retorno.

**Acceptance Scenarios**:

1. **Given** que uma página possui ações de topo, **When** o header contextual é usado, **Then** essas ações continuam disponíveis em uma região opcional do header.
2. **Given** que uma página não possui ações de topo, **When** o header contextual é usado, **Then** o título e a navegação não deixam um espaço vazio obrigatório para ações.

## Edge Cases

- Se o paciente não for encontrado, a página mantém seu estado de erro e oferece retorno para `/pacientes`; o breadcrumb não deve depender de um nome inexistente.
- Se uma dieta for criada com o identificador `nova`, o breadcrumb deve usar o rótulo contextual `Dieta` sem expor o identificador técnico.
- Se uma consulta não possuir dieta vinculada, o breadcrumb e o retorno da consulta continuam funcionando sem incluir um item de dieta.
- Se o nome do paciente for longo, o breadcrumb deve permanecer legível no desktop e não remover o nome acessível; a implementação deve seguir as regras de overflow do design system.
- A busca de alimentos dentro da dieta permanece um modal no escopo inicial; somente uma futura rota própria de cadastro/seleção receberá header contextual.
- Páginas globais acessadas pela sidebar não devem receber um botão de voltar apenas por possuírem título e breadcrumb visual.

## Requirements

### Functional Requirements

- **FR-001**: O sistema MUST oferecer um header contextual reutilizável com controle de retorno, título visível e breadcrumb.
- **FR-002**: O controle de retorno MUST apontar explicitamente para a página pai do fluxo e MUST possuir nome acessível que descreva o destino.
- **FR-003**: O breadcrumb MUST representar a hierarquia da rota atual, tornar níveis anteriores navegáveis e marcar o nível atual como não navegável.
- **FR-004**: O breadcrumb MUST suportar rótulos dinâmicos, incluindo o nome do paciente, sem expor identificadores técnicos como `id` ou `nova`.
- **FR-005**: O header MUST permitir uma região opcional para ações já existentes na página, sem tornar essa região obrigatória para todos os consumidores.
- **FR-006**: O padrão MUST ser aplicado inicialmente ao perfil do paciente, ao construtor de dieta e ao registro de consulta.
- **FR-007**: O mapeamento MUST registrar as transições `/pacientes → /pacientes/[id]`, `/pacientes/[id] → /pacientes/[id]/dieta/[dietaId]`, `/pacientes/[id] → /pacientes/[id]/consulta/[date]`, consulta → perfil/dieta e dieta → perfil.
- **FR-008**: O cadastro ou seleção de alimento aberto como modal MUST permanecer fora do escopo do header enquanto não existir uma rota própria.
- **FR-009**: A documentação MUST definir o critério para incluir o header em páginas futuras: a página precisa representar um nível sequencial de uma rota pai identificável; modais e destinos globais independentes ficam fora desse padrão.
- **FR-010**: A solução MUST preservar a ordem de foco, a operação por teclado, o foco visível, a semântica de link e a hierarquia de headings exigidas pelo design system.
- **FR-011**: A implementação MUST instalar e usar o componente de breadcrumb da biblioteca UI já adotada pelo projeto, preservando o primitivo genérico e concentrando a composição do produto no componente próprio.
- **FR-012**: A documentação do componente MUST distinguir a responsabilidade do primitivo de breadcrumb da responsabilidade do header contextual de produto.

### Key Entities

- **Contextual Header**: Unidade visual de navegação de página composta por retorno, título, breadcrumb e ações opcionais.
- **Breadcrumb Item**: Segmento da hierarquia de navegação com rótulo, destino opcional e estado atual.
- **Sequential Route**: Página que possui uma origem pai explícita e representa um nível adicional do fluxo.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% das três páginas inicialmente selecionadas apresentam o mesmo contrato visual e semântico de header contextual.
- **SC-002**: 100% das transições hierárquicas mapeadas possuem retorno explícito para o nível pai correto, sem depender de histórico incidental do navegador.
- **SC-003**: Uma pessoa desenvolvedora consegue decidir se uma nova rota deve usar o header e definir seus itens em até 5 minutos consultando a documentação do padrão.
- **SC-004**: Todos os controles de retorno e itens navegáveis do breadcrumb podem ser alcançados e ativados por teclado, com foco visível, nos cenários cobertos pelos testes.
- **SC-005**: Nenhuma ação existente de topo em dieta ou consulta é removida ou fica inacessível após a adoção do header.

## Assumptions

- O fluxo inicialmente solicitado como `/pacientes/perfil` corresponde à implementação atual `/pacientes/[id]`.
- O nome dinâmico do paciente será usado no breadcrumb, por exemplo `Pacientes > João > Dieta`.
- A solução será uma molécula de produto chamada `PageContextHeader`, composta sobre primitivos genéricos da camada UI.
- O produto continua restrito ao desktop a partir de 1024px, sem criar comportamento mobile neste escopo.
- O componente será aplicado por execução posterior do plano aprovado via `/speckit-implement`; este SDD não declara a implementação concluída.
- Alterações pré-existentes no worktree não fazem parte desta tarefa e não devem ser revertidas ou sobrescritas.
