# Contract — Arquivo mestre `.nutridiet`

## Purpose

Definir o contrato lógico do arquivo exportado e importado pela Fase 6. O
arquivo é JSON UTF-8 para portabilidade manual; não é SQL, dump físico, código
executável ou arquivo criptografado.

## Envelope

```json
{
  "appId": "nutridiet-local-pro",
  "formatVersion": 1,
  "schemaVersion": "4",
  "exportedAt": "2026-09-12T12:00:00.000Z",
  "account": [],
  "objectiveOptions": [],
  "patients": [],
  "bodyAssessments": [],
  "nextFollowUps": [],
  "dietPlans": [],
  "dietVariations": [],
  "dietVariationDays": [],
  "dietMeals": [],
  "dietMealOptions": [],
  "dietMealItems": [],
  "dietItemSnapshots": [],
  "foodCatalogItems": [],
  "recipes": [],
  "recipeIngredients": [],
  "readyMeals": [],
  "readyMealItems": []
}
```

Os arrays carregam as linhas confirmadas das tabelas correspondentes, inclusive
registros arquivados e snapshots históricos. Drafts e estados temporários nunca
aparecem no envelope.

## Export contract

- A extensão do arquivo disponibilizado é `.nutridiet`.
- A captura representa uma única visão consistente da Conta.
- O arquivo não contém segredo, senha, chave ou assinatura criptográfica.
- Falha de captura, serialização ou download não é sucesso e não altera a base.

## Restore contract

Antes de qualquer escrita, o consumidor deve:

1. parsear JSON sem executar conteúdo;
2. validar envelope, campos obrigatórios, `appId`, versões e tipos;
3. validar exatamente uma Conta com a identidade da Conta local ativa;
4. validar IDs únicos, relações, escopos, vigência única e tipos de dados;
5. bloquear a operação se houver drafts editáveis ou gravações pendentes;
6. informar substituição total sem mesclagem e obter confirmação explícita.

Depois da confirmação, a substituição deve ser atômica. O resultado aceitável é
o snapshot inteiro restaurado ou a base anterior intacta. O consumidor deve
recarregar o runtime e as consultas antes de permitir novas edições.

## Compatibility policy

- `formatVersion` desconhecido é rejeitado.
- `schemaVersion` não suportado é rejeitado; não há conversor universal nesta
  fase.
- Campos desconhecidos no envelope ou nas linhas são rejeitados no
  `formatVersion = 1`; eles nunca são executados nem ignorados silenciosamente.
  Uma versão futura poderá definir sua própria política sem alterar o contrato
  desta versão.

## Privacy contract

O fluxo informa que qualquer pessoa com acesso ao arquivo pode ler os dados. A
aplicação não envia o arquivo para a rede e não escreve dados clínicos em logs.
