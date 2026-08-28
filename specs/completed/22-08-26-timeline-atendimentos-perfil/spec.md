# Feature Specification: Timeline de Atendimentos com Filtros Rápidos no Perfil do Paciente

**Feature Branch**: `22-08-26-timeline-atendimentos-perfil`

**Created**: 2026-08-22

**Status**: Ready for Implementation

**Input**: User description: "Refatorar o Histórico de Consultas da página de perfil do paciente substituindo a tabela com pareamento forçado de dietas e medidas por uma Timeline de Atendimentos com Filtros Rápidos (Todas as Entradas, Avaliações Físicas, Prescrições Dietéticas), permitindo múltiplos registros no mesmo dia sem duplicação de datas, revisando o mecanismo do chevron para ações diretas e expansão com progressive disclosure, e preservando o design system e acessibilidade."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualizar atendimentos em timeline unificada e cronológica (Priority: P1)

Como nutricionista, quero visualizar os atendimentos do paciente organizados em uma linha do tempo cronológica com cards independentes para cada dieta prescrita e cada avaliação física realizada, para que múltiplos registros no mesmo dia sejam exibidos com clareza sem repetição de datas ou pareamentos arbitrários.

**Why this priority**: É o cerne da visualização do prontuário e elimina a fragilidade do modelo tabular anterior, garantindo que qualquer número de dietas ou avaliações no mesmo dia seja renderizado sem conflito.

**Independent Test**: Ao acessar o perfil de um paciente com 2 dietas e 1 avaliação física na mesma data, o nutricionista visualiza 1 único cabeçalho de data com 3 cards distintos e autônomos (2 de dieta e 1 de avaliação), sem duplicação de data ou textos de ausência fictícia.

**Acceptance Scenarios**:
1. **Given** um paciente com 1 dieta e 1 avaliação na mesma data, **When** o perfil é aberto, **Then** a timeline exibe um cabeçalho de data único contendo o card da avaliação física e o card da prescrição dietética.
2. **Given** um paciente com 2 dietas cadastradas no mesmo dia (ex.: dias de treino e descanso), **When** a timeline é consultada, **Then** ambas as dietas aparecem como cards completos e individuais sob a mesma data.
3. **Given** um atendimento contendo apenas avaliação física (sem nova dieta), **When** a timeline é consultada, **Then** exibe apenas o card de avaliação, sem exibir placeholders vazios de dieta.

---

### User Story 2 - Filtrar a visualização por tipo de atendimento (Priority: P1)

Como nutricionista, quero alternar rapidamente entre a visão completa, a visão exclusiva de avaliações físicas e a visão exclusiva de prescrições dietéticas usando abas/filtros no topo do histórico, para focar exclusivamente na análise da evolução corporal ou no catálogo de dietas passadas.

**Why this priority**: Reduz drasticamente a carga cognitiva durante o atendimento clínico, permitindo isolar a progressão física ou dietética em 1 único clique.

**Independent Test**: Ao clicar no filtro "Avaliações Físicas", todos os cards de dieta são ocultados e a timeline exibe estritamente a sequência histórica de avaliações corporais e deltas.

**Acceptance Scenarios**:
1. **Given** a timeline no modo padrão ("Todas as Entradas"), **When** o nutricionista clica na aba "Avaliações Físicas", **Then** apenas os cards de avaliação corporal permanecem visíveis, com a contagem exata de avaliações no badge da aba.
2. **Given** a aba "Prescrições Dietéticas" selecionada, **When** o nutricionista visualiza o histórico, **Then** apenas as dietas passadas e vigentes são listadas com seus macros e calorias.
3. **Given** um filtro selecionado sem registros correspondentes, **When** a aba é aberta, **Then** um estado vazio contextual e amigável é apresentado, orientando a criação do primeiro registro.

---

### User Story 3 - Acessar detalhes e refeições com Progressive Disclosure intencional (Priority: P2)

Como nutricionista, quero interagir com botões de ação explícitos ("Ver Cardápio", "Ver Detalhes") em vez de chevrons ambíguos, para inspecionar refeições completas ou medições de dobras/perímetros de forma instantânea e previsível.

**Why this priority**: Substitui ícones genéricos por intenções claras de ação, melhorando a ergonomia, acessibilidade e velocidade de inspeção sem custo de troca de página.

**Independent Test**: No card de dieta, o botão "Ver Cardápio" abre imediatamente o modal de leitura rápida com as refeições; no card de avaliação física, o botão "Ver Detalhes" desdobra inline as dobras cutâneas e perímetros corporais com transição suave.

**Acceptance Scenarios**:
1. **Given** um card de dieta na timeline, **When** o nutricionista clica em "Ver Cardápio", **Then** o modal read-only com o detalhamento de refeições e alimentos é aberto imediatamente.
2. **Given** um card de avaliação física, **When** o nutricionista clica em "Ver Detalhes", **Then** o painel de medidas complementares (dobras, perímetros, FFMI) se expande inline e o rótulo do botão muda para "Ocultar Detalhes".
3. **Given** o card de dieta ou avaliação, **When** o botão "Editar" é acionado, **Then** o usuário é direcionado para o respectivo ambiente de edição no Construtor de Dietas ou Workspace Antropométrico.

---

### Edge Cases

- O que acontece quando o paciente não possui nenhum histórico de atendimento? A timeline renderiza um estado vazio acolhedor com botões primários para "Criar Primeira Dieta" e "Registrar Primeira Avaliação".
- O que acontece quando há datas com formatos legados ou ordens temporais inversas? O seletor normaliza todas as datas para ISO e ordena rigorosamente do atendimento mais recente para o mais antigo.
- O que acontece quando a avaliação física contém apenas dados básicos (peso e altura) sem dobras? O botão "Ver Detalhes" exibe apenas os campos preenchidos e sinaliza amigavelmente que dobras cutâneas não foram mensuradas naquela consulta.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST renderizar os atendimentos históricos do paciente em formato de timeline cronológica agrupada por data decrescente.
- **FR-002**: O sistema MUST suportar múltiplos registros de qualquer tipo no mesmo dia sem duplicar o cabeçalho de data e sem forçar pareamento artificial entre dietas e avaliações.
- **FR-003**: O sistema MUST disponibilizar um controle de filtros rápidos no topo do histórico com 3 opções: "Todas as Entradas", "Avaliações Físicas" e "Prescrições Dietéticas", incluindo badges com a quantidade de itens em cada categoria.
- **FR-004**: O card de prescrição dietética MUST exibir: nome do plano, badge de status ("Vigente" ou "Histórica"), calorias totais (`targetKcal`), distribuição de macronutrientes (`proteinG`, `carbsG`, `fatsG`), botão "Ver Cardápio" e botão de edição no construtor de dietas.
- **FR-005**: O card de avaliação física MUST exibir: peso (`weightKg`), percentual de gordura (`bodyFatPercent`), massa magra (`muscleMassKg`), circunferência de cintura (`waistCm`), badge de tendência/evolução quando aplicável, botão de expansão de detalhes de dobras/perímetros e botão de edição da avaliação.
- **FR-006**: O acionamento de "Ver Cardápio" MUST abrir o modal de leitura rápida (`ReadOnlyDietModal`) com o detalhamento das refeições daquela dieta específica.
- **FR-007**: A expansão de detalhes da avaliação física MUST ocorrer inline com controle acessível (`aria-expanded`, foco visível e rótulo dinâmico "Ver Detalhes" / "Ocultar Detalhes").
- **FR-008**: O cabeçalho da seção de histórico MUST preservar os botões de ação rápida "Nova Avaliação" e "Nova Dieta" direcionando para as rotas de criação.
- **FR-009**: A interface MUST respeitar a arquitetura Atomic Design e os tokens do design system canônico (`Surface`, `textStyle`, `Badge`, cores de macronutrientes).
- **FR-010**: Todos os controles interativos MUST cumprir WCAG 2.2 AA (navegação por teclado, contraste semântico, alvos de clique adequados).

### Key Entities

- **TimelineItem**: Evento discriminado da linha do tempo (`TimelineDietEvent` ou `TimelineAssessmentEvent`) contendo id único, timestamp, data legível e dados do registro correspondente.
- **TimelineDateGroup**: Agrupador por data contendo a data formatada e a lista de eventos ocorridos naquele dia.
- **HistoricalDiet**: Registro de dieta com calorias, macronutrientes, refeições e status de vigência.
- **BodyAssessment**: Avaliação física antropométrica com peso, composição corporal, dobras e perímetros.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O nutricionista consegue visualizar e identificar todos os registros de um dia com múltiplos atendimentos em menos de 3 segundos, sem encontrar linhas duplicadas.
- **SC-002**: A alternância entre os filtros "Todas", "Avaliações" e "Dietas" ocorre instantaneamente (0ms de latência percebida) sem recarregamento de página.
- **SC-003**: 100% dos testes unitários e de acessibilidade da suíte de pacientes passam com sucesso.
- **SC-004**: Eliminação completa de textos residuais artificiais ("Sem alteração dietética" / "Sem medição corporal") na visualização do histórico.

## Assumptions

- O escopo é exclusivamente desktop a partir de 1024px, conforme a Constituição do projeto.
- Os dados continuam persistidos em `nutridiet_assessments_*` e `nutridiet_diets_*` no storage local, sem necessidade de migração de banco de dados no momento.
- A rota dedicada `/pacientes/[id]/consulta/[date]` permanece acessível como prontuário detalhado quando necessário.
