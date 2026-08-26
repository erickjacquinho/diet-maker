# Feature Specification: Padronização do Componente DataTable com Seleção e Checkbox Canônico

**Feature Branch**: 26-08-26-padronizar-data-table-selecao-checkbox

**Created**: 2026-08-26

**Status**: Draft

**Input**: User description: Padronizar o componente DataTable para suportar selecao single e multi com atomo Checkbox unificado, tipografia, estilizacao e posicionamento consistentes em todas as tabelas

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seleção Consistente (Multi e Single) com Checkbox Canônico (Priority: P1)

Como nutricionista operando qualquer tabela do sistema que permita selecionar itens (por exemplo, busca de alimentos para inclusão múltipla ou seleção única para substituição), desejo interagir com um controle de seleção unificado que possua exatamente a mesma aparência visual (mesmo tamanho, bordas, cores, indicador de checado e traço de seleção mista), sempre posicionado na primeira coluna alinhado ao centro, funcionando de modo previsível para seleção única ou em lote.

**Why this priority**: É o núcleo da padronização de interação solicitada pelo usuário: eliminar discrepâncias de estilo, tamanho e comportamento de seleção entre diferentes tabelas da aplicação.

**Independent Test**: Renderizar uma tabela com seleção múltipla e outra com seleção única, verificando que o controle de seleção tem a mesma geometria, o mesmo foco visível, os mesmos estados visuais (marcado, desmarcado, misto), que no modo múltiplo o cabeçalho permite marcar/desmarcar todos os itens e no modo único seleciona apenas um item por vez.

**Acceptance Scenarios**:

1. **Given** uma tabela com seleção em modo multi, **When** o usuário clica no controle de seleção do cabeçalho, **Then** todos os itens da tabela ficam selecionados e o indicador no cabeçalho exibe o ícone de confirmação preenchido.
2. **Given** uma tabela com seleção em modo multi onde parte dos itens está selecionada, **When** a tabela é visualizada, **Then** o controle do cabeçalho exibe o estado misto (traço horizontal intermediário) indicando seleção parcial.
3. **Given** uma tabela com seleção em modo single, **When** o usuário clica no controle de um item, **Then** esse item é selecionado e qualquer item anteriormente selecionado é automaticamente desmarcado, sem exibir controle de seleção global no cabeçalho.
4. **Given** qualquer tabela com seleção, **When** a linha está selecionada, **Then** a linha recebe o realce de fundo padronizado do sistema com contraste e legibilidade preservados.

---

### User Story 2 - Padronização Visual, Tipográfica e Alinhamentos em Todas as Tabelas (Priority: P2)

Como usuário visualizando dados em qualquer tabela da aplicação, desejo que todos os cabeçalhos de tabela compartilhem estritamente a mesma tipografia padronizada (letras maiúsculas compactas, espaçamento entre letras consistente, peso negrito e cor secundária), as células de dados mantenham alturas de linha e preenchimentos uniformes, e números sejam sempre alinhados à direita com fonte tabular.

**Why this priority**: Garante coerência visual sistêmica, acabamento profissional e legibilidade imediata em todas as listagens de dados da aplicação.

**Independent Test**: Navegar pelas tabelas do sistema e verificar que os cabeçalhos compartilham rigorosamente os mesmos tokens de estilo tipográfico, altura padrão de linha de cabeçalho e alinhamento de dados textuais (à esquerda) e numéricos (à direita com algarismos tabulares).

**Acceptance Scenarios**:

1. **Given** qualquer tabela renderizada na interface, **When** inspecionados os cabeçalhos das colunas, **Then** todos exibem o estilo tipográfico canônico de micro-título com espaçamento de rastreamento consistente e fundo sutil padronizado.
2. **Given** colunas contendo dados numéricos (como gramas, calorias e macronutrientes), **When** os valores são renderizados, **Then** o texto é posicionado alinhado à direita com alinhamento numérico tabular.
3. **Given** uma linha de tabela, **When** o usuário passa o cursor sobre a linha, **Then** ela exibe a transição suave para o estado de foco/hover padronizado do Design System.

---

### User Story 3 - Cabeçalho Fixo e Rolagem Integrada em Visualizações Delimitadas (Priority: P3)

Como nutricionista navegando em tabelas dentro de modais ou painéis com altura máxima delimitada, desejo que o cabeçalho das colunas permaneça fixo no topo enquanto rolo pelos dados, mantendo as colunas perfeitamente alinhadas com as células do corpo sem sobreposição ou quebra de layout.

**Why this priority**: Permite que modais de busca e tabelas compactas mantenham a usabilidade e a referência das colunas durante a rolagem de listas longas.

**Independent Test**: Abrir um modal com tabela rolável (por exemplo, busca TACO com 30 itens), rolar até o final da lista e confirmar que o cabeçalho permanece visível e com as colunas sincronizadas em largura.

**Acceptance Scenarios**:

1. **Given** uma tabela configurada com cabeçalho fixo e altura máxima, **When** o usuário rola a lista para baixo, **Then** o cabeçalho permanece visível no topo e apenas as linhas rolam verticalmente.
2. **Given** uma tabela com cabeçalho fixo, **When** as colunas possuem larguras definidas, **Then** as larguras do cabeçalho e das células do corpo permanecem perfeitamente alinhadas durante e após a rolagem.

---

### Edge Cases

- **Tabela sem registros**: Quando não houver dados, a tabela deve exibir uma linha única de estado vazio acessível com mensagem clara, ocupando toda a largura das colunas (incluindo a coluna de seleção se ativa), sem quebra de bordas.
- **Seleção com dados paginados ou filtrados**: Ao filtrar ou paginar dados, o controle de selecionar todos do cabeçalho deve calcular o estado misto/total com base exclusivamente nos itens visíveis ativos ou nos IDs controlados, sem perda de seleção prévia.
- **Seleção desabilitada por linha**: Se uma linha específica for configurada como não selecionável, o controle dessa linha deve exibir estado desabilitado acessível e não responder a cliques, sendo ignorado na contagem do selecionar todos.
- **Navegação exclusiva por teclado**: Todo controle de seleção deve ser navegável via tecla Tab e acionável via barra de Espaço/Enter, com anel de foco visível em conformidade com WCAG 2.2 AA.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE fornecer um átomo centralizado de controle de seleção (Checkbox) que implemente os estados marcado (checked), desmarcado (unchecked) e indeterminado/misto (indeterminate), com tamanho, cantos arredondados, bordas, cores e anel de foco padronizados pelo Design System.
- **FR-002**: O componente DataTable DEVE aceitar uma configuração declarativa de seleção que suporte os modos multi (múltipla seleção) e single (seleção exclusiva única).
- **FR-003**: Quando a seleção estiver habilitada, o componente DataTable DEVE posicionar automaticamente a coluna de seleção como a primeira coluna à esquerda com largura compacta fixa (w-10) e alinhamento centralizado.
- **FR-004**: No modo multi, o cabeçalho da primeira coluna DEVE renderizar o controle de seleção mestre que alterna entre selecionar todos os itens visíveis e desmarcar todos, exibindo o traço de estado indeterminado quando apenas parte dos itens estiver selecionada.
- **FR-005**: No modo single, o cabeçalho da primeira coluna NÃO DEVE exibir controle de seleção mestre, e o clique em um item deve selecionar exclusivamente aquele registro, desmarcando o anterior.
- **FR-006**: O componente DataTable DEVE suportar a opção selectOnRowClick, permitindo que o clique em qualquer ponto da linha acione a alternância da seleção do item.
- **FR-007**: As linhas selecionadas no DataTable DEVEM aplicar o atributo semântico data-state=selected e o estilo visual padronizado de fundo realçado (g-primary-soft/30).
- **FR-008**: Todos os cabeçalhos de coluna no DataTable DEVEM utilizar o estilo tipográfico canônico do Design System (	ext-style-chart-micro, maiúsculas, rastreamento aumentado, peso negrito e cor secundária de texto).
- **FR-009**: O componente DataTable DEVE suportar uma propriedade de cabeçalho fixo (stickyHeader e/ou maxHeight) que mantenha o cabeçalho visível no topo durante a rolagem interna do corpo da tabela.
- **FR-010**: A tabela de busca e seleção de alimentos (FoodSearchResultsList) e o modal de substituição (SubstituteFoodModal) DEVEM ser refatorados para consumir essa infraestrutura unificada do DataTable, eliminando duplicação de marcação de tabela e checkboxes ad-hoc.
- **FR-011**: Todas as tabelas existentes que já utilizam DataTable (Pacientes, Histórico de Consultas, Avaliações, Dietas, Catálogo de Alimentos) DEVEM continuar funcionando sem regressões visuais ou de tipo.

### Key Entities

- **TableSelectionConfig**: Configuração de seleção do DataTable contendo modo (single | multi), identificadores das linhas selecionadas (selectedRowIds), manipulador de alteração (onSelectionChange), predicado de seleção (isSelectable) e flag de clique na linha (selectOnRowClick).
- **CheckboxState**: Estado do controle de seleção (checked | unchecked | indeterminate).
- **DataTableColumnDef**: Definição tipada de coluna expandida para suportar alinhamento, estilização de cabeçalho, ordenação e largura uniforme.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das tabelas que possuem funcionalidade de seleção no sistema utilizam o mesmo átomo de seleção e a mesma configuração de seleção do DataTable.
- **SC-002**: 0 controles de seleção construídos com classes CSS inline ad-hoc presentes nos componentes de tabela da aplicação.
- **SC-003**: 100% de conformidade com navegação por teclado e anel de foco acessível (WCAG 2.2 AA) em todos os controles de seleção e cabeçalhos de tabela.
- **SC-004**: 100% dos testes unitários e de integração existentes e novos passam sem falhas (
pm test).
- **SC-005**: 0 regressões de interface nas tabelas já existentes da aplicação.

---

## Assumptions

- O escopo visual e comportamental segue estritamente o ambiente desktop a partir de 1024px, em conformidade com a Constituição do projeto.
- O componente de tabela primitivo base continua sendo @/components/ui/table, e a molécula padronizada de tabela continua sendo @/components/molecules/DataTable.
- Nenhuma biblioteca externa de tabela será introduzida no projeto; a solução é 100% nativa em React, TypeScript e Tailwind CSS.
