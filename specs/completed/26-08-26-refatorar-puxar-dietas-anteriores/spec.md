# Feature Specification: Refatoração do botão Puxar Metas Anteriores com Modal de Seleção de Dietas

**Feature Branch**: 26-08-26-refatorar-puxar-dietas-anteriores

**Created**: 2026-08-26

**Status**: Draft

**Input**: User description: em /dieta/nova no botao vamos refatorar o botao Puxar Metas Anteriores. quero um botao que leve a um modal em que haja uma tabela de selecao das dietas anteriores. abaixo dela haverao dois botoes: um botao para puxar apenas os macros e outro botao para puxar todas as refeicoes (nao é editar a dieta, é duplicar para uma nova dieta e assim alterar para uma nova variaçao). caso nao hajam dietas anteriores, o botao deve estar desabilitado.

## Contexto e Objetivo

Na tela de criação de uma nova dieta (/dieta/nova ou /pacientes/[id]/dieta/nova), o nutricionista conta atualmente com um botão de ação rápida chamado \'Puxar Metas Anteriores\' que busca automaticamente apenas os valores de macronutrientes da última dieta do paciente.

O objetivo desta refatoração é transformar essa interação em um fluxo controlado via modal:
1. O botão principal permite ao nutricionista visualizar e selecionar qualquer dieta anterior do histórico do paciente através de uma tabela clara.
2. Fornecer duas ações explícitas para a dieta selecionada:
   - **Puxar apenas os macros**: importa apenas os alvos de macronutrientes (proteínas, carboidratos, gorduras e calorias) para a nova dieta, mantendo as refeições vazias/intactas.
   - **Puxar todas as refeições**: duplica integralmente a estrutura da dieta anterior (modo, alvos e todas as refeições com seus alimentos e gramaturas) para a nova dieta em elaboração, permitindo criar uma nova variação ou plano derivado sem modificar a dieta histórica de origem.
3. Desabilitar o botão de acionamento quando o paciente não possuir histórico de dietas cadastradas.

## Clarifications

### Session 2026-08-26
- Q: Qual o comportamento ao acionar \'Puxar todas as refeições\' caso haja refeições parciais já adicionadas no rascunho de /dieta/nova? → A: Substituir o rascunho atual pela composição integral da dieta anterior selecionada, garantindo duplicação limpa e fiel.
- Q: Como tratar dietas no modo Ciclo de Carboidratos na duplicação? → A: Ao puxar apenas macros, importa os alvos da variação ativa; ao puxar todas as refeições, duplica o modo completo com todas as variações e refeições associadas.
- Q: Qual deve ser o rótulo do botão principal na interface? → A: Manter o botão na barra de ações de metas com o rótulo \'Puxar Metas Anteriores\' (ou \'Puxar Dieta Anterior\') e ícone de histórico, permanecendo desabilitado com tooltip quando não houver dietas anteriores.

## User Scenarios & Testing

### User Story 1 - Puxar apenas macros de uma dieta anterior selecionada (Priority: P1)

Como nutricionista elaborando uma nova dieta para um paciente, quero selecionar uma dieta específica do histórico e importar apenas seus alvos nutricionais (calorias e macros), para manter a mesma meta daquele período sem herdar as refeições antigas.

**Why this priority**: É a evolução direta do comportamento existente, garantindo precisão na escolha de qual dieta de referência utilizar quando o paciente possui múltiplos planos anteriores.

**Independent Test**: Em /dieta/nova de um paciente com mais de uma dieta no histórico, clicar no botão de dietas anteriores, selecionar uma dieta específica na tabela do modal, clicar em \'Puxar apenas os macros\' e confirmar que os cards de macronutrientes foram atualizados com os valores daquela dieta selecionada enquanto a lista de refeições permanece inalterada.

**Acceptance Scenarios**:

1. **Given** o nutricionista na tela de criação de nova dieta com paciente que possui dietas anteriores, **When** visualiza a barra de ações de metas, **Then** o botão \'Puxar Metas Anteriores\' (ou \'Puxar Dieta Anterior\') está habilitado.
2. **Given** o modal de seleção aberto, **When** o nutricionista visualiza a tabela, **Then** são exibidas as dietas anteriores com data, nome, calorias, macros e quantidade de refeições, ordenadas da mais recente para a mais antiga.
3. **Given** uma dieta selecionada na tabela, **When** o nutricionista clica em \'Puxar apenas os macros\', **Then** as metas da nova dieta recebem as calorias e macronutrientes da dieta escolhida, o modal é fechado e uma notificação de sucesso é exibida.
4. **Given** o modal aberto mas nenhuma dieta selecionada na tabela, **When** o nutricionista observa os botões de ação abaixo da tabela, **Then** ambos os botões (macros e refeições) permanecem desabilitados até que uma linha seja selecionada.

---

### User Story 2 - Puxar todas as refeições e duplicar para uma nova dieta (Priority: P1)

Como nutricionista, quero selecionar uma dieta anterior e puxar todas as suas refeições para a nova dieta, para criar uma nova variação ou ajuste do plano sem precisar cadastrar todas as refeições e alimentos novamente do zero e sem alterar a dieta histórica original.

**Why this priority**: Duplicação de planos é a funcionalidade mais produtiva para o fluxo de reconsulta e ajustes periódicos de pacientes recorrentes.

**Independent Test**: Selecionar uma dieta com 4 refeições cadastradas no modal, clicar em \'Puxar todas as refeições\', e verificar que a tela /dieta/nova foi populada com as 4 refeições, seus alimentos, quantidades e macros, permanecendo com status e identificador de novo plano (id: nova), sem alterar a dieta salva no histórico.

**Acceptance Scenarios**:

1. **Given** uma dieta anterior selecionada no modal contendo refeições cadastradas, **When** o nutricionista clica em \'Puxar todas as refeições\', **Then** todas as refeições, alimentos, gramaturas, metas e modo da dieta selecionada são carregados na nova dieta.
2. **Given** a importação de todas as refeições concluída, **When** o nutricionista verifica o estado da página, **Then** a dieta atual continua sendo uma nova dieta (dietaId === \'nova\'), pronta para edição e salvamento sob um novo ID, sem sobrescrever a dieta original.
3. **Given** a nova dieta com refeições já preenchidas manualmente antes de abrir o modal, **When** o nutricionista escolhe \'Puxar todas as refeições\', **Then** o sistema substitui as refeições do rascunho atual pela composição completa da dieta selecionada, emitindo feedback de sucesso.

---

### User Story 3 - Estado desabilitado quando não existem dietas anteriores (Priority: P2)

Como nutricionista atendendo um paciente novo sem histórico prévio de dietas, quero que o botão de puxar dietas anteriores fique visualmente desabilitado, para que eu saiba de imediato que não há histórico disponível para importação.

**Why this priority**: Evita frustração e cliques desnecessários em pacientes sem histórico cadastrado.

**Independent Test**: Acessar /dieta/nova para um paciente recém-criado sem dietas no histórico e verificar que o botão está em estado desabilitado (disabled) e não dispara abertura de modal.

**Acceptance Scenarios**:

1. **Given** um paciente com 0 dietas no histórico, **When** a tela /dieta/nova é carregada, **Then** o botão de puxar dietas/metas anteriores está com propriedade disabled ativa e estilo condizente no design system.
2. **Given** o botão em estado desabilitado, **When** o usuário clica ou tenta interagir com ele via teclado/mouse, **Then** nenhum modal é aberto e nenhuma ação é disparada.

---

### Edge Cases

- **Paciente com apenas uma dieta anterior**: A tabela exibe uma única linha; o usuário pode selecioná-la normalmente para importar macros ou refeições.
- **Dieta anterior no modo Ciclo de Carboidratos**: Ao puxar apenas macros de uma dieta de ciclo, os alvos da variação ativa são importados; ao puxar todas as refeições, o plano completo com suas variações e dias de ciclo é duplicado para a nova dieta.
- **Dieta anterior sem alimentos cadastrados (somente metas)**: Ao acionar \'Puxar todas as refeições\', as metas são importadas e a lista de refeições fica vazia, sem gerar erros de execução.
- **Cancelamento e fechamento**: Clicar em fechar (X), cancelar ou fora do modal não aplica nenhuma alteração ao rascunho da nova dieta.
- **Conexão e isolamento de estado**: A duplicação clona profundamente os objetos de refeições e alimentos gerando novos IDs para os itens e refeições, prevenindo mutações acidentais na referência original em memória ou cache.

## Requirements

### Functional Requirements

- **FR-001**: O botão na página de criação de dieta (/dieta/nova) MUST disparar a abertura do modal de seleção de dietas anteriores quando houver ao menos uma dieta no histórico do paciente.
- **FR-002**: O botão MUST estar desabilitado (disabled={true}) caso o paciente não possua nenhuma dieta anterior cadastrada no armazenamento (dietHistory e getPatientDietsFromStorage).
- **FR-003**: O modal MUST conter uma tabela de listagem das dietas anteriores do paciente, permitindo a seleção de uma única dieta por vez (seleção exclusiva).
- **FR-004**: A tabela do modal MUST exibir para cada dieta: Data de prescrição/criação, Nome do plano, Modo (Simples ou Ciclo de Carboidratos), Calorias totais (kcal), Macronutrientes (Proteínas, Carboidratos, Gorduras) e Quantidade de refeições.
- **FR-005**: A tabela MUST ordenar as dietas da mais recente para a mais antiga por padrão.
- **FR-006**: O modal MUST apresentar, abaixo da tabela de seleção, dois botões de ação:
  - Botão 1: \'Puxar apenas os macros\'
  - Botão 2: \'Puxar todas as refeições\'
- **FR-007**: Os dois botões de ação MUST permanecer desabilitados enquanto nenhuma linha/dieta da tabela estiver selecionada.
- **FR-008**: Ao clicar em \'Puxar apenas os macros\', o sistema MUST copiar unicamente os alvos de proteínas, carboidratos, gorduras e calorias da dieta selecionada para o rascunho da nova dieta, mantendo as refeições atuais inalteradas.
- **FR-009**: Ao clicar em \'Puxar todas as refeições\', o sistema MUST clonar de forma profunda todas as refeições, alimentos (com gramaturas e macros), metas e modo da dieta selecionada para a nova dieta em elaboração (dietaId: \'nova\').
- **FR-010**: A ação de \'Puxar todas as refeições\' MUST garantir que a dieta continue sendo uma nova dieta (novo ID a ser gerado ao salvar) e MUST NOT modificar nem sobrescrever o registro histórico original da dieta de origem.
- **FR-011**: Ao confirmar qualquer uma das duas ações, o modal MUST ser fechado e uma notificação de sucesso (toast) MUST informar ao usuário o resultado da importação.
- **FR-012**: O modal MUST conter botão de fechamento/cancelamento acessível e responder à tecla Escape.
- **FR-013**: Toda a interface do modal e da tabela MUST seguir o Design System canônico (design-system/README.md), princípios de Atomic Design (Molecule/Organism) e acessibilidade desktop WCAG 2.2 AA (foco visível, navegação por teclado, contraste).

### Key Entities

- **Plano Alimentar Anterior (FullDietPlan / HistoricalDiet)**: Registro existente no histórico do paciente contendo identificador, nome, data, modo, metas nutricionais e lista de refeições.
- **Rascunho de Nova Dieta (dietaId: 'nova')**: Estado local em edição no construtor de dietas que receberá os dados importados (macros ou refeições completas).
- **Seleção de Dieta**: Estado do modal que armazena a dieta atualmente selecionada na tabela antes da confirmação da ação.

## Success Criteria

### Measurable Outcomes

- **SC-001**: O nutricionista consegue visualizar a lista completa de dietas anteriores do paciente e selecionar qualquer uma delas em menos de 2 cliques.
- **SC-002**: A importação de macros copia 100% dos valores de meta (proteínas, carboidratos, gorduras e calorias) com exatidão matemática, sem alterar refeições.
- **SC-003**: A duplicação de refeições transfere 100% dos alimentos, gramaturas, horários e nomes de refeições para a nova dieta mantendo isolamento total do registro de origem.
- **SC-004**: Para pacientes sem dietas prévias, o botão é renderizado inativo e inacessível a cliques em 100% dos acessos.
- **SC-005**: Todas as interações do modal (abrir, navegar na tabela, selecionar linha, acionar botões, fechar via teclado/Escape) atendem aos requisitos de acessibilidade sem erros de foco ou perda de estado.

## Assumptions

- O paciente selecionado está carregado no contexto do DietBuilderPage (patientId).
- As dietas anteriores são obtidas a partir do getPatientDietsFromStorage(patientId) e do patient.dietHistory.
- A duplicação de refeições para uma nova dieta gera novas instâncias com identificadores únicos para as refeições e alimentos no momento da importação ou salvamento para evitar colisões de chaves.
- A tela permanece restrita ao escopo desktop (>=1024px) conforme a Constituição do projeto.
