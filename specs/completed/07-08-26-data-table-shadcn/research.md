# Research & Architectural Decisions: Shadcn DataTable

**Feature**: [spec.md](spec.md)  
**Date**: 2026-08-07

## 1. Auditoria dos consumidores

### Decision

O escopo de migração cobre três tabelas de dados consumidoras encontradas em `src/`:

1. `src/components/organisms/foods/FoodTableSection.tsx`
2. `src/components/organisms/PatientListTable.tsx`
3. `src/components/organisms/PatientConsultationHistoryTable.tsx`

`src/components/ui/table.tsx` é o primitivo Shadcn base e não é um consumidor a ser substituído. Os exemplos de catálogo visual são infraestrutura de documentação, não uma quarta tabela de domínio.

### Rationale

Uma busca de referências encontrou três superfícies de dados, uma dependência de `@tanstack/react-table` usada apenas pela tabela de alimentos e composição manual nos dois organismos de pacientes. A auditoria final deve repetir a busca para evitar que novos consumidores sejam omitidos.

## 2. Abstração compartilhada

### Decision

Criar `DataTable<TData>` em `src/components/molecules/DataTable.tsx`, usando somente `@/components/ui/table` para a estrutura semântica. A molécula será agnóstica ao domínio e exportará contratos genéricos para colunas, ordenação, paginação, estados e expansão.

### Rationale

O projeto exige que `src/components/ui` permaneça limpo, genérico e sem regras de negócio. Colocar a composição em `molecules` permite estender os primitivos sem alterar `Table`, ao mesmo tempo em que centraliza comportamento repetido para os três consumidores.

### Alternatives considered

- **`src/components/ui/data-table.tsx`**: rejeitada porque adicionaria uma composição comportamental à camada de primitivos e conflitaria com as regras de preservação do Shadcn.
- **Manter cada organismo com composição manual**: rejeitada porque não satisfaz a padronização solicitada e mantém divergências de estados e acessibilidade.
- **Adotar o exemplo oficial com `@tanstack/react-table`**: rejeitada porque o pedido original exige descartar bibliotecas externas de tabela.

## 3. Ordenação e paginação sem dependência externa

### Decision

O DataTable receberá colunas com um extrator de valor ordenável e estado controlado de ordenação. Paginação será client-side, com página de tamanho configurável; o consumidor de alimentos usará tamanho 15 para preservar o comportamento atual. Alterações de dados, filtros ou ordenação devem corrigir ou reiniciar a página quando ela deixar de existir.

### Rationale

Os volumes atuais são locais e pequenos o suficiente para processamento síncrono. A lógica é genérica, testável e não exige servidor, rede ou dependência adicional.

## 4. Linhas complexas e expansão

### Decision

O DataTable oferecerá uma rota padrão baseada em colunas e uma rota de renderização de linha para organismos que precisam preservar células compostas ou uma sublinha expandida. A tabela continuará responsável por caption, cabeçalho, estados e estrutura; o organismo continuará responsável pelo conteúdo de domínio e callbacks.

### Rationale

`PatientListTableRow` e `ConsultationHistoryRow` já concentram regras de apresentação e interação específicas. Forçar essas regras em uma API genérica aumentaria acoplamento e risco de regressão. A extensão de linha mantém o contrato compartilhado sem transformar a molécula em componente de pacientes.

## 5. Catálogo e governança

### Decision

Como `DataTable` será uma API compartilhada e terá três consumidores, ele será registrado na categoria `data-display` como molécula, com perfil próprio e consumidores explícitos. `ui-table` permanece inalterado. O registry, o perfil e o código serão atualizados no mesmo change set.

### Rationale

O Design System exige identidade, camada, estados, acessibilidade, consumidores e critérios de aceitação para componentes compartilhados. A categoria `data-display` já é estável e cobre tabelas; nenhuma categoria nova é necessária.

## 6. Estratégia de validação

### Decision

Adicionar testes de contrato para o DataTable, testes do fluxo de alimentos e manter/ajustar testes existentes de pacientes e histórico. A validação final combinará `npm run test`, `npm run type-check`, `npm run build`, `npm run lint`, auditoria de imports/dependências e verificadores do Design System.

### Rationale

O contrato genérico e os três consumidores possuem riscos diferentes: estados e paginação na molécula, ordenação e ações em alimentos, navegação por teclado em pacientes e expansão em histórico.
