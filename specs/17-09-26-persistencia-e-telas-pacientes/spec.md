# Feature Specification: Persistência e desempenho dos perfis de pacientes

**Feature Branch**: `[persistencia-e-telas-pacientes]`

**Created**: 2026-09-17

**Status**: Draft

**Input**: Manter `.nutridiet` como save principal da Conta, preservar valores em edição no navegador, gravar o arquivo em saves explícitos e mudanças de tela após saves confirmados, e otimizar a lista de pacientes e os históricos dos perfis dos pacientes sem remover informações.

## User Scenarios & Testing

### User Story 1 - Salvar e recuperar o perfil sem gravações contínuas (Priority: P1)

Como nutricionista, quero continuar trabalhando sem regravar o arquivo principal a cada alteração, para manter a edição rápida e ainda ter um `.nutridiet` confiável como save da Conta.

**Why this priority**: O arquivo deve continuar sendo a cópia principal dos dados confirmados, enquanto alterações ainda não consolidadas sobrevivem no navegador.

**Independent Test**: Editar dados, confirmar saves, mudar de tela e reabrir a Conta pelo `.nutridiet`; verificar o arquivo principal, a recuperação local e os estados de falha.

**Acceptance Scenarios**:

1. **Given** uma Conta sem alterações pendentes, **When** o nutricionista digita em um formulário ou o draft de dieta é atualizado automaticamente, **Then** o conteúdo do arquivo `.nutridiet` não é regravado.
2. **Given** um ou mais registros foram confirmados desde o último checkpoint, **When** o nutricionista aciona Salvar ou `Ctrl+S`, **Then** o aplicativo atualiza o `.nutridiet` e só informa conclusão do save principal depois que a gravação termina com sucesso.
3. **Given** existem registros confirmados pendentes no navegador, **When** o nutricionista muda de tela, **Then** o aplicativo inicia um checkpoint para o novo estado e conserva as alterações locais caso a gravação do arquivo falhe.
4. **Given** o checkpoint falha durante a navegação, **When** a nova tela abre, **Then** o aplicativo informa que o arquivo principal ainda precisa ser atualizado, mantém os dados no navegador e permite tentar novamente.
5. **Given** o arquivo principal foi atualizado com sucesso, **When** o nutricionista navega sem novas alterações, **Then** o arquivo não é gravado novamente.

### User Story 2 - Consultar a lista de pacientes com uma base grande (Priority: P1)

Como nutricionista, quero abrir e navegar pela lista de pacientes em páginas consultadas no banco, sem carregar todos os pacientes nem seus históricos clínicos, para encontrar pessoas com rapidez mesmo quando a Conta cresce.

**Why this priority**: A lista é uma tela de entrada frequente e precisa manter os dados que já exibe sem custo proporcional a todos os históricos.

**Independent Test**: Popular a base com 100 pacientes, 2.000 dietas e 2.000 avaliações; verificar a primeira página, busca, ordenação e ações atuais.

**Acceptance Scenarios**:

1. **Given** existem mais de 100 pacientes com dietas e avaliações, **When** o nutricionista abre `/pacientes`, **Then** a consulta retorna até 25 pacientes com os mesmos campos e ações atuais, sem carregar históricos completos.
2. **Given** a lista contém várias páginas, **When** o nutricionista busca ou muda de página, **Then** filtro, agrupamento, ordenação e contagens globais permanecem corretos e não dependem de uma consulta por paciente.
3. **Given** a página apresenta contagens, atividade e avaliações recentes, **When** os resumos são carregados, **Then** eles correspondem aos registros dos pacientes daquela página e mantêm a ordenação atual.

### User Story 3 - Navegar pelos históricos do perfil do paciente (Priority: P1)

Como nutricionista, quero consultar avaliações e dietas de um paciente em páginas leves e abrir o cardápio completo apenas quando necessário, para que cada consulta não carregue nem monte todo o histórico na memória da tela.

**Why this priority**: O perfil individual concentra históricos que crescem ao longo do atendimento e deve continuar ágil sem esconder informações clínicas.

**Independent Test**: Abrir o perfil de um paciente com milhares de avaliações e dietas, navegar nas páginas e abrir uma dieta; conferir os resumos e o cardápio.

**Acceptance Scenarios**:

1. **Given** o paciente tem mais de 25 avaliações ou dietas, **When** o nutricionista abre uma seção do histórico, **Then** a tabela apresenta até 25 registros e permite acessar todas as outras páginas.
2. **Given** o nutricionista muda de página, **When** os próximos registros são carregados, **Then** ordenação, contagem e ações continuam coerentes com o histórico.
3. **Given** o histórico de dietas é exibido, **When** o cardápio permanece fechado, **Then** os resumos mostram os mesmos valores nutricionais, metas, refeições, dias do ciclo e status de hoje.
4. **Given** o nutricionista abre uma dieta, **When** o detalhe é exibido, **Then** o cardápio completo corresponde à dieta salva.
5. **Given** o nutricionista altera cadastro, avaliação ou acompanhamento, **When** o perfil é atualizado, **Then** o histórico dietético não é carregado novamente sem necessidade.

## Edge Cases

- Se a Conta não tiver pacientes, ou o paciente não tiver avaliações ou dietas, manter os estados vazios existentes.
- Se houver exatamente 25 registros, não apresentar uma página adicional vazia; após arquivamento, manter a página atual válida.
- Se uma consulta de página falhar, manter os dados anteriores visíveis ou o estado de erro existente, sem substituir um resumo correto por dados parciais.
- Se a gravação do `.nutridiet` falhar por permissão revogada, disco ou handle indisponível, preservar a área de trabalho local e não anunciar que o arquivo foi salvo.
- Se o navegador encerrar durante a digitação, recuperar somente drafts que já tenham sido persistidos localmente; não depender de gravação assíncrona de arquivo durante o fechamento.
- Se o arquivo de restauração for inválido ou incompatível, não substituir a base atual.
- Se houver mudanças locais pendentes antes da restauração, solicitar salvamento no arquivo principal ou descarte explícito antes de substituí-las.
- Se uma mutação acontecer durante um checkpoint, a sessão não pode ser marcada limpa com base em um snapshot anterior à mutação.

## Requirements

### Functional Requirements

- **FR-001**: O arquivo `.nutridiet` MUST permanecer como save principal e autoritativo da Conta. Uma gravação local no navegador não pode ser apresentada como checkpoint concluído do arquivo.
- **FR-002**: O aplicativo MUST manter no navegador os drafts e as alterações locais confirmadas que ainda não chegaram ao último checkpoint do arquivo.
- **FR-003**: Digitação, autosave de formulários e autosave de dieta em criação MUST NOT regravar o `.nutridiet` nem promover um draft a registro confirmado.
- **FR-004**: O aplicativo MUST tentar um checkpoint quando o usuário confirmar um save pelo comando existente, usar `Ctrl+S`, mudar de tela com alterações confirmadas pendentes ou solicitar nova tentativa após falha. Gatilhos simultâneos MUST compartilhar o mesmo checkpoint.
- **FR-005**: O aplicativo MUST NOT regravar o arquivo quando não houver alterações confirmadas pendentes.
- **FR-006**: Um checkpoint MUST conservar alterações que ocorram durante a gravação como pendentes, sem marcar esse estado posterior como salvo.
- **FR-007**: Se a gravação do arquivo falhar, o aplicativo MUST manter os dados no navegador, informar que o save principal está pendente e permitir nova tentativa; não pode anunciar sucesso.
- **FR-008**: Ao reabrir a Conta pelo `.nutridiet`, o aplicativo MUST recuperar alterações locais pendentes compatíveis com a Conta e o último checkpoint.
- **FR-009**: A restauração MUST validar o arquivo antes de substituir a área local, exigir confirmação e preservar os dados anteriores se falhar.
- **FR-010**: `/pacientes` MUST aplicar busca, agrupamento e ordenação atuais antes de limitar a consulta a até 25 pacientes por página, preservando os dados, ações e acessibilidade.
- **FR-011**: A lista MUST obter contagens, atividade e avaliações recentes em lote somente para a página consultada, sem carregar históricos completos nem fazer uma leitura individual para cada paciente.
- **FR-012**: O perfil MUST paginar avaliações e dietas em lotes de até 25, mantendo contagem total, ordenação e ações atuais.
- **FR-013**: O resumo da dieta MUST manter os mesmos valores nutricionais, metas, refeições, dias do ciclo, status e datas exibidos hoje e ser atualizado junto com o save da dieta; o cardápio completo só é carregado quando aberto.
- **FR-014**: Salvar dados clínicos MUST atualizar somente as informações afetadas, sem recarregar o histórico dietético inalterado.
- **FR-015**: Todas as consultas MUST respeitar a Conta e o paciente corretos.
- **FR-016**: A restauração de um `.nutridiet` compatível MUST preservar o conteúdo completo; resumos derivados ausentes podem ser reconstruídos. Saves experimentais só em memória não precisam ser migrados.

### Key Entities

- **Conta**: conjunto dos dados de um nutricionista e de seus pacientes, identificado pelo mesmo escopo nas consultas e saves.
- **Perfil do paciente**: dados clínicos, avaliações e dietas consultados na tela individual daquele paciente.
- **Save principal**: arquivo `.nutridiet` que representa o último checkpoint concluído e portátil da Conta.
- **Área de trabalho local**: dados e alterações pendentes mantidos no navegador, associados ao perfil e à versão-base do arquivo.
- **Draft**: formulário ou dieta ainda não confirmada; permanece recuperável localmente e não entra no save principal antes da confirmação e checkpoint.
- **Resumo de dieta**: valores necessários para o histórico, equivalentes à dieta completa salva.
- **Página de histórico**: até 25 avaliações ou dietas, com contagem para navegar o histórico.
- **Checkpoint**: gravação consistente da área de trabalho confirmada para o arquivo principal.

## Success Criteria

### Measurable Outcomes

- **SC-001**: No cenário local de teste com 100 pacientes, 2.000 dietas e 2.000 avaliações, a primeira consulta de `/pacientes` retorna até 25 pacientes e aparece em até 1 segundo, mantendo todos os campos e ações atuais.
- **SC-002**: No cenário de teste com 2.000 dietas e 2.000 avaliações para um paciente, a primeira página de cada histórico aparece em até 1 segundo e mostra no máximo 25 registros.
- **SC-003**: Digitação e autosave local não gravam o arquivo; navegação sem alterações pendentes também não regrava conteúdo.
- **SC-004**: Se a gravação do arquivo falhar, as alterações confirmadas permanecem recuperáveis no navegador e não são apresentadas como salvas no arquivo principal.
- **SC-005**: Depois de salvar ou restaurar, os dados exibidos e os totais nutricionais mantêm equivalência exata com os cálculos atuais.
- **SC-006**: O nutricionista consegue acessar todos os registros e o conteúdo completo de uma dieta sem perder campos ou ações disponíveis atualmente.

## Out of Scope

- Sincronização em nuvem, colaboração e edição simultânea em várias abas.
- Reconciliação automática de alterações feitas por outro aplicativo no arquivo `.nutridiet` enquanto o perfil está aberto.
- Migração de dados experimentais que só existiam em memória.

## Assumptions

- O produto continua com uma Conta local ativa e uma aba de edição por vez, conforme a arquitetura local existente.
- Acesso offline e dados não criptografados seguem as decisões de persistência já aprovadas; não haverá sincronização em nuvem.
- O arquivo é regravado em comandos explícitos e checkpoints de navegação; mudanças de campo não solicitam permissão nem abrem diálogos de arquivo.
- Se um checkpoint falhar durante a navegação, a navegação continua porque a área de trabalho local retém os dados; a interface sinaliza que o `.nutridiet` segue desatualizado.
- Uma restauração nunca mescla registros: pendências devem ser consolidadas ou descartadas com escolha explícita antes da substituição.
- Saves experimentais que só existiam em memória podem ser recriados. Arquivos `.nutridiet` compatíveis continuam sendo importáveis e restauráveis.
- O resumo nutricional é um dado derivado; o conteúdo completo salvo da dieta permanece a fonte para reconstrução e conferência.
- O arquivo associado é alterado por esta aplicação em uma única aba; alterações externas durante o perfil aberto não são sincronizadas automaticamente.
