# Decisão 06 — Catálogo de Alimentos e Alimentos Customizados

- **Status:** Aprovado pelo usuário para especificação; implementação pendente
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

Os dados legados de `localStorage` existentes são dados de teste e serão
descartados antes da implantação. Nenhuma tela nova deve gravar diretamente em
`nutridiet_custom_foods`.

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

### 6.1 Energia de referência, calculada e meta

- **Energia de referência:** kcal informadas na TACO ou no alimento customizado,
  por sua base de medida. Esse valor é escalado com a quantidade e é a fonte
  dos totais prescritos quando disponível; zero informado é diferente de ausente.
- **Energia calculada:** `4 × proteína + 4 × carboidrato + 9 × gordura`. Só
  substitui energia de referência ausente quando essa estimativa estiver
  explicitamente identificada no dado como `CALCULATED_449`. Nunca sobrescreve
  silenciosamente uma energia informada (`REFERENCE`).
- **Meta energética:** objetivo informado pelo nutricionista. Uma sugestão
  inicial baseada nos macros não torna essa meta equivalente ao total dos
  alimentos nem autoriza sobrescrever uma meta manual.

Receitas, refeições e dietas somam a energia dos snapshots de seus componentes
na quantidade prescrita. Não recalculam esse total por 4–4–9 apenas por haver
macros disponíveis. A presença de componentes estimados permanece rastreável.

Exemplo de regressão com a base atual: 100 g de arroz tipo 1 cozido possuem
128 kcal de referência, enquanto seus macros resultam em 124,2 kcal por 4–4–9.
A prescrição preserva 128 kcal; em 50 g, 64 kcal. A divergência não deve ser
corrigida alterando os valores da fonte.

### 6.2 Precisão, validade e recálculo

1. Quantidades e bases são decimais finitos; quantidade prescrita e divisor são
   positivos. Nutrientes e energia são não negativos. Ausência não vira zero
   silenciosamente, e `NaN`/infinito são rejeitados.
2. Manter representação decimal com precisão suficiente para ida e volta entre
   domínio, SQL e arquivo mestre, sem arredondamentos intermediários por item
   ou refeição. A representação concreta é fixada e testada na prova técnica.
3. Arredondar somente a apresentação: macros e fibras em uma casa decimal,
   kcal inteiras, g/kg em duas casas, com arredondamento decimal de metade para
   cima. Totais exibidos derivam dos valores internos, não da soma de rótulos
   já arredondados; a interface pode explicar diferenças de arredondamento.
4. Alterar quantidade recalcula a partir da base original congelada e das
   conversões registradas. Alternar 100 g → 50 g → 100 g recupera o mesmo valor.
5. Registrar `calculationVersion` e a proveniência da energia no snapshot. Uma
   evolução do cálculo não recalcula prescrições históricas ao abri-las.

**Justificativa:** distinguir os três significados de energia e conservar a
base de cálculo evita que a mesma prescrição mude entre editor, receita,
histórico e exportação. A escolha preserva a composição de referência e as
metas manuais já previstas no produto.

## 7. Fora desta decisão

Não são definidos aqui layout de cadastro, filtros da tela, importação de
rótulos por imagem ou integração com bases externas além da TACO já existente.
Receitas que usam esses alimentos estão na Decisão 07; o congelamento clínico
está na Decisão 08.
