# Feature Specification: Refeições reutilizáveis no modal de seleção de alimentos

**Feature Branch**: `[refatorar-selecao-refeicoes-modal]`

**Created**: 2026-08-26

**Status**: Draft

**Input**: User description: revisar o modal atual de seleção de alimentos para refeição e adequá-lo ao fluxo simples de criação e reutilização de dietas definido na conversa.

## Contexto da revisão

O `FoodSearchModal` atual pesquisa alimentos da TACO, permite escolher um alimento, informar a quantidade em gramas e adicioná-lo à refeição ativa. Ele não oferece refeições prontas, receitas reutilizáveis, composição de várias linhas ou opções configuradas.

As superfícies relacionadas também estão parciais para esse fluxo: o armazenamento de refeições prontas guarda apenas resumo, o armazenamento de receitas guarda ingredientes, mas a refeição da dieta ainda não possui um modelo para opções/substituições equivalentes. Já existe uma substituição individual de alimento, que deve continuar como ação rápida do nutricionista.

Esta especificação cobre o fluxo de seleção, criação e reutilização de refeições/receitas. Ela não implementa a mudança nesta etapa.

## User Scenarios & Testing

### User Story 1 - Inserir uma refeição pronta (Priority: P1)

Como nutricionista, quero encontrar uma refeição pronta dentro do modal de seleção e inseri-la na refeição ativa com sua composição e opções já configuradas, para montar a dieta sem repetir o cadastro alimento por alimento.

**Why this priority**: É o principal ganho de velocidade e simplicidade para a montagem de dietas e para a repetição de padrões clínicos.

**Independent Test**: Com uma refeição pronta cadastrada, abrir o modal em uma refeição da dieta, selecionar a refeição pronta e confirmar. A refeição ativa deve receber todos os alimentos, gramaturas e opções configuradas.

**Acceptance Scenarios**:

1. **Given** o modal aberto para uma refeição ativa, **When** o nutricionista muda para o grupo de refeições prontas, **Then** vê uma lista pesquisável de refeições salvas, com estado vazio quando não houver itens.
2. **Given** uma refeição pronta selecionada, **When** o nutricionista abre sua prévia, **Then** vê os alimentos, as quantidades em gramas, os totais nutricionais e as opções/substituições configuradas.
3. **Given** uma prévia válida, **When** o nutricionista confirma a inserção, **Then** todos os itens da refeição pronta são adicionados à refeição ativa em uma ação, mantendo quantidades, macros e opções.
4. **Given** uma refeição ativa que já possui alimentos, **When** uma refeição pronta é confirmada, **Then** o conteúdo é acrescentado sem apagar silenciosamente os itens existentes.

### User Story 2 - Salvar a refeição atual para reutilização (Priority: P2)

Como nutricionista, quero salvar o conteúdo da refeição no próprio card da dieta como refeição pronta ou receita, para reutilizá-lo em outros pacientes ou refeições.

**Why this priority**: Reduz retrabalho e transforma uma montagem já validada em um modelo reutilizável.

**Independent Test**: Em um card com alimentos, acionar salvar, escolher o tipo, informar um nome e concluir. O item deve aparecer na biblioteca correspondente e estar disponível no modal de seleção.

**Acceptance Scenarios**:

1. **Given** um card de refeição com alimentos, **When** o nutricionista escolhe salvar como refeição pronta ou receita, **Then** o fluxo pede somente o tipo e o nome mínimo necessário para concluir.
2. **Given** uma refeição com itens e opções, **When** ela é salva como refeição pronta, **Then** sua composição, gramaturas e opções são persistidas para reutilização.
3. **Given** uma refeição salva como receita, **When** ela é aberta ou selecionada posteriormente, **Then** seus ingredientes e quantidades em gramas permanecem editáveis antes da aplicação.
4. **Given** uma tentativa de salvar sem itens ou sem nome, **When** o nutricionista confirma, **Then** o sistema impede o salvamento e explica o que falta.

### User Story 3 - Configurar opções de refeição por equivalência (Priority: P3)

Como nutricionista, quero criar opções completas de refeição e calcular quantidades proporcionais a partir de um macro de referência, para oferecer alternativas nutricionalmente coerentes sem limitar a edição a um único alimento.

**Why this priority**: Mantém a flexibilidade clínica e facilita a adesão do paciente, sem tornar a criação da opção um processo manual e repetitivo.

**Independent Test**: Em uma refeição, criar uma opção, escolher um macro de referência, selecionar os alimentos da alternativa e confirmar. O sistema deve calcular as gramaturas proporcionais, permitir ajustes e mostrar a composição final.

**Acceptance Scenarios**:

1. **Given** uma refeição com composição base, **When** o nutricionista cria uma opção completa e escolhe o macro de referência, **Then** pode montar a alternativa com qualquer conjunto de alimentos disponível.
2. **Given** uma opção com alimentos selecionados, **When** o nutricionista solicita o cálculo proporcional, **Then** as quantidades em gramas são sugeridas com base no macro escolhido e na composição de referência.
3. **Given** quantidades sugeridas, **When** o nutricionista altera qualquer alimento, quantidade ou composição da opção, **Then** os totais da opção são recalculados e todos os alimentos continuam editáveis.
4. **Given** uma opção configurada, **When** a refeição é salva ou reutilizada, **Then** a opção e seu macro de referência acompanham a refeição pronta.
5. **Given** a substituição rápida de um alimento existente, **When** o nutricionista a utiliza, **Then** ela continua disponível separadamente e não obriga a criação de uma opção completa.

### Edge Cases

- Uma biblioteca sem refeições prontas ou receitas deve apresentar estado vazio e manter a pesquisa de alimentos funcionando.
- Uma refeição pronta ou receita que contenha alimento removido ou indisponível deve ser identificada antes da confirmação, sem perder os demais dados.
- Quantidades nulas ou menores que zero devem ser rejeitadas; o cálculo proporcional deve exigir um valor de referência diferente de zero.
- Fechar o modal ou cancelar uma edição não deve salvar alterações parciais; autosave não faz parte desta etapa.
- A inserção de uma refeição pronta em um card já preenchido deve acrescentar os itens, evitando substituição silenciosa da refeição atual.
- Opções sem alimentos, com duplicidade inválida ou sem macro de referência devem permanecer incompletas até serem corrigidas.
- A ausência de medidas caseiras não deve gerar conversões ou campos adicionais: toda quantidade exibida e editada nesta etapa é em gramas.

## Requirements

### Functional Requirements

- **FR-001**: O modal MUST manter a busca e a seleção de alimentos da TACO como fluxo padrão.
- **FR-002**: O modal MUST apresentar um grupo separado para refeições prontas, sem misturá-las silenciosamente com os resultados de alimentos.
- **FR-003**: O grupo de refeições prontas MUST permitir localizar itens salvos por nome e exibir estado vazio quando não houver resultados.
- **FR-004**: O modal MUST permitir pré-visualizar uma refeição pronta antes da confirmação, incluindo alimentos, gramaturas, totais nutricionais e opções configuradas.
- **FR-005**: A confirmação de uma refeição pronta MUST adicionar a composição completa à refeição ativa em uma operação, preservando quantidades, macros e opções.
- **FR-006**: O sistema MUST evitar apagar itens existentes da refeição ativa sem uma ação explícita do nutricionista.
- **FR-007**: O sistema MUST permitir salvar o conteúdo atual do card da refeição como refeição pronta ou como receita.
- **FR-008**: O salvamento MUST exigir um nome e impedir a criação de item sem composição válida.
- **FR-009**: Uma refeição pronta MUST persistir sua composição completa, gramaturas e opções/substituições configuradas, e não apenas um resumo nutricional.
- **FR-010**: Uma receita MUST persistir seus ingredientes e quantidades em gramas e permanecer editável antes de ser aplicada.
- **FR-011**: O construtor MUST permitir criar opções completas de refeição, com vários alimentos editáveis em cada opção.
- **FR-012**: O construtor MUST permitir escolher um macro de referência para o cálculo de equivalência da opção.
- **FR-013**: O sistema MUST sugerir quantidades proporcionais em gramas para os alimentos da opção com base no macro de referência escolhido.
- **FR-014**: O nutricionista MUST poder alterar, adicionar ou remover alimentos e alterar suas gramaturas depois do cálculo proporcional.
- **FR-015**: O sistema MUST recalcular os totais nutricionais da opção após cada alteração válida de composição ou quantidade.
- **FR-016**: O sistema MUST armazenar o macro de referência usado na opção para manter o contexto da equivalência ao reutilizar a refeição.
- **FR-017**: A substituição individual de alimento MUST continuar disponível como ação rápida, sem substituir o fluxo de opções completas.
- **FR-018**: Todos os campos de quantidade desta etapa MUST usar gramas; medidas caseiras e conversões MUST ficar fora do fluxo.
- **FR-019**: Cancelamentos e fechamentos sem confirmação MUST descartar alterações parciais do modal ou do editor de opção.
- **FR-020**: Autosave, exportação/PDF/WhatsApp e a refatoração visual da escala MUST permanecer fora do escopo desta entrega.
- **FR-021**: A navegação do modal e dos editores MUST ser utilizável por teclado, com foco visível e mensagens de validação associadas aos campos.

### Key Entities

- **Refeição da dieta**: Card da dieta ativa, com nome, horário, alimentos em gramas e zero ou mais opções completas.
- **Refeição pronta**: Modelo reutilizável de uma refeição completa, com composição, gramaturas, totais e opções configuradas.
- **Receita**: Modelo reutilizável de ingredientes em gramas, separado conceitualmente da refeição pronta, mas disponível para aplicação no mesmo fluxo de seleção.
- **Opção de refeição**: Alternativa completa para uma refeição, formada por alimentos editáveis, gramaturas, totais e macro de referência.
- **Alimento da composição**: Item baseado na TACO, com identificador, nome, quantidade em gramas e valores nutricionais calculados.
- **Macro de referência**: Macro escolhido pelo nutricionista para orientar o cálculo proporcional de uma opção; o valor e o tipo devem acompanhar a opção.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Um nutricionista consegue inserir uma refeição pronta previamente salva na refeição ativa sem cadastrar seus alimentos individualmente e sem mais de uma confirmação final.
- **SC-002**: Em um teste com uma refeição pronta válida, 100% dos alimentos, gramaturas, totais e opções persistidos são recuperados sem perda silenciosa.
- **SC-003**: O salvamento de uma refeição existente como refeição pronta ou receita exige apenas a escolha do tipo e um nome, além da confirmação explícita.
- **SC-004**: O cálculo proporcional produz uma sugestão em gramas e permite concluir a edição sem obrigar o nutricionista a recomeçar a opção quando fizer ajustes manuais.
- **SC-005**: O fluxo principal de alimentos continua disponível quando a biblioteca de refeições prontas ou receitas está vazia, indisponível ou sem correspondência.
- **SC-006**: Nenhuma tela ou interação desta etapa solicita medida caseira, autosave, exportação ou escala visual refatorada.
- **SC-007**: Em uma biblioteca local com até 500 refeições prontas/receitas, a troca de grupo e a filtragem por nome devem apresentar o resultado em até 200 ms no percentil 95, sem bloquear a seleção de alimentos.

## Assumptions

- O público desta etapa é o nutricionista usando a aplicação desktop; o paciente não edita a dieta neste fluxo.
- Uma refeição pronta selecionada no modal é aplicada à refeição ativa atual, acrescentando sua composição completa; criar um novo card de refeição não faz parte deste fluxo do modal.
- Opções completas de refeição são o modelo principal de alternativa para reutilização. A substituição individual permanece apenas como ação rápida para ajustes pontuais.
- Refeição pronta e receita continuam sendo tipos conceituais distintos: receita pode conter dados próprios de preparo, enquanto refeição pronta representa diretamente um bloco aplicável à dieta.
- O armazenamento local e os contratos existentes de alimentos, receitas e refeições serão evoluídos somente o necessário para suportar a composição completa e suas opções.
- O fluxo reutiliza a base de alimentos da TACO e os cálculos nutricionais já existentes.
- O escopo é desktop, com o modal e os cards da dieta como superfícies principais; a biblioteca de refeições prontas e a biblioteca de receitas serão ajustadas apenas na medida necessária para criar, editar e reutilizar os itens.
- Autosave, exportação, medidas caseiras e a nova escala visual são itens posteriores e não devem bloquear esta entrega.
