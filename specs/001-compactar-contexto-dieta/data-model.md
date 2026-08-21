# Data Model: quadro de contexto da dieta

## Escopo de dados

Esta feature não cria, remove ou persiste entidades. Ela reorganiza a apresentação de dados já recebidos pelo template.

## Contexto do paciente

| Campo | Origem | Uso no quadro | Regra de apresentação |
| --- | --- | --- | --- |
| `patientInitials` | contexto da dieta | fallback visual do avatar | decorativo quando o nome está adjacente |
| `patientName` | contexto da dieta | identificação principal | uma ocorrência dentro do quadro; nome completo acessível |
| `patientWeightKg` | contexto da dieta | badge de peso | unidade `kg` explícita; aparece uma vez |
| `patientGoalDescription` | contexto da dieta | objetivo/metadado | não deve repetir o peso ou sua unidade |

## Modelo da dieta

| Estado | Conteúdo visível | Interações |
| --- | --- | --- |
| `simple` | título do grupo e opções Dieta Simples/Ciclo de Carboidratos | radio selecionado, setas e clique |
| `carb_cycling` | opções de modo, quantidade de variações, variações e cópia entre dias | radio, buttons de variação, seleção de dia e cópia |

## Invariantes

- A região do paciente não calcula metas nem altera o modo da dieta.
- A região do modelo não busca dados do paciente nem altera o conteúdo do breadcrumb.
- O quadro não altera `localStorage`, cálculos, modais ou callbacks de domínio.
- O nome, os labels do modelo e as unidades necessárias não dependem exclusivamente de cor ou ícone.

## Transições

```text
simple --seleciona Ciclo de Carboidratos--> carb_cycling
carb_cycling --seleciona Dieta Simples--> simple
carb_cycling --seleciona quantidade/variação--> carb_cycling
```

As transições continuam delegadas aos callbacks existentes e não mudam o contrato de dados.
