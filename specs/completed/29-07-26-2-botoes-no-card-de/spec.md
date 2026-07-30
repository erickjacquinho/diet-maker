# Feature Specification: Duplos Botões no Card de Dieta (Read-Only e Editar)

**Feature Branch**: `29-07-26-2-botoes-no-card-de`

**Created**: 2026-07-29

**Status**: Draft

**Input**: User description: "aqui eu quero 2 botoes, o 1 botao para ver a dieta em formado read only e o icone de edicao na direita"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualizar Dieta em Modo Somente Leitura (Priority: P1)

Como nutricionista visualizando o prontuário do paciente, desejo clicar em um botão "Ver Dieta" no card de prescrição para abrir uma modal/gaveta de leitura rápida sem risco de alterar os dados acidentalmente.

**Why this priority**: Permite uma consulta rápida e segura ao plano alimentar prescrito diretamente da tela de histórico/prontuário.

**Independent Test**: Clicar no botão "Ver Dieta" abre a modal com todas as refeições e alimentos em formato read-only com opções de fechar ou imprimir.

**Acceptance Scenarios**:

1. **Given** que o nutricionista está no prontuário do paciente e existe uma dieta prescrita no card, **When** ele clica no botão "Ver Dieta", **Then** uma modal abre exibindo o plano alimentar formatado em modo somente leitura (sem inputs de edição).
2. **Given** que a modal de leitura está aberta, **When** o nutricionista clica em "Fechar" ou no ícone de fechar (X), **Then** a modal é encerrada suavemente retornando à página do paciente.

---

### User Story 2 - Acessar Edição da Dieta via Ícone à Direita (Priority: P2)

Como nutricionista, desejo ter um botão discreto de ícone de edição (lápis) localizado à direita da área de ações do card para abrir diretamente o Construtor de Dietas quando precisar editar o plano alimentar.

**Why this priority**: Mantém a ação de edição acessível, limpa e alinhada com os padrões visuais da aplicação.

**Independent Test**: Clicar no ícone de edição navega diretamente para a rota `/pacientes/[id]/dieta/[dietaId]`.

**Acceptance Scenarios**:

1. **Given** que o nutricionista visualiza o card de dieta no histórico, **When** ele clica no botão de ícone de edição (lápis) no lado direito, **Then** a aplicação navega para o Construtor de Dietas para a dieta correspondente.

---

### Edge Cases

- O que acontece se a dieta não possuir refeições cadastradas ainda? A modal exibe um estado amigável indicando que a prescrição não possui itens cadastrados.
- O que acontece em telas pequenas (mobile)? Os dois botões se organizam de forma responsiva sem quebrar o layout do card.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O card de prescrição dietética no prontuário do paciente (`/pacientes/[id]`) MUST substituir o único botão "Abrir no Construtor de Dietas" por uma barra/linha de 2 ações.
- **FR-002**: A primeira ação MUST ser o botão "Ver Dieta" (ou "Visualizar Dieta") com ícone de olho ou documento.
- **FR-003**: Clicar no botão "Ver Dieta" MUST abrir uma modal/dialog (ou drawer) exibindo a dieta em modo somente leitura (Read-Only) com totais de macronutrientes, lista de refeições, horários e alimentos.
- **FR-004**: A segunda ação MUST ser um ícone de edição (lápis) posicionado à direita da área de ações.
- **FR-005**: Clicar no ícone de edição MUST navegar para `/pacientes/[id]/dieta/[dietaId]`.

### Key Entities

- **Prescrição Dietética**: Objeto de dieta associado ao histórico da consulta do paciente (com id, name, targetKcal, proteinG, carbsG, fatsG e refeições).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O nutricionista consegue visualizar os detalhes da dieta em formato Read-Only em menos de 1 segundo ao clicar em "Ver Dieta".
- **SC-002**: 100% dos cartões de dieta no prontuário apresentam o layout com botão de leitura e ícone de edição à direita.

## Assumptions

- A modal de leitura utilizará os dados da dieta existentes ou mockados do paciente para exibição detalhada das refeições.
- Os ícones seguem a biblioteca Lucide Icons (`Eye`, `Pencil`/`Edit3`, `Utensils`).
