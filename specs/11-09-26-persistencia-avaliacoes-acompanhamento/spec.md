# Feature Specification: Persistência de avaliações e acompanhamento

**Feature Branch**: `backend-refactor`

**Created**: 2026-09-11

**Status**: Pronto para validação humana

**Input**: Etapa 5 da arquitetura Dieta DB: migrar avaliações físicas, próximos acompanhamentos e registros clínicos já existentes para a fonte local canônica, preservando telas, cálculos e fluxos atuais, removendo o armazenamento legado de teste sem migração ou gravação paralela e sem antecipar autenticação online, sincronização ou backup.

## Objetivo e valor

Permitir que o nutricionista registre, reabra, edite e consulte avaliações físicas e próximos acompanhamentos com persistência real no mesmo contexto local já usado por Conta, pacientes e dietas. A entrega elimina os avisos temporários e o armazenamento legado desses módulos, preserva a história clínica após reabrir a aplicação e mantém cada registro restrito à Conta e ao paciente corretos.

## Clarifications

### Session 2026-09-11

- Q: A tela de consulta deve ser uma projeção somente leitura ou possuir um registro persistido independente? → A: Projeção somente leitura por data, composta por dietas e avaliações confirmadas; não persistir `ConsultationRecord` nesta etapa.

## Atores

- **Nutricionista da Conta local ativa**: cria, edita e consulta avaliações; define, reagenda e remove o próximo acompanhamento; consulta a linha do tempo do paciente.
- **Paciente ativo**: titular dos registros clínicos e elegível para novas mutações.
- **Paciente arquivado**: mantém seus registros para leitura, mas não recebe novas avaliações, edições clínicas ou acompanhamentos até ser restaurado.

## Escopo

### Incluído

- criação, edição, consulta e listagem das avaliações físicas já suportadas pelo produto;
- persistência dos valores informados, resultados calculados e metadados já produzidos pelo fluxo de avaliação;
- comparação com a avaliação anterior, preenchimento assistido de medidas opcionais e consulta da avaliação mais recente;
- definição, substituição e remoção do único próximo acompanhamento do paciente, usando os tipos já existentes;
- atualização derivada da última atividade e das projeções de perfil, lista e linha do tempo a partir de avaliações e dietas confirmadas;
- preservação dos registros ao arquivar o paciente e bloqueio de mutações enquanto ele estiver arquivado;
- descarte do armazenamento legado de teste dos módulos abrangidos, sem conversão, leitura alternativa ou gravação simultânea;
- funcionamento local após a preparação dos recursos da aplicação, sem depender de rede.

### Consulta por data

- A tela de consulta permanece uma projeção somente leitura por data, composta por dietas e avaliações confirmadas.
- Não existe `ConsultationRecord` persistido nesta etapa; observações permanecem no estado vazio atual e suplementos não são registrados até que um fluxo próprio seja especificado futuramente.

### Fora de escopo

- agenda, calendário geral, lembretes, notificações ou recorrência;
- prontuário ampliado, anamnese completa ou novos campos clínicos;
- novas fórmulas, classificações ou mudanças no método de avaliação física existente;
- versionamento imutável de cada edição de avaliação;
- exclusão física de avaliações ou do histórico pelo fluxo normal;
- cadastro ou edição de observações, condutas e suplementos em uma consulta independente;
- migração dos dados legados de teste;
- autenticação online, múltiplos profissionais, nuvem, sincronização, colaboração ou outbox;
- exportação, restauração e backup `.nutridiet`, pertencentes à Etapa 6;
- mudanças visuais que não sejam necessárias para conectar os fluxos atuais à persistência e aos estados de carregamento, sucesso e erro.

## Dependências e limites entre etapas

- A base local, a Conta ativa e o cadastro de pacientes das Etapas 1–2 permanecem autoridades de identidade e propriedade.
- Dietas confirmadas e históricas da Etapa 3 podem compor atividade e linha do tempo; rascunhos não contam como atividade clínica.
- A biblioteca reutilizável da Etapa 4 não é alterada.
- A Etapa 6 dependerá dos registros confirmados desta etapa para exportar e restaurar a Conta integralmente, sem antecipação do fluxo de backup.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar e reencontrar uma avaliação física (Priority: P1)

Como nutricionista, quero salvar uma avaliação física no perfil do paciente e reencontrá-la após reabrir a aplicação, para acompanhar a evolução corporal sem depender de dados temporários.

**Why this priority**: A avaliação física é o principal registro clínico ainda desconectado da fonte canônica e sustenta histórico, comparação e contexto atual do paciente.

**Independent Test**: Criar uma avaliação válida para um paciente ativo, reabrir a aplicação e confirmar que ela reaparece no histórico, nos detalhes e como avaliação mais recente com os mesmos valores.

**Acceptance Scenarios**:

1. **Given** um paciente ativo sem avaliações, **When** o nutricionista preenche os campos obrigatórios e salva uma avaliação válida, **Then** o registro é confirmado uma única vez e aparece no perfil.
2. **Given** uma avaliação confirmada, **When** a aplicação é fechada e reaberta no mesmo perfil local, **Then** todos os valores reaparecem vinculados à mesma Conta e ao mesmo paciente.
3. **Given** medidas opcionais ausentes e uma avaliação anterior compatível, **When** o fluxo existente replica essas medidas e o nutricionista salva, **Then** os valores usados e a indicação de preenchimento assistido são preservados.
4. **Given** dados incompletos ou composição corporal inválida, **When** o nutricionista tenta salvar, **Then** o erro é explicado, o formulário permanece recuperável e nenhum registro parcial é confirmado.
5. **Given** uma falha durante a confirmação, **When** ocorre rollback, **Then** nenhuma avaliação nem projeção de atividade é alterada.

---

### User Story 2 - Editar uma avaliação sem alterar as demais (Priority: P1)

Como nutricionista, quero corrigir uma avaliação já salva por uma ação explícita, para manter o registro selecionado coerente sem modificar as demais avaliações.

**Why this priority**: A edição já existe na interface e precisa manter identidade, consistência e proteção contra sobrescrita silenciosa.

**Independent Test**: Abrir uma avaliação existente, alterar uma medida, salvar e confirmar que somente o registro escolhido muda, mantendo identificador e preservando as demais avaliações.

**Acceptance Scenarios**:

1. **Given** duas avaliações confirmadas, **When** uma delas é editada e salva, **Then** somente a avaliação identificada é atualizada.
2. **Given** uma avaliação aberta para edição, **When** o nutricionista cancela ou confirma o descarte, **Then** nada é persistido.
3. **Given** que a avaliação foi atualizada desde a abertura, **When** uma versão anterior tenta salvar, **Then** a operação é rejeitada como conflito e não sobrescreve a versão recente.
4. **Given** um paciente arquivado, **When** uma tela antiga tenta criar ou editar uma avaliação, **Then** a mutação é rejeitada e o histórico permanece somente leitura.

---

### User Story 3 - Administrar o próximo acompanhamento (Priority: P1)

Como nutricionista, quero definir, reagendar e remover o próximo acompanhamento no perfil do paciente, para visualizar a próxima ação clínica tanto no perfil quanto na lista.

**Why this priority**: O cartão e o modal já existem, mas ainda não confirmam alterações na fonte canônica.

**Independent Test**: Definir data e tipo, confirmar a exibição após reabertura, reagendar substituindo o valor anterior e remover com confirmação.

**Acceptance Scenarios**:

1. **Given** um paciente ativo sem acompanhamento, **When** data e tipo válidos são confirmados, **Then** o acompanhamento aparece no perfil e na lista.
2. **Given** um acompanhamento existente, **When** nova data ou tipo é salvo, **Then** o registro anterior é substituído e continua existindo no máximo um acompanhamento.
3. **Given** um acompanhamento existente, **When** sua remoção é confirmada, **Then** o campo fica vazio sem apagar avaliações, dietas ou eventos históricos.
4. **Given** alterações não salvas no modal, **When** ele é fechado, **Then** o produto pede confirmação de descarte e não grava silenciosamente.
5. **Given** falha ao salvar ou remover, **When** a operação não é confirmada, **Then** o modal permanece recuperável e o último valor confirmado continua íntegro.

---

### User Story 4 - Consultar evolução e atividade clínica confiáveis (Priority: P2)

Como nutricionista, quero que perfil, lista e linha do tempo reflitam os mesmos registros confirmados, para compreender rapidamente o estado do paciente sem duplicação ou defasagem.

**Why this priority**: As projeções só são confiáveis quando reconstruídas a partir dos registros clínicos confirmados.

**Independent Test**: Criar avaliações e dietas em datas diferentes e confirmar que perfil, lista e linha do tempo apresentam os mesmos eventos em ordem determinística, sem incluir rascunhos ou ações canceladas.

**Acceptance Scenarios**:

1. **Given** várias avaliações, **When** o perfil é carregado, **Then** a mais recente é derivada por data clínica com desempate determinístico.
2. **Given** avaliações e dietas confirmadas na mesma data, **When** a linha do tempo é exibida, **Then** os registros podem ser agrupados sem perder suas identidades independentes.
3. **Given** somente um rascunho de dieta ou formulário de avaliação não salvo, **When** histórico e atividade são consultados, **Then** o estado temporário não aparece como evento confirmado.
4. **Given** um paciente arquivado com histórico, **When** seu perfil é consultado, **Then** os registros permanecem legíveis sem oferecer novas mutações clínicas.

---

### User Story 5 - Manter isolamento e operação local (Priority: P1)

Como nutricionista, quero que os registros clínicos permaneçam restritos à Conta e ao paciente corretos e funcionem sem rede, para preservar integridade e continuidade do atendimento local.

**Why this priority**: Avaliações e acompanhamentos são dados clínicos e não podem ser associados ou expostos fora do escopo correto.

**Independent Test**: Criar registros para Contas e pacientes distintos, operar sem rede após preparar a aplicação e confirmar que nenhuma leitura ou mutação escapa do contexto ativo.

**Acceptance Scenarios**:

1. **Given** um identificador pertencente a outra Conta ou paciente, **When** leitura ou mutação é tentada, **Then** a operação é rejeitada sem expor o registro.
2. **Given** a aplicação preparada e a rede indisponível, **When** avaliações e acompanhamentos são administrados, **Then** os fluxos locais continuam funcionando.
3. **Given** uma base nova, **When** os fluxos da etapa são usados, **Then** nenhuma chave legada de avaliações ou pacientes é lida ou gravada.

### Edge Cases

- Paciente inexistente, pertencente a outra Conta ou arquivado no instante do salvamento.
- Data clínica informada no formato local sem deslocamento de dia por fuso horário.
- Duas ou mais avaliações na mesma data, preservadas como registros independentes e ordenadas com desempate estável.
- Formulário antigo tentando salvar após outra edição incrementar a versão.
- Duplo acionamento de Salvar enquanto uma confirmação está em andamento.
- Falha durante a gravação da avaliação ou do acompanhamento, antes da confirmação.
- Falha ao remover ou substituir o acompanhamento, preservando o valor confirmado anterior.
- Avaliação antiga com somente campos mínimos, ainda legível, mas sujeita às validações atuais antes de nova edição.
- Medida opcional preenchida para apenas um lado, aplicando a normalização bilateral existente sem apagar valor explícito.
- Data passada de acompanhamento representada como atraso, sem lembrete ou correção automática.
- Arquivamento do paciente durante uma mutação iniciada em tela antiga.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST manter cada avaliação como registro clínico independente, com identificador imutável, Conta, paciente, data clínica, versão e datas de criação e atualização.
- **FR-002**: O sistema MUST permitir criar e editar avaliações apenas por salvamento explícito, preservando cancelamento, descarte seguro, atalho de salvamento e proteção contra saída com alterações não salvas.
- **FR-003**: O sistema MUST confirmar os campos informados, resultados calculados e metadados de preenchimento assistido produzidos pelo fluxo atual.
- **FR-004**: O sistema MUST validar campos obrigatórios, valores positivos, pares de medidas e composição corporal antes da confirmação, sem criar estado parcial.
- **FR-005**: O sistema MUST permitir múltiplas avaliações por paciente, inclusive na mesma data, editar somente o identificador escolhido e ordenar leituras deterministicamente.
- **FR-006**: O sistema MUST rejeitar edição baseada em versão anterior sem sobrescrever a versão mais recente.
- **FR-007**: O sistema MUST derivar a avaliação mais recente dos registros confirmados, sem duplicá-la no cadastro do paciente.
- **FR-008**: O sistema MUST disponibilizar histórico de avaliações com os dados já exibidos pelo produto e estados distinguíveis de carregamento, vazio, sucesso e erro recuperável.
- **FR-009**: O sistema MUST permitir no máximo um próximo acompanhamento por paciente, contendo data civil e um dos tipos existentes: atualização de avaliação ou atualização de dieta.
- **FR-010**: O sistema MUST permitir criar ou substituir o acompanhamento por confirmação explícita e removê-lo somente após confirmação própria.
- **FR-011**: O sistema MUST preservar o último acompanhamento confirmado quando criação, substituição ou remoção falhar ou for cancelada.
- **FR-012**: O sistema MUST projetar o mesmo acompanhamento no perfil e na lista, incluindo estados sem data, futuro, hoje e atrasado.
- **FR-013**: O sistema MUST derivar última atividade e linha do tempo de eventos confirmados; rascunhos, autosaves e formulários cancelados não produzem atividade.
- **FR-014**: O sistema MUST manter avaliações e acompanhamentos separados do cadastro canônico do paciente, relacionados por Conta e paciente.
- **FR-015**: O sistema MUST validar Conta e paciente em toda leitura e mutação, rejeitando referências fora de escopo sem exposição de dados.
- **FR-016**: O sistema MUST bloquear mutações clínicas para paciente arquivado, preservando os registros para leitura até sua restauração.
- **FR-017**: O sistema MUST confirmar cada mutação clínica atomicamente; as projeções desta etapa são derivadas em leitura e só podem refletir registros confirmados, sem estado parcial em caso de falha.
- **FR-018**: O sistema MUST preservar dietas confirmadas e avaliações não selecionadas durante as operações desta etapa.
- **FR-019**: O sistema MUST substituir o armazenamento legado abrangido por uma única fonte canônica, sem migração, fallback ou gravação simultânea.
- **FR-020**: As telas MUST consumir operações de aplicação e projeções de leitura, sem acessar diretamente o mecanismo físico de armazenamento.
- **FR-021**: O sistema MUST oferecer mensagens inequívocas para sucesso, validação, conflito, paciente arquivado, rollback e erro de leitura.
- **FR-022**: O sistema MUST preservar rotas, campos, cálculos, ações e contratos visuais existentes, salvo ajustes necessários para estados de persistência.
- **FR-023**: O sistema MUST validar deterministicamente criação, reabertura, edição, cancelamento, conflito, histórico, acompanhamento, arquivamento, isolamento, falha atômica, corte do legado e operação offline.
- **FR-024**: A tela de consulta MUST ser uma projeção somente leitura por data, composta exclusivamente por dietas e avaliações confirmadas, sem persistir um registro independente, observações ou suplementos nesta etapa.

### Non-Functional Requirements

- **NFR-001 — Integridade clínica**: Nenhuma operação pode confirmar parcialmente uma avaliação, alterar outra por engano ou produzir projeção divergente.
- **NFR-002 — Privacidade e escopo**: Todos os dados pertencem à Conta e ao paciente corretos; identificadores isolados não podem escapar desse escopo.
- **NFR-003 — Desempenho percebido**: Em uma base representativa do porte previsto, perfil, histórico, lista e confirmações sem falha devem fornecer resposta visível em até 1 segundo em pelo menos 95% das verificações locais.
- **NFR-004 — Offline**: Após preparar os recursos da aplicação, todos os fluxos locais desta etapa devem operar sem rede e sem chamadas remotas silenciosas.
- **NFR-005 — Acessibilidade**: Os fluxos devem permanecer operáveis por teclado, com foco visível, nomes e estados acessíveis e conformidade WCAG 2.2 AA no desktop a partir de 1024 px.
- **NFR-006 — Compatibilidade**: A entrega deve preservar as Etapas 1–4 e não alterar o significado de dietas, snapshots, biblioteca ou dados cadastrais.
- **NFR-007 — Testabilidade**: Cenários de domínio, persistência, aplicação e interface devem ser determinísticos, locais e reproduzíveis com dados sintéticos.

### Key Entities

- **BodyAssessment**: avaliação física independente com identidade, propriedade por Conta e paciente, data clínica, versão, medidas, resultados de composição corporal e metadados de preenchimento assistido.
- **NextFollowUp**: único próximo acompanhamento opcional do paciente, com data e tipo; substituir não cria histórico de agenda e remover não apaga registros clínicos.
- **PatientActivity**: projeção derivada do evento confirmado mais recente; não é fonte primária do histórico.
- **PatientTimeline**: leitura cronológica de eventos confirmados que preserva a identidade de dietas e avaliações, mesmo quando compartilham uma data.
- **ConsultationView**: projeção somente leitura por data, composta por dietas e avaliações confirmadas; não possui identidade ou persistência próprias nesta etapa.
- **Patient**: cadastro proprietário dos vínculos clínicos; seu estado ativo ou arquivado autoriza ou bloqueia mutações.
- **Account**: fronteira proprietária obrigatória de todos os registros e consultas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das avaliações válidas criadas ou editadas nos cenários de aceite reaparecem após reabertura com os mesmos valores e sem duplicatas.
- **SC-002**: Em falhas injetadas, são observados zero registros parciais, zero projeções divergentes e zero alterações em avaliações não selecionadas.
- **SC-003**: 100% dos cenários de criar, substituir, remover e cancelar acompanhamento preservam a regra de no máximo um registro por paciente.
- **SC-004**: 100% das tentativas fora da Conta, do paciente ou do estado ativo permitido são rejeitadas sem exposição nem mutação indevida.
- **SC-005**: Perfil, lista e linha do tempo apresentam os mesmos eventos confirmados, na mesma ordem determinística, sem estados temporários.
- **SC-006**: Os fluxos permanecem concluíveis somente por teclado e passam nas verificações aplicáveis de acessibilidade WCAG 2.2 AA.
- **SC-007**: Pelo menos 95% das leituras e confirmações locais sem falha apresentam resultado visível em até 1 segundo na base representativa.
- **SC-008**: Com a rede desativada após a preparação da aplicação, 100% dos cenários locais definidos continuam funcionais.
- **SC-009**: A auditoria do corte legado encontra zero leitura, escrita, fallback ou gravação paralela nos fluxos canônicos desta etapa.

## Assumptions

- Existe uma única Conta local ativa e somente uma aba pode abrir a base.
- Os dados legados atuais são de teste e podem ser descartados.
- Datas clínicas e de acompanhamento são datas civis sem horário e preservam o mesmo dia independentemente de fuso.
- Datas passadas de acompanhamento são aceitas para representar atraso; não há lembretes automáticos.
- Mais de uma avaliação pode existir na mesma data porque cada registro possui identidade própria.
- Editar uma avaliação atualiza o próprio registro e não cria snapshot imutável.
- Salvar avaliação não altera automaticamente peso, metas ou outros campos cadastrais do paciente.
- Fórmulas, classificações, campos obrigatórios, normalização bilateral e preenchimento assistido atuais são preservados.
- O backup integral será tratado somente na Etapa 6, que deverá incluir os registros confirmados desta etapa.
