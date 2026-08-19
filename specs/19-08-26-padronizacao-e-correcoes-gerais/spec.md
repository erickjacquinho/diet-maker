# Feature Specification: Padronização Integral, Eliminação de Hardcodes e Correção de Inconsistências

**Feature Branch**: `specs/19-08-26-padronizacao-e-correcoes-gerais`

**Created**: 2026-08-19

**Status**: Draft

**Input**: User description: "adequar 100% das inconsistências. não deixe nada fora do escopo. não conclua sem terminar todo o escopo. resultado esperado: paginas 100% padronizadas às diretrizes do projeto, sem qualquer hardcode"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navegação e Operação Acessível de Seleção de Datas (Priority: P1)

Como nutricionista utilizando o sistema NutriDiet Local Pro em desktop, quero selecionar e alterar datas de acompanhamento e consultas através de um campo com semântica acessível completa, teclado e foco visual normatizado, para que a experiência de agendamento seja fluida e em conformidade com o Design System.

**Why this priority**: O `DatePickerField` é um componente central nas fichas de pacientes e no registro de acompanhamentos. A ausência do átomo `FieldTrigger` quebrava a acessibilidade do teclado e papéis ARIA.

**Independent Test**: Pode ser testado abrindo o campo de seleção de data via teclado (Tab / Enter / Space / Esc / ArrowKeys), verificando `role="button"`, atributos `aria-expanded`, `aria-required`, `aria-invalid` e fechamento ao selecionar um dia.

**Acceptance Scenarios**:

1. **Given** que o usuário navega até um formulário com `DatePickerField`, **When** ele pressiona `Tab`, **Then** o gatilho recebe foco visível como um botão com estilo `h-control-standard rounded-control text-style-field-value`.
2. **Given** que o popup de calendário está aberto, **When** o usuário navega com as setas e pressiona `Enter` em um dia ou clica em uma data, **Then** o valor selecionado é serializado no formato canônico `YYYY-MM-DD`, o popup fecha e o foco retorna ao gatilho.
3. **Given** que o campo é obrigatório ou possui erro de validação, **When** renderizado, **Then** o gatilho expõe `aria-required="true"`, `aria-invalid="true"` e vincula o alerta de erro via `aria-describedby`.

---

### User Story 2 - Visualização Coesa de Indicadores e Macros Nutricionais (Priority: P1)

Como nutricionista elaborando dietas ou avaliando progresso de pacientes, quero visualizar caixas de métricas (`MetricBox`) e cartões de macronutrientes (`MacroMetricCard`) com as cores semânticas oficiais do domínio nutricional (Calorias/Azul, Proteína/Magenta, Carboidrato/Âmbar, Gordura/Teal), para que a leitura de metas e prescrições seja clara e consistente em todas as telas.

**Why this priority**: Macronutrientes são a linguagem central da aplicação clínica. Mapeamentos invertidos geram confusão visual no cálculo de metas.

**Independent Test**: Pode ser testado na tela de prescrição (`/pacientes/[id]/dieta/[dietaId]`) e no showcase do Design System, inspecionando os cartões de calorias, proteínas, carboidratos e gorduras e confirmando as classes de tokens semânticos `--sys-color-macro-*`.

**Acceptance Scenarios**:

1. **Given** um plano alimentar com metas de macronutrientes, **When** os indicadores são renderizados em `MacroMetricCard` e `ProgressBar`, **Then** Calorias usam o token de ação primária/kcal, Proteínas usam `--sys-color-macro-protein` (#b8325a), Carboidratos usam `--sys-color-macro-carbohydrate` (#a55b00) e Gorduras usam `--sys-color-macro-fat` (#0f766e).
2. **Given** um componente `MetricBox` configurado com `tone="protein"` e valor `"150 g"`, **When** renderizado, **Then** o texto do valor recebe diretamente a classe `text-macro-protein` e a tipografia configurada, sem herança indireta instável.

---

### User Story 3 - Elaboração de Dieta Sem Mocks ou Dados Fantasmas (Priority: P2)

Como nutricionista acessando a elaboração de dieta de um paciente, quero que a aplicação carregue os dados reais do paciente ou apresente tela de não encontrado se o paciente não existir, sem nunca sintetizar pacientes falsos com valores padrão aleatórios na memória.

**Why this priority**: A síntese de pacientes hardcoded (`'Paciente Sem Nome'`) mascarava falhas de roteamento e corrompia a integridade dos dados clínicos.

**Independent Test**: Pode ser testado acessando uma rota `/pacientes/id-inexistente/dieta/nova`, confirmando que a interface apresenta estado de registro não encontrado com link de retorno seguro, sem criar registros falsos.

**Acceptance Scenarios**:

1. **Given** um ID de paciente inexistente na URL, **When** a página do construtor de dietas é acessada, **Then** a interface apresenta um estado de erro/não encontrado e não gera paciente fake no armazenamento.
2. **Given** a tela de prescrição em carregamento, **When** os dados estão sendo obtidos do armazenamento local, **Then** é utilizado o componente padronizado `Spinner` do Design System.

---

### User Story 4 - Integridade de Armazenamento e Limpeza em Cascata (Priority: P2)

Como nutricionista excluindo o cadastro de um paciente descontinuado, quero que todas as avaliações físicas e planos alimentares associados a esse paciente sejam integralmente purgados do `localStorage`, para evitar vazamento de memória e acúmulo de dados órfãos.

**Why this priority**: A exclusão incompleta deixava chaves órfãs (`nutridiet_diets_*`) indefinidamente no navegador.

**Independent Test**: Cadastrar um paciente com dieta e avaliação, excluí-lo pela interface e verificar programaticamente que nem `nutridiet_patients`, nem `nutridiet_assessments_*`, nem `nutridiet_diets_*` contêm resquícios do identificador.

**Acceptance Scenarios**:

1. **Given** um paciente com histórico de dietas e avaliações, **When** o usuário confirma sua exclusão no modal, **Then** tanto a chave do paciente quanto os prefixos de dietas e avaliações correspondentes são removidos do armazenamento.

---

### User Story 5 - Limpeza de Código Morto e Padronização de Telas Secundárias (Priority: P3)

Como mantenedor do sistema, quero que todas as páginas (`Receitas`, `Refeições Prontas`, `Presets`, `Pacientes`) sigam rigorosamente os padrões de componentes atômicos, sem diálogos nativos do browser (`window.confirm`), sem imports não utilizados e sem supressão de linting em compilações.

**Why this priority**: Garante que o projeto permaneça 100% aderente à constituição arquitetural e com pipelines de build limpos.

**Independent Test**: Execução de `npm run type-check`, `npm test`, `npm run lint` e auditorias de design system com 100% de conformidade e 0 warnings.

**Acceptance Scenarios**:

1. **Given** a página de Receitas (`/receitas`), **When** o usuário solicita exclusão de uma receita, **Then** a confirmação ocorre via modal/diálogo padronizado do design system, e não via `window.confirm`.
2. **Given** a compilação do projeto via Next.js, **When** executada, **Then** o linter valida todo o código sem flags de supressão (`ignoreDuringBuilds`).

---

### Edge Cases

- **Paciente sem dados de gênero preenchidos**: O sistema deve manter fallbacks seguros e informativos para cálculos de gordura corporal, alertando que o gênero é necessário para a fórmula da Marinha dos EUA.
- **Datas em formatos legados no localStorage**: O utilitário de leitura deve tolerar entradas legadas `DD/MM/YYYY` e normalizá-las transparentemente para o padrão ISO `YYYY-MM-DD`.
- **Valores nulos ou zerados em metas nutricionais**: Cartões de macro e barras de progresso devem exibir `0%` sem quebra por divisão por zero (`NaN%`).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O componente `DatePickerField` MUST utilizar o átomo `FieldTrigger` como gatilho do `Popover`, garantindo semântica de botão, foco acessível e conformidade com WCAG 2.2 AA.
- **FR-002**: As cores e classes semânticas de macronutrientes (`--sys-color-macro-protein`, `--sys-color-macro-carbohydrate`, `--sys-color-macro-fat`, `--sys-color-action-primary` para Kcal) MUST ser uniformemente aplicadas em `MacroMetricCard`, `ProgressBar`, `recipes.ts`, `Badge` e `useDietCalculations`.
- **FR-003**: O componente `MetricBox` MUST aplicar classes de tom (`toneClasses`) e tamanho diretamente ao elemento de valor (`<span>`), mantendo suporte à estrutura `boxed`, `raised`, `tinted` e `inline`.
- **FR-004**: O componente `DietModeSwitcher` MUST expor controles acessíveis com papéis semânticos corretos (`tab`/`tablist` ou `radiogroup`), e `DietBuilderTemplate` MUST evitar renderizações duplicadas do nome do paciente.
- **FR-005**: A linha da tabela de pacientes (`PatientListTableRow`) MUST exibir no subtítulo de dados básicos apenas idade e altura, preservando a coluna de evolução corporal sem sobreposição de peso.
- **FR-006**: A tela `DietBuilderPage` MUST utilizar o componente `Spinner` oficial para estados de carregamento e tratar pacientes inexistentes sem criar mocks em memória.
- **FR-007**: A função `deletePatientFromStorage` MUST purgar todas as dietas associadas (`nutridiet_diets_${id}`) juntamente com o paciente e as avaliações.
- **FR-008**: A página de Receitas MUST substituir `confirm()` pelo componente de diálogo do Design System e eliminar todos os imports mortos.
- **FR-009**: O arquivo `globals.css` MUST remover o `@import` duplicado da fonte Plus Jakarta Sans, mantendo exclusivamente o carregamento via `next/font/google`.
- **FR-010**: O arquivo `next.config.ts` MUST remover a supressão `ignoreDuringBuilds` para assegurar qualidade contínua de código.
- **FR-011**: As tipagens em `useDietCalculations.ts` MUST eliminar o uso de `as any`, utilizando união discriminada estrita.

### Key Entities

- **Patient**: Registro de paciente contendo identificador único (`id`), código sequencial (`code`), dados biométricos, objetivos e metas nutricionais basais.
- **DietPlan**: Prescrição dietética completa contendo refeições simples ou variações de carboidratos associadas a um paciente.
- **BodyAssessment**: Avaliação antropométrica e composição corporal (peso, dobras/perímetros, percentual de gordura e massa magra).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos testes unitários e de acessibilidade no Vitest (`npm test`) passam sem nenhuma falha (0 falhas em toda a suíte de testes).
- **SC-002**: 100% de conformidade nas auditorias de Atomic Design (`audit-atomic-design.mjs`), Z-Index (`audit-z-index.mjs`) e catálogo de componentes (`verify-design-system-components.mjs --strict`).
- **SC-003**: 0 ocorrências de `as any`, `@ts-ignore` ou `console.log` no código de produção em `src/`.
- **SC-004**: 0 valores visuais hardcoded fora da camada de tokens canônica (`tokens.css`).
- **SC-005**: 0 registros de dietas órfãs retidas no `localStorage` após exclusão de pacientes.

## Assumptions

- O ambiente alvo é estritamente desktop (>= 1024px) conforme a Constituição do NutriDiet Local Pro.
- O armazenamento do aplicativo continua baseado no navegador local (`localStorage`), sem persistência remota em nuvem no escopo atual.
- A biblioteca de fontes e design tokens canônica é `design-system/tokens.css` em conjunção com `tailwind.config.js`.
