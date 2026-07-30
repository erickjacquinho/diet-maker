# Feature Specification: Simplificação da Tabela do Histórico do Paciente e Novos Dropdowns em Editar Paciente

**Feature Directory**: `specs/29-07-26-simplificacao-da-tabela-do-historico`  
**Created**: 29/07/2026  
**Status**: Draft / Spec Completed  

---

## 1. Executive Summary & User Value

### 1.1 Context & Problem Statement
No gerenciamento de consultas do paciente (`/pacientes/[id]`), a tabela de histórico exibia informações em excesso por linha, poluindo a interface e dificultando o escaneamento visual rápido pelo nutricionista. Além disso, no modal "Editar Dados do Paciente", os campos de Gênero e Objetivo Clínico/Esportivo eram campos de texto livre, o que provocava inconsistências nos dados cadastrais e impossibilitava a seleção padronizada de metas.

### 1.2 Solution Overview
A solução aborda duas frentes principais:
1. **Redesenho e Simplificação da Tabela do Histórico**:
   - Redução da densidade por célula mantendo apenas métricas primárias por linha.
   - Remoção de efeitos de hover indesejados nos badges da coluna "Tipo de Registro".
   - Revelação progressiva (*Progressive Disclosure*): visão resumida no accordion da própria tabela via chevron e visão detalhada completa em rota dedicada via botão "Abrir >".
2. **Evolução do Modal "Editar Dados do Paciente"**:
   - Conversão do campo Gênero em dropdown padronizado (`Select`).
   - Conversão do campo Objetivo em dropdown (`Select`) com botão acoplado à direita (`+ Novo`).
   - Popup modal de criação rápida para adição dinâmica de novos objetivos cadastrais com persistência local e seleção automática.

---

## 2. User Stories & Scenarios

### 2.1 User Story 1: Escaneamento Rápido do Histórico do Paciente
> **Como** Nutricionista acompanhando o histórico do paciente na tela `/pacientes/[id]`  
> **Quero** visualizar a tabela de consultas de forma limpa, enxuta e legível  
> **Para que** eu possa comparar a evolução calórica, de macros, peso e %BF rapidamente sem distrações visuais.

#### Scenario 1.1: Visualização dos Dados Dietéticos Enxutos
- **GIVEN** que o nutricionista está na página de detalhes do paciente (`/pacientes/[id]`),
- **WHEN** a tabela de histórico de consultas for renderizada,
- **THEN** a coluna "Dados Dietéticos" deve exibir somente as calorias e distribuição de macros (`X kcal • Xg P | Xg C | Xg G`), omitindo o nome do plano dietético na célula da tabela.

#### Scenario 1.2: Visualização dos Valores Corporais Enxutos
- **GIVEN** que a tabela de histórico de consultas está visível,
- **WHEN** a coluna "Valores Corporais" for renderizada,
- **THEN** deve exibir apenas o peso e o percentual de gordura (`X kg • X% BF`), ocultando a segunda linha de massa magra e cintura da célula da tabela.

#### Scenario 1.3: Interação com Badges de Tipo de Registro
- **GIVEN** a coluna "Tipo de Registro" com pílulas de status (*Dieta Ativa*, *Dieta Histórica*, *Avaliação Física*),
- **WHEN** o usuário passa o cursor sobre os badges,
- **THEN** o badge não deve sofrer alteração de cor nem mudar o ponteiro do mouse (`pointer-events-none`), mantendo-se estático e visualmente limpo.

---

### 2.2 User Story 2: Detalhamento Progressivo (Resumo vs. Versão Completa)
> **Como** Nutricionista analisando uma consulta anterior  
> **Quero** ver um resumo rápido das calorias/macros ao clicar no chevron e acessar a prescrição completa ao clicar em "Abrir >"  
> **Para que** eu tenha flexibilidade entre consulta rápida inline e edição/análise detalhada em página própria.

#### Scenario 2.1: Expansão Inline de Resumo
- **GIVEN** que o nutricionista clica no ícone chevron ou na linha da tabela,
- **WHEN** o accordion se expandir,
- **THEN** a linha expansível deve apresentar os cards com o resumo de calorias, proteínas, carboidratos e gorduras, além do nome do plano dietético e métricas corporais.

#### Scenario 2.2: Acesso à Página Dedicada Completa
- **GIVEN** que a consulta possui uma prescrição dietética associada,
- **WHEN** o nutricionista clica no botão "Abrir >",
- **THEN** a aplicação deve navegar para a página dedicada do Construtor de Dietas (`/pacientes/[id]/dieta/[dietaId]`).

---

### 2.3 User Story 3: Edição Padronizada de Dados e Adição Dinâmica de Objetivos
> **Como** Nutricionista editando o cadastro do paciente no modal "Editar Dados do Paciente"  
> **Quero** selecionar gênero e objetivo em dropdowns e cadastrar novos objetivos através de um popup  
> **Para que** os dados do paciente fiquem padronizados e eu possa criar metas personalizadas facilmente.

#### Scenario 3.1: Seleção de Gênero via Dropdown
- **GIVEN** o modal "Editar Dados do Paciente" aberto,
- **WHEN** o usuário clica no campo "Gênero",
- **THEN** um dropdown (`Select`) deve exibir as opções "Masculino", "Feminino" e "Outro", permitindo alterar o valor selecionado.

#### Scenario 3.2: Seleção e Cadastro de Novo Objetivo
- **GIVEN** o modal "Editar Dados do Paciente" aberto,
- **WHEN** o usuário clica no botão `+ Novo` localizado à direita do dropdown de Objetivo,
- **THEN** um popup modal secundário deve ser aberto solicitando a descrição do novo objetivo.

#### Scenario 3.3: Inclusão e Seleção Automática do Novo Objetivo
- **GIVEN** o popup modal de novo objetivo aberto,
- **WHEN** o usuário digita a descrição (ex: "Preparação para Maratona") e confirma a inclusão,
- **THEN** o novo objetivo deve ser adicionado à lista de opções, automaticamente selecionado no formulário do paciente, salvo em armazenamento local e confirmado por mensagem toast.

---

## 3. Functional Requirements

### 3.1 Tabela de Histórico de Consultas (`/pacientes/[id]`)
- **FR-01**: A coluna "Dados Dietéticos" DEVE exibir unicamente a linha formatada de calorias e macros (`targetKcal`, `proteinG`, `carbsG`, `fatsG`).
- **FR-02**: A coluna "Valores Corporais" DEVE exibir unicamente a linha formatada de peso e percentual de gordura (`weightKg`, `bodyFatPercent`).
- **FR-03**: A coluna "Tipo de Registro" DEVE conter badges informativos não-interativos com classe `pointer-events-none` e cores sem variação de hover.
- **FR-04**: O badge "Dieta Ativa" DEVE possuir estilização `warm-emerald` com ponto indicador circular verde.
- **FR-05**: O clique no ícone Chevron DEVE alternar a expansão inline do accordion de detalhes resumidos.
- **FR-06**: O botão "Abrir >" DEVE interromper a propagação do evento de clique da linha (`e.stopPropagation()`) e redirecionar para a rota da dieta `/pacientes/[id]/dieta/[dietaId]`.

### 3.2 Modal Editar Dados do Paciente
- **FR-07**: O campo "Gênero" DEVE ser implementado utilizando o componente `Select` com as opções "Masculino", "Feminino" e "Outro".
- **FR-08**: O campo "Objetivo Clínico / Esportivo" DEVE ser implementado utilizando o componente `Select` alimentado por uma lista de objetivos padrão e objetivos customizados.
- **FR-09**: DEVE haver um botão de ação rápida `+ Novo` acoplado à direita do container do dropdown de Objetivo.
- **FR-10**: O clique no botão `+ Novo` DEVE disparar o popup modal `Dialog` "Novo Objetivo".
- **FR-11**: O popup modal de "Novo Objetivo" DEVE conter um input de texto e botões "Cancelar" e "Adicionar".
- **FR-12**: Ao adicionar um novo objetivo, este DEVE ser persistido em `localStorage` sob a chave `nutridiet_custom_objectives`, selecionado no formulário atual e notificado via `toast.success`.

---

## 4. Non-Functional & Quality Requirements

- **NFR-01 (Design System Alignment)**: Todos os componentes visuais de tabela, badges, botões, selects e dialogs devem utilizar rigorosamente os tokens de cor do projeto (`warm-emerald`, `warm-charcoal`, `warm-inner`, `warm-card`, `warm-border`, `warm-muted`).
- **NFR-02 (Performance & Responsividade)**: A abertura dos popups e dropdowns deve ocorrer em tempo de resposta imediato (< 100ms) sem causa de re-renders desnecessários.
- **NFR-03 (TypeScript Strictness)**: Ausência total de erros de compilação ou inferência `any` em `npm run type-check`.
- **NFR-04 (Test Coverage)**: Manutenção de 100% de aprovação na suíte de testes unitários `vitest`.

---

## 5. Success Criteria & Metrics

- **SC-01**: 100% das linhas da tabela de histórico exibem apenas 1 linha textual nas colunas de Dados Dietéticos e Valores Corporais.
- **SC-02**: NENHUM badge da coluna Tipo de Registro sofre alteração de cor ou cursor ao passar o mouse.
- **SC-03**: O clique no botão `+ Novo` abre o popup modal em menos de 100ms e a inclusão de um novo objetivo seleciona-o imediatamente no formulário de edição.
- **SC-04**: Passagem com 0 falhas nos comandos `npm run type-check` e `npm run test`.
