# Implementation Plan: Conta e pacientes

**Branch**: `30-08-26-dieta-db-segunda-etapa` | **Date**: 2026-08-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/30-08-26-dieta-db-segunda-etapa/spec.md`

## Summary

A persistência canônica da Conta local e dos pacientes substituirá o store
legado de `localStorage` por casos de uso e repositórios com escopo de Conta,
versionamento e arquivamento lógico. A etapa mantém a UI de pacientes nas
rotas existentes, preserva os contratos de relações clínicas futuras e não
implementa dietas, avaliações, acompanhamentos ou backup.

O trabalho depende da aprovação do adaptador local na etapa 1. O domínio não
conhecerá o motor; a UI consumirá apenas os casos de uso e projeções de leitura.
IDs, datas, normalização, transações e validação de escopo ficarão fora dos
componentes.

## Technical Context

**Language/Version**: TypeScript 5.7, React 19 e Next.js 15 App Router

**Primary Dependencies**: Adaptador local aprovado na etapa 1 (PGlite + Drizzle se o relatório da PoC aprovar essa opção), Radix/Shadcn existentes, `sonner` para feedback e `lucide-react` para iconografia existente

**Storage**: Banco relacional local canônico para Account/ObjectiveOption/Patient; `localStorage` legado não é lido nem escrito; drafts de dieta permanecem fora desta etapa

**Testing**: Vitest, Testing Library, fixtures determinísticas em `tests/`, type-check, lint, auditorias Atomic Design, links e design system

**Target Platform**: Web desktop de 1024px a 1920px+, no navegador e offline somente após recursos preparados

**Project Type**: Aplicação web desktop local-first com Next.js App Router

**Performance Goals**: Lista, perfil e filtragem devem fornecer feedback em até 1 segundo após a base estar pronta, usando fixture representativa de centenas de pacientes

**Constraints**: Uma aba ativa conforme etapa 1; escopo sempre validado por `accountId`; mutations atômicas e versionadas; arquivamento sem cascata; sem migração do legado; sem login/sincronização; componentes UI sem acesso direto à persistência

**Scale/Scope**: Uma Conta e um profissional na V1; centenas de pacientes; rotas `/pacientes` e `/pacientes/[id]`; objetivos reutilizáveis; relações clínicas futuras apenas como contratos/preservação

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Resultado | Evidência/decisão |
| --- | --- | --- |
| I. Atomic Design Architecture | PASS | Reutilizar `ui → atoms → molecules → organisms → app`; domínio fica em moléculas/organismos e rotas; nenhum componente `ui` recebe regra de paciente. |
| II. Canonical Design System | PASS | Reutilizar categorias e perfis existentes; atualizar o perfil do modal de exclusão para arquivamento se a implementação mudar sua semântica; validar com `npm run verify:design-system`. |
| III. Desktop Scope and Accessibility | PASS | Fluxos a partir de 1024px, teclado, foco, diálogos acessíveis e estados completos; mobile/tablet/dark mode fora. |
| IV. Test-First Quality and Isolation | PASS | Testes determinísticos em `tests/` precedem mudanças de implementação; fixture sintética e findings nominais. |
| V. Spec-Driven Execution | PASS | A execução posterior seguirá `/speckit-implement`; este plano não declara implementação concluída. |

Não há violação constitucional que exija justificativa adicional.

## Project Structure

### Documentation (this feature)

```text
specs/30-08-26-dieta-db-segunda-etapa/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── patient-application.md
├── checklists/
│   ├── requirements.md
│   └── patients-quality.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   └── pacientes/
│       ├── page.tsx
│       └── [id]/
│           ├── page.tsx
│           └── PatientProfileModals.tsx
├── components/
│   ├── molecules/
│   │   ├── CreatePatientModal.tsx
│   │   ├── EditPatientModal.tsx
│   │   ├── DeletePatientModal.tsx
│   │   └── AddObjectiveModal.tsx
│   └── organisms/
│       ├── PatientListTable.tsx
│       ├── PatientProfileHeader.tsx
│       └── patient/PatientListTableRow.tsx
├── hooks/
│   ├── usePatientProfilePage.ts
│   └── usePatientsPage.ts
└── lib/
    ├── domain/
    │   ├── account.ts
    │   ├── objective-option.ts
    │   └── patient.ts
    ├── application/
    │   ├── account/
    │   │   ├── account-context.ts
    │   │   └── get-active-account.ts
    │   └── patients/
    │   ├── patient-use-cases.ts
    │   └── patient-errors.ts
    ├── persistence/
    │   ├── account-context.ts
    │   ├── patient-repository.ts
    │   ├── objective-catalog-repository.ts
    │   ├── patient-profile-reader.ts
    │   └── transaction-runner.ts
    └── infrastructure/local-db/
        ├── schema.ts
        ├── patient-repository.ts
        ├── objective-catalog-repository.ts
        └── account-context.ts

tests/
├── fixtures/patients/
├── lib/patients/
├── app/pacientes/
├── architecture/patient-persistence-boundary.test.ts
└── design-system/patient-flow-contract.test.ts
```

**Structure Decision**: Integrar a implementação ao monólito Next.js existente,
separando domínio, aplicação, portas e adaptador dentro de `src/lib/`, e
preservar a hierarquia de componentes já catalogada. A rota `/pacientes` terá
um orquestrador de leitura/mutação; moléculas e organismos recebem dados e
callbacks tipados, nunca stores. O adaptador local da etapa 1 será a única
fonte canônica dos pacientes. O código legado de `patientsStore.ts` será
retirado ou reduzido a compatibilidade de tipos somente quando não houver mais
consumidores de persistência; nenhuma chave legada será mantida como fallback.

### Design and implementation boundaries

- `src/lib/domain/` contém invariantes puras e tipos de domínio, sem React ou
  provider.
- `src/lib/application/patients/` implementa os casos de uso, valida o
  `AccountContext`, chama `TransactionRunner` e traduz falhas em resultados
  tipados.
- `src/lib/persistence/` define portas estáveis; `src/lib/infrastructure/`
  conhece o adaptador local e o schema físico.
- `src/app/pacientes/` coordena loading, empty, error, retry, navegação e
  feedback; não acessa banco, IndexedDB ou `localStorage`.
- `src/components/ui/` não será alterado para receber domínio. Modais e tabelas
  existentes serão configurados/combinados conforme suas categorias; se a
  semântica de `DeletePatientModal` mudar, seu perfil documental será atualizado
  no mesmo change set.
- A leitura de dietas/avaliações/acompanhamentos permanece em portas próprias
  ou em estados vazios/fixtures conforme a etapa já existente; não haverá nova
  persistência desses módulos.
- Dados legados de teste são removidos antes do uso da nova fonte; não haverá
  migrador, dual-write ou fallback.

## Risks and mitigations

| Risk | Impact | Mitigation/validation |
| --- | --- | --- |
| O adaptador da etapa 1 não estiver aprovado ou divergir do contrato | Bloqueia a persistência clínica | Exigir o relatório do portão antes da implementação; manter portas independentes do motor e parar se o gate falhar. |
| O modelo novo continuar convivendo com `patientsStore`/`localStorage` | Duas fontes canônicas e dados inconsistentes | Teste arquitetural de imports/chaves, corte por módulo e ausência de fallback/dual-write. |
| Arquivamento remover filhos ou permitir nova mutação clínica | Perda de histórico ou estado inválido | Transação com versionamento, fixture com filhos e cenários de arquivamento/restauração. |
| Tipos novos quebrarem as projeções atuais de dieta/avaliação | Regressão em rotas já existentes | Contratos de leitura separados, fixtures de perfil preservadas e testes de rota existentes executados antes do gate final. |
| Modal de exclusão permanecer com copy/ARIA de apagamento | Decisão destrutiva incorreta e falha de acessibilidade | Atualizar callback, copy, label acessível e perfil documental; auditar categoria `overlays` e teste de foco. |
| Escala de centenas de pacientes degradar a triagem | Meta de uso não atendida | Fixture proporcional, medição de listagem/filtragem em até 1s e registro de limitação sem ampliar a certificação. |

## Implementation sequence

1. Confirmar o relatório aprovado da etapa 1, o contexto da Conta e o acesso ao
   adaptador; preparar a fixture limpa sem legado.
2. Escrever tipos de domínio, erros, validação, portas e modelo relacional
   mínimo de Account/ObjectiveOption/Patient, incluindo versionamento e
   restrições de escopo.
3. Implementar repositórios e casos de uso para listar/consultar/criar,
   editar, adicionar objetivo, arquivar e restaurar, sempre em transação.
4. Refatorar `/pacientes` e `/pacientes/[id]` para consumir os casos de uso,
   preservar projeções de leitura relacionadas e retirar acessos diretos ao
   `patientsStore`/`localStorage` do fluxo de pacientes.
5. Adequar formulários e modal destrutivo: normalização, estados loading/error,
   conflito, descarte seguro, copy de arquivamento e retorno de foco.
6. Atualizar o perfil documental do `DeletePatientModal` e qualquer contrato
   de organismo efetivamente alterado; executar as auditorias do design system.
7. Executar testes de domínio, integração de repositório, rotas, teclado,
   isolamento, legado e performance proporcional; registrar divergências para
   revisão humana.

## Phase 0 — Research outputs

- `research.md` resolve a dependência do adaptador da etapa 1, as fronteiras de
  domínio, o ciclo de vida, a estratégia de legado, a composição visual e a
  validação.
- Não restam dúvidas técnicas bloqueadoras; a versão exata do motor é herdada
  do relatório aprovado da etapa 1, não inventada neste SDD.

## Phase 1 — Design outputs

- `data-model.md` descreve entidades, campos, relações, invariantes,
  normalização, estados e limites com módulos futuros.
- `contracts/patient-application.md` descreve portas, casos de uso, erros e
  estados das rotas/formulários.
- `quickstart.md` descreve setup, cenários executáveis, evidências e
  interpretação de falhas.

**Gate result after design**: PASS. O design cobre todos os FR/NFR da
especificação, preserva a constituição e deixa a implementação condicionada à
aprovação da etapa 1 e à execução posterior por `/speckit-implement`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| Nenhuma violação | N/A | N/A |
