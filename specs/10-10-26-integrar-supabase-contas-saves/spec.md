# Feature Specification: Contas Supabase e acesso autorizado aos saves

**Feature Branch**: branch existente `codex/diet-pdf-export` preservada; nenhuma branch criada nesta etapa.

**Created**: 2026-10-10

**Status**: Implementação e publicação foram autorizadas. O app está em Production em `https://nutridiet-eight.vercel.app`; T024 e T029 foram concluídas com provas remotas. T026 segue aberta para a validação pendente de Edge e do picker nativo do Windows. Histórico e limites estão em `implementation-log.md` e `validation-report.md`.

**Input**: Pedido completo preservado em [.sdd-context.json](./.sdd-context.json), ampliado em 2026-10-11 para publicação: landing placeholder, login, cadastro e recuperação, identidade e banco no Supabase, dashboard dos saves locais e vínculo permanente entre conta e save. Todas as operações remotas devem ser autorizadas pelo backend. Hospedar o app na Vercel com o endereço `vercel.app` do projeto; usar Gmail no SMTP inicial. Sem domínio próprio informado.

## Objetivo, atores e limites

Preparar o acesso online do profissional ao NutriDiet, com um catálogo dos seus arquivos locais e proteção contra acesso de outras contas. O fluxo de entrada passa a ser landing, autenticação, seleção ou criação de save e área normal do aplicativo.

Os atores são visitante sem sessão, profissional com conta online e proprietário de um ou mais saves. Outro profissional autenticado é um ator não autorizado para saves que não lhe pertencem. Não existem equipes, compartilhamento ou transferência de propriedade no pedido.

Esta execução inclui implementação e publicação da aplicação Next.js na Vercel, além do schema/Auth dedicado no Supabase. O endereço público usa o domínio `vercel.app` associado ao projeto; DNS ou domínio próprio e deploy de Edge Functions continuam fora do escopo. A publicação só é funcional depois de configurar variáveis server-side, migration, Auth/SMTP e callbacks para o endereço efetivo.

O arquivo local continua sendo o save solicitado. “Sincronizado” nesta dashboard significa encontrar e reconhecer o arquivo na localização autorizada lembrada neste navegador; não significa upload ou cópia na nuvem. O estado de localização é diferente do estado de gravação de alterações no arquivo, que já existe no aplicativo.

## Clarifications

### Session 2026-10-10

- Q: Qual modelo de proteção dos dados deve ser adotado: chave controlada pelo backend ou ponta a ponta estrita sem decifração pelo servidor? → A: Opção A — chave controlada pelo backend. O servidor pode utilizá-la após validar a conta; o segredo não aparece no save. Recuperação de senha mantém o vínculo permanente do save.
- Q: Quando a internet deve ser obrigatória: login/criação/abertura com continuidade offline, reabertura offline durante oito horas ou conexão contínua? → A: Opção A — internet para login, criação e abertura de saves. Um save já aberto permite trabalho offline por até oito horas após a validação.
- Q: Onde deve acontecer a criptografia do save: processamento temporário no backend ou conteúdo inteiramente local com material criptográfico autorizado no navegador? → A: Opção B — conteúdo clínico permanece no computador; após autorização do backend, o navegador usa material criptográfico para abrir e gravar o arquivo, inclusive durante a janela offline. Isso não concede acesso ao banco Supabase; a chave não aparece no save, mas o navegador autorizado precisa conseguir utilizá-la.
- Q: Como tratar saves antigos sem proprietário online: primeira vinculação ao importar ou adiar importação legada? → A: Opção A — a primeira conta autenticada que importa uma identidade legada ainda não vinculada torna-se proprietária do save protegido. Criar uma cópia criptografada e preservar o original; a proteção começa na nova cópia, e o original continua legível e não comprova seu dono histórico.
- Q: Posso fechar o cadastro com login por e-mail, verificação por link, média mensal, atuação em anos e campos obrigatórios com números não negativos? → A: Ajuste ao padrão proposto: incluir as opções “1–6 meses” e “6–12 meses” no tempo de atuação, além de anos. Os demais elementos do padrão proposto são mantidos. As faixas são respostas autodeclaradas e não devem ser convertidas em uma duração exata.
- Execução iniciada: em 2026-10-10, o usuário autorizou `$sdd-implement` e projeto Supabase dedicado na organização Jacquinho, plano Free, região São Paulo; naquele momento, publicação não fazia parte do pedido. Em 2026-10-11, autorizou publicar a aplicação pela conta Vercel atual, sem domínio próprio, e escolheu Gmail como remetente inicial. O nome do projeto Vercel pode ser decidido pelo executor; usar endereço `vercel.app`. Migration e Auth remotos dependem de SMTP e segredos provisionados.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entrar ou criar uma conta profissional (Priority: P1)

O visitante acessa a landing provisória, entra com suas credenciais ou cria sua conta com os dados pedidos. Depois de autenticado, chega à dashboard dos seus saves.

**Why this priority**: A identidade autenticada é necessária para identificar o proprietário e autorizar o acesso aos saves.

**Independent Test**: Exercitar entrada e cadastro sem precisar abrir dados clínicos; conferir campos, validação no servidor, sessão e destino após login.

**Acceptance Scenarios**:

1. **Given** um visitante, **When** abre a landing, **Then** vê o texto “Landing page” e consegue navegar para login e criação de conta.
2. **Given** a página de login, **When** ela é exibida, **Then** oferece login, senha, botão Entrar e ação discreta Recuperar senha abaixo do botão principal.
3. **Given** o cadastro, **When** ele é exibido, **Then** oferece nome, sobrenome do profissional, e-mail, confirmação de e-mail, senha, confirmação de senha, média de pacientes atendidos e tempo de atuação como nutricionista.
4. **Given** confirmações divergentes, campos inválidos ou obrigatórios ausentes, **When** o formulário é enviado inclusive por requisição forjada, **Then** o servidor recusa a operação e apresenta erros associados aos campos sem registrar senha ou suas confirmações.
5. **Given** credenciais válidas e uma conta apta a entrar, **When** o login termina, **Then** a dashboard de saves é aberta sem expor dados de outro profissional.
6. **Given** credenciais incorretas, **When** o login é tentado, **Then** apresenta falha sem revelar se o e-mail existe e sem criar uma sessão autorizada.
7. **Given** o campo tempo de atuação, **When** o profissional preenche o cadastro, **Then** pode escolher “1–6 meses”, “6–12 meses” ou informar anos como número não negativo, incluindo zero e frações; a seleção de faixa dispensa informar quantidade exata de anos.
8. **Given** e-mail ainda não verificado, **When** tenta entrar na área privada, **Then** não recebe acesso à dashboard nem a saves até confirmar o link de verificação; o e-mail é o identificador do login.

### User Story 2 - Recuperar acesso à conta (Priority: P1)

O profissional solicita recuperação de senha com seu e-mail e redefine a senha por uma autorização válida de recuperação.

**Why this priority**: Perder a senha não deve inutilizar o vínculo permanente com saves pertencentes à conta.

**Independent Test**: Solicitar recuperação, consumir uma autorização válida e tentar reutilizá-la, sem depender da dashboard clínica.

**Acceptance Scenarios**:

1. **Given** a tela de recuperação, **When** aberta, **Then** apresenta e-mail, envio da solicitação e retorno para o login.
2. **Given** qualquer e-mail com formato válido, **When** a solicitação termina, **Then** a resposta pública é equivalente para contas existentes e inexistentes.
3. **Given** uma autorização de recuperação válida, **When** a nova senha e a confirmação são aceitas, **Then** o profissional pode entrar com a nova senha sem alterar a identidade da conta ou a chave permanente do save.
4. **Given** uma autorização expirada, inválida ou já utilizada, **When** tentam redefinir a senha, **Then** a operação é recusada e permite solicitar outro envio.

### User Story 3 - Encontrar e reabrir os próprios saves (Priority: P1)

O profissional vê todos os saves registrados em sua conta e a disponibilidade do arquivo local correspondente. Pode selecionar novamente um arquivo que não esteja acessível na localização lembrada.

**Why this priority**: O catálogo separa identidade online de arquivo local e oferece uma entrada clara no aplicativo.

**Independent Test**: Preparar saves pertencentes a dois profissionais, com referências locais acessíveis e ausentes, e conferir listagem, estado e recusa de acesso cruzado.

**Acceptance Scenarios**:

1. **Given** uma conta sem saves, **When** entra, **Then** vê estado vazio e a ação Criar novo save.
2. **Given** uma conta com saves registrados, **When** abre a dashboard, **Then** vê somente seus saves, identificados e acompanhados do estado Sincronizado ou Desincronizado.
3. **Given** a referência autorizada da última localização de um save, **When** o arquivo pode ser encontrado, lido e reconhecido como o esperado, **Then** o estado exibido é Sincronizado.
4. **Given** arquivo removido, movido, substituído por outro ou inacessível, **When** a localização é verificada, **Then** não anuncia Sincronizado e oferece uma ação explícita para localizar ou conceder acesso novamente.
5. **Given** um save novamente localizado pelo proprietário, **When** a identidade do arquivo e a autorização são validadas, **Then** a associação de localização é atualizada sem substituir a chave permanente.
6. **Given** um save válido selecionado, **When** a abertura é autorizada, **Then** chega à área normal já existente do aplicativo.
7. **Given** um save já aberto após validação online, **When** a internet cai durante as oito horas de autorização, **Then** o trabalho local pode continuar; login, criação e nova abertura de save continuam exigindo conexão.
8. **Given** autorização expirada ou logout, **When** o profissional tenta continuar acessando o save, **Then** deve validar o acesso online novamente, conservando trabalho confirmado e drafts sem expor os dados enquanto bloqueado.
9. **Given** um save aberto e autorização vigente, **When** grava um checkpoint inclusive durante a janela offline, **Then** a cifragem e a escrita do arquivo ocorrem localmente, sem enviar seu conteúdo clínico ao backend; só confirma o checkpoint após concluir a escrita.

### User Story 4 - Criar ou vincular um save com propriedade permanente (Priority: P1)

O profissional cria um save ou carrega um arquivo pela primeira vez. A primeira vinculação estabelece uma identidade permanente do save, seu proprietário e uma chave protegida. Aberturas seguintes verificam a conta autenticada e a vinculação criptográfica do arquivo.

**Why this priority**: O registro de um identificador sem prova de integridade não impede outro profissional de copiar ou adulterar o arquivo.

**Independent Test**: Criar e reabrir um save, tentar abri-lo por outra conta, modificar sua identificação e recuperar a senha do proprietário; verificar recusa de acessos indevidos e estabilidade da chave.

**Acceptance Scenarios**:

1. **Given** uma conta autenticada, **When** Criar novo save conclui a gravação inicial e a vinculação, **Then** aparece no catálogo da conta e abre a área normal do aplicativo.
2. **Given** um save já vinculado, **When** outra conta apresenta o mesmo arquivo ou sua cópia, **Then** o acesso é recusado sem permitir nova vinculação ao segundo profissional.
3. **Given** identificador, proprietário ou conteúdo protegido adulterados, **When** o arquivo é apresentado, **Then** a validação não aceita a adulteração nem substitui a área de trabalho atual.
4. **Given** um save do proprietário, **When** efetua novo login ou reabre o arquivo, **Then** a autorização verifica a identidade autenticada e a correspondência criptográfica; uma declaração enviada pela página não substitui essa verificação.
5. **Given** cancelamento, falha de rede ou de gravação durante o primeiro vínculo, **When** a operação termina, **Then** não declara sucesso nem destrói o arquivo ou trabalho anterior; uma repetição não cria um segundo proprietário ou uma nova chave para um vínculo concluído.
6. **Given** um save antigo válido cuja identidade legada ainda não foi vinculada, **When** um profissional autenticado confirma sua importação e a nova gravação conclui, **Then** torna-se proprietário da cópia protegida; o conteúdo é migrado localmente sem alterar o original ou enviar prontuários ao backend.
7. **Given** uma identidade legada já vinculada a outro profissional, **When** tenta adotá-la novamente, **Then** o backend recusa a vinculação. Um arquivo legado legível ou adulterado não comprova propriedade histórica; sua cópia original não recebe proteção retroativa.

### User Story 5 - Publicar a integração operacional (Priority: P2)

O profissional acessa a aplicação publicada na Vercel; os fluxos de conta usam o Supabase dedicado e e-mail de autenticação entregue pelo SMTP configurado.

**Why this priority**: Login, criação de conta e recuperação só atendem usuários reais quando hospedagem, origem, callbacks e envio de e-mail estão integrados.

**Independent Test**: Abrir o endereço Vercel final, criar e confirmar uma conta sintética, autenticar, solicitar recovery e acessar os próprios saves; verificar callbacks, cookies seguros e ausência de conteúdo clínico na rede.

**Acceptance Scenarios**:

1. **Given** o projeto Vercel e o Supabase estão configurados, **When** o deploy de produção termina, **Then** a aplicação responde em HTTPS sem expor segredos no bundle ou nos logs.
2. **Given** a landing publicada, **When** um profissional confirma o e-mail, entra e solicita recuperação, **Then** as mensagens chegam pelo SMTP Gmail configurado e os redirects retornam à origem aprovada.

### Edge Cases

- A referência local foi perdida ao limpar o navegador, mudar de dispositivo, perfil de navegador ou endereço do aplicativo: o catálogo remoto continua pertencendo à conta; localização local deve ser refeita.
- A permissão do navegador exige nova concessão: não interpretar permissão pendente como prova de que o arquivo foi apagado.
- Dois arquivos possuem o mesmo nome: nome e diretório não comprovam a identidade criptográfica do save.
- Dois logins ou duas tentativas de primeira vinculação concorrem: o vínculo não pode terminar com dois proprietários nem múltiplas chaves permanentes.
- Sessão expira ou profissional sai enquanto há gravações pendentes: proteger o acesso e conservar o trabalho confirmado; não apagar dados para simular logout.
- Falha no Supabase ou no envio de e-mail: não conceder acesso por erro e não anunciar envio, cadastro ou vínculo concluído sem evidência.
- Arquivo antigo em texto legível, versão incompatível ou estrutura malformada: preservar o original e validar antes de restaurar qualquer dado.
- Primeira adoção de identidade legada ainda livre registra o profissional autenticado como dono da nova cópia protegida. Não inferir o dono anterior pelo nome ou identificador legível do JSON; originais e cópias legadas adulteradas ficam fora da garantia criptográfica de propriedade histórica.
- Copiar um save que já foi vinculado não permite torná-lo propriedade de outra conta.
- Recuperação de senha mantém a chave permanente protegida sob controle do backend; redefinir a senha não deve regenerar a chave nem criar um novo vínculo para os mesmos saves.
- Acesso a dados clínicos que já foram exibidos no navegador e proteção contra o proprietário do dispositivo exigem limites explícitos; um controle de página não oferece sigilo absoluto sobre dados já entregues. O navegador autorizado pode usar material criptográfico durante a sessão; não prometer invisibilidade absoluta ao profissional que controla o dispositivo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Disponibilizar landing provisória com o texto “Landing page”, acesso ao login e ao cadastro, sem exigir conteúdo de marketing nesta fase.
- **FR-002**: Exibir no login os quatro elementos pedidos: login identificado pelo e-mail, senha, Entrar e Recuperar senha abaixo da ação principal; não criar um nome de usuário separado.
- **FR-003**: Exibir os oito dados de cadastro solicitados como obrigatórios: nome, sobrenome, e-mail, confirmação de e-mail, senha, confirmação de senha, média de pacientes por mês e tempo de atuação. A média aceita número não negativo, incluindo zero e frações. O tempo permite as respostas “1–6 meses”, “6–12 meses” ou anos informados como número não negativo, incluindo zero e frações; uma faixa de meses é autodeclarada e não deve ser convertida em duração exata. Confirmar a caixa de e-mail por link antes do primeiro acesso privado.
- **FR-004**: Validar no servidor campos obrigatórios, e-mail, confirmações e formatos das respostas profissionais; entradas negativas, não finitas, faixa não prevista ou confirmações divergentes não geram conta utilizável. As confirmações servem apenas à validação, sem persistência duplicada. A verificação por link é diferente da digitação de confirmação de e-mail.
- **FR-005**: Autenticar a conta, manter sua sessão, encaminhar login bem-sucedido à dashboard de saves e encerrar a sessão ao sair.
- **FR-006**: Permitir solicitar recuperação por e-mail e concluir redefinição com nova senha e confirmação mediante autorização de recuperação válida, de uso único e prazo limitado.
- **FR-007**: Respostas de login, cadastro e recuperação não devem permitir identificar publicamente a existência de um e-mail cadastrado por conteúdo diferente de erro.
- **FR-008**: Manter no serviço online a identidade profissional, os dados de perfil pedidos e o catálogo dos saves pertencentes à conta. A conta online e o perfil/Conta clínica existente dentro do save são identidades distintas.
- **FR-009**: Listar todos os saves da conta autenticada, com estado vazio e ação Criar novo save; nenhuma outra conta pode listar ou obter seus metadados privados.
- **FR-010**: Calcular Sincronizado ou Desincronizado pela capacidade de reencontrar o save esperado na localização local previamente autorizada. Esse estado não representa sincronização de conteúdo com a nuvem nem prova autorização de propriedade.
- **FR-011**: Permitir localizar novamente um save indisponível, atualizar sua localização lembrada e abri-lo somente após validar conta e arquivo, sem alterar o vínculo permanente.
- **FR-012**: O backend cria e controla a chave permanente protegida, autorizando seu uso somente ao proprietário autenticado. O conteúdo clínico do save permanece inteiramente local: o navegador autorizado usa material criptográfico para cifrar/decifrar e gravar checkpoints, inclusive durante a janela offline de oito horas. Não enviar arquivo, conteúdo clínico, banco local ou drafts ao backend/Supabase. Não declarar ponta a ponta estrita, pois o serviço controla a chave permanente e pode autorizá-la novamente após recuperação de senha. Redefinir senha não gera chave substituta nem novo vínculo.
- **FR-013**: A senha deve ser verificada por representação irreversível adequada no serviço de identidade; nunca guardar senha legível, confirmação ou senha recuperável nas tabelas próprias, no save ou em logs.
- **FR-014**: Criar uma chave protegida na primeira criação/vinculação de cada save e estabelecer um único proprietário. Sua identidade lógica não muda em login, reabertura, mudança de localização ou recuperação de senha.
- **FR-015**: Impedir a abertura de save já vinculado por conta diferente, mesmo mediante cópia do arquivo ou adulteração das informações enviadas pela página. Identificador público ou nome do arquivo sozinho não constituem o segundo fator de verificação do vínculo.
- **FR-016**: Não gravar a chave secreta legível no save, exibi-la na interface, devolvê-la em respostas de catálogo ou registrá-la em logs. O navegador pode receber e usar material criptográfico somente após autorização do backend para o save e conta corretos, durante a sessão vigente; não persistir o segredo utilizável para permitir reabertura offline. Material público e envelope cifrado não são a chave secreta. Esse uso local não concede credenciais administrativas ou acesso direto ao banco remoto, nem promete segredo invisível ao proprietário do dispositivo.
- **FR-017**: Toda leitura ou mudança no banco remoto e toda autorização de acesso ao save devem passar por validação do backend. O navegador não possui acesso direto às tabelas, funções privilegiadas ou credenciais administrativas do Supabase. Dados enviados pelo navegador nunca são autoridade de identidade ou propriedade.
- **FR-018**: Exigir internet em cada login, criação e abertura de save para validação pelo backend. Uma autorização online bem-sucedida permite continuar o trabalho local no save já aberto por até oito horas a partir dessa validação; não autoriza novo login, criação ou reabertura offline. Ao expirar ou sair, bloquear o acesso e exigir validação online sem apagar trabalho confirmado ou drafts. Indisponibilidade do serviço não renova a janela nem concede novo vínculo; durante a autorização, cifragem e checkpoints do arquivo são locais conforme FR-012, sem conexão obrigatória para cada gravação.
- **FR-019**: Reaproveitar a área normal do aplicativo após criar/carregar o save, preservando os contratos de dados clínicos, drafts, gravação local e checkpoint do arquivo.
- **FR-020**: Permitir adoção explícita de uma identidade legada ainda não vinculada pela primeira conta autenticada que a importa. O backend registra um único proprietário e recusa reivindicação da mesma identidade já vinculada por outra conta. Validar e migrar o conteúdo em memória no computador, gravando uma nova cópia criptografada com chave permanente sem reescrever o original; somente concluir abertura após confirmar a escrita e validação da cópia protegida. Repetir uma adoção pelo mesmo proprietário não troca a chave de um vínculo já estabelecido. O JSON antigo não comprova seu dono histórico e originais/cópias legíveis ou adulteradas não recebem sigilo nem prova criptográfica retroativos.
- **FR-021**: Configurar o projeto Supabase dedicado autorizado, aplicar a migration validada e preparar Auth/SMTP; publicar o aplicativo Next.js na Vercel no endereço `vercel.app` do projeto. Não publicar Edge Functions nem vincular domínio próprio.
- **FR-022**: Apresentar erro, carregamento, envio concluído e indisponibilidade com semântica acessível; solicitações repetidas não devem duplicar cadastro ou vínculo concluído.

### Non-Functional Requirements

- **NFR-001**: Seguir o design system e Atomic Design do projeto: interface em português, tema claro, desktop a partir de 1024px, teclado e requisitos WCAG 2.2 AA. Não redesenhar a área clínica inteira.
- **NFR-002**: Proteger o transporte entre navegador, backend e serviços remotos; manter credenciais privilegiadas exclusivamente no servidor e dados sensíveis fora de URLs, logs e respostas desnecessárias. Exceção técnica restrita: o link de verificação/recuperação pode transportar o token de uso único do provedor até o callback do backend; removê-lo imediatamente da URL, impedir envio por referrer e redigir query strings nos logs. Nunca usar a URL para transportar senha, chave de save ou conteúdo clínico.
- **NFR-003**: Negar acesso por padrão e verificar sessão, propriedade e entradas em cada operação remota protegida, inclusive se a página for ignorada e a requisição for criada diretamente.
- **NFR-004**: Cancelamento, importação inválida, falha de autorização ou falha de gravação não podem apagar ou sobrescrever silenciosamente o save original nem o trabalho anterior.
- **NFR-005**: Preservar a compatibilidade de saves anteriores quando possível por migração determinística e validação antes de trocar a área de trabalho; documentar qualquer limite de proteção dos arquivos antigos.
- **NFR-006**: Registrar falhas de autenticação e autorização sem credenciais, chaves, tokens, e-mail completo ou conteúdo clínico; proteger operações de identidade contra tentativas repetidas automatizadas.
- **NFR-007**: Sincronização de conteúdo clínico com a nuvem, colaboração, contas de pacientes, cobrança, OAuth, PWA e publicação de Edge Functions não foram pedidos para esta fase e não geram tarefas implícitas.

### Key Entities *(include if feature involves data)*

- **Conta online do profissional**: identidade estável autenticada; dados de nome, sobrenome e e-mail; perguntas de perfil; ciclo de sessão e recuperação. Não é o `accountId` local tratado atualmente como Conta clínica.
- **Save registrado**: identidade estável de arquivo, proprietário online único, identificação compreensível na dashboard e vínculo criptográfico protegido; não implica que o conteúdo clínico foi armazenado na nuvem.
- **Localização lembrada**: referência autorizada pelo profissional neste navegador ao arquivo/diretório previamente escolhido; sua existência não autentica propriedade e não pode ser conferida diretamente pelo servidor.
- **Chave permanente do vínculo**: segredo protegido criado na primeira vinculação e controlado pelo backend; corresponde a uma conta e a um save; não é mostrado no arquivo nem substituído em logins posteriores ou recuperação de senha. Seu uso criptográfico é disponibilizado ao navegador somente na sessão autorizada, sem conceder acesso ao banco remoto.
- **Autorização de acesso**: resultado da validação online de sessão, proprietário e arquivo; permite continuar o trabalho no save já aberto por oito horas a partir da validação, sem conceder novas aberturas ou logins offline.
- **Save legado**: arquivo criado pela versão atual sem proteção criptográfica ou proprietário online verificável; uma identidade ainda livre pode ser adotada explicitamente pela primeira conta autenticada, produzindo nova cópia protegida sem reescrever o original.
- **Área de trabalho local**: dados clínicos carregados e alterações confirmadas ainda não gravadas no arquivo; permanece diferente do catálogo online e da sessão de login.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Todos os elementos de landing, login, cadastro e recuperação pedidos estão presentes e são utilizáveis por teclado no desktop suportado.
- **SC-002**: Em todos os cenários de confirmações divergentes e campos inválidos, a criação de conta é recusada, inclusive ao contornar o formulário.
- **SC-003**: Após login válido, a dashboard contém exatamente os saves do profissional; a matriz de duas contas e pelo menos dois saves por conta não apresenta acesso cruzado.
- **SC-004**: Arquivo correto acessível, arquivo removido/movido, permissão perdida, referência perdida e arquivo diferente de mesmo nome apresentam o estado e a ação de recuperação previstos, sem falso Sincronizado.
- **SC-005**: Todos os cenários de outra conta, sessão inválida, identificação adulterada e prova criptográfica inválida são recusados sem expor dados privados ou alterar o arquivo/base atual.
- **SC-006**: A identidade da chave de cada save permanece igual depois de três novos logins, reabertura, mudança de localização e recuperação de senha; a chave legível não aparece nos arquivos nem nas respostas de catálogo.
- **SC-007**: Recuperação válida permite novo login; autorização inválida, expirada ou reutilizada não redefine senha. E-mail existente e inexistente produzem respostas públicas equivalentes.
- **SC-008**: Todas as falhas de importação, autorização e gravação previstas preservam o arquivo original e o trabalho confirmado; um save da versão anterior é usado para verificar a política de compatibilidade aprovada.
- **SC-009**: A aplicação publicada em HTTPS usa somente o projeto Supabase dedicado, Auth com SMTP/callback configurados e segredos server-side; login, confirmação, recuperação e acesso ao catálogo passam por um teste sintético de produção.
- **SC-010**: Login, criação e nova abertura de save falham sem conexão; o save já aberto permite trabalho local antes do limite de oito horas e bloqueia acesso a partir da expiração ou logout, sem perder dados confirmados e drafts.
- **SC-011**: A matriz de criação, abertura, edição, checkpoint e recuperação não transmite conteúdo clínico, arquivo ou drafts ao backend/Supabase. Um checkpoint durante a janela offline produz arquivo protegido válido, sem chave secreta legível, e só é confirmado após escrita bem-sucedida.
- **SC-012**: Importar a fixture legada compatível preserva os bytes do arquivo original e seus dados na cópia protegida, registra um único proprietário e conserva a mesma chave em repetição pelo mesmo profissional; outra conta não adota novamente a mesma identidade já vinculada. O fluxo informa que o original continua legível e não comprova propriedade histórica.
- **SC-013**: Cadastro aceita as três representações de tempo (1–6 meses, 6–12 meses, anos), média mensal zero/fracionária e atuação em anos zero/fracionária; recusa números negativos/não finitos e faixas desconhecidas. E-mail não verificado não concede acesso privado; sua verificação libera login sem alterar a identidade da conta.

## Assumptions

- A raiz é `C:\Programmer\diet-maker`; o pedido de hoje inicia a fase online antes descrita como futura. Regras antigas que excluíam login e criptografia não anulam o novo pedido; as substituições necessárias serão documentadas no plano depois da clarificação.
- Saves e dados clínicos já possuem implementação local. A integração deve reutilizar esse fluxo e preservar suas alterações existentes, sem recriar o produto.
- Foi confirmado que não há trânsito, upload, backup ou sincronização do conteúdo dos saves no Supabase. O backend guarda identidade, perfil profissional, catálogo e chave protegida, e autoriza uso criptográfico local na sessão; o conteúdo clínico continua no computador. A regra de soberania clínica da Decisão 12 permanece vigente.
- O navegador depende de referência autorizada e permissões locais para reencontrar arquivos. O backend verifica direito de acesso, mas não observa o disco do profissional nem aceita o status local como prova de propriedade.
- A proteção cifrada abrange o arquivo principal, suas cópias protegidas e os segredos/dados de perfil próprios no banco remoto. PGlite e drafts locais já existentes continuam na arquitetura atual; este escopo não promete cifrar todo armazenamento do dispositivo. Supabase Auth precisa usar o e-mail para autenticação/envio, portanto não se promete ocultá-lo de operadores privilegiados do provedor. Conteúdo já entregue e uma chave utilizável em sessão não podem ser revogados criptograficamente contra quem controla o navegador.
- O usuário autorizou o projeto Supabase dedicado na organização Jacquinho, região São Paulo, e, em 2026-10-11, ampliou o escopo para deploy na conta Vercel atual. Sem domínio próprio: usar o hostname `vercel.app` atribuído ao projeto. Gmail é o SMTP inicial; a senha de app é fornecida somente pelo arquivo local ignorado `.env.smtp.local`.
- O ajuste final do cadastro acrescenta faixas de meses à proposta apresentada; login por e-mail, verificação por link, média mensal, campos obrigatórios e números não negativos foram mantidos nessa resposta.
- Em 2026-10-11 o usuário escolheu publicação na conta Vercel já conectada, sem domínio próprio, e Gmail como SMTP de Auth. O remetente é o endereço Gmail verificado e a credencial é uma senha de app guardada localmente; não é credencial Vercel.
