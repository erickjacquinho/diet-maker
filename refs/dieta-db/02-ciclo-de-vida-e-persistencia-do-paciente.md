# Decisão 02 — Ciclo de Vida e Persistência do Paciente

- **Status:** Aprovado pelo usuário para especificação; implementação pendente de revisão final
- **Data:** 2026-08-29
- **Escopo:** Cadastro, acompanhamento e arquivamento do paciente

## 1. Objetivo

Definir todos os dados e operações que pertencem ao paciente sem transformar o
paciente em um objeto que contenha toda a sua história. O paciente pertence a
uma Conta; dietas e avaliações são registros relacionados e devem ter
repositórios próprios.

Esta decisão complementa a [Decisão 01 — Fluxo de Paciente e Dieta](./01-fluxo-paciente-dieta.md).

## 2. Regras funcionais congeladas

### 2.1 Cadastro

1. Um paciente é criado com um identificador imutável.
2. O nome é obrigatório e deve ser normalizado sem espaços nas extremidades.
3. Idade, altura, peso, gênero, objetivo e metas padrão pertencem ao cadastro
   atual do paciente.
4. WhatsApp e telefone são dados de contato normalizados; o número não deve ser
   salvo em formatos diferentes para o mesmo paciente.
5. Código e iniciais são dados de apresentação. As iniciais devem ser derivadas
   do nome, e não tratadas como fonte primária.
6. Os dados atuais são de teste e serão descartados; IDs legados não fazem
   parte do modelo novo.

### 2.2 Edição

1. A edição ocorre em formulário temporário e só altera o cadastro ao acionar
   **Salvar Alterações**.
2. Cancelar ou descartar abandona o formulário sem alterar o paciente.
3. Alterar peso ou metas padrão não modifica dietas já salvas. A dieta captura
   seus próprios valores no momento da criação ou prescrição.
4. Alterar o nome atualiza as iniciais derivadas e não altera o identificador.
5. Toda edição deve atualizar `updatedAt` e incrementar a versão do registro.

### 2.3 Objetivos

1. O objetivo selecionado é salvo como valor do paciente.
2. Objetivos padrão e objetivos personalizados pertencem ao catálogo da Conta,
   não ficam duplicados dentro de cada paciente.
3. Adicionar um objetivo personalizado deve ser uma operação explícita,
   normalizada e idempotente.
4. Remover um objetivo do catálogo não remove nem altera o objetivo já salvo em
   pacientes existentes.

### 2.4 Avaliações físicas

1. Cada avaliação é um registro filho independente do paciente.
2. Criar e editar uma avaliação exige salvamento explícito.
3. A edição atualiza a avaliação selecionada e não altera outras avaliações.
4. A avaliação mais recente é uma consulta derivada por data, não um campo
   duplicado dentro do paciente.
5. A avaliação deve conter seus valores calculados e os campos informados pelo
   nutricionista no momento do salvamento.
6. O primeiro fluxo não transforma avaliações em snapshots imutáveis; a edição
   explícita existente é preservada. Uma política de versionamento clínico para
   avaliações será uma decisão posterior, se necessária.

### 2.5 Próximo acompanhamento

1. O paciente pode ter no máximo um próximo acompanhamento agendado.
2. O registro contém data e tipo: atualização de avaliação ou atualização de
   dieta.
3. Salvar substitui o agendamento anterior do mesmo paciente.
4. Remover o agendamento limpa o registro sem apagar o histórico do paciente.
5. Datas persistidas usam ISO; a apresentação local pertence à interface.

### 2.6 Atividade e histórico

1. A última atividade é uma informação derivada dos últimos eventos salvos de
   paciente, avaliação e dieta.
2. Se for mantida como projeção para acelerar listas, ela nunca será a fonte
   primária do histórico.
3. `lastConsultation` não deve ser digitado nem duplicado como verdade
   independente; deve ser calculado a partir dos registros relacionados.
4. A linha do tempo do paciente deve consultar relações persistidas, sem
   depender de arrays embutidos no cadastro.
5. Autosave ou alteração de um `DietDraft` local não atualiza atividade,
   histórico ou qualquer projeção persistida do paciente.

### 2.7 Arquivamento e restauração

1. Excluir um paciente pela interface significa arquivá-lo logicamente.
2. O arquivamento define `archivedAt` e remove o paciente das listas ativas.
3. Dietas, avaliações e demais históricos permanecem preservados.
4. Paciente arquivado não pode iniciar novas dietas ou avaliações até ser
   restaurado.
5. Restaurar remove o estado arquivado e devolve o paciente às listas ativas.
6. Exclusão física definitiva não faz parte do fluxo normal e exigirá uma ação
   administrativa separada, com confirmação explícita e política própria.

## 3. Modelo canônico do paciente

O registro principal deve conter apenas o estado cadastral e as projeções
necessárias:

```text
Patient
├── id (imutável)
├── accountId (Conta proprietária)
├── displayCode
├── name
├── demographics
├── contacts
├── currentObjective
├── defaultMacroTargets
├── nextFollowUp (opcional)
├── createdAt / updatedAt / version
└── archivedAt (opcional)
```

Não fazem parte do registro principal:

- `dietHistory[]`;
- `bodyAssessments[]`;
- `lastConsultation` como valor independente;
- `initials` como valor independente;
- arrays de consultas ou atividades sem entidade própria.

Esses dados devem ser obtidos por consultas aos repositórios relacionados e
projeções de leitura.

## 4. Entidades relacionadas

```text
Patient 1 ─── N DietPlan
Patient 1 ─── N BodyAssessment
Patient 1 ─── N ConsultationRecord (quando o módulo existir)
Account 1 ─── N Patient
Account 1 ─── N ObjectiveOption
```

As dietas seguem as regras da Decisão 01: a dieta vigente e os snapshots não
podem ser alterados pela edição cadastral do paciente.

Avaliações, dietas e consultas devem guardar `patientId` e não copiar o objeto
inteiro do paciente. Todos os registros persistidos também guardam `accountId`
e a aplicação deve validar que `patient.accountId` corresponde ao escopo da
operação. Quando um documento precisar mostrar o nome ou peso do
paciente, deve usar uma projeção de leitura ou o snapshot clínico apropriado.

A relação `Patient 1 ─── N DietPlan` inclui somente dietas confirmadas e
persistidas no backend/banco, nos estados **Vigente** ou **Histórico**. Uma
dieta **Em Criação** é um `DietDraft` local em IndexedDB e não aparece no
perfil como dieta persistida, nem entra na linha do tempo, nas contagens ou no
histórico até o salvamento explícito. A interface pode oferecer a retomada do
draft local separadamente do histórico.

## 5. Operações da aplicação

Os casos de uso relacionados ao paciente são:

- `createPatient`;
- `updatePatient`;
- `getPatient`;
- `listActivePatients`;
- `getPatientProfile`;
- `archivePatient`;
- `restorePatient`;
- `saveBodyAssessment`;
- `listPatientAssessments`;
- `setNextFollowUp`;
- `clearNextFollowUp`;
- `addObjectiveOption`;
- `getPatientTimeline`.

Cada caso de uso valida o estado, executa a mutação apropriada e retorna um
resultado tipado. A interface não deve decidir se uma operação é atualização,
arquivamento ou exclusão física.

## 6. Contratos de persistência

O primeiro conjunto de portas deve ser equivalente a:

- `PatientRepository` — cadastro, consulta, atualização, arquivamento e
  restauração, sempre filtrado por `accountId`;
- `BodyAssessmentRepository` — criação, edição e consulta por paciente;
- `DietRepository` — leitura de dietas confirmadas e persistência da dieta
  somente após o salvamento explícito;
- `DietDraftStore` — drafts locais de dieta, preferencialmente em IndexedDB,
  fora do histórico persistido;
- `ObjectiveCatalogRepository` — opções padrão e personalizadas da Conta;
- `AccountContext` — escopo da Conta autenticada/ativa usado pelos casos de
  uso, nunca recebido como autoridade cega da interface;
- `PatientTimelineReader` — projeções de histórico e última atividade;
- `TransactionRunner` — operações atômicas que atualizam paciente e projeções.

Os contratos não podem expor tabelas, chaves de `localStorage` ou tipos de um
provedor específico. Uma implementação online futura deverá cumprir o mesmo
comportamento de arquivamento, relações e versionamento.

## 7. Operações transacionais

### 7.1 Criar paciente

1. Validar campos obrigatórios e valores numéricos.
2. Normalizar contato e objetivo.
3. Gerar ID na camada de aplicação/infraestrutura.
4. Associar o paciente à Conta ativa validada.
5. Persistir o paciente com `archivedAt = null`.
6. Retornar a entidade criada para navegação ao perfil.

### 7.2 Atualizar paciente

1. Carregar o paciente pela versão esperada.
2. Rejeitar atualização de paciente arquivado, salvo no caso de restauração.
3. Validar e normalizar o novo cadastro.
4. Atualizar `updatedAt` e `version` atomicamente.
5. Manter inalterados os registros de dietas e avaliações relacionados.

### 7.3 Salvar avaliação

1. Validar a existência e o estado ativo do paciente.
2. Validar os campos da avaliação e normalizar pares de medidas.
3. Criar ou atualizar somente a avaliação identificada.
4. Atualizar a projeção de última atividade na mesma transação, se ela existir.
5. Confirmar tudo ou não gravar nada.

### 7.4 Arquivar paciente

1. Carregar o paciente pela versão esperada.
2. Definir `archivedAt` e atualizar `updatedAt`.
3. Manter dietas, avaliações e snapshots intactos.
4. Impedir novas mutações clínicas enquanto arquivado.
5. Invalidar ou marcar como resolvidos os drafts de edição daquele paciente.

### 7.5 Restaurar paciente

1. Localizar paciente arquivado.
2. Remover `archivedAt` atomicamente.
3. Incrementar a versão e atualizar `updatedAt`.
4. Tornar novamente disponíveis as operações clínicas.

## 8. Proteções e erros

- Paciente inexistente deve resultar em erro tipado, nunca em cadastro implícito.
- Paciente arquivado não pode receber dieta ou avaliação nova.
- Atualização com versão antiga deve ser rejeitada para evitar sobrescrita
  silenciosa.
- Falha de qualquer etapa transacional deve preservar o estado anterior.
- Os filhos do paciente não podem ser apagados pelo arquivamento lógico.
- Dietas salvas não podem recalcular seus valores por causa de uma edição no
  cadastro atual.
- O histórico não pode depender da existência de arrays legados dentro do
  paciente.

## 9. Guardrails obrigatórios

1. `Patient` não contém arrays canônicos de dietas ou avaliações.
2. Nenhuma página acessa diretamente `localStorage`, IndexedDB ou banco.
3. Toda mutação cadastral passa por um caso de uso.
4. Arquivar não significa apagar relações.
5. IDs e datas são gerados e normalizados fora dos componentes.
6. Campos derivados, como iniciais e última consulta, não podem virar fontes
   concorrentes de verdade.
7. Metas do paciente são defaults; dietas preservam suas próprias metas.
8. Qualquer nova relação clínica deve ter entidade, chave estrangeira,
   repositório e consulta de histórico próprios.
9. Alterações de schema exigem migration e teste de restauração/arquivamento.
10. Os dados legados atuais são de teste e devem ser descartados antes da
    implantação, sem conversão para o novo modelo.

## 10. Descarte do armazenamento legado de teste

Não haverá migração dos registros existentes nas chaves de `localStorage`.
Esses dados são testes e não representam prontuário de produção.

Antes da primeira execução com a nova arquitetura, o ambiente é reinicializado
sem pacientes, receitas, refeições, avaliações, objetivos ou dietas legados.
O sistema novo deve iniciar com uma única fonte canônica, sem adaptador de
leitura, IDs antigos ou gravação simultânea no storage anterior.

## 11. Validação

Antes de executar os módulos clínicos, deve ser comprovado que:

- criar paciente persiste todos os campos esperados;
- editar e cancelar respeitam o formulário temporário;
- alterar metas não altera dietas existentes;
- avaliação pode ser criada, editada e consultada por paciente;
- próximo acompanhamento pode ser salvo, substituído e removido;
- objetivo personalizado fica disponível sem alterar objetivos já salvos;
- arquivar oculta o paciente sem apagar filhos;
- paciente arquivado não inicia novos registros;
- restaurar reativa o paciente e preserva seu histórico;
- versões antigas não sobrescrevem edições mais recentes;
- o ambiente reinicializado não lê nem grava chaves legadas.

## 12. Fora desta decisão

Não fazem parte deste documento:

- autenticação e multiusuário;
- sincronização online;
- política de eliminação definitiva por exigência legal;
- versionamento clínico completo de avaliações;
- exportação/importação do arquivo mestre;
- implementação física do banco local.
