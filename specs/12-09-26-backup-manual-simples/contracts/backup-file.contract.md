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
- Mudanças de dados de uma feature incrementam `schemaVersion`; o
  `formatVersion` só muda quando o envelope/protocolo muda.
- `schemaVersion` atual e versões anteriores com migração registrada são
  aceitos. Cada migração é pura, determinística e aplicada em cadeia antes da
  validação final do schema atual.
- Campos/tabelas introduzidos por uma versão nova recebem defaults explícitos
  na migração (por exemplo, uma coleção nova começa vazia). O arquivo de
  origem não é alterado; o próximo export gera o envelope atualizado.
- `schemaVersion` futuro ou sem uma migração conhecida é rejeitado.
- Campos desconhecidos no envelope ou nas linhas são rejeitados depois da
  migração no `formatVersion = 1`; eles nunca são executados nem ignorados
  silenciosamente.

## Privacy contract

O fluxo informa que qualquer pessoa com acesso ao arquivo pode ler os dados. A
aplicação não envia o arquivo para a rede e não escreve dados clínicos em logs.
