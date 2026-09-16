# Feature Specification: Reordenar refeições e corrigir criação no ciclo

**Feature Branch**: `20260916-042528-reorder-meals`

**Created**: 2026-09-16

**Status**: Approved

**Input**: User description: "Adicionar um botão Reordenar na seção Refeições, permitir reorganizar cards de refeições em um modal com confirmação/descarte, e corrigir a criação de refeições no modo ciclo de carboidratos."

## User Scenarios & Testing

### User Story 1 - Reordenar refeições da variação ativa (Priority: P1)

Como nutricionista, quero reorganizar as refeições da dieta para ajustar a sequência do plano sem editar cada refeição individualmente.

**Why this priority**: A ordem das refeições é parte essencial da prescrição e atualmente não pode ser ajustada quando o plano já está preenchido.

**Independent Test**: Com pelo menos duas refeições, abrir o modal, mudar a ordem, confirmar e verificar que a lista principal exibe a nova sequência.

**Acceptance Scenarios**:

1. **Given** a dieta possui duas ou mais refeições, **When** o usuário clica em **Reordenar**, **Then** um modal exibe um card resumido para cada refeição na ordem atual.
2. **Given** o modal está aberto, **When** o usuário arrasta um card inteiro para outra posição ou usa o teclado para movê-lo, **Then** a nova posição é refletida no modal sem alterar ainda a lista principal.
3. **Given** a ordem foi alterada, **When** o usuário confirma, **Then** a lista principal passa a exibir a ordem confirmada.
4. **Given** a dieta está no modo ciclo de carboidratos, **When** o usuário confirma a nova ordem, **Then** somente a variação ativa é alterada e as demais preservam sua sequência.

### User Story 2 - Consultar o resumo das refeições durante a reordenação (Priority: P2)

Como nutricionista, quero consultar rapidamente os macros, calorias e alimentos de cada refeição enquanto decido a nova ordem.

**Why this priority**: A ordem deve ser decidida com contexto nutricional suficiente, sem sair do fluxo ou abrir a edição completa da refeição.

**Independent Test**: Abrir o modal com refeições preenchidas, verificar a segunda linha de resumo e passar o cursor ou foco pela badge de itens.

**Acceptance Scenarios**:

1. **Given** um card de refeição está no modal, **When** o usuário o visualiza, **Then** o card mostra proteína, carboidrato, gordura e calorias.
2. **Given** a refeição possui alimentos, **When** o usuário passa o cursor ou posiciona o foco na badge de quantidade, **Then** aparece uma lista com nome, quantidade e macros/calorias de cada alimento.
3. **Given** a refeição não possui alimentos, **When** o card é exibido, **Then** a badge indica zero itens e o tooltip informa que não há alimentos prescritos.

### User Story 3 - Criar refeição no ciclo de carboidratos (Priority: P1)

Como nutricionista, quero que o botão **Nova Refeição** crie a refeição na variação de carboidratos que estou editando, para continuar preenchendo o plano normalmente.

**Why this priority**: Sem essa correção, o editor não permite iniciar ou ampliar a prescrição em uma variação ativa.

**Independent Test**: Ativar uma variação de ciclo, clicar em **Nova Refeição**, verificar a nova refeição na lista e confirmar que ela pertence à variação ativa.

**Acceptance Scenarios**:

1. **Given** uma variação de ciclo está ativa, **When** o usuário clica em **Nova Refeição**, **Then** uma nova refeição aparece na lista dessa variação e o fluxo de inclusão de alimentos é aberto para ela.
2. **Given** uma variação de ciclo está ativa, **When** uma refeição é criada, **Then** as outras variações não recebem essa refeição.
3. **Given** uma dieta simples está ativa, **When** o usuário clica em **Nova Refeição**, **Then** o comportamento atual da dieta simples continua funcionando.

### Edge Cases

- Com zero ou uma refeição, o controle **Reordenar** não aparece porque não há uma ordem útil para alterar.
- Fechar o modal por clique fora, `Esc` ou pelo botão de fechar sem mover nenhum card apenas encerra o modal.
- Fechar o modal após uma mudança abre uma confirmação; cancelar mantém a edição temporária e descartar restaura a ordem original.
- Confirmar uma ordem sem mudança não cria uma atualização desnecessária.
- Uma tentativa de mover o primeiro item para cima ou o último para baixo mantém a posição e não perde itens.
- A criação repetida de refeições gera entradas distintas e não sobrescreve refeições existentes.

## Requirements

### Functional Requirements

- **FR-001**: O sistema MUST exibir o botão **Reordenar** alinhado à direita do título **Refeições** quando houver pelo menos duas refeições.
- **FR-002**: O sistema MUST abrir um modal com um card para cada refeição da variação ativa.
- **FR-003**: Cada card MUST permitir reordenação por arraste do card inteiro e por operação equivalente via teclado.
- **FR-004**: Cada card MUST exibir nome, macros na ordem proteína → carboidrato → gordura, calorias e quantidade de itens.
- **FR-005**: A badge de quantidade MUST oferecer uma descrição acessível com todos os alimentos da refeição, suas quantidades e seus macros/calorias.
- **FR-006**: O sistema MUST manter a ordem alterada apenas como edição temporária até o usuário confirmar.
- **FR-007**: O sistema MUST fechar diretamente o modal quando não houver alterações e MUST pedir confirmação quando houver alterações e o usuário tentar sair.
- **FR-008**: Descartar MUST restaurar a ordem que existia ao abrir o modal; confirmar MUST aplicar a nova ordem.
- **FR-009**: No ciclo de carboidratos, confirmar uma reordenação MUST alterar somente a variação ativa.
- **FR-010**: Clicar em **Nova Refeição** no ciclo de carboidratos MUST criar a refeição na variação ativa e disponibilizar o fluxo de inclusão de alimentos para ela.
- **FR-011**: A criação de uma refeição MUST preservar as refeições existentes e criar uma entrada distinta para cada novo clique aceito.
- **FR-012**: O fluxo MUST manter foco visível, retorno de foco, operação por teclado e nomes acessíveis para controles e overlays.
- **FR-013**: A ordenação dos alimentos dentro de uma refeição MUST usar o mesmo `SortableList<T>`, removendo o drag-and-drop nativo e preservando as ações e edição da linha.
- **FR-014**: Enquanto o usuário edita a quantidade em gramas de um alimento, cada valor numérico válido MUST atualizar imediatamente os macros e as calorias da refeição e da dieta, sem exigir perda de foco.

### Key Entities

- **Refeição**: Unidade ordenável da dieta, com identificador, nome, horário, alimentos prescritos e resumo nutricional.
- **Variação ativa**: Conjunto de refeições atualmente selecionado no modo simples ou em uma variação do ciclo de carboidratos.
- **Ordem temporária**: Sequência de refeições mantida durante o modal antes de ser confirmada ou descartada.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Usuários conseguem abrir, alterar e confirmar a ordem de uma lista de refeições sem editar individualmente os cards.
- **SC-002**: Em 100% dos cenários de ciclo de carboidratos, uma nova refeição aparece na variação ativa após o clique em **Nova Refeição**.
- **SC-003**: Em 100% dos fechamentos com alteração, nenhuma mudança temporária é perdida sem uma decisão explícita de descartar.
- **SC-004**: Em 100% dos cenários de reordenação no ciclo, variações que não estão ativas mantêm sua ordem original.
- **SC-005**: O fluxo é operável integralmente por teclado e mantém foco identificável em todos os controles principais.
- **SC-006**: A alteração de gramas recalcula os valores nutricionais a cada valor válido digitado, mantendo o input focado.

## Assumptions

- A lista exibida no editor já representa a variação ativa e contém os dados necessários para o resumo dos cards.
- A confirmação da ordem usa o mecanismo existente de edição/rascunho da dieta.
- O produto permanece com escopo web desktop a partir de 1024px e tema claro.
- Não será adicionada uma dependência externa de drag-and-drop para esta entrega.
- A ordenação dos alimentos dentro de uma refeição reutiliza a mesma molécula `SortableList<T>`, preservando a tabela e a variação ativa.
