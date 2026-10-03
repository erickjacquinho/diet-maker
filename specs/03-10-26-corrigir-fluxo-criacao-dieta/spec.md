# Feature Specification: Corrigir Integridade e Recuperação na Criação de Dieta

**Feature Branch**: `codex/diet-pdf-export`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "Criar um SDD para corrigir todos os pontos encontrados na análise do fluxo de criação de dieta."

## Clarifications

### Session 2026-10-03

- Q: Se a transação local confirmou a dieta, mas falhou somente o checkpoint do arquivo principal, como deve continuar o fluxo? → A: Voltar à ficha do paciente, informar o checkpoint pendente e oferecer retry separado da sincronização do arquivo, sem repetir a mutação clínica.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Prescrição reproduz fielmente o que foi editado (Priority: P1)

Como nutricionista, quero que alterações de quantidade e substituição permaneçam consistentes com os valores nutricionais mostrados, e que cada dieta preserve o peso usado como referência, para confiar na prescrição salva e no histórico.

**Why this priority**: Uma diferença entre o que aparece no editor e o que fica confirmado pode alterar a prescrição clínica. A mudança posterior do peso cadastral também não deve reescrever retrospectivamente métricas históricas.

**Independent Test**: Reabrir ou copiar uma dieta, alterar a quantidade de um alimento e substituir outro, salvar e reabrir; comparar alimento, quantidade e nutrientes com o que foi confirmado. Alterar o peso no perfil e verificar que a dieta anterior conserva o peso e g/kg da prescrição.

**Acceptance Scenarios**:

1. **Given** uma dieta salva ou recuperada com snapshots existentes, **When** o nutricionista muda uma quantidade e salva, **Then** o snapshot persiste a nova quantidade e os nutrientes escalados da referência congelada, e os totais mostrados correspondem segundo a precisão/apresentação atual.
2. **Given** uma dieta salva ou recuperada, **When** o nutricionista substitui um alimento e salva, **Then** o snapshot persiste a origem e os nutrientes do alimento selecionado, e os totais mostrados correspondem segundo a precisão/apresentação atual.
3. **Given** um item incluído com uma base nutricional capturada, **When** os dados de catálogo mudam depois da inclusão, **Then** o snapshot já capturado permanece reproduzível até que o nutricionista substitua deliberadamente a origem.
4. **Given** uma dieta com peso de referência registrado, **When** o peso cadastral do paciente muda, **Then** a dieta e seu histórico continuam usando o peso de referência da prescrição para calcular g/kg.
5. **Given** uma nova dieta iniciada para um paciente com peso registrado, **When** o nutricionista salva a dieta, **Then** o peso capturado no início permanece associado à prescrição.
6. **Given** um item válido inserido da TACO, de alimento customizado, de receita ou de refeição pronta, **When** a prescrição é confirmada, **Then** a origem, versão e composição registradas permanecem válidas e legíveis ao reabrir a dieta.

### User Story 2 - Salvamento e recuperação comunicam o resultado verdadeiro (Priority: P1)

Como nutricionista, quero saber se a prescrição foi confirmada, se somente o checkpoint do arquivo principal está pendente, ou se o resultado continua incerto, para não repetir uma operação já confirmada nem acreditar que dados foram salvos quando não foram.

**Why this priority**: Uma confirmação ambígua pode levar a repetição indevida, perda de confiança ou divergência entre a área de trabalho local e o arquivo principal da Conta.

**Independent Test**: Exercitar salvamento confirmado, rollback, falha posterior no checkpoint e resultado incerto; verificar a mensagem, a preservação ou limpeza do rascunho e a ação oferecida em cada resultado.

**Acceptance Scenarios**:

1. **Given** uma prescrição válida e sem falhas, **When** o nutricionista confirma Salvar, **Then** o estado final informa a confirmação e a dieta aparece uma única vez como vigente.
2. **Given** que a transação local confirmou a dieta mas o checkpoint de `.nutridiet` falhou, **When** o fluxo termina, **Then** o usuário retorna à ficha do paciente, vê o checkpoint pendente e pode repetir somente a sincronização do arquivo.
3. **Given** que a dieta foi confirmada mas a remoção do draft falhou, **When** o fluxo termina, **Then** o usuário recebe confirmação clínica com limpeza pendente e a recuperação repete apenas a limpeza.
4. **Given** que o resultado de uma tentativa de salvamento é incerto, **When** o editor recebe esse resultado, **Then** ele consulta a dieta pelo identificador estável antes de habilitar uma nova tentativa.
5. **Given** que a reconciliação confirma a gravação, **When** o fluxo é atualizado, **Then** o usuário recebe confirmação, o checkpoint é concluído ou fica explicitamente pendente e nenhuma segunda dieta é criada.
6. **Given** que a reconciliação confirma que não houve gravação, **When** o usuário tenta novamente, **Then** a mesma identidade da operação é reutilizada.
7. **Given** que a reconciliação não consegue determinar o resultado, **When** o fluxo termina, **Then** o rascunho é preservado e o usuário recebe instrução de revisão, sem repetição automática.

### User Story 3 - O editor preserva o rascunho durante navegação e salvamento (Priority: P1)

Como nutricionista, quero que falhas ao gravar o rascunho impeçam a saída da tela e que os controles de edição fiquem indisponíveis durante a confirmação, para não perder a última alteração nem modificar silenciosamente uma revisão já capturada.

**Why this priority**: O draft local é a única cópia recuperável das edições ainda não confirmadas. Navegar após falha ou editar durante o commit pode deixar o usuário sem a última revisão.

**Independent Test**: Simular flush com falha ou revisão superada ao voltar e ao abrir a matriz de ciclo; em outro caso, tentar alterar refeições, metas e modo enquanto o salvamento está ocupado.

**Acceptance Scenarios**:

1. **Given** alterações ainda pendentes no editor, **When** o nutricionista usa Voltar ou abre a matriz de ciclo e o flush não retorna sucesso, **Then** a navegação é bloqueada e as alterações continuam disponíveis no editor.
2. **Given** um diálogo de edição está aberto, **When** o nutricionista usa Ctrl+S/Cmd+S, **Then** a confirmação explícita não começa até o diálogo ser fechado.
3. **Given** que Salvar iniciou a captura explícita da revisão para confirmação, **When** o flush/commit está em andamento, **Then** a região editável fica indisponível até o resultado ser resolvido.
4. **Given** que somente o autosave local está em andamento, **When** o nutricionista continua editando, **Then** os controles permanecem disponíveis e a revisão mais recente continua protegida pelo contrato de revisão do draft.
5. **Given** que o flush retorna sucesso, **When** o usuário navega para a matriz de ciclo, **Then** a revisão atual fica recuperável ao retornar.
6. **Given** que ocorre um erro no flush, **When** a ação de navegação é interrompida, **Then** a mensagem identifica o problema e permite tentar novamente sem descartar o draft.

### User Story 4 - Falhas ao abrir a dieta têm uma saída acionável (Priority: P2)

Como nutricionista, quero receber uma mensagem clara quando o paciente, a dieta ou o armazenamento não puder ser carregado, para saber como prosseguir em vez de esperar indefinidamente.

**Why this priority**: Uma falha de carregamento sem saída bloqueia o atendimento e não informa se a causa é corrigível pelo usuário.

**Independent Test**: Abrir o editor com paciente arquivado ou inexistente, dieta ausente e persistência indisponível; verificar que cada tentativa termina em estado de erro recuperável, sem spinner infinito.

**Acceptance Scenarios**:

1. **Given** que a abertura da dieta falha, **When** o carregamento termina, **Then** a tela deixa o estado de carregamento e apresenta uma mensagem acionável.
2. **Given** um erro recuperável, **When** o usuário escolhe tentar novamente, **Then** a tela repete a abertura sem criar drafts duplicados.
3. **Given** um paciente arquivado ou uma dieta histórica não editável, **When** o editor rejeita a abertura, **Then** a mensagem explica a condição e oferece retorno seguro.
4. **Given** uma falha de abertura ou salvamento ocupado, **When** o nutricionista usa teclado ou tecnologia assistiva, **Then** o estado e as ações disponíveis são anunciados e operáveis sem depender somente de cor.

### Edge Cases

- A dieta contém itens reidratados com snapshots anteriores; mudanças devem atualizar a prescrição usando a base nutricional e as regras de cálculo capturadas, sem consultar silenciosamente uma versão viva do catálogo.
- A origem do alimento substituto não está mais disponível ou não pode ser validada; o fluxo não deve confirmar nutrientes inventados ou manter uma origem que contradiz a tela.
- O perfil não possui peso atual ao iniciar uma dieta; g/kg deve permanecer indisponível até haver peso de referência válido, sem substituir por um peso arbitrário.
- Uma dieta confirmada antiga não possui peso de referência recuperável; não preencher pelo peso cadastral atual e manter g/kg indisponível enquanto não houver evidência histórica confiável.
- O checkpoint do `.nutridiet` falha após a transação local confirmar a dieta; retry deve gravar o checkpoint pendente, sem repetir o commit clínico.
- A transação local confirma a dieta mas a remoção do draft falha; retry deve limpar somente o draft confirmado.
- A reconciliação do resultado incerto também falha; preservar o draft, manter estado de revisão e impedir repetição automática.
- A reconciliação encontra uma dieta já confirmada após resultado incerto; atualizar somente cleanup/checkpoint, sem repetir a mutação clínica.
- Um autosave fica pendente quando o usuário navega; só sair depois de confirmar a revisão necessária.
- A abertura falha por paciente ausente, paciente arquivado, dieta inexistente ou persistência indisponível; nenhum caso deve permanecer em carregamento indefinido.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST manter origem, quantidade e nutrientes do snapshot coerentes com o editor, aplicando as regras atuais de precisão/apresentação sem recalcular pela versão viva do catálogo.
- **FR-002**: O sistema MUST preservar os nutrientes de referência, a origem e as regras de cálculo capturadas quando o item foi inserido; mudanças no catálogo não podem alterar retroativamente o item.
- **FR-003**: O sistema MUST atualizar origem, quantidade e nutrientes do snapshot quando o nutricionista altera uma porção ou substitui um alimento.
- **FR-004**: O sistema MUST capturar e preservar o peso de referência da prescrição através de todas as leituras, edições, confirmações e consultas de histórico.
- **FR-005**: O sistema MUST calcular g/kg com o peso de referência associado à dieta e não com o peso cadastral atual de uma prescrição existente; se uma dieta legada não tiver referência recuperável, MUST indicar g/kg indisponível em vez de inferir outro peso.
- **FR-006**: O sistema MUST distinguir confirmação da dieta na área de trabalho local de confirmação do checkpoint no arquivo principal.
- **FR-007**: Se a confirmação local tiver sucesso e o checkpoint falhar, o sistema MUST retornar à ficha do paciente, mostrar o checkpoint pendente e oferecer recuperação do arquivo sem repetir a mutação da dieta.
- **FR-008**: Diante de resultado incerto, o sistema MUST reconciliar pelo identificador estável antes de permitir nova tentativa e MUST preservar o rascunho enquanto o resultado não for conhecido; se a reconciliação confirmar o commit, completar cleanup/checkpoint sem repetir a mutação clínica.
- **FR-009**: O sistema MUST impedir as saídas do editor por Voltar e abertura da matriz de ciclo quando o flush necessário falhar, for superado ou não confirmar a revisão atual; prévias que já exigem flush mantêm a mesma condição de sucesso.
- **FR-010**: O sistema MUST impedir Ctrl+S/Cmd+S enquanto um diálogo de edição estiver aberto e tornar indisponível a região editável durante a captura/commit explícito, sem bloquear edições durante o autosave local em segundo plano.
- **FR-011**: O sistema MUST apresentar estado de erro acionável quando falhar a abertura do paciente ou da dieta e MUST fornecer retorno ou nova tentativa compatível com a causa.
- **FR-012**: O sistema MUST manter no máximo uma dieta vigente por paciente e MUST evitar duplicação ao reconciliar ou repetir uma confirmação.
- **FR-013**: O sistema MUST apresentar estados distintos de sucesso, limpeza pendente, checkpoint pendente, rollback, conflito de revisão e resultado que exige revisão humana.
- **FR-014**: O sistema MUST comunicar erro e estado ocupado de forma acessível, com ações recuperáveis operáveis por teclado e sem depender somente de cor.
- **FR-015**: O sistema MUST aceitar e preservar os snapshots válidos das fontes de alimentos e biblioteca já oferecidas no editor, incluindo origem e proveniência de TACO, alimento customizado, receita e refeição pronta.

### Key Entities

- **Rascunho de dieta**: Edição ainda não confirmada, recuperável no contexto local e vinculada a Conta, paciente e dieta-base quando aplicável.
- **Snapshot nutricional do item**: Origem, quantidade, valores nutricionais e regras necessários para reproduzir o item prescrito após alterações no catálogo.
- **Peso de referência**: Peso usado para as métricas g/kg daquela prescrição, imutável quando o cadastro do paciente muda.
- **Dieta confirmada**: Prescrição vigente ou histórica associada a um paciente, com revisão e composição congelada.
- **Checkpoint do arquivo principal**: Estado que informa se as alterações locais confirmadas já estão registradas no `.nutridiet` autoritativo.
- **Resultado de salvamento**: Estado verificável que distingue confirmação, rollback, conflito, limpeza pendente, checkpoint pendente e resultado desconhecido.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em todos os cenários de quantidade alterada, alimento substituído ou item inserido da biblioteca, o snapshot reaberto conserva origem/quantidade e nutrientes recalculados da base congelada; a exibição coincide na precisão já usada pelo editor.
- **SC-002**: Em 100% dos casos de alteração posterior do peso cadastral, dietas previamente confirmadas conservam o peso de referência e g/kg originais.
- **SC-003**: Em todos os resultados simulados de gravação, a interface distingue sucesso completo, confirmação local com limpeza pendente, confirmação local com checkpoint pendente, falha confirmada e resultado incerto.
- **SC-004**: Nenhum caminho de saída que depende de flush navega após falha ou conflito; confirmação explícita não inicia com diálogo de edição aberto e bloqueia a região editável, enquanto autosave local não bloqueia edição.
- **SC-005**: Toda falha de abertura termina em estado visível e acionável; nenhum cenário de erro fica indefinidamente em carregamento.
- **SC-006**: Nenhuma reconciliação ou repetição cria mais de uma dieta vigente para o mesmo paciente.
- **SC-007**: Nenhuma dieta histórica sem peso de referência confiável recebe silenciosamente o peso atual do perfil como substituto.
- **SC-008**: Todos os novos estados de espera, erro e recuperação são perceptíveis a usuários de tecnologia assistiva, e suas ações disponíveis são operáveis por teclado.
- **SC-009**: Todos os tipos de fonte que o editor oferece para uma dieta válida sobrevivem à confirmação e reabertura sem perder proveniência.

## Assumptions

- O usuário principal é o nutricionista que cria, copia ou edita uma prescrição para um paciente ativo.
- O comportamento offline-first, o estado local da Conta e a autoridade do arquivo `.nutridiet` permanecem conforme ADR-009.
- A meta existente de busca TACO e a operação offline permanecem sem alteração; esta feature não cria novos limites de desempenho.
- O fluxo continuará usando a revisão atual do catálogo apenas para novas inclusões ou substituições deliberadas; snapshots já capturados permanecem estáveis.
- O Jev foi usado apenas como apoio auxiliar para ordenar os achados da auditoria. Integração de geração ou recomendação clínica no produto não faz parte desta feature.
- Dietas antigas sem peso de referência recuperável não recebem valor inferido do perfil atual; o g/kg fica indisponível. A feature não adiciona uma tela para reconstrução manual de dados históricos.
- Alterações locais preexistentes neste checkout são independentes e devem ser preservadas durante futura implementação.

## Out of Scope

- Alterar fórmulas nutricionais, metas clínicas, critérios de cálculo de kcal ou a tabela TACO.
- Adicionar geração automática de dietas, recomendações clínicas ou chamada de Jev ao runtime do produto.
- Criar sincronização remota, novo formato de arquivo, protocolo genérico de retry ou revisão histórica de cada edição.
- Criar ferramenta para reconstrução manual de pesos de referência históricos ausentes.
- Interceptar navegação global do app, fechamento da janela ou ações externas ao editor; o gate cobre as saídas do construtor descritas nesta especificação.
- Reformular visualmente o construtor ou alterar fluxos de exportação, biblioteca, refeições prontas ou receitas além do necessário para preservar os contratos descritos.

## References

- `AGENTS.md` e `.specify/memory/constitution.md`.
- `docs/prd/PRD.md` e `docs/context/CONTEXT.md`.
- `refs/dieta-db/01-fluxo-paciente-dieta.md`.
- `refs/dieta-db/08-snapshots-versionamento-e-integridade-clinica.md`.
- `docs/adr/ADR-003-macro-targets-and-tolerance-ranges.md`.
- `docs/adr/ADR-009-nutridiet-principal.md`.
