# Feature Specification: Reorganização do cabeçalho da criação de dieta

**Feature Branch**: `05-08-26-reorganizar-cabecalho-nova-dieta`

**Created**: 2026-08-05

**Status**: Draft — derivado da especificação visual aprovada

**Input**: User description: "Criar um SDD a partir de docs/superpowers/specs/2026-08-05-diet-builder-header-design.md para reorganizar o cabeçalho e a distribuição de ações da tela de criação de nova dieta, reutilizando a estrutura da tela do paciente e componentes existentes. O SDD deve encerrar antes da implementação."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entender o contexto e retornar ao prontuário (Priority: P1)

Como nutricionista, quero identificar imediatamente que estou elaborando um plano alimentar e saber como voltar ao prontuário do paciente, para não perder o contexto da tarefa nem depender de um cabeçalho visualmente confuso.

**Why this priority**: Orientação e retorno são fundamentais para qualquer fluxo profundo e devem ser resolvidos antes das ações de edição.

**Independent Test**: Abrir a tela de criação de dieta em um desktop suportado e verificar que o primeiro bloco apresenta retorno, contexto e título em uma ordem de leitura previsível.

**Acceptance Scenarios**:

1. **Given** o nutricionista está na tela de criação de uma dieta, **When** a tela é carregada, **Then** o topo apresenta um retorno ao prontuário, um contexto curto e o título principal da tarefa.
2. **Given** o nutricionista está na tela de criação de uma dieta, **When** seleciona o controle de retorno, **Then** retorna ao prontuário do mesmo paciente preservando a navegação esperada.
3. **Given** o nome do paciente é longo, **When** a tela é carregada, **Then** o título, o retorno e a ação principal continuam legíveis e não se sobrepõem.

### User Story 2 - Salvar a prescrição sem competir com ações secundárias (Priority: P1)

Como nutricionista, quero encontrar uma única ação primária de salvamento em posição previsível, para concluir a prescrição sem confundi-la com compartilhamento, exportação ou ajustes auxiliares.

**Why this priority**: Salvar é o desfecho principal da tela; sua posição e destaque devem orientar todo o restante da hierarquia.

**Independent Test**: Abrir a tela com uma dieta em edição, localizar a ação de salvar no cabeçalho e confirmar que ela executa o mesmo salvamento existente.

**Acceptance Scenarios**:

1. **Given** a tela de criação de dieta está carregada, **When** o nutricionista observa o cabeçalho, **Then** existe somente uma ação com destaque primário e ela é "Salvar Prescrição".
2. **Given** o nutricionista aciona "Salvar Prescrição", **When** o salvamento é concluído, **Then** o comportamento existente de persistência e feedback permanece inalterado.
3. **Given** a tela contém ações auxiliares, **When** o cabeçalho é observado, **Then** Nova Refeição, Escalar, WhatsApp e PDF não aparecem como um grupo concorrente ao salvamento.

### User Story 3 - Escolher o modelo e revisar o contexto do paciente (Priority: P1)

Como nutricionista, quero escolher entre dieta simples e ciclo de carboidratos antes de revisar as metas do paciente, para entender o modelo de prescrição antes de editar os detalhes.

**Why this priority**: O modelo da dieta determina a forma de trabalho e deve aparecer antes das métricas e refeições, sem esconder opções avançadas quando o ciclo é selecionado.

**Independent Test**: Abrir a tela nos modos simples e ciclo de carboidratos, confirmar a ordem dos blocos e verificar que as opções do ciclo só aparecem quando aplicáveis.

**Acceptance Scenarios**:

1. **Given** o modo simples está selecionado, **When** o nutricionista observa o fluxo, **Then** o seletor aparece de forma compacta antes do contexto de metas e sem controles de ciclo desnecessários.
2. **Given** o nutricionista seleciona ciclo de carboidratos, **When** a seleção é aplicada, **Then** as opções de quantidade de variações, dias e cópia entre variações aparecem progressivamente dentro do mesmo contexto.
3. **Given** o contexto do paciente é exibido, **When** o nutricionista revisa a tela, **Then** nome, peso, objetivo e métricas continuam agrupados e o paciente não é repetido em cabeçalhos concorrentes.
4. **Given** o nutricionista precisa ajustar metas ou escalar a dieta, **When** procura essas ações, **Then** Ajustar Metas e Escalar aparecem junto da região de metas/macros, não no cabeçalho global.

### User Story 4 - Trabalhar com refeições e ações de saída no lugar certo (Priority: P2)

Como nutricionista, quero encontrar as ações de refeições junto da seção de refeições e compartilhar/exportar em um agrupamento secundário, para executar cada comando no contexto correto e manter o topo limpo.

**Why this priority**: Essas ações continuam importantes, mas não devem interromper a orientação nem disputar o foco com o salvamento.

**Independent Test**: Abrir a tela com e sem refeições, localizar Nova Refeição na seção correspondente e acessar WhatsApp/PDF por uma ação secundária identificável.

**Acceptance Scenarios**:

1. **Given** existem refeições na dieta, **When** o nutricionista observa a seção de refeições, **Then** o título e a ação Nova Refeição aparecem juntos no cabeçalho da seção.
2. **Given** não existem refeições na dieta, **When** o estado vazio é exibido, **Then** a mensagem orienta a próxima ação sem criar uma segunda CTA concorrente.
3. **Given** o nutricionista abre as ações secundárias, **When** seleciona WhatsApp ou PDF, **Then** o callback existente correspondente é executado.
4. **Given** nenhuma ação secundária está aberta, **When** o nutricionista navega por teclado, **Then** o foco percorre os controles na ordem visual sem depender de hover.

### Edge Cases

- Quando a largura disponível estiver na faixa desktop mínima de 1024px, o cabeçalho deve reorganizar o espaço sem sobreposição, ocultar ações essenciais ou criar uma experiência mobile.
- Quando o modo de ciclo de carboidratos estiver ativo e houver duas ou três variações, os controles devem permanecer identificáveis e a seleção ativa deve continuar evidente.
- Quando a dieta estiver vazia, a seção de refeições deve manter um único caminho claro para adicionar a primeira refeição.
- Quando uma ação opcional não estiver disponível, sua ausência não deve criar um espaço vazio que pareça um controle quebrado.
- Quando o menu de ações secundárias estiver aberto e o nutricionista pressionar Escape ou clicar fora, o menu deve fechar e devolver o foco ao acionador.
- Quando o salvamento falhar, o feedback existente deve permanecer compreensível e o rearranjo visual não deve apagar os dados ou esconder o caminho de recuperação.
- Quando o paciente ou o objetivo tiver texto longo, títulos e ações devem quebrar ou redistribuir espaço sem truncar o contexto essencial.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A tela deve apresentar a navegação, o contexto da página e o título da tarefa antes dos blocos de seleção, metas e refeições.
- **FR-002**: O retorno deve levar ao prontuário do paciente atualmente aberto e manter uma apresentação visual consistente com a tela de perfil do paciente.
- **FR-003**: O cabeçalho deve apresentar apenas uma ação primária, denominada "Salvar Prescrição".
- **FR-004**: Nova Refeição deve estar posicionada na seção de refeições e não no grupo de ações do cabeçalho global.
- **FR-005**: Escalar e Ajustar Metas devem estar associados visualmente à região de metas/macros.
- **FR-006**: WhatsApp e PDF devem continuar disponíveis por uma ação secundária agrupada e identificável, sem alterar os comportamentos existentes.
- **FR-007**: O seletor de modo deve permitir a escolha entre dieta simples e ciclo de carboidratos antes da apresentação das metas e refeições.
- **FR-008**: Ao selecionar ciclo de carboidratos, a tela deve revelar progressivamente os controles de variações, dias e cópia entre variações dentro do mesmo contexto de seleção.
- **FR-009**: O contexto do paciente deve permanecer visível em uma única região principal, sem duplicação de nome em cabeçalhos concorrentes.
- **FR-010**: A tela deve manter o comportamento existente de salvar, alternar modo, ajustar metas, escalar, compartilhar, exportar, adicionar refeição e manipular refeições.
- **FR-011**: Todos os controles interativos devem possuir nome acessível, foco visível, operação por teclado e estados compreensíveis, conforme WCAG 2.2 AA.
- **FR-012**: A ordem visual e a ordem de leitura devem seguir a mesma sequência: navegação e título; modelo da dieta; contexto e metas; refeições.
- **FR-013**: A solução deve reutilizar componentes, ícones, tokens, espaçamentos e padrões já existentes no produto sempre que forem suficientes para cumprir os requisitos.
- **FR-014**: A solução deve permanecer dentro do escopo desktop a partir de 1024px, sem criar variantes específicas para mobile ou tablet.
- **FR-015**: O estado vazio de refeições deve oferecer uma orientação clara e um único caminho principal para criar a primeira refeição.

### Key Entities

- **Sessão de elaboração da dieta**: contexto de trabalho do nutricionista, com paciente, modo de dieta, metas, variações e refeições em edição.
- **Contexto do paciente**: identificação, peso, objetivo e métricas que orientam a prescrição atual.
- **Modo da dieta**: escolha persistida entre dieta simples e ciclo de carboidratos, com controles condicionais de variações.
- **Ação da tela**: comando de navegação, salvamento, ajuste, escala, refeição, compartilhamento ou exportação, com prioridade e região visual próprias.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em uma avaliação com cinco cenários representativos, o nutricionista identifica o retorno, o título e a ação de salvar em até 5 segundos.
- **SC-002**: Em uma avaliação com cinco cenários representativos, o nutricionista localiza corretamente o modo da dieta antes das metas e refeições em pelo menos 90% das tentativas.
- **SC-003**: O cabeçalho exibe no máximo uma ação primária e não exibe simultaneamente Nova Refeição, Escalar, WhatsApp e PDF como ações do mesmo grupo visual.
- **SC-004**: Todas as ações existentes continuam executáveis após a reorganização, sem perda de callback ou mudança de resultado observável.
- **SC-005**: Nos estados simples, ciclo de carboidratos e refeições vazias, nenhum controle essencial fica sobreposto, oculto ou sem nome compreensível na faixa desktop de 1024px ou mais.
- **SC-006**: Em uma avaliação de teclado, 100% dos controles do fluxo podem ser alcançados e operados em ordem de leitura, com foco visível e fechamento previsível de ações secundárias.
- **SC-007**: Em uma revisão visual comparativa, o cabeçalho da dieta usa a mesma lógica de navegação, espaçamento e hierarquia da tela de paciente, sem introduzir um padrão visual concorrente.

## Assumptions

- O usuário principal é um nutricionista trabalhando no fluxo desktop do NutriDiet.
- O produto continuará sendo web desktop a partir de 1024px; mobile, tablet e dark mode estão fora do escopo.
- O fluxo atual de persistência, cálculos, modais e callbacks é a fonte de verdade e não será substituído por novos comportamentos.
- O contexto do paciente já é exibido pelo fluxo de metas/macros e não precisa ser duplicado no título da página.
- A ausência de uma ação opcional significa que o controle não precisa ser exibido; não será criado um placeholder visual.
- O estado vazio de refeições pode usar a orientação existente, desde que não crie uma segunda CTA concorrente com a ação da seção.
- A implementação deve respeitar a hierarquia Atomic Design, o Design System canônico e a exigência do projeto de executar planos aprovados via `/speckit-implement`.
- Nenhum dado novo, integração externa, migração de persistência ou regra nutricional é necessário para esta mudança.

