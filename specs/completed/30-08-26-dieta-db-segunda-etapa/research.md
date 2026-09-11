# Research: Conta e pacientes

**Feature**: [spec.md](./spec.md)  
**Data**: 2026-08-30  
**Status**: Concluída para planejamento; implementação ainda não iniciada

## Decisão 1 — Consumir somente o adaptador aprovado na etapa 1

**Decision**: A etapa 2 dependerá do adaptador local aprovado pelo portão da
etapa 1. PGlite + Drizzle é a opção esperada pela documentação de `dieta-db`,
mas o relatório da etapa 1 permanece a autoridade para a versão e a aprovação.

**Rationale**: Conta e pacientes precisam de persistência relacional,
transações, chaves de escopo e versionamento. Reabrir a escolha do motor nesta
etapa duplicaria o portão técnico e desviaria o SDD de seu objetivo clínico.

**Alternatives considered**:

- `localStorage` como fonte da aplicação: rejeitado; é o armazenamento legado
  que deve ser descartado e não garante as invariantes de Conta/Paciente.
- IndexedDB direto para pacientes: rejeitado; o IndexedDB direto permanece
  reservado aos drafts de dieta futuros, não ao banco canônico.
- Adaptador online: rejeitado na V1 por introduzir login, rede, sincronização e
  conflitos fora do escopo.

**Sources**: [Decisão 05](../../refs/dieta-db/05-arquitetura-backend-e-escopos-de-dados.md),
[Decisão 10](../../refs/dieta-db/10-motor-local-drizzle-e-migrations.md),
[Decisão 14](../../refs/dieta-db/14-consolidacao-e-portao-de-execucao.md),
[plano da etapa 1](../30-08-26-prova-tecnica-base-local/plan.md).

## Decisão 2 — Separar domínio, casos de uso, repositórios e UI

**Decision**: O domínio de `Account`, `Patient` e `ObjectiveOption` será
independente do motor. Casos de uso receberão o `AccountContext` validado,
executarão validação e mutação atômica por portas, e as rotas/hooks apenas
orquestrarão estados de interface.

**Rationale**: A separação evita que telas decidam escopo, gerem IDs, alterem
versões ou acessem `localStorage`/SQL. Também mantém o contrato compatível com
um adaptador online futuro sem ativá-lo agora.

**Alternatives considered**:

- Manter `src/lib/patientsStore.ts` como store canônico: rejeitado; o arquivo
  atual mistura pacientes, dietas, avaliações, chaves legadas e exclusão física.
- Acessar o banco diretamente em cada página: rejeitado por violar o limite de
  casos de uso e dificultar transações e testes determinísticos.
- Colocar arrays de histórico no paciente: rejeitado; relações clínicas devem
  ter entidades e repositórios próprios.

**Sources**: [Decisão 02](../../refs/dieta-db/02-ciclo-de-vida-e-persistencia-do-paciente.md),
[Decisão 05](../../refs/dieta-db/05-arquitetura-backend-e-escopos-de-dados.md),
[constituição](../../.specify/memory/constitution.md).

## Decisão 3 — Modelo canônico mínimo para Conta e Paciente

**Decision**: Persistir uma Conta local estável, opções de objetivo e pacientes
com `accountId`, identificador global, dados cadastrais atuais, versão,
timestamps e arquivamento lógico. Iniciais, última atividade e histórico são
projeções de leitura; não serão fontes canônicas duplicadas.

**Rationale**: Esse modelo segue as fronteiras de propriedade da Decisão 05 e
permite que dietas, avaliações e consultas futuras referenciem o paciente sem
copiar seu objeto ou perder a separação de agregados.

**Alternatives considered**:

- Preservar `initials`, `lastConsultation`, `dietHistory[]` e
  `bodyAssessments[]` no registro principal: rejeitado como fontes concorrentes
  e por manter o legado embutido.
- Usar o nome exibido como identificador: rejeitado por não ser imutável nem
  único.
- Associar registros somente por `patientId`: rejeitado; todo acesso deve
  validar também `accountId`.

**Sources**: [data-model da etapa 1](../30-08-26-prova-tecnica-base-local/data-model.md),
[Decisão 02](../../refs/dieta-db/02-ciclo-de-vida-e-persistencia-do-paciente.md),
[Decisão 05](../../refs/dieta-db/05-arquitetura-backend-e-escopos-de-dados.md).

## Decisão 4 — Arquivamento lógico e concorrência por versão

**Decision**: A operação atual chamada de exclusão será convertida em
arquivamento lógico. Atualizações e arquivamentos usam a versão carregada;
conflito rejeita a mutação sem sobrescrever o estado mais recente. Restauração
será um caso de uso preservado, sem tela administrativa nesta etapa.

**Rationale**: O histórico clínico não pode ser apagado por uma ação de rotina,
e a edição de um formulário antigo não pode substituir uma alteração recente.
O contrato de restauração mantém a evolução futura possível sem criar escopo
administrativo agora.

**Alternatives considered**:

- Exclusão física em cascata: rejeitada por perda de histórico e referências.
- Última gravação vence sem versão: rejeitada por sobrescrita silenciosa.
- Criar tela de restauração agora: rejeitada pela divisão da Decisão 14.

**Sources**: [Decisão 02](../../refs/dieta-db/02-ciclo-de-vida-e-persistencia-do-paciente.md),
[Decisão 03](../../refs/dieta-db/03-contrato-de-interacao-da-tela-de-pacientes.md),
[Decisão 14](../../refs/dieta-db/14-consolidacao-e-portao-de-execucao.md).

## Decisão 5 — Objetivos personalizados pertencem à Conta

**Decision**: Objetivos personalizados serão normalizados e gravados como
opções da Conta por operação explícita e idempotente. O modal pode aplicar a
opção ao formulário, mas somente o salvamento do paciente altera o cadastro.

**Rationale**: O catálogo é reutilizável entre pacientes e não deve ser
duplicado em cada registro. A separação também permite retirar uma opção sem
alterar pacientes que já a utilizam.

**Alternatives considered**:

- Gravar texto livre somente no paciente: rejeitado por criar duplicidades e
  impedir reuso.
- Atualizar o paciente imediatamente ao criar a opção: rejeitado porque viola
  o formulário temporário e o salvamento explícito.

**Sources**: [Decisão 02](../../refs/dieta-db/02-ciclo-de-vida-e-persistencia-do-paciente.md),
[Decisão 03](../../refs/dieta-db/03-contrato-de-interacao-da-tela-de-pacientes.md).

## Decisão 6 — Migrar por módulo e retirar o legado de teste

**Decision**: A implantação da etapa 2 inicia uma base nova sem ler ou gravar
as chaves atuais de `localStorage`. O módulo de pacientes será a única fonte
canônica para pacientes; dietas, avaliações e acompanhamentos continuarão como
dependências de etapas posteriores, por contratos separados, sem serem
reimplementados ou convertidos nesta entrega.

**Rationale**: A Decisão 14 determina descarte dos dados legados de teste e
proíbe duas fontes canônicas para a mesma entidade. A separação por módulo
permite que as próximas etapas adotem os mesmos `patientId`/`accountId` sem um
migrador geral.

**Alternatives considered**:

- Adaptador de leitura dupla durante a V1: rejeitado por prolongar duas fontes
  e mascarar a ausência de dados de produção.
- Migrador automático de testes: rejeitado explicitamente pela decisão.

**Sources**: [Decisão 02](../../refs/dieta-db/02-ciclo-de-vida-e-persistencia-do-paciente.md),
[Decisão 14](../../refs/dieta-db/14-consolidacao-e-portao-de-execucao.md).

## Decisão 7 — Reutilizar a composição visual catalogada

**Decision**: Reutilizar os componentes existentes de lista, campos, seleção,
overlays e confirmação. Alterar somente as composições de domínio necessárias;
manter `src/components/ui` genérico. O modal de exclusão manterá sua identidade
de código por compatibilidade, mas apresentará e confirmará arquivamento.

**Rationale**: O catálogo já possui perfis homologados para `PatientListTable`,
`CreatePatientModal`, `EditPatientModal`, `AddObjectiveModal` e o overlay
destrutivo. Evitar uma nova família reduz risco visual e preserva a hierarquia
Atomic Design.

**Alternatives considered**:

- Criar um novo modal de arquivamento antes de avaliar o existente: rejeitado
  pela sequência Usar → Configurar → Variar → Compor → Criar.
- Alterar primitivos Shadcn/Radix: rejeitado; wrappers e moléculas devem conter
  a semântica de domínio.

**Sources**: [catálogo de componentes](../../design-system/components/README.md),
[categoria overlays](../../design-system/components/categories/overlays.md),
[categoria fields](../../design-system/components/categories/fields.md),
[categoria data-display](../../design-system/components/categories/data-display.md),
[perfil DeletePatientModal](../../design-system/components/profiles/molecules/delete-patient-modal.md),
[regras Atomic Design](../../.agents/rules/atomic-design.md).

## Decisão 8 — Validação determinística e proporcional

**Decision**: Cobrir domínio, casos de uso, repositórios e rotas com testes
determinísticos sob `tests/`, além dos gates existentes de tipo, lint,
arquitetura, links e design system. Usar uma fixture sintética de centenas de
pacientes para a medição de 1 segundo, sem transformar a etapa em certificação
geral de volume.

**Rationale**: Os cenários de falha — escopo, versão, arquivamento,
normalização e ausência do legado — são parte do contrato, e não uma verificação
posterior opcional. A estratégia segue a constituição e a métrica proporcional
da especificação.

**Alternatives considered**:

- Testar somente os componentes com `localStorage`: rejeitado porque não prova
  a fonte canônica, transação ou isolamento.
- Criar uma certificação multi-browser/alta escala: rejeitado nesta etapa pelo
  portão da Decisão 14.

**Sources**: [constituição](../../.specify/memory/constitution.md),
[spec §NFR-004–NFR-006](./spec.md),
[quickstart da etapa 1](../30-08-26-prova-tecnica-base-local/quickstart.md).

## Research conclusion

Não restam decisões técnicas bloqueadoras para decompor as tarefas. A
implementação deve aguardar a aprovação humana da etapa 1 e seguir o plano
abaixo por `/speckit-implement`; esta documentação não declara o código como
implementado ou conforme.
