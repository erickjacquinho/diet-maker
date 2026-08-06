# Feature Specification: Adequação da Lista de Pacientes

**Feature Branch**: `tela-pacientes`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Criar um SDD de adequação para a tela de pacientes, ignorando a barra lateral, descartando a view de cards e implementando a nova view de lista em tabela conforme o HTML de referência Pacientes — Lista contínua por prioridade."

## Contexto e escopo

A listagem de pacientes deve apoiar a triagem rápida do nutricionista antes da abertura do perfil individual. A referência visual aprovada apresenta uma lista contínua em tabela, sem agrupamentos visuais, com foco no próximo acompanhamento e na evolução de gordura corporal.

O escopo desta adequação é somente o conteúdo principal da rota de pacientes. A barra lateral, o conteúdo do perfil individual, o cadastro em si e a persistência de dados existente não serão redesenhados. A view de cards atualmente usada como lista principal será descartada.

## User Scenarios & Testing

### User Story 1 - Triar pacientes em uma lista contínua (Priority: P1)

Como nutricionista, quero visualizar todos os pacientes em uma tabela única e ordenada pelo próximo acompanhamento, para identificar rapidamente quem exige atenção antes de abrir um perfil.

**Why this priority**: A triagem da agenda é a tarefa central da tela e substitui diretamente a leitura fragmentada da grade de cards.

**Independent Test**: Com pacientes contendo eventos atrasados, de hoje, futuros e sem evento, é possível identificar a sequência de prioridade e abrir qualquer paciente a partir da própria linha.

**Acceptance Scenarios**:

1. **Given** pacientes cadastrados, **When** a listagem é exibida, **Then** todos aparecem em uma única tabela contínua, sem cards, grupos ou separadores de estado.
2. **Given** pacientes com eventos em estados diferentes, **When** a listagem é exibida, **Then** a ordem é atrasados, hoje, próximos por data e sem próximo evento.
3. **Given** uma linha de paciente, **When** o nutricionista seleciona a linha, o link do nome ou a ação com chevron, **Then** o perfil individual correspondente é aberto.
4. **Given** a tabela em viewport desktop, **When** o nutricionista percorre a interface pelo teclado, **Then** cada linha interativa possui foco visível e acionamento por teclado.

### User Story 2 - Avaliar contexto corporal e de acompanhamento (Priority: P1)

Como nutricionista, quero enxergar o percentual de gordura corporal, sua variação recente e os sinais de registros existentes, para decidir se preciso revisar a avaliação física ou a dieta antes do atendimento.

**Why this priority**: O percentual de gordura corporal é a métrica corporal considerada útil para a triagem; o peso atual isolado não é suficientemente assertivo para esse contexto.

**Independent Test**: Com pacientes que possuem uma ou mais avaliações corporais e dietas registradas em momentos diferentes, é possível distinguir BF atual, variação e presença de cada tipo de registro sem abrir o perfil.

**Acceptance Scenarios**:

1. **Given** um paciente com avaliação corporal recente, **When** a tabela é exibida, **Then** a coluna de evolução mostra o percentual de gordura atual com a unidade `BF`.
2. **Given** um paciente com avaliação anterior comparável, **When** a tabela é exibida, **Then** a variação aparece em percentual e com o período decorrido, por exemplo `−0,4% 20d`.
3. **Given** um paciente sem dados corporais suficientes, **When** a tabela é exibida, **Then** a célula informa explicitamente que não há avaliação corporal recente, sem inventar valor ou variação.
4. **Given** qualquer paciente, **When** a tabela é exibida, **Then** existem dois espaços fixos empilhados à direita do bloco de identidade (nome, gênero e idade): o superior representa existência de avaliação física e o inferior representa existência de dieta registrada em algum momento.
5. **Given** um indicador de registro ativo, **When** ele é percebido visualmente, **Then** a informação também está disponível por nome acessível ou texto equivalente e não depende somente da cor.

### User Story 3 - Buscar, cadastrar e reconhecer estados da lista (Priority: P2)

Como nutricionista, quero buscar pacientes, cadastrar um novo paciente e reconhecer estados vazios ou de acompanhamento, para manter a lista acionável sem perder contexto.

**Why this priority**: Busca, cadastro e estados de exceção completam o fluxo operacional da tela, mas dependem da tabela principal estar disponível.

**Independent Test**: É possível filtrar por nome ou objetivo, ver a contagem atualizada, abrir o fluxo existente de novo paciente e reconhecer estados de carregamento, lista vazia, nenhum resultado e ausência de próximo evento.

**Acceptance Scenarios**:

1. **Given** pacientes carregados, **When** o nutricionista informa parte de um nome ou objetivo, **Then** somente os pacientes correspondentes permanecem na tabela e a contagem informa o total filtrado.
2. **Given** a barra de ferramentas, **When** o nutricionista procura a ação de cadastro, **Then** encontra um botão `+ Novo paciente` alinhado à direita da busca e da contagem.
3. **Given** nenhum paciente cadastrado, **When** a rota é exibida, **Then** existe um estado vazio orientando o cadastro do primeiro paciente.
4. **Given** a busca não encontra correspondências, **When** os resultados são exibidos, **Then** existe orientação para ajustar ou limpar a busca.
5. **Given** um paciente sem próximo evento, **When** a linha é exibida, **Then** o estado informa a ausência e orienta que o tipo e a data sejam definidos no perfil.

## Edge Cases

- Avaliações corporais sem uma avaliação anterior comparável não exibem variação artificial; exibem somente o estado de dados insuficientes definido para a coluna.
- Pacientes sem dieta, sem avaliação física ou sem ambos mantêm os dois slots dos indicadores ocupados estruturalmente, deixando o slot ausente transparente para não deslocar o nome.
- Eventos com data inválida ou ausente são tratados como sem próximo evento e não entram na ordenação de atrasados, hoje ou próximos.
- Pacientes com o mesmo dia de próximo evento permanecem em ordem determinística por nome.
- Datas e períodos são apresentados em formato legível para `pt-BR`; a variação de gordura mantém o símbolo percentual solicitado, sem a expressão `p.p.`.
- Textos longos de objetivo não quebram a geometria da tabela; devem truncar ou quebrar de forma legível dentro da célula.
- A tabela permanece utilizável a partir de `1024px`; suporte a mobile e tablet não faz parte desta mudança.
- Falhas de leitura dos dados existentes não devem impedir a renderização do estado vazio ou de erro orientado.

## Requirements

### Functional Requirements

- **FR-001**: A rota de pacientes MUST substituir a grade de cards por uma única tabela contínua no conteúdo principal.
- **FR-002**: A tabela MUST apresentar as colunas Paciente, Objetivo, Evolução de gordura, Próximo acompanhamento e uma ação de abertura do perfil.
- **FR-003**: A coluna Paciente MUST apresentar nome, idade, ícone Lucide de gênero quando disponível e dois slots verticais reservados para os indicadores de avaliação física e dieta.
- **FR-004**: O slot superior MUST indicar se existe avaliação física registrada em algum momento e o slot inferior MUST indicar se existe dieta registrada em algum momento; slots ausentes MUST permanecer transparentes e manter o alinhamento.
- **FR-005**: A coluna Evolução de gordura MUST priorizar o percentual de gordura corporal atual e MUST omitir o peso atual da listagem.
- **FR-006**: Quando houver avaliações comparáveis, a tabela MUST exibir a variação do percentual de gordura com sinal, símbolo `%` e período decorrido em dias, sem usar `p.p.`.
- **FR-007**: Quando não houver dados corporais suficientes, a tabela MUST exibir um estado textual de ausência de avaliação corporal recente.
- **FR-008**: A ordenação MUST ser única e determinística: atrasados, hoje, próximos por data e sem próximo evento; não deve existir controle visual separado de "Prioridade do acompanhamento".
- **FR-009**: Cada próximo acompanhamento MUST comunicar estado textual, tipo e data quando disponíveis, incluindo atrasado, hoje, futuro e sem próximo evento.
- **FR-010**: A busca MUST filtrar por nome ou objetivo e MUST atualizar a contagem exibida sem alterar a semântica da ordenação.
- **FR-011**: A barra de ferramentas MUST conter busca, contagem de pacientes e botão `+ Novo paciente`, com o botão alinhado à direita.
- **FR-012**: A tabela MUST preservar navegação para o perfil individual por link real, ação de chevron e teclado, sem criar ações aninhadas conflitantes.
- **FR-013**: A tabela MUST possuir caption acessível, cabeçalhos semânticos, escopo de coluna, foco visível e nomes acessíveis para ícones e indicadores não textuais.
- **FR-014**: Estados de carregamento, lista vazia, nenhum resultado, ausência de avaliação corporal recente e ausência de próximo evento MUST ser tratados com texto orientador.
- **FR-015**: A tela MUST usar a linguagem visual canônica do NutriDiet: tema claro quente, tokens do design system, tipografia e geometria desktop, ícones Lucide e contraste WCAG 2.2 AA.
- **FR-016**: A barra lateral MUST permanecer fora do escopo visual e funcional desta adequação.
- **FR-017**: O fluxo existente de cadastro de paciente MUST continuar disponível pelo novo botão sem alterar o contrato do formulário além do necessário para sua abertura.

### Key Entities

- **Patient**: Paciente exibido na listagem, com identidade, idade, gênero, objetivo, identificador e vínculo para o perfil individual.
- **Next accompaniment**: Evento futuro ou vencido associado ao paciente, com data e tipo de atualização de dieta ou avaliação.
- **Body assessment**: Avaliação física com data, percentual de gordura corporal e demais medidas disponíveis; fornece o valor atual e a comparação anterior.
- **Diet record**: Registro de dieta associado ao paciente; sua existência histórica alimenta o indicador inferior ao lado do nome.
- **Patient row**: Projeção de leitura da listagem que combina identidade, objetivo, evolução corporal, próximo acompanhamento, indicadores de registros e destino do perfil.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Em viewport desktop de pelo menos `1024px`, 100% das colunas definidas na referência ficam disponíveis na tabela sem renderizar a grade de cards.
- **SC-002**: Para uma lista com pacientes em todos os estados de acompanhamento, 100% das linhas aparecem na sequência atrasados → hoje → próximos → sem próximo evento, com desempate determinístico.
- **SC-003**: Para cada paciente com dados corporais suficientes, a listagem apresenta BF atual e, quando comparável, variação percentual com período; nenhum peso atual é exibido na tabela.
- **SC-004**: A busca por nome ou objetivo atualiza a contagem e a lista filtrada sem apagar o acesso ao perfil individual.
- **SC-005**: Todos os estados e ações previstos podem ser compreendidos sem depender exclusivamente de cor e podem ser alcançados por teclado com foco visível.
- **SC-006**: O botão `+ Novo paciente` permanece disponível no estado normal da lista e abre o fluxo de cadastro existente.
- **SC-007**: Os estados de lista vazia, nenhum resultado, ausência de BF recente e ausência de próximo evento apresentam orientação textual específica.

## Assumptions

- A referência visual `refs/pacientes-list-view.html` representa o conteúdo principal aprovado; sua barra lateral e seus textos de documentação externa não fazem parte do produto a implementar.
- A fonte de avaliações corporais é o histórico de avaliações já persistido para cada paciente; a avaliação mais recente fornece o BF atual e a anterior fornece a comparação quando existir.
- A fonte de dietas é o histórico já persistido para cada paciente; a existência de qualquer registro é suficiente para ativar o indicador de dieta.
- A ordenação é derivada dos eventos já existentes e não exige um novo módulo de agendamento.
- O cadastro de paciente e o formulário modal existentes serão reutilizados.
- A tabela é uma mudança de apresentação e leitura; não cria edição inline nem novas ações clínicas na linha.
- A aplicação permanece local/offline-first, sem integração externa, backend remoto ou sincronização multiusuário para esta adequação.
- A execução do plano ocorrerá somente após validação humana dos artefatos deste SDD.

## Out of Scope

- Barra lateral, navegação global e identidade do aplicativo fora do conteúdo principal.
- Redesign do perfil individual, do formulário de cadastro ou dos fluxos de dieta e avaliação.
- Agendamento completo, criação de lembretes ou alteração da regra de negócio de eventos.
- Dashboard com gráficos, métricas de peso, calorias ou macronutrientes na listagem.
- Suporte a mobile, tablet, dark mode ou novos temas.
- Migração de dados para serviço remoto ou alteração do formato de persistência existente.
