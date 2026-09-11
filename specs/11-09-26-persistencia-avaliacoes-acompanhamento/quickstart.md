# Quickstart de validação: Avaliações e acompanhamento

Executar a partir da raiz do repositório somente depois que as tarefas forem
implementadas por `/speckit-implement`.

## Pré-requisitos

- Etapas 1–4 presentes e validadas.
- Node.js 22, dependências instaladas e Chromium disponível.
- PGlite isolado por teste, dados sintéticos e relógio controlado.
- Viewport desktop a partir de 1024 px.
- Nenhuma chave clínica de `localStorage` usada como fixture ou fallback.

## Fixture mínima

Usar o fixture compartilhado de T001:

1. duas Contas isoladas;
2. pacientes ativos e um arquivado;
3. duas avaliações na mesma data e uma com medidas opcionais preenchidas;
4. dietas confirmadas em datas coincidentes e distintas;
5. acompanhamentos futuro, hoje e atrasado;
6. versões antigas para conflito de avaliação e acompanhamento.

## Validação automatizada

Executar os testes da feature e as regressões diretamente relacionadas:

```powershell
npm test -- tests/lib/clinical.test.ts tests/infrastructure/clinical-migration.integration.test.ts tests/infrastructure/clinical-repository.integration.test.ts tests/application/patients/clinical-application.test.ts
npm test -- tests/hooks/useAssessmentWorkspacePage.test.ts tests/app/pacientes/assessment-persistence.test.tsx tests/components/molecules/edit-assessment-modal.test.tsx tests/app/pacientes/patient-clinical-profile.test.tsx tests/components/molecules/next-event-modal.test.tsx tests/app/pacientes/patient-follow-up.test.tsx tests/app/pacientes/consultation-projection.test.tsx
npm test -- tests/architecture/patient-persistence-boundary.test.ts tests/performance/clinical-profile.perf.test.ts
npm run type-check
npm run lint
```

Executar depois os gates do projeto:

```powershell
npm run verify:links
npm run audit:atomic-design
npm run verify:table
npm run verify:design-system
npm run build
```

## Jornada Chromium

```powershell
npm run test:browser -- tests/browser/clinical-persistence.spec.ts --workers=1
```

A jornada deve comprovar, em série:

1. criar avaliação válida e vê-la no perfil;
2. recarregar e recuperar os mesmos valores confirmados;
3. editar uma avaliação sem alterar as demais;
4. rejeitar versão antiga sem perder o formulário;
5. criar, reagendar e remover o acompanhamento;
6. exibir futuro, hoje e atrasado na lista;
7. agrupar dieta e avaliação da mesma data sem fundir identidades;
8. abrir consulta somente leitura, sem `ConsultationRecord` persistido;
9. arquivar paciente, preservar histórico e bloquear mutações;
10. rejeitar Conta/paciente incorretos;
11. continuar funcionando com a rede desativada após preparação;
12. confirmar zero leitura/escrita das chaves clínicas legadas.

## Checks de persistência

- Aplicar a migration v3→v4 em base com Conta, pacientes, dietas e biblioteca.
- Confirmar preservação dos dados anteriores, criação das duas tabelas, FKs,
  checks, índices, journal e idempotência.
- Fechar e reabrir o banco e confirmar persistência das avaliações e do
  acompanhamento.
- Injetar falha de gravação e confirmar rollback sem projeção divergente.

## Matriz de falhas

| Situação | Resultado esperado |
| --- | --- |
| Campo obrigatório, medida ou cálculo inválido | `CLINICAL_VALIDATION_FAILED`; formulário preservado; nenhuma linha parcial |
| Paciente inexistente ou de outra Conta | erro de escopo/not found sem revelar dados |
| Paciente arquivado | `CLINICAL_PATIENT_ARCHIVED`; leitura histórica disponível |
| Versão desatualizada | `CLINICAL_VERSION_CONFLICT`; valor atual preservado |
| Falha durante transação | `CLINICAL_TRANSACTION_FAILED`; rollback e UI recuperável |
| Duplo salvar | uma operação e nenhum registro duplicado |
| Duas avaliações na mesma data | ambas preservadas e ordenadas deterministicamente |
| Consulta sem eventos | empty state explícito, sem criar registro persistido |

## Performance

Com centenas de pacientes e milhares de avaliações, medir resumo batch, abertura
de perfil e confirmações locais. Pelo menos 95% das amostras devem apresentar
resultado em até 1 segundo, sem rede.

## Critérios cobertos

- T001–T009: domínio, schema, escopo, atomicidade e composição.
- T010–T013: ciclo de vida das avaliações.
- T014–T017: acompanhamento, projeções e consulta.
- T018–T023: cutover, acessibilidade, desempenho, offline e gates.

## Limites

Não validar backup/restauração `.nutridiet`, autenticação, nuvem, sincronização,
múltiplos profissionais, agenda, notificações, prontuário ampliado ou
persistência de observações/suplementos. Dados legados de teste não são
convertidos.
