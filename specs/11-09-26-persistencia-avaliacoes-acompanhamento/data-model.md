# Data Model: Persistência de avaliações e acompanhamento

**Feature**: [Persistência de avaliações e acompanhamento](./spec.md)
**Status**: Proposed for implementation
**Date**: 2026-09-11

## Model boundaries

- Cada registro persistido pertence a uma Conta e a um paciente dessa Conta.
- `BodyAssessment` e `NextFollowUp` são as únicas novas entidades persistidas.
- `PatientActivity`, comparação corporal e `ConsultationView` são projeções de leitura, não tabelas.
- `Patient` continua sendo cadastro; não incorpora arrays de avaliações nem campos derivados de atividade.
- Dietas confirmadas permanecem a autoridade da Etapa 3 e drafts continuam exclusivamente no `DietDraftStore`.
- Chaves legadas de `localStorage` não entram no modelo e não possuem caminho de migração.

## Entities

### BodyAssessment

Avaliação física independente. Os valores calculados são confirmados junto com as medidas e nunca recalculados durante leitura histórica.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `id` | stable text ID | yes | imutável e globalmente único na base |
| `accountId` | Account ID | yes | deve corresponder ao paciente e ao contexto ativo |
| `patientId` | Patient ID | yes | paciente da mesma Conta |
| `clinicalDate` | date-only text | yes | ISO `YYYY-MM-DD`, sem horário ou conversão de fuso |
| `weightKg` | positive decimal | yes | medida informada no salvamento |
| `bodyFatPercent` | decimal | yes | resultado confirmado entre 0 e 100 |
| `fatMassKg` | non-negative decimal | yes | resultado confirmado |
| `leanMassKg` | non-negative decimal | yes | canônico; adaptado para `muscleMassKg` na UI legada |
| `waistCm` | positive decimal | yes | medida obrigatória atual |
| `scapulaCm` | positive decimal | yes | medida obrigatória atual |
| `bustCm` | positive decimal | yes | medida obrigatória atual |
| `abdomenCm` | positive decimal | yes | medida obrigatória atual |
| `hipCm` | positive decimal | yes | medida obrigatória atual |
| `leftProximalThighCm` / `rightProximalThighCm` | positive decimal | at least one before normalization | o par confirmado contém os valores normalizados |
| `neckCm` | positive decimal | no | pode vir do formulário, avaliação anterior ou valor efetivo do método |
| `leftArmCm` / `rightArmCm` | positive decimal | no | pares opcionais normalizados quando aplicável |
| `leftDistalThighCm` / `rightDistalThighCm` | positive decimal | no | pares opcionais normalizados quando aplicável |
| `leftCalfCm` / `rightCalfCm` | positive decimal | no | pares opcionais normalizados quando aplicável |
| `autoFilledFields` | list of field names | yes | lista vazia ou apenas campos permitidos preenchidos pelo domínio |
| `calculationMethod` | enum | yes | `US_NAVY` nesta etapa |
| `calculationVersion` | text | yes | versão estável da regra usada |
| `calculationInputSnapshot` | structured value | yes | gênero normalizado, altura e medidas efetivamente usadas no cálculo |
| `version` | positive integer | yes | começa em 1 e incrementa em edição explícita |
| `createdAt` / `updatedAt` | ISO instant | yes | `createdAt` imutável; `updatedAt` muda em edição |

#### Storage shape

Tabela `body_assessments` com:

- PK em `id`;
- FK composta `(account_id, patient_id)` para `patients(account_id, id)` sem exclusão clínica em cascata pelo fluxo normal;
- índice `(account_id, patient_id, clinical_date DESC, created_at DESC, id)` para histórico e anterior/recente;
- identidade escopada única `(id, account_id, patient_id)`;
- checks para versão positiva, percentuais válidos e medidas/resultados não negativos;
- `jsonb` para `auto_filled_fields` e `calculation_input_snapshot`, validados também no domínio.

Não há unicidade por data: várias avaliações no mesmo dia são válidas.

### NextFollowUp

Estado opcional do próximo acompanhamento. Não representa consulta confirmada nem histórico de agenda.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `accountId` | Account ID | yes | Conta proprietária |
| `patientId` | Patient ID | yes | paciente da mesma Conta |
| `dueDate` | date-only text | yes | ISO `YYYY-MM-DD`; passado, hoje ou futuro |
| `type` | enum | yes | `ASSESSMENT_UPDATE` ou `DIET_UPDATE` |
| `version` | positive integer | yes | começa em 1 e incrementa ao reagendar/substituir |
| `createdAt` / `updatedAt` | ISO instant | yes | timestamps técnicos |

#### Storage shape

Tabela `next_follow_ups` com:

- PK composta `(account_id, patient_id)`, garantindo no máximo uma linha;
- FK composta para o paciente da mesma Conta;
- check de tipo e versão positiva;
- índice por `(account_id, due_date, patient_id)` para agrupamento da lista;
- remoção física somente da linha de acompanhamento ao confirmar `clearNextFollowUp`.

## Value objects and derived read models

### AssessmentInput

Contém data civil e medidas informadas. Não aceita valores calculados como autoridade. O domínio combina o input com paciente e avaliação anterior aplicável, produzindo um `BodyAssessment` confirmado.

### PatientClinicalSummary

Projeção usada por perfil e lista:

| Field | Source |
| --- | --- |
| `assessmentCount` | contagem de `body_assessments` escopada |
| `latestAssessment` | primeira avaliação pela ordem clínica determinística |
| `previousAssessment` | segunda avaliação pela mesma ordem, quando necessária para comparação |
| `nextFollowUp` | linha opcional de `next_follow_ups` |
| `lastActivity` | máximo entre avaliações e dietas confirmadas |
| `hasDiet` / `dietCount` | leitor de dietas da Etapa 3 |

Para a lista, o leitor produz um mapa por `patientId` em consulta batch. Para o perfil, pode incluir o histórico completo de avaliações ordenado.

### PatientActivity

Valor derivado com `eventDate`, `confirmedAt`, `type` e `sourceId`. A ordem é:

1. `eventDate` descendente;
2. `confirmedAt` descendente;
3. precedência estável de tipo;
4. `sourceId` ascendente como desempate final.

Editar uma avaliação antiga não muda sua data clínica. Rascunhos e formulários cancelados nunca entram na projeção.

### ConsultationView

Projeção somente leitura para `(accountId, patientId, date)`:

- paciente canônico;
- zero ou mais avaliações confirmadas da data;
- zero ou mais dietas confirmadas cuja data clínica/ativação corresponda ao dia;
- resumo derivado exibido pela tela;
- estado explícito sem observações e sem suplementos persistidos.

Não possui `id`, tabela, repositório de mutação, versão ou lifecycle próprio.

## Relationships

```text
Account 1 ─── * Patient
Patient 1 ─── * BodyAssessment
Patient 1 ─── 0..1 NextFollowUp
Patient 1 ─── * DietPlan (Etapa 3)

BodyAssessment + DietPlan ─── derive ───> PatientActivity
BodyAssessment + DietPlan + Patient ─── derive ───> ConsultationView
```

## State transitions

### BodyAssessment

```text
absent ── create(valid patient + input) ──> version 1
version N ── update(expected N) ──> version N+1
version N ── update(expected ≠ N) ──> conflict, unchanged
patient archived ── create/update ──> rejected, history readable
```

Não existe delete ou archive de avaliação nesta etapa.

### NextFollowUp

```text
absent ── set ──> version 1
version N ── replace(expected N) ──> version N+1
version N ── clear(expected N) ──> absent
stale expected version ── replace/clear ──> conflict, unchanged
patient archived ── set/replace/clear ──> rejected
```

## Validation invariants

1. Conta e paciente são obrigatórios em toda leitura e mutação.
2. O paciente precisa estar ativo no instante de qualquer mutação clínica.
3. Resultados de composição são produzidos pelo domínio com a versão de cálculo registrada.
4. Todos os números persistidos são finitos e respeitam positividade/faixa aplicável.
5. Múltiplas avaliações na mesma data permanecem independentes.
6. Update de avaliação e acompanhamento exige versão esperada.
7. Falha transacional não altera registro confirmado; projeções derivadas só leem dados confirmados.
8. Acompanhamento possui cardinalidade máxima de um por paciente.
9. Atividade e consulta não são gravadas como segunda autoridade.
10. Nenhuma operação lê ou escreve chaves clínicas legadas.

## Boundary with Stage 6

Exportação e restauração `.nutridiet` consomem os registros confirmados desta etapa, mas não exigem alteração do contrato de exportação agora. A Etapa 6 definirá sua própria serialização e validação.
