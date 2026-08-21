# Research & Architectural Decisions: Padronização de Tabelas Shadcn Data Table

**Feature**: [spec.md](spec.md) | **Date**: 2026-08-07

## 1. Identificação de Tabelas no Codebase

Foram identificadas 3 tabelas ativas no projeto `diet-maker`:

1. **`FoodTableSection.tsx`** (`src/components/organisms/foods/FoodTableSection.tsx` & `useFoodTableColumns.tsx`):
   - **Estado Atual**: Utiliza `@tanstack/react-table` (com `flexRender`, `getCoreRowModel`, `ColumnDef`, `SortingState`) + primitivos `@/components/ui/table`.
   - **Ação**: Descartar a biblioteca `@tanstack/react-table` e refatorar para o novo componente genérico `DataTable`.

2. **`PatientListTable.tsx`** (`src/components/organisms/PatientListTable.tsx`):
   - **Estado Atual**: Renderiza manualmente tags `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableCell>` com manipulação manual de eventos de clique e badges.
   - **Ação**: Refatorar para utilizar o novo componente genérico `DataTable`.

3. **`PatientConsultationHistoryTable.tsx`** (`src/components/organisms/PatientConsultationHistoryTable.tsx` & `ConsultationHistoryRow.tsx`):
   - **Estado Atual**: Renderiza manualmente tags `<Table>`, `<TableHeader>`, `<TableBody>` e subcomponente `<ConsultationHistoryRow>` com suporte a expansão de histórico.
   - **Ação**: Refatorar a renderização usando o novo componente `DataTable`, integrando suporte a sublinhas / expansão limpa.

## 2. Remoção de Biblioteca Externa (`@tanstack/react-table`)

- **Decisão**: Remover a dependência `@tanstack/react-table` do `package.json` e purgar todas as referências nos arquivos `FoodTableSection.tsx`, `useFoodTableColumns.tsx` e `useFoodSearchPage.ts`.
- **Justificativa**: A instrução do usuário especifica descartar bibliotecas de tabela externas. As necessidades da aplicação (ordenação simples, busca, renderização de colunas) podem ser tratadas de forma limpa, com digitação forte em TypeScript e sem overhead de dependências de terceiros.

## 3. Arquitetura do Componente `DataTable` em `src/components/ui/data-table.tsx`

- **Decisão**: Criar o componente genérico reutilizável `DataTable<T>` em `src/components/ui/data-table.tsx` exportando:
  - `DataTableProps<T>`
  - `DataTableColumnDef<T>`
  - Componente `DataTable<T>`
- **Características**:
  - Aceita `data: T[]` e `columns: DataTableColumnDef<T>[]`.
  - Suporta estado vazio (`emptyMessage`).
  - Suporta callback de clique na linha (`onRowClick`).
  - Renderiza utilizando exclusivamente os componentes de `@/components/ui/table`.
