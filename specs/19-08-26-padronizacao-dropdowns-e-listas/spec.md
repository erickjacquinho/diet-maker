# Feature Specification: Padronização e Centralização de Dropdowns e Listas

**Feature Branch**: `specs/19-08-26-padronizacao-dropdowns-e-listas`

**Created**: 2026-08-19

**Status**: Draft


## Clarifications

### Session 2026-08-19

- Q: Qual é o formato canônico do componente pai padronizado de seleção de opções? → A: Um componente de seleção padronizado (`SelectField` / `Select`) localizado na camada canônica de componentes, aceitando `options: Array<{ value: string; label: string; disabled?: boolean }>` ou itens declarativos, com suporte nativo a `placeholder`, `value`, `onValueChange`, `size` ('compact' | 'standard'), `layer` ('dropdown' | 'modal') e `label`/`error` opcionais, encapsulando os primitivos Radix UI.
- Q: Como tratar menus de ação suspensa (context menus / action dropdowns) em relação aos selects de valor? → A: O componente pai padronizado de seleção atende campos de formulário/filtro (Select), enquanto o menu suspenso de comandos (DropdownMenu / ActionDropdown) atende ações como o botão 'Mais ações' da tela de prescrição, ambos utilizando as receitas e tokens canônicos do design system sem estilos inline.
- Q: Como eliminar listas inline suspensas espalhadas (ex: autocomplete em CreateRecipeModal)? → A: Componentes que renderizavam listas flutuantes manuais com `div absolute` devem utilizar os componentes padronizados de overlay/popover do design system, garantindo que nenhuma lista possua estilização ad-hoc.


### User Story 1 - Seleção Consistente em Formulários e Modais Clínicos (Priority: P1)

Como nutricionista utilizando o sistema em telas de cadastro e edição (pacientes, dietas, alimentos, receitas, presets e acompanhamentos), desejo que todos os campos de seleção apresentem a mesma interface visual, posicionamento, acessibilidade por teclado e comportamento de abertura, para que a experiência de preenchimento seja fluida, previsível e sem falhas de layout.

**Why this priority**: É o ponto de maior contato diário do profissional. Formulários fragmentados com diferentes comportamentos e estilos geram erros de usabilidade e retrabalho na manutenção.

**Independent Test**: Abrir cada modal/tela do sistema (Criar Paciente, Editar Paciente, Criar Preset, Criar Receita, Alimento Customizado, Próximo Acompanhamento, Copiar Variação de Dieta, Filtros de Alimentos), interagir com todos os dropdowns via clique e teclado (Tab, Setas, Enter, Esc), confirmando abertura, seleção de item e fechamento determinístico.

**Acceptance Scenarios**:
1. **Given** que o usuário está no modal de cadastro ou edição de paciente, **When** clica no campo de gênero ou objetivo clínico, **Then** o menu de opções abre alinhado ao campo, exibe opções formatadas pelo design system e aplica o item selecionado.
2. **Given** que o usuário está navegando por teclado (Tab), **When** foca um dropdown e pressiona Enter/Espaço/Setas, **Then** a lista de opções se abre com foco visual acessível e permite selecionar a opção desejada com Enter.
3. **Given** que um dropdown está aberto dentro de um modal com rolagem, **When** o usuário rola o conteúdo ou seleciona uma opção, **Then** o menu respeita a camada de elevação correta, não é cortado pelo container e não sofre sobreposição indevida.

---

### User Story 2 - Menus de Ações e Listas de Opções Padronizadas (Priority: P2)

Como usuário navegando pelas páginas de elaboração de dieta, listagens e tabelas, desejo que botões de ações contextuais e menus suspensos (ex: menu de mais ações na elaboração de dieta, exportação e compartilhamento) utilizem o mesmo padrão unificado de menu dropdown, garantindo clareza visual e facilidade de manutenção centralizada.

**Why this priority**: Evita que telas de workflow criem menus ad-hoc com estilos dispersos, garantindo consistência no fluxo de prescrição e exportação.

**Independent Test**: Acessar a tela de elaboração de dieta, abrir o menu "Mais ações", verificar se as ações (WhatsApp, PDF) são acionadas corretamente e se a aparência segue a mesma identidade dos demais menus da plataforma.

**Acceptance Scenarios**:
1. **Given** que o usuário está na tela de prescrição nutricional, **When** clica em "Mais ações", **Then** o menu suspenso abre com opções padronizadas, ícones e espaçamentos canônicos.
2. **Given** que o usuário seleciona uma ação no menu suspenso, **When** a ação é disparada, **Then** o menu fecha automaticamente e executa a operação esperada (ex: modal de WhatsApp ou geração de PDF).

---

### User Story 3 - Eliminação de Estilos Hardcoded e Listas Descentralizadas (Priority: P3)

Como mantenedor e desenvolvedor do sistema, desejo que nenhum componente de tela ou modal contenha estruturas de listas suspensas inline, styles inline ou classes ad-hoc de dropdown, garantindo que qualquer alteração de tema, token ou comportamento de lista reflita imediatamente em todo o produto.

**Why this priority**: Garante governança arquitetural, reduz código duplicado e blinda o projeto contra regressões visuais em manutenções futuras.

**Independent Test**: Executar auditoria estática e testes de componentes garantindo que todos os formulários e telas consomem o componente pai padronizado de seleção/dropdown sem estilos hardcoded ou estruturas repetidas de menu.

**Acceptance Scenarios**:
1. **Given** a árvore de componentes da aplicação, **When** inspecionados os modais e cabeçalhos de filtros, **Then** todos utilizam a abstração centralizada de seleção/dropdown em vez de implementar estruturas customizadas de lista.
2. **Given** qualquer componente de lista/seleção no produto, **When** verificado seu código, **Then** não existem estilos inline (`style={{ ... }}`) nem classes de dropdown fora dos tokens canônicos do design system.

---

### Edge Cases

- **Lista com muitas opções**: Quando a lista de itens ultrapassa a altura da viewport, o menu deve exibir rolagem vertical suave sem vazar da tela nem quebrar o foco.
- **Opções dinâmicas / customizadas**: Em listas que recebem novos itens em tempo de execução (ex: objetivos clínicos adicionados dinamicamente no perfil do paciente), o componente deve atualizar a lista de itens preservando o item atualmente selecionado.
- **Campos desabilitados ou em carregamento**: Quando o controle estiver desabilitado, deve impedir interação via clique e teclado, sinalizando visualmente o estado desabilitado de acordo com o design system.
- **Seleção vazia / Placeholder**: Quando nenhum valor estiver selecionado, o componente deve exibir o placeholder sem distorção visual e permitir selecionar a primeira opção válida.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE fornecer um componente pai padronizado para seleção de opções (Dropdown/Select) que encapsula gatilho (trigger), lista de opções (popover/content), indicador de seleção e estados visuais.
- **FR-002**: Todos os modais de formulário do sistema (Criar Paciente, Editar Paciente, Criar Preset, Criar Receita, Alimento Customizado, Próximo Acompanhamento, Copiar Variações) DEVEM consumir o componente pai padronizado de seleção para todos os seus campos seletivos.
- **FR-003**: Os cabeçalhos de filtragem e páginas com seletores (ex: Base TACO / `FoodFilterHeader`) DEVEM consumir o componente pai padronizado de seleção para filtros de categoria, preparo e presets de macros.
- **FR-004**: O sistema DEVE fornecer padronização para menus de ações suspensas (Action Dropdown) para centralizar itens de ação (como menu de ações no `DietBuilderTemplate`).
- **FR-005**: O componente pai de seleção DEVE suportar especificação de itens por lista estruturada de dados (`options: Array<{ value, label, icon?, disabled? }>`) ou composição controlada padronizada, eliminando marcação repetitiva dispersa.
- **FR-006**: O componente pai DEVE suportar contextualização de camada de elevação (ex: abertura dentro de modais vs superfícies de página) de forma automática ou via propriedade semântica padronizada, garantindo que o menu nunca fique oculto atrás de overlays.
- **FR-007**: Nenhum componente de formulário, modal ou tela DEVE declarar listas suspensas customizadas via tags soltas (`div absolute`, etc.) ou aplicar estilos inline (`style={...}`) para construção de dropdowns.
- **FR-008**: Todos os componentes de seleção DEVEM suportar acessibilidade completa (navegação por teclado com Tab, Setas Cima/Baixo, Enter, Espaço, Escape e atributos acessíveis `role="combobox"` / `aria-expanded`).

### Key Entities *(include if feature involves data)*

- **SelectOption**: Representa um item selecionável contendo identificador/valor (`value`), rótulo descritivo (`label`), ícone opcional (`icon`), e indicador de desabilitação (`disabled`).
- **DropdownActionItem**: Representa uma ação acionável em menu de contexto contendo rótulo (`label`), ícone (`icon`), manipulador de clique (`onSelect`) e variante semântica opcional (padrão ou destrutiva).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos dropdowns e selects de formulários do projeto (8 modais e cabeçalhos de filtro mapeados) convertidos para o componente pai padronizado.
- **SC-002**: 0 ocorrências de listas de dropdown construídas de forma inline/ad-hoc ou com hardcode de estilos nas telas da aplicação.
- **SC-003**: 100% dos testes unitários e de integração existentes e novos passando sem regressão visual ou funcional.
- **SC-004**: Tempo de navegação e seleção por teclado em qualquer formulário executável em menos de 2 segundos por campo sem travamentos de foco.

## Assumptions

- O projeto opera na arquitetura Atomic Design com base em React e TypeScript, respeitando a constituição do projeto.
- Primitivos acessíveis baseados em Radix UI continuam na camada `src/components/ui/`, enquanto o componente pai padronizado de consumo fica situado na camada canônica adequada (`atoms` / `molecules`).
- O escopo é estritamente desktop (>= 1024px) conforme a Constituição do NutriDiet Local Pro.
