# Feature Specification: Reorganização estrutural do perfil do paciente

**Feature Branch**: `04-08-26-reorganizacao-perfil-paciente`

**Created**: 2026-08-04

**Status**: Implemented — validação direcionada concluída; suíte global e captura Playwright pendentes por timeout do ambiente

**Input**: User description: "Refatorar estruturalmente a página de perfil do paciente para priorizar informações clínicas e pessoais que ajudam o nutricionista no acompanhamento. Avaliar e substituir o grande quadro de metas nutricionais atuais por uma apresentação mais útil e contextual: manter o perfil focado em dados pessoais, indicadores corporais atuais, última consulta e próximo acompanhamento; quando houver uma dieta ativa, mostrar apenas um resumo compacto do plano atual, com origem temporal/status claros e acesso à dieta detalhada; quando não houver dieta ativa, orientar a criação sem inventar macros. Manter os macros detalhados na página/fluxo da dieta e no histórico. Usar componentes e tokens existentes, preservar o design system, acessibilidade e a arquitetura atual, sem criar componentes de produto desnecessários."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entender rapidamente o estado atual do paciente (Priority: P1)

Como nutricionista, quero abrir o perfil e encontrar primeiro os dados pessoais, indicadores corporais atuais, última consulta e próximo acompanhamento, para decidir o próximo passo sem interpretar um painel de metas que pode estar desatualizado ou fora de contexto.

**Why this priority**: Essa é a tarefa central do perfil e reduz a carga cognitiva no momento de atendimento.

**Independent Test**: Com um paciente que possui dados pessoais, pelo menos uma medição e uma consulta, o nutricionista consegue localizar nome, objetivo, indicadores atuais e agenda sem precisar abrir outra seção.

**Acceptance Scenarios**:

1. **Given** um paciente com dados pessoais e indicadores corporais, **When** o perfil é aberto, **Then** a primeira área de conteúdo prioriza esses dados antes do histórico de dietas.
2. **Given** um perfil com próxima consulta definida, **When** o nutricionista consulta o resumo, **Then** a data aparece como informação contextual de acompanhamento, sem competir visualmente com os dados pessoais atuais.
3. **Given** um perfil sem próxima consulta, **When** o nutricionista consulta o resumo, **Then** o estado vazio orienta a definição de acompanhamento sem criar uma data ou uma meta fictícia.

---

### User Story 2 - Reconhecer o plano alimentar vigente sem confundir metas manuais com dieta (Priority: P1)

Como nutricionista, quero saber se existe um plano alimentar ativo e qual é sua referência temporal, para distinguir a dieta realmente vigente de metas pessoais antigas ou editáveis.

**Why this priority**: O plano vigente é relevante para a tomada de decisão, mas só quando existe um vínculo claro com uma dieta registrada.

**Independent Test**: Com um paciente que possui uma dieta ativa, o nutricionista identifica nome ou referência, status e data do plano no perfil e consegue acessar seus detalhes em uma ação explícita.

**Acceptance Scenarios**:

1. **Given** uma dieta ativa registrada para o paciente, **When** o perfil é aberto, **Then** aparece um resumo compacto do plano atual com referência temporal, status e acesso à dieta detalhada.
2. **Given** metas manuais do paciente preenchidas, mas nenhuma dieta ativa registrada, **When** o perfil é aberto, **Then** as metas manuais não são apresentadas como se fossem o plano vigente.
3. **Given** mais de uma dieta registrada, **When** o perfil é aberto, **Then** o resumo identifica somente a dieta vigente conforme o estado definido pelo histórico, sem misturar valores de versões anteriores.
4. **Given** uma dieta ativa com totais energéticos e de macronutrientes, **When** o resumo é consultado, **Then** esses dados aparecem em baixa hierarquia e de forma compacta; o detalhamento permanece no fluxo da dieta e no histórico.

---

### User Story 3 - Consultar o histórico sem perder contexto (Priority: P2)

Como nutricionista, quero acessar dietas e avaliações físicas organizadas por data, para comparar evolução e entender a origem dos dados apresentados no perfil.

**Why this priority**: O histórico sustenta a análise longitudinal, mas deve ficar depois do resumo atual para não interromper o atendimento.

**Independent Test**: Com e sem registros históricos, o nutricionista consegue distinguir o estado vazio do conteúdo histórico e abrir os detalhes de uma dieta ou avaliação registrada.

**Acceptance Scenarios**:

1. **Given** um paciente sem histórico, **When** o histórico é consultado, **Then** o estado vazio explica a situação e oferece a ação de criar a primeira dieta.
2. **Given** um paciente com histórico, **When** o histórico é consultado, **Then** dietas e avaliações aparecem agrupadas por data e preservam seus detalhes sem serem duplicadas no resumo do perfil.
3. **Given** um registro histórico antigo, **When** ele é aberto, **Then** seus valores são apresentados como históricos, sem substituir os indicadores corporais atuais.

---

### Edge Cases

- Quando não existe avaliação física, os indicadores sem medição devem permanecer em estado vazio explícito, sem reutilizar metas manuais como medição atual.
- Quando a dieta ativa não possui nome ou algum total, o resumo deve usar a informação disponível e indicar a ausência sem preencher com valores inventados.
- Quando há mais de uma dieta marcada como ativa, a dieta com a data de registro mais recente deve ser tratada como vigente; em empate de data, a primeira ocorrência na fonte do histórico deve ser mantida de forma determinística.
- Quando o objetivo clínico ou o nome do plano é longo, a hierarquia deve continuar legível e não ocultar o nome do paciente ou as ações principais.
- Quando a data de acompanhamento é removida ou não existe, o estado vazio deve permanecer acionável e não ocupar a mesma ênfase de uma consulta confirmada.
- Quando dados pessoais e indicadores possuem atualizações em momentos diferentes, cada dado deve manter seu contexto temporal, evitando que uma medição antiga seja tratada como atual.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O perfil deve organizar o conteúdo na seguinte ordem de prioridade: identidade e dados pessoais atuais; indicadores corporais atuais; última consulta e próximo acompanhamento; plano alimentar vigente, quando aplicável; histórico detalhado.
- **FR-002**: O perfil deve manter visíveis os dados pessoais necessários ao atendimento, incluindo nome, gênero, objetivo clínico e os demais dados cadastrais definidos pelo produto, sem transformar esses dados em metas nutricionais.
- **FR-003**: O perfil não deve apresentar um quadro independente de “metas nutricionais atuais” baseado apenas em metas manuais do paciente como se elas fossem a dieta mais recente.
- **FR-004**: Quando houver uma dieta vigente no histórico, o perfil deve apresentar um resumo compacto que identifique o plano, sua data ou referência temporal, seu status e uma ação para consultar os detalhes; se houver mais de uma dieta `Ativa`, deve prevalecer a de data de registro mais recente.
- **FR-005**: O resumo do plano vigente pode apresentar os totais energéticos e de macronutrientes da dieta em uma única composição de baixa hierarquia, desde que a origem temporal fique explícita e que o detalhamento continue no fluxo da dieta e no histórico.
- **FR-006**: Quando não houver dieta vigente, o perfil deve apresentar um estado vazio contextualizado e uma ação para criar ou iniciar uma dieta, sem exibir placeholders de calorias ou macronutrientes como dados atuais.
- **FR-007**: O histórico deve continuar permitindo a consulta de dietas e avaliações por data, deixando evidente quando um registro é histórico e não um indicador atual.
- **FR-008**: Indicadores corporais atuais devem usar a medição mais recente disponível para o paciente; a ausência de medição deve ser distinguida da ausência de meta nutricional.
- **FR-009**: O próximo acompanhamento deve permanecer visualmente discreto em relação ao resumo de identidade e aos indicadores, mas continuar claramente acionável para definir ou alterar uma data.
- **FR-010**: A solução deve reutilizar componentes, ícones, tokens, espaçamentos e padrões já existentes no design system do produto, sem introduzir um novo componente de produto quando a composição de componentes existentes for suficiente.
- **FR-011**: Toda informação interativa do fluxo deve possuir nome acessível, foco visível, operação por teclado e estados vazios compreensíveis, atendendo ao escopo desktop e às regras WCAG 2.2 AA do produto.
- **FR-012**: A terminologia deve diferenciar consistentemente “indicador atual”, “meta manual”, “plano vigente” e “registro histórico” em títulos, rótulos, estados vazios e ações.

### Key Entities

- **Patient Profile**: contexto cadastral e clínico do paciente, incluindo identidade, gênero, objetivo clínico e dados pessoais estáveis.
- **Body Assessment**: avaliação corporal datada, com peso, percentual de gordura, massa magra e cintura; a avaliação mais recente alimenta os indicadores atuais.
- **Historical Diet**: dieta registrada com data, estado de vigência e metas energéticas/macronutrientes; versões antigas permanecem históricas.
- **Active Plan Summary**: representação compacta da dieta vigente no perfil, com referência temporal, status, totais resumidos e acesso aos detalhes.
- **Follow-up Appointment**: próxima data de acompanhamento e seu estado vazio ou definido.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em uma revisão com cinco perfis representativos, o nutricionista encontra nome, objetivo, indicadores atuais e situação do acompanhamento em até 10 segundos, sem abrir o histórico.
- **SC-002**: O perfil deixa de reservar uma área de destaque para um quadro independente de metas manuais; a informação de plano só aparece quando há uma dieta vigente identificável.
- **SC-003**: Para perfis com dieta vigente, o resumo do plano apresenta no máximo cinco grupos de informação primária — referência do plano, data, status, resumo energético/macros e ação de detalhes — sem duplicar a grade detalhada da dieta.
- **SC-004**: Para perfis sem dieta vigente, nenhum valor de calorias ou macronutrientes é apresentado como “atual” sem origem em uma dieta registrada.
- **SC-005**: A partir do perfil, os detalhes da dieta vigente ou de qualquer registro histórico ficam disponíveis em uma única ação claramente identificada.
- **SC-006**: A avaliação visual não identifica divergência de tokens, hierarquia ou dimensionamento de ícones entre o resumo do paciente, indicadores, acompanhamento e histórico quando comparados aos componentes equivalentes do design system.
- **SC-007**: Todos os cenários de estado vazio e ações de acompanhamento permanecem compreensíveis e operáveis por teclado, com foco visível e nomes acessíveis.

## Assumptions

- O produto continuará sendo desktop web a partir de 1024px; mobile, tablet e dark mode não fazem parte desta mudança.
- O histórico de dietas já é a fonte de verdade para determinar a dieta vigente e seus totais; não será criada uma nova fonte de dados para o perfil.
- Metas manuais do paciente podem continuar existindo para edição ou uso interno, mas não serão promovidas automaticamente a “plano vigente”.
- O fluxo detalhado de criação e edição de dietas permanece fora do escopo; esta especificação altera apenas a forma como o perfil resume o contexto.
- A definição de próximo acompanhamento e a consulta de avaliações físicas existentes permanecem funcionais e serão apenas reorganizadas dentro da hierarquia descrita.
- Não há necessidade de nova integração externa, migração de dados ou mudança de persistência para entregar a primeira versão desta estrutura.
- A implementação futura deve seguir a hierarquia Atomic Design e os tokens canônicos do projeto; valores visuais novos exigem o processo de governança do design system.

## Clarifications

### Session 2026-08-04

- Nenhuma pergunta crítica foi necessária: a prioridade do perfil, a distinção entre metas manuais e dieta vigente, o estado sem dieta e a permanência dos macros detalhados no fluxo da dieta foram definidos pelo contexto da conversa.
