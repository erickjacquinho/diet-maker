# Implementation Plan: Header contextual para fluxos hierárquicos

**Branch**: `05-08-26-padronizar-header-contextual` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/05-08-26-padronizar-header-contextual/spec.md`

## Summary

Instalar o primitivo Shadcn `Breadcrumb`, criar a molécula de produto `PageContextHeader` e aplicá-la inicialmente às rotas sequenciais de perfil, dieta e consulta. A molécula compõe um link de retorno explícito, breadcrumb com nome dinâmico do paciente, título `h1` e uma região opcional de ações. O mapeamento e a regra de adoção futura serão documentados no design system e nos artefatos desta feature.

## Technical Context

**Language/Version**: TypeScript 5.7.2, React 19, Next.js 15 App Router

**Primary Dependencies**: Shadcn UI local sobre Radix, `lucide-react`, Tailwind CSS 3.4, Vitest 4, Testing Library React

**Storage**: N/A; o header recebe apenas dados de apresentação e não persiste estado

**Testing**: Vitest + Testing Library para composição, links, breadcrumbs, heading, ações opcionais e acessibilidade; `npm run type-check`; auditorias do design system e Atomic Design

**Target Platform**: Web desktop a partir de 1024px; mobile, tablet e dark mode permanecem fora do escopo

**Project Type**: Aplicação web Next.js com arquitetura Atomic Design

**Performance Goals**: Nenhuma chamada de rede ou cálculo adicional; a navegação contextual deve ser renderizada junto com a página sem loading próprio

**Constraints**: Preservar primitivos em `src/components/ui`; manter a hierarquia `ui → atoms → molecules → organisms → templates → app`; usar tokens e text styles canônicos; links de retorno devem ser determinísticos; não transformar o modal de alimento em rota nesta feature

**Scale/Scope**: Um primitivo UI instalado, uma molécula registrada, três consumidores iniciais, um mapa de rotas sequenciais, documentação de adoção futura e testes unitários/compositivos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Atomic Design Architecture**: PASS. `PageContextHeader` é uma molécula composta por primitivos UI e atoms; páginas continuam responsáveis por dados de rota e rótulos dinâmicos.
- **Canonical Design System**: PASS. Breadcrumb e header herdam a categoria `navigation`; a documentação adicionará um perfil, sem duplicar o contrato da categoria.
- **Desktop Scope and Accessibility**: PASS. A solução preserva a faixa desktop, link semântico, foco visível, nomes acessíveis, heading hierarchy e operação por teclado.
- **Test-First Quality and Isolation**: PASS. O plano prevê teste do contrato do componente e dos consumidores sem persistência ou dependências externas.
- **Spec-Driven Execution**: PASS. O plano foi executado por `/speckit-implement` dentro do ciclo `$sdd-implement`, com evidências registradas em `implementation-log.md`.

## Project Structure

### Documentation (this feature)

```text
specs/05-08-26-padronizar-header-contextual/
├── .sdd-context.json
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── page-context-header.md
├── checklists/
│   ├── requirements.md
│   └── navigation.md
└── tasks.md                 # será criado pelo speckit-tasks
```

### Source Code (repository root)

```text
src/components/ui/breadcrumb.tsx                    # primitivo Shadcn instalado; sem domínio
src/components/molecules/PageContextHeader.tsx       # composição reutilizável de produto
src/components/molecules/index.ts                    # export público da molécula
src/app/pacientes/[id]/page.tsx                      # consumidor: perfil
src/app/pacientes/[id]/dieta/[dietaId]/page.tsx      # consumidor: dieta e dados do header
src/components/templates/DietBuilderTemplate.tsx     # consumidor visual do header de dieta
src/app/pacientes/[id]/consulta/[date]/page.tsx      # consumidor: consulta
design-system/components/categories/navigation.md     # consumidor canônico adicional
design-system/components/profiles/molecules/page-context-header.md
design-system/components/registry.json
tests/components/molecules/page-context-header.test.tsx
tests/app/pacientes/page-context-navigation.test.tsx
```

**Structure Decision**: A molécula será a unidade reutilizável porque combina navegação contextual, título e um slot opcional em uma responsabilidade única. O primitivo `Breadcrumb` permanece em `src/components/ui` e não conhece pacientes, dietas ou rotas. As páginas fornecem os links e labels, enquanto o componente garante a anatomia visual e semântica.

## Phase 0: Research Decisions

As decisões estão registradas em [research.md](./research.md). Não há `NEEDS CLARIFICATION` pendente.

1. Usar o primitivo Shadcn `Breadcrumb` instalado pelo CLI; não criar uma trilha manual.
2. Nomear a molécula `PageContextHeader` e registrá-la na camada `molecule`, categoria `navigation`, trait `contextual` somente se o catálogo aceitar esse trait; caso o registro atual não aceite o trait, manter a categoria sem inventar trait e documentar a contextualidade no perfil.
3. Usar `backHref` explícito em vez de `history.back()`, porque cada fluxo tem um pai determinístico e testável.
4. Passar o nome do paciente como label dinâmico; o item atual não recebe link e identificadores técnicos não aparecem no breadcrumb.
5. Excluir modais e páginas globais da adoção automática; uma futura rota própria de cadastro de alimento deverá ser adicionada ao mapa quando existir.

## Phase 1: Design and Contracts

- [data-model.md](./data-model.md) descreve a estrutura de items, estados de dados e matriz das transições atuais, sem entidade persistente.
- [contracts/page-context-header.md](./contracts/page-context-header.md) define props, anatomia, ordem DOM, semântica, regras de breadcrumb e slot de ações.
- [quickstart.md](./quickstart.md) define os comandos e cenários de validação para o componente e os três consumidores.
- O perfil do design system seguirá a categoria `navigation` e documentará apenas particularidades da molécula; tokens, estados e acessibilidade herdados não serão duplicados.

## Implementation Boundaries

1. Instalar `breadcrumb` com o package runner do projeto e revisar o arquivo gerado para confirmar imports, exports e ausência de domínio.
2. Criar `PageContextHeader` com `title`, `backHref`, `backLabel`, `breadcrumbs` e `actions?: React.ReactNode`.
3. Renderizar o retorno como link semântico com nome acessível, breadcrumb com itens anteriores navegáveis e último item como página atual, seguido de um único `h1`.
4. Exportar a molécula por `src/components/molecules/index.ts` sem criar import ascendente.
5. Substituir o header local do perfil, dieta e consulta, preservando seus estados de erro, ações e callbacks de domínio.
6. No perfil, usar `Pacientes > <nome do paciente>` e retorno para `/pacientes`.
7. Na dieta, usar `Pacientes > <nome do paciente> > Dieta` e retorno para `/pacientes/<id>`; o identificador `nova` não será exibido.
8. Na consulta, usar `Pacientes > <nome do paciente> > Consulta` e retorno para `/pacientes/<id>`; ações de impressão e abertura da dieta permanecem no slot de actions.
9. Atualizar o mapa e o perfil do catálogo, incluindo source file, public exports, consumer list, primitive base e status documental coerentes.
10. Não alterar o arquivo do primitivo `Breadcrumb` para inserir regras de paciente, dieta ou consulta.

## Verification Strategy

- Criar primeiro testes para: título como `h1`, link de retorno com href/accessible name, breadcrumb com links anteriores e current page, labels dinâmicos e actions opcionais.
- Criar teste de integração de rotas/consumidores para os três fluxos e para a exclusão do modal de alimento do mapa de páginas.
- Executar `npm run type-check`.
- Executar os testes direcionados e depois `npm test`.
- Executar `npm run verify:design-system`, `npm run verify:design-system-legacy` e `npm run audit:atomic-design`.
- Fazer inspeção visual desktop em 1024px, 1280px e 1440px, verificando ordem DOM, foco, overflow de nome longo e ausência de espaços vazios quando `actions` não existe.

## Risks and Mitigations

- **Risco**: o header de consulta usa atualmente uma superfície/card própria. **Mitigação**: separar a anatomia contextual do wrapper de conteúdo e preservar as ações em slot, sem impor Card ao componente.
- **Risco**: o nome dinâmico do paciente produzir breadcrumb largo. **Mitigação**: aplicar as regras de overflow do design system e manter o nome completo acessível.
- **Risco**: o perfil não carregar o paciente. **Mitigação**: manter o estado de erro existente, com retorno para `/pacientes`, e só renderizar o header contextual quando o contexto estiver disponível.
- **Risco**: o catálogo não possuir trait `contextual` compatível. **Mitigação**: não inventar trait; registrar a molécula na categoria `navigation` e descrever o comportamento contextual no perfil.
- **Risco**: mudanças pré-existentes no worktree serem sobrescritas. **Mitigação**: limitar alterações aos arquivos listados nas tarefas e não executar reset, checkout ou limpeza destrutiva.

## Constitution Check — Post-Design

- **Atomic Design Architecture**: PASS. O primitivo UI permanece genérico; a molécula não importa templates/organisms; as rotas fornecem somente dados do contexto.
- **Canonical Design System**: PASS. A categoria `navigation` continua fonte do contrato, o perfil registra apenas particularidades e o registry será atualizado junto com a fonte.
- **Desktop Scope and Accessibility**: PASS. O contrato inclui link semântico, foco, teclado, heading único e tratamento de overflow desktop.
- **Test-First Quality and Isolation**: PASS. A verificação cobre o componente isolado e os consumidores sem dados externos.
- **Spec-Driven Execution**: PASS. As tarefas foram executadas por `/speckit-implement`; implementação e validações finais foram concluídas.

## Implementation Status

- **Status**: Implemented and validated.
- **Evidence**: `npm test` (69 arquivos, 259 testes), `npm run type-check`, `npm run lint`, `npm run build`, auditorias de design system/Atomic Design e Playwright em 1024px, 1280px e 1440px.
- **Determinism**: o script `npm test` usa o pool `threads` com oito workers para evitar a contenção do pool padrão observada no ambiente.

## Complexity Tracking

Nenhuma violação constitucional ou nova camada de complexidade foi identificada.
