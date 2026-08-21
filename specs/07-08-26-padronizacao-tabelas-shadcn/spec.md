# Feature Specification: Padronização de Tabelas com Shadcn Data Table

**Feature Branch**: `specs/07-08-26-padronizacao-tabelas-shadcn`

**Created**: 2026-08-07

**Status**: Draft

**Input**: User description: "identifique todas as tabelas do app. quero converter todas em shadcn componente data table. se tiver library de tabela também vamos descartar. crie um /sdd dessa correção"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Remoção de Bibliotecas Externas e Implementação do Componente Shadcn Data Table (Priority: P1)

Como desenvolvedor e mantenedor do sistema, quero um componente reutilizável `DataTable` derivado 100% dos componentes primitivos do Shadcn (`@/components/ui/table`), para remover a dependência `@tanstack/react-table` e garantir consistência visual e arquitetural em toda a aplicação.

**Why this priority**: Elimina dívida técnica, reduz o tamanho do bundle e remove dependências externas de gerenciamento de tabelas, garantindo alinhamento total ao Design System Shadcn do projeto.

**Independent Test**: Pode ser testado executando o comando `npm run build` e verificando que a biblioteca `@tanstack/react-table` não está no `package.json` nem importada em nenhum arquivo do projeto.

**Acceptance Scenarios**:

1. **Given** o projeto contendo a biblioteca `@tanstack/react-table`, **When** o refactoring for concluído, **Then** `@tanstack/react-table` DEVE ser desinstalada do `package.json` e 0% dos arquivos em `src/` devem importar essa biblioteca.
2. **Given** o diretório `@/components/ui/`, **When** o componente `DataTable` for criado em `src/components/ui/data-table.tsx`, **Then** ele DEVE utilizar exclusivamente os primitivos `@/components/ui/table` (`Table`, `TableHeader`, `TableHead`, `TableBody`, `TableRow`, `TableCell`).

---

### User Story 2 - Migração da Tabela de Alimentos (FoodTableSection) (Priority: P2)

Como nutricionista navegando na página de Alimentos (`/alimentos`), quero visualizar a listagem de alimentos filtrada e ordenada através do novo componente Shadcn `DataTable`, mantendo o comportamento de busca e paginação intacto.

**Why this priority**: A tela de Alimentos é a única tela que atualmente consome `@tanstack/react-table`, sendo o principal ponto de desacoplamento de biblioteca externa.

**Independent Test**: Navegar para `/alimentos`, buscar por um alimento e testar ordenação/interatividade, verificando que a tabela renderiza perfeitamente com a infraestrutura Shadcn.

**Acceptance Scenarios**:

1. **Given** a página `/alimentos`, **When** a tabela for renderizada por `FoodTableSection`, **Then** ela DEVE utilizar o novo componente `DataTable` base sem depender de `@tanstack/react-table`.
2. **Given** a busca ou filtro na página de Alimentos, **When** o usuário digitar no campo de busca, **Then** as linhas da tabela DEVEM filtrar corretamente mantendo os estilos do Design System.

---

### User Story 3 - Padronização das Tabelas de Pacientes e Histórico de Consultas (Priority: P3)

Como nutricionista visualizando a lista de pacientes (`/pacientes`) e o histórico de consultas do paciente (`/pacientes/[id]`), quero que ambas as tabelas sigam o mesmo componente padronizado Shadcn `DataTable`, garantindo a mesma acessibilidade, estados visuais e tipografia.

**Why this priority**: Padroniza 100% das tabelas da aplicação sob uma única abstração de componente de tabela do Shadcn UI.

**Independent Test**: Acessar `/pacientes` e `/pacientes/[id]`, confirmando a navegação e expansão de detalhes com renderização idêntica e sem regressões.

**Acceptance Scenarios**:

1. **Given** o componente `PatientListTable.tsx`, **When** renderizado em `/pacientes`, **Then** as colunas e linhas DEVEM ser compostas através do componente Shadcn `DataTable`.
2. **Given** o componente `PatientConsultationHistoryTable.tsx`, **When** renderizado em `/pacientes/[id]`, **Then** a renderização de linhas expansíveis e detalhes de consultas DEVE utilizar o padrão padronizado do Shadcn `DataTable`.

---

### Edge Cases

- O que acontece se a lista de dados da tabela estiver vazia? A tabela deve exibir um estado vazio acessível e padronizado (`TableCell colSpan` com mensagem centralizada e amigável).
- Como o sistema lida com dados em carregamento? A tabela deve suportar estado de skeleton/loading via Shadcn `DataTable`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST desinstalar e descartar qualquer biblioteca de tabela externa (especificamente `@tanstack/react-table`).
- **FR-002**: O sistema MUST criar o componente reutilizável `DataTable` sob `src/components/ui/data-table.tsx` construído unicamente com os primitivos de `@/components/ui/table`.
- **FR-003**: O componente `FoodTableSection.tsx` MUST ser migrado para o novo `DataTable`, removendo `useFoodTableColumns` baseado em `@tanstack/react-table` e `SortingState`.
- **FR-004**: O componente `PatientListTable.tsx` MUST ser refatorado para utilizar o novo componente `DataTable`.
- **FR-005**: O componente `PatientConsultationHistoryTable.tsx` MUST ser refatorado para utilizar o novo componente `DataTable`.
- **FR-006**: Todas as 3 tabelas da aplicação (`FoodTableSection`, `PatientListTable`, `PatientConsultationHistoryTable`) MUST manter 100% de funcionalidade original (ordenação, filtros, cliques em linhas, expansão de detalhes) sem regressão visual.

### Key Entities

- **DataTableProps**: Abstração genérica `<TData, TValue>` contendo colunas definidas, dados, mensagem de estado vazio e manipuladores de clique/evento.
- **TableColumnDef**: Definição flexível e tipada de coluna (header, accessorKey, cell renderer, alignment, width).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0% de uso da biblioteca `@tanstack/react-table` no código fonte do projeto (`src/` e `package.json`).
- **SC-002**: 100% das tabelas da aplicação (`FoodTableSection`, `PatientListTable`, `PatientConsultationHistoryTable`) refatoradas para o componente padronizado `DataTable`.
- **SC-003**: 0 erros de compilação ou checagem de tipos (`npm run type-check` e `npm run build` passam com 100% de sucesso).

## Assumptions

- Todos os dados exibidos nas 3 tabelas atuais podem ser formatados de maneira tipada através do componente `DataTable`.
- A remoção de `@tanstack/react-table` simplificará a manutenção da base de código mantendo a customização visual alinhada com as variáveis CSS do Shadcn.
