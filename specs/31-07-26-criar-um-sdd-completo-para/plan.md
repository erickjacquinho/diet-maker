# Implementation Plan: Migração integral para o Design System canônico

**Branch**: `31-07-26-criar-um-sdd-completo-para` | **Date**: 2026-07-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/31-07-26-criar-um-sdd-completo-para/spec.md`

## Summary

Migrar todo o runtime executável do NutriDiet para o Design System canônico documentado em `design-system/`, sem alterar regras de negócio, contratos de dados ou comportamento funcional. A execução será bottom-up: primeiro contrato de tokens, tipografia e recipes; depois globals/Tailwind; em seguida primitives, atoms, molecules, organisms, templates e rotas; por fim remoção dos artefatos legados, auditoria negativa e homologação visual/acessível.

Cada fase possui um gate bloqueante. O gate combina auditoria de legado no escopo da fase, validação do catálogo/Atomic Design/Shadcn, type-check, lint, testes, links e, quando houver superfície renderizada, revisão visual, estados críticos e acessibilidade. Uma fase somente pode ser marcada concluída quando todos os checks passarem e o registro de migração tiver evidência rastreável.

## Technical Context

**Language/Version**: TypeScript 5.7.2, CSS, JavaScript ESM para scripts de auditoria

**Primary Dependencies**: Next.js 15.1.6, React 19, Tailwind CSS 3.4.17, class-variance-authority 0.7.1, clsx 2.1.1, tailwind-merge 3.0.1, Radix UI, Lucide React, Vitest 4.1.10, Testing Library, jsdom

**Storage**: Arquivos versionados no repositório; nenhum banco ou alteração de schema é necessária

**Testing**: Vitest/Testing Library para contratos e componentes, `tsc --noEmit`, ESLint, Next build, auditorias Node, verificação de links, revisão manual no navegador para visual/estados e axe/inspeção WCAG 2.2 AA

**Target Platform**: Aplicação web desktop, viewport mínimo de 1024px; sem mobile, tablet ou dark mode nesta entrega

**Project Type**: Aplicação web Next.js App Router com biblioteca de componentes atômicos local

**Performance Goals**: Auditorias determinísticas de baseline e legado concluídas em até 5 segundos no repositório atual; nenhuma regressão perceptível de navegação, interação ou build em relação ao baseline funcional

**Constraints**: `design-system/` é a única fonte visual normativa; `refs/` permanece histórico; o protótipo histórico foi removido; sem regra visual inventada localmente; sem mudanças de domínio; primitives em `src/components/ui` permanecem genéricos; nenhuma dependência de camada superior; cada fase bloqueia a seguinte quando encontrar legado ou falha de qualidade

**Scale/Scope**: 39 componentes atuais catalogados (14 ui, 6 atoms, 14 molecules, 3 organisms, 2 templates), 4 componentes propostos preservados como propostos, 10 rotas/telas incluindo `/design-system`, layouts, tokens globais, Tailwind, registry e scripts/testes de governança; arquivos auxiliares e reexports de `src/components/` ficam cobertos pela auditoria, mas não alteram a contagem do catálogo.

## Constitution Check

*GATE: aprovado antes da pesquisa e revalidado após o desenho dos contratos.*

| Princípio | Resultado | Evidência/gate |
|---|---|---|
| I. Atomic Design Architecture | PASS | Plano bottom-up, matriz de dependências e `audit:atomic-design` em todo gate de camada; nenhuma importação ascendente permitida. |
| II. Canonical Design System | PASS | Tokens, text styles, recipes e aliases saem somente de `design-system/`; auditoria LEG001–LEG010 bloqueia valores e aliases antigos. |
| III. Desktop Scope and Accessibility | PASS | Alvo explícito ≥1024px, sem dark mode; estados, teclado, foco, contraste e axe fazem parte dos gates de componentes e rotas. |
| IV. Test-First Quality and Isolation | PASS | Contratos e fixtures de falha são criados antes da implementação; validadores produzem findings nominais e os testes vivem em `tests/`. |
| V. Spec-Driven Execution | PASS | Tarefas referenciam FR/SC e devem ser executadas via `/speckit-implement`; registros distinguem legado, migrado, conforme e removido. |

## Project Structure

### Documentation (this feature)

```text
specs/31-07-26-criar-um-sdd-completo-para/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── token-runtime.contract.md
│   ├── legacy-audit.contract.md
│   ├── migration-gate.contract.md
│   └── route-acceptance.contract.md
├── checklists/
│   ├── requirements.md
│   └── migration-quality.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── design-system/page.tsx
│   ├── alimentos/page.tsx
│   ├── pacientes/page.tsx
│   ├── pacientes/[id]/page.tsx
│   ├── pacientes/[id]/consulta/[date]/page.tsx
│   ├── pacientes/[id]/dieta/[dietaId]/page.tsx
│   ├── presets/page.tsx
│   ├── receitas/page.tsx
│   └── refeicoes-prontas/page.tsx
├── design-system/
│   ├── tokens.css
│   ├── text-styles.ts
│   ├── recipes.ts
│   ├── types.ts
│   └── index.ts
└── components/
    ├── ui/                  # primitives Shadcn genéricos
    ├── atoms/
    ├── molecules/
    ├── organisms/
    ├── templates/

tailwind.config.js
components.json
design-system/components/registry.json
scripts/
├── capture-design-system-baseline.mjs
├── verify-design-system-legacy.mjs
└── verify-design-system-components.mjs
tests/
├── design-system/
├── components/
├── routes/
└── fixtures/
.artifacts/design-system/
```

**Structure Decision**: Manter a aplicação Next.js única e introduzir um módulo explícito `src/design-system/` como contrato de runtime. A hierarquia existente `ui → atoms → molecules → organisms → templates → app` permanece; a nova fundação é consumida por todas as camadas, mas não cria uma sexta camada visual nem permite atalhos entre camadas.

## Phase 0 — Research Summary

As decisões de pesquisa estão detalhadas em [research.md](./research.md):

1. CSS custom properties são o runtime visual; os nomes públicos TypeScript apontam para as mesmas variáveis, sem duplicar valores.
2. Recipes CVA são a única superfície para variantes, estados, densidade e perfis de componente.
3. A migração é bottom-up com gates bloqueantes e checkpoints reversíveis.
4. Um auditor independente (`scripts/verify-design-system-legacy.mjs`) procura padrões legados e precisa falhar em fixtures controladas.
5. A validação é em camadas: legado, catálogo, Atomic/Shadcn, tipos, lint, testes, links, visual e acessibilidade.
6. Referências históricas não são alteradas nem consumidas pelo runtime.
7. Cada checkpoint recebe commit local somente durante a execução de implementação, permitindo rollback seguro.

## Phase 1 — Design and Contracts

Os contratos abaixo são normativos para a implementação:

- [data-model.md](./data-model.md): baseline, tokens, text styles, recipes, registros de componentes/rotas, findings e checkpoints.
- [contracts/token-runtime.contract.md](./contracts/token-runtime.contract.md): exports públicos e rejeição de valores fora do contrato fechado.
- [contracts/legacy-audit.contract.md](./contracts/legacy-audit.contract.md): códigos LEG001–LEG010, formato JSON e códigos de saída.
- [contracts/migration-gate.contract.md](./contracts/migration-gate.contract.md): ordem e comportamento bloqueante de cada gate.
- [contracts/route-acceptance.contract.md](./contracts/route-acceptance.contract.md): estados críticos, acessibilidade, DOM sem legado e preservação funcional.
- [quickstart.md](./quickstart.md): comandos reproduzíveis, revisão manual e fixture negativa.

## Staged Implementation Plan

Todos os gates abaixo são cumulativos: o escopo da fase precisa estar limpo e os checks globais precisam continuar passando. Se qualquer comando falhar, a fase fica `blocked`, o registro não avança e a implementação corrige ou faz rollback antes de continuar.

### Stage 0 — Baseline e inventário executável

**Entrada**: estado atual do repositório, registry, rotas e padrões legados conhecidos.

**Implementação**:

- Criar `scripts/capture-design-system-baseline.mjs` para registrar arquivos, componentes, rotas, imports, classes, tokens e contagens iniciais.
- Criar fixtures negativas sob `tests/fixtures/design-system-legacy/` para cada família LEG001–LEG010.
- Persistir somente evidência derivada em `.artifacts/design-system/design-system-baseline.json` (artefato local ignorado ou explicitamente versionado conforme decisão do executor).
- Inicializar `MigrationBaseline` e uma matriz componente/rota sem marcar nenhum item como conforme.

**Gate obrigatório**: baseline determinístico em duas execuções idênticas; `npm run type-check`, `npm run lint`, `npm test`, `npm run verify:links` e `npm run audit:atomic-design` continuam passando; nenhuma alteração de runtime é aceita nesta fase.

### Stage 1 — Fundação canônica de runtime

**Entrada**: tokens, tipografia, geometria e regras de `design-system/`.

**Implementação**:

- Criar `src/design-system/types.ts`, `tokens.css`, `text-styles.ts`, `recipes.ts` e `index.ts`, conforme a estrutura-alvo de `design-system/13-implementation-and-compliance.md`.
- Implementar camadas `reference (primitive) → semantic/system → component`, macro colors semânticas e estilos de texto fechados.
- Expor receitas CVA para os componentes registrados; proibir `className` visual livre quando uma recipe existir.
- Adicionar testes de contrato em `tests/design-system/tokens.test.ts`, `text-styles.test.ts` e `recipes.test.ts`.

**Gate obrigatório**: testes de contrato rejeitam IDs, tokens e variantes inválidos; auditoria LEG001–LEG010 retorna zero fora das declarações primitivas explicitamente permitidas em `src/design-system/tokens.css`; type-check, lint e testes completos passam; nenhuma cor, fonte, peso, radius, sombra ou spacing arbitrário permanece fora da fundação autorizada.

### Stage 2 — Globals, Tailwind e aliases Shadcn

**Entrada**: fundação Stage 1 aprovada.

**Implementação**:

- Substituir regras legadas de `src/app/globals.css` pelos imports/aliases canônicos, removendo resets visuais proibidos, fonte antiga e dark mode ativo.
- Atualizar `tailwind.config.js` para referenciar tokens semânticos, escala de spacing, radius médio/pequeno, tipografia fechada e estados canônicos.
- Atualizar `components.json` e utilitários compartilhados sem colocar conhecimento de domínio em `src/components/ui`.
- Criar teste de configuração em `tests/design-system/configuration.test.ts`.

**Gate obrigatório**: auditoria limpa em `globals.css`, `tailwind.config.js` e `components.json`; configuração não exporta alias antigo, dark mode ou escala proibida; comandos globais e teste de configuração passam.

### Stage 3 — Primitives Shadcn e atoms

**Entrada**: Stage 2 aprovada.

**Implementação**:

- Migrar os 14 arquivos de `src/components/ui/` preservando APIs genéricas, sem imports de atoms ou domínio.
- Migrar os 6 arquivos de `src/components/atoms/` para usar `recipes`, `textStyles` e tokens canônicos.
- Exercitar Button, Input, Badge, Avatar, IconButton, ProgressBar e demais primitives nos estados aplicáveis.
- Atualizar testes sob `tests/components/ui/` e `tests/components/atoms/`.

**Gate obrigatório**: auditoria limpa no escopo ui/atoms; `audit:atomic-design` confirma apenas dependências permitidas; foco, teclado, disabled, loading, erro e read-only aplicáveis passam; visual review desktop e axe não encontram regressão; registry marca somente itens efetivamente conformes.

### Stage 4 — Molecules

**Entrada**: primitives e atoms conformes.

**Implementação**:

- Migrar os 14 componentes molecules catalogados em `src/components/molecules/` por categoria e perfil documental, incluindo seus arquivos auxiliares/reexports.
- Remover classes legadas, valores visuais locais e imports ascendentes.
- Atualizar testes de composição, estados vazios, erro, loading e read-only em `tests/components/molecules/`.

**Gate obrigatório**: auditoria limpa no escopo molecules e em suas dependências; matriz de estados passa; `audit:atomic-design`, type-check, lint, testes, links e revisão visual/acessível passam; nenhum `migration-required` é encerrado sem evidência.

### Stage 5 — Organisms e templates

**Entrada**: molecules conformes.

**Implementação**:

- Migrar os 3 organisms e 2 templates catalogados em `src/components/organisms/` e `src/components/templates/`, incluindo auxiliares/reexports cobertos pelo auditor.
- Validar shells, sidebar, navegação, overlays, modais nutricionais, tabelas e composição de macros sem alterar cálculo ou regra de negócio.
- Atualizar testes de integração em `tests/components/organisms/` e `tests/components/templates/`.

**Gate obrigatório**: zero findings no escopo e dependências; nenhuma camada superior importada; focus trap/dismissal/keyboard e contrastes passam; snapshots/visual review desktop e axe passam; registry sincronizado com `currentLayer`, `targetLayer` e `lifecycle`.

### Stage 6 — Layouts e todas as rotas

**Entrada**: árvore de componentes completa e fundação global aprovada.

**Implementação**:

- Migrar `src/app/layout.tsx`, os layouts aplicáveis e todas as páginas de `/`, `/alimentos`, `/pacientes`, `/pacientes/[id]`, `/pacientes/[id]/consulta/[date]`, `/pacientes/[id]/dieta/[dietaId]`, `/presets`, `/receitas` e `/refeicoes-prontas`.
- Substituir classes `warm-*`, text sizes arbitrários, radii/sombras/pesos legados, breakpoints e transitions fora do contrato.
- Preservar URL, busca, filtros, navegação, formulários, persistência e dados existentes.
- Criar registros `RouteAcceptanceRecord` e testes sob `tests/routes/`.

**Gate obrigatório**: auditoria retorna zero em cada rota e em todo `src/`; cada rota passa estados default, loading, vazio, erro e read-only aplicáveis, links, runtime sem erros, axe, keyboard/focus e visual review; nenhuma rota é marcada conforme sem registro completo.

### Stage 7 — Página de documentação viva do Design System

**Entrada**: todos os tokens e componentes migrados.

**Implementação**:

- Reescrever `src/app/design-system/page.tsx` para consumir exclusivamente exports canônicos.
- Exibir tokens, text styles, recipes, estados e categorias como documentação viva; distinguir `implemented`, `proposed`, `migration-required`, `deprecated` e `removed`.
- Adicionar teste de catálogo em `tests/routes/design-system-page.test.tsx`.

**Gate obrigatório**: a página não importa o arquivo legado `src/design-system/tokens.ts` nem classes antigas, não apresenta proposta como implementada, possui links internos válidos e passa revisão visual/acessível.

### Stage 8 — Remoção, auditoria negativa e prevenção de regressão

**Entrada**: todas as rotas e componentes conformes.

**Implementação**:

- Remover exports, aliases, helpers e arquivos de runtime legados que não tenham consumidores válidos.
- Implementar `scripts/verify-design-system-legacy.mjs` conforme o contrato LEG001–LEG010.
- Integrar `verify:design-system-legacy` e os gates no `package.json`/CI sem alterar o comportamento de scripts existentes.
- Fazer o auditor falhar com as fixtures controladas e passar após restaurá-las.
- Atualizar `design-system/components/registry.json` somente com evidência de etapa e manter propostas explicitamente propostas.

**Gate obrigatório**: auditoria global retorna zero; o teste negativo comprova que cada regra detecta sua fixture; não há imports ou arquivos executáveis antigos; type-check, lint, test, build, links, Atomic Design e catalog verification passam.

### Stage 9 — Homologação final e evidência

**Entrada**: auditoria global limpa e todos os registros em estado conforme.

**Implementação**:

- Executar o roteiro de `quickstart.md` em ambiente limpo.
- Completar revisão visual desktop, axe/keyboard/focus, estados críticos e smoke test de todas as rotas.
- Consolidar `ComponentMigrationRecord`, `RouteAcceptanceRecord`, findings zero e métricas de baseline em `.artifacts/design-system/`.
- Criar o checkpoint final e registrar que nenhum arquivo histórico foi alterado.

**Gate obrigatório**: SC-001–SC-012 comprovados; zero legado em código/config/DOM; 39 componentes e 10 rotas contabilizados; build de produção e todos os checks passam; qualquer desvio mantém a entrega bloqueada.

## Testing Strategy

| Camada | Ferramentas | Cobertura obrigatória | Momento |
|---|---|---|---|
| Contratos | Vitest | tokens, text styles, recipes, aliases, códigos LEG | Antes de cada implementação correspondente |
| Unitária/composição | Vitest + Testing Library | primitives, atoms, molecules, organisms, templates e estados | Ao fim de cada camada |
| Estrutural | `audit:atomic-design`, `verify:design-system`, auditor de legado | dependências, registry, zero padrões antigos | Em todo gate |
| Qualidade estática | TypeScript, ESLint | imports, tipos, regras de código | Em todo gate |
| Integração/rotas | Testing Library, `verify:links`, Next build | navegação, URLs, formulários, estados e runtime | Após rotas |
| Visual/acessibilidade | revisão browser, axe, teclado/foco | desktop ≥1024px, contraste, foco, overlays e estados críticos | Components, rotas e final |
| Regressão negativa | fixtures LEG001–LEG010 | auditor falha quando legado é reintroduzido | Stage 0, 8 e final |

## Rollback and Recovery

- Cada stage termina em checkpoint identificável; nenhum checkpoint é considerado concluído se o gate falhar.
- Em falha, preservar o relatório de findings, retornar ao último checkpoint verde e corrigir apenas o escopo bloqueado.
- Não usar rollback destrutivo de arquivos do usuário; a recuperação deve usar commits/checkpoints locais e patches reversíveis.
- Se uma API pública precisar mudar, registrar o motivo no `ComponentMigrationRecord`, atualizar testes e revalidar consumidores antes de avançar.
- Se o auditor encontrar falso positivo, não desabilitar a regra: ajustar o contrato/fixture de forma explícita e obter validação humana antes de continuar.

## Definition of Done

1. Todas as tarefas de `tasks.md` concluídas via `/speckit-implement` e todos os gates por stage verdes.
2. `design-system/` é a única fonte visual normativa; referências históricas continuam fora do runtime.
3. Tokens, text styles e recipes canônicos são os únicos exports usados pelo código.
4. Os 39 componentes atuais e as 10 rotas estão registrados como migrados/conformes, sem proposta mascarada como implementada.
5. Auditoria global LEG001–LEG010 retorna zero e falha deterministicamente em suas fixtures.
6. `npm run type-check`, `npm run lint`, `npm test`, `npm run build`, `npm run verify:links`, `npm run audit:atomic-design` e verificações de catálogo passam.
7. Revisão visual desktop, WCAG 2.2 AA, teclado, foco, overlays e estados críticos foram evidenciados.
8. Nenhuma regra de negócio, contrato de dados, URL ou artefato histórico foi alterado sem registro e aprovação.
9. Checkpoint final e artefatos de evidência são reproduzíveis em ambiente limpo.

## Complexity Tracking

Não há violações constitucionais a justificar. A criação de um auditor negativo e de registros de evidência é necessária para satisfazer os princípios IV e V e é menor que manter validações manuais não reproduzíveis.
