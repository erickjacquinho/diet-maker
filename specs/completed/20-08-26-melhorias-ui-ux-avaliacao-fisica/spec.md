# Feature Specification: Melhorias de UI/UX na Tela de Avaliação Física

**Feature Branch**: `20-08-26-melhorias-ui-ux-avaliacao-fisica`

**Created**: 2026-08-20

**Status**: Draft

**Input**: User description: "Implementar pacote de melhorias UI/UX na tela de avaliação física: deltas anteriores inline nos inputs, auto-select on focus, atalho Ctrl+S, badges de classificação clínica (BF, IMC, RCQ), barra visual de distribuição de massa, trava de alterações não salvas (dirty guard) e copiar resumo para WhatsApp."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entrada de Dados de Alta Performance no Teclado (Priority: P1)

Como nutricionista em consulta clínica, quero preencher e atualizar as medições corporais rapidamente com seleção automática de texto no foco, visualização inline da medida anterior com delta e atalho `Ctrl+S`, para que eu não precise alternar para o mouse ou usar backspace repetidamente durante o exame antropométrico.

**Why this priority**: A tomada de medidas é o momento de maior intensidade motora da consulta física. Reduzir atritos de digitação economiza minutos cruciais por atendimento.

**Independent Test**: Abrir `/pacientes/[id]/avaliacao/nova` para um paciente com avaliação prévia, navegar pelos campos usando `Tab`, digitar novos valores sobre o texto auto-selecionado, visualizar a indicação inline de delta em relação à consulta anterior e salvar pressionando `Ctrl+S` / `Cmd+S`.

**Acceptance Scenarios**:

1. **Given** que o profissional navega para um input numérico via `Tab` ou clique, **When** o campo recebe foco, **Then** o texto existente é selecionado por completo permitindo substituição imediata.
2. **Given** que o paciente possui uma avaliação física anterior, **When** o formulário é exibido, **Then** cada campo com histórico exibe abaixo ou adjacente ao input a medição anterior e a variação numérica calculada (ex: `Anterior: 84.0 cm (-1.5 cm)`).
3. **Given** qualquer campo com foco ou com a página ativa, **When** o usuário pressiona `Ctrl+S` (Windows/Linux) ou `Cmd+S` (macOS), **Then** o atalho nativo do navegador é interceptado e o formulário executa a rotina de validação e salvamento.

---

### User Story 2 - Biofeedback e Classificação Clínica Instantânea (Priority: P1)

Como profissional de saúde, quero que o painel lateral exiba a classificação clínica categorizada de acordo com as diretrizes de saúde (OMS / Pollock) para Percentual de Gordura (BF%), IMC e Risco Cardiovascular pela Relação Cintura-Quadril (RCQ), para que eu possa orientar o paciente imediatamente sobre seu status nutricional.

**Why this priority**: Dados antropométricos brutos precisam de interpretação imediata para gerar valor clínico durante o diálogo com o paciente.

**Independent Test**: Preencher peso, altura, cintura, pescoço e quadril de um paciente masculino ou feminino e verificar que os badges de categoria (ex: `Atlético`, `Eutrofia`, `Baixo Risco`) aparecem reativamente no painel lateral com cores semânticas apropriadas.

**Acceptance Scenarios**:

1. **Given** um percentual de gordura calculado, **When** o valor é exibido no HUD lateral, **Then** um badge categoriza o percentual conforme o sexo do paciente (ex: `Atlético`, `Bom`, `Normal`, `Elevado`).
2. **Given** um IMC calculado com base no peso e altura, **When** os valores são processados, **Then** um badge indica a faixa correspondente (ex: `Abaixo do peso`, `Eutrofia`, `Sobrepeso`, `Obesidade`).
3. **Given** as medidas de cintura e quadril preenchidas, **When** a RCQ é calculada, **Then** um badge indica o nível de risco cardiovascular associado (ex: `Baixo Risco`, `Risco Moderado`, `Alto Risco`).

---

### User Story 3 - Visualização Gráfica da Distribuição Corporal e Alinhamento à Meta (Priority: P2)

Como nutricionista e paciente, queremos visualizar graficamente a proporção entre massa magra e massa gorda através de uma barra de distribuição percentual empilhada e um indicador de alinhamento com a meta cadastrada, para facilitar a compreensão visual dos resultados pelo paciente.

**Why this priority**: A visualização gráfica facilita a comunicação nutricionista-paciente e engaja o paciente na evolução de seu plano alimentar.

**Independent Test**: Preencher as medidas e conferir a barra de distribuição no painel lateral mostrando o percentual relativo de massa magra e massa gorda em cores contrastantes e legíveis.

**Acceptance Scenarios**:

1. **Given** o cálculo de massa magra (kg) e massa gorda (kg), **When** os valores são finitos, **Then** uma barra horizontal dividida em duas frações proporcionais ilustra o percentual de massa magra e massa gorda.
2. **Given** um paciente com objetivo definido (ex: `Cutting`, `Bulking`, `Emagrecimento`), **When** houver redução de gordura ou ganho de massa magra em relação à consulta anterior, **Then** um indicador visual destaca o alinhamento da evolução com a meta.

---

### User Story 4 - Prevenção de Perda de Dados e Compartilhamento Rápido (Priority: P2)

Como nutricionista, quero receber um aviso ao tentar sair de uma avaliação com dados alterados e não salvos, e ter a opção de copiar um resumo textual limpo com 1 clique para enviar no WhatsApp ou colar em prontuários externos.

**Why this priority**: Evita retrabalho catastrófico de medições perdidas e agiliza a comunicação pós-consulta.

**Independent Test**: Modificar um campo na tela de avaliação e tentar clicar no botão "Voltar", confirmando a exibição do diálogo de confirmação; clicar no botão "Copiar Resumo" e verificar que a área de transferência recebe o texto formatado.

**Acceptance Scenarios**:

1. **Given** que o formulário está em estado modificado (*dirty*), **When** o profissional clica em "Voltar" ou tenta navegar para outra rota, **Then** um diálogo de confirmação alerta sobre as alterações não salvas antes de permitir a saída.
2. **Given** uma avaliação preenchida com cálculos válidos, **When** o profissional clica no botão "Copiar Resumo", **Then** uma mensagem formatada com os deltas e medidas corporais é copiada para o clipboard e uma notificação de sucesso (*toast*) é disparada.

---

### Edge Cases

- **Paciente sem avaliação anterior**: Quando for a primeira avaliação do paciente, os indicadores de delta inline e no resumo lateral exibem estado vazio/neutro (`—`) sem erros de cálculo ou comparações inválidas.
- **Campos incompletos para a fórmula US Navy**: Se faltar cintura, pescoço ou quadril, a barra de distribuição e badges de BF permanecem em estado pendente, exibindo texto auxiliar claro informando quais medidas completam o cálculo.
- **Tentativa de salvar com dados inválidos via `Ctrl+S`**: Dispara a validação inline, exibe o alerta de erro e mantém o foco no primeiro campo com pendência.
- **Espelhamento Bilateral Manual**: Se o profissional preencher valores distintos para o lado esquerdo e direito, o sistema calcula a assimetria real em vez de sobrescrever.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O componente de campo de medição MUST selecionar todo o conteúdo do input ao receber foco de teclado (`onFocus` com seleção de texto).
- **FR-002**: O formulário MUST exibir, abaixo de cada campo aplicável, o valor registrado na avaliação anterior e a variação relativa ($\Delta$), respeitando as unidades (`kg` e `cm`).
- **FR-003**: O sistema MUST interceptar `Ctrl+S` e `Cmd+S` no escopo da tela de avaliação física para disparar o fluxo de salvamento sem abrir a janela nativa do navegador.
- **FR-004**: O painel lateral MUST calcular e classificar o percentual de gordura corporal por sexo e idade, exibindo um badge semântico de classificação.
- **FR-005**: O painel lateral MUST classificar o IMC nas faixas padrão da OMS (Abaixo do peso, Eutrofia, Sobrepeso, Obesidade) com identificador visual.
- **FR-006**: O painel lateral MUST calcular a Relação Cintura-Quadril (RCQ) e classificar o nível de risco cardiovascular conforme o sexo do paciente.
- **FR-007**: O painel lateral MUST renderizar uma barra horizontal empilhada exibindo a proporção visual entre massa magra (%) e massa gorda (%).
- **FR-008**: O sistema MUST rastrear o estado de modificação (*dirty state*) e solicitar confirmação antes de descartar alterações não salvas.
- **FR-009**: O painel lateral MUST disponibilizar a ação "Copiar Resumo", gerando texto formatado com os principais indicadores corporais e deltas na área de transferência.
- **FR-010**: A interface MUST cumprir integralmente o Design System canônico (`Surface`, `MetricBox`, `Badge`, `textStyle`) e a Constituição do projeto.

### Key Entities

- **BodyAssessment**: Entidade contendo peso, 14 circunferências, resultados derivados (BF%, massa gorda, massa magra) e data da medição.
- **ClinicalClassification**: Estrutura derivada em memória contendo as faixas normativas e badges para BF, IMC e RCQ.
- **AssessmentDeltas**: Estrutura comparativa contendo as diferenças numéricas e percentuais entre a avaliação em edição e a anterior.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Nutricionistas conseguem preencher e salvar uma reavaliação de 15 campos em menos de 30 segundos utilizando apenas navegação por teclado (`Tab` e `Ctrl+S`).
- **SC-002**: 100% dos cálculos de IMC, RCQ e bioimpedância US Navy são atualizados reativamente em menos de 50ms após a alteração de qualquer input numérico.
- **SC-003**: 0% de fechamentos acidentais com perda de dados através do interceptador de *dirty state*.
- **SC-004**: Conformidade estrita de 100% nas auditorias automatizadas de Atomic Design e Design System (`audit:atomic-design` e `verify:design-system`).

---

## Assumptions

- O escopo da aplicação é desktop web (`>= 1024px`), conforme a Constituição do NutriDiet Local Pro.
- As fórmulas de classificação clínica baseiam-se nos consensos da Organização Mundial da Saúde (OMS) para IMC, tabelas US Navy / Pollock para BF% e Bray & Gray para RCQ.
- As ações de copiar para a área de transferência utilizam a API padrão do navegador (`navigator.clipboard.writeText`) com fallback seguro.
