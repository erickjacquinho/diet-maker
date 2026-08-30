# Decisão 05 — Arquitetura de Backend e Escopos de Dados

- **Status:** Aprovado pelo usuário para especificação; implementação pendente
- **Data:** 2026-08-29
- **Escopo:** Propriedade, persistência e isolamento dos dados dietéticos

## 1. Decisão resumida

O NutriDiet terá um modelo relacional com duas fronteiras de propriedade:

1. **Conta:** biblioteca reutilizável do nutricionista, incluindo alimentos
   customizados, receitas e refeições prontas.
2. **Conta + Paciente:** dados clínicos e prescrições, incluindo pacientes,
   consultas, avaliações, dietas vigentes e snapshots históricos.

Uma dieta **Em Criação** não pertence ao backend/banco canônico. Ela é um
`DietDraft` local em IndexedDB, associado tecnicamente a `accountId` e
`patientId` apenas para retomada e validação. A relação clínica só nasce quando
o nutricionista aciona **Salvar**.

## 2. Backend canônico

O backend/banco canônico será relacional e compatível com PostgreSQL, acessado
por uma camada de repositórios tipados. Esta decisão concentra a arquitetura
antes resumida no ADR-008; a escolha do motor segue a
[Decisão 10](./10-motor-local-drizzle-e-migrations.md):

```text
Domínio puro
    ↓ interfaces/ports
Casos de uso da aplicação
    ↓ repositories + transaction runner
Adaptador de persistência relacional local
    ↓
Drizzle + banco SQL local

Adaptador online futuro
    ↓
PostgreSQL / Supabase
```

No modo offline-first, o banco relacional local é a persistência canônica dos
dados salvos. O acesso documental direto ao IndexedDB é reservado ao
`DietDraftStore`; o próprio motor relacional pode usá-lo internamente como
filesystem, conforme a Decisão 10.

O provedor online não deve aparecer nos componentes, hooks ou regras de
domínio. Um adaptador Supabase/PostgreSQL e eventual sincronização dependem
de decisão futura própria; a autenticação da Decisão 12 não os ativa.

A topologia aprovada para a V1 está detalhada na
[Decisão 09 — Topologia da V1 local-first e Conta local](./09-topologia-v1-local-first-e-conta-local.md).

No modo de Conta única do aplicativo local, `Account` pode ser representada
internamente pelo perfil local do nutricionista, com identidade e configurações
próprias, conforme a [Decisão 09](./09-topologia-v1-local-first-e-conta-local.md).
`Account` continua sendo a fronteira conceitual para não acoplar a modelagem
clínica a um único profissional e permitir membros da Conta no futuro.

## 3. Escopo de cada agregado

```text
Account
├── account members e configurações (futuro; fora da V1)
├── catálogo TACO (leitura do sistema)
├── alimentos customizados
├── receitas
├── refeições prontas
├── objetivos personalizados
└── pacientes
    ├── consultas
    ├── avaliações
    └── dietas confirmadas
        ├── refeições prescritas
        └── itens/snapshots nutricionais
```

### 3.1 Dados da Conta

São reutilizáveis entre pacientes e não devem conter `patientId`:

- `Account`;
- `AccountMember` e preferências do consultório, quando o módulo existir;
- alimentos customizados;
- receitas e seus ingredientes;
- refeições prontas e seus itens;
- objetivos personalizados;
- favoritos e ordenações da biblioteca.

Cada mutação desses dados exige ação explícita de salvar o próprio item. Um
draft de dieta não é usado como buffer para criar ou editar o catálogo.

### 3.2 Dados da Conta + Paciente

São clínicos ou específicos da prescrição:

- `Patient`;
- `ConsultationRecord`;
- `BodyAssessment`;
- `DietPlan` confirmado;
- `DietMeal` e `DietMealItem`;
- metas, observações e variações da prescrição.

Todo registro desse grupo deve conter `accountId` e a relação apropriada com
`patientId`. A aplicação nunca deve localizar um paciente apenas por um ID
fornecido sem validar a Conta proprietária.

## 4. Contratos de persistência

A interface da aplicação deve depender de portas semelhantes a:

- `AccountRepository`;
- `CustomFoodRepository`;
- `RecipeRepository`;
- `ReadyMealRepository`;
- `PatientRepository`;
- `DietRepository`;
- `DietDraftStore`;
- `TransactionRunner`;
- `AccountScope` ou `AccountContext`.

Os repositórios de Conta recebem o escopo da Conta a partir do contexto da
aplicação. Os repositórios de Paciente e Dieta exigem `accountId` e
`patientId`. Nenhum repositório deve aceitar uma consulta que permita escapar
do escopo por omissão.

Os contratos não expõem tabelas, SQL, chaves de `localStorage`, IndexedDB ou
tipos do Supabase. A UI conhece apenas casos de uso e modelos de leitura.

Na V1 há somente uma aba ativa. Restauração suspende edições e recarrega o
contexto após substituir a base, conforme as Decisões 10 e 11. Não há geração
de base nem coordenação de comandos entre abas.

## 5. Limites transacionais

As operações abaixo são transações atômicas no backend/banco canônico:

| Operação | Escopo | Efeito mínimo |
| --- | --- | --- |
| Salvar alimento customizado | Conta | cria/atualiza alimento, versão e auditoria técnica |
| Salvar receita | Conta | grava cabeçalho, ingredientes e cálculo nutricional |
| Salvar refeição pronta | Conta | grava cabeçalho e itens reutilizáveis |
| Salvar paciente | Conta | cria/atualiza cadastro dentro da Conta |
| Salvar dieta | Conta + Paciente | cria refeições, itens, snapshots e transição de vigência |
| Arquivar paciente | Conta + Paciente | oculta o paciente sem apagar o histórico |

O salvamento de uma dieta não deve depender de várias requisições independentes
para criar seus filhos. O plano, suas refeições, os itens e a alteração da
dieta vigente anterior precisam confirmar ou falhar juntos.

## 6. Integridade e segurança de escopo

1. Registros persistidos usam identificadores globais, preferencialmente UUID
   v7, sem IDs sequenciais por Conta.
2. `accountId` é gravado em todas as entidades de negócio da Conta, mesmo
   quando a relação já poderia ser inferida por outra tabela. A exceção é o
   catálogo TACO do sistema, sem proprietário de Conta, conforme a Decisão 06.
3. No modo online, o `accountId` efetivo vem da sessão/autorização no servidor;
   o cliente não pode escolher livremente uma Conta para ler ou gravar.
4. O adaptador Supabase/PostgreSQL deverá aplicar isolamento por Conta no
   servidor e/ou por RLS quando essa camada for ativada.
5. Uma referência de catálogo nunca autoriza acesso a dados de outra Conta.
6. Exclusão física de dados clínicos não faz parte do fluxo normal; catálogo e
   pacientes usam arquivamento quando houver histórico ou dependências.

### 6.1 Garantias do schema relacional

O schema e os repositórios devem demonstrar conjuntamente:

- unicidade de `ACTIVE` por `(accountId, patientId)`, mediante índice único
  parcial ou garantia equivalente do motor, além da transação de vigência;
- chaves estrangeiras compostas que impeçam associar uma dieta ao paciente de
  outra Conta e um item/refeição a outro plano ou paciente;
- `CHECK`, nulabilidade e validação de domínio coerentes para estados,
  versões positivas, quantidades e bases de cálculo válidas;
- ausência de cascata de exclusão do catálogo para snapshots clínicos e de
  exclusão física do paciente pelos casos de uso normais;
- proveniência de catálogo separada da propriedade dos filhos da dieta: uma
  origem ausente não invalida um snapshot completo;
- validação das mesmas invariantes ao importar, sem desabilitar restrições
  para aceitar uma base inconsistente.

**Justificativa:** filtros de aplicação não bastam para impedir referências
cruzadas ou duas vigentes quando há erro no adaptador, na importação ou no
salvamento. As restrições são defesa de integridade, não autenticação local.

## 7. O que não faz parte desta decisão

Esta decisão não cria telas, define rotas HTTP, escolhe o mecanismo exato do
banco local nem implementa autenticação. Ela congela a fronteira que essas
implementações deverão respeitar.

Detalhes de composição, versões e snapshots estão nas Decisões 06, 07 e 08.
