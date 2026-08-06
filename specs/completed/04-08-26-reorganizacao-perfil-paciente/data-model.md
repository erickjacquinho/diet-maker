# Data Model: Reorganização estrutural do perfil do paciente

## Existing entities

### Patient

Representa o cadastro e os valores manuais associados ao paciente.

| Campo | Papel nesta mudança |
|---|---|
| `id` | Identidade do paciente e chave de carregamento do perfil. |
| `name`, `initials`, `gender`, `age`, `heightCm`, `objective` | Dados pessoais e clínicos de primeira prioridade. |
| `weightKg` | Valor cadastral; não substitui automaticamente a medição corporal mais recente. |
| `targetKcal`, `targetProtein`, `targetCarbs`, `targetFats` | Metas manuais; não são a fonte do plano vigente no resumo. |
| `lastConsultation` | Contexto da última consulta. |
| `nextEvent` | Próximo acompanhamento, quando definido. |

### BodyAssessment

Representa uma medição corporal datada.

| Campo | Papel nesta mudança |
|---|---|
| `id` | Identidade da avaliação. |
| `date` | Ordenação temporal e rotulagem da origem do indicador. |
| `weightKg`, `bodyFatPercent`, `muscleMassKg`, `waistCm` | Valores que alimentam os indicadores atuais quando esta é a avaliação mais recente. |

### HistoricalDiet

Representa uma dieta registrada no histórico do paciente.

| Campo | Papel nesta mudança |
|---|---|
| `id`, `name` | Identidade e reconhecimento do plano. |
| `date` | Referência temporal exibida no resumo. |
| `status` | Regra de vigência (`Ativa` ou `Histórica`). |
| `targetKcal`, `proteinG`, `carbsG`, `fatsG` | Totais compactados da dieta; só aparecem no resumo quando há plano vigente. |
| `meals` | Detalhes preservados no fluxo da dieta/histórico, fora do resumo principal. |

## Derived projection

### ActivePlanSummary

Projeção efêmera derivada do `HistoricalDiet` vigente; não é uma nova entidade persistida.

| Campo | Regra |
|---|---|
| `dietId` | Identificador da dieta vigente. |
| `name` | Nome da dieta; se ausente, usar o estado de nome indisponível definido pelo produto, sem inventar uma prescrição. |
| `date` | Data do registro vigente, preservando a origem temporal. |
| `status` | Deve ser `Ativa` para entrar no resumo. |
| `targetKcal`, `proteinG`, `carbsG`, `fatsG` | Totais mostrados em composição curta e com rótulos explícitos. |
| `detailsAction` | Referência para abrir a dieta detalhada. |

## Selection and state rules

1. `Patient.target*` nunca deve ser usado como fallback semântico para preencher `ActivePlanSummary`.
2. Se existir uma dieta `status = Ativa`, ela é a candidata ao resumo. Se houver mais de uma, selecionar a de data de registro mais recente; em empate, preservar de forma determinística a primeira ocorrência na fonte do histórico e exibir a data escolhida.
3. Se não houver dieta ativa, o resumo entra em estado vazio com ação de criar dieta; não exibe números de macro.
4. `BodyAssessment` mais recente alimenta os indicadores atuais; avaliações anteriores permanecem no histórico.
5. `nextEvent = null` ou ausente produz estado vazio acionável, sem data fictícia.

## Validation rules

- Valores numéricos ausentes não devem ser apresentados como dados atuais.
- A origem temporal de uma dieta deve ser legível junto ao status.
- O resumo deve ser somente leitura; alterações de dieta continuam no fluxo próprio.
- A projeção não deve duplicar a lista de refeições nem mudar o status do histórico.

## Implementation status

- Implementado em `src/lib/patientProfileSelectors.ts` e consumido pelo perfil do paciente.
- Datas ISO e pt-BR são normalizadas somente para ordenação/consolidação; a data original continua sendo exibida.
- A seleção da avaliação mais recente, do plano ativo e do estado vazio de acompanhamento é coberta por testes direcionados.
- Nenhuma entidade persistida ou nova fonte de dados foi criada.
