# Feature Specification: Tabela de variações no histórico de ciclo

**Feature Branch**: `[27-08-26-historico-variacoes-ciclo]`

**Created**: 2026-08-27

**Status**: Draft

**Input**: User description: "Reformular o modulo expandivel da tabela /perfil Historico de prescricoes dieteticas para dietas de ciclo de carboidratos. A representacao atual com cards funciona com 3 variacoes, mas fica progressivamente ruim e bugada com 4 ou mais. Criar uma visualizacao tabular simples em que cada variacao seja uma linha, exibindo nome, dias atribuidos em uma unica coluna e de forma compacta (por exemplo Ter, Qui), macros, calorias e quantidade de refeicoes. Manter a linha principal da prescricao com altura padrao, preservar a media semanal ponderada e o comportamento de expandir/recolher, tratar variacoes sem dias e garantir acessibilidade. Encerrar no planejamento e nos artefatos SDD; nao implementar nesta etapa."

## Clarifications

### Session 2026-08-27

- Q: Como os dias atribuídos devem ser exibidos na linha de cada variação? → A: Uma única coluna com os dias separados por vírgula e espaço, por exemplo `Ter, Qui`.

### Session 2026-08-28

- Q: Como reduzir a largura da tabela principal? → A: A coluna `Plano Alimentar` exibe somente o tipo `Simples` ou `Ciclo de carboidratos`; o nome da dieta e a tag redundante deixam de ser exibidos.
- Q: O status deve ser removido? → A: Não nesta etapa; ele permanece em uma coluna própria e compacta, com os rótulos `Ativo` e `Histórico`.
- Q: Como preservar a leitura sem scroll lateral? → A: As duas tabelas usam toda a largura disponível, removem larguras mínimas desnecessárias e mantêm conteúdo textual controlado; a tabela de variações reduz as colunas de identificação e trunca somente o nome da variação.
- Q: Como preservar as ações no espaço reduzido? → A: Visualizar cardápio, editar e excluir permanecem como ícones compactos com nome acessível e tooltip.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar todas as variações de um ciclo (Priority: P1)

Como nutricionista, quero expandir uma prescrição de ciclo de carboidratos no perfil e ver cada variação em uma linha previsível, para comparar rapidamente seus dias atribuídos, metas nutricionais e quantidade de refeições mesmo quando o ciclo possui quatro ou mais variações.

**Why this priority**: A expansão é a principal forma de validar o conteúdo histórico de um ciclo. A visualização precisa continuar legível quando a quantidade de variações cresce.

**Independent Test**: Registrar uma prescrição com quatro ou mais variações, expandi-la e confirmar que cada variação aparece em uma única linha tabular, sem sobreposição, quebra de cards ou perda de valores.

**Acceptance Scenarios**:

1. **Given** uma prescrição de ciclo com quatro variações e dias atribuídos, **When** o nutricionista expande a prescrição, **Then** as quatro variações são exibidas como quatro linhas independentes e a expansão permanece legível.
2. **Given** uma variação atribuída a `Ter` e `Qui`, **When** a linha é exibida, **Then** os dias aparecem em uma única coluna como `Ter, Qui`, na ordem canônica da semana.
3. **Given** uma variação com nome longo ou conteúdo textual maior que a coluna, **When** a tabela é exibida, **Then** a linha mantém sua altura padrão e o conteúdo textual tem uma forma acessível de consulta completa.

---

### User Story 2 - Preservar o resumo da prescrição (Priority: P1)

Como nutricionista, quero que a linha principal continue mostrando a média semanal ponderada do ciclo, para reconhecer o plano no histórico sem que a abertura dos detalhes altere o resumo ou a altura da linha.

**Why this priority**: A média semanal é o resumo longitudinal usado para comparar prescrições. Ela não pode ser substituída pela soma ou pelos valores de uma única variação.

**Independent Test**: Abrir e fechar um ciclo com distribuições diferentes de dias e confirmar que a média ponderada, o nome, o status, as ações e a altura da linha principal permanecem inalterados.

**Acceptance Scenarios**:

1. **Given** variações com diferentes quantidades de dias atribuídos, **When** a prescrição é exibida, **Then** calorias e macronutrientes da linha principal continuam representando a média semanal ponderada.
2. **Given** a linha principal em estado recolhido, **When** o ciclo é expandido, **Then** a linha principal mantém a altura padrão e os detalhes aparecem em uma área separada abaixo dela.
3. **Given** o ciclo expandido, **When** o nutricionista o recolhe, **Then** a linha de detalhes desaparece sem alterar o resumo da prescrição.

---

### User Story 3 - Usar a expansão sem interferir nas ações existentes (Priority: P2)

Como nutricionista, quero expandir os detalhes sem abrir, editar ou excluir a prescrição por engano, para consultar o histórico com segurança.

**Why this priority**: A expansão compartilha a mesma linha que as ações do histórico. Separar esses comportamentos evita ações destrutivas ou mudanças de contexto acidentais.

**Independent Test**: Usar o controle de expansão pelo teclado e pelo mouse e confirmar que ele somente alterna os detalhes, enquanto os controles de cardápio, edição e exclusão continuam acionando suas próprias ações.

**Acceptance Scenarios**:

1. **Given** uma prescrição com variações, **When** o nutricionista aciona o controle de expansão, **Then** apenas os detalhes do ciclo são alternados.
2. **Given** uma prescrição expandida, **When** o nutricionista aciona o controle novamente, **Then** os detalhes são recolhidos e o foco permanece em um controle utilizável.
3. **Given** uma dieta simples, **When** o histórico é exibido, **Then** ela mantém a apresentação e as ações existentes, sem receber detalhes de ciclo.

### Edge Cases

- Uma prescrição com uma, duas ou três variações continua usando a mesma estrutura de linhas, sem depender de uma grade de cards.
- Uma prescrição com quatro ou mais variações adiciona linhas verticalmente de maneira previsível; nenhuma linha de variação deve ser posicionada lado a lado de forma a depender da largura disponível.
- Uma variação sem dias atribuídos permanece visível e informa explicitamente que não possui dias vinculados.
- Uma prescrição de ciclo sem variações configuradas exibe um estado vazio contextualizado, sem inventar metas ou refeições.
- Uma variação sem refeições informa a ausência de refeições sem esconder a variação.
- Se dados históricos contiverem dias repetidos ou fora do conjunto canônico, a visualização não deve descartar a variação; os valores disponíveis devem continuar consultáveis e o caso deve permanecer não destrutivo.
- O nome da variação e a lista de dias não devem aumentar a altura da linha por quebra visual; quando houver excesso de espaço, o conteúdo textual completo deve permanecer acessível por uma alternativa de consulta.
- A expansão deve continuar operável por teclado, anunciar seu estado e não depender apenas de cor ou de um ícone sem nome.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST manter a linha principal de uma prescrição de ciclo como o resumo da prescrição, exibindo a média semanal ponderada de calorias e macronutrientes.
- **FR-002**: O sistema MUST exibir os detalhes expandidos de um ciclo em uma visualização tabular compacta, com exatamente uma linha para cada variação preservada no histórico.
- **FR-003**: Cada linha de variação MUST exibir, no mínimo, nome da variação, dias atribuídos, proteína, carboidratos, gorduras, calorias e quantidade de refeições.
- **FR-004**: Os dias atribuídos MUST ser apresentados em uma única coluna, usando os rótulos canônicos da semana separados por vírgula e espaço — por exemplo, `Ter, Qui` — e respeitando sua ordem semanal, sem transformar uma variação em múltiplos blocos visuais.
- **FR-005**: A visualização MUST manter uma altura padrão de linha para a linha principal e para cada linha de variação; textos longos não podem criar uma segunda faixa de conteúdo dentro da linha.
- **FR-006**: A visualização MUST substituir a grade de cards por linhas tabulares independentes, de modo que quatro ou mais variações continuem sendo exibidas verticalmente e sem sobreposição.
- **FR-007**: Uma variação sem dias atribuídos MUST permanecer visível com um estado textual explícito de ausência de dias.
- **FR-008**: Uma variação sem refeições MUST permanecer visível com uma indicação explícita de ausência de refeições.
- **FR-009**: Uma prescrição sem variações MUST exibir um estado vazio contextualizado dentro da expansão, sem exibir valores falsos.
- **FR-010**: O controle de expansão MUST alternar somente os detalhes do ciclo, preservar o resumo e a altura da linha principal e não disparar as ações de visualizar cardápio, editar ou excluir.
- **FR-011**: O controle de expansão MUST expor estado aberto/fechado, nome acessível, relação com a área expandida e operação equivalente por teclado e ponteiro.
- **FR-012**: A tabela de variações MUST fornecer cabeçalhos ou contexto equivalente para que cada valor seja compreensível sem depender de posição visual ou cor; um cabeçalho visualmente discreto pode continuar disponível semanticamente.
- **FR-013**: Dietas simples MUST preservar seus valores, sua ordenação, suas ações e a ausência de detalhes de ciclo no histórico; a apresentação compartilhada passa a usar o tipo da dieta e os novos rótulos de status definidos nesta sessão.
- **FR-014**: A ordem das variações MUST seguir a ordem registrada na prescrição histórica, salvo quando uma regra de ordenação explícita do produto já estiver definida.
- **FR-015**: O conteúdo histórico MUST ser somente leitura; a expansão não pode editar dias, metas ou refeições.
- **FR-016**: A célula `Plano Alimentar` MUST exibir somente `Simples` ou `Ciclo de carboidratos`, sem o nome da prescrição e sem uma tag adicional de modo.
- **FR-017**: O status MUST permanecer em coluna própria, com largura compacta e os rótulos `Ativo` e `Histórico`.
- **FR-018**: A tabela principal e a tabela expandida de variações MUST ocupar a largura disponível sem scroll horizontal em viewports desktop a partir de 1024px.
- **FR-019**: As ações de visualizar, editar e excluir MUST permanecer disponíveis como controles iconográficos compactos, com `title`, nome acessível e os callbacks/links existentes.
- **FR-020**: Na tabela de variações, a coluna de identificação MUST preservar o tipo visível e truncar apenas o nome longo, mantendo o valor completo consultável sem aumentar a altura da linha.

### Non-Functional Requirements

- **NFR-001**: A experiência MUST permanecer legível e utilizável no escopo desktop do produto, a partir de 1024px, sem depender de layout mobile.
- **NFR-002**: A visualização MUST cumprir WCAG 2.2 AA aplicável, incluindo semântica de tabela, foco visível, nomes acessíveis, unidades pronunciáveis e operação completa por teclado.
- **NFR-003**: A expansão MUST suportar visualmente pelo menos oito variações sem sobreposição, clipping de valores críticos ou mudança inesperada da altura padrão das linhas.
- **NFR-004**: A visualização MUST manter a ordem de leitura proteína, carboidratos, gorduras, calorias e refeições de forma consistente entre as variações.
- **NFR-005**: A apresentação MUST usar a linguagem visual, tipografia, espaçamentos, cores semânticas, ícones e estados definidos pelo Design System vigente.
- **NFR-006**: O layout MUST manter `scrollWidth` menor ou igual a `clientWidth` na tabela principal e na tabela expandida em 1024px e 1440px, sem clipping de dados críticos.

### Key Entities

- **Prescrição dietética histórica**: Registro de uma dieta exibida no histórico do perfil, com nome, data, status, modo, resumo semanal e ações de consulta.
- **Variação do ciclo**: Configuração histórica de uma oscilação de carboidratos, com nome, tipo, dias atribuídos, metas de proteína/carboidratos/gorduras, calorias e quantidade de refeições.
- **Dia atribuído**: Dia canônico da semana associado a uma variação para indicar quando suas metas devem ser seguidas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em uma prescrição com quatro a oito variações, 100% das variações são exibidas em linhas individuais, sem cards lado a lado, sobreposição ou perda de dados.
- **SC-002**: A abertura e o fechamento da expansão não alteram a altura da linha principal, o resumo ponderado, o status ou as ações da prescrição.
- **SC-003**: Um nutricionista consegue identificar os dias, macros, calorias e refeições de qualquer variação em até 10 segundos após expandir a prescrição.
- **SC-004**: Variações sem dias ou refeições permanecem identificáveis em 100% dos casos testados, com mensagens explícitas de ausência.
- **SC-005**: Dietas simples continuam passando pelos cenários existentes de histórico sem mudança observável de comportamento, ações, valores ou ordenação; a troca intencional para o rótulo de tipo não é considerada regressão.
- **SC-006**: Todos os controles da expansão são operáveis por teclado e possuem nome e estado acessíveis em 100% dos cenários testados.
- **SC-007**: Em 1024px e 1440px, a tabela principal e a tabela expandida não exibem scroll horizontal e mantêm todos os valores críticos consultáveis.
- **SC-008**: Em 100% dos registros testados, a célula de plano informa o tipo da dieta e o status usa os rótulos `Ativo` ou `Histórico`.

## Assumptions

- O histórico de prescrições continua sendo somente leitura; a edição dos ciclos permanece no construtor de dietas.
- Os dados de dias utilizam o conjunto canônico de sete dias da semana e podem estar vazios em registros históricos incompletos.
- Uma variação pode ter zero ou mais dias atribuídos e zero ou mais refeições preservadas para fins de consulta.
- A média semanal ponderada já é o resumo oficial do ciclo e não será recalculada com uma regra diferente nesta mudança.
- A quantidade de variações esperada para a primeira versão é pequena, mas a visualização deve permanecer previsível pelo menos até oito variações.
- O escopo atual é desktop a partir de 1024px; mobile, tablet e dark mode permanecem fora do escopo.
- Não haverá nova persistência, sincronização externa, edição inline ou alteração no construtor de ciclos como parte desta feature.
- A compactação visual pode substituir o botão textual de visualizar por um ícone, desde que seu nome acessível, tooltip e comportamento sejam preservados.
- A ausência de scroll horizontal será obtida por distribuição compacta das colunas e truncamento acessível de texto longo; dados críticos não serão ocultados.
