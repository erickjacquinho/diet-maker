# Decisão 01 — Fluxo de Paciente e Dieta

- **Status:** Aprovado pelo usuário para especificação; implementação pendente de revisão final
- **Data:** 2026-08-29
- **Escopo:** Primeiro fluxo vertical da arquitetura offline-first

## 1. Objetivo

Estruturar o fluxo principal do NutriDiet com uma separação explícita entre o
rascunho local e a prescrição clínica persistida. Enquanto a dieta está **Em
Criação**, ela existe somente no navegador, em IndexedDB. O
backend/banco só recebe uma dieta quando o nutricionista aciona **Salvar**.

O primeiro fluxo cobre:

`Paciente → Nova dieta → Puxar informações → Adicionar alimentos → Salvar → Histórico`

Ficam fora do fluxo vertical desta decisão as avaliações físicas, receitas,
refeições prontas, exportação do arquivo mestre e sincronização online. As
fronteiras de backend e os contratos de catálogo são definidos nas Decisões
[05](./05-arquitetura-backend-e-escopos-de-dados.md) a
[08](./08-snapshots-versionamento-e-integridade-clinica.md), sem depender de
telas específicas.

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

- o draft é armazenado por `DietDraftStore` em IndexedDB;
- alterações durante a digitação, inclusive o primeiro alimento, são salvas
  automaticamente somente nesse draft local;
- fechar ou reabrir a tela pode recuperar o draft no mesmo navegador/dispositivo;
- o autosave nunca chama o `DietRepository`, não altera a dieta vigente e não
  cria `DietPlan`, snapshot ou histórico;
- somente **Salvar** valida o draft e aplica a versão ao registro canônico no
  backend/banco;
- depois da confirmação durável do backend, somente a revisão confirmada do
  draft é removida, conforme o protocolo da seção 6;
- falha anterior ao commit preserva o draft; resultado desconhecido exige
  conferência da dieta pelo ID, sem afirmar sucesso ou rollback sem evidência;
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
  persistida no backend/banco, sempre dentro de uma Conta e de um Paciente;
- **DietMeal:** refeição pertencente ao plano, com nome e horário;
- **DietMealItem:** alimento, quantidade, ordem, substituições e valores
  nutricionais usados no plano;
- **DietItemSnapshot:** nome, unidade, macros e kcal congelados no momento da
  prescrição;
- **DietDraft:** documento local em IndexedDB, com `draftId`, `accountId`, `patientId`,
  `draftRevision`, payload, `baseDietId` e `baseDietVersion` opcionais,
  `targetDietId` reservado no primeiro salvamento e timestamp. Não é
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

1. Suspender a edição e desabilitar novos envios enquanto salva. Concluir os
   autosaves pendentes e capturar o último valor do editor, mesmo se o usuário
   clicar em **Salvar** antes do debounce.
2. Persistir a revisão capturada no draft. Para nova dieta, o caso de uso
   reserva `targetDietId` uma única vez e o guarda no draft antes da transação;
   novas tentativas reutilizam esse ID. Reservar o ID não cria uma dieta.
3. Validar Conta, paciente ativo, plano e snapshots. Abrir a transação apenas
   após **Salvar**. Para edição, exigir que `baseDietId` ainda seja vigente e
   corresponda a `baseDietVersion`.
4. Para nova dieta, conferir se o ID reservado já foi salvo antes de criar
   qualquer registro. Se já existir, conferir o resultado; nunca gerar outra
   dieta automaticamente para contornar a tentativa anterior.
5. Na mesma transação, demover a vigente anterior quando houver nova dieta e
   gravar plano, refeições, itens e snapshots, garantindo uma única vigente.
6. Aguardar o commit e a confirmação de persistência do adaptador.
7. Remover somente o draft/revisão confirmados. Autosaves antigos não podem
   recriar o draft salvo ou descartado.
8. Atualizar o histórico e retornar à tela do paciente. Uma falha só na
   limpeza local não desfaz o salvamento confirmado.

A V1 usa uma única aba ativa, conforme a Decisão 10. Não criar tabela de
recibos, log de operações, hash de conteúdo ou protocolo genérico de retry.
ID estável, versão esperada e bloqueio de envio são as proteções do fluxo.

### 6.3 Tratamento de falhas

| Situação | Comportamento |
| --- | --- |
| Erro com rollback confirmado | Preservar o draft e informar que a prescrição não foi salva |
| Interrupção sem resultado confirmado | Reabrir a base e conferir a dieta pelo ID estável antes de repetir; preservar o draft e não reenviar automaticamente |
| Commit confirmado e erro na limpeza | Informar que a prescrição foi salva e repetir somente a limpeza |
| Draft desatualizado | Preservar o conteúdo e exigir conferência, sem sobrescrever a dieta atual |

Se a leitura não permitir confirmar o resultado após uma interrupção, manter
o rascunho disponível para conferência e não anunciar sucesso ou rollback.
Não há transação única entre o banco relacional e o armazenamento de drafts.

**Justificativa:** essas regras evitam perda do último input, duplicação de
dietas e descarte prematuro do draft sem construir um sistema adicional de
coordenação e recuperação de operações.

## 7. Proteções e erros

- Dietas históricas devem ser rejeitadas também no caso de uso e no repositório,
  não apenas desabilitadas na UI.
- A operação de puxar informações deve fazer cópia profunda e gerar novos IDs.
- Datas persistidas devem usar formato ISO; formatação local pertence à UI.
- Conflito entre draft e versão confirmada deve ser detectado por versão
  monotônica; timestamp é informativo, não controle de concorrência.
- Indisponibilidade do IndexedDB ou do backend deve produzir feedback explícito
  e impedir que o usuário receba uma falsa confirmação de salvamento.
- Repetir um envio não pode duplicar dietas nem ignorar a versão esperada;
  aplicar as regras da seção 6, sem criar outra identidade de operação.

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
12. Remover somente a revisão confirmada; distinguir rollback, resultado
    desconhecido e limpeza pendente conforme a seção 6.3.
13. O `localStorage` atual contém somente dados de teste e deve ser descartado
    antes da implantação; ele não é fonte de migração nem modelo de domínio.

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
- após o salvamento confirmado, somente a revisão confirmada do draft é removida;
- rollback confirmado mantém o draft e não altera os dados clínicos;
- descartar **Em Criação** remove somente o draft local;
- a vigente anterior permanece íntegra como snapshot;
- dieta histórica abre somente para leitura;
- draft é recuperado após reabrir a tela;
- falha de transação não deixa registros parciais.
- salvar antes do debounce confirma o último valor visível;
- autosave antigo não recria um draft salvo ou descartado;
- interrupção após commit exige conferir o ID estável antes de uma nova tentativa;
- falha de limpeza não é apresentada como falha do salvamento clínico.

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
