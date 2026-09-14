# Feature Specification: Onboarding de Profile e Sessão por Save

**Feature Branch**: `[onboarding-profile-load-session]`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "Criar um onboarding de load/create profile antes de entrar na interface do app. Ao abrir qualquer pagina do app, verificar se existe uma sessão com save ativo e reutilizá-la. Criar /Home sem sidebar com os fluxos Criar profile e Carregar profile. Criar profile com nome e telefone lado a lado e botão de salvar com loading. Carregar profile abre o buscador para selecionar o profile existente no computador. Depois de criado ou carregado, liberar as páginas do app. Não manter dados clínicos rastreados no host, origem, porta ou navegador; o arquivo `.nutridiet` mantido no HD ou Google Drive é a persistência durável do conteúdo, e a referência técnica do arquivo pode ser retomada na mesma origem."

## Clarifications

### Session 2026-09-12

- Q: Ao concluir Criar profile, o sistema deve baixar automaticamente um primeiro arquivo `.nutridiet` ou apenas ativar a sessão e deixar o profissional usar Exportar backup depois? → A: O profissional escolhe onde salvar o primeiro arquivo `.nutridiet`.
- Q: Como o app deve sincronizar automaticamente cada alteração confirmada com o save escolhido: escrever no arquivo local autorizado pelo navegador, integrar diretamente com o Google Drive, ou gerar uma nova cópia para o profissional substituir? → A: Escrever no arquivo local escolhido e autorizado pelo profissional, incluindo uma pasta do Google Drive sincronizada no computador.
- Q: Em que momento uma alteração deve ser escrita automaticamente no arquivo associado: após cada operação explícita de salvar/confirmar, a cada alteração de campo com debounce, ou em outro intervalo definido? → A: Após cada operação explícita concluída de salvar/confirmar.

### Session 2026-09-13

- Q: Ao recarregar a página ou fechar e reabrir a aba, o NutriDiet deve voltar ao onboarding ou tentar retomar o último save? → A: Persistir somente a referência permissionada ao arquivo (File System Access handle) no IndexedDB do navegador e carregar automaticamente o arquivo na mesma origem quando o handle ainda estiver disponível. Dados clínicos, profile e drafts continuam fora do armazenamento do host; se a permissão exigir gesto ou o arquivo não existir, mostrar uma ação explícita para reabrir/selecionar o save.

## User Scenarios & Testing

### User Story 1 - Entrar somente com um profile ativo (Priority: P1)

Como nutricionista, quero que o sistema exija um profile/save antes de mostrar a interface clínica, para que eu nunca trabalhe em uma base vazia ou em um contexto de armazenamento incorreto.

**Why this priority**: É o controle de entrada que garante que todas as páginas internas estejam associadas ao save carregado.

**Independent Test**: Abrir diretamente uma rota interna em uma sessão sem profile e verificar o redirecionamento para `/Home`; depois ativar um profile e verificar o acesso à rota interna.

**Acceptance Scenarios**:

1. **Given** nenhuma sessão de profile está ativa, **When** o profissional abre qualquer rota interna do app, **Then** o sistema não exibe a interface interna e direciona para `/Home`.
2. **Given** existe uma sessão de profile ativa, **When** o profissional navega entre as rotas internas, **Then** o sistema reutiliza a mesma sessão sem pedir novo carregamento.
3. **Given** o profissional abre `/Home` com uma sessão ativa, **When** a página é carregada, **Then** o sistema utiliza a sessão existente e direciona o profissional para a interface interna padrão.

### User Story 2 - Criar um novo profile (Priority: P1)

Como nutricionista sem save existente, quero criar meu profile inicial antes de entrar no app, para iniciar uma nova base de trabalho que possa ser salva como arquivo.

**Why this priority**: É a porta de entrada para o primeiro uso e evita a criação silenciosa de uma conta padrão.

**Independent Test**: Abrir `/Home`, selecionar Criar profile, preencher nome e telefone, salvar e verificar que o profile fica ativo e que a interface interna é liberada.

**Acceptance Scenarios**:

1. **Given** `/Home` está visível, **When** o profissional seleciona Criar profile, **Then** um diálogo exibe somente Nome e Telefone, lado a lado, e um botão para salvar com estado de carregamento.
2. **Given** o nome obrigatório está preenchido, **When** o profissional confirma o cadastro, **Then** o profile é criado na sessão atual, o profissional escolhe onde salvar o primeiro `.nutridiet`, os dados ficam disponíveis para o save e o profissional é levado à interface interna.
3. **Given** o nome está vazio ou inválido, **When** o profissional tenta salvar, **Then** o sistema informa o erro, não ativa o profile e mantém o diálogo aberto.

### User Story 3 - Carregar um profile existente (Priority: P1)

Como nutricionista que já possui um save, quero selecioná-lo do computador, para continuar trabalhando com pacientes, dietas e configurações em qualquer origem do software online.

**Why this priority**: É o fluxo principal de portabilidade entre portas, dispositivos e deploys sem banco remoto.

**Independent Test**: Abrir `/Home`, selecionar Carregar profile, escolher um `.nutridiet` válido contendo um paciente e verificar que o profile e o paciente ficam disponíveis na interface interna.

**Acceptance Scenarios**:

1. **Given** `/Home` está visível, **When** o profissional seleciona Carregar profile, **Then** o seletor de arquivos do computador é aberto diretamente.
2. **Given** o profissional seleciona um `.nutridiet` válido, **When** o carregamento termina, **Then** o profile, os pacientes e os demais dados confirmados são carregados na sessão e a interface interna é liberada.
3. **Given** o arquivo é inválido, incompatível ou pertence a outra aplicação, **When** o profissional tenta carregá-lo, **Then** o sistema apresenta uma mensagem de erro, não cria uma sessão parcial e permanece em `/Home`.
4. **Given** o profissional cancela o seletor de arquivos, **When** o seletor é fechado, **Then** nenhum dado é alterado e os dois fluxos de entrada continuam disponíveis.

### User Story 4 - Trabalhar sem persistência de dados vinculada ao host (Priority: P1)

Como nutricionista, quero que os dados clínicos só sejam persistidos pelo arquivo `.nutridiet` que controlo, para que `localhost:3000`, `localhost:3001`, a Vercel e outros hosts não mantenham bases independentes ou rastros clínicos.

**Why this priority**: É a restrição arquitetural central para garantir soberania e portabilidade do save.

**Independent Test**: Criar ou carregar um profile, navegar e editar dados durante a sessão, recarregar na mesma origem e verificar a retomada pelo arquivo associado; abrir outra origem e verificar que a sessão não é recuperada automaticamente; carregar o mesmo arquivo exportado e verificar a recuperação integral dos dados.

**Acceptance Scenarios**:

1. **Given** uma sessão ativa em uma origem, **When** o profissional recarrega a página ou fecha e reabre a aba na mesma origem, **Then** o sistema tenta recuperar somente o handle do arquivo associado e recarrega os dados a partir do `.nutridiet`; ao abrir outra origem, não recupera dados clínicos do host e exige um profile/save ativo.
2. **Given** o profissional exportou um `.nutridiet`, **When** carrega esse mesmo arquivo em outra origem, **Then** os dados confirmados do arquivo ficam disponíveis independentemente da porta ou host.
3. **Given** o profissional usa o app durante uma sessão ativa, **When** navega entre páginas internas, **Then** os dados da sessão permanecem disponíveis sem exigir novo carregamento a cada rota.
4. **Given** o profissional conclui uma operação explícita de salvar/confirmar, **When** a operação termina com sucesso, **Then** o save associado é atualizado automaticamente com o estado confirmado.

### Edge Cases

- O profissional acessa uma URL interna diretamente sem profile ativo.
- O profissional abre `/Home` enquanto já existe uma sessão ativa.
- O arquivo selecionado está vazio, truncado, malformado, em versão não suportada ou sem a Conta/profile exigida.
- O arquivo válido contém zero pacientes; o profile ainda deve ser carregado sem inventar pacientes.
- O arquivo válido contém pacientes, incluindo registros arquivados e histórico confirmado; o carregamento não pode perder esses dados.
- O profissional cancela a seleção do arquivo.
- O profissional tenta criar profile sem nome.
- O usuário inicia uma operação de criação/carregamento e tenta clicar novamente antes da conclusão.
- O navegador não permite o seletor ou a operação de arquivo; o sistema deve exibir erro acionável sem criar sessão parcial.
- O profissional recarrega a página ou fecha e reabre a aba; a sessão em memória é recriada a partir do arquivo associado quando o handle permissionado puder ser recuperado, caso contrário o sistema deve informar a necessidade de reabrir o save.
- O profissional alterna entre `localhost:3000`, `localhost:3001`, Vercel preview e Vercel production; nenhuma dessas origens deve ser fonte automática de dados clínicos.
- O profissional nega a permissão de escrita, move, renomeia ou remove o arquivo associado ao save durante a sessão.
- O arquivo é alterado externamente enquanto o app mantém uma sessão ativa.
- A permissão para escrever no arquivo é revogada ou o arquivo deixa de estar disponível; o app deve preservar a sessão em memória, informar que o save está desconectado e não usar armazenamento alternativo silencioso.

## Requirements

### Functional Requirements

- **FR-001**: O sistema MUST oferecer a rota `/Home` como ponto de entrada sem sidebar e sem conteúdo das páginas internas.
- **FR-002**: O sistema MUST verificar a existência de uma sessão ativa antes de renderizar qualquer página interna do app.
- **FR-003**: O sistema MUST redirecionar para `/Home` quando uma página interna for acessada sem profile/save ativo.
- **FR-004**: O sistema MUST reutilizar a sessão ativa durante a navegação interna da mesma aba, sem reinicializar ou substituir o profile a cada rota.
- **FR-005**: O sistema MUST NOT criar ou ativar automaticamente uma Conta/profile padrão quando não houver sessão ativa.
- **FR-006**: A tela `/Home` MUST oferecer os fluxos Criar profile e Carregar profile.
- **FR-007**: O fluxo Criar profile MUST abrir um diálogo contendo somente os campos Nome e Telefone, dispostos lado a lado, e um botão de salvar abaixo com estado visual de carregamento durante a operação.
- **FR-008**: O campo Nome MUST ser obrigatório; o campo Telefone MUST ser opcional e, quando preenchido, aceitar o formato de contato definido pelo produto sem criar campos adicionais no onboarding.
- **FR-009**: Ao concluir a criação, o sistema MUST ativar o profile na sessão em memória, solicitar ao profissional a escolha do local do primeiro arquivo `.nutridiet` e liberar o acesso às páginas internas somente após concluir essa operação ou informar claramente o estado do save.
- **FR-010**: O profile criado MUST conter nome e telefone e MUST ser incluído no próximo save `.nutridiet` exportado.
- **FR-011**: O fluxo Carregar profile MUST abrir diretamente o seletor de arquivos do computador, aceitando o arquivo mestre `.nutridiet`.
- **FR-012**: O sistema MUST validar o arquivo antes de modificar a sessão atual, incluindo formato, aplicação, versão, profile/Conta, tipos, IDs e relações.
- **FR-013**: O sistema MUST carregar atomicamente o profile e os dados confirmados do arquivo válido, incluindo pacientes, dietas, biblioteca, avaliações, acompanhamentos, históricos e arquivados quando presentes.
- **FR-014**: O sistema MUST liberar o acesso às páginas internas somente depois que o carregamento do profile for concluído com sucesso.
- **FR-015**: O sistema MUST rejeitar arquivos inválidos, incompatíveis ou incompletos sem criar uma sessão parcial e MUST informar o motivo de forma acionável.
- **FR-016**: O sistema MUST preserve a sessão anterior quando uma operação de carregamento falhar ou for cancelada.
- **FR-017**: O sistema MUST NOT persistir dados clínicos, profile ou drafts em armazenamento vinculado ao host, origem, porta, navegador ou servidor; PODE persistir somente uma referência permissionada ao arquivo ativo para retomada na mesma origem, enquanto a única persistência durável dos dados MUST ser o arquivo `.nutridiet` escolhido pelo profissional.
- **FR-018**: O sistema MUST keep data loaded in the active session available while the same tab navigates through internal routes.
- **FR-019**: Ao recarregar a página ou fechar e reabrir a aba na mesma origem, o sistema MUST tentar recuperar o handle do último arquivo ativo e carregar o `.nutridiet` automaticamente; se o handle, o arquivo ou a permissão não estiverem disponíveis, MUST exibir `/Home` com uma ação para reabrir o save. Uma nova origem MUST iniciar sem sessão clínica e exigir o onboarding.
- **FR-020**: O sistema MUST preserve the existing clinical pages and operations after a profile is created or loaded, without requiring an online database or synchronization service.
- **FR-021**: O sistema MUST provide accessible labels, keyboard operation, visible focus, loading feedback and error feedback for all onboarding controls.
- **FR-022**: O sistema MUST ensure that a real backup containing at least one patient can be loaded in a different origin and that the patient is visible after loading.
- **FR-023**: O sistema MUST associate the active session with the selected local `.nutridiet` file after the professional grants write permission and MUST write the complete confirmed state to that file after every explicit successful save/confirmation operation, without creating a host-based clinical database.
- **FR-024**: If write permission is denied, revoked, or the selected file becomes unavailable, the system MUST preserve the active in-memory session, visibly identify that synchronization is paused, and MUST NOT silently fall back to browser or server storage.
- **FR-025**: If write permission is denied, revoked, or the selected file becomes unavailable, the system MUST preserve the active in-memory session, visibly identify that synchronization is paused, and MUST NOT silently fall back to browser or server storage.
- **FR-026**: Após criação ou carregamento bem-sucedido, o sistema MUST guardar a referência do arquivo ativo no armazenamento de handles do navegador e MUST limpar ou invalidar a referência quando o arquivo não puder mais ser encontrado; a referência nunca pode conter o envelope clínico.

### Key Entities

- **Profile**: Identidade do profissional que possui o save, com nome e telefone, e as configurações necessárias para iniciar ou continuar uma sessão.
- **Active Session**: Contexto temporário em que o profile e seus dados confirmados estão carregados para uso durante a vida da aba; não é uma fonte durável.
- **NutriDiet Save**: Arquivo `.nutridiet` escolhido pelo profissional, contendo o profile e os dados confirmados necessários para restaurar o trabalho.
- **Patient**: Pessoa vinculada ao profile, preservando identificação, status, histórico clínico, dietas e relacionamentos existentes no save.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Em 100% dos acessos a rotas internas sem sessão ativa, o profissional é direcionado para `/Home` antes de visualizar conteúdo clínico.
- **SC-002**: Um profissional consegue criar um profile com nome e telefone e chegar à primeira página interna em até 2 minutos.
- **SC-003**: Um arquivo `.nutridiet` válido contendo pelo menos um paciente é carregado com sucesso em outra porta/origem, e o paciente fica visível em até 10 segundos após a confirmação, em pelo menos 95% das tentativas.
- **SC-004**: Após a criação ou carregamento bem-sucedido, 100% das rotas internas principais reutilizam o mesmo profile ativo durante a navegação da aba.
- **SC-005**: Em 100% dos testes de troca de porta/host/origem, nenhum dado clínico é recuperado automaticamente do host; em recarregamentos e reaberturas na mesma origem, o arquivo associado é retomado automaticamente quando o navegador disponibilizar o handle e a permissão.
- **SC-006**: Arquivos inválidos ou cancelamentos não deixam sessões parciais nem alteram a sessão anterior em 100% dos cenários testados.
- **SC-007**: O onboarding atende aos critérios de acessibilidade aplicáveis do produto, incluindo navegação por teclado, rótulos compreensíveis, foco visível e feedback de loading/erro.
- **SC-008**: Após cada operação explícita de salvar/confirmar concluída com sucesso, o arquivo associado reflete o estado confirmado sem exigir um segundo comando manual do profissional.

## Assumptions

- A sessão clínica ativa dura somente enquanto o runtime estiver vivo na aba; não haverá prazo de expiração adicional nem renovação de dados clínicos persistida.
- A navegação interna é uma navegação da aplicação; uma atualização completa ou reabertura na mesma origem tenta reconstruir o runtime pelo arquivo associado, enquanto uma nova origem começa sem sessão.
- Ao criar um profile, o profissional escolhe o local do primeiro arquivo `.nutridiet`.
- O arquivo pode estar em uma pasta sincronizada do Google Drive ou no HD; integração direta com a API do Google Drive está fora deste escopo.
- O carregamento de um arquivo substitui o contexto da sessão sem mesclagem, preservando as regras existentes de restauração.
- O arquivo selecionado para sincronização permanece associado à sessão atual e pode ter somente seu handle permissionado lembrado no IndexedDB da mesma origem; o conteúdo, profile, dados clínicos e drafts não são armazenados ali, nem em cookies, localStorage ou servidor.
- A sincronização automática ocorre após cada operação explícita de salvar/confirmar; alterações intermediárias de campos e rascunhos não são gravadas no arquivo até serem confirmadas.
- O telefone é opcional salvo validação futura do produto; não serão criados campos adicionais no onboarding.
- O termo "alert" significa um diálogo modal acessível, consistente com os componentes já existentes no produto.
- O escopo continua desktop a partir de 1024px, conforme a constituição e o design system do projeto.
