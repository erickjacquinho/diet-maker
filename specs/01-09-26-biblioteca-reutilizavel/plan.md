# Implementation Plan: Biblioteca reutilizável por Conta

**Branch**: `backend-refactor` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/01-09-26-biblioteca-reutilizavel/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Implementar a biblioteca local reutilizável da Conta para alimentos
customizados, receitas e refeições prontas, substituindo os stores legados sem
migração. O desenho mantém a TACO como dataset somente leitura, persiste os
agregados da biblioteca em tabelas relacionais escopadas por Conta e captura
snapshots no momento de cada uso. A seleção de uma receita ou refeição pronta
produz apenas uma cópia independente no `DietDraft`; a dieta confirmada
continua protegida contra alterações posteriores da biblioteca.

O plano aproveita o runtime PGlite + Drizzle e os contratos de draft/snapshot
entregues pelas etapas anteriores. A integração de interface adapta as telas
existentes a portas da aplicação, sem criar uma segunda fonte de dados ou um
redesign fora do contrato visual vigente.

## Technical Context

<!--
  The following technical context is specific to this project and this feature.
-->

**Language/Version**: TypeScript 5.7, Node 22.23.1

**Primary Dependencies**: Next.js 15, React 19, PGlite 0.5.8, Drizzle ORM 0.45.2, Decimal.js 10.6, Lucide, Radix UI e Tailwind CSS

**Storage**: Banco relacional local PGlite com schema/migrations Drizzle; TACO em dataset estático; drafts em IndexedDB

**Testing**: Vitest 4.1, Testing Library, fake-indexeddb e Playwright 1.62 com Chromium

**Target Platform**: Aplicação web desktop local-first a partir de 1024 px, com recursos preparados para uso offline

**Project Type**: Aplicação web desktop Next.js com banco local no navegador

**Performance Goals**: Busca TACO e biblioteca em menos de 100 ms depois da inicialização na fixture representativa; operações de persistência devem permanecer transacionais e não bloquear a edição do draft

**Constraints**: Sem migração de localStorage, sem dual-write, sem rede/login/sincronização/backup nesta etapa, sem composição recursiva e sem alteração de snapshots confirmados

**Scale/Scope**: Uma Conta local por base; centenas de pacientes e milhares de refeições acumuladas; biblioteca com alimentos, receitas e refeições prontas reutilizáveis entre pacientes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Atomic Design Architecture** — PASS. As superfícies existentes serão
  adaptadas respeitando `ui → atoms → molecules → organisms → templates → app`;
  portas, casos de uso e repositórios não serão colocados em componentes.
- **II. Canonical Design System** — PASS. Mudanças visuais consultarão
  categorias/perfis canônicos e não introduzirão tokens, cores ou contratos
  locais.
- **III. Desktop Scope and Accessibility** — PASS. O escopo permanece desktop
  ≥1024 px, com teclado, foco visível, semântica e WCAG 2.2 AA.
- **IV. Test-First Quality and Isolation** — PASS. Testes de domínio,
  integração, boundaries, acessibilidade e browser serão escritos antes dos
  pares de implementação e usarão fixtures locais determinísticas.
- **V. Spec-Driven Execution** — PASS. A implementação posterior dependerá da
  aprovação deste SDD e deverá ser executada por `/speckit-implement`.

## Project Structure

### Documentation (this feature)

```text
specs/01-09-26-biblioteca-reutilizavel/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  The following tree is the selected single-project layout for this feature.
-->

```text
src/
├── app/alimentos/                         # tela de alimentos customizados
├── app/receitas/                          # tela de receitas
├── app/refeicoes-prontas/                 # tela de refeições prontas
├── components/molecules/                  # modais existentes adaptados
├── components/organisms/                  # busca, tabelas e seletores
└── lib/
    ├── domain/library/                    # entidades e regras de biblioteca
    ├── application/library/               # casos de uso e composição
    ├── application/diets/                 # inserção da biblioteca no draft
    ├── infrastructure/local-db/library/   # repositórios PGlite/Drizzle
    ├── infrastructure/local-db/           # schema e migrations
    └── persistence/                       # portas independentes do provedor

tests/
├── lib/library/                           # regras e casos de uso
├── infrastructure/library-*.test.ts      # schema, transações e escopo
├── components/                            # contratos dos modais/tabelas
├── app/                                    # integração das superfícies
├── architecture/                          # fronteira sem storage legado
└── browser/                                # jornada Chromium da biblioteca

# The selected layout is a single Next.js project; backend, mobile and API
# alternatives are outside the feature scope.
```

**Structure Decision**: Manter a organização existente por camadas de domínio,
aplicação, persistência, infraestrutura e UI. A biblioteca recebe um módulo
de domínio/aplicação próprio; o banco local recebe adaptadores em
`infrastructure/local-db/library`; o editor de dieta apenas consome contratos
de inserção e continua persistindo drafts no `DietDraftStore`. As páginas
existentes serão mantidas como entry points e terão seus callbacks ligados à
aplicação canônica.

## Complexity Tracking

Nenhuma violação constitucional ou projeto adicional foi identificado. O uso
de repositórios, portas e snapshots é necessário para manter a fronteira da
Conta, testar falhas transacionais e impedir que a UI dependa do PGlite ou dos
stores legados.

## Implementation Phases

### Phase 0 — contratos, decisões e fixtures

- Fixar os tipos de alimento, origem, unidade, estado, versão, status,
  ingredientes, itens e snapshots.
- Criar fixtures com duas Contas, TACO, alimentos customizados, receitas,
  refeições prontas, dependências arquivadas e dietas já confirmadas.
- Definir os erros de validação, escopo, conflito, dependência e atomicidade.
- Registrar que nenhum dado de `localStorage` será lido, convertido ou escrito.

### Phase 1 — banco e domínio canônico

- Criar a próxima migration local para alimentos customizados, receitas,
  ingredientes, refeições prontas e itens.
- Expandir os tipos/schema de snapshot clínico para as novas origens sem
  reescrever migrations já aplicadas.
- Implementar validação decimal, normalização nutricional, versionamento,
  arquivamento e regras de dependência.
- Definir portas de repositório e a composição da aplicação da biblioteca.

### Phase 2 — US1: alimentos customizados

- Implementar repositório e casos de uso de criar, listar, consultar, editar,
  duplicar, arquivar e excluir quando não houver dependência.
- Adaptar `/alimentos` e `CustomFoodModal` para a aplicação canônica.
- Remover leitura/escrita das chaves `nutridiet_custom_foods` e preservar TACO
  apenas pelo adaptador estático.

### Phase 3 — US2: receitas

- Implementar receitas e ingredientes com snapshot da origem, cálculo decimal
  e rendimento validado.
- Adaptar `/receitas` e seus componentes para os casos de uso da biblioteca.
- Garantir que edição, arquivamento e duplicação não alterem versões já usadas.

### Phase 4 — US3: refeições prontas e dieta

- Implementar refeições prontas, itens FOOD/RECIPE e validação sem recursão.
- Adaptar `/refeicoes-prontas` e a busca/seleção de itens na montagem de dieta.
- Integrar inserção profunda em `DietDraft`, com novos IDs e origem/versionamento
  preservados; não confirmar dieta na seleção.
- Atualizar o repositório de dietas para gravar snapshots das novas origens.

### Phase 5 — cutover e aceitação

- Remover consumidores dos stores de biblioteca legados e seus testes de
  persistência local, preservando apenas helpers puros necessários.
- Executar auditoria de fronteiras, migrations, transações, escopo,
  acessibilidade, tabelas, busca e jornada Chromium.
- Registrar a validação e fechar o SDD somente com todos os critérios verdes.

## Risks and Mitigations

| Risco | Mitigação |
| --- | --- |
| Dados customizados vazarem entre Contas | IDs escopados, validação na aplicação, FKs compostas onde aplicável e testes cross-account |
| Alteração de catálogo mudar uma dieta existente | Snapshot no ingrediente/item, snapshot no draft e snapshot clínico na confirmação |
| Migração parcial deixar tabelas inconsistentes | Migration transacional, testes de falha em cada filho e journal idempotente |
| UI manter dual-write legado | Boundary scan nominal, remoção de imports e testes que proíbem as chaves antigas |
| Receita ou refeição pronta criar ciclo | Tipos de origem restritos e rejeição transacional de composição recursiva |
| Cálculo divergir da TACO | Decimal interno, energia de referência preservada, cálculo centralizado e regressão 128 kcal/100 g |

## Validation Strategy

- Testes de domínio para validação, energia, rendimento, normalização e cópia
  profunda.
- Integrações PGlite para migration, escopo, versionamento, dependências,
  rollback e arquivamento.
- Testes de aplicação para CRUD, conflito, duplicação e inserção no draft.
- Testes de componentes para estados loading/empty/error/success/conflict,
  teclado e foco.
- Testes de arquitetura para garantir zero acesso às chaves legadas.
- Jornada Chromium para criação, busca, inserção no draft, reload, offline
  preparado e preservação de snapshot.
- Gates: `npm test`, `npm run type-check`, `npm run lint`,
  `npm run verify:links`, `npm run audit:atomic-design`, `npm run verify:table`,
  `npm run verify:design-system`, `npm run build` e `npm run test:browser --
  --workers=1`.
