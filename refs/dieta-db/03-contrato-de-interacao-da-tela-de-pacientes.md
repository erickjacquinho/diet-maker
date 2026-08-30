# Decisão 03 — Contrato de Interação da Tela de Pacientes

- **Status:** Aprovado para especificação; pendente de revisão final do usuário
- **Data:** 2026-08-29
- **Escopo:** `/pacientes`, `/pacientes/[id]` e modais diretamente ligados a essas telas

## 1. Objetivo

Descrever o comportamento observável de todos os botões, links, modais, estados
de formulário e transições do fluxo de pacientes. A interface deve executar
casos de uso da aplicação, nunca gravar dados diretamente.

Este documento complementa:

- [Decisão 01 — Fluxo de Paciente e Dieta](./01-fluxo-paciente-dieta.md);
- [Decisão 02 — Ciclo de Vida e Persistência do Paciente](./02-ciclo-de-vida-e-persistencia-do-paciente.md).

## 2. Estados visíveis

### 2.1 Paciente

| Estado | Comportamento |
| --- | --- |
| Ativo | Aparece na lista, pode abrir o perfil e receber operações clínicas |
| Arquivado | Fica fora da lista ativa e não aceita novas operações clínicas |
| Não encontrado | Exibe erro de contexto e link para `/pacientes` |
| Carregando | Exibe estado de carregamento sem confirmar ausência de dados |

### 2.2 Dieta

| Estado/origem | Rótulo na interface | Armazenamento | Pode editar? | Pode ser fonte de cópia? | Aparece no histórico? |
| --- | --- | --- | --- | --- | --- |
| `LOCAL_DRAFT` | Em Criação | IndexedDB do navegador | Sim | Não | Não |
| `ACTIVE` | Vigente | Backend/banco | Sim, se for a última | Sim | Sim |
| `SNAPSHOT` | Histórico | Backend/banco | Não | Sim | Sim |

`Em Criação` é um estado de apresentação do `DietDraft` local, não um estado
persistido de `DietPlan`. O código atual que exibe `Ativa`/`Histórica` deve ser
adaptado para os rótulos acima, e o estado não pode ser calculado somente no
componente da tabela. A tela não deve consultar drafts pelo `DietRepository`.

## 3. Tela `/pacientes`

### 3.1 Carregamento

1. Ao abrir a tela, consultar `listActivePatients`.
2. Enquanto a consulta estiver pendente, exibir `Carregando pacientes...`.
3. Uma lista vazia deve exibir o estado de primeiro cadastro.
4. Um erro de leitura deve exibir feedback explícito com opção de tentar
   novamente; nunca apresentar a lista vazia como se não houvesse pacientes.

### 3.2 Busca

- O campo filtra por nome e objetivo.
- A filtragem é somente de leitura e não altera a base.
- O contador exibe total filtrado e total geral quando houver filtro.
- Limpar a busca restaura todos os pacientes.
- Nenhum resultado exibe estado próprio e ação **Limpar busca**.
- A busca não dispara gravação nem cria histórico.

### 3.3 Botão `Novo paciente`

1. Abre `CreatePatientModal`.
2. O foco vai para o primeiro campo inválido ou para o nome.
3. O formulário começa com seus valores padrão de interface.
4. O modal não grava nada enquanto o usuário digita.

### 3.4 Modal `CreatePatientModal`

Campos do contrato:

| Campo | Regra |
| --- | --- |
| Nome completo | Obrigatório, não pode ser vazio após normalização |
| WhatsApp | Opcional, normalizado antes do salvamento |
| Idade | Numérico, não negativo e validado pelo domínio |
| Altura | Numérica e positiva quando informada |
| Peso | Numérico e positivo quando informado |
| Gênero | Valor selecionado no catálogo da interface |
| Objetivo | Valor do catálogo de objetivos |
| Proteínas, carboidratos e gorduras | Metas padrão numéricas e não negativas |
| Kcal | Sugestão inicial derivada dos macros; meta manual explícita preservada conforme a [Decisão 06](./06-catalogo-de-alimentos-e-customizados.md) |

Comportamentos:

- **Salvar Paciente** ou `Ctrl+S` valida e chama `createPatient`.
- Em sucesso, fecha o modal, limpa o formulário e atualiza a lista.
- O paciente criado aparece na lista sem exigir recarregamento da página.
- Em erro de validação, o modal permanece aberto e aponta os campos.
- Em erro de persistência, o modal permanece aberto e informa que nada foi
  salvo.
- **Cancelar** fecha o modal, descarta os valores e não cria paciente.
- Reabrir o modal sempre começa com um novo formulário padrão.

### 3.5 Linha do paciente

- Clique na linha abre `/pacientes/[id]`.
- `Enter` ou `Espaço` na linha focada executa a mesma navegação.
- O link do nome mantém o mesmo destino.
- Indicadores de avaliação e dieta exibem informação contextual, mas não são
  botões de gravação.
- A linha nunca deve iniciar uma mutação por clique acidental.

## 4. Perfil `/pacientes/[id]`

### 4.1 Paciente inexistente

Exibir:

- mensagem de paciente não encontrado;
- explicação curta;
- ação **Voltar para Pacientes**;
- nenhum modal ou operação de gravação.

### 4.2 Botão de retorno

**Voltar para Pacientes** navega para `/pacientes` sem alterar dados. Se existir
um formulário com alterações não salvas, o componente responsável deve pedir
confirmação antes de sair.

### 4.3 Botão `WhatsApp`

- Permanece desabilitado sem um número válido.
- Com número válido, abre o endereço externo em nova aba.
- Não grava atividade clínica nem altera o paciente.
- Falha de abertura deve receber feedback local, sem marcar a ação como
  salvamento concluído.

### 4.4 Botão `Editar Cadastro`

1. Abre `EditPatientModal` com cópia temporária do cadastro.
2. Alterações ficam somente no formulário até salvar.
3. **Salvar Alterações** chama `updatePatient` com a versão carregada.
4. Em sucesso, fecha o modal e atualiza perfil, lista e projeções.
5. Em conflito de versão ou erro de persistência, permanece aberto e informa o
   problema.
6. **Cancelar** sem alterações fecha imediatamente.
7. Fechar por `Esc`, clique externo ou botão de fechamento com alterações abre
   **Descartar alterações?**.
8. **Não** retorna ao formulário.
9. **Sim, descartar** fecha e restaura o último estado confirmado.
10. `Ctrl+S` executa o mesmo salvamento do formulário.

### 4.5 `AddObjectiveModal`

Aberto a partir da edição do cadastro:

- **Adicionar** valida o texto, chama `addObjectiveOption` e evita duplicidade;
- o objetivo novo é incluído no catálogo e aplicado ao formulário de paciente;
- o modal de edição permanece aberto;
- o paciente ainda não é atualizado até **Salvar Alterações**;
- **Cancelar** não cria opção nem altera o formulário;
- erro de persistência mantém o modal aberto.

### 4.6 Botão `Excluir Paciente`

O rótulo operacional deve ser ajustado para **Arquivar Paciente**, pois a
operação aprovada é lógica, não destrutiva.

`DeletePatientModal` deve:

- informar que o paciente será arquivado;
- explicar que dietas, avaliações e histórico serão preservados;
- oferecer **Cancelar** sem efeito;
- exigir confirmação prolongada para evitar acionamento acidental;
- chamar `archivePatient` somente após confirmação.

Em sucesso:

1. fechar o modal;
2. invalidar drafts do paciente;
3. preservar os registros relacionados;
4. navegar para `/pacientes`;
5. remover o paciente da lista ativa.

Em erro, o perfil permanece aberto e nenhum filho é alterado.

## 5. Contexto atual do paciente

### 5.1 Próximo acompanhamento

O cartão **Próximo acompanhamento** abre `NextEventModal`.

Sem evento:

- título de criação;
- data obrigatória;
- tipo obrigatório;
- **Salvar** chama `setNextFollowUp`;
- **Cancelar** fecha sem mutação.

Com evento:

- título de edição/reagendamento;
- formulário começa com os valores existentes;
- **Salvar** substitui o evento em uma operação atômica;
- **Remover data** abre confirmação própria;
- confirmar remoção chama `clearNextFollowUp`;
- cancelar remoção mantém o evento.

Em qualquer formulário com alterações, fechar, `Esc` ou clique externo deve
abrir **Descartar alterações?**. O descarte não chama o repositório.

### 5.2 Dieta vigente

O cartão da dieta atual possui:

- **Abrir dieta**: abre a dieta vigente no construtor;
- **Criar plano**: abre `/pacientes/[id]/dieta/nova`;
- resumo de macros: somente leitura;
- estado visual: **Vigente** ou ausência de dieta.

O cartão não pode promover dieta, alterar metas ou gravar por clique no resumo.

## 6. Histórico de dietas

### 6.1 Cabeçalho

- **Nova Dieta** abre `/pacientes/[id]/dieta/nova`.
- O contador consulta somente `DietPlan` persistidos no backend/banco.
- Um draft **Em Criação** não aparece no contador nem no histórico, mesmo depois
  de receber alimentos.
- Se houver um draft local recuperável, a interface pode oferecer **Retomar
  rascunho** separadamente do histórico.

### 6.2 Linha de dieta

Cada linha pode mostrar:

- data persistida e formatada;
- tipo e modo do plano;
- estado `Vigente` ou `Histórico`;
- macros e kcal do snapshot/projeção;
- ações compatíveis com o estado.

Drafts locais **Em Criação** não são linhas do histórico. Quando exibidos como
retomáveis, devem ser identificados como drafts locais e não como dietas
persistidas.

### 6.3 Ações por estado

| Ação | Draft local Em Criação | Vigente (última) | Histórico |
| --- | --- | --- | --- |
| Retomar editor | Permitido | Permitido | Bloqueado; usar cópia |
| Abrir cardápio | Pelo editor local | Permitido | Permitido |
| Editar | Permitido | Permitido | Bloqueado |
| Expandir ciclo | Somente no editor local | Permitido | Permitido |
| Puxar informações | Pode preencher o draft | Não é ação da linha | Disponível via nova dieta |
| Descartar/excluir | Remover draft local com confirmação | Não excluir; substituir ou editar ao salvar | Bloqueado |

Dietas históricas não podem exibir link de edição. O componente atual que
renderiza um link de edição para todas as linhas deve ser alterado.

### 6.4 Abrir cardápio

`ReadOnlyDietModal`:

- apresenta o snapshot completo;
- não possui controles que alterem alimentos, metas ou estado;
- pode ser fechado por botão, `Esc` ou ação equivalente;
- não cria draft;
- não atualiza `updatedAt` nem atividade do paciente.

### 6.5 Expandir ciclo

- disponível apenas quando o plano possui variações;
- altera somente o estado visual de expansão da linha;
- não acessa persistência;
- deve manter a linha acessível por teclado.

### 6.6 Excluir/descartar dieta

Para preservar o histórico clínico, a política aprovada é:

- **Em Criação:** é um draft local e pode ser descartado com confirmação,
  removendo somente o registro do `DietDraftStore`/IndexedDB; nenhuma chamada
  ao backend é feita;
- **Vigente:** não pode ser apagada pelo histórico; deve ser substituída ao
  salvar uma nova dieta ou atualizada ao salvar uma edição autorizada;
- **Histórico:** não pode ser apagado pelo fluxo normal.

O primeiro alimento e o autosave não criam nem atualizam uma linha do histórico.
Somente **Salvar** persiste o draft no backend/banco e, em caso de sucesso,
remove apenas a revisão confirmada. Falhas de limpeza e resultados
desconhecidos seguem a Decisão 01, seção 6.

Se a política de retenção mudar, ela exigirá nova decisão de domínio; não deve
ser implementada apenas mudando o texto do modal.

## 7. Histórico de avaliações

### 7.1 Cabeçalho

- **Nova Avaliação** abre `/pacientes/[id]/avaliacao/nova`.
- O contador mostra avaliações salvas.

### 7.2 Linha de avaliação

- data, peso, gordura, massa magra e cintura são somente leitura na tabela;
- **Detalhes** expande perímetros complementares sem gravar;
- **Editar Avaliação** abre a rota da avaliação com draft local;
- a edição é confirmada somente pelo salvamento da avaliação;
- cancelar ou descartar não altera a avaliação existente.

### 7.3 Detalhes

- expansão/recolhimento é estado de apresentação;
- medidas complementares são renderizadas do registro salvo;
- nenhuma ação de expansão recalcula ou grava a avaliação.

## 8. Matriz de formulários e modais

| Componente | Rascunho local | Operação ao confirmar | Confirmação de descarte |
| --- | --- | --- | --- |
| `CreatePatientModal` | Sim | `createPatient` | Não, cancelar descarta |
| `EditPatientModal` | Sim | `updatePatient` | Sim, se alterado |
| `AddObjectiveModal` | Sim | `addObjectiveOption` | Não |
| `DeletePatientModal` | Não | `archivePatient` | Confirmação prolongada |
| `NextEventModal` | Sim | `setNextFollowUp` | Sim, se alterado |
| Remover acompanhamento | Não | `clearNextFollowUp` | Confirmação |
| `DietEditor` | Sim, em IndexedDB | `saveDietAsActive` no backend/banco | Sim, remove o draft local |
| `ReadOnlyDietModal` | Não | Nenhuma | Não |
| `DeleteDietModal` | Não | `discardDietDraft` somente para draft local | Confirmação |
| `EditAssessmentModal` | Sim | `saveBodyAssessment` | Sim, se alterado |

Nenhum modal pode fechar silenciosamente deixando o usuário acreditar que os
dados foram salvos.

## 9. Navegação e segurança de estado

1. O perfil só pode iniciar dieta ou avaliação para paciente ativo.
2. Dieta histórica aberta por linha é leitura; não deve cair em rota editável.
3. Uma rota de edição deve carregar um draft local quando existir; o caso de
   uso deve validar no salvamento se a dieta base ainda é a última.
4. Se outro salvamento tornar a dieta base histórica durante a edição, o
   salvamento deve falhar com mensagem clara e oferecer criação por cópia.
5. Navegação após **Salvar** ocorre somente depois da confirmação durável da
   persistência; remover apenas a revisão confirmada conforme a Decisão 01.
6. Falha de autosave ou rollback não produz toast de sucesso. Resultado
   desconhecido exige conferir a dieta pelo ID; falha somente na limpeza informa que a
   prescrição foi salva e que a limpeza local está pendente.
7. Foco deve retornar ao botão que abriu o modal quando o modal fechar.
8. `Esc`, clique externo e fechamento devem respeitar o estado de alterações.
9. Ações destrutivas exigem confirmação acessível e não dependem apenas de
   cor, ícone ou hover.

## 10. Mapeamento para casos de uso

| Interação | Caso de uso |
| --- | --- |
| Carregar lista | `listActivePatients` |
| Abrir perfil | `getPatientProfile` |
| Criar paciente | `createPatient` |
| Editar cadastro | `updatePatient` |
| Adicionar objetivo | `addObjectiveOption` |
| Arquivar paciente | `archivePatient` |
| Restaurar paciente | Tela administrativa futura / `restorePatient` |
| Salvar próximo acompanhamento | `setNextFollowUp` |
| Remover próximo acompanhamento | `clearNextFollowUp` |
| Abrir nova dieta | `createDietDraft` |
| Retomar draft local | `resumeDietDraft` |
| Adicionar alimento ou editar dieta | `addFoodToMeal` / `autosaveDietDraft` — somente IndexedDB |
| Salvar dieta explicitamente | `saveDietAsActive` — somente então usa o backend/banco |
| Carregar histórico de dietas | `listPatientDietHistory` |
| Abrir snapshot | `getDietSnapshot` |
| Descartar dieta em criação | `discardDietDraft` — remove somente o draft local |
| Carregar avaliações | `listPatientAssessments` |
| Salvar avaliação | `saveBodyAssessment` |

## 11. Estados de erro e feedback

Toda operação de confirmação deve possuir os estados:

1. pronto para envio;
2. enviando;
3. sucesso;
4. erro recuperável;
5. conflito de versão, quando aplicável.

O botão de confirmação deve ficar indisponível durante o envio para evitar
duplo acionamento. No salvamento da dieta, ID estável e versão esperada também
impedem duplicação e sobrescrita, conforme a Decisão 01.

Mensagens devem indicar se:

- nada foi gravado, somente quando o rollback estiver confirmado;
- a operação foi concluída;
- o dado foi arquivado, e não apagado;
- é necessário recarregar ou abrir uma nova dieta por cópia;
- o autosave foi salvo somente no draft local;
- o rollback foi confirmado e o draft foi preservado para nova tentativa;
- o resultado ainda precisa ser conferido antes de repetir o salvamento;
- a prescrição foi salva, mas a limpeza local precisa ser repetida.

Durante o envio, suspender a edição do draft e drenar autosaves pendentes,
incluindo o último input, conforme a Decisão 01. A aplicação permite somente
uma aba ativa; a segunda é bloqueada antes de abrir a base, conforme a Decisão 10.
No salvamento de dieta, explicar resultado incerto ou limpeza pendente quando
ocorrerem, sem exigir esses estados extras em todo formulário.

## 12. Critérios de aceitação de `/pacientes`

- paciente pode ser criado com os campos do formulário;
- cancelar criação não cria dados;
- erro de criação mantém o formulário recuperável;
- busca e navegação não gravam dados;
- paciente pode ser editado com descarte seguro;
- objetivo novo só é aplicado ao paciente ao salvar o cadastro;
- próximo acompanhamento pode ser criado, substituído, removido e
  descartado;
- WhatsApp não é tratado como salvamento;
- arquivar paciente preserva dietas e avaliações;
- paciente arquivado não aparece na lista nem inicia novos registros;
- abrir uma nova dieta cria somente um draft local em IndexedDB;
- adicionar o primeiro alimento e executar autosave não altera o histórico nem
  cria `DietPlan` no backend;
- drafts Em Criação não aparecem no histórico nem como fonte de cópia;
- salvar explicitamente persiste a dieta no backend e a torna Vigente;
- após commit confirmado, remover somente a revisão confirmada do draft;
- em rollback, preservar o draft; em resultado desconhecido, reconciliar antes
  de confirmar ou repetir; falha de limpeza não repete o commit;
- somente a última dieta permite edição;
- dietas históricas abrem em modo somente leitura;
- a dieta vigente anterior permanece íntegra quando uma nova é salva;
- dieta Em Criação pode ser descartada com confirmação, removendo somente o
  draft local;
- avaliações podem ser criadas, editadas e expandidas sem misturar estados;
- todos os modais protegem alterações não salvas;
- nenhum botão de `/pacientes` acessa diretamente a persistência.

## 13. Ajustes necessários no código atual

Esta especificação exige, no mínimo:

1. trocar exclusão física de paciente por arquivamento;
2. trocar o texto e o caso de uso do modal de exclusão de paciente;
3. impedir edição de dietas que não sejam a última;
4. impedir exclusão de snapshots e da dieta vigente pelo fluxo normal;
5. mapear `Ativa`/`Histórica` para `Vigente`/`Histórico` e tratar `Em Criação`
   como draft local, fora do histórico;
6. remover fontes duplicadas embutidas em `Patient`;
7. retirar acesso direto dos componentes a `localStorage` e IndexedDB;
8. garantir que o `DietDraftStore` use IndexedDB para autosave e descarte local;
9. garantir que somente **Salvar** chame a persistência de dieta no backend;
10. centralizar mensagens de sucesso/erro nos casos de uso e adaptadores de UI;
11. adicionar testes de interação para cada ação da matriz;
12. manter a navegação atual, trocando apenas os pontos que violarem este
    contrato.
