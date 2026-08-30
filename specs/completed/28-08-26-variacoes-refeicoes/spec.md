# Feature Specification: Variações de Refeições

**Feature Branch**: `variacoes-refeicoes`

**Created**: 2026-08-28

**Status**: Draft

**Input**: User description: Adicionar uma feature opcional no construtor de dietas para criar alternativas completas de uma mesma refeição, preservando o layout atual e permitindo que o paciente escolha entre as opções prescritas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar alternativas para uma refeição (Priority: P1)

Como nutricionista, quero adicionar variações completas a uma refeição existente para oferecer opções ao paciente sem transformar cada opção em uma refeição separada.

**Why this priority**: Essa é a entrega principal da feature. Ela reduz a duplicação visual e permite montar opções alternativas durante a prescrição sem alterar a organização do plano alimentar.

**Independent Test**: Em uma dieta com uma refeição comum, adicionar uma variação, verificar a criação da cópia e editar a nova opção sem sair do card da refeição.

**Acceptance Scenarios**:

1. **Given** uma refeição sem variações, **When** o nutricionista seleciona “Adicionar variação”, **Then** a refeição original passa a ser a Variação 1, uma cópia vira a Variação 2 e a Variação 2 é aberta imediatamente.
2. **Given** uma refeição com variações, **When** o nutricionista adiciona outra variação, **Then** a variação atualmente aberta é copiada e a nova opção é incluída na última posição.
3. **Given** uma refeição com quatro variações, **When** o nutricionista adiciona mais uma, **Then** a quinta variação é criada normalmente e nenhuma sexta opção pode ser criada.
4. **Given** uma refeição com cinco variações, **When** o nutricionista tenta adicionar outra, **Then** a ação fica indisponível e as cinco opções existentes permanecem intactas.

### User Story 2 - Alternar e editar uma opção da refeição (Priority: P1)

Como nutricionista, quero alternar entre as opções de uma refeição e editar cada uma separadamente para definir composições diferentes com o mesmo nome e horário.

**Why this priority**: O valor clínico da feature depende de cada alternativa poder ser ajustada livremente, sem alterar as demais.

**Independent Test**: Criar duas variações, alterar um alimento e a quantidade na segunda opção, retornar à primeira e confirmar que seus alimentos e valores não foram alterados.

**Acceptance Scenarios**:

1. **Given** uma refeição com pelo menos duas variações, **When** o nutricionista seleciona um badge de variação, **Then** o conteúdo exibido no mesmo card troca para os alimentos daquela opção.
2. **Given** uma variação aberta, **When** o nutricionista adiciona, remove, substitui, duplica, reordena ou altera a quantidade de um alimento, **Then** somente a variação aberta é alterada.
3. **Given** variações com composições diferentes, **When** o nutricionista alterna entre elas, **Then** cada uma preserva seus próprios alimentos, quantidades e macros calculados.
4. **Given** uma dieta salva com variações, **When** o nutricionista abre a dieta novamente, **Then** a Variação 1 é apresentada como a opção inicial de cada refeição que possui variações.

### User Story 3 - Manter uma refeição organizada como um único horário (Priority: P1)

Como nutricionista, quero que as alternativas compartilhem a identidade da refeição para que o plano continue organizado por horários e o paciente entenda que deve escolher uma opção.

**Why this priority**: Sem essa regra, as alternativas poderiam ser interpretadas como refeições adicionais e distorcer a leitura ou os totais do plano.

**Independent Test**: Criar variações para “Almoço”, alterar o nome e o horário da refeição, e verificar que todas as opções exibem a mesma identidade compartilhada.

**Acceptance Scenarios**:

1. **Given** uma refeição com variações, **When** o nome ou o horário é alterado, **Then** a alteração é refletida em todas as opções da mesma refeição.
2. **Given** uma refeição com apenas uma opção, **When** o nutricionista visualiza o card, **Then** o card mantém o layout e a identificação atuais, sem badge ou tab de variação.
3. **Given** uma refeição com duas ou mais opções, **When** o nutricionista visualiza o card, **Then** o nome compartilhado permanece visível e os badges “Variação 1”, “Variação 2” e seguintes aparecem ao lado dele como opções selecionáveis.
4. **Given** uma variação ativa, **When** o nutricionista alterna para outra, **Then** somente o conteúdo da refeição muda; o card não é duplicado na lista de horários.

### User Story 4 - Gerenciar e duplicar grupos de variações (Priority: P2)

Como nutricionista, quero remover opções e duplicar uma refeição completa para manter controle sobre o plano sem perder a estrutura das alternativas.

**Why this priority**: A criação é o fluxo principal, mas a manutenção e a reutilização são necessárias para evitar dados órfãos e retrabalho.

**Independent Test**: Criar três variações, remover a ativa, verificar a seleção da última restante e duplicar a refeição para confirmar que todas as variações foram copiadas.

**Acceptance Scenarios**:

1. **Given** uma refeição com duas ou mais variações, **When** o nutricionista exclui a variação ativa, **Then** ela é removida, as restantes são renumeradas e a última variação restante é selecionada.
2. **Given** uma refeição com duas variações, **When** uma delas é removida, **Then** a única opção restante é exibida sem badge ou tab, como uma refeição comum.
3. **Given** uma refeição com variações, **When** o nutricionista duplica a refeição, **Then** uma nova refeição é criada com todas as variações, alimentos, quantidades e valores independentes copiados.
4. **Given** uma refeição duplicada com variações, **When** a nova refeição é inserida, **Then** ela abre inicialmente na Variação 1 e mantém o comportamento de grupo independente.
5. **Given** uma refeição sem variações visíveis, **When** o nutricionista a duplica, **Then** a nova refeição mantém o comportamento de uma refeição única.

### User Story 5 - Usar variações nos modos de dieta disponíveis (Priority: P2)

Como nutricionista, quero utilizar alternativas tanto em uma dieta simples quanto dentro de cada dia de um ciclo de carboidratos para manter o mesmo padrão de prescrição em qualquer modo.

**Why this priority**: O produto oferece os dois modos de dieta, e restringir a feature a apenas um deles criaria comportamentos inconsistentes.

**Independent Test**: Criar uma variação em uma refeição da Dieta Simples e outra em uma refeição de um dia do Ciclo de Carboidratos, alternar os dias e confirmar que os grupos permanecem isolados.

**Acceptance Scenarios**:

1. **Given** uma refeição da Dieta Simples, **When** o nutricionista cria e edita variações, **Then** elas funcionam com as mesmas regras de criação, seleção, cálculo e exclusão.
2. **Given** uma refeição dentro de um dia do Ciclo de Carboidratos, **When** o nutricionista cria e edita variações, **Then** as opções pertencem somente àquela refeição daquele dia.
3. **Given** duas refeições equivalentes em dias diferentes do ciclo, **When** uma delas recebe uma variação, **Then** a outra não recebe cópia nem alteração automática.
4. **Given** a troca entre dias do ciclo, **When** o nutricionista retorna a um dia anteriormente editado, **Then** as variações e composições daquele dia permanecem preservadas.

## Edge Cases

- Uma refeição vazia pode receber uma variação; a cópia começa vazia e é aberta para edição.
- A ação de adicionar variação não pode criar uma sexta opção; o estado da refeição deve permanecer inalterado quando o limite for atingido.
- Ao remover a variação ativa, a última opção que restar é selecionada, mesmo quando a opção removida não era a última da sequência original.
- Ao remover opções, os badges são recalculados pela posição atual e não preservam números antigos.
- Ao remover opções até restar uma, a refeição não deve continuar exibindo controles de variação.
- Alterar o nome ou horário em qualquer opção deve atualizar a identidade compartilhada sem alterar os alimentos das demais opções.
- Macros e calorias diferentes entre opções são permitidos; o sistema não deve corrigir, igualar ou bloquear a edição por causa dessa diferença.
- Os totais da dieta devem considerar somente a opção ativa de cada grupo de refeição, nunca somar todas as alternativas do mesmo grupo.
- Uma dieta existente sem variações deve continuar abrindo como uma refeição normal, sem perda de alimentos, quantidades ou valores.
- A seleção ativa é uma preferência de visualização da edição; ao abrir a dieta novamente, a opção inicial deve ser a Variação 1.
- A exclusão de uma opção não deve excluir as outras opções nem a refeição inteira.
- A duplicação de uma refeição deve gerar uma cópia independente, sem alterações posteriores compartilhadas com a refeição de origem.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema deve permitir ao nutricionista adicionar variações individualmente em cada refeição do construtor de dieta.
- **FR-002**: Uma refeição sem variações deve manter o comportamento e a apresentação atuais, sem exibir badges ou tabs adicionais.
- **FR-003**: A primeira ação de adicionar variação deve conservar a refeição original como Variação 1, criar uma cópia como Variação 2 e abrir a nova cópia imediatamente.
- **FR-004**: Cada nova variação deve ser criada copiando a opção atualmente aberta e inserida na última posição do grupo.
- **FR-005**: O sistema deve limitar cada refeição a no máximo cinco variações.
- **FR-006**: O sistema deve abrir automaticamente a variação recém-criada para que ela possa ser editada sem uma seleção adicional.
- **FR-007**: Todas as variações do mesmo grupo devem compartilhar nome e horário, e uma alteração nesses campos deve ser refletida no grupo inteiro.
- **FR-008**: Os badges das variações devem ser fixos, sequenciais e não editáveis, seguindo o formato “Variação N”.
- **FR-009**: Os badges devem funcionar como tabs, exibindo no mesmo card somente o conteúdo da variação ativa.
- **FR-010**: Cada variação deve manter alimentos, quantidades, ordem e macros calculados independentes das demais variações.
- **FR-011**: As operações de inclusão, remoção, substituição, duplicação, reordenação, alteração de quantidade e escala de alimentos devem atuar somente na variação ativa.
- **FR-012**: O sistema não deve bloquear, equalizar ou ajustar automaticamente macros e calorias para tornar as variações nutricionalmente iguais.
- **FR-013**: Os totais de macros e calorias da dieta devem considerar somente a variação ativa de cada refeição.
- **FR-014**: Ao abrir uma dieta, o sistema deve selecionar a Variação 1 como opção inicial em cada grupo com variações.
- **FR-015**: Ao excluir a variação ativa, o sistema deve removê-la, renumerar as restantes e selecionar a última variação que restar.
- **FR-016**: Quando restar somente uma variação, o sistema deve ocultar badges e tabs e apresentar a refeição como uma refeição comum.
- **FR-017**: A feature deve funcionar na Dieta Simples e nas refeições pertencentes a cada dia do Ciclo de Carboidratos.
- **FR-018**: Uma variação criada em um dia do Ciclo de Carboidratos deve permanecer isolada das refeições e variações dos demais dias.
- **FR-019**: A duplicação de uma refeição deve copiar o grupo completo, incluindo todas as variações, alimentos, quantidades, ordem e valores calculados, criando uma cópia independente.
- **FR-020**: Dietas existentes sem variações devem continuar compatíveis e ser exibidas sem mudanças visuais ou perda de dados.
- **FR-021**: O recurso deve preservar a estrutura visual atual do card e reutilizar o padrão existente de seleção por tabs, adicionando somente os controles condicionais necessários quando houver duas ou mais opções.
- **FR-022**: Os controles de variação devem possuir nome acessível, estado selecionado identificável, foco visível e operação completa por teclado.
- **FR-023**: O estado de limite atingido deve ser comunicado de forma compreensível e impedir novas inclusões sem afetar as opções existentes.

### Key Entities

- **Grupo de Refeição**: Representa uma refeição exibida em um horário do plano, com identidade compartilhada, nome, horário e de uma a cinco opções alternativas.
- **Variação de Refeição**: Representa uma opção independente dentro do grupo, com posição sequencial, alimentos, quantidades e valores nutricionais calculados.
- **Seleção Ativa**: Representa a opção atualmente aberta para edição e cálculo dentro de cada grupo; ao reabrir uma dieta, começa na Variação 1.
- **Contexto do Plano**: Representa o modo da dieta e, quando aplicável, o dia do Ciclo de Carboidratos ao qual o grupo de refeição pertence.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos fluxos de criação testados, uma refeição comum pode se tornar um grupo com duas opções sem sair do card ou criar uma segunda refeição no horário.
- **SC-002**: Em 100% dos fluxos testados, criar uma nova variação copia exatamente a opção ativa no momento da ação e a abre imediatamente como a última opção.
- **SC-003**: Em 100% dos fluxos testados, editar uma variação não altera alimentos, quantidades ou macros das outras opções do mesmo grupo.
- **SC-004**: Em 100% dos fluxos testados, o limite de cinco variações é respeitado e nenhuma sexta opção é criada.
- **SC-005**: Em 100% dos fluxos testados, a exclusão da opção ativa seleciona a última opção restante e remove os badges quando resta apenas uma.
- **SC-006**: Em 100% dos fluxos testados, os totais exibidos refletem somente a opção ativa de cada grupo, sem somar alternativas entre si.
- **SC-007**: 100% das dietas existentes sem variações devem abrir e manter seus dados preservados após a disponibilização da feature.
- **SC-008**: O fluxo principal deve ser operável integralmente por teclado, com o estado da tab ativa identificável para tecnologia assistiva e foco visível em todos os controles.
- **SC-009**: O card de uma refeição sem variações deve manter a mesma estrutura visual e a mesma quantidade de elementos funcionais do fluxo atual, salvo a ação explícita de adicionar variação.
- **SC-010**: O nutricionista deve conseguir criar, alternar, editar e remover opções de uma refeição sem confundir as variações do dia do ciclo com as variações da refeição.
- **SC-011**: Em uma dieta desktop com até cinco opções por refeição, a troca da opção ativa deve atualizar os alimentos exibidos e os totais nutricionais em até 500 milissegundos em pelo menos 95% das interações.

## Assumptions

- O usuário desta feature é o nutricionista que já possui acesso ao construtor da dieta; não há mudança de permissões ou autenticação.
- A feature é destinada ao produto web desktop; suporte específico para mobile e tablet permanece fora do escopo.
- A Variação 1 é a opção original da refeição e só passa a ter badge visível quando a segunda opção é criada.
- A seleção ativa é estado de edição e visualização; a abertura posterior da dieta sempre começa pela Variação 1.
- O nome e o horário são propriedades da refeição compartilhada, enquanto os alimentos e valores nutricionais pertencem a cada variação.
- A cópia de uma variação é independente após sua criação; alterações posteriores não são propagadas para a origem.
- A ação existente de duplicar refeição é interpretada como duplicação do grupo completo quando a refeição possui variações.
- Ao duplicar um grupo com variações, a nova refeição começa visualmente na Variação 1; essa escolha inicial não é persistida como dado clínico.
- Ações de alimentos existentes continuam aplicadas à variação atualmente aberta, sem alterar as demais.
- Nesta entrega, a seleção por tabs e os totais ativos são implementados no construtor de dietas; a camada de entrega/consumo do paciente não será ampliada e continua fora do escopo de exportação, PDF e WhatsApp.
- Dietas já armazenadas podem não possuir variações e devem continuar sendo lidas no formato de refeição única.
- O cálculo nutricional existente permanece responsável pelos valores de alimentos e refeições; esta feature apenas define qual opção ativa participa dos totais.
- O limite de cinco opções é uma regra de produto e não deve ser alterado pela interface desta entrega.
