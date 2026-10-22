# Feature Specification: Dashboard, navegação e Configurações

**Feature Branch**: `main` (artefatos locais; sem criar branch ou publicar)
**Created**: 2026-10-20
**Status**: SDD aprovado para implementação em 2026-10-20; US1–US3 implementadas, validação final em execução. Evidências em [validation-report.md](validation-report.md) e [implementation-log.md](implementation-log.md).
**Input**: Criar o SDD do remanejamento para `/dashboard`, simplificar a barra lateral e criar agora Configurações em modal sem conteúdo.

## Contexto e limites

O usuário quer entrar na área principal do aplicativo após o login. A intenção inicial de dashboard vazio foi refinada: enquanto os saves forem locais, o dashboard recebe as funções atuais de `/saves`. Configurações abre em modal e permanece sem campos ou funções nesta etapa.

Esta feature reorganiza a experiência atual; não migra dados clínicos para um backend online. Preserva autenticação, autorização dos arquivos, banco de trabalho, rascunhos, checkpoints e recuperação existentes. O destino online registrado em `refs/dieta-db/proposta-mvp-online-supabase.md` continua sendo outro trabalho.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Abrir Configurações vazio (Priority: P1)

Como usuário na área interna, quero acionar Configurações no menu do perfil e abrir um modal vazio sem sair da página.

**Why this priority**: É a única implementação solicitada para entrega imediata, além da criação dos documentos.

**Independent Test**: Nas barras expandida e recolhida, abrir o menu do perfil, acionar Configurações e fechar o modal sem mudar a rota ou os dados.

**Acceptance Scenarios**:

1. **Given** uma página interna com a barra lateral, **When** aciono Configurações, **Then** aparece um modal com título Configurações, fechamento acessível e nenhuma configuração, formulário, aba ou ação de save.
2. **Given** o modal aberto, **When** pressiono Escape ou uso Fechar, **Then** ele fecha, o foco retorna ao controle do perfil e a rota permanece igual.
3. **Given** a barra recolhida, **When** abro o menu pelo teclado e aciono Configurações, **Then** obtenho o mesmo modal com nome acessível.

### User Story 2 - Entrar pelo dashboard com os saves locais (Priority: P1)

Como usuário autenticado com cadastro completo, quero entrar em `/dashboard` e acessar ali as funções dos saves locais, com ou sem arquivo já aberto.

**Why this priority**: Remove a página intermediária dedicada e mantém o produto utilizável antes da migração online.

**Independent Test**: Efetuar login, acessar diretamente o dashboard sem arquivo, criar ou abrir um arquivo, navegar para um módulo e voltar ao dashboard sem fechar a sessão.

**Acceptance Scenarios**:

1. **Given** login válido e cadastro completo, **When** o acesso termina, **Then** o destino é `/dashboard`, sem passagem por `/saves` ou redirecionamento automático para Pacientes.
2. **Given** nenhum arquivo aberto, **When** entro no dashboard, **Then** posso criar ou importar um arquivo e consultar os arquivos associados à conta.
3. **Given** arquivos existentes, **When** uso Abrir ou Localizar, **Then** o fluxo mantém as verificações e mensagens atuais de propriedade, autorização, compatibilidade e permissão.
4. **Given** arquivo legado, **When** solicito proteção, **Then** o original é preservado e a criação da cópia protegida segue o contrato atual.
5. **Given** arquivo ativo, **When** volto ao dashboard, **Then** o arquivo continua ativo e o dashboard permanece visível.
6. **Given** link antigo para `/saves` ou `/home`, **When** acesso com conta válida, **Then** chego ao dashboard sem ciclo de redirecionamento.

### User Story 3 - Usar uma barra lateral mais simples (Priority: P2)

Como usuário, quero acessar o início e os módulos pela barra lateral, mantendo configurações e saída no menu do perfil.

**Why this priority**: Dá um destino principal estável e evita distribuir operações de arquivo por menus diferentes.

**Independent Test**: Percorrer os mesmos módulos em ambas as apresentações da barra; abrir Início, Configurações e Sair; acessar backup no dashboard.

**Acceptance Scenarios**:

1. **Given** a barra lateral, **When** navego, **Then** encontro Início, Pacientes, Agenda, Dietas prontas, Refeições, Receitas e Alimentos, nessa ordem, sem alterar as rotas dos seis módulos existentes.
2. **Given** o menu do perfil, **When** abro o menu, **Then** encontro Configurações e Sair, sem o atalho duplicado Visão geral nem comandos de backup.
3. **Given** um arquivo ativo e autorizado, **When** acesso o dashboard, **Then** encontro exportação e restauração de backup, com as mesmas proteções contra descarte e substituição do fluxo atual.
4. **Given** uma falha de gravação ou alterações pendentes, **When** estou em outro módulo, **Then** o aviso e a recuperação continuam acessíveis fora de Configurações.

### Edge Cases

- Conta anônima continua no fluxo de login; cadastro incompleto continua exigindo conclusão, sem acesso aos arquivos.
- Falha na verificação da conta ou no catálogo não é apresentada como conta vazia e não cria outro arquivo automaticamente.
- Rota clínica sem arquivo válido orienta a abrir o dashboard; não inicia uma base substituta nem entra em ciclo.
- Permissão perdida, arquivo movido, referência ausente e formato incompatível mantêm recuperação e distinção de causas.
- Expiração/revogação de autorização conserva o bloqueio e a preservação dos rascunhos existentes antes de liberar qualquer nova operação clínica.
- Restaurar backup com rascunhos ou checkpoint pendentes exige as escolhas explícitas atuais; cancelar preserva os dados.
- Contas que já têm vários arquivos continuam podendo localizá-los e abri-los. Este remanejamento não exclui, mescla ou escolhe arbitrariamente um arquivo para impor unicidade.
- Abrir/fechar Configurações não executa salvamento, carregamento, logout ou chamadas remotas adicionais.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Configurações MUST abrir como modal a partir do menu do perfil, sem navegação para outra página.
- **FR-002**: O modal MUST conter somente título Configurações, estrutura vazia e fechamento; não conter campos, abas, opções de arquivo ou conteúdo fictício.
- **FR-003**: O modal MUST permitir teclado, contenção de foco, Escape, fechamento nomeado e retorno ao controle do perfil em ambas as apresentações da barra.
- **FR-004**: A entrada após login, conclusão de cadastro e acesso a `/home` MUST levar a `/dashboard`; usuários anônimos e cadastros incompletos mantêm seus controles atuais.
- **FR-005**: `/dashboard` MUST ser acessível com conta válida, mesmo sem arquivo aberto, e continuar acessível quando existir arquivo ativo.
- **FR-006**: O dashboard MUST oferecer catálogo existente, paginação, criação, importação, abertura, localização, estados de arquivo e adoção de legado em cópia protegida.
- **FR-007**: `/saves` MUST deixar de hospedar o gerenciamento e encaminhar links antigos para `/dashboard`, sem perder parâmetros necessários ou criar ciclos.
- **FR-008**: As operações clínicas MUST continuar exigindo arquivo e autorização válidos; ausência de arquivo encaminha ao dashboard, preservando bloqueios e recuperação atuais.
- **FR-009**: A barra lateral MUST usar os sete destinos e a ordem de US3, com rótulos curtos, indicação de destino atual e comportamento expandido/recolhido preservado.
- **FR-010**: O menu do perfil MUST concentrar Configurações e Sair; comandos de backup MUST ficar no dashboard e Visão geral MUST deixar de duplicar Início.
- **FR-011**: Exportação e restauração MUST preservar cifra, autorização, validação, confirmação de substituição e tratamento de rascunhos/checkpoints pendentes; sem arquivo, esses comandos não podem operar sobre dados vazios.
- **FR-012**: Indicadores de salvamento pendente, pausa, bloqueio e tentativa de recuperação MUST permanecer visíveis/acessíveis nos módulos que dependem do arquivo.
- **FR-013**: Remanejamento e modal MUST preservar arquivos, identificadores, vínculos, banco local e rascunhos; não alterar schema, quantidade permitida de saves ou autorização remota.

### Non-Functional Requirements

- **NFR-001**: A interface MUST reutilizar os componentes e tokens canônicos, preservar os primitivos e operar em desktop a partir de 1024px.
- **NFR-002**: Navegação e modal MUST cumprir o contrato de teclado/foco do design system, incluindo nomes acessíveis e foco visível.
- **NFR-003**: Abrir Configurações MUST adicionar zero requisições de rede; o remanejamento MUST reutilizar as chamadas existentes sem inventar métricas ou painéis.
- **NFR-004**: Evidências MUST distinguir documentação, testes automatizados, compilação estática e validação visual/autenticada. Somente o modal pode ser implementado antes da validação humana deste SDD, conforme pedido explícito.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em todos os cenários de login/cadastro completos e links antigos definidos em US2, o usuário chega a `/dashboard` sem loop ou seleção obrigatória em outra página.
- **SC-002**: Todas as operações de arquivo e backup de FR-006/FR-011 permanecem alcançáveis no dashboard, sem perda observada dos dados anteriores em cancelamento ou erro.
- **SC-003**: Configurações abre e fecha nas duas apresentações da barra, por mouse e teclado, sem alterar rota, arquivo ou dados; nenhum campo é exibido.
- **SC-004**: Os sete destinos permanecem alcançáveis, e o menu do perfil contém somente Configurações e Sair na integração de produção após o remanejamento.
- **SC-005**: Os cenários de ausência de arquivo, falha de permissão e alterações pendentes conservam uma ação de recuperação explícita e não autorizam operações clínicas indevidas.

## Clarifications

### Session 2026-10-20

- Q: Como tratar `/saves` enquanto o backend online ainda não foi migrado? A: “deixe os saves locais por enquanto, mas adicione as funcoes da apgina /saves em /dashboard”. O dashboard deixa de ser vazio nesta etapa; recebe o gerenciamento local existente.
- A solicitação “ja cria a pagina deconfiguracao em modal sem conteudo” autoriza implementar agora apenas o modal vazio; o remanejamento completo é documentado para revisão.

## Assumptions e exclusões confirmadas pelo contexto

- Autenticação e persistência atuais são reutilizadas; migração online, novos campos de perfil, painéis, métricas, seleção de tema e novos formatos de arquivo estão fora deste pedido.
- A simplificação é de organização e rótulos; os módulos existentes não serão removidos ou reimplementados.
- O objetivo de um único arquivo não autoriza excluir saves existentes ou mudar o contrato do catálogo nesta feature.
- A implementação imediata do modal não antecipa alterações nos redirecionamentos, sidebar, backup ou gerenciamento de arquivos descritas nas demais histórias.
