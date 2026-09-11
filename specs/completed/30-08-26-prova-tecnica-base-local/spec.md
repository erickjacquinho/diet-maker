# Feature Specification: Prova técnica e base local

**Feature Branch**: `30-08-26-prova-tecnica-base-local`

**Created**: 2026-08-30

**Status**: Draft

**Input**: User description: "Criar o SDD da primeira etapa de implementação de refs/dieta-db. A primeira etapa é Prova técnica e base local: validar PGlite + Drizzle, persistência e reabertura, transações atômicas, migration simples, separação de drafts em IndexedDB, bloqueio da segunda aba, portabilidade lógica JSON e funcionamento offline após o carregamento dos recursos. Registrar resultados e limitações e fixar o adaptador somente se aprovado. Criar os artefatos Spec Kit e encerrar antes da implementação."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Confirmar a base local de persistência (Priority: P1)

Como equipe responsável pelo produto, quero validar uma base relacional local com dados sintéticos representativos para decidir se o adaptador atende à V1 local-first antes de integrar os módulos clínicos.

**Why this priority**: Toda persistência canônica depende dessa decisão. Uma falha aqui deve ser conhecida antes de criar contratos físicos, telas ou integrações de domínio.

**Independent Test**: Executar a PoC em um perfil limpo do navegador, gravar a fixture, fechar e reabrir a base e confirmar que os mesmos registros, relações e valores permanecem disponíveis.

**Acceptance Scenarios**:

1. **Given** um perfil de navegador preparado e uma fixture sintética representativa, **When** a base é inicializada e os registros são gravados, **Then** a operação confirma sucesso somente depois que a persistência real for comprovada.
2. **Given** uma base gravada e fechada, **When** a base é reaberta no mesmo perfil, **Then** os registros e suas relações são recuperados sem depender de rede.
3. **Given** que o armazenamento não pode ser inicializado ou gravado, **When** a PoC tenta executar a operação, **Then** um erro explícito é registrado e nenhum sucesso falso ou fallback silencioso é apresentado.

---

### User Story 2 - Garantir integridade e isolamento dos dados (Priority: P1)

Como equipe responsável pelo produto, quero comprovar que gravações compostas são atômicas, que os dados respeitam Conta e Paciente e que drafts não se confundem com dados confirmados.

**Why this priority**: A persistência clínica não pode produzir registros parciais, referências fora do escopo ou histórico alterado por uma edição ainda não confirmada.

**Independent Test**: Executar uma gravação com cabeçalho e filhos, provocar uma falha intermediária, verificar o rollback completo e, em seguida, gravar um draft separado e confirmar que a base canônica não foi alterada.

**Acceptance Scenarios**:

1. **Given** uma operação que grava um registro principal e seus filhos, **When** ocorre uma falha depois de uma gravação parcial, **Then** nenhum dos dados da operação permanece confirmado.
2. **Given** registros pertencentes a diferentes Contas e Pacientes, **When** a PoC consulta ou grava uma relação, **Then** a relação válida permanece dentro do escopo correto e referências inválidas são rejeitadas.
3. **Given** uma edição de dieta em criação, **When** o draft é gravado ou removido, **Then** nenhuma dieta confirmada, vigência ou histórico é criado, atualizado ou removido.
4. **Given** uma primeira aba com a base aberta, **When** uma segunda aba tenta abrir a mesma base, **Then** a segunda aba é bloqueada antes de consultar ou editar os dados; após o fechamento da primeira, uma nova abertura é permitida.

---

### User Story 3 - Validar evolução e portabilidade da base (Priority: P2)

Como equipe responsável pelo produto, quero testar uma evolução simples do modelo e transportar uma amostra lógica dos dados para verificar que a base pode evoluir e ser recuperada sem perder integridade.

**Why this priority**: Migrations e portabilidade são pré-requisitos para manter a base local utilizável ao longo do tempo e para o futuro backup da Conta.

**Independent Test**: Aplicar uma migration simples sobre uma fixture existente, exportar a amostra em JSON, importar em uma base preparada e comparar IDs, relações e valores nutricionais.

**Acceptance Scenarios**:

1. **Given** uma fixture gravada na versão inicial, **When** uma evolução simples do modelo é aplicada, **Then** todos os registros e relações da fixture permanecem íntegros.
2. **Given** uma amostra exportada em JSON, **When** ela é importada em uma base compatível, **Then** IDs, relações e valores nutricionais são preservados.
3. **Given** uma versão de modelo ou formato não suportada, **When** a amostra é apresentada para importação, **Then** ela é rejeitada sem modificar a base atual.

---

### User Story 4 - Confirmar operação local sem rede (Priority: P2)

Como nutricionista usando a V1 local-first, quero que as operações da amostra continuem funcionando sem internet depois que os recursos necessários forem carregados, para que a escolha do adaptador não introduza dependência de rede.

**Why this priority**: O funcionamento local é parte da proposta do produto, mas deve ser validado junto com os recursos da aplicação e não apenas com o banco isolado.

**Independent Test**: Carregar previamente os recursos da PoC, interromper a rede e repetir inicialização, consulta, gravação, reabertura e portabilidade da amostra.

**Acceptance Scenarios**:

1. **Given** que os recursos necessários já foram carregados, **When** a rede é interrompida, **Then** as operações locais da amostra continuam disponíveis.
2. **Given** que um recurso ainda não foi carregado, **When** a rede é interrompida antes da preparação, **Then** a limitação é comunicada sem declarar que o produto inteiro está offline.

### Edge Cases

- Quando o navegador recusar armazenamento persistente ou atingir uma limitação de armazenamento, a operação deve falhar de forma explícita e manter os dados anteriores intactos.
- Quando uma gravação composta falhar em qualquer ponto, a PoC deve verificar que não existe uma versão parcialmente confirmada.
- Quando duas abas tentarem abrir a mesma base, somente a primeira instância pode prosseguir; a segunda não pode consultar, editar ou iniciar uma segunda instância.
- Quando uma migration for repetida sobre uma base já atualizada, o resultado deve ser idempotente ou produzir um erro controlado sem perda de dados.
- Quando uma amostra tiver versão incompatível, JSON inválido ou relações inconsistentes, a importação deve ser rejeitada antes de substituir ou alterar a base atual.
- Quando um draft for descartado ou removido depois de uma falha de salvamento, ele não pode reaparecer como dieta confirmada nem apagar histórico existente.
- Quando a rede cair durante a execução local após a preparação dos recursos, nenhuma operação deve depender de uma chamada remota silenciosa.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A PoC MUST fornecer uma base relacional local isolada, com uma interface técnica mínima e uma fixture sintética representativa de Conta, Paciente, registros compostos, receitas e itens nutricionais.
- **FR-002**: A PoC MUST demonstrar gravação, fechamento e reabertura da base mantendo os registros, relações e valores gravados.
- **FR-003**: O sistema MUST confirmar uma gravação composta somente quando o registro principal e seus filhos forem confirmados juntos.
- **FR-004**: O sistema MUST desfazer integralmente uma gravação composta quando ocorrer uma falha intermediária.
- **FR-005**: O sistema MUST impedir relações que atravessem o escopo válido de Conta e Paciente e MUST impedir duas dietas vigentes para o mesmo Paciente na fixture em que essa regra for exercitada.
- **FR-006**: O armazenamento de drafts MUST permanecer separado do armazenamento dos dados confirmados; gravar, atualizar ou remover um draft não pode alterar dieta confirmada, vigência ou histórico.
- **FR-007**: O sistema MUST bloquear uma segunda aba antes de abrir, consultar ou editar a base; depois do fechamento da primeira aba, deve permitir uma nova abertura.
- **FR-008**: A PoC MUST aplicar uma migration simples sobre uma fixture existente e demonstrar que os registros e relações não foram perdidos.
- **FR-009**: A PoC MUST exportar e importar uma amostra lógica em JSON preservando IDs, relações e valores nutricionais, sem tratar o arquivo como cópia física do motor.
- **FR-010**: A PoC MUST rejeitar versões de modelo ou formato não suportadas antes de modificar a base atual.
- **FR-011**: Após o carregamento prévio dos recursos necessários, as operações locais da amostra MUST funcionar sem rede.
- **FR-012**: A PoC MUST registrar versões executadas, modo de execução, resultados, limitações e tempos observados de abertura, consulta e gravação.
- **FR-013**: O resultado MUST declarar explicitamente se o adaptador recomendado foi aprovado, reprovado ou requer reavaliação; a aprovação exige persistência real, atomicidade, integridade, separação de drafts, exclusividade da instância, migration, portabilidade e operação local comprovadas.

### Non-Functional Requirements

- **NFR-001**: A validação MUST ocorrer no navegador desktop utilizado pelo projeto, a partir do escopo mínimo de 1024px definido para o produto.
- **NFR-002**: Falhas de inicialização, persistência, migration, importação e exclusividade da instância MUST ser observáveis por mensagens ou resultados nominais e acionáveis, sem sucesso falso.
- **NFR-003**: A PoC MUST usar somente dados sintéticos e não pode exigir dados clínicos reais, conexão com serviço remoto ou autenticação online.
- **NFR-004**: Os resultados da PoC MUST ser reproduzíveis a partir de uma fixture versionada e de passos registrados no relatório.
- **NFR-005**: Os tempos observados de abertura, consulta e gravação MUST ser registrados como evidência diagnóstica; a aprovação deve bloquear somente quando houver travamento ou degradação que inviabilize o uso da amostra, sem criar nesta etapa uma certificação de latência ou volume não prevista.

### Key Entities

- **Conta**: Perfil local proprietário da base e dos registros pertencentes ao consultório.
- **Paciente**: Pessoa vinculada à Conta, usada para validar escopo e relações clínicas.
- **Recipe**: Receita sintética pertencente à Conta, usada para exercitar composição, rendimento e relações de itens sem entregar a biblioteca do produto.
- **Registro confirmado**: Amostra de dados persistidos que representa uma operação composta com cabeçalho e filhos.
- **Draft de dieta**: Edição local ainda não confirmada, mantida separada do histórico e da vigência.
- **Fixture sintética**: Conjunto controlado de dados de teste, incluindo pacientes, receitas e itens nutricionais, usado para repetir a PoC.
- **Migration**: Evolução versionada do modelo de dados aplicada sobre uma base já preenchida.
- **Amostra de portabilidade**: Representação lógica em JSON usada para exportar e importar dados confirmados da fixture.
- **Instância ativa**: Sessão/aba autorizada a abrir e operar a base local.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em todas as execuções registradas da PoC, uma fixture gravada e reaberta preserva 100% dos registros, relações e valores comparados.
- **SC-002**: Em todos os cenários de falha intermediária exercitados, 0 registros parciais permanecem confirmados após o rollback.
- **SC-003**: Em todos os cenários de concorrência de abas exercitados, 100% das segundas abas são bloqueadas antes de abrir a base e uma nova aba pode assumir após o fechamento da primeira.
- **SC-004**: A migration simples preserva 100% dos dados e relações da fixture, sem perda ou duplicação observada.
- **SC-005**: A exportação e importação da amostra preserva 100% dos IDs, relações e valores nutricionais comparados.
- **SC-006**: Após os recursos necessários serem carregados, 100% das operações locais previstas na amostra são executadas sem rede.
- **SC-007**: O relatório final contém o resultado de cada verificação, versões e modo de execução, tempos de abertura/consulta/gravação, limitações e uma decisão explícita sobre o adaptador.
- **SC-008**: Nenhuma tela clínica, módulo de produto ou dado legado precisa ser migrado para concluir ou reprovar a PoC.

## Assumptions

- A V1 possui uma Conta e um profissional por base/perfil local; autenticação online, múltiplos profissionais e sincronização permanecem fora desta etapa.
- A recomendação atual de avaliação é PGlite + Drizzle, mas o adaptador só será fixado após o portão técnico e pode ser substituído se falhar em requisito essencial.
- A camada de domínio e os repositórios tipados permanecem independentes do motor; a PoC não deve espalhar detalhes do banco pela interface.
- IndexedDB é usado exclusivamente para drafts na arquitetura da V1; o banco relacional local continua sendo a fonte canônica dos dados confirmados.
- A amostra de portabilidade antecipa a capacidade do adaptador; o exportador completo da Conta pertence a um SDD posterior.
- Os registros atuais em `localStorage` são dados de teste e serão descartados; esta etapa não cria migrador nem segunda fonte canônica.
- Offline nesta etapa significa operar após o carregamento dos recursos necessários; instalação de PWA, cache avançado, sincronização em segundo plano e coordenação entre abas estão fora do escopo.
- A aprovação da PoC não autoriza criar telas clínicas nem implementar os SDDs seguintes; o resultado apenas libera ou bloqueia a escolha do adaptador.

## Out of Scope

- Integração da base com todos os módulos de Conta, Pacientes, Dietas, Biblioteca, Avaliações ou Backup.
- Criação de telas clínicas ou substituição completa do armazenamento legado.
- Migração dos dados de teste existentes.
- Backup completo da Conta, interface de exportação/restauração e política de retenção final.
- Login online, Supabase/PostgreSQL remoto, autenticação, múltiplos profissionais, nuvem, outbox, sincronização ou colaboração.
- Instalação de PWA, plataforma de atualização do motor, coordenação avançada de abas ou operação simultânea.
