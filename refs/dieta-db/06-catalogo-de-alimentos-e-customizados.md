# Decisão 06 — Catálogo de Alimentos e Alimentos Customizados

- **Status:** Proposta de arquitetura; pendente de confirmação final
- **Data:** 2026-08-29
- **Escopo:** Dados nutricionais reutilizáveis pertencentes à Conta

## 1. Fontes do catálogo

O catálogo de alimentos possui duas fontes com comportamentos diferentes:

| Fonte | Proprietário | Escrita | Uso |
| --- | --- | --- | --- |
| TACO | Sistema | somente manutenção do produto | alimento de referência compartilhado |
| Customizado | Conta do nutricionista | salvar, editar e arquivar | alimento próprio do consultório |

Um alimento TACO não deve ser copiado para cada paciente ou Conta. Um alimento
customizado sempre pertence a uma Conta e nunca pode ser usado para atravessar
o escopo de outra Conta.

## 2. Modelo conceitual

O modelo canônico de alimento deve conter, no mínimo:

```text
FoodCatalogItem
├── id
├── sourceType: SYSTEM_TACO | ACCOUNT_CUSTOM
├── accountId (nulo apenas para TACO)
├── name e descrição/ marca
├── measurementBasis: PER_100G | PER_100ML | PER_UNIT
├── foodState: RAW | COOKED | PREPARED | AS_SOLD
├── servingReference (opcional)
├── nutrientProfile
├── status: ACTIVE | ARCHIVED
└── createdAt / updatedAt / version
```

O perfil nutricional deve preservar valores decimais para proteína,
carboidrato, gordura, fibras e energia. A unidade de referência e o estado do
alimento fazem parte do dado nutricional; não podem ficar apenas na tela.

O contrato deve permitir gramas, mililitros e unidades. Conversões específicas
de densidade, unidade caseira ou parte comestível só podem ser aplicadas
quando houver informação explícita; o sistema não deve inventar uma conversão
silenciosamente.

## 3. Alimento customizado

Salvar um alimento customizado é uma operação independente de qualquer dieta:

1. validar nome, unidade de referência e valores nutricionais;
2. associar o alimento à Conta ativa;
3. gerar ID e versão;
4. persistir no banco relacional canônico;
5. disponibilizar o alimento para receitas, refeições prontas e novas dietas.

Editar um alimento incrementa sua versão e afeta somente usos futuros. Dietas
já salvas e versões de receita que capturaram aquele alimento mantêm seus
snapshots originais.

## 4. Arquivamento e dependências

O alimento customizado não deve ser fisicamente apagado se estiver referenciado
por uma receita, refeição pronta ou prescrição histórica. Nessa situação:

- `status` passa a `ARCHIVED`;
- novas inserções não o exibem como opção ativa, salvo em fluxos de manutenção;
- receitas e snapshots existentes continuam legíveis;
- o registro permanece associado à Conta para preservar a origem.

Um alimento nunca é removido de uma dieta salva porque foi arquivado no
catálogo.

## 5. Persistência e repositório

Alimentos customizados são dados da Conta. Portanto:

- não são armazenados dentro do `DietDraftStore`;
- não dependem de autosave da tela de dieta;
- são salvos explicitamente pelo caso de uso do próprio catálogo;
- são consultados por `CustomFoodRepository` ou por uma porta de catálogo
  equivalente;
- podem ser exportados/importados junto do perfil `.nutridiet`, quando esse
  módulo for executado.

O armazenamento legado em `localStorage` é apenas fonte de migração. Nenhuma
tela nova deve gravar diretamente em `nutridiet_custom_foods`.

## 6. Regras de cálculo

O cálculo nutricional deve usar uma única regra de normalização:

```text
nutriente_prescrito = valor_de_referência
                      × quantidade_normalizada
                      ÷ fator_da_base_de_referência
```

O serviço de domínio deve centralizar conversões, energia e arredondamento.
Componentes não devem recalcular macros a partir de campos alternativos ou
strings formatadas.

## 7. Fora desta decisão

Não são definidos aqui layout de cadastro, filtros da tela, importação de
rótulos por imagem ou integração com bases externas além da TACO já existente.
Receitas que usam esses alimentos estão na Decisão 07; o congelamento clínico
está na Decisão 08.
