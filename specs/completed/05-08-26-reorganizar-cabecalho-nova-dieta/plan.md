# Implementation Plan: Reorganização do cabeçalho da criação de dieta

**Branch**: `05-08-26-reorganizar-cabecalho-nova-dieta` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/05-08-26-reorganizar-cabecalho-nova-dieta/spec.md`

## Summary

Reorganizar o `DietBuilderTemplate` para seguir a hierarquia visual da tela de perfil do paciente: navegação e título no topo, uma única ação primária de salvamento, seletor de modo antes das metas, ações contextuais junto de macros/refeições e WhatsApp/PDF em um menu secundário. A implementação preservará as props e callbacks existentes, reduzirá a composição visual do `DietModeSwitcher` e reutilizará o `DropdownMenu` já presente no projeto.

## Technical Context

**Language/Version**: TypeScript 5.7.2, React 19, Next.js 15 App Router

**Primary Dependencies**: Tailwind CSS 3.4, Radix UI Dropdown Menu, Shadcn UI local, Lucide React, Vitest 4, Testing Library React

**Storage**: `localStorage` por meio dos stores existentes; nenhuma alteração de persistência

**Testing**: Vitest + Testing Library para composição, interação e acessibilidade estrutural; `npm run type-check` e validação visual manual no navegador

**Target Platform**: Web desktop a partir de 1024px; o design system exclui mobile, tablet e dark mode

**Project Type**: Aplicação web Next.js com arquitetura Atomic Design

**Performance Goals**: Nenhuma nova chamada de rede ou fonte de dados; preservar o feedback imediato das ações existentes e evitar deslocamento visual inesperado durante a revelação das opções de ciclo

**Constraints**: Usar tokens/text styles/recipes canônicos; manter a hierarquia `ui → atoms → molecules → organisms → templates → app`; não alterar `src/components/ui`; não criar variante mobile/tablet; não alterar cálculos, persistência ou callbacks de domínio

**Scale/Scope**: Uma rota de criação/edição de dieta, um template, uma molécula registrada com migração pendente, dois arquivos de teste novos e três estados visuais principais: simples, ciclo de carboidratos e refeições vazias

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Atomic Design Architecture**: PASS. A alteração fica no template e na composição do `DietModeSwitcher`; o primitivo `src/components/ui/dropdown-menu.tsx` será consumido sem receber lógica de domínio.
- **Canonical Design System**: PASS. A geometria seguirá a estrutura de `src/app/pacientes/[id]/page.tsx`, os tokens/text styles existentes e as categorias `structure` e `selection`; nenhum valor visual bruto será introduzido.
- **Desktop Scope and Accessibility**: PASS. A faixa de suporte continua em 1024px+, com ordem DOM igual à ordem visual, nomes acessíveis, foco visível e teclado para seleção e ações secundárias.
- **Test-First Quality and Isolation**: PASS. Testes de composição e interação serão criados antes das mudanças de comportamento visual; os testes usarão props e fixtures locais, sem persistência externa.
- **Spec-Driven Execution**: PASS. O plano e as tarefas serão mantidos no diretório SDD e a execução futura deverá ser encaminhada por `/speckit-implement`.

## Project Structure

### Documentation (this feature)

```text
specs/05-08-26-reorganizar-cabecalho-nova-dieta/
├── .sdd-context.json
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── diet-builder-header.md
├── checklists/
│   ├── requirements.md
│   └── ux.md
└── tasks.md                 # será criado pelo /speckit-tasks
```

### Source Code (repository root)

```text
src/components/templates/DietBuilderTemplate.tsx
src/components/molecules/DietModeSwitcher.tsx
src/components/ui/dropdown-menu.tsx       # somente composição existente; não modificar
src/app/pacientes/[id]/dieta/[dietaId]/page.tsx  # consumidor e callbacks preservados

tests/components/templates/diet-builder-template.test.tsx
tests/components/molecules/diet-mode-switcher.test.tsx
```

**Structure Decision**: Manter a responsabilidade de layout no template existente. Não criar um novo componente de produto para o cabeçalho porque a estrutura é exclusiva desta tela e pode ser expressa pela composição de `Link`, átomos de botão, `DropdownMenu`, `DietModeSwitcher`, `MacroTrackerHeader` e `MealCardContainer`. O `DropdownMenu` permanece um primitivo genérico intocado; sua composição de domínio vive no template.

## Phase 0: Research Decisions

As decisões de pesquisa estão registradas em [research.md](./research.md). Não há `NEEDS CLARIFICATION` pendente.

1. Reutilizar a top navigation da tela de paciente para retorno, overline e título.
2. Manter o contrato público de `DietBuilderTemplate` e `DietModeSwitcher`.
3. Usar o `DropdownMenu` local/Radix para WhatsApp e PDF, sem novo primitive.
4. Posicionar Nova Refeição junto de Refeições e Escalar junto da região de metas.
5. Preservar armazenamento, cálculos, modais e callbacks existentes.

## Phase 1: Design and Contracts

- [data-model.md](./data-model.md) descreve os dados já existentes que atravessam o template e a matriz de estados da composição, sem adicionar entidades persistentes.
- [contracts/diet-builder-header.md](./contracts/diet-builder-header.md) define a ordem DOM, a responsabilidade de cada região, a prioridade das ações e os nomes acessíveis esperados.
- [quickstart.md](./quickstart.md) define a validação manual e automatizada para os modos simples, ciclo de carboidratos, refeições vazias e ações secundárias.

## Implementation Boundaries

1. `DietBuilderTemplate.tsx` passa a ter quatro regiões na ordem do contrato: page header, diet mode, patient/macros e meals.
2. O page header usa o mesmo tratamento de retorno da tela de paciente e renderiza `Salvar Prescrição` como única ação primária.
3. WhatsApp/PDF são compostos em `DropdownMenu` com itens textuais e ícones; os callbacks recebidos continuam sendo chamados diretamente.
4. A seção de refeições ganha um heading e ação contextual; o estado vazio não terá uma segunda CTA concorrente.
5. `Escalar` sai do grupo de ações do topo e aparece alinhado à região de macros, sem alterar `onScaleDiet`.
6. `DietModeSwitcher.tsx` reduz a superfície e mantém os controles condicionais de ciclo, props, estados selecionados e callbacks.
7. Nenhum arquivo de `src/components/ui/` será alterado.

## Verification Strategy

- Testar primeiro a ordem de landmarks/headings e presença/ausência das ações por região.
- Testar callbacks e estados do menu secundário com Testing Library.
- Testar que o modo simples não mostra controles de ciclo e que o modo de ciclo mostra variações e tabs.
- Executar `npm run type-check`.
- Executar os testes direcionados e depois `npm test`.
- Executar `npm run verify:design-system-legacy` e `npm run audit:atomic-design` para detectar regressões de tokens/camadas.
- Fazer revisão visual nos estados simples, ciclo de carboidratos e vazio em 1024px, 1280px e 1440px usando [quickstart.md](./quickstart.md).

## Risks and Mitigations

- **Risco**: remover a CTA do estado vazio pode dificultar a primeira refeição. **Mitigação**: manter Nova Refeição no cabeçalho da seção e validar o estado vazio com teste de nome acessível e uma única ação principal.
- **Risco**: o menu secundário reduzir a descoberta de WhatsApp/PDF. **Mitigação**: usar trigger textual `Mais ações`, itens textuais e teste de teclado, evitando menu icon-only.
- **Risco**: a expansão do ciclo deslocar o conteúdo. **Mitigação**: validar o estado expandido e manter a região no mesmo fluxo, sem animação de layout arbitrária.
- **Risco**: a alteração de classes do `DietModeSwitcher` conflitar com o perfil registrado como organism migration-required. **Mitigação**: não alterar API, camada declarada ou registry; limitar a mudança à composição visual prevista pelo perfil atual.

## Constitution Check — Post-Design

- **Atomic Design Architecture**: PASS. Não há nova dependência ascendente, novo primitive ou lógica de domínio em `ui`.
- **Canonical Design System**: PASS. O contrato usa categorias e padrões existentes e exige verificação legada após a implementação.
- **Desktop Scope and Accessibility**: PASS. O contrato inclui teclado, foco, ordem DOM, nomes acessíveis e faixas desktop.
- **Test-First Quality and Isolation**: PASS. A estratégia de verificação inclui testes direcionados antes da suíte completa, sem mutação de dados externos.
- **Spec-Driven Execution**: PASS. A implementação futura continua bloqueada até as tarefas serem geradas e executadas por `/speckit-implement`.

## Complexity Tracking

Nenhuma violação constitucional ou nova camada de complexidade foi identificada.
