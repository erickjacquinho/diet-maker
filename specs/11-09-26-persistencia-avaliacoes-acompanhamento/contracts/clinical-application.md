# Contract: Clinical Application Boundary

**Feature**: [Persistência de avaliações e acompanhamento](../spec.md)  
**Status**: Proposed for implementation

Este contrato estende a fachada `PatientApplication` e o
`PatientProfileReader` já usados pelas páginas e hooks. A UI não conhece
PGlite, Drizzle, SQL, `localStorage`, IndexedDB ou tipos de um provedor online.

## Context and errors

Toda operação resolve a Conta ativa. Leituras validam Conta + Paciente e
mutações também exigem paciente ativo. Os erros são tipados e acionáveis:

- `CLINICAL_CONTEXT_MISSING`: nenhuma Conta ativa está disponível;
- `CLINICAL_PATIENT_NOT_FOUND`: o paciente não existe no escopo;
- `CLINICAL_PATIENT_ARCHIVED`: mutação para paciente arquivado;
- `CLINICAL_ASSESSMENT_NOT_FOUND`: avaliação ausente no paciente escopado;
- `CLINICAL_SCOPE_VIOLATION`: identificador fora do escopo, sem expor o registro;
- `CLINICAL_VALIDATION_FAILED`: data, medida, cálculo ou acompanhamento inválido;
- `CLINICAL_VERSION_CONFLICT`: versão esperada desatualizada;
- `CLINICAL_TRANSACTION_FAILED`: gravação falhou e o rollback foi confirmado;
- `CLINICAL_READ_FAILED`: projeção não pôde ser carregada e pode ser repetida.

Nenhum erro autoriza fallback para o armazenamento legado ou comunica sucesso
antes da confirmação.

## Single persistence port

Uma porta clínica cobre as duas entidades novas. Isso mantém a separação entre
domínio/aplicação e banco sem criar três interfaces para o mesmo fluxo:

```text
ClinicalRepository
  getAssessment(accountId, patientId, assessmentId)
  listAssessments(accountId, patientId)
  listAssessmentsByPatients(accountId, patientIds)
  createAssessment(accountId, patientId, assessment)
  updateAssessment(accountId, patientId, assessmentId, expectedVersion, assessment)
  getNextFollowUp(accountId, patientId)
  listNextFollowUps(accountId, patientIds)
  setNextFollowUp(accountId, patientId, expectedVersion | null, input)
  clearNextFollowUp(accountId, patientId, expectedVersion)
```

Regras da porta:

- toda operação recebe o escopo completo;
- `listAssessments` usa data clínica, confirmação e ID como desempate;
- `createAssessment` não converte ID repetido em update;
- `updateAssessment` preserva identidade, propriedade e `createdAt`, incrementa
  `version` e falha quando `expectedVersion` diverge;
- o acompanhamento aceita somente os dois tipos canônicos e a chave composta
  garante no máximo uma linha por paciente;
- não existe delete de avaliação nem busca por identificador sem Conta e
  paciente.

O repositório não grava atividade, avaliação recente, comparação ou consulta:
essas leituras são compostas a partir dos dados confirmados pelo
`PatientProfileReader` e pelo leitor de dietas existente.

## Application commands and queries

Os métodos abaixo são adicionados ao `PatientApplication` existente:

```text
createAssessment(patientId, input): BodyAssessment
updateAssessment(patientId, assessmentId, expectedVersion, input): BodyAssessment
getAssessment(patientId, assessmentId): BodyAssessment
listAssessments(patientId): BodyAssessment[]
getNextFollowUp(patientId): NextFollowUp | null
setNextFollowUp(patientId, expectedVersion | null, input): NextFollowUp
clearNextFollowUp(patientId, expectedVersion): void
getConsultationView(patientId, date): ConsultationView
```

Para criar ou editar avaliação, a aplicação resolve a Conta, valida o paciente,
normaliza data e medidas, escolhe a avaliação anterior aplicável, reaplica
preenchimento assistido/normalização bilateral, calcula composição no domínio e
confirma tudo em uma transação. O input não pode impor `accountId`, resultados,
versão final ou timestamps.

Paciente arquivado continua legível, mas qualquer mutação clínica é rejeitada.
`setNextFollowUp` e `clearNextFollowUp` preservam o último valor confirmado em
erro, cancelamento ou conflito.

`getConsultationView` combina paciente canônico, dietas confirmadas e avaliações
da data, sem criar `ConsultationRecord` ou incluir rascunhos.

## Read models

```text
PatientClinicalSummary
  assessmentCount
  latestAssessment | null
  previousAssessment | null
  nextFollowUp | null
  lastActivity | null

PatientClinicalProfile
  assessments[]
  latestAssessment | null
  previousAssessment | null
  nextFollowUp | null
  lastActivity | null

ConsultationView
  date
  assessments[]
  diets[]
  notesState = EMPTY_NOT_PERSISTED
  prescribedSupplements = []
```

O resumo da lista é carregado em lote pelo `PatientProfileReader`; não há uma
consulta clínica isolada por paciente. `lastActivity`, contagens e deltas não
são gravados no registro `Patient`. Dietas confirmadas entram nas projeções;
`DietDraft` nunca entra.

Adapters de apresentação podem mapear `leanMassKg` para `muscleMassKg` e os
tipos canônicos para os valores legados da UI, preservando `id` e `version`.

## UI state contract

Workspace, perfil e modais representam explicitamente:

```text
idle → loading → ready | empty | read-error
ready → saving → saved | validation-error | conflict | archived | transaction-error
ready + dirty → discard-confirmation → ready | closed
```

- o formulário permanece preenchido em validação, conflito, arquivamento ou
  rollback;
- modal e rota fecham/navegam somente após `saved`;
- botão e Ctrl+S chamam a mesma operação e ficam indisponíveis durante `saving`;
- erro de leitura oferece repetição e empty state não é erro;
- foco retorna ao acionador ao fechar o modal.

## Legacy cutover contract

Depois do cutover:

- páginas, hooks e a rota de consulta chamam somente a aplicação canônica;
- `nutridiet_assessments_*` e `nutridiet_patients` não são lidas nem escritas
  pelos fluxos clínicos;
- não existe adapter, migrador, fallback ou dual-write clínico;
- helpers puros de cálculo, data e apresentação podem permanecer;
- o teste de fronteira existente é estendido para proteger essa regra.
