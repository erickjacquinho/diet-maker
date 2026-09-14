# Implementation Plan: Persistência de avaliações e acompanhamento

**Branch**: `backend-refactor`  
**Date**: 2026-09-11  
**Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/11-09-26-persistencia-avaliacoes-acompanhamento/spec.md`

**Execution**: após validação humana, executar as tarefas com `/speckit-implement`.

## Summary

Adicionar duas tabelas ao banco local já existente, substituir o armazenamento
clínico legado e conectar as telas atuais à aplicação de pacientes canônica.
Avaliações serão registros independentes editáveis; o acompanhamento será um
único estado opcional versionado. Perfil, lista, atividade e consulta por data
serão derivados em leitura, sem tabelas de projeção.

## Technical context

- TypeScript 5.7, Node.js 22, Next.js 15 e React 19.
- PGlite + Drizzle e migrations incrementais já usados pelas Etapas 1–4.
- Uma Conta local e uma aba ativa; operação local após preparação dos recursos.
- `PatientApplication`, `PatientProfileReader`, `PatientRepository`,
  `TransactionRunner` e composição do navegador são reutilizados.
- `DietDraft` permanece somente no IndexedDB e não entra em atividade, histórico
  ou consulta.
- Nenhum export, restore, login, rede, sincronização, agenda ou outbox entra
  nesta etapa.

## Design mínimo

### Persistência

Adicionar `body_assessments` e `next_follow_ups` em uma migration. As FKs,
checks, índices, chave composta do acompanhamento e transações ficam no
adaptador PGlite. Não há migration de dados legados nem preparação do contrato
de exportação da Etapa 6.

### Domínio e aplicação

Criar um módulo puro para tipos, validação, normalização e invariantes clínicas,
reutilizando `bodyFat.ts`, `date-only.ts` e helpers puros existentes quando
forem compatíveis. Criar uma única porta `ClinicalRepository` para as duas
entidades e um único adaptador local.

Adicionar os comandos e queries clínicas ao `PatientApplication` existente. O
`PatientProfileReader` será estendido para compor o resumo clínico em lote e o
perfil, usando o leitor de dietas que já existe. Não criar `ClinicalApplication`,
`ClinicalProjectionReader`, store paralelo ou camada de mapeamento duplicada.

### Interface

Manter rotas, campos, cálculos e componentes. Os hooks atuais passam a chamar a
aplicação canônica; modais fecham apenas depois da confirmação, preservam o
formulário em erro/conflito e compartilham a mesma operação do botão e de Ctrl+S.
Os ajustes visuais ficam restritos aos estados de persistência previstos.

## Estrutura afetada

```text
src/lib/domain/clinical.ts                         # tipos e invariantes puras
src/lib/persistence/clinical-repository.ts         # uma porta clínica
src/lib/infrastructure/local-db/schema.ts          # duas tabelas novas
src/lib/infrastructure/local-db/migrations.ts      # migration incremental
src/lib/infrastructure/local-db/clinical-repository.ts
src/lib/application/composition-root.ts            # métodos clínicos na fachada existente
src/lib/application/patients/patient-profile-reader.ts
src/lib/application/browser-composition.ts
src/hooks/useAssessmentWorkspacePage.ts
src/hooks/usePatientProfilePage.ts
src/hooks/usePatientsPage.ts
src/app/pacientes/[id]/consulta/[date]/page.tsx
src/components/molecules/EditAssessmentModal.tsx
src/components/molecules/NextEventModal.tsx
tests/...                                           # estender testes existentes; novos só onde necessário
```

Os nomes finais podem seguir a convenção dos módulos vizinhos, mas não devem
introduzir uma segunda fachada ou uma segunda fonte de verdade.

## Design decisions

1. **Avaliação independente**: persistir input efetivo, resultados confirmados,
   método/versão do cálculo, preenchimento assistido, identidade, escopo,
   timestamps e `version`. A edição usa `expectedVersion` e não cria revisão.
2. **Acompanhamento único**: chave `(accountId, patientId)`; set/replace/clear
   são explícitos e versionados, sem histórico de agenda.
3. **Projeções somente leitura**: avaliação recente, anterior, deltas,
   atividade, contagens e consulta são calculadas das linhas confirmadas e das
   dietas existentes; nenhuma projeção é gravada.
4. **Composição existente**: o `PatientApplication` e o `PatientProfileReader`
   continuam sendo a fronteira usada pela UI.
5. **Cutover direto**: remover consumidores clínicos de `patientsStore`/
   `legacyClinicalStore` sem migrador, fallback ou dual-write.

## Phases

### Phase 1 — Fundação clínica

- Fixar tipos, códigos de erro, datas civis, validações e ordenação.
- Criar fixture/DB helper compartilhados reaproveitando os padrões de testes das
  Etapas 1–4.
- Testar e adicionar a migration v3→v4, tabelas, FKs, checks e índices.
- Definir e implementar `ClinicalRepository` e seu adaptador PGlite, incluindo
  escopo, atomicidade e versionamento.
- Estender `PatientApplication`, `PatientProfileReader` e a composição do
  navegador.

### Phase 2 — Avaliações

- Conectar criação, leitura, listagem e edição à porta clínica.
- Preservar cálculo US Navy, preenchimento assistido, normalização bilateral,
  comparação, `id`, `version`, dirty state, Ctrl+S e descarte.
- Adaptar workspace, modal de edição e perfil sem fechar antes do sucesso.

### Phase 3 — Acompanhamento e projeções

- Conectar get/set/replace/clear do acompanhamento e seus estados futuro, hoje,
  atrasado e vazio.
- Compor perfil, lista, atividade, histórico e consulta por data a partir das
  fontes confirmadas, com leitura batch para a lista.
- Manter consulta somente leitura, sem `ConsultationRecord`, observações ou
  suplementos persistidos.

### Phase 4 — Cutover e validação

- Remover acessos clínicos legados e estender o teste de fronteira existente.
- Verificar paciente arquivado, isolamento Conta + Paciente, conflitos,
  rollback, duplo envio, acessibilidade e estados recuperáveis.
- Medir o p95 local previsto e executar uma jornada Chromium serial com reload e
  rede desativada após preparação.
- Rodar os gates relevantes e registrar o resultado final no relatório de
  validação da feature.

## Risks and mitigations

| Risco | Mitigação |
| --- | --- |
| Referência fora da Conta ou paciente | FKs compostas, filtros obrigatórios e testes cross-scope. |
| Resultado histórico mudar por edição cadastral | Persistir resultado e snapshot de entrada/método no momento da confirmação. |
| Edição antiga sobrescrever correção | `expectedVersion` e update condicional. |
| Lista gerar N+1 | Resumo clínico em lote no `PatientProfileReader`. |
| Falha parcial | Transação do adaptador e projeções somente de leitura. |
| Modal comunicar sucesso prematuro | Fechar/navegar apenas após retorno confirmado. |
| Legado permanecer como segunda fonte | Teste de fronteira e remoção dos consumidores canônicos. |

## Validation strategy

- Testes puros para validação, cálculo, datas, normalização e invariantes.
- Integração PGlite para migration, persistência após reabertura, escopo,
  constraints, rollback e concorrência.
- Testes da aplicação/hooks/componentes para comandos, projeções, loading,
  empty, saving, validation, conflict, archived, retry, descarte e teclado.
- Teste de arquitetura para zero leitura/escrita/fallback das chaves legadas.
- Teste de desempenho com a fixture representativa e jornada Chromium serial.
- Gates: `npm test`, `npm run type-check`, `npm run lint`,
  `npm run verify:links`, `npm run audit:atomic-design`,
  `npm run verify:table`, `npm run verify:design-system`, `npm run build` e o
  teste browser da feature com `--workers=1`.

## Constitution check

- **Atomic Design**: UI apenas compõe hooks, moléculas e organismos existentes;
  domínio e persistência ficam fora dos componentes.
- **Design System**: nenhuma mudança visual além dos estados necessários; usar
  tokens e componentes já catalogados.
- **Desktop/acessibilidade**: manter desktop ≥1024 px, teclado, foco e WCAG 2.2 AA.
- **Test-first**: cada fluxo novo começa por seu teste observável.
- **Spec-driven**: a implementação só começa após aprovação e via
  `/speckit-implement`.

O plano não cria uma camada paralela, uma entidade derivada persistida ou uma
entrega antecipada da Etapa 6.
