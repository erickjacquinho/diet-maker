# Implementation Plan: Prova técnica e base local

**Branch**: `30-08-26-prova-tecnica-base-local` | **Date**: 2026-08-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from [spec.md](./spec.md)

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Construir uma PoC isolada para decidir se o adaptador relacional local recomendado atende à V1 local-first. A PoC usará uma fixture sintética para demonstrar persistência e reabertura, atomicidade, integridade de Conta/Paciente, migration versionada, separação entre drafts e dados confirmados, exclusividade de uma aba, portabilidade lógica em JSON e operação local após a preparação dos recursos. O adaptador permanecerá candidato até que o relatório final registre evidências, limitações e uma decisão explícita.

O código da PoC ficará em um workspace técnico isolado, sem integrar telas clínicas, sem substituir os stores legados e sem alterar o modelo canônico do produto antes da aprovação do portão técnico.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript, usando a configuração atual do projeto como referência; versão efetiva do runtime e das dependências será registrada no relatório da PoC.

**Primary Dependencies**: `@electric-sql/pglite`, `drizzle-orm` e `drizzle-kit` no workspace isolado da PoC; runner de navegador Chromium para os cenários que exigem IndexedDB, duas abas e rede desativada.

**Storage**: Banco relacional local persistente em IndexedDB por meio do filesystem do PGlite; armazenamento IndexedDB separado para `DietDraft`; nenhum uso do modo em memória para comprovar persistência.

**Testing**: Testes determinísticos de unidade/integração no workspace da PoC e cenários reais em navegador desktop para persistência, migration, aba única, portabilidade e offline. O relatório deve registrar o navegador utilizado e suas versões.

**Target Platform**: Navegador desktop utilizado pelo projeto, em origem local segura/compatível com Web Locks, com escopo mínimo de 1024px. Não haverá certificação de múltiplos navegadores nesta etapa.

**Project Type**: PoC de infraestrutura para aplicação web local-first, executada em workspace separado do aplicativo Next.js.

**Performance Goals**: Registrar tempos de inicialização, consulta e gravação e investigar travamentos que inviabilizem a amostra. Não criar nesta etapa uma meta fixa de latência, volume ou certificação de busca.

**Constraints**: Uma única aba ativa; falhar de forma explícita e sem fallback silencioso; migrations explícitas e versionadas; drafts fora do banco canônico; operação sem rede somente após recursos carregados; nenhuma migração de `localStorage`; nenhum serviço remoto, autenticação, sincronização ou backup completo.

**Scale/Scope**: Fixture sintética versionada com múltiplos escopos Conta/Paciente, registros compostos, receitas e itens nutricionais suficientes para exercitar relações, snapshots, unicidade e portabilidade. A PoC não é uma certificação de volume em centenas de pacientes ou 100 mil itens.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

* **I — Atomic Design Architecture**: PASS. A PoC não cria componentes de produto nem altera `src/components`; qualquer saída visual técnica ficará limitada ao harness isolado e não será incorporada à interface clínica.
* **II — Canonical Design System**: PASS. Não há mudança de UI do produto, tokens ou catálogo de componentes. O domínio não dependerá de regras visuais.
* **III — Desktop Scope and Accessibility**: PASS. A validação usa navegador desktop a partir de 1024px; o harness, se necessário, terá semântica mínima e saída acessível. Mobile e dark mode ficam fora do escopo.
* **IV — Test-First Quality and Isolation**: PASS. Os cenários de persistência, rollback, migration, draft, aba única, portabilidade e offline serão definidos antes de qualquer integração; a fixture é sintética e isolada.
* **V — Spec-Driven Execution**: PASS. Esta entrega produz apenas artefatos de especificação e planejamento. Qualquer implementação posterior deverá passar por `/speckit-implement`, e o relatório distinguirá candidato, aprovado, reprovado e limitação.

**Gate result before research**: PASS. Não há violação a justificar.

## Project Structure

### Documentation (this feature)

```text
specs/30-08-26-prova-tecnica-base-local/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Não criado: a PoC não expõe contrato externo
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
poc/
└── local-db-proof/
    ├── package.json
    ├── tsconfig.json
    ├── drizzle.config.ts
    ├── vite.config.ts
    ├── index.html
    ├── src/
    │   ├── db/
    │   │   ├── client.ts
    │   │   ├── schema.ts
    │   │   ├── migrations.ts
    │   │   └── repositories.ts
    │   ├── drafts/
    │   │   └── draft-store.ts
    │   ├── locking/
    │   │   └── single-tab-lock.ts
    │   ├── portability/
    │   │   └── sample-transfer.ts
    │   ├── fixture.ts
    │   ├── harness.ts
    │   └── report.ts
    ├── drizzle/
    │   ├── 0000_initial.sql
    │   └── meta/                  # snapshots gerados pelo Drizzle Kit
    └── tests/
        ├── db.integration.test.ts
        ├── drafts.integration.test.ts
        ├── migration.integration.test.ts
        └── browser/
            └── single-tab-offline.spec.ts

tests/
└── (sem novos testes de produto nesta etapa; a PoC permanece isolada)
```

**Structure Decision**: Selecionar um workspace descartável em `poc/local-db-proof/` para testar o adaptador sem alterar `src/`, sem importar o motor pelos componentes e sem criar uma segunda fonte canônica no aplicativo. O schema e as migrations ficam versionados dentro do workspace; o relatório e os artefatos de decisão ficam em `specs/30-08-26-prova-tecnica-base-local/`. Se o portão for aprovado, um SDD posterior definirá a adoção no aplicativo.

### Design and implementation boundaries

- O domínio da PoC conversa com uma porta de repositório pequena; somente o adaptador conhece PGlite/Drizzle.
- `DietDraftStore` usa um banco/object store IndexedDB distinto do namespace usado pelo banco relacional do PGlite.
- O lock de aba é adquirido antes da inicialização do banco. Se a exclusividade não puder ser obtida, a PoC não abre a base.
- Migrations são geradas e aplicadas explicitamente. `drizzle-kit push` não representa o caminho canônico da PoC.
- O harness não acessa `localStorage` como fallback e não tenta ler/converter stores legados.

### Implementation sequence

1. Criar o workspace isolado, fixar versões e preparar a fixture sintética.
2. Definir o schema relacional mínimo, gerar a migration inicial e abrir o banco persistente.
3. Implementar os cenários de gravação/rollback, escopo, relações e unicidade.
4. Implementar o store de drafts separado e validar que nenhuma mutação cruza a fronteira.
5. Implementar lock exclusivo de aba, amostra lógica JSON e cenário offline após preparação.
6. Executar a matriz de validação, registrar tempos/limitações e produzir a decisão do adaptador.

### Phase 0 — Research outputs

- `research.md` registra PGlite + IndexedDB FS, durabilidade, integração Drizzle, migrations explícitas, lock de aba e fronteiras de browser.
- Todas as decisões técnicas necessárias ao workspace estão resolvidas antes de Tasks; nenhuma decisão de produto é criada nesta etapa.

### Phase 1 — Design outputs

- `data-model.md` descreve a fixture mínima, entidades, relações, invariantes, estados e envelope lógico de portabilidade.
- `quickstart.md` descreve a execução reprodutível da PoC e os cenários de aceite.
- Não há contrato externo; as portas internas são detalhadas no plano e no modelo de dados.

**Gate result after design**: PASS, condicionado à execução dos cenários previstos e ao registro das evidências no relatório; o adaptador continua não aprovado até então.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Não aplicável: nenhum gate constitucional foi violado.
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
