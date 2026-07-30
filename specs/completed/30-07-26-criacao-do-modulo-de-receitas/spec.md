# Feature Specification: Módulo de Receitas Culinárias

**Feature Branch**: `30-07-26-criacao-do-modulo-de-receitas`

**Created**: 30/07/2026

**Status**: Draft

**Input**: User description: "Criação do módulo de Receitas Culinárias com busca de ingredientes da TACO, rendimento por porção, integração com AutoKcalSection e inserção em dietas"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Catálogo e Criação de Receitas Culinárias (Priority: P1) 🎯 MVP

Como nutricionista, quero criar e catalogar receitas culinárias combinando ingredientes da tabela TACO ou alimentos customizados, definindo o número de porções e o modo de preparo, para que o sistema calcule automaticamente a informação nutricional exata por porção.

**Why this priority**: É o valor fundamental do módulo, permitindo a estruturação de receitas e cálculo automatizado de macros/calorias por porção sem necessidade de contas manuais.

**Independent Test**: Criar uma receita com 200g de Frango Grelhado e 100g de Arroz Integral com rendimento de 2 porções. Verificar se o sistema exibe corretamente a metade dos macronutrientes e calorias totais para cada 1 porção.

**Acceptance Scenarios**:

1. **Given** a página de Receitas (`/receitas`), **When** o nutricionista clica em "Criar Nova Receita", **Then** abre-se o modal de construção de receita.
2. **Given** o modal de construção de receita, **When** o usuário adiciona ingredientes e define o número de porções (ex: 4 porções), **Then** os macronutrientes totais são divididos pelo número de porções e o resultado por porção é exibido em tempo real através do componente `AutoKcalSection`.
3. **Given** uma receita criada, **When** o usuário confirma o cadastro, **Then** ela é salva no catálogo e mantida em `localStorage` (`nutridiet_recipes`).

---

### User Story 2 - Navegação e Acesso Centralizado às Receitas (Priority: P2)

Como usuário do aplicativo, quero acessar a seção de Receitas Culinárias diretamente pelo menu lateral (`SidebarNav`), para ter rápida alternância entre pacientes, presets, refeições prontas e receitas.

**Why this priority**: Garante que o módulo esteja integrado de forma orgânica à experiência de navegação do nutricionista.

**Independent Test**: Clicar no item "Receitas Culinárias" na barra lateral e verificar se a rota ativa muda para `/receitas` destacando o ícone correspondente.

**Acceptance Scenarios**:

1. **Given** o menu lateral (`SidebarNav`), **When** o usuário visualiza a lista de navegação, **Then** encontra o item "Receitas Culinárias" com o ícone de utensílios (`Utensils`).
2. **Given** a navegação ativa na rota `/receitas`, **When** a página é renderizada, **Then** o item na barra lateral fica destacado como ativo.

---

### User Story 3 - Inserção de Receitas nos Planos Alimentares (Priority: P3)

Como nutricionista elaborando a dieta de um paciente, quero selecionar uma receita do meu catálogo e inseri-la como uma porção na prescrição alimentar.

**Why this priority**: Conecta o catálogo de receitas à prescrição clínica do paciente.

**Independent Test**: Selecionar uma receita salva durante a montagem de uma dieta e verificar se ela é adicionada à refeição com os valores nutricionais exatos da porção.

**Acceptance Scenarios**:

1. **Given** a montagem de dieta de um paciente, **When** o nutricionista adiciona uma receita prescrita, **Then** a refeição recebe o item consolidado `1 porção de [Nome da Receita]` com as calorias e macronutrientes derivados.

---

### Edge Cases

- **Receita sem ingredientes**: Impedir o salvamento de receitas vazias sem alimentos selecionados.
- **Rendimento de zero porções**: O campo de número de porções deve ter valor mínimo fixado em 1 para evitar divisão por zero no cálculo nutricional.
- **Ingrediente removido da TACO**: Manter uma cópia embutida dos valores nutricionais no ingrediente da receita para resiliência de dados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE disponibilizar uma rota `/receitas` para listagem, busca, criação, edição e exclusão de receitas culinárias.
- **FR-002**: O sistema DEVE permitir a busca de ingredientes a partir da base de alimentos TACO e alimentos customizados.
- **FR-003**: O sistema DEVE calcular automaticamente as calorias e macronutrientes totais da receita e derivar a fração unitária por porção ($\text{Totais} \div \text{nº de porções}$).
- **FR-004**: O componente `AutoKcalSection` DEVE ser reutilizado para exibição dos macronutrientes e calorias por porção no modal da receita.
- **FR-005**: O sistema DEVE persistir a lista de receitas no `localStorage` sob a chave `nutridiet_recipes`.
- **FR-006**: O menu lateral DEVE incluir o link de navegação "Receitas Culinárias".

### Key Entities

- **Recipe**: Entidade contendo `id`, `name`, `category`, `prepTimeMinutes`, `servings`, `instructions`, `ingredients` (array de `RecipeIngredient`).
- **RecipeIngredient**: Sub-entidade contendo `foodId`, `name`, `amountGrams`, `proteinG`, `carbsG`, `fatsG`, `kcal`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos cálculos de calorias por porção respeitam a soma dos ingredientes dividida pelo rendimento informado.
- **SC-002**: Tempo de resposta do filtro e busca de receitas inferior a 50ms.
- **SC-003**: Zero inconsistência de arredondamento em macronutrientes por porção.

## Assumptions

- Cada porção da receita é considerada homogênea e proporcional à divisão exata dos ingredientes.
- O armazenamento inicial em protótipo local utiliza `localStorage`.
