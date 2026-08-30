# Feature Specification: Conta e pacientes

**Feature Branch**: `30-08-26-dieta-db-segunda-etapa`

**Created**: 2026-08-30

**Status**: Draft

**Input**: User description: "Criar o SDD da segunda etapa de refs/dieta-db. A segunda etapa é Conta e pacientes: persistir o perfil local e o cadastro de pacientes, incluindo edição e arquivamento, preservando o contrato de restauração sem criar tela administrativa futura, sem migrar dados de teste e sem implementar código nesta etapa documental."

## Contexto e objetivo

Esta etapa entrega a primeira fronteira de dados clínicos sobre a base local
aprovada na etapa 1: uma Conta local pertencente a um profissional e seus
pacientes. O nutricionista deve conseguir manter o cadastro atual de cada
paciente sem perder o histórico relacionado quando um paciente deixar de ser
atendido.

A etapa cobre o comportamento observável das telas de pacientes e os
contratos de aplicação/persistência necessários para sustentá-las. A interface
continua usando casos de uso; nenhum componente decide como gravar, arquivar,
restaurar ou localizar dados.

As decisões de domínio usadas como fonte são:

- [Decisão 02 — Ciclo de Vida e Persistência do Paciente](../../refs/dieta-db/02-ciclo-de-vida-e-persistencia-do-paciente.md);
- [Decisão 03 — Contrato de Interação da Tela de Pacientes](../../refs/dieta-db/03-contrato-de-interacao-da-tela-de-pacientes.md);
- [Decisão 05 — Arquitetura de Backend e Escopos de Dados](../../refs/dieta-db/05-arquitetura-backend-e-escopos-de-dados.md);
- [Decisão 14 — Consolidação e Divisão da Implementação em SDDs](../../refs/dieta-db/14-consolidacao-e-portao-de-execucao.md).

## Escopo

### Incluído

- perfil local da Conta e contexto da Conta ativa;
- cadastro, consulta, listagem de pacientes ativos, edição e arquivamento;
- restauração como contrato de aplicação/persistência, sem tela administrativa
  nesta etapa;
- dados cadastrais atuais, contatos normalizados, objetivo atual e metas
  padrão do paciente;
- catálogo da Conta para objetivos personalizados, com adição explícita e
  idempotente;
- telas `/pacientes` e `/pacientes/[id]`, seus formulários e modais diretamente
  ligados a criação, edição e arquivamento;
- isolamento por `accountId`, versionamento de registros e operações atômicas;
- preservação das relações clínicas já existentes e descarte do armazenamento
  legado de teste.

### Fora de escopo

- persistência ou migração de dietas, drafts, avaliações físicas, consultas ou
  próximos acompanhamentos; essas entregas pertencem às etapas posteriores;
- tela administrativa para localizar/restaurar pacientes arquivados;
- exclusão física definitiva e política de retenção legal;
- login online, múltiplos profissionais, colaboração, sincronização, outbox,
  nuvem e armazenamento clínico remoto;
- exportação/importação, criptografia, senha e backup automático;
- conversão de chaves ou registros atuais de `localStorage`;
- criação de novos módulos clínicos, agenda, prontuário ampliado ou mudança da
  proposta visual do produto.

## Dependências e limites entre etapas

- A etapa 1 deve ter aprovado o adaptador local e suas garantias de
  persistência, atomicidade, escopo, migration e exclusividade de aba antes da
  implementação desta etapa.
- Os contratos de dieta, avaliação e acompanhamento futuros devem referenciar
  `patientId` e `accountId`, sem embutir arrays ou cópias canônicas no paciente.
- Arquivar um paciente deve deixar uma fronteira explícita para invalidar
  drafts locais associados quando a etapa de dietas estiver implementada, mas
  não implementa `DietDraft` nesta etapa.
- O comportamento offline é o da base local depois que os recursos da
  aplicação estiverem preparados; esta etapa não cria PWA ou cache avançado.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manter a Conta local ativa (Priority: P1)

Como nutricionista, quero abrir o consultório local com uma Conta estável, para
que meus pacientes pertençam a um único contexto de propriedade e possam ser
reutilizados pelos fluxos clínicos posteriores.

**Why this priority**: Sem uma Conta ativa e estável, não existe fronteira
confiável para pacientes nem proteção contra leitura e gravação fora do
contexto do consultório.

**Independent Test**: Abrir uma base preparada da etapa 1, obter o contexto da
Conta, cadastrar um paciente e confirmar que o paciente retorna associado à
mesma Conta após fechar e reabrir a aplicação.

**Acceptance Scenarios**:

1. **Given** uma base local inicializada sem dados legados, **When** a aplicação
   abre o contexto do profissional local, **Then** disponibiliza uma Conta
   estável com identidade e configurações próprias para as operações da etapa.
2. **Given** um paciente pertencente à Conta ativa, **When** uma operação tenta
   consultar ou alterar o paciente usando outra Conta, **Then** a operação é
   rejeitada e nenhum dado é exposto ou alterado.
3. **Given** uma aplicação preparada e sem rede, **When** o nutricionista
   abre, consulta e altera pacientes, **Then** o fluxo local funciona sem
   chamadas remotas silenciosas.

### User Story 2 - Cadastrar e encontrar pacientes ativos (Priority: P1)

Como nutricionista, quero cadastrar um paciente e encontrá-lo rapidamente na
lista e no perfil, para iniciar o atendimento sem manter dados espalhados em
armazenamentos diferentes.

**Why this priority**: O cadastro é a porta de entrada para as dietas e demais
registros clínicos; ele precisa ser utilizável e persistente antes de qualquer
entrega dependente de paciente.

**Independent Test**: Criar pacientes com os campos válidos do formulário,
reabrir a lista, pesquisar por nome e objetivo e abrir o perfil de cada
resultado.

**Acceptance Scenarios**:

1. **Given** o formulário de novo paciente aberto, **When** o nutricionista
   informa nome obrigatório, contatos, dados atuais, objetivo e metas padrão e
   confirma, **Then** um paciente com identificador imutável é salvo na Conta,
   aparece na lista ativa e pode abrir seu perfil sem recarregar a página.
2. **Given** um formulário de novo paciente com nome vazio ou somente espaços,
   **When** o nutricionista tenta confirmar, **Then** o formulário permanece
   aberto, aponta o campo inválido e nada é salvo.
3. **Given** pacientes ativos persistidos, **When** o nutricionista pesquisa por
   nome ou objetivo e limpa a pesquisa, **Then** a lista mostra apenas os
   resultados correspondentes e depois restaura todos os ativos, sem qualquer
   mutação.
4. **Given** um identificador de paciente que não existe na Conta, **When** o
   nutricionista abre o perfil, **Then** a aplicação mostra o estado de não
   encontrado, oferece retorno à lista e não apresenta controles de gravação.
5. **Given** a leitura da lista falha, **When** `/pacientes` é carregada,
   **Then** a aplicação mostra erro recuperável e ação de tentar novamente, sem
   apresentar uma lista vazia como se não houvesse pacientes.

### User Story 3 - Editar o cadastro sem alterar o histórico (Priority: P1)

Como nutricionista, quero editar o cadastro atual em um formulário temporário,
para corrigir dados sem alterar dietas, avaliações ou outros registros já
salvos.

**Why this priority**: Peso, metas e dados de contato mudam ao longo do tempo,
mas uma prescrição ou registro clínico confirmado deve continuar representando
o momento em que foi salvo.

**Independent Test**: Abrir a edição de um paciente, alterar campos, cancelar,
descartar e salvar em tentativas separadas; verificar a versão do paciente e a
integridade dos registros relacionados.

**Acceptance Scenarios**:

1. **Given** um paciente persistido, **When** o nutricionista abre editar,
   altera campos e cancela, **Then** o cadastro, `updatedAt` e `version`
   permanecem inalterados.
2. **Given** um paciente persistido, **When** o nutricionista confirma alterações
   válidas, **Then** somente o cadastro atual é atualizado, `updatedAt` é
   renovado, `version` é incrementada e o perfil/lista refletem o novo estado.
3. **Given** uma edição com alterações não salvas, **When** o nutricionista
   fecha, pressiona `Esc`, clica fora ou navega para longe, **Then** recebe a
   confirmação **Descartar alterações?** e nenhuma alteração é descartada sem
   sua decisão.
4. **Given** dietas, avaliações ou outros filhos clínicos já persistidos,
   **When** o peso, nome, objetivo ou metas padrão do paciente são alterados,
   **Then** os registros relacionados permanecem intactos e não são
   recalculados pelo cadastro atual.
5. **Given** uma edição carregada com versão antiga, **When** outra operação
   atualiza o mesmo paciente antes da confirmação, **Then** a segunda confirmação
   falha com conflito recuperável e não sobrescreve a atualização mais recente.

### User Story 4 - Usar objetivos da Conta sem duplicidade (Priority: P2)

Como nutricionista, quero adicionar um objetivo personalizado à Conta durante
o cadastro/edição, para reutilizá-lo em pacientes sem criar cópias inconsistentes
do catálogo.

**Why this priority**: Objetivos são parte do cadastro e precisam ser
reutilizáveis, mas a Conta deve continuar sendo a proprietária do catálogo.

**Independent Test**: Adicionar um objetivo novo, repetir a mesma operação com
variações de espaços/caixa, aplicá-lo ao formulário e confirmar o paciente;
depois remover a opção do catálogo, quando essa operação existir, e verificar
que o valor já salvo continua no paciente.

**Acceptance Scenarios**:

1. **Given** a edição de um paciente aberta, **When** o nutricionista adiciona
   um objetivo personalizado válido, **Then** a opção normalizada é criada uma
   única vez na Conta, fica disponível no formulário e o paciente ainda não é
   alterado até salvar o cadastro.
2. **Given** uma opção personalizada já existente, **When** o nutricionista
   tenta adicioná-la novamente com diferença apenas de espaços ou capitalização,
   **Then** a operação é idempotente, não cria duplicata e mantém uma opção
   selecionável.
3. **Given** um paciente que já usa um objetivo salvo, **When** a opção
   correspondente deixa de estar disponível no catálogo, **Then** o valor
   persistido do paciente não é removido nem alterado.
4. **Given** o modal de objetivo personalizado aberto, **When** o nutricionista
   cancela ou ocorre erro de persistência, **Then** nenhuma opção nova é criada,
   o modal de edição permanece recuperável e o paciente não é atualizado.

### User Story 5 - Arquivar e preservar o paciente (Priority: P1)

Como nutricionista, quero arquivar um paciente sem apagar sua história, para
que a lista ativa permaneça limpa e os registros clínicos continuem disponíveis
para consulta futura.

**Why this priority**: Arquivamento é a operação segura para um cadastro que já
possui histórico; exclusão física criaria perda clínica e referências inválidas.

**Independent Test**: Arquivar um paciente com dados relacionados, verificar a
remoção da lista ativa e a preservação dos filhos; depois exercitar o contrato
de restauração sem depender de uma tela administrativa.

**Acceptance Scenarios**:

1. **Given** um paciente ativo com histórico relacionado, **When** o
   nutricionista escolhe **Arquivar Paciente** e conclui a confirmação
   prolongada, **Then** o paciente recebe estado arquivado, deixa a lista ativa
   e dietas, avaliações e histórico permanecem preservados.
2. **Given** o modal de arquivamento aberto, **When** o nutricionista cancela ou
   não conclui a confirmação, **Then** o paciente permanece ativo e nenhum filho
   é alterado.
3. **Given** um paciente arquivado, **When** uma operação tenta iniciar novo
   registro clínico, **Then** a operação é rejeitada com erro recuperável e o
   paciente não recebe novos dados.
4. **Given** um paciente arquivado, **When** o contrato `restorePatient` é
   executado por um fluxo autorizado da aplicação, **Then** `archivedAt` é
   removido, `updatedAt` é atualizado, `version` é incrementada e o histórico
   anterior permanece intacto.
5. **Given** uma falha durante o arquivamento, **When** a operação termina,
   **Then** o estado relacional anterior é preservado integralmente; qualquer
   limpeza local futura de drafts é tratada separadamente e não desfaz o
   arquivamento confirmado.

### Edge Cases

- Nome com espaços nas extremidades deve ser normalizado antes da validação e
  persistência; nome vazio após normalização deve ser rejeitado.
- Telefone e WhatsApp equivalentes devem ter uma forma persistida única; formato
  inválido deve gerar erro no campo sem salvar o formulário.
- Idade, altura, peso e metas não podem aceitar valores negativos; altura e
  peso, quando informados, devem ser positivos.
- Nome alterado deve recalcular iniciais de apresentação; iniciais não podem
  ser uma segunda fonte persistida de verdade.
- Identificadores inexistentes, Conta ausente e pacientes arquivados devem
  resultar em erros explícitos, nunca em criação implícita ou fallback para
  lista vazia.
- Uma versão antiga não pode sobrescrever um paciente atualizado desde que o
  formulário foi aberto.
- O arquivamento deve preservar registros filhos mesmo quando a lista ativa ou
  uma projeção de atividade falhar ao ser atualizada.
- O contrato de restauração deve ser idempotente ou retornar um erro controlado
  quando o paciente já estiver ativo; não pode duplicar paciente.
- Objetivos personalizados equivalentes após normalização não podem gerar duas
  opções da Conta.
- Os registros de teste armazenados nas chaves legadas não devem ser lidos,
  convertidos ou gravados pela nova arquitetura.
- A abertura da segunda aba é responsabilidade do portão da etapa 1; esta
  etapa não deve criar uma segunda fonte de dados nem contornar esse bloqueio.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST disponibilizar uma Conta local estável e um
  `AccountContext` para todas as operações desta etapa, sem login online ou
  seleção livre de `accountId` pela interface.
- **FR-002**: O sistema MUST persistir cada paciente com identificador
  imutável, `accountId`, nome obrigatório normalizado, dados cadastrais atuais,
  contatos normalizados, objetivo atual, metas padrão, timestamps, versão e
  estado de arquivamento.
- **FR-003**: O sistema MUST permitir criar paciente por confirmação explícita,
  validar obrigatórios e valores numéricos, associar o registro à Conta ativa e
  retornar a entidade criada para atualização do perfil/lista.
- **FR-004**: O sistema MUST listar somente pacientes ativos, consultar um
  paciente por sua Conta e apresentar estados distintos de carregamento, lista
  vazia de primeiro cadastro, nenhum resultado de busca, não encontrado e erro
  recuperável.
- **FR-005**: O sistema MUST permitir filtrar pacientes por nome e objetivo sem
  gravar, criar histórico, atualizar atividade ou alterar qualquer registro.
- **FR-006**: O sistema MUST manter criação e edição em formulário temporário;
  cancelar, fechar sem confirmar ou descartar deve deixar o último estado
  persistido inalterado.
- **FR-007**: O sistema MUST salvar uma edição válida de paciente
  atomicamente, atualizar `updatedAt`, incrementar `version` e rejeitar uma
  versão esperada obsoleta sem sobrescrita silenciosa.
- **FR-008**: O sistema MUST manter objetivos padrão e personalizados no
  catálogo da Conta; adicionar objetivo personalizado deve ser explícito,
  normalizado e idempotente, e não deve atualizar o paciente antes do salvamento
  explícito do cadastro.
- **FR-009**: O sistema MUST impedir que a remoção ou indisponibilidade de um
  objetivo do catálogo altere pacientes que já tenham esse valor salvo.
- **FR-010**: O sistema MUST substituir a operação de exclusão normal por
  arquivamento lógico, registrando `archivedAt`, atualizando `updatedAt` e
  `version`, removendo o paciente das listas ativas e preservando todas as
  relações clínicas existentes.
- **FR-011**: O sistema MUST impedir novas operações clínicas sobre paciente
  arquivado e MUST preservar uma fronteira para invalidar drafts locais
  associados quando o módulo de dietas for entregue.
- **FR-012**: O sistema MUST expor o contrato `restorePatient` de modo que um
  fluxo autorizado possa reativar um paciente arquivado sem duplicá-lo, sem
  apagar seu histórico e sem exigir nesta etapa uma tela administrativa.
- **FR-013**: O sistema MUST validar `accountId` em toda consulta e mutação,
  rejeitando paciente inexistente, referência de outra Conta ou relação fora do
  escopo, sem expor dados de outra Conta.
- **FR-014**: O modelo do paciente MUST conter somente estado cadastral e
  projeções permitidas; dietas, avaliações, consultas e atividades históricas
  devem permanecer em entidades/repositórios relacionados, não em arrays
  canônicos embutidos no paciente.
- **FR-015**: O sistema MUST manter os valores já confirmados de dietas,
  avaliações e histórico independentes de alterações posteriores no cadastro
  atual do paciente.
- **FR-016**: Falhas de criação, edição, arquivamento, restauração ou objetivo
  personalizado MUST produzir resultado tipado e recuperável, sem sucesso
  falso e sem deixar mutações parciais.
- **FR-017**: A interface de `/pacientes` e `/pacientes/[id]` MUST chamar
  somente casos de uso e modelos de leitura, sem acesso direto a `localStorage`,
  IndexedDB, SQL ou tipos de provedor de persistência.
- **FR-018**: A implantação desta etapa MUST descartar o armazenamento legado de
  teste antes da primeira execução do modelo novo, sem migrador, adaptador de
  leitura ou gravação simultânea no storage anterior.
- **FR-019**: O sistema MUST cobrir com testes determinísticos a criação,
  consulta, busca, cancelamento, edição, conflito de versão, objetivo
  personalizado, arquivamento, preservação de filhos, bloqueio de operações em
  arquivado, restauração e rejeição de escopo inválido.

### Non-Functional Requirements

- **NFR-001**: Os fluxos de pacientes MUST funcionar no escopo desktop do
  produto, a partir de 1024px, usando os tokens e componentes do design system
  canônico; mobile, tablet e dark mode permanecem fora desta etapa.
- **NFR-002**: Todos os fluxos MUST cumprir WCAG 2.2 AA, incluindo semântica,
  nome/role/value, operação completa por teclado, foco visível, retorno de foco
  ao elemento que abriu o modal e confirmação acessível para arquivamento.
- **NFR-003**: Estados de carregamento, envio, sucesso, erro recuperável e
  conflito de versão MUST ser distinguíveis por texto e comportamento, sem
  depender somente de cor, ícone, hover ou mudança silenciosa da tela.
- **NFR-004**: A validação MUST usar somente dados sintéticos e uma fixture
  versionada, sem autenticação online, serviço remoto ou dados clínicos reais.
- **NFR-005**: Em uma fixture representativa de centenas de pacientes, a lista
  e a filtragem local devem apresentar feedback ao usuário em até 1 segundo
  após a base estar pronta; essa medição é evidência proporcional desta etapa,
  não uma certificação geral de volume.
- **NFR-006**: Todas as operações que alteram o paciente ou seu catálogo devem
  ser atômicas e reprodutíveis; uma falha não pode deixar estado parcial,
  duplicidade de objetivo ou duas versões válidas do mesmo paciente.
- **NFR-007**: A implementação MUST permanecer compatível com a persistência
  local e com a futura substituição por um adaptador online, sem expor detalhes
  do provedor aos casos de uso ou componentes.

### Key Entities

- **Account**: identidade e configurações do profissional que possui a base
  local; delimita a propriedade de todos os pacientes desta etapa.
- **AccountContext**: contexto validado da Conta ativa usado pelos casos de uso;
  não é um `accountId` arbitrário informado pela interface.
- **Patient**: estado cadastral atual de uma pessoa vinculada a uma Conta, com
  identificador imutável, dados pessoais, objetivo, metas padrão, versão,
  timestamps e arquivamento lógico.
- **ObjectiveOption**: opção de objetivo padrão ou personalizado pertencente à
  Conta; pode ser reutilizada por pacientes sem duplicar o catálogo.
- **PatientProfile**: projeção de leitura do paciente e de relações disponíveis
  para a tela de perfil; não é uma nova fonte canônica de dados.
- **PatientTimeline**: projeção derivada de eventos persistidos relacionados;
  não é um array embutido no paciente e não é atualizada por rascunhos futuros.
- **Related clinical record**: dieta, avaliação, consulta ou outro filho que
  referencia `patientId` e `accountId`; nesta etapa é preservado, não criado ou
  migrado.
- **Legacy test data**: registros existentes no armazenamento anterior, que
  serão descartados e não fazem parte do modelo novo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em uma base limpa, 100% dos cenários de criação, consulta, edição,
  arquivamento e restauração definidos nesta especificação passam sem criar
  registros duplicados ou parcialmente persistidos.
- **SC-002**: Após criar um paciente, ele aparece na lista ativa e no perfil em
  até 1 segundo após a confirmação em uma fixture local representativa; cancelar
  ou descartar deixa zero alterações persistidas.
- **SC-003**: Para 100% dos pacientes arquivados na validação, a lista ativa não
  os exibe, novas operações clínicas são rejeitadas e todos os registros
  relacionados permanecem consultáveis e inalterados.
- **SC-004**: 100% das tentativas de acesso usando Conta incorreta, paciente
  inexistente ou versão obsoleta são rejeitadas com feedback acionável e sem
  exposição ou sobrescrita de dados.
- **SC-005**: Repetir a criação de um objetivo personalizado equivalente após
  normalização produz exatamente uma opção da Conta em 100% dos casos testados,
  e retirar a opção não altera nenhum paciente que já a utilize.
- **SC-006**: A validação de implantação encontra zero leitura ou gravação nas
  chaves legadas e zero migrador/adaptador de dados de teste; a base nova inicia
  com uma única fonte canônica.
- **SC-007**: Usuários conseguem completar os fluxos primários de criar,
  editar, cancelar e arquivar usando apenas teclado, com foco visível e sem
  perda de alterações não salvas, em todos os cenários de acessibilidade
  previstos.
- **SC-008**: Depois de os recursos da aplicação estarem preparados, 100% dos
  fluxos locais de pacientes exercitados na fixture concluem sem rede e sem
  chamadas remotas silenciosas.

## Assumptions

- A etapa 1 será aprovada pela revisão humana e fornecerá a persistência local,
  transações, migrations e bloqueio de segunda aba necessários.
- Existe um único profissional e uma única Conta local ativa na V1; o modelo
  preserva `Account` como fronteira conceitual para evolução futura.
- O catálogo de objetivos padrão já pode ser fornecido pela aplicação; esta
  etapa adiciona somente opções personalizadas explicitamente criadas pelo
  nutricionista.
- Valores atuais de idade, altura, peso, gênero, objetivo e metas padrão são
  dados cadastrais; uma alteração posterior não reescreve snapshots de outros
  módulos.
- Datas persistidas usam um formato inequívoco e a apresentação localizada é
  responsabilidade da interface.
- Identificadores são gerados fora dos componentes e permanecem imutáveis;
  UUID v7 é a preferência arquitetural quando a implementação escolher o
  formato físico.
- A restauração será exercitada por contrato/caso de uso ou harness de teste;
  sua tela administrativa fica para uma entrega futura.
- A limpeza/invalidação de drafts será integrada quando o SDD de dietas for
  executado; a etapa atual não cria um armazenamento de drafts.
- O histórico e os filhos usados nos testes podem ser fixtures ou contratos já
  fornecidos por etapas correlatas; esta etapa não os recria nem os migra.
- O escopo de produto continua exclusivamente desktop a partir de 1024px e
  segue a constituição e o design system canônico do repositório.

## Validation Notes

Esta especificação está pronta para a auditoria de clarificação. Qualquer
decisão que altere o que pertence à Conta, o significado de arquivar ou os
limites entre pacientes e módulos clínicos deve atualizar primeiro este
documento e as decisões correspondentes em `refs/dieta-db/`.
