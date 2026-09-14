# Implementation Plan: Dietas — rascunho, salvamento e histórico

**Branch**: `backend-refactor` | **Date**: 2026-08-30 | **Spec**: [spec.md](./spec.md)

**Input**: terceira etapa da divisão em SDDs de `refs/dieta-db/`, com conteúdo
mínimo confirmado pelo usuário: ao menos uma refeição com um alimento válido.

## Summary

Entregar o primeiro fluxo vertical persistente de dieta mantendo a interface
desktop atual: abrir ou retomar um rascunho em IndexedDB, editar com autosave,
copiar dados de uma prescrição confirmada, inserir alimentos TACO com snapshot,
confirmar explicitamente uma dieta em PGlite e consultar vigente/histórico pelo
perfil. O mínimo para confirmar é global ao modo prescrito: uma refeição com um
item principal válido na opção contabilizada. O commit relacional demove a
vigente anterior, grava sete relações e retorna somente após confirmação
durável; rollback, resultado incerto e falha de limpeza permanecem distintos.

A aplicação introduz `DietApplication` e portas puras entre UI e adaptadores,
integra o bloqueio de aba da PoC ao runtime principal, usa `DecimalString` com
`decimal.js` para cálculos e corta os stores legados de dieta sem migração ou
dual write. Implementação somente após validação humana e exclusivamente por
`/speckit-implement`.

## Technical Context

**Language/Version**: TypeScript `^5.7.2`, React `^19.0.0`, Next.js App Router
`^15.1.6`, Node compatível com `@types/node ^22.13.1`.

**Primary Dependencies**: PGlite `0.5.8`, Drizzle ORM `0.45.2`, Nano ID
`^6.0.1`, Radix/Shadcn existentes, `decimal.js 10.6.0` como nova dependência
direta, além de `@playwright/test 1.62.1` e `fake-indexeddb 6.2.5` como
dependências de desenvolvimento para o runner real promovido da PoC.

**Storage**: PGlite persistente em `idb://nutridiet-local-db-v1` para dados
confirmados; Drizzle e migrations SQL imutáveis; IndexedDB nativo, versionado e
separado para `DietDraft`; sem `localStorage` ou `sessionStorage` como fonte.

**Testing**: Vitest `^4.1.10`, jsdom `^30.0.1`, Testing Library, PGlite real em
integração, fake IndexedDB para testes determinísticos e Playwright/Chromium
para reabertura, Web Locks e offline quando o risco não for reproduzível no
jsdom.

**Target Platform**: aplicação web desktop Chromium, largura mínima 1024 px,
uma aba ativa, operação local após preparação dos recursos.

**Project Type**: aplicação web desktop monolítica Next.js com domínio,
aplicação e adaptadores locais no mesmo repositório.

**Performance Goals**: busca representativa no dataset TACO empacotado abaixo
de 100 ms após inicialização; autosave não bloqueia a edição; confirmação é
única e aguarda durabilidade, sem meta artificial para o tempo de commit.

**Constraints**: uma Conta/profissional por base; paciente ativo e no mesmo
escopo; no máximo uma dieta `ACTIVE`; `SNAPSHOT` somente leitura; último input
é drenado antes de salvar/navegar; sem rede, sincronização, outbox, backup,
receitas, customizados ou refeições prontas nesta etapa; nenhuma importação dos
dados legados de teste.

**Scale/Scope**: centenas de pacientes, milhares de refeições/itens acumulados,
597 alimentos TACO empacotados, duas rotas de editor (simples/ciclo), perfil e
overlays de copiar/consultar/descartar.

## Constitution Check

### Gate antes da pesquisa

| Principle | Assessment | Evidence / decision |
| --- | --- | --- |
| I. Atomic Design | PASS | UI continua `ui → atoms → molecules → organisms → templates → app`; domínio e storage ficam fora de componentes. |
| II. Canonical Design System | PASS | Categorias `actions`, `feedback`, `loading`, `overlays`, `data-display`, `fields` e `selection` governam os estados; perfis/registry acompanham migrações. |
| III. Desktop and accessibility | PASS | Escopo ≥1024 px; botão async, live regions, alert persistente, foco, diálogo e teclado integram os critérios. |
| IV. Test-first quality | PASS | Contratos, fixtures e testes de falha antecedem adaptadores e cutover; testes novos ficam em `tests/`. |
| V. Spec-driven execution | PASS | Artefatos declaram estado proposto; execução permanece bloqueada até validação humana e usa `/speckit-implement`. |

Nenhuma violação constitucional foi aceita. A pesquisa técnica foi concluída
sem pendência ou marcador de esclarecimento.

## Project Structure

### Documentation for this feature

```text
specs/30-08-26-dietas-rascunho-salvamento-historico/
├── spec.md
├── clarification-audit.md
├── checklists/
│   ├── requirements.md
│   └── persistence-quality.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/
│   └── diet-application.md
├── quickstart.md
└── tasks.md
```

### Source code affected by the future implementation

```text
src/
├── app/pacientes/[id]/
│   ├── page.tsx
│   └── dieta/[dietaId]/
│       ├── page.tsx
│       └── ciclo/page.tsx
├── components/
│   ├── molecules/
│   │   ├── ImportPreviousDietModal.tsx       # migrates to organism
│   │   └── FoodSearchModal.tsx
│   ├── organisms/
│   │   ├── diets/                            # copy, autosave and read-only flows
│   │   └── patient/PatientDietsTable.tsx
│   └── templates/DietBuilderTemplate.tsx
├── hooks/
│   ├── useDietBuilderPage.ts
│   ├── useDietCalculations.ts
│   ├── useDietMealActions.ts
│   ├── useDietPresets.ts                     # removed/replaced
│   └── usePatientProfilePage.ts
├── lib/
│   ├── application/
│   │   ├── diets/
│   │   │   ├── diet-application.ts
│   │   │   ├── diet-commands.ts
│   │   │   ├── diet-queries.ts
│   │   │   └── diet-ports.ts
│   │   └── browser-composition.ts
│   ├── domain/diets/
│   │   ├── diet-model.ts
│   │   ├── diet-validation.ts
│   │   ├── diet-copy.ts
│   │   └── nutrition.ts
│   └── infrastructure/
│       ├── diet-drafts/indexed-db-diet-draft-store.ts
│       └── local-db/
│           ├── client.ts
│           ├── migrations.ts
│           ├── schema.ts
│           └── diet-repository.ts
├── data/
│   ├── taco_database.json
│   └── taco-dataset-manifest.ts
└── lib/dietStore.ts                         # legacy diet API removed

design-system/components/
├── registry.json
└── profiles/organisms/
    ├── import-previous-diet-modal.md
    └── read-only-diet-modal.md

tests/
├── architecture/diet-persistence-boundary.test.ts
├── app/pacientes/
├── components/organisms/
├── hooks/
├── infrastructure/
├── lib/diets/
└── lib/nutrition/
```

**Structure Decision**: manter o projeto único e as rotas atuais. O domínio não
importa React/Next/Drizzle; a aplicação expõe casos de uso nominais; PGlite e
IndexedDB implementam portas separadas; hooks adaptam somente estado e
navegação. Componentes preservados podem mudar de camada Atomic quando o
catálogo já exige composição de domínio, sem alterar `src/components/ui`.

## Architecture and data flow

```text
Route / component
       ↓
Flow hook
       ↓
DietApplication ───────────────┬───────────────────────────────┐
       │                       │                               │
       │ draft commands       │ confirmed command/query       │ catalog query
       ▼                       ▼                               ▼
DietDraftStore             DietRepository               TACO adapter
IndexedDB document         PGlite transaction           bundled dataset
       │                       │
       └──── revision flush ───┘
                  explicit Save only
```

`openEditor` decide pelo ID da rota: `nova` cria/retoma draft; `ACTIVE` cria ou
retoma draft de edição com versão base; `SNAPSHOT` rejeita edição. A camada de
aplicação cria IDs e datas ISO, captura snapshot TACO e calcula por
`DecimalString`. Cada alteração incrementa revisão e agenda `putIfNewer`; sair
ou salvar drena a fila. O ciclo usa o mesmo documento, sem transporte em
sessão.

`saveDietAsActive` congela a edição, faz flush, reserva um único `targetDietId`,
valida escopo, versão, snapshot e o mínimo, e então chama uma operação
transacional do repositório. O repositório grava plano, variações, dias,
refeições, opções, itens e snapshots 1:1. Para nova dieta, demove a `ACTIVE`
anterior no mesmo commit; para edição, mantém ID e incrementa versão. A limpeza
do draft acontece por revisão depois do commit e nunca transforma falha local
em rollback clínico.

## Implementation phases

### Phase 0 — Contracts, fixtures and failing tests

- Congelar `DecimalString`, entidades, portas, comandos/resultados e falhas.
- Criar fixtures TACO, simples, ciclo, alternativas/substitutos, vigente,
  histórico, draft e escopos inválidos.
- Escrever testes de domínio, precisão, arquitetura, migration e protocolo de
  confirmação antes dos adaptadores.
- Registrar o corte do legado e dependências diretas necessárias.

**Exit**: contratos compilam; testes descrevem mínimo, precisão, atomicidade,
revisão, cópia e fronteiras, falhando somente pela implementação ausente.

### Phase 1 — Runtime, schema and relational adapter

- Adquirir a Web Lock aprovada antes de abrir PGlite e fechar na ordem inversa.
- Acrescentar migration imutável com sete relações, FKs compostas, checks,
  unicidade de dia e índice parcial da `ACTIVE`.
- Implementar mapeamentos `DecimalString ↔ numeric` e transação completa de
  confirmação, conflito e reconciliação por ID estável.
- Estender o reader de perfil/histórico sem usar `dietHistory[]`.

**Exit**: upgrade preserva a etapa 2; rollback não deixa filhos; duas vigentes
ou referências cruzadas são impossíveis; reabertura lê snapshots idênticos.

### Phase 2 — Draft store and autosave coordinator

- Criar IndexedDB de drafts com versão de payload e índice de contexto.
- Implementar fila por draft, revisão monotônica, clone estruturado, reserva de
  ID, remoção condicional, descarte e invalidação por arquivamento.
- Integrar estado `pending/saving/persisted/error`, `flush`, `retry` e `discard`
  aos hooks; navegar somente depois do flush persistido.
- Remover o transporte `nutridiet_cycle_configured` e compartilhar o mesmo
  draft entre editor e ciclo.

**Exit**: callback antigo não recria draft salvo/descartado; falha local não
produz sucesso; autosave nunca chama o repositório confirmado.

### Phase 3 — Nutrition snapshot and editor commands

- Adicionar manifesto/versionamento TACO e adaptador somente para a fonte de
  sistema nesta etapa.
- Criar snapshot completo no caso de uso, com energia da fonte prioritária,
  preparo original/normalizado, fibra, base, conversões e versão de cálculo.
- Trocar cálculos por `decimal.js` sem arredondamento intermediário e preservar
  peso da prescrição.
- Validar globalmente o mínimo de um item `PRIMARY` válido em uma refeição da
  opção contabilizada no modo prescrito.

**Exit**: arroz cozido mantém 128→64→128 kcal em 100→50→100 g; alternativas e
substitutos não são somados; conteúdo inativo não atende ao mínimo.

### Phase 4 — Explicit save, copy and history UI

- Compor `DietApplication` no runtime e substituir writes/IDs/datas nos hooks.
- Fazer botão e Ctrl/Cmd+S chamarem a mesma operação, bloquearem repetição e
  tratarem resultados nominais sem sucesso antecipado.
- Consultar fontes confirmadas, copiar metas ou documento completo com IDs
  novos, preservando os pesos definidos pelo contrato.
- Alimentar perfil/histórico pelo reader canônico; exibir **Vigente** e
  **Histórico**, retirar exclusão confirmada e bloquear edição histórica.
- Migrar `ReadOnlyDietModal` e `ImportPreviousDietModal` para organisms,
  atualizar registry/perfis e preservar `DataTable`/overlays.

**Exit**: salvar cria/atualiza uma única vigente; histórico é congelado;
read-only não cria draft; feedback async, foco e teclado cumprem o catálogo.

### Phase 5 — Archive integration and legacy cutover

- Invalidar drafts após arquivamento confirmado, mantendo o paciente arquivado
  quando a limpeza local falhar.
- Remover consumidores e APIs de dieta em `dietStore`, `dietDuplication`,
  stores de paciente/consulta e fallbacks de rota.
- Proibir por teste importações de storage/IndexedDB/PGlite/Drizzle na UI e
  qualquer leitura/dual write de `nutridiet_diets_*`.

**Exit**: uma fonte canônica confirmada, uma fonte de draft e nenhuma ponte de
migração ou leitura concorrente.

### Phase 6 — Integrated validation

- Executar gates estáticos, testes direcionados, suíte completa e build.
- Validar fluxo real em Chromium: autosave/reabertura, salvar antes do debounce,
  offline preparado, resultado incerto, limpeza pendente e segunda aba.
- Registrar migration, versões, tempos TACO, achados de acessibilidade/design
  system e limites no relatório de aceitação.

**Exit**: todos os bloqueadores do [quickstart](./quickstart.md) passam, sem
declarar etapas 4–6 de Dieta DB implementadas.

## Migration and cutover strategy

1. Adicionar dependências diretas e testes de round-trip antes do schema.
2. Acrescentar migration posterior à última aplicada; não editar `0000` nem o
   journal histórico.
3. Criar constraints e índices na mesma migration transacional, avançando a
   versão de schema/export lógico sem implementar exportação.
4. Validar upgrade sobre fixture populada da etapa 2 e reexecução idempotente.
5. Fazer cutover vertical: leitores e writes de dieta mudam juntos para a nova
   aplicação; dados `localStorage` são descartados, não transformados.
6. Manter rollback por código/release antes do uso clínico; depois que houver
   dados confirmados no schema novo, não reativar o store legado como fallback.

## Test strategy

| Layer | Main evidence |
| --- | --- |
| Domain | mínimo global, item válido, energia de referência, DecimalString, peso, totais, cópia profunda |
| Draft adapter | contexto, revisão fora de ordem, flush, quota/abort, descarte, invalidação, clone e reabertura |
| Relational adapter | migration, FKs, única ACTIVE, edit/version, rollback em cada filho, round-trip numeric, snapshot independente |
| Application | abrir por estado, primeiro alimento só no draft, salvar antes do debounce, ID estável, conflito, unknown e cleanup pending |
| UI | botão/atalho equivalentes, modal aberto bloqueia atalho, estados/live regions, histórico sem excluir/editar snapshot |
| Architecture | UI sem storage/DB, domínio sem React/provider, stores legados sem consumidores |
| Browser | Web Lock antes do banco, persistência real, offline preparado, segunda aba e navegação após durabilidade |

Os testes novos ficam sob `tests/`, são determinísticos e usam somente dados
sintéticos. Os testes legados que afirmam comportamento em `localStorage` são
substituídos, não preservados como contrato.

## Requirement coverage

| Requirement group | Planned evidence |
| --- | --- |
| FR-001–FR-008, FR-038 | fases 2–4; contratos de editor/draft; testes de mínimo e autosave |
| FR-009–FR-010 | fase 4; cópia de metas/completa, variação ativa, peso e novos IDs |
| FR-011–FR-019 | fases 1 e 4; protocolo transacional, atalho, vigência e histórico |
| FR-020–FR-025 | fases 3–4; snapshot TACO, energia, peso, alternativas e read-only |
| FR-026–FR-033 | fases 1, 2 e 5; escopo, versão, lock, arquivo/restore future-proof e arquivo de paciente |
| FR-034–FR-037 | fases 1, 4 e 5; runtime integrado, reader de perfil, cutover e descarte sem delete clínico |
| NFR-001–NFR-007 | todas as fases; arquitetura, acessibilidade, precisão, desempenho, offline e observabilidade |
| SC-001–SC-011 | [quickstart](./quickstart.md), matriz de falhas e relatório da fase 6 |

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Autosave atrasado recria/apaga documento errado | revisão monotônica, fila/token por draft, flush e `removeIfRevision` testados |
| Resultado de commit desconhecido duplica dieta | `targetDietId` estável, versão base e reconciliação antes de novo envio |
| Float/rounding altera prescrição | `decimal.js` direto, `DecimalString`, `numeric` sem number e testes 100→50→100 |
| Duas vigentes ou filhos parciais | índice parcial, FKs/checks e uma transação no adaptador |
| Snapshot depende do catálogo | snapshot 1:1 autossuficiente, sem FK viva obrigatória e leitura histórica congelada |
| Migração visual quebra teclado/catálogo | preservar famílias, atualizar registry/perfis, testes Atomic/DS/a11y |
| Legado volta como fallback | cutover único e teste arquitetural por padrões/imports/chaves |
| Segunda aba abre PGlite cedo | adquirir Web Lock antes de `openLocalDatabase` e falhar fechada |

## Post-design Constitution Check

| Principle | Result after design |
| --- | --- |
| Atomic Design Architecture | PASS — movimentações para organism e dependências estão explícitas; nenhum primitivo recebe domínio. |
| Canonical Design System | PASS — categorias, profiles, registry e gates estão no plano. |
| Desktop Scope and Accessibility | PASS — fluxos async, foco, atalho, overlays e DataTable têm evidência planejada em ≥1024 px. |
| Test-First Quality and Isolation | PASS — fase 0 precede adaptadores; falhas e isolamento estão na matriz. |
| Spec-Driven Execution | PASS — estado permanece proposto e a execução exige validação + `/speckit-implement`. |

## Complexity Tracking

Nenhuma violação constitucional ou estrutura excepcional foi necessária. A
separação entre draft documental e agregado relacional já é um contrato de
produto aprovado, e ambos permanecem dentro do projeto único existente.
