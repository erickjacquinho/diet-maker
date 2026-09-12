# Data Model — Backup manual simples

**Feature**: [spec.md](./spec.md)

## BackupEnvelope

Representa o arquivo mestre `.nutridiet` completo.

| Campo | Tipo | Regra |
| --- | --- | --- |
| `appId` | string | Deve ser `nutridiet-local-pro`. |
| `formatVersion` | integer | Deve ser `1` para o primeiro formato publicado. |
| `schemaVersion` | string | Deve ser compatível com o schema local suportado; primeira entrega: `4`. |
| `exportedAt` | ISO-8601 string | Obrigatório e válido; registra o instante do snapshot. |
| `account` | `AccountRow[]` | Deve conter exatamente uma linha com a identidade da Conta local ativa. |
| `objectiveOptions` | `ObjectiveOptionRow[]` | Todas as opções da Conta, ativas e arquivadas. |
| `patients` | `PatientRow[]` | Pacientes ativos e arquivados da Conta. |
| `bodyAssessments` | `BodyAssessmentRow[]` | Avaliações confirmadas, ligadas à Conta e ao paciente. |
| `nextFollowUps` | `NextFollowUpRow[]` | No máximo um acompanhamento por paciente. |
| `dietPlans` | `DietPlanRow[]` | Dietas vigentes, snapshots históricos e arquivados representados pelo status canônico. |
| `dietVariations` | `DietVariationRow[]` | Filhas das dietas exportadas. |
| `dietVariationDays` | `DietVariationDayRow[]` | Dias associados às variações exportadas. |
| `dietMeals` | `DietMealRow[]` | Refeições associadas às variações exportadas. |
| `dietMealOptions` | `DietMealOptionRow[]` | Opções associadas às refeições exportadas. |
| `dietMealItems` | `DietMealItemRow[]` | Itens associados às opções exportadas. |
| `dietItemSnapshots` | `DietItemSnapshotRow[]` | Snapshots nutricionais completos dos itens. |
| `foodCatalogItems` | `FoodCatalogItemRow[]` | Alimentos customizados ativos e arquivados. |
| `recipes` | `RecipeRow[]` | Receitas ativas e arquivadas. |
| `recipeIngredients` | `RecipeIngredientRow[]` | Ingredientes e snapshots das receitas exportadas. |
| `readyMeals` | `ReadyMealRow[]` | Refeições prontas ativas e arquivadas. |
| `readyMealItems` | `ReadyMealItemRow[]` | Itens e snapshots das refeições prontas exportadas. |

Os tipos `*Row` correspondem aos campos persistidos das tabelas canônicas atuais, preservando números, strings, nulos e objetos JSON sem converter o conteúdo em modelos de apresentação. A definição concreta deve reutilizar os tipos inferidos do schema e não manter uma segunda lista manual de campos quando o contrato de código permitir.

## Scope and ownership invariants

- Todas as entidades devem apontar para o único `accountId` do envelope.
- Todo `patientId` em avaliações, acompanhamentos e dietas deve existir em `patients` com o mesmo `accountId`.
- Todo relacionamento de dieta deve formar a cadeia `dietPlan → variation → day/meal → option → item → snapshot`.
- Todo ingrediente de receita e item de refeição pronta deve apontar para a entidade pai e preservar `accountId`.
- IDs devem ser únicos dentro de cada tabela e relações compostas devem ser únicas conforme as chaves do schema.
- O arquivo deve conter exatamente uma Conta e não pode trocar a identidade da Conta local ativa.
- Cada paciente pode possuir no máximo uma dieta com status `ACTIVE`; históricos `SNAPSHOT` e registros arquivados devem ser preservados.
- Arrays vazios são válidos e representam ausência de registros; o restaurador não cria defaults de domínio além dos exigidos pela Conta local.

## Validation states

```text
selected
  ├─ invalid → rejected (base unchanged)
  └─ valid → awaiting-confirmation
                    ├─ cancelled → cancelled (base unchanged)
                    ├─ pending-edits → blocked (base unchanged)
                    └─ confirmed → restoring
                                      ├─ failed → rolled-back (base unchanged)
                                      └─ committed → reloading-context
                                                       └─ ready
```

## Draft boundary

`DietDraft` não é entidade do `BackupEnvelope`. Ele permanece no IndexedDB separado, não é exportado, não é restaurado e não pode ser eliminado silenciosamente por uma restauração. A presença de qualquer draft editável da Conta é o sinal operacional de edição pendente; o usuário deve salvá-lo ou descartá-lo explicitamente antes da transação, sem um registry global adicional.

Consultas não são uma entidade persistida adicional no envelope. A tela de
consulta deve ser reconstruída pelos pacientes, avaliações, acompanhamentos,
dietas e demais registros canônicos já listados; esta fase não cria nem exporta
uma tabela de recibos/prontuários de consulta.

## Error categories

| Código lógico | Situação | Efeito obrigatório |
| --- | --- | --- |
| `BACKUP_FORMAT_INVALID` | JSON ausente, truncado, tipo incorreto ou envelope incompleto | Rejeitar antes da escrita. |
| `BACKUP_APP_MISMATCH` | `appId` desconhecido ou Conta diferente da local | Rejeitar antes da escrita. |
| `BACKUP_VERSION_UNSUPPORTED` | `formatVersion` ou `schemaVersion` não suportado | Rejeitar antes da escrita. |
| `BACKUP_RELATION_INVALID` | ID duplicado, referência órfã, escopo divergente ou vigência duplicada | Rejeitar antes da escrita. |
| `BACKUP_PENDING_EDITS` | Draft editável ou gravação pendente | Bloquear e orientar salvar/descartar. |
| `BACKUP_CANCELLED` | Seleção/confirmção cancelada | Manter a base inalterada. |
| `BACKUP_RESTORE_FAILED` | Falha durante a transação ou recarga | Rollback nativo; não apresentar sucesso. |
| `BACKUP_EXPORT_FAILED` | Falha ao capturar/serializar/baixar | Manter a base inalterada; não apresentar backup concluído. |
