# Feature Specification: Persistência de avaliações e acompanhamento

**Feature Branch**: `backend-refactor`

**Created**: 2026-09-01

**Status**: Draft — aguardando clarificação de escopo

**Input**: Etapa 5 de Dieta DB: migrar para a fonte local canônica as avaliações físicas, os próximos acompanhamentos e os registros clínicos já existentes, preservando os fluxos e a interface atuais, sem criar agenda, prontuário ampliado ou novos fluxos clínicos.

## Objetivo e valor

Permitir que o nutricionista registre, reabra, edite e consulte avaliações físicas e próximos acompanhamentos com persistência real no mesmo contexto local já usado por Conta, pacientes e dietas. A entrega elimina os avisos temporários e o armazenamento legado de teste desses módulos, preserva a história clínica ao reabrir a aplicação e mantém cada registro restrito à Conta e ao paciente corretos.

## Atores

- **Nutricionista da Conta local ativa**: cria, edita e consulta avaliações; define, reagenda e remove o próximo acompanhamento; consulta a linha do tempo do paciente.
- **Paciente ativo**: titular dos registros clínicos e elegível para novas mutações.
- **Paciente arquivado**: mantém seus registros para leitura, mas não recebe novas avaliações, edições clínicas ou acompanhamentos até ser restaurado.

## Escopo

### Incluído

- criação, edição, consulta e listagem de avaliações físicas já suportadas pelo produto;
- persistência dos valores informados, valores calculados e metadados já produzidos pelo fluxo de avaliação;
- comparação com a avaliação anterior, preenchimento assistido de medidas opcionais e consulta da avaliação mais recente a partir dos registros salvos;
- definição, substituição e remoção do único próximo acompanhamento do paciente, com os tipos existentes de atualização de avaliação e atualização de dieta;
- atualização derivada da última atividade e das projeções de perfil, lista e linha do tempo a partir de avaliações e dietas confirmadas;
- preservação dos registros ao arquivar o paciente e bloqueio de mutações enquanto ele estiver arquivado;
- descarte do armazenamento legado de teste dos módulos abrangidos, sem conversão dos registros antigos, leitura alternativa ou gravação simultânea;
- funcionamento local após a preparação dos recursos da aplicação, sem depender de rede.

### Decisão de escopo pendente

- **Registros de consulta**: [NEEDS CLARIFICATION: a etapa deve criar persistência independente para registros de consulta, incluindo observações e suplementos, ou deve manter a tela de consulta como projeção somente leitura por data, composta pelas dietas confirmadas e avaliações já persistidas?]

### Fora de escopo

- agenda de consultas, calendário geral, lembretes, notificações ou recorrência;
- prontuário ampliado, anamnese médica completa ou novos campos clínicos;
- novas fórmulas, classificações ou mudanças no método de avaliação física existente;
- versionamento clínico imutável de cada edição de avaliação;
- exclusão física de avaliações ou do histórico do paciente pelo fluxo normal;
- migração dos dados legados de teste;
- autenticação online, múltiplos profissionais, nuvem, sincronização, colaboração ou outbox;
- exportação, restauração e backup `.nutridiet`, pertencentes à Etapa 6;
- mudanças visuais que não sejam necessárias para ligar os fluxos existentes à persistência e aos estados de carregamento, sucesso e erro.

## Dependências e limites entre etapas

- A base local, a Conta ativa e o cadastro de pacientes das Etapas 1–2 devem permanecer como autoridades de identidade e propriedade.
- As dietas confirmadas e históricas da Etapa 3 podem compor a atividade e a linha do tempo; rascunhos de dieta não contam como atividade clínica.
- A biblioteca reutilizável da Etapa 4 não é alterada por esta entrega.
- A Etapa 6 dependerá dos registros confirmados desta etapa para exportar e restaurar a Conta integralmente, mas nenhum fluxo de backup será antecipado aqui.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar e reencontrar uma avaliação física (Priority: P1)

Como nutricionista, quero salvar uma avaliação física no perfil do paciente e reencontrá-la após recarregar a aplicação, para acompanhar a evolução corporal sem depender de dados temporários do navegador.

**Why this priority**: A avaliação física é o principal registro clínico ainda desconectado da fonte canônica e sustenta histórico, comparação e contexto atual do paciente.

**Independent Test**: Criar uma avaliação válida para um paciente ativo, recarregar a aplicação e confirmar que a avaliação reaparece no histórico, nos detalhes e como avaliação mais recente com os mesmos valores informados e calculados.

**Acceptance Scenarios**:

1. **Given** um paciente ativo sem avaliações, **When** o nutricionista preenche os campos obrigatórios e salva explicitamente uma avaliação válida, **Then** o registro é confirmado uma única vez e aparece no perfil sem recarregamento manual.
2. **Given** uma avaliação confirmada, **When** a aplicação é fechada e reaberta no mesmo perfil local, **Then** todos os valores salvos reaparecem vinculados ao mesmo paciente e à mesma Conta.
3. **Given** uma avaliação com medidas opcionais ausentes e uma avaliação anterior compatível, **When** o fluxo existente replica essas medidas e o nutricionista salva, **Then** os valores efetivamente usados e a indicação de preenchimento assistido são preservados no registro.
4. **Given** dados incompletos ou composição corporal inválida, **When** o nutricionista tenta salvar, **Then** a avaliação permanece no formulário, o erro é explicado e nenhum registro parcial é confirmado.
5. **Given** uma falha durante a confirmação, **When** o salvamento termina com rollback confirmado, **Then** nenhuma avaliação nem projeção de atividade é alterada e o formulário continua recuperável para nova tentativa.

---

### User Story 2 - Editar uma avaliação sem alterar as demais (Priority: P1)

Como nutricionista, quero corrigir uma avaliação já salva por uma ação explícita, para manter o registro selecionado coerente sem modificar avaliações anteriores ou futuras.

**Why this priority**: O produto já oferece edição; a persistência precisa manter a identidade do registro, evitar sobrescritas silenciosas e preservar o restante do histórico.

**Independent Test**: Abrir uma avaliação existente, alterar uma medida, salvar e confirmar que somente o registro escolhido recebe os novos valores calculados, mantendo seu identificador e preservando todas as outras avaliações.

**Acceptance Scenarios**:

1. **Given** duas avaliações confirmadas, **When** o nutricionista edita e salva uma delas, **Then** somente a avaliação identificada é atualizada e a outra permanece byte a byte equivalente nos campos clínicos.
2. **Given** uma avaliação aberta para edição, **When** o nutricionista cancela ou confirma o descarte das alterações, **Then** nada é persistido.
3. **Given** que a avaliação foi atualizada desde a abertura do formulário, **When** uma versão anterior tenta salvar, **Then** a operação é rejeitada como conflito e não sobrescreve a versão mais recente.
4. **Given** um paciente arquivado, **When** uma tela antiga tenta criar ou editar uma avaliação, **Then** a operação é rejeitada e o histórico permanece disponível somente para leitura.

---

### User Story 3 - Definir e administrar o próximo acompanhamento (Priority: P1)

Como nutricionista, quero definir, reagendar e remover o próximo acompanhamento no perfil do paciente, para visualizar a próxima ação clínica tanto no perfil quanto na lista de pacientes.

**Why this priority**: O cartão e o modal já existem, mas atualmente não confirmam nenhuma alteração; conectá-los à fonte canônica completa o fluxo observável de acompanhamento.

**Independent Test**: Definir uma data e um tipo, confirmar sua exibição no perfil e na lista após reabertura, reagendar substituindo o valor anterior e remover o acompanhamento com confirmação.

**Acceptance Scenarios**:

1. **Given** um paciente ativo sem acompanhamento, **When** o nutricionista informa uma data válida e escolhe um dos dois tipos existentes, **Then** o acompanhamento é salvo e exibido no perfil e na lista.
2. **Given** um acompanhamento existente, **When** o nutricionista salva nova data ou tipo, **Then** o registro anterior é substituído e continua existindo no máximo um próximo acompanhamento para o paciente.
3. **Given** um acompanhamento existente, **When** o nutricionista confirma a remoção, **Then** o próximo acompanhamento fica vazio sem apagar avaliações, dietas ou eventos históricos.
4. **Given** alterações não salvas no modal, **When** o nutricionista fecha, pressiona `Esc` ou clica fora, **Then** o produto pede confirmação de descarte e não grava silenciosamente.
5. **Given** uma falha ao salvar ou remover, **When** a operação não é confirmada, **Then** o modal permanece recuperável e o último acompanhamento confirmado continua inalterado.

---

### User Story 4 - Consultar evolução e atividade clínica confiáveis (Priority: P2)

Como nutricionista, quero que o perfil e a lista reflitam a avaliação mais recente, a última atividade e a linha do tempo confirmada, para entender rapidamente o estado do acompanhamento sem valores duplicados ou desatualizados.

**Why this priority**: As projeções existentes só são úteis se forem reconstruídas a partir dos registros clínicos confirmados e se permanecerem consistentes após edição, arquivamento e reabertura.

**Independent Test**: Criar avaliações e dietas em datas diferentes e confirmar que perfil, lista e linha do tempo apresentam os mesmos eventos em ordem determinística, sem incluir rascunhos ou ações canceladas.

**Acceptance Scenarios**:

1. **Given** várias avaliações, **When** o perfil é carregado, **Then** a avaliação mais recente é derivada por data clínica e os detalhes continuam associados aos respectivos registros.
2. **Given** avaliações e dietas confirmadas na mesma data, **When** a linha do tempo é exibida, **Then** os registros podem ser agrupados visualmente por data sem perder suas identidades independentes.
3. **Given** apenas um rascunho de dieta ou um formulário de avaliação não salvo, **When** a atividade e o histórico são consultados, **Then** nenhum desses estados temporários aparece como evento confirmado.
4. **Given** um paciente arquivado com histórico, **When** seu perfil é consultado por um fluxo autorizado, **Then** avaliações, dietas e projeções históricas permanecem legíveis sem oferecer novas mutações clínicas.

---

### User Story 5 - Manter isolamento e operação local (Priority: P1)

Como nutricionista, quero que os registros clínicos permaneçam restritos à minha Conta local e funcionem sem rede, para evitar mistura entre pacientes e continuar o atendimento no ambiente previsto pelo produto.

**Why this priority**: Avaliações e acompanhamentos são dados clínicos; associação incorreta, exposição entre Contas ou dependência de rede comprometeriam a integridade da entrega.

**Independent Test**: Criar registros para duas Contas e pacientes distintos, operar sem rede após preparar a aplicação e verificar que consultas e mutações nunca retornam nem alteram dados fora do escopo ativo.

**Acceptance Scenarios**:

1. **Given** um identificador de avaliação pertencente a outra Conta ou a outro paciente, **When** uma consulta ou mutação é tentada no contexto atual, **Then** a operação é rejeitada sem expor o registro.
2. **Given** a aplicação previamente preparada e a rede indisponível, **When** o nutricionista cria, edita e consulta avaliações ou administra um acompanhamento, **Then** os fluxos locais continuam funcionando.
3. **Given** o ambiente novo inicializado, **When** os fluxos da etapa são usados, **Then** nenhuma chave legada de avaliações ou pacientes é lida ou gravada.

### Edge Cases

- Paciente inexistente, pertencente a outra Conta ou arquivado no instante do salvamento.
- Data clínica válida em formato local na interface e armazenamento normalizado sem deslocamento de fuso horário.
- Duas ou mais avaliações na mesma data; todas permanecem independentes e a ordenação usa um desempate determinístico.
- Formulário antigo tentando salvar após outra edição ter incrementado a versão da avaliação.
- Duplo acionamento de Salvar; a interface bloqueia reenvio enquanto a confirmação está em andamento.
- Falha depois de iniciar a gravação conjunta da avaliação e da projeção de atividade; ambas permanecem anteriores ou ambas são confirmadas.
- Falha ao remover ou substituir o acompanhamento; o valor confirmado anterior permanece íntegro.
- Avaliação antiga com apenas os campos mínimos já suportados; continua legível, mas precisa satisfazer as validações atuais antes de uma nova edição ser confirmada.
- Medida opcional preenchida apenas para um lado; a normalização bilateral existente é aplicada antes da confirmação sem apagar um valor explicitamente informado no outro lado.
- Datas passadas de acompanhamento permanecem representáveis para que a lista indique atraso; esta etapa não cria lembretes nem corrige datas automaticamente.
- Arquivar paciente preserva todos os registros e invalida qualquer tentativa posterior de mutação iniciada em tela antiga.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST manter cada avaliação como registro clínico independente, com identificador imutável, Conta proprietária, paciente proprietário, data clínica, versão e datas de criação e atualização.
- **FR-002**: O sistema MUST permitir criar e editar avaliações somente por salvamento explícito, preservando cancelamento, descarte seguro, atalho de salvamento e proteção contra saída com alterações não salvas já existentes.
- **FR-003**: O sistema MUST confirmar na avaliação os campos informados e os resultados calculados pelo fluxo atual, incluindo peso, composição corporal, perímetros corporais e indicação dos campos preenchidos automaticamente quando aplicável.
- **FR-004**: O sistema MUST validar os campos obrigatórios, valores positivos, pares de medidas e composição corporal antes da confirmação, rejeitando dados inválidos sem criar estado parcial.
- **FR-005**: O sistema MUST permitir múltiplas avaliações por paciente, inclusive na mesma data, editar somente o identificador escolhido e ordenar leituras de modo determinístico.
- **FR-006**: O sistema MUST rejeitar uma edição baseada em versão anterior e preservar a versão mais recente sem sobrescrita silenciosa.
- **FR-007**: O sistema MUST derivar a avaliação mais recente dos registros confirmados; ela não pode ser um valor clínico duplicado no cadastro do paciente.
- **FR-008**: O sistema MUST disponibilizar o histórico de avaliações com data, peso, gordura corporal, massa magra, cintura e medidas complementares já exibidas pelo produto, distinguindo carregamento, vazio, sucesso e erro recuperável.
- **FR-009**: O sistema MUST permitir no máximo um próximo acompanhamento por paciente, contendo data e um dos tipos existentes: atualização de avaliação ou atualização de dieta.
- **FR-010**: O sistema MUST permitir criar ou substituir o próximo acompanhamento por confirmação explícita e removê-lo somente após confirmação própria.
- **FR-011**: O sistema MUST preservar o último acompanhamento confirmado quando a criação, substituição ou remoção falhar ou for cancelada.
- **FR-012**: O sistema MUST projetar o próximo acompanhamento no perfil e na lista a partir da mesma fonte confirmada, incluindo os estados sem data, futuro, hoje e atrasado já representados pela interface.
- **FR-013**: O sistema MUST derivar a última atividade e a linha do tempo de eventos clínicos confirmados de paciente, avaliação e dieta; rascunhos, autosaves e formulários cancelados não podem produzir atividade.
- **FR-014**: O sistema MUST manter avaliações, acompanhamentos e demais registros abrangidos separados do cadastro canônico do paciente, relacionados pela Conta e pelo paciente, sem arrays clínicos embutidos como fonte de verdade.
- **FR-015**: O sistema MUST validar a Conta e o paciente em toda leitura e mutação, rejeitando referências fora de escopo sem expor ou alterar dados de outra Conta ou paciente.
- **FR-016**: O sistema MUST bloquear criação e edição de avaliações e administração de acompanhamento para paciente arquivado, preservando todos os registros para leitura e retomando as mutações somente após restauração.
- **FR-017**: O sistema MUST confirmar conjuntamente a avaliação e qualquer projeção persistida afetada, de forma que falhas não deixem atividade, histórico ou cadastro divergentes.
- **FR-018**: O sistema MUST preservar dietas confirmadas e avaliações não selecionadas durante criação, edição, reagendamento, remoção e arquivamento.
- **FR-019**: O sistema MUST substituir o armazenamento legado de teste dos módulos abrangidos por uma única fonte canônica, sem migração, fallback de leitura ou gravação simultânea.
- **FR-020**: As telas e componentes MUST consumir operações de aplicação e projeções de leitura, sem acessar diretamente mecanismos físicos de armazenamento.
- **FR-021**: O sistema MUST oferecer mensagens inequívocas para sucesso, validação, conflito, paciente arquivado, falha com rollback e erro de leitura, sem apresentar sucesso quando nada foi confirmado.
- **FR-022**: O sistema MUST preservar os fluxos, rotas, campos, cálculos, ações e contratos visuais já existentes, salvo ajustes necessários para estados de persistência, erro e carregamento.
- **FR-023**: O sistema MUST cobrir com validação determinística os fluxos de criação, reabertura, edição, cancelamento, conflito, histórico, acompanhamento, arquivamento, isolamento de Conta, falha atômica, corte do legado e operação local sem rede.

### Non-Functional Requirements

- **NFR-001 — Integridade clínica**: Nenhuma operação pode confirmar parcialmente uma avaliação, alterar outra avaliação por engano ou produzir projeção divergente do registro fonte.
- **NFR-002 — Privacidade e escopo**: Todos os dados desta etapa pertencem à Conta e ao paciente corretos; consultas por identificador isolado não podem escapar desse escopo.
- **NFR-003 — Desempenho percebido**: Em uma fixture local representativa do porte previsto para o consultório, perfil, histórico e lista devem apresentar os registros confirmados em até 1 segundo após a leitura estar disponível, e uma confirmação local deve fornecer resposta visível em até 1 segundo fora de falhas injetadas.
- **NFR-004 — Offline**: Depois da preparação dos recursos da aplicação, todos os fluxos locais desta etapa devem operar sem rede e sem chamadas remotas silenciosas.
- **NFR-005 — Acessibilidade**: Os fluxos devem permanecer operáveis por teclado, com foco visível, nomes e estados acessíveis, anúncios de erro e conformidade WCAG 2.2 AA no escopo desktop a partir de 1024 px.
- **NFR-006 — Compatibilidade**: A entrega deve preservar as Etapas 1–4 e não alterar o significado de dietas confirmadas, snapshots, biblioteca ou dados cadastrais do paciente.
- **NFR-007 — Testabilidade**: Cenários de domínio, persistência, aplicação e interface devem ser determinísticos, locais, reproduzíveis e usar somente dados sintéticos.

### Key Entities

- **BodyAssessment**: avaliação física independente com identidade, propriedade por Conta e paciente, data clínica, versão, medidas informadas, resultados de composição corporal e metadados de preenchimento assistido.
- **NextFollowUp**: único próximo acompanhamento opcional do paciente, com data e tipo; substituir não cria histórico de agenda e remover não apaga outros registros clínicos.
- **PatientActivity**: projeção derivada do evento confirmado mais recente relevante; não é fonte primária do histórico.
- **PatientTimeline**: leitura cronológica composta por eventos clínicos confirmados, preservando a identidade de cada dieta e avaliação mesmo quando compartilham uma data.
- **ConsultationRecord**: escopo dependente da clarificação; pode ser uma entidade clínica independente ou somente uma projeção de leitura por data.
- **Patient**: cadastro proprietário dos vínculos clínicos; seu estado ativo/arquivado autoriza ou bloqueia mutações, mas não contém avaliações nem histórico como fonte canônica.
- **Account**: fronteira proprietária obrigatória de todos os registros e consultas da etapa.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das avaliações válidas criadas ou editadas em cenários de aceite reaparecem após reabertura com os mesmos valores confirmados e sem duplicatas.
- **SC-002**: Em falhas injetadas em qualquer ponto de confirmação, 0 registros parciais, 0 projeções divergentes e 0 alterações em avaliações não selecionadas são observados.
- **SC-003**: 100% dos cenários de criar, substituir, remover e cancelar acompanhamento preservam a regra de no máximo um próximo acompanhamento por paciente.
- **SC-004**: 100% das tentativas de ler ou alterar registros por outra Conta, outro paciente ou paciente arquivado são rejeitadas sem exposição nem mutação de dados indevidos.
- **SC-005**: Perfil, lista e linha do tempo apresentam os mesmos eventos confirmados, na mesma ordem determinística, sem incluir rascunhos ou formulários cancelados.
- **SC-006**: Os fluxos de avaliação e acompanhamento permanecem concluíveis somente por teclado e passam as verificações aplicáveis de acessibilidade WCAG 2.2 AA no desktop suportado.
- **SC-007**: Em uma fixture local representativa, 95% das leituras de perfil, histórico e lista e das confirmações sem falha apresentam resultado visível em até 1 segundo.
- **SC-008**: Com a rede desativada após a preparação da aplicação, 100% dos cenários locais de criação, edição, consulta e acompanhamento definidos nesta especificação continuam funcionais.
- **SC-009**: A auditoria do corte legado encontra zero leitura, escrita ou fallback para as chaves antigas nos fluxos canônicos desta etapa.

## Assumptions

- O usuário é o único nutricionista da Conta local ativa e somente uma aba da aplicação pode abrir a base.
- Dados legados atuais são de teste e podem ser descartados; não há prontuário de produção a converter.
- Datas clínicas e de acompanhamento são datas civis sem horário; a interface continua exibindo o formato local e o domínio preserva o mesmo dia sem deslocamento de fuso.
- Datas passadas de acompanhamento são aceitas para representar estados atrasados já previstos pela lista; não há lembretes automáticos.
- Mais de uma avaliação pode existir na mesma data porque cada registro possui identidade própria; a leitura usa desempate estável.
- Editar uma avaliação atualiza o próprio registro, conforme o fluxo existente; não cria snapshot imutável nem revisão histórica adicional.
- Salvar uma avaliação não altera automaticamente peso, metas ou outros campos cadastrais atuais do paciente.
- Fórmulas, classificações, campos obrigatórios, normalização bilateral, cópia de resumo e preenchimento assistido já implementados são preservados, não redesenhados.
- O backup integral será tratado somente na Etapa 6, embora seus futuros exportadores devam incluir os registros confirmados desta etapa.

