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
depois do sucesso, o draft local é removido.

## 2. Contratos que não podem mudar durante a execução

### 2.1 Draft local

`DietDraft` é um documento local identificado por:

- `draftId` ou chave composta por `patientId` e `dietaId`;
- `accountId` da Conta proprietária;
- `patientId`;
- `dietaId`, usando `nova` para uma nova dieta;
- payload completo do editor;
- `baseDietId` e versão esperada opcionais quando o draft edita uma dieta
  vigente;
- `updatedAt` em ISO.

O draft é armazenado somente por `DietDraftStore`, preferencialmente em
IndexedDB. O contrato precisa oferecer leitura, gravação, autosave e descarte.
Ele não é uma linha do histórico, uma relação canônica do paciente ou uma fila
implícita de sincronização.

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

Uma falha no backend mantém o `LOCAL_DRAFT` e não altera a dieta confirmada.
Uma falha no IndexedDB não pode produzir confirmação de autosave ou de
salvamento local.

## 3. Fases de execução

Cada fase deve ser concluída e validada antes da seguinte. A ordem reduz o
risco de misturar estado de apresentação, draft e persistência confirmada.

### Fase 0 — Contratos e fixtures

- congelar os tipos de `DietDraft`, `DietPlan`, estados e erros tipados;
- definir as portas `DietDraftStore`, `DietRepository` e `TransactionRunner`;
- definir a chave do draft e a política para drafts de nova dieta e de edição
  da dieta vigente;
- criar fixtures de dieta simples, ciclo de carboidratos, dieta vigente,
  snapshot e draft local;
- registrar explicitamente que o storage legado de dietas confirmadas contém
  apenas dados de teste e será descartado, sem adaptador de migração.

**Saída:** contratos compiláveis e fixtures, sem mudança de comportamento da
interface.

### Fase 1 — `DietDraftStore` local

- criar o banco IndexedDB versionado e o object store de drafts;
- implementar `create`, `get`, `put`, `delete` e, se necessário, `listByPatient`;
- garantir isolamento por paciente e dieta;
- armazenar payload completo sem referências mutáveis à dieta de origem;
- tratar indisponibilidade, quota excedida, abort e erro de serialização;
- emitir eventos locais somente para sincronização de drafts, nunca para
  promover dieta ou atualizar histórico;
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
- recuperar o draft ao reabrir a rota no mesmo navegador/dispositivo;
- impedir que o autosave atualize atividade, contagem, histórico ou snapshot;
- garantir que a configuração do ciclo de carboidratos use o mesmo draft local.

**Saída:** adicionar o primeiro alimento altera somente o draft local e o
histórico permanece inalterado.

### Fase 3 — Salvamento explícito

- o botão **Salvar Prescrição** e `Ctrl+S` devem chamar o mesmo caso de uso;
- validar o draft completo antes de abrir a transação;
- para nova dieta, gerar ID definitivo somente no caso de uso e criar o plano
  como `ACTIVE`;
- para edição da dieta vigente, validar `baseDietId` e a versão esperada;
- congelar a dieta vigente anterior como `SNAPSHOT` somente quando uma nova
  dieta for confirmada;
- persistir plano, refeições, itens e snapshots em uma transação atômica;
- garantir no máximo uma dieta `ACTIVE` por paciente;
- remover o draft local somente depois do commit confirmado;
- preservar o draft e informar erro recuperável se a transação falhar;
- impedir duplo salvamento por idempotência e estado de envio.

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
- falha do backend mantém o draft local;
- sucesso remove o draft local somente depois do commit;
- conflito de versão não sobrescreve a dieta confirmada;
- cópia não compartilha IDs nem referências com a origem.

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
5. sucesso remove o draft e falha o preserva;
6. snapshots são imutáveis e a vigente é única por paciente;
7. descarte do legado não mantém fontes concorrentes;
8. testes de unidade, integração e interface da matriz passam;
9. documentação das Decisões 01–03 e deste plano continua consistente;
10. qualquer exceção restante está registrada como nova decisão de domínio.

## 7. Fora deste plano

- sincronização de drafts entre dispositivos;
- colaboração simultânea entre usuários;
- autenticação, autorização e escolha do provedor online;
- outbox, filas e sincronização automática de dietas confirmadas;
- migração de receitas, refeições prontas e avaliações;
- exportação/importação do arquivo mestre;
- mudanças visuais não necessárias para o contrato de persistência.
