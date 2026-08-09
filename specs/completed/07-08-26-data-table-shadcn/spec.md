# Feature Specification: Padronização de Tabelas com Shadcn DataTable

**Feature Branch**: `specs/07-08-26-data-table-shadcn`

**Created**: 2026-08-07

**Status**: Draft

**Input**: User description: "quero trocar todas as tabelas por shadcn data table"

## Context and Scope

O aplicativo possui tabelas de dados em diferentes telas e com níveis diferentes de composição. A mudança deve estabelecer uma experiência tabular única para o produto, baseada nos primitivos Shadcn já existentes, sem introduzir uma biblioteca externa de tabelas. A auditoria inicial encontrou três consumidores de tabelas de dados: alimentos, lista de pacientes e histórico de consultas. A implementação deve confirmar essa contagem antes da migração e incluir qualquer consumidor adicional encontrado em `src/`.

O primitivo visual base de tabela permanece genérico e preservado. O novo `DataTable` será uma composição reutilizável, sem conhecimento de alimentos, pacientes, dietas ou outros conceitos de domínio.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tabelas padronizadas para manutenção do produto (Priority: P1)

Como mantenedor do NutriDiet, quero que todas as tabelas de dados consumidoras usem o mesmo DataTable Shadcn, para reduzir variações de comportamento, acessibilidade e apresentação entre as telas.

**Why this priority**: É a fundação comum da mudança e remove a dependência de uma biblioteca externa de tabelas.

**Independent Test**: Auditar os consumidores de tabelas em `src/`, confirmar que cada tabela de dados usa o DataTable comum e confirmar que nenhuma dependência ou importação da biblioteca externa permanece.

**Acceptance Scenarios**:

1. **Given** uma tela que apresenta uma tabela de dados, **When** a migração for concluída, **Then** a tabela deve ser composta pelo DataTable comum e continuar usando semântica HTML de tabela, caption, cabeçalhos, corpo, linhas e células.
2. **Given** o projeto antes da migração, **When** a auditoria de dependências e imports for executada, **Then** nenhuma biblioteca externa de gerenciamento de tabelas deve permanecer no manifesto, lockfile ou código-fonte.
3. **Given** uma tabela sem dados, carregando ou com erro, **When** o estado correspondente for apresentado, **Then** o usuário deve receber uma mensagem acessível e consistente sem uma tabela quebrada ou vazia sem explicação.

---

### User Story 2 - Consulta e manutenção da tabela de alimentos (Priority: P2)

Como nutricionista, quero pesquisar, ordenar, paginar, favoritar e editar alimentos na tabela de alimentos, para encontrar e manter itens sem perder o fluxo atual.

**Why this priority**: É o consumidor que atualmente depende do gerenciamento externo de tabela e concentra o maior risco funcional da migração.

**Independent Test**: Abrir `/alimentos`, aplicar busca e filtros, ordenar colunas suportadas, navegar entre páginas, favoritar um alimento e editar um alimento customizado.

**Acceptance Scenarios**:

1. **Given** a tela de alimentos com resultados, **When** o usuário aplicar busca, categoria, preparo ou preset de macronutrientes, **Then** somente os alimentos correspondentes devem permanecer na tabela.
2. **Given** resultados filtrados, **When** o usuário ordenar por uma coluna ordenável, **Then** as linhas devem seguir a direção escolhida e a indicação do estado de ordenação deve ser acessível.
3. **Given** mais resultados que o limite de uma página, **When** o usuário usar os controles de paginação, **Then** a tabela deve mudar de página, manter o filtro e desabilitar corretamente os controles sem página anterior ou seguinte.
4. **Given** uma linha de alimento, **When** o usuário favoritar ou editar uma ação disponível, **Then** a ação deve ocorrer sem disparar uma ação indevida em outra linha ou perder os filtros ativos.
5. **Given** nenhum alimento corresponde aos filtros, **When** a tabela for exibida, **Then** deve aparecer um estado vazio específico para a busca atual.

---

### User Story 3 - Triagem da lista de pacientes (Priority: P2)

Como nutricionista, quero consultar a lista de pacientes em uma tabela padronizada, para preservar a ordenação por prioridade, os indicadores de histórico e a abertura do perfil por mouse ou teclado.

**Why this priority**: A lista de pacientes é uma tabela operacional central e precisa manter navegação acessível durante a troca de composição.

**Independent Test**: Abrir `/pacientes`, conferir cabeçalho, indicadores e estado de prioridade, abrir um perfil por clique e repetir a abertura usando Enter ou Espaço com foco de teclado.

**Acceptance Scenarios**:

1. **Given** pacientes ordenados pela prioridade do próximo acompanhamento, **When** a lista for exibida, **Then** a ordem, os indicadores e as informações de cada linha devem permanecer iguais.
2. **Given** uma linha de paciente, **When** o usuário clicar na linha ou acioná-la por teclado, **Then** o perfil correspondente deve ser aberto sem duplicar a navegação do link interno.
3. **Given** uma lista sem pacientes ou sem resultados após a busca, **When** a tela for exibida, **Then** o estado vazio correspondente deve permanecer acessível e orientativo.

---

### User Story 4 - Histórico expansível de consultas (Priority: P2)

Como nutricionista, quero consultar o histórico de consultas em uma tabela padronizada com detalhes expansíveis, para comparar registros dietéticos e corporais e abrir as ações relacionadas.

**Why this priority**: O histórico combina linhas, sublinhas, ações e conteúdo nutricional; ele valida se o DataTable suporta composições mais ricas sem perder semântica.

**Independent Test**: Abrir `/pacientes/[id]`, expandir e recolher uma data, abrir a consulta, visualizar a dieta e editar a avaliação física quando disponíveis.

**Acceptance Scenarios**:

1. **Given** um histórico com registros, **When** a tabela for exibida, **Then** data, tipos de registro, dados dietéticos, valores corporais e ações devem manter a hierarquia e formatação atuais.
2. **Given** uma linha de consulta recolhida, **When** o usuário acionar a expansão, **Then** os detalhes da mesma data devem aparecer em uma sublinha associada e o controle deve anunciar o novo estado.
3. **Given** uma consulta expandida, **When** o usuário abrir a consulta, visualizar a dieta ou editar a avaliação, **Then** cada ação deve funcionar independentemente do controle de expansão.
4. **Given** um paciente sem histórico, **When** a tabela for substituída pelo estado vazio, **Then** a mensagem deve explicar que ainda não há histórico registrado.

### Edge Cases

- A auditoria deve tratar a tabela base Shadcn e exemplos do catálogo visual como infraestrutura, não como consumidores de domínio a serem duplicados.
- Uma lista com exatamente zero, uma ou o número máximo de linhas por página deve manter colunas, caption e estados consistentes.
- Alterar filtros ou ordenação deve manter o resultado coerente e impedir que a página atual aponte para uma página inexistente.
- Ações internas em células não podem disparar o clique ou a navegação da linha hospedeira.
- Datas de histórico devem identificar uma única linha expansível mesmo quando dieta e avaliação compartilham a mesma data.
- Conteúdo ausente em uma linha deve usar texto explícito ou estado vazio, nunca um valor numérico falso.
- Loading e erro devem ser anunciados para tecnologias assistivas quando o consumidor tiver esses estados disponíveis.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST identificar todos os consumidores de tabelas de dados em `src/` antes da migração e registrar o conjunto efetivamente migrado; a auditoria inicial considera `FoodTableSection`, `PatientListTable` e `PatientConsultationHistoryTable`.
- **FR-002**: O sistema MUST oferecer um DataTable genérico e reutilizável, sem tipos ou regras de domínio, que componha os primitivos de tabela Shadcn existentes.
- **FR-003**: O DataTable MUST suportar caption acessível, cabeçalhos com escopo, células tipadas, renderização customizada de conteúdo, chaves estáveis de linha e estados default, empty, loading, error e read-only.
- **FR-004**: O DataTable MUST suportar linhas interativas com estados hover, pressed e focus-visible, navegação por teclado e ações internas que não propaguem indevidamente para a linha.
- **FR-005**: O DataTable MUST permitir composição de conteúdo expandido associado a uma linha, preservando a semântica de tabela e o anúncio de expansão/recolhimento.
- **FR-006**: O projeto MUST remover a biblioteca externa de gerenciamento de tabelas e todas as importações, tipos, arquivos auxiliares e entradas de lockfile que existam somente para ela.
- **FR-007**: `FoodTableSection` MUST usar o DataTable e manter busca, filtros, ordenação por colunas suportadas, paginação, estado vazio, favoritos e edição de alimentos customizados.
- **FR-008**: `PatientListTable` MUST usar o DataTable e manter a ordenação de prioridade, indicadores de histórico, link do paciente, navegação por linha e operação por teclado.
- **FR-009**: `PatientConsultationHistoryTable` MUST usar o DataTable e manter as linhas expansíveis, ações de abertura de consulta, visualização de dieta e edição de avaliação.
- **FR-010**: Todas as tabelas migradas MUST usar os tokens, receitas, tipografia, geometria, cores semânticas, ícones e estados de acessibilidade do Design System canônico, sem Hex literal ou utilitário Tailwind arbitrário novo.
- **FR-011**: O DataTable e seus consumidores MUST manter semântica, foco visível, nomes acessíveis, escopos de cabeçalho, indicação de ordenação e contraste compatíveis com WCAG 2.2 AA no escopo desktop a partir de 1024px.
- **FR-012**: A mudança MUST incluir testes determinísticos sob `tests/` para o contrato compartilhado e para os fluxos de alimentos, pacientes e histórico, cobrindo cenários principais, vazios, teclado, ações e expansão aplicáveis.

### Non-Functional Requirements

- **NFR-001**: A tabela deve exibir a primeira resposta visual do conjunto já disponível sem introduzir chamadas de rede ou processamento assíncrono adicional.
- **NFR-002**: Ordenação, filtro, paginação e expansão devem responder de forma imediata para os volumes atuais do aplicativo, sem regressão perceptível no fluxo de trabalho.
- **NFR-003**: O componente compartilhado deve permanecer agnóstico ao domínio e não pode importar tipos de alimentos, pacientes, dietas ou avaliações.

### Key Entities

- **DataTable**: Composição visual e comportamental genérica para dados tabulares, incluindo colunas, linhas, estados, ações e expansão opcional.
- **Food row**: Registro de alimento com valores nutricionais, categoria, preparo, favorito e indicação de alimento customizado.
- **Patient list row**: Projeção de paciente com prioridade de acompanhamento, indicadores de histórico, objetivo, evolução corporal e destino de navegação.
- **Consultation update**: Agrupamento por data de dieta e/ou avaliação corporal, com estado de expansão e ações contextuais.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos consumidores de tabelas de dados identificados na auditoria inicial — e quaisquer consumidores adicionais encontrados antes da implementação — usam o DataTable comum.
- **SC-002**: A auditoria do manifesto, lockfile e código-fonte encontra zero dependências ou importações de bibliotecas externas de gerenciamento de tabelas.
- **SC-003**: Os fluxos de alimentos preservam busca, filtros, ordenação, paginação, favoritos e edição em 100% dos cenários de aceitação definidos.
- **SC-004**: Os fluxos de pacientes preservam navegação por mouse e teclado, indicadores, expansão e ações em 100% dos cenários de aceitação definidos.
- **SC-005**: Type-check, build, lint, testes determinísticos e verificadores de Design System concluem sem erro relacionado à migração.
- **SC-006**: Cada tabela migrada possui comportamento definido e verificável para dados presentes, vazio e, quando aplicável, loading e erro.

## Assumptions

- O primitivo `src/components/ui/table.tsx` é a base visual Shadcn canônica e permanecerá agnóstico.
- A biblioteca externa atualmente usada para a tabela de alimentos pode ser removida sem substituir seus dados por chamadas de rede ou persistência nova.
- O escopo de plataforma permanece desktop web a partir de 1024px; mobile, tablet e dark mode continuam fora do escopo.
- A ordenação e a paginação continuam client-side para os volumes atuais do aplicativo.
- A implementação usará os consumidores existentes como fonte de verdade para preservar textos, callbacks e regras de domínio.
- Alterações no catálogo de componentes só serão feitas se a nova composição compartilhada se tornar uma API pública do Design System; nesse caso, registry e perfil serão atualizados no mesmo change set.
