# Feature Specification: Duas Tabelas Especializadas de Histórico (Avaliações Físicas e Prescrições Dietéticas)

**Feature Branch**: `23-08-26-tabelas-isoladas-dietas-avaliacoes`
**Created**: 2026-08-23
**Status**: Ready for Implementation

**Input**: User description: "Dividir o histórico do paciente em 2 tabelas especializadas empilhadas (uma em cima da outra) utilizando o mesmo componente canônico DataTable para ambas, com adaptações de colunas e ações otimizadas para o workflow clínico de nutricionistas (avaliação corporal com curva de evolução e expansão inline; prescrição dietética com macros, status de vigência e modal de visualização rápida do cardápio)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Analisar a evolução antropométrica em tabela dedicada (Priority: P1)

Como nutricionista, quero visualizar todas as avaliações físicas do paciente em uma tabela própria e dedicada com colunas de Peso, % Gordura, Massa Magra, Cintura e indicador de evolução, para acompanhar a curva de composição corporal consulta a consulta sem misturar com dados de cardápio.

**Why this priority**: Permite leitura vertical imediata da evolução física do paciente, eliminando o atrito cognitivo de pular linhas vazias.

**Independent Test**: Ao abrir o perfil de um paciente com 3 avaliações corporais, o nutricionista visualiza a tabela de Avaliações Físicas com 3 linhas ordenadas da mais recente para a mais antiga, com métricas alinhadas em colunas específicas e botão de expansão de circunferências.

**Acceptance Scenarios**:
1. **Given** um paciente com avaliações físicas cadastradas, **When** o nutricionista acessa a seção "Histórico de Avaliações Físicas", **Then** a tabela exibe colunas especializadas (Data, Peso, % Gordura, Massa Magra, Cintura, Evolução, Ações).
2. **Given** uma linha de avaliação física com perímetros corporais mensurados, **When** o nutricionista clica no botão de expansão ("Ver Detalhes"), **Then** a linha se desdobra inline exibindo os perímetros complementares (tórax, braço, quadril, coxa, panturrilha).
3. **Given** um paciente sem nenhuma avaliação física, **When** a seção é renderizada, **Then** exibe um estado vazio informativo com botão primário para registrar a primeira avaliação.

---

### User Story 2 - Consultar e comparar o catálogo de dietas em tabela dedicada (Priority: P1)

Como nutricionista, quero visualizar todas as dietas e variações prescritas em uma tabela própria com colunas de Nome do Plano, Status (Vigente / Histórica), Calorias e Macronutrientes, com botão direto para ver o cardápio e botão para editar no construtor.

**Why this priority**: Centraliza a gestão de condutas nutricionais passadas e ativas, permitindo abrir o cardápio completo em 1 clique sem sair do perfil.

**Independent Test**: Ao clicar no botão "Ver Cardápio" de qualquer plano da tabela de dietas, o modal de leitura rápida abre instantaneamente exibindo as refeições, alimentos e substituições.

**Acceptance Scenarios**:
1. **Given** um paciente com dietas prescritas, **When** a seção "Histórico de Prescrições Dietéticas" é exibida, **Then** a tabela lista cada plano com seu nome, status de vigência, calorias e pílulas de proteínas, carboidratos e gorduras.
2. **Given** uma dieta na tabela, **When** o nutricionista clica em "Ver Cardápio", **Then** o modal read-only com as refeições completas é aberto imediatamente.
3. **Given** um plano alimentar na tabela, **When** o botão de edição é acionado, **Then** o nutricionista é direcionado diretamente para o Construtor de Dietas daquele plano.

---

### User Story 3 - Criar novos registros com atalhos rápidos contextuais nos cabeçalhos (Priority: P2)

Como nutricionista, quero ter botões de ação rápida nos cabeçalhos de cada tabela ("Nova Avaliação" na tabela de avaliações e "Nova Dieta" na tabela de dietas), para iniciar novos atendimentos sem precisar rolar a página ou procurar atalhos secundários.

**Why this priority**: Aumenta a velocidade do atendimento presencial no consultório.

**Acceptance Scenarios**:
1. **Given** o cabeçalho da tabela de avaliações físicas, **When** o nutricionista clica em "Nova Avaliação", **Then** navega diretamente para `/pacientes/[id]/avaliacao/nova`.
2. **Given** o cabeçalho da tabela de dietas, **When** o nutricionista clica em "Nova Dieta", **Then** navega diretamente para `/pacientes/[id]/dieta/nova`.

---

### Edge Cases

- Paciente sem dietas mas com avaliações: a tabela de avaliações renderiza normalmente e a de dietas exibe estado vazio acolhedor.
- Paciente com múltiplas dietas no mesmo dia (ex.: dia de treino e dia de descanso): cada dieta é uma linha independente e clara na tabela de dietas com a mesma data de prescrição.
- Avaliação física sem medição de dobras/perímetros: o botão "Ver Detalhes" fica desabilitado ou sinaliza que apenas dados básicos foram mensurados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST renderizar duas seções de tabelas empilhadas verticalmente no perfil do paciente: "Histórico de Avaliações Físicas" (superior) e "Histórico de Prescrições Dietéticas" (inferior).
- **FR-002**: Ambas as tabelas MUST ser construídas utilizando a mesma molécula canônica `DataTable` do Design System.
- **FR-003**: A Tabela de Avaliações Físicas MUST conter as colunas: `Data`, `Peso (kg)`, `% Gordura (BF)`, `Massa Magra (kg)`, `Cintura (cm)`, `Evolução / Status`, e `Ações & Detalhes`.
- **FR-004**: A Tabela de Avaliações Físicas MUST permitir expansão inline via chevron/botão de detalhes para exibir circunferências e perímetros complementares (tórax, abdômen, quadril, braços, coxas, panturrilhas) e notas de replicabilidade.
- **FR-005**: A Tabela de Prescrições Dietéticas MUST conter as colunas: `Data de Prescrição`, `Plano Alimentar`, `Status (Vigente / Histórica)`, `Calorias Totais (kcal)`, `Macronutrientes (P / C / G)`, e `Ações`.
- **FR-006**: A Tabela de Prescrições Dietéticas MUST disponibilizar em cada linha um botão de ação primária "Ver Cardápio" com ícone `Eye` que aciona o `ReadOnlyDietModal`.
- **FR-007**: Ambas as tabelas MUST disponibilizar botões de edição rápida direcionando para `/pacientes/[id]/avaliacao/[id]` e `/pacientes/[id]/dieta/[id]`.
- **FR-008**: Cada seção de tabela MUST possuir seu cabeçalho com ícone semântico, título, badge com contagem total de registros e botão de criação contextual ("Nova Avaliação" e "Nova Dieta").
- **FR-009**: Todos os elementos interativos MUST cumprir WCAG 2.2 AA (foco visível, `aria-expanded`, navegação por teclado).
- **FR-010**: A interface MUST utilizar exclusivamente tokens e tipografia canônica do Design System (`Surface`, `textStyle`, `Badge`, cores semânticas de macronutrientes).

### Success Criteria *(mandatory)*

- **SC-001**: O nutricionista consegue comparar a evolução de peso das últimas 3 consultas em menos de 2 segundos, com escaneamento vertical direto.
- **SC-002**: O cardápio completo de qualquer dieta histórica é aberto no modal em 1 clique (0ms de latência percebida).
- **SC-003**: Zero linhas com células artificiais ("sem medição" / "sem dieta") em ambas as tabelas.
- **SC-004**: 100% dos testes unitários e de acessibilidade passam com sucesso.
