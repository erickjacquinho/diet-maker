# Quickstart: validação da etapa 3 de Dieta DB

Este guia é executado depois da implementação aprovada. Ele não contém código
de produção e não autoriza iniciar tarefas antes da validação humana do SDD.

## Prerequisites

- Etapas 1 e 2 concluídas na mesma base de trabalho, com os relatórios e
  limitações conhecidos.
- Node/package manager usados pelo repositório e dependências instaladas.
- Navegador desktop Chromium na versão registrada pela execução, viewport a
  partir de 1024 px e perfil/namespace de teste limpo.
- Fixtures sintéticas: duas Contas; paciente ativo e arquivado; dieta simples;
  ciclo com dias e opções; vigente + histórico; rascunho; arroz TACO tipo 1
  cozido; falhas injetáveis em commit e limpeza.
- Nenhum dado clínico real e nenhum serviço remoto autenticado.

## Setup and static gates

Na raiz do projeto:

```text
npm install
npm run type-check
npm run lint
npm run verify:links
npm run audit:atomic-design
npm run verify:table
```

Execute o verificador global do design system e separe achados preexistentes de
regressões introduzidas pela etapa:

```text
npm run verify:design-system
```

## Targeted automated validation

Os nomes abaixo são resultados esperados da decomposição em `tasks.md`:

```text
npm test -- tests/lib/diets
npm test -- tests/lib/nutrition
npm test -- tests/lib/nutrition/decimal-roundtrip.test.ts
npm test -- tests/infrastructure/diet-draft-store.integration.test.ts
npm test -- tests/infrastructure/diet-repository.integration.test.ts
npm test -- tests/infrastructure/diet-migration.integration.test.ts
npm test -- tests/architecture/diet-persistence-boundary.test.ts
npm test -- tests/hooks/useDietBuilderPage.test.ts
npm test -- tests/app/pacientes/diet-editor-persistence.test.tsx
npm test -- tests/app/pacientes/patient-profile-history.test.tsx
npm test -- tests/components/organisms/patient-diets-table.test.tsx
npm test -- tests/components/molecules/ImportPreviousDietModal.test.tsx
```

Depois dos direcionados:

```text
npm test
npm run build
```

Para os riscos reais de IndexedDB/PGlite/Web Locks, execute o runner de
navegador planejado:

```text
npm run test:browser -- --workers=1
```

## Browser journey

1. Abra `/pacientes/[id]/dieta/nova` para paciente ativo. Confirme modo simples,
   metas zeradas e zero linha histórica criada.
2. Crie uma refeição vazia e tente botão/Ctrl+S. O editor deve manter o draft e
   anunciar: adicionar ao menos uma refeição com um alimento.
3. Adicione arroz TACO tipo 1 cozido em 100 g. Confirme 128 kcal de referência,
   altere para 50 g (64 kcal) e volte a 100 g (128 kcal).
4. Altere a última quantidade e acione Salvar antes do debounce. Reabra a
   vigente e confirme o último valor visível, uma única vigente e nenhum draft
   confirmado no histórico.
5. Edite a vigente sem salvar, feche/reabra e confirme recuperação local. Em
   seguida, salve e confirme mesma identidade, versão incrementada e nenhuma
   nova linha histórica.
6. Crie outra dieta. A vigente anterior deve virar Histórico no mesmo commit.
   Abra-a por leitura e confirme ausência de editar/excluir, ausência de nova
   revisão e conteúdo congelado.
7. Em nova dieta, use Puxar apenas metas de uma variação ativa do ciclo. Depois
   use cópia completa e confirme substituição do rascunho, novos IDs e origem
   intacta.
8. Descarte um draft com autosave atrasado. O callback não pode recriá-lo.
9. Arquive paciente com draft. Mesmo se a limpeza local for forçada a falhar, o
   paciente permanece arquivado e o draft antigo não pode ser salvo. Restaure
   pelo contrato e confirme que ele não é reativado automaticamente.
10. Prepare os recursos, desligue a rede e repita edição, salvamento, histórico
    e reabertura. Abra uma segunda aba; ela deve falhar antes de abrir a base.

## Failure matrix

| Injection | Expected evidence |
| --- | --- |
| draft quota/open/serialization failure | no false autosave/success; in-memory edit remains visible |
| transaction failure after plan/variation/meal/item | rollback; prior ACTIVE and exact draft preserved |
| stale `baseDietVersion` | conflict; confirmed plan unchanged; copy/review offered |
| interruption after durable commit | stable-ID reconciliation; no automatic second insert |
| cleanup failure after commit | clinical success + cleanup pending; retry does not call commit |
| inconclusive reconciliation read | draft retained; neither success nor rollback claimed |
| cross-account/patient IDs | scoped not-found/error; zero data disclosure or mutation |
| historical route presented as edit | application/repository reject; no draft created |

## Data and migration evidence

Run migration validation from a populated stage-2 fixture:

- compare every account, objective and patient before/after upgrade;
- assert seven new diet relations and all constraints;
- prove the partial ACTIVE uniqueness and cross-account composite FKs;
- prove `DecimalString → numeric → DecimalString`, IndexedDB and deep-copy
  round trips without binary-float drift;
- inject a migration error and prove schema/journal/data rollback;
- reapply migrations and prove no duplicate journal entry;
- confirm no read/write of `nutridiet_diets_*`, embedded `dietHistory[]` or
  `nutridiet_cycle_configured` as source/transport.

## Accessibility and design-system evidence

- Tab through editor, copy modal, history actions and read-only overlay.
- Confirm visible focus, accessible names, modal focus containment/return,
  Escape behavior and no action hidden only by hover.
- Confirm `aria-busy` during autosave/commit, polite status for local progress,
  alert for blocking errors, and text labels beyond color.
- Confirm ACTIVE is labeled **Vigente**, SNAPSHOT **Histórico**, and recoverable
  draft **Em Criação** outside the table.
- Validate `ReadOnlyDietModal` at its target organism layer and DataTable
  composition against registry/category/profile contracts.

## Performance evidence

Warm the bundled TACO dataset once, execute representative queries after
initialization and record environment, fixture and elapsed time. The required
result is under 100 ms. This is an integration measurement, not certification
of multiple browsers or an artificial 100,000-item catalog.

## Acceptance report

Record:

- runtime, package, browser, PGlite, Drizzle and dataset versions;
- migration ID/schema version and fixture counts;
- command results and browser evidence mapped to FR/NFR/SC;
- observed TACO search time and re-open behavior;
- injected failure result for rollback, unknown commit and cleanup pending;
- architecture/legacy scan and design-system findings;
- remaining limits, without claiming stages 4–6 or production certification.

Failures in minimum validation, atomicity, active uniqueness, snapshot energy,
scope, stable-ID reconciliation, draft revision ordering, historical
read-only, offline prepared flow or second-tab exclusion block this delivery.
