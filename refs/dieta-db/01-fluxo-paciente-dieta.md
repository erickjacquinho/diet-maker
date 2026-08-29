# Decisão 01 — Fluxo de Paciente e Dieta

- **Status:** Aprovado pelo usuário para especificação; implementação pendente de revisão final
- **Data:** 2026-08-29
- **Escopo:** Primeiro fluxo vertical da arquitetura offline-first

## 1. Objetivo

Estruturar o fluxo principal do NutriDiet para que a interface atual possa
continuar sendo usada enquanto a persistência é substituída por uma arquitetura
local relacional, com contratos preparados para uma futura implementação online.

O primeiro fluxo cobre:

`Paciente → Nova dieta → Puxar informações → Adicionar alimentos → Salvar → Histórico`

Ficam fora desta decisão as avaliações físicas, receitas, refeições prontas,
exportação do arquivo mestre e sincronização online. Elas deverão consumir os
mesmos princípios quando forem abordadas.

## 2. Regras funcionais congeladas

### 2.1 Criação

1. O paciente precisa existir antes da criação da dieta.
2. A criação começa em `/pacientes/[id]/dieta/nova`.
3. Uma dieta sem nenhuma refeição contendo alimento é apenas um rascunho
   temporário e não aparece no histórico.
4. Ao adicionar o primeiro alimento a uma refeição, a dieta passa a existir no
   histórico com o estado **Em Criação**.
5. Uma dieta **Em Criação** é editável, pode ser retomada e é protegida por
   autosave.

### 2.2 Recuperação de dietas anteriores

1. A ação existente **Puxar informações das dietas anteriores** será mantida.
2. A lista de origem exclui dietas **Em Criação**.
3. A fonte pode ser uma dieta vigente ou um snapshot histórico.
4. O nutricionista pode puxar apenas metas/macros ou a dieta completa,
   incluindo refeições, alimentos, quantidades e dados necessários para a
   edição.
5. A operação sempre cria uma nova dieta. Ela não altera a dieta de origem,
   reutiliza seus identificadores nem cria uma referência mutável para ela.
6. A nova dieta começa como **Em Criação** e só entra no histórico após possuir
   o primeiro alimento.

### 2.3 Vigência e histórico

1. Existe no máximo uma dieta **Vigente** por paciente.
2. O botão de salvamento ativo transforma a dieta salva na dieta **Vigente**.
3. Quando uma nova dieta é salva ativamente, a dieta vigente anterior deixa de
   ser vigente e passa a ser um snapshot histórico somente leitura.
4. Dietas históricas não podem ser editadas diretamente.
5. A última dieta do paciente é a única dieta que pode ser editada diretamente.
6. Para usar uma dieta histórica como base, o nutricionista retorna a
   `/dieta/nova` e usa **Puxar informações**.

### 2.4 Rascunho durante a edição

O editor mantém uma camada de rascunho separada da última versão confirmada:

- alterações durante a digitação são salvas automaticamente no buffer local;
- fechar ou reabrir a tela pode recuperar esse buffer;
- o autosave não troca a dieta vigente nem cria uma nova vigente;
- somente **Salvar** aplica a versão editada ao registro canônico;
- após o salvamento, o buffer é limpo ou marcado como resolvido.

Para uma dieta **Em Criação**, o primeiro alimento cria o registro histórico e
as alterações seguintes atualizam o rascunho dessa mesma dieta. Para a dieta
vigente, o buffer protege a versão confirmada até o salvamento ativo.

## 3. Modelo de estados

Os estados exibidos ao usuário são derivados do ciclo de vida persistido:

```text
Rascunho vazio
    │ primeiro alimento
    ▼
Em Criação
    │ Salvar
    ▼
Vigente ── edição/autosave ──► buffer de rascunho
    │                              │
    └──────────── Salvar ◄─────────┘
    │ nova dieta salva
    ▼
Snapshot histórico (somente leitura)
```

Uma dieta histórica não retorna ao estado editável. A única forma de usá-la é
criar uma nova dieta por meio de **Puxar informações**.

## 4. Limites arquiteturais

```text
Página / componente
        ↓
Hook do fluxo
        ↓
Caso de uso da aplicação
        ↓
Contrato de repositório ou serviço
        ↓
Persistência local substituível
```

### 4.1 Interface

As páginas e componentes continuam responsáveis por renderização, interação,
feedback e navegação. Eles não podem conhecer:

- tabelas ou queries;
- `localStorage`, IndexedDB ou detalhes do banco;
- formato do futuro Supabase;
- regras de transição de estado.

### 4.2 Aplicação

Os casos de uso do primeiro fluxo são:

- `createDietDraft`;
- `resumeDietDraft`;
- `listPreviousDietSources`;
- `pullDietTargets`;
- `pullCompleteDiet`;
- `addFoodToMeal`;
- `saveDietAsActive`;
- `listPatientDietHistory`;
- `getDietSnapshot`.

Os casos de uso validam o estado da dieta e orquestram transações. A UI não
deve duplicar essas regras.

### 4.3 Portas de persistência

O primeiro fluxo precisa de contratos equivalentes a:

- `PatientRepository`;
- `DietRepository`;
- `DietDraftStore`;
- `FoodCatalogRepository`;
- `TransactionRunner`.

A implementação local será a primeira. Uma implementação online futura deverá
implementar os mesmos contratos ou um adaptador compatível, sem exigir imports
de Supabase nos componentes.

## 5. Modelo conceitual dos dados

O modelo deve ser relacional, mesmo enquanto o aplicativo funciona offline:

- **Patient:** cadastro e identidade do paciente;
- **DietPlan:** dono, datas, estado e metadados da dieta;
- **DietMeal:** refeição pertencente ao plano, com nome e horário;
- **DietMealItem:** alimento, quantidade, ordem, substituições e valores
  nutricionais usados no plano;
- **DietItemSnapshot:** nome, unidade, macros e kcal congelados no momento da
  prescrição;
- **DietDraft:** buffer de edição associado ao plano, com versão e timestamp.

O alimento mestre pode mudar. Os valores usados dentro de uma dieta salva não
podem mudar retroativamente: o item prescrito carrega seu snapshot nutricional.

A unicidade de dieta vigente por paciente deve ser garantida em transação, e
não apenas pela interface. A alteração de estado deve impedir uma situação em
que duas dietas sejam vigentes simultaneamente.

## 6. Fluxo de gravação

### 6.1 Primeiro alimento

1. Validar paciente, refeição e alimento.
2. Se a dieta ainda não existe no histórico, criar `DietPlan` com estado
   `EM_CRIACAO`.
3. Criar a refeição e o item em uma operação atômica.
4. Persistir o snapshot nutricional do alimento.
5. Limpar o estado de “rascunho vazio” e notificar o histórico.

### 6.2 Salvamento ativo

1. Validar o plano completo e seus itens.
2. Abrir uma transação.
3. Se houver dieta vigente anterior diferente da dieta salva, congelá-la como
   snapshot histórico.
4. Gravar a dieta atual, refeições, itens e snapshots.
5. Garantir que apenas essa dieta esteja vigente para o paciente.
6. Confirmar a transação.
7. Limpar o buffer de rascunho resolvido.
8. Atualizar o histórico e retornar à tela do paciente, conforme o fluxo atual.

Uma falha antes da confirmação deve deixar a base no estado anterior, sem dieta
parcialmente vigente ou histórico incompleto.

## 7. Proteções e erros

- Dietas históricas devem ser rejeitadas também no caso de uso e no repositório,
  não apenas desabilitadas na UI.
- A operação de puxar informações deve fazer cópia profunda e gerar novos IDs.
- Datas persistidas devem usar formato ISO; formatação local pertence à UI.
- Conflito entre draft e versão confirmada deve ser detectado por versão ou
  timestamp, nunca resolvido silenciosamente.
- Indisponibilidade do armazenamento deve produzir feedback explícito e impedir
  que o usuário receba uma falsa confirmação de salvamento.
- Todas as gravações de dieta devem ser idempotentes quando repetidas com a
  mesma operação e versão.

## 8. Guardrails obrigatórios

1. Nenhum componente ou página acessa diretamente a persistência.
2. Nenhum novo `localStorage` pode ser introduzido fora do adaptador legado ou
   da infraestrutura de draft aprovada.
3. Toda mutação passa por um caso de uso nomeado.
4. Nenhuma tela calcula ou decide estado de vigência por conta própria.
5. Histórico e snapshots são somente leitura depois de congelados.
6. IDs são gerados na camada de domínio/aplicação, nunca pela UI.
7. Datas internas são ISO e nunca strings formatadas em `pt-BR`.
8. Mudança de schema exige migration, atualização do contrato de exportação e
   teste de regressão.
9. Repositórios locais e online compartilham contratos; componentes não
   importam o provedor de banco.
10. O legado atual de `localStorage` deve ser tratado como fonte de migração,
    não como novo modelo de domínio.

## 9. Validação do primeiro fluxo

Antes de migrar outro módulo, este fluxo precisa comprovar:

- criação de paciente e abertura de nova dieta;
- dieta sem alimento não aparece no histórico;
- primeiro alimento cria dieta **Em Criação**;
- dietas **Em Criação** são excluídas das fontes de cópia;
- puxar metas cria uma nova dieta sem alterar a origem;
- puxar a dieta completa gera novos IDs;
- salvar torna a dieta a única vigente;
- a vigente anterior permanece íntegra como snapshot;
- dieta histórica abre somente para leitura;
- draft é recuperado após reabrir a tela;
- falha de transação não deixa registros parciais.

## 10. Fora desta decisão

Não fazem parte da implementação desta fatia:

- banco online ou autenticação;
- sincronização e outbox;
- receitas e refeições prontas;
- avaliações físicas;
- arquivo mestre `.nutridiet`;
- refatoração visual não necessária para conectar o fluxo;
- migração de todos os stores antigos de uma só vez.

Esses temas deverão receber decisões próprias e reutilizar os contratos
estabelecidos aqui.
