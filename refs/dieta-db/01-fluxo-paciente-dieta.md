# Decisão 01 — Fluxo de Paciente e Dieta

- **Status:** Aprovado pelo usuário para especificação; implementação pendente de revisão final
- **Data:** 2026-08-29
- **Escopo:** Primeiro fluxo vertical da arquitetura offline-first

## 1. Objetivo

Estruturar o fluxo principal do NutriDiet com uma separação explícita entre o
rascunho local e a prescrição clínica persistida. Enquanto a dieta está **Em
Criação**, ela existe somente no navegador, preferencialmente em IndexedDB. O
backend/banco só recebe uma dieta quando o nutricionista aciona **Salvar**.

O primeiro fluxo cobre:

`Paciente → Nova dieta → Puxar informações → Adicionar alimentos → Salvar → Histórico`

Ficam fora desta decisão as avaliações físicas, receitas, refeições prontas,
exportação do arquivo mestre e sincronização online. Elas deverão consumir os
mesmos princípios quando forem abordadas.

## 2. Regras funcionais congeladas

### 2.1 Criação

1. O paciente precisa existir antes da criação da dieta.
2. A criação começa em `/pacientes/[id]/dieta/nova`.
3. Ao abrir a criação, o sistema cria ou recupera um `DietDraft` local no
   navegador; isso não cria `DietPlan`, refeição, item ou snapshot no
   backend/banco.
4. Uma dieta **Em Criação** é o rótulo de um draft local. Ela não aparece no
   histórico, mesmo depois de receber alimentos.
5. Adicionar o primeiro alimento e as alterações seguintes atualizam somente o
   draft local e podem ser recuperados no mesmo navegador/dispositivo.
6. Uma dieta **Em Criação** é editável, pode ser retomada e é protegida por
   autosave local em IndexedDB.
7. Somente a ação explícita **Salvar** envia o conteúdo ao backend/banco e
   transforma a dieta em **Vigente**.

### 2.2 Recuperação de dietas anteriores

1. A ação existente **Puxar informações das dietas anteriores** será mantida.
2. A lista de origem consulta somente dietas persistidas no backend/banco e
   exclui drafts locais **Em Criação**.
3. A fonte pode ser uma dieta vigente ou um snapshot histórico persistido.
4. O nutricionista pode puxar apenas metas/macros ou a dieta completa,
   incluindo refeições, alimentos, quantidades e dados necessários para a
   edição.
5. A operação sempre cria ou atualiza um novo draft local. Ela não altera a
   dieta de origem, reutiliza seus identificadores nem cria uma referência
   mutável para ela.
6. A nova dieta começa como **Em Criação** e só entra no histórico depois do
   salvamento explícito.

### 2.3 Vigência e histórico

1. Existe no máximo uma dieta **Vigente** persistida por paciente.
2. O botão de salvamento explícito é a única ação que persiste uma dieta nova
   ou uma edição da dieta vigente e a torna **Vigente**.
3. Quando uma nova dieta é salva ativamente, a dieta vigente anterior deixa de
   ser vigente e passa a ser um snapshot histórico somente leitura.
4. Dietas históricas não podem ser editadas diretamente.
5. A última dieta do paciente é a única dieta que pode ser editada diretamente.
6. Para usar uma dieta histórica como base, o nutricionista retorna a
   `/dieta/nova` e usa **Puxar informações**.
7. O histórico do paciente consulta somente `DietPlan` persistidos no
   backend/banco; um `DietDraft` local nunca é uma linha do histórico.

### 2.4 Rascunho durante a edição

O editor mantém um `DietDraft` local separado da última versão confirmada:

- o draft é armazenado por `DietDraftStore`, preferencialmente em IndexedDB;
- alterações durante a digitação, inclusive o primeiro alimento, são salvas
  automaticamente somente nesse draft local;
- fechar ou reabrir a tela pode recuperar o draft no mesmo navegador/dispositivo;
- o autosave nunca chama o `DietRepository`, não altera a dieta vigente e não
  cria `DietPlan`, snapshot ou histórico;
- somente **Salvar** valida o draft e aplica a versão ao registro canônico no
  backend/banco;
- depois da confirmação bem-sucedida do backend, o draft local é removido;
- se o salvamento falhar, o draft local permanece disponível para tentar de
  novo e nenhuma confirmação falsa pode ser exibida;
- descartar uma dieta **Em Criação** remove somente o draft local, mediante
  confirmação, sem alterar o backend/banco.

Um draft de uma nova dieta não possui `DietPlan` persistido. Um draft criado a
partir da dieta vigente pode guardar `baseDietId` e a versão esperada apenas
para detectar conflito no salvamento; isso não transforma o draft em uma
entidade persistida.

## 3. Modelo de estados

Os estados exibidos ao usuário combinam um draft local com os estados
persistidos no backend/banco:

```text
Editor de nova dieta
    │ criar/recuperar draft local
    ▼
Em Criação (somente IndexedDB)
    │ primeiro alimento / autosave local
    └───────────────┐
                    │ Salvar explícito
                    ▼
              transação no backend
                    │ sucesso
                    ▼
Vigente (backend) ── edição/autosave ──► draft local
    │                                      │
    └──────────────── Salvar ◄────────────┘
    │ nova dieta salva
    ▼
Snapshot histórico (backend, somente leitura)
```

Uma dieta histórica não retorna ao estado editável. A única forma de usá-la é
criar um draft local por meio de **Puxar informações**.

## 4. Limites arquiteturais

```text
Página / componente
        ↓
Hook do fluxo
        ↓
Caso de uso da aplicação
        ├───────────────→ DietDraftStore → IndexedDB do navegador
        └───────────────→ DietRepository  → backend/banco
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
- `autosaveDietDraft`;
- `listPreviousDietSources`;
- `pullDietTargets`;
- `pullCompleteDiet`;
- `addFoodToMeal`;
- `saveDietAsActive`;
- `discardDietDraft`;
- `listPatientDietHistory`;
- `getDietSnapshot`.

Os casos de uso validam o estado da dieta e orquestram as fronteiras de
persistência. `createDietDraft`, `resumeDietDraft`, `autosaveDietDraft`,
`addFoodToMeal` e `discardDietDraft` operam no `DietDraftStore` local.
`saveDietAsActive`, `listPatientDietHistory` e `getDietSnapshot` usam o
`DietRepository` do backend/banco. A UI não deve duplicar essas regras.

### 4.3 Portas de persistência

O primeiro fluxo precisa de contratos equivalentes a:

- `PatientRepository`;
- `DietRepository` — leitura e persistência de dietas confirmadas no
  backend/banco;
- `DietDraftStore` — criação, leitura, autosave e descarte de drafts locais em
  IndexedDB;
- `FoodCatalogRepository`;
- `TransactionRunner`.

O `DietDraftStore` não é uma fila implícita de gravação clínica e não deve
sincronizar drafts automaticamente nesta decisão. O `DietRepository` é a única
porta para persistir dietas confirmadas. Nenhum componente importa IndexedDB,
Supabase ou outro provedor de banco.

## 5. Modelo conceitual dos dados

O modelo deve ser relacional, mesmo enquanto o aplicativo funciona offline:

- **Patient:** cadastro e identidade do paciente;
- **DietPlan:** dono, datas, estado e metadados de uma dieta confirmada,
  persistida no backend/banco;
- **DietMeal:** refeição pertencente ao plano, com nome e horário;
- **DietMealItem:** alimento, quantidade, ordem, substituições e valores
  nutricionais usados no plano;
- **DietItemSnapshot:** nome, unidade, macros e kcal congelados no momento da
  prescrição;
- **DietDraft:** documento local em IndexedDB, com `draftId`, `patientId`,
  payload da dieta, `baseDietId` opcional, versão esperada e timestamp. Não é
  uma relação persistida de `Patient` até o salvamento explícito.

O alimento mestre pode mudar. Os valores usados dentro de uma dieta salva não
podem mudar retroativamente: o item prescrito carrega seu snapshot nutricional.

A unicidade de dieta vigente por paciente deve ser garantida em transação, e
não apenas pela interface. A alteração de estado deve impedir uma situação em
que duas dietas sejam vigentes simultaneamente.

## 6. Fluxo de gravação

### 6.1 Primeiro alimento e autosave local

1. Validar paciente, refeição e alimento no caso de uso.
2. Criar ou recuperar o `DietDraft` local no IndexedDB.
3. Atualizar o payload local com a refeição e o alimento; não criar
   `DietPlan`, `DietMeal`, `DietMealItem` ou snapshot no backend/banco.
4. Confirmar o autosave no `DietDraftStore` local e manter a dieta fora do
   histórico.
5. Se o armazenamento local falhar, informar que o draft não foi salvo e não
   apresentar confirmação de persistência clínica.

### 6.2 Salvamento ativo

1. Carregar o draft local e validar o plano completo e seus itens.
2. Abrir uma transação no backend/banco somente após a ação explícita
   **Salvar**.
3. Para uma nova dieta, criar `DietPlan` como **Vigente**. Para uma edição da
   dieta vigente, validar `baseDietId` e a versão esperada antes de atualizar o
   plano.
4. Se houver dieta vigente anterior diferente da dieta salva, congelá-la como
   snapshot histórico.
5. Gravar a dieta atual, refeições, itens e snapshots nutricionais.
6. Garantir que apenas essa dieta esteja vigente para o paciente.
7. Confirmar a transação.
8. Somente após o sucesso confirmado, remover o draft local do IndexedDB.
9. Atualizar o histórico e retornar à tela do paciente, conforme o fluxo atual.

Uma falha antes da confirmação deve deixar a base no estado anterior, sem dieta
parcialmente vigente ou histórico incompleto, e deve manter o draft local para
uma nova tentativa.

## 7. Proteções e erros

- Dietas históricas devem ser rejeitadas também no caso de uso e no repositório,
  não apenas desabilitadas na UI.
- A operação de puxar informações deve fazer cópia profunda e gerar novos IDs.
- Datas persistidas devem usar formato ISO; formatação local pertence à UI.
- Conflito entre draft e versão confirmada deve ser detectado por versão ou
  timestamp, nunca resolvido silenciosamente.
- Indisponibilidade do IndexedDB ou do backend deve produzir feedback explícito
  e impedir que o usuário receba uma falsa confirmação de salvamento.
- Todas as gravações de dieta devem ser idempotentes quando repetidas com a
  mesma operação e versão.

## 8. Guardrails obrigatórios

1. Nenhum componente ou página acessa diretamente a persistência.
2. Drafts de dieta usam IndexedDB por meio de `DietDraftStore`; não usar
   `localStorage` como armazenamento de draft.
3. Toda mutação passa por um caso de uso nomeado.
4. Nenhuma tela calcula ou decide estado de vigência por conta própria.
5. O primeiro alimento e o autosave nunca chamam o `DietRepository`.
6. Somente **Salvar** pode criar ou atualizar `DietPlan` no backend/banco.
7. Histórico e snapshots são somente leitura depois de congelados.
8. IDs são gerados na camada de domínio/aplicação, nunca pela UI.
9. Datas internas são ISO e nunca strings formatadas em `pt-BR`.
10. Mudança de schema exige migration, atualização do contrato de exportação e
   teste de regressão.
11. Componentes não importam IndexedDB, `localStorage` ou o provedor de banco.
12. Após sucesso do backend, o draft local deve ser removido; em caso de erro,
    deve ser preservado.
13. O legado atual de `localStorage` deve ser tratado como fonte de migração,
    não como novo modelo de domínio.

## 9. Validação do primeiro fluxo

Antes de migrar outro módulo, este fluxo precisa comprovar:

- criação de paciente e abertura de nova dieta;
- abrir uma nova dieta cria apenas um draft local;
- adicionar o primeiro alimento grava somente no IndexedDB e não altera o
  histórico;
- autosave não cria `DietPlan`, snapshot ou dieta vigente;
- drafts **Em Criação** são excluídos das fontes de cópia e do histórico;
- puxar metas cria uma nova dieta sem alterar a origem;
- puxar a dieta completa gera novos IDs;
- salvar explicitamente persiste a dieta e a torna a única vigente;
- após o salvamento confirmado, o draft local é removido;
- falha no salvamento mantém o draft e não altera o backend;
- descartar **Em Criação** remove somente o draft local;
- a vigente anterior permanece íntegra como snapshot;
- dieta histórica abre somente para leitura;
- draft é recuperado após reabrir a tela;
- falha de transação não deixa registros parciais.

## 10. Fora desta decisão

Não fazem parte da implementação desta fatia:

- banco online ou autenticação;
- sincronização de drafts locais entre dispositivos;
- sincronização e outbox;
- receitas e refeições prontas;
- avaliações físicas;
- arquivo mestre `.nutridiet`;
- refatoração visual não necessária para conectar o fluxo;
- migração de todos os stores antigos de uma só vez.

Esses temas deverão receber decisões próprias e reutilizar os contratos
estabelecidos aqui.
