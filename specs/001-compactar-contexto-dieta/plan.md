# Implementation Plan: Compactação do quadro de contexto da dieta

**Branch**: `001-compactar-contexto-dieta` | **Date**: 2026-08-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-compactar-contexto-dieta/spec.md`

## Summary

Refinar somente o quadro interno de contexto da dieta para tornar explícita a divisão entre paciente à esquerda e modelo de dieta à direita. O plano preserva a `Surface` existente, reutiliza `PatientBadgeHeader` em modo compacto e `DietModeSwitcher` embutido, remove qualquer repetição de informação e mantém intactos o cabeçalho externo, as metas, as refeições, os callbacks e a persistência.

## Technical Context

**Language/Version**: TypeScript 5.7.2, React 19, Next.js 15 App Router

**Primary Dependencies**: Tailwind CSS 3.4, Shadcn/Radix UI local, Lucide React, Vitest 4, Testing Library React

**Storage**: N/A — nenhum dado novo ou alteração de persistência

**Testing**: Vitest + Testing Library para composição e interação; `npm run type-check`; `npm run lint`; validação visual desktop

**Target Platform**: Web desktop a partir de 1024px; mobile, tablet e dark mode fora do escopo

**Project Type**: Aplicação web Next.js com arquitetura Atomic Design

**Performance Goals**: Nenhuma chamada nova; preservar feedback imediato e evitar deslocamento ou sobreposição ao alternar o modo de dieta

**Constraints**: Alterar somente o contexto interno; usar tokens e text styles existentes; não alterar `src/components/ui`; preservar props, callbacks, cálculo, persistência e comportamento de seleção

**Scale/Scope**: Uma superfície, dois componentes de produto existentes, uma rota consumidora e testes direcionados; sem entidade persistente nova

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Atomic Design Architecture**: PASS. A responsabilidade permanece no template e nas moléculas já registradas; nenhum componente `ui` recebe domínio.
- **Canonical Design System**: PASS. A composição segue `structure`, `data-display` e `selection`, usando superfícies, espaçamentos, bordas, tipografia e estados existentes.
- **Desktop Scope and Accessibility**: PASS. O layout é desktop-first a partir de 1024px, mantém ordem DOM, labels textuais, radio semantics, foco visível e navegação por setas.
- **Test-First Quality and Isolation**: PASS. Os testes existentes de template e seletor serão ampliados antes das mudanças visuais e continuarão determinísticos.
- **Spec-Driven Execution**: PASS. A implementação futura deverá ser executada por `/speckit-implement` a partir de `tasks.md`.

## Project Structure

### Documentation (this feature)

```text
specs/001-compactar-contexto-dieta/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── diet-context-card.md
├── checklists/
│   └── requirements.md
└── tasks.md                 # criado por /speckit-tasks
```

### Source Code (repository root)

```text
src/components/templates/DietBuilderTemplate.tsx
src/components/molecules/PatientBadgeHeader.tsx
src/components/molecules/DietModeSwitcher.tsx
src/app/pacientes/[id]/dieta/[dietaId]/page.tsx  # consumidor; somente se necessário para o contrato de conteúdo

tests/components/templates/diet-builder-template.test.tsx
tests/components/templates/diet-builder-template.surface.test.tsx
tests/components/molecules/diet-mode-switcher.test.tsx
```

**Structure Decision**: Manter a responsabilidade de layout no `DietBuilderTemplate` e expressar o conteúdo interno pela composição existente. `PatientBadgeHeader` continua responsável pela identidade e `DietModeSwitcher` pela escolha de modo. Não criar um novo componente nem alterar os primitivos em `src/components/ui`.

## Phase 0: Research Decisions

As decisões estão registradas em [research.md](./research.md). Não há `NEEDS CLARIFICATION` pendente.

1. Usar uma única `Surface` com duas regiões alinhadas e uma divisão vertical funcional.
2. Manter os contratos públicos de `DietBuilderTemplate`, `PatientBadgeHeader` e `DietModeSwitcher`.
3. Usar a variante compacta do contexto do paciente e a variante embutida do seletor, sem superfície aninhada.
4. Manter o texto do objetivo separado do peso, garantindo que a unidade apareça apenas no badge do paciente.
5. Preservar os estados condicionais e a navegação por teclado do modo de dieta.

## Phase 1: Design and Contracts

- [data-model.md](./data-model.md) descreve os dados já existentes e a matriz de estados do quadro, sem nova entidade ou persistência.
- [contracts/diet-context-card.md](./contracts/diet-context-card.md) define ordem DOM, responsabilidades visuais, conteúdo mínimo e invariantes fora do escopo.
- [quickstart.md](./quickstart.md) define validação automatizada, visual e de teclado nos modos simples e ciclo de carboidratos.

## Implementation Boundaries

1. `DietBuilderTemplate.tsx` mantém `data-testid="diet-context-card"`, `Surface` e o cabeçalho externo intactos; ajusta apenas espaçamento, alinhamento e divisão das duas colunas internas.
2. A coluna do paciente usa `PatientBadgeHeader` compacto, com avatar, nome, peso e objetivo sem repetir o peso no objetivo.
3. A coluna do modo usa `DietModeSwitcher` embutido, com título direto, opções segmentadas e controles condicionais do ciclo no mesmo contexto.
4. `PatientBadgeHeader.tsx` e `DietModeSwitcher.tsx` só recebem ajustes de apresentação da variante consumida pelo quadro; suas props, estados, callbacks e semântica permanecem estáveis.
5. `src/app/pacientes/[id]/dieta/[dietaId]/page.tsx` não deve mudar, salvo se a validação identificar conteúdo duplicado no payload apresentado ao quadro.
6. Nenhum arquivo de `src/components/ui/` será alterado.

## Verification Strategy

- Testar que o quadro contém exatamente uma identificação de paciente e um grupo `Modelo de dieta`.
- Testar que o peso aparece uma vez dentro do quadro e que o texto de objetivo não o repete.
- Testar que o modo simples oculta controles de ciclo e que o ciclo revela variações e ações existentes.
- Testar a navegação por setas entre as opções de modo e a indicação de seleção.
- Executar `npm run type-check` e `npm run lint`.
- Executar os testes direcionados e, se necessário, a suíte completa.
- Executar `npm run verify:design-system-legacy` e `npm run audit:atomic-design` para detectar regressões de tokens ou camadas.
- Fazer inspeção visual em 1024px, 1280px e 1440px nos estados simples, ciclo de carboidratos e nome longo.

## Risks and Mitigations

- **Risco**: o seletor crescer verticalmente no modo de ciclo e desalinhá-lo com a identidade. **Mitigação**: usar alinhamento de coluna esticado e validar os estados com duas e três variações.
- **Risco**: remover texto de apoio reduzir a compreensão do seletor. **Mitigação**: manter título do grupo, labels completos, ícones funcionais e estados selecionados anunciados.
- **Risco**: o peso voltar a ser duplicado por um consumidor futuro. **Mitigação**: registrar no contrato que o peso é responsabilidade do badge e o objetivo não inclui a unidade.
- **Risco**: uma alteração de molécula afetar outros consumidores. **Mitigação**: limitar mudanças à variante embutida/compacta e validar os testes existentes das moléculas.

## Constitution Check — Post-Design

- **Atomic Design Architecture**: PASS. Nenhuma dependência ascendente, novo primitive ou domínio em `ui` foi introduzido.
- **Canonical Design System**: PASS. O contrato deriva das categorias canônicas e não inventa tokens, cores ou raios.
- **Desktop Scope and Accessibility**: PASS. O contrato inclui 1024px+, ordem de leitura, foco, radio semantics e nomes acessíveis.
- **Test-First Quality and Isolation**: PASS. Os critérios são verificáveis pelos testes existentes e por inspeção visual determinística.
- **Spec-Driven Execution**: PASS. A implementação está bloqueada até a execução futura das tarefas via `/speckit-implement`.

## Complexity Tracking

Nenhuma violação constitucional ou nova camada de complexidade foi identificada.
