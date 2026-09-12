# Feature Specification: Backup manual simples

**Feature Branch**: `12-09-26-backup-manual-simples`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "Criar o SDD da Fase 6 da migração de persistência: backup manual simples, com exportação dos dados confirmados da Conta para arquivo .nutridiet e restauração por substituição validada e transacional, sem senha, criptografia, automação ou mesclagem. A Fase 6 depende das etapas 4 e 5 concluídas."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Exportar backup da Conta (Priority: P1)

Como nutricionista, quero exportar os dados confirmados da minha Conta para um arquivo mestre, para guardar uma cópia manual que possa ser restaurada posteriormente.

**Why this priority**: Sem uma cópia exportável, a perda do navegador, do dispositivo ou da base local pode eliminar os dados confirmados do consultório.

**Independent Test**: Com uma Conta contendo pacientes, biblioteca, dietas vigentes, históricos e registros clínicos, acionar Exportar backup e verificar que um arquivo `.nutridiet` é disponibilizado com todos os dados confirmados e sem drafts.

**Acceptance Scenarios**:

1. **Given** uma Conta com dados confirmados de perfil, biblioteca, pacientes, registros clínicos, dietas vigentes, históricos e arquivados, **When** o usuário aciona **Exportar backup**, **Then** a aplicação disponibiliza um único arquivo `.nutridiet` contendo esses dados, suas relações, IDs, versões e datas necessários para restauração.
2. **Given** uma Conta com um draft ou edição temporária não confirmada, **When** o usuário exporta o backup, **Then** o arquivo não contém o draft nem transforma a edição temporária em dado confirmado.
3. **Given** uma falha durante a geração do arquivo, **When** o processo termina, **Then** a base confirmada permanece inalterada e a aplicação não apresenta o backup como concluído.

### User Story 2 - Restaurar backup com segurança (Priority: P1)

Como nutricionista, quero restaurar um arquivo de backup válido, para recuperar ou transportar toda a minha Conta sem importar dados parcialmente ou misturar duas bases.

**Why this priority**: A restauração é o contraponto necessário à exportação e precisa evitar perda acidental, referências inválidas e bases parcialmente substituídas.

**Independent Test**: Exportar uma Conta de teste, alterar os dados locais, restaurar o arquivo exportado e verificar que a base passa a refletir exatamente o conteúdo confirmado do arquivo após uma confirmação explícita.

**Acceptance Scenarios**:

1. **Given** um arquivo `.nutridiet` válido e compatível, **When** o usuário o seleciona, **Then** a aplicação valida a estrutura, a identificação, as versões suportadas, os tipos, os IDs, as relações, a unicidade da Conta e a existência de no máximo uma dieta vigente por paciente antes de modificar a base.
2. **Given** que a validação foi concluída, **When** a aplicação apresenta a restauração, **Then** informa claramente que toda a base atual será substituída sem mesclagem e solicita confirmação explícita.
3. **Given** que existem drafts ou edições pendentes, **When** o usuário tenta restaurar, **Then** a aplicação impede o início da restauração e orienta o usuário a salvar ou descartar explicitamente essas edições.
4. **Given** um arquivo válido que identifica a Conta local ativa, uma única aba ativa e nenhuma edição pendente, **When** o usuário confirma a restauração, **Then** todos os dados confirmados atuais são substituídos pelo conteúdo do arquivo em uma única operação atômica e o contexto exibido é recarregado antes de liberar novas edições.
5. **Given** um arquivo inválido, incompatível, cancelado ou uma falha durante a substituição, **When** o processo termina, **Then** a base anterior permanece íntegra, sem mistura entre estados antigo e importado, e o usuário recebe uma mensagem de falha acionável.

### User Story 3 - Compreender os limites do backup (Priority: P2)

Como nutricionista, quero entender o que o backup protege e o que ele não protege, para não confundir a cópia manual com um serviço automático ou um mecanismo de segurança.

**Why this priority**: O arquivo não possui senha nem criptografia, e a entrega do download não garante que o usuário tenha guardado uma cópia recuperável.

**Independent Test**: Abrir o fluxo de backup e verificar que as orientações explicam, em linguagem simples, a ausência de criptografia/senha, a exclusão de drafts, a substituição total na restauração e a responsabilidade do usuário por guardar o arquivo.

**Acceptance Scenarios**:

1. **Given** o fluxo de backup disponível, **When** o usuário consulta suas orientações, **Then** é informado que qualquer pessoa com acesso ao arquivo pode ler seus dados e que o produto não oferece senha ou criptografia para o arquivo.
2. **Given** um backup já exportado, **When** o usuário avalia sua cobertura, **Then** fica explícito que somente os dados confirmados até a exportação estão protegidos e que alterações posteriores, drafts, perda do dispositivo e limpeza do navegador não são cobertos automaticamente.
3. **Given** o fluxo de backup em uso, **When** o usuário conclui uma exportação ou restauração, **Then** não há envio automático para nuvem, sincronização entre dispositivos, lembrete recorrente ou registro de dados clínicos em logs de diagnóstico.

### Edge Cases

- O usuário cancela a seleção do arquivo ou a confirmação: nenhuma tabela nem configuração confirmada é alterada.
- O arquivo está vazio, truncado, malformado, contém código/SQL, usa identificador de aplicação desconhecido ou informa versão não suportada: a aplicação rejeita o arquivo antes de qualquer escrita e não o executa.
- O arquivo contém uma Conta duplicada, identifica uma Conta diferente da Conta local ativa, possui referências órfãs, IDs duplicados, relações incompatíveis ou mais de uma dieta vigente para o mesmo paciente: a aplicação rejeita o arquivo inteiro.
- O arquivo é válido, mas a base atual possui uma operação de gravação pendente, um draft ou outra condição de edição ativa: a restauração aguarda a resolução explícita ou é bloqueada sem apagar dados.
- A restauração sofre interrupção ou erro de escrita: o resultado observável deve ser a base anterior intacta ou o arquivo inteiro restaurado, nunca uma mistura parcial.
- A aplicação não consegue gerar ou baixar o arquivo: não deve indicar sucesso nem alterar os dados confirmados.
- O arquivo contém dados arquivados, históricos, consultas, avaliações, objetivos ou biblioteca vazios: a restauração deve preservar corretamente os vazios sem inventar registros.
- O usuário tenta operar a restauração em uma segunda aba: a operação deve respeitar o bloqueio de aba já existente e não abrir uma segunda instância concorrente da base.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST oferecer uma ação explícita para exportar um backup manual da Conta ativa.
- **FR-002**: O sistema MUST incluir no backup somente dados confirmados da Conta, abrangendo perfil e configurações, biblioteca reutilizável, pacientes, avaliações, acompanhamentos, objetivos, dietas vigentes, snapshots históricos, registros arquivados e as projeções de consulta derivadas desses dados, sem criar uma entidade persistida de consulta.
- **FR-003**: O sistema MUST preservar no arquivo os IDs, relações, versões e datas necessários para reconstruir os dados confirmados.
- **FR-004**: O sistema MUST registrar no cabeçalho lógico do arquivo o identificador da aplicação, a versão do formato, a versão do schema e a data da exportação.
- **FR-005**: O sistema MUST excluir drafts, buffers de autosave, edições temporárias e qualquer estado não confirmado do arquivo exportado.
- **FR-006**: O sistema MUST obter uma visão consistente dos dados confirmados, sem misturar partes de salvamentos concorrentes ou intercalados.
- **FR-007**: O sistema MUST oferecer uma ação explícita para selecionar um arquivo `.nutridiet` e iniciar uma restauração manual.
- **FR-008**: O sistema MUST validar o arquivo antes de qualquer alteração na base atual, incluindo JSON/estrutura, identificador da aplicação, versões suportadas, tipos, IDs, relações, exatamente uma Conta com a identidade da Conta local ativa e no máximo uma dieta vigente por paciente.
- **FR-009**: O sistema MUST tratar o conteúdo do arquivo como dados, nunca executar SQL, código ou instruções contidas no arquivo.
- **FR-010**: O sistema MUST informar que a restauração substitui toda a base atual sem mesclagem e exigir confirmação explícita antes da escrita.
- **FR-011**: O sistema MUST impedir a restauração enquanto houver drafts, edições pendentes ou gravações que ainda não tenham sido salvas ou descartadas explicitamente.
- **FR-012**: O sistema MUST substituir os dados confirmados em uma única operação atômica, mantendo a base anterior intacta quando a validação, o cancelamento ou a restauração falhar.
- **FR-013**: O sistema MUST recarregar o contexto e as consultas após uma restauração concluída antes de liberar novas edições.
- **FR-014**: O sistema MUST rejeitar arquivo inválido, incompatível, incompleto, cancelado ou inconsistente sem produzir importação parcial nem alterar a base anterior.
- **FR-015**: O sistema MUST comunicar erros de exportação e restauração com mensagens acionáveis, sem expor dados clínicos em logs de diagnóstico.
- **FR-016**: O sistema MUST explicar no fluxo de backup que o arquivo não possui senha nem criptografia, pode ser lido por quem obtiver acesso, cobre somente os dados confirmados exportados e depende de o usuário guardar o arquivo.
- **FR-017**: O sistema MUST manter o backup como operação manual local, sem backup automático, nuvem, sincronização entre dispositivos, lembretes recorrentes, mesclagem de bases, múltiplas contas ou troca entre gerações incompatíveis.
- **FR-018**: O fluxo MUST permanecer compatível com o escopo desktop do produto, operar por teclado, expor nome/role/value acessíveis e apresentar foco visível conforme WCAG 2.2 AA.

### Key Entities *(include if feature involves data)*

- **Arquivo mestre `.nutridiet`**: representação portátil dos dados confirmados de uma Conta, com cabeçalho versionado e conteúdo normalizado para exportação e restauração.
- **Cabeçalho do backup**: identificação da aplicação, `formatVersion`, `schemaVersion` e data da exportação usados para validar compatibilidade antes da escrita.
- **Snapshot de Conta**: conjunto consistente dos dados confirmados, relações, IDs, versões e datas pertencentes a uma única Conta no momento da exportação; a visão de consulta é reconstruída das entidades persistidas e não possui uma tabela própria nesta fase.
- **Resultado da restauração**: estado validado que substitui a base atual inteira ou uma falha que preserva integralmente a base anterior.
- **Estado de edição pendente**: draft, autosave ou gravação ainda não confirmada que bloqueia a restauração até ser salva ou descartada explicitamente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em uma Conta de teste contendo dados de perfil, biblioteca, pacientes, registros clínicos, dietas vigentes, históricos e arquivados, 100% dos dados confirmados e suas relações são recuperados após exportar e restaurar o arquivo, sem dados temporários.
- **SC-002**: 100% dos arquivos inválidos, incompatíveis ou estruturalmente inconsistentes são rejeitados antes da primeira alteração na base atual.
- **SC-003**: Em 100% dos cenários de cancelamento, falha ou interrupção cobertos pelos testes, a base anterior permanece íntegra e não contém mistura entre conteúdo antigo e importado.
- **SC-004**: Um usuário consegue concluir exportação e restauração de uma Conta de teste em até 3 minutos por fluxo, excluindo o tempo de escolha do local do arquivo.
- **SC-005**: O fluxo de backup pode ser concluído por teclado e é anunciado corretamente por tecnologia assistiva em 100% dos cenários de interação cobertos pelos testes de acessibilidade.
- **SC-006**: O produto não realiza nenhuma chamada de rede, envio automático, sincronização ou registro de dados clínicos em logs durante os fluxos de exportação e restauração offline.
- **SC-007**: A interface explica os limites de segurança e retenção do arquivo antes da restauração em 100% dos caminhos principais, sem prometer sigilo, autoria ou recuperação automática.

## Assumptions

- A Fase 4 (biblioteca reutilizável) e a Fase 5 (avaliações e acompanhamento) estão concluídas e fornecem os dados canônicos que devem ser incluídos no snapshot da Conta.
- Existe uma única Conta e um profissional por base local na V1; não há login online nem permissões multiusuário para resolver durante esta fase.
- O arquivo mestre é JSON UTF-8 com extensão `.nutridiet`; ele não é dump físico, SQL executável ou formato criptografado.
- O usuário decide quando exportar, onde guardar o arquivo e quando restaurar; a aplicação não garante que o download foi armazenado de forma recuperável.
- A restauração substitui a base inteira e não tenta mesclar dados, converter formatos incompatíveis, trocar a identidade da Conta local ou preservar drafts incompatíveis.
- O bloqueio de segunda aba e os mecanismos existentes de transação/local-first são dependências já disponíveis e não serão ampliados para colaboração ou sincronização.
- O suporte desta fase permanece no escopo desktop a partir de 1024px; mobile, tablet, PWA avançado, nuvem e backup automático estão fora do escopo.
- PDF, mensagens de dieta, autenticação futura, criptografia, senha de arquivo, assinatura digital, gerenciamento de chaves e múltiplas bases não fazem parte desta entrega.
