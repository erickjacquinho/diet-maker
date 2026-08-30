# Plano de Execução e Validação da Arquitetura de Dietas

- **Status:** Planejamento consolidado; execução não iniciada
- **Data:** 2026-08-29
- **Escopo:** Sequência de implementação da separação entre drafts locais e
  dietas confirmadas
- **Documentos-base:** [Decisão 01](./01-fluxo-paciente-dieta.md),
  [Decisão 02](./02-ciclo-de-vida-e-persistencia-do-paciente.md) e
  [Decisão 03](./03-contrato-de-interacao-da-tela-de-pacientes.md)

## 1. Objetivo

Este documento organiza a execução futura da arquitetura já aprovada. Ele não
autoriza implementação por si só; serve como checklist de trabalho e como
critério para confirmar que cada etapa respeita os contratos de domínio.

O resultado esperado é:

```text
Editor de dieta
      │
      ▼
Casos de uso
      ├──────────────► DietDraftStore ──► IndexedDB do navegador
      │                  (Em Criação, local)
      │
      └──────────────► DietRepository ──► backend/banco
                         (Vigente e Histórico, confirmados)
```

O primeiro alimento, alterações de formulário e autosave não podem criar ou
atualizar uma dieta confirmada. Somente **Salvar** persiste no backend/banco;
depois do commit, somente a revisão confirmada é removida pelo protocolo da
Decisão 01, seção 6.

## 2. Contratos que não podem mudar durante a execução

### 2.1 Draft local

`DietDraft` é um documento local com:

- `draftId`, `accountId` e `patientId`;
- contexto de rota `dietaId`, usando `nova` enquanto a dieta não foi salva;
- payload completo do editor e `draftRevision` para ordenar gravações;
- `baseDietId` e `baseDietVersion` quando edita uma vigente;
- `targetDietId`, reservado pelo caso de uso no primeiro pedido de salvamento
  de uma nova dieta e reutilizado em novas tentativas;
- `updatedAt` em ISO.

O draft é armazenado somente por `DietDraftStore` em IndexedDB. O contrato
oferece leitura, gravação, autosave e descarte, com isolamento por Conta,
paciente e dieta. Não é uma linha do histórico nem uma fila de sincronização.

Não guardar gerações de base, hashes de conteúdo ou recibos de operação.
Antes de restaurar um backup, os drafts pendentes precisam ser resolvidos
explicitamente, conforme a Decisão 11.

### 2.2 Dieta confirmada

`DietPlan`, suas refeições, itens e snapshots são persistidos somente pelo
`DietRepository` no backend/banco. Os únicos estados persistidos são:

- `ACTIVE` / **Vigente**;
- `SNAPSHOT` / **Histórico**.

`IN_CREATION` não deve existir no modelo persistido. **Em Criação** é apenas o
rótulo de um draft local.

### 2.3 Regra de transição

```text
LOCAL_DRAFT ── Salvar explícito bem-sucedido ──► ACTIVE
LOCAL_DRAFT ── Descartar ──► removido do IndexedDB
ACTIVE ── Nova dieta salva ──► SNAPSHOT
SNAPSHOT ── edição direta ──► bloqueada
```

Uma falha com rollback confirmado mantém o `LOCAL_DRAFT` e não altera a dieta
confirmada. Resultado desconhecido e falha de limpeza após commit seguem a
[Decisão 01, seção 6](./01-fluxo-paciente-dieta.md#6-fluxo-de-gravação).
Uma falha no IndexedDB não pode produzir confirmação de autosave ou de
salvamento local.

## 3. Fases de execução

Este plano detalha o SDD de dietas na divisão da Decisão 14; suas fases abaixo
não exigem SDDs separados. A
prova técnica da Decisão 10 e o banco canônico com suas migrations são
pré-requisitos da integração. Cada fase abaixo é validada antes da seguinte;
nenhuma fase presume fallback para o storage legado.

### Fase 0 — Contratos e fixtures

- congelar os tipos de `DietDraft`, `DietPlan`, estados e erros tipados;
- definir as portas `DietDraftStore`, `DietRepository` e `TransactionRunner`;
- definir a chave do draft e a política para drafts de nova dieta e de edição
  da dieta vigente;
- tipar revisão do draft, versão esperada e erros necessários ao salvamento;
- criar fixtures de dieta simples, ciclo de carboidratos, dieta vigente,
  snapshot e draft local;
- registrar explicitamente que o storage legado de dietas confirmadas contém
  apenas dados de teste e será descartado, sem adaptador de migração.

**Saída:** contratos compiláveis e fixtures, sem mudança de comportamento da
interface.

### Fase 1 — `DietDraftStore` local

- criar o banco IndexedDB versionado e o object store de drafts;
- implementar `create`, `get`, `put`, `delete` e, se necessário, `listByPatient`;
- garantir isolamento por Conta, paciente e dieta;
- serializar gravações por draft e rejeitar revisão antiga; descarte cancela
  gravações pendentes e impede sua recriação por callbacks atrasados;
- armazenar payload completo sem referências mutáveis à dieta de origem;
- tratar indisponibilidade, quota excedida, abort e erro de serialização;
- atualizar o estado da aba ativa sem promover dieta ou alterar histórico;
  não criar sincronização de drafts entre abas;
- não introduzir `localStorage` como fallback de draft.

**Saída:** o draft pode ser criado, recuperado, atualizado e descartado sem
qualquer escrita no repositório de dietas confirmadas.

### Fase 2 — Carregamento e autosave do editor

- abrir `/dieta/nova` carregando o draft local, quando existir;
- criar o draft local sem criar `DietPlan` persistido;
- carregar dietas existentes do `DietRepository` somente para edição da última
  dieta autorizada;
- ao mudar modo, metas, refeições, alimentos, quantidades ou variações,
  atualizar estado do editor e autosalvar somente no `DietDraftStore`;
- usar debounce para reduzir operações no IndexedDB;
- drenar a fila ao salvar ou navegar dentro da aplicação; indicar alterações
  ainda não persistidas. Fechamento abrupto antes da confirmação do autosave
  pode perder essas alterações e não pode ser coberto por promessa de perda zero;
- recuperar o draft ao reabrir a rota no mesmo navegador/dispositivo;
- impedir que o autosave atualize atividade, contagem, histórico ou snapshot;
- garantir que a configuração do ciclo de carboidratos use o mesmo draft local.

**Saída:** adicionar o primeiro alimento altera somente o draft local e o
histórico permanece inalterado.

### Fase 3 — Salvamento explícito

- o botão **Salvar Prescrição** e `Ctrl+S` devem chamar o mesmo caso de uso;
- capturar e persistir o último estado visível antes de abrir a transação,
  seguindo integralmente o protocolo da Decisão 01, seção 6;
- para nova dieta, reservar o ID definitivo no draft pelo caso de uso antes
  da primeira transação e reutilizá-lo nas tentativas; criar como `ACTIVE`;
- para edição da dieta vigente, validar `baseDietId` e a versão esperada;
- congelar a dieta vigente anterior como `SNAPSHOT` somente quando uma nova
  dieta for confirmada;
- persistir plano, refeições, itens e snapshots em uma transação atômica;
- garantir no máximo uma dieta `ACTIVE` por paciente;
- remover somente a revisão confirmada do draft depois do commit durável;
- preservar o draft e informar erro recuperável se a transação falhar;
- impedir duplo salvamento por ID estável, versão esperada e estado de envio;
- conferir a dieta pelo ID após resultado incerto antes de repetir; falha de
  limpeza não repete o commit.

**Saída:** uma dieta só aparece no histórico depois do salvamento confirmado;
uma nova dieta torna-se a única vigente.

### Fase 4 — Histórico, cópia e descarte

- `listPatientDietHistory` consulta apenas dietas confirmadas;
- linhas do histórico exibem somente **Vigente** e **Histórico**;
- fontes de **Puxar informações** vêm do backend/banco e excluem drafts;
- cópia profunda cria um novo draft com novos IDs de refeições e itens;
- **Em Criação** pode ser descartada com confirmação, removendo somente o
  draft local;
- dieta vigente e snapshots não podem ser apagados pelo fluxo normal;
- histórico não pode criar draft ao abrir um snapshot em modo somente leitura;
- o perfil pode oferecer **Retomar rascunho** separadamente do histórico.

**Saída:** nenhuma operação de apresentação ou descarte local destrói uma
prescrição confirmada.

### Fase 5 — Descarte do armazenamento legado de teste

- descartar os registros atuais em `localStorage`, pois são dados de teste;
- iniciar o banco canônico sem conversão, IDs legados ou adaptador de leitura;
- excluir estados legados de criação das consultas de histórico;
- impedir qualquer gravação simultânea no modelo antigo e no modelo novo;
- remover acessos diretos de componentes ao storage legado;
- validar que a aplicação reinicializada não encontra fontes concorrentes.

**Saída:** existe uma única fonte canônica para dietas confirmadas e uma única
fonte local para drafts.

## 4. Matriz de validação

| Cenário | Deve gravar IndexedDB | Deve gravar backend/banco | Resultado esperado |
| --- | ---: | ---: | --- |
| Abrir nova dieta | Opcional/cria draft | Não | Editor disponível; histórico inalterado |
| Adicionar primeiro alimento | Sim | Não | Draft **Em Criação** local |
| Autosave de alteração | Sim | Não | Draft atualizado; sem atividade clínica |
| Reabrir no mesmo dispositivo | Leitura | Não | Draft recuperado |
| Puxar dieta anterior | Sim | Leitura | Novo draft; origem intacta |
| Descartar **Em Criação** | Exclusão | Não | Draft removido; histórico intacto |
| Salvar nova dieta com sucesso | Exclusão após commit | Sim, transação | Nova **Vigente**; anterior vira **Histórico** |
| Falha ao salvar no backend | Preservado | Rollback | Nenhuma dieta parcial; retry disponível |
| Abrir snapshot | Não | Leitura | Somente leitura; sem novo draft |
| Salvar edição da vigente | Exclusão após commit | Sim, com versão | Vigente atualizada; conflito explícito se necessário |
| Salvar antes do debounce | Concluir revisão pendente | Sim, transação | Último valor do editor confirmado |
| Interrupção após commit | Preservado para conferência | Consultar pelo ID estável | Não reenviar automaticamente nem duplicar dieta |
| Falha só na limpeza local | Limpeza pendente | Já confirmado | Informar sucesso clínico e repetir apenas limpeza |
| Autosave antigo após descarte | Rejeitado | Não | Draft não reaparece |
| Abrir segunda aba | Não | Não | Bloqueio antes de abrir o banco |

## 5. Testes obrigatórios antes de considerar a arquitetura executada

### 5.1 Unidade

- chave e isolamento de drafts por paciente/dieta;
- normalização e cópia profunda do payload;
- `DietDraftStore` cria, lê, atualiza e remove drafts;
- falhas de IndexedDB são propagadas como erro tipado;
- estados persistidos nunca aceitam `IN_CREATION`.

### 5.2 Integração

- primeiro alimento não chama `DietRepository`;
- autosave não chama `DietRepository` nem `recordPatientActivity`;
- salvamento explícito chama o repositório uma única vez;
- transação demove a vigente anterior e cria snapshot sem registros parciais;
- rollback confirmado mantém o draft local;
- sucesso remove somente a revisão confirmada do draft depois do commit;
- conflito de versão não sobrescreve a dieta confirmada;
- cópia não compartilha IDs nem referências com a origem.
- salvar antes do debounce não perde o último input;
- envio repetido reutiliza o ID e respeita a versão esperada;
- limpeza local com falha não repete o salvamento;
- resultado incerto exige conferência antes de uma nova tentativa.

### 5.3 Interface

- histórico não mostra drafts, inclusive drafts com alimentos;
- labels exibem **Vigente**, **Histórico** e **Em Criação** nos contextos
  corretos;
- descarte local exige confirmação e não faz chamada ao backend;
- erro de autosave ou salvamento não mostra sucesso falso;
- `Ctrl+S` e botão **Salvar Prescrição** têm o mesmo comportamento;
- navegação após salvar ocorre somente após confirmação do backend.

## 6. Critérios de encerramento

A execução só pode ser considerada concluída quando todos os itens forem
verdadeiros:

1. nenhuma página ou componente acessa diretamente IndexedDB ou o storage de
   dietas confirmadas;
2. `Em Criação` não existe como `DietPlan` persistido;
3. primeiro alimento e autosave não alteram histórico, atividade ou vigência;
4. somente **Salvar** cria ou atualiza dieta confirmada;
5. sucesso remove somente a revisão confirmada; rollback, resultado
   desconhecido e limpeza pendente respeitam a Decisão 01;
6. snapshots históricos são somente leitura, independentes do catálogo, e a
   vigente é única por paciente e editável apenas por salvamento explícito;
7. descarte do legado não mantém fontes concorrentes;
8. testes de unidade, integração e interface da matriz passam;
9. documentação das Decisões 01–14 e deste plano continua consistente;
10. qualquer exceção restante está registrada como nova decisão de domínio.

## 7. Fora deste plano

- sincronização de drafts entre dispositivos;
- colaboração simultânea entre usuários;
- autenticação, autorização e escolha do provedor online;
- outbox, filas e sincronização automática de dietas confirmadas;
- migração de receitas, refeições prontas e avaliações;
- exportação/importação do arquivo mestre;
- mudanças visuais não necessárias para o contrato de persistência.
