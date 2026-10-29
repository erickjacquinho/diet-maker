# Feature Specification: Início com rotina semanal e assinatura em Configurações

**Feature Branch**: nenhuma criada; checkout preservado em `feat/configuracoes-perfil-save`.
**Created**: 2026-10-23
**Status**: Especificado; implementação pendente de validação humana.
**Input**: “gostei dessas sugestões. crie um /sdd disso e o que nao está implementado ainda use placeholders simples”. Contexto aprovado: `/dashboard` para rotina e conta, calendário compacto da semana e próximas ações; assinatura e recorrência de cobrança em Configurações → Assinatura, com resumo discreto e atalho no Início.

## Contexto e limites

O Início responde “o que tenho nesta semana e o que faço a seguir?”. Configurações mantém a administração da conta. O profissional autenticado é o único ator; acessar o Início não exige abrir um save.

Semana e próximas ações reutilizam os acompanhamentos já existentes na Agenda: atualizações de dieta e avaliação, sem criar consultas, horários ou prontuários. Nome do paciente identifica o compromisso; medidas, diagnósticos, macros e histórico clínico não entram no dashboard.

“Recorrência” significa renovação/cobrança da assinatura do software. Repetição de compromissos está fora desta entrega. A assinatura é informativa enquanto a integração não existe. Nenhuma capacidade ausente será construída como dependência apenas para preencher a tela.

## User Scenarios & Testing

### User Story 1 - Consultar semana e próximas ações (Priority: P1)

Como profissional, quero consultar a semana e os acompanhamentos a realizar, com acesso à Agenda completa, sem detalhes clínicos no Início.

**Why this priority**: é o conteúdo útil no acesso diário e já possui fonte de dados.
**Independent Test**: com arquivo autorizado contendo acompanhamentos, comparar semana e próximas ações com a Agenda.

**Acceptance Scenarios**:

1. **Given** acompanhamentos na semana, **When** abro o Início, **Then** vejo sete dias de domingo a sábado, hoje identificado, contagens por dia e “Abrir agenda”.
2. **Given** acompanhamentos de hoje até sábado, **When** consulto “Próximas ações”, **Then** vejo todos esses itens por data crescente, nome e tipo, com nome do paciente, data, tipo e acesso à Agenda; itens anteriores a hoje ficam fora dessa lista.
3. **Given** dieta e avaliação em datas diferentes, **When** ambas caem na semana, **Then** cada tipo aparece na sua data; dois tipos no mesmo dia contam como dois acompanhamentos.
4. **Given** semana sem ocorrências ou sem ações restantes, **When** a leitura termina, **Then** cada região mostra seu vazio específico, sem exemplos fictícios.

### User Story 2 - Encontrar assinatura em Configurações (Priority: P2)

Como titular, quero um único destino para a assinatura, separado do planejamento da semana.

**Why this priority**: fixa o lugar da gestão sem exigir implantar cobrança.
**Independent Test**: abrir Assinatura pelas Configurações e pelo Início, inclusive sem save.

**Acceptance Scenarios**:

1. **Given** Configurações aberto, **When** seleciono “Assinatura”, **Then** vejo “A gestão da assinatura estará disponível em breve.” e a explicação de que plano, ciclo de cobrança, renovação automática, pagamento, faturas e cancelamento ficarão ali.
2. **Given** Início aberto, **When** aciono “Gerenciar assinatura” junto de “Assinatura — Em breve”, **Then** o modal existente abre diretamente na aba Assinatura.
3. **Given** integração financeira ausente, **When** consulto essa aba, **Then** não vejo preços, planos atribuídos, vencimentos ou situações financeiras fictícias, nem controles simulados.
4. **Given** rascunho em outra aba, **When** alterno para Assinatura e retorno, **Then** os campos permanecem; fechar respeita a confirmação existente. A aba informativa não oferece salvar perfil/save.

### User Story 3 - Usar Início sem dados disponíveis (Priority: P2)

Como profissional, quero distinguir recurso futuro, arquivo fechado, vazio e falha de leitura, mantendo acesso à conta.

**Why this priority**: a conta funciona sem arquivo; vazio não pode esconder falha ou bloqueio.
**Independent Test**: abrir Início sem arquivo e depois abrir, trocar ou bloquear arquivo, sem exposição de dados anteriores.

**Acceptance Scenarios**:

1. **Given** nenhum arquivo autorizado, **When** acesso Início, **Then** a rotina orienta “Abra um save para consultar sua semana e próximas ações.” com “Abrir configurações de saves”; assinatura e Configurações continuam acessíveis.
2. **Given** leitura pendente ou falha, **When** consulto a rotina, **Then** vejo carregamento ou erro com “Tentar novamente”, sem confundir esses estados com vazio ou recurso futuro.
3. **Given** troca, fechamento ou perda de autorização, **When** muda o contexto, **Then** nenhum acompanhamento anterior permanece visível nem é aplicado por uma resposta antiga.

### Edge Cases

- Semana atravessa mês/ano: sete datas locais consecutivas; sem deslocamento UTC. Reabrir Início ou recuperar foco após a meia-noite atualiza hoje e semana.
- Data inválida não entra nas contagens/ações nem derruba a página. Datas distintas por tipo têm precedência sobre a data legada; registros legados válidos permanecem.
- Falha de rotina não bloqueia conta. Integração financeira ausente é “Em breve”, nunca “Pagamento pendente”.
- Nome longo, zoom de 200% e faixa desktop preservam conteúdo/foco; não há rolagem horizontal da página a 1024px.
- Rascunho, operação de save e modal suspenso preservam proteções existentes; atalhos não descartam alterações nem empilham overlays.

## Requirements

### Functional Requirements

- **FR-001**: `/dashboard`, identificado como “Início”, DEVE priorizar semana e próximas ações, com assinatura secundária, sem virar administração clínica ou catálogo de saves.
- **FR-002**: A semana DEVE mostrar domingo a sábado correntes, destacar hoje, informar contagens reais e oferecer Agenda; datas seguem o calendário local do usuário.
- **FR-003**: “Próximas ações” DEVE listar todos os acompanhamentos entre hoje e o fim da semana, inclusive, por data, nome e tipo; mostrar apenas nome do paciente, data, tipo e acesso à Agenda.
- **FR-004**: Semana e ações DEVEM compartilhar a interpretação de datas da Agenda, respeitando datas independentes de dieta/avaliação e registros legados; não incluem lembretes pessoais nem criam tarefas ou consultas.
- **FR-005**: Início DEVE funcionar autenticado sem save e oferecer Configurações → Saves; só lê acompanhamentos com arquivo autorizado e descarta dados/respostas anteriores ao trocar, fechar ou bloquear o contexto.
- **FR-006**: A rotina DEVE distinguir sem arquivo, carregando, erro recuperável, semana vazia e ausência de próximas ações, com mensagens próprias e nova tentativa em caso de erro.
- **FR-007**: Configurações DEVE conter “Assinatura”, destino único para plano, ciclo de cobrança, renovação automática, pagamento, faturas e cancelamento, representado nesta entrega pelo texto informativo da US2.
- **FR-008**: Início DEVE mostrar uma linha secundária “Assinatura — Em breve” e “Gerenciar assinatura”, abrindo diretamente essa aba no modal existente, com retorno do foco ao acionador.
- **FR-009**: Capacidades ausentes DEVEM usar placeholders textuais simples e neutros; não podem inventar dados, simular operações, apresentar controles inertes ou esconder recursos já disponíveis atrás de “Em breve”.
- **FR-010**: Assinatura DEVE preservar altura fixa, rolagem interna, teclado, rascunhos e bloqueios do modal; sem rodapé de salvar de outras abas. Perfil, Saves e logout exclusivo na sidebar mantêm seus destinos.
- **FR-011**: Esta entrega NÃO DEVE criar cobrança, provedor de pagamento, faturas, endpoints financeiros, armazenamento, permissões, consultas ou repetição de compromissos. Abrir dashboard/aba informativa não causa gravações.

### Non-Functional Requirements

- **NFR-001**: Compor componentes/tokens canônicos, preservar Atomic Design e primitivos genéricos; desktop a partir de 1024px e WCAG 2.2 AA, com teclado, foco, títulos, datas nomeadas e mensagens de estado.
- **NFR-002**: Uma única leitura de acompanhamentos por carregamento/contexto serve calendário e lista, sem polling, consulta por dia, leitura adicional de histórico ou chamadas financeiras.
- **NFR-003**: Apresentar somente dados do contexto autorizado atual; troca de arquivo/conta elimina a apresentação anterior. Falha permite recuperação sem gravação.
- **NFR-004**: Contratos e cenários de falha precedem implementação; distinguir testes determinísticos, navegador com mocks e sessão real autenticada, sem tratá-los como provas equivalentes.

### Key Entities

- **Acompanhamento existente**: paciente, nome, tipo (dieta/avaliação) e data própria; pertence ao arquivo autorizado, sem campos persistidos novos.
- **Semana corrente**: sete dias locais de domingo a sábado, hoje e contagens derivadas.
- **Próxima ação**: projeção de acompanhamento de hoje ao fim da semana, sem identidade/persistência próprias.
- **Assinatura indisponível**: capacidade futura da conta, sem plano, preço, cobrança ou status financeiro atribuídos.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Sete totais diários e todos os itens futuros da semana coincidem com datas/tipos da Agenda, inclusive viradas de mês/ano e datas distintas por tipo.
- **SC-002**: Assinatura é alcançada em uma ação do Início ou pela aba do modal; fechar devolve foco e alternar três abas não altera altura.
- **SC-003**: Os cinco estados da FR-006 são distinguíveis; sem arquivo autorizado não há leitura, e após troca/bloqueio nenhum item anterior aparece.
- **SC-004**: Zero dados financeiros fictícios, operações simuladas, novas gravações ou mudanças de esquema; Agenda, Perfil, Saves e logout mantêm seus destinos.
- **SC-005**: Teclado e apresentação em 1024, 1280 e 1600px, inclusive zoom de 200%, preservam conteúdo/foco e ausência de overflow horizontal da página; rotina tem prioridade visual.

## Assumptions

- A aprovação das sugestões fixa a divisão Início/Configurações; placeholders cobrem funções ausentes. Esta solicitação autoriza documentação, não execução do plano.
- O calendário rápido reaproveita a Agenda de acompanhamentos existente; não amplia o PRD para consultas/faturamento.
- Cobrança real e avisos de pagamento pendente ou término de teste ficam fora até existir fonte confiável e escopo próprio aprovado.
- Detalhes visuais seguem o design system; sidebar e abas existentes não serão redesenhadas.
