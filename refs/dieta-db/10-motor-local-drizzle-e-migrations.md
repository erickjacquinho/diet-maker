# Decisão 10 — Motor Local, Drizzle e Estratégia de Migrations

- **Status:** Recomendação técnica; prova de conceito pendente
- **Data:** 2026-08-30
- **Escopo:** Implementação futura da persistência relacional local

## 1. Decisão arquitetural

Os contratos de domínio e os repositórios tipados são a decisão estável. O
motor de banco permanece atrás desses contratos.

Para a V1 local-first, a recomendação é:

```text
Schema relacional PostgreSQL-compatible
        ↓
Drizzle ORM / Drizzle Kit
        ↓
PGlite como banco relacional local no navegador
        ↓
futuro adaptador PostgreSQL/Supabase
```

Essa recomendação ainda não autoriza instalação de dependências ou criação do
banco. Ela será confirmada somente depois da prova de conceito descrita neste
documento.

## 2. Por que essa combinação é a preferida

### 2.1 Drizzle

Drizzle é uma camada de schema, query builder e migrations. O domínio não deve
importar Drizzle; somente os adaptadores de infraestrutura podem fazê-lo.

O schema relacional em TypeScript pode ser mantido sob controle de versão e
usado para gerar migrations SQL versionadas. A estratégia preferida é gerar e
aplicar migrations explícitas, não alterar o banco canônico por comandos
imperativos espalhados pelo código.

Referências oficiais:

- [Declaração de schema do Drizzle](https://orm.drizzle.team/docs/sql-schema-declaration)
- [Migrations do Drizzle](https://orm.drizzle.team/docs/migrations)

### 2.2 PGlite

PGlite executa PostgreSQL em WebAssembly no navegador e possui integração com
Drizzle. Isso mantém o dialeto relacional próximo do PostgreSQL/Supabase futuro
e evita criar uma implementação documental paralela para Conta, Paciente e
Dietas.

Referências oficiais:

- [PGlite](https://pglite.dev/docs/about)
- [Integração PGlite + Drizzle](https://orm.drizzle.team/docs/connect-pglite)

## 3. Separação entre banco canônico e draft

O uso de IndexedDB pelo navegador não significa que o `DietDraftStore` e o
banco relacional sejam o mesmo armazenamento lógico.

```text
Banco relacional local
├── Conta
├── alimentos customizados
├── receitas
├── refeições prontas
├── Pacientes
├── avaliações
└── dietas confirmadas

Armazenamento de drafts
└── DietDraft em criação
```

Se o PGlite usar um filesystem baseado em IndexedDB, isso será detalhe interno
do adaptador do banco. A aplicação não poderá misturar as tabelas do PGlite
com o object store dos drafts, nem tratar o banco relacional como um simples
JSON local.

## 4. Estratégia de schema e migrations

1. O domínio define entidades e invariantes sem conhecer tabelas.
2. O schema relacional é organizado por contexto e agregado.
3. O Drizzle Kit gera migrations versionadas a partir do schema.
4. Cada migration é revisada antes de ser aplicada.
5. A versão do schema faz parte do manifesto do arquivo `.nutridiet`.
6. A abertura de um arquivo antigo executa migrações compatíveis antes da
   leitura dos dados.
7. A migração nunca deve apagar dados clínicos sem uma política explícita de
   preservação ou transformação.
8. `drizzle-kit push` fica restrito a experimentos locais; o banco canônico usa
   migrations versionadas.

## 5. Requisitos da prova de conceito

Antes de congelar PGlite como motor da V1, a prova de conceito deverá validar:

| Área | Evidência necessária |
| --- | --- |
| Persistência | dados sobrevivem a reload, fechamento e reabertura do navegador |
| Transação | salvar receita e ingredientes confirma ou desfaz tudo |
| Dieta | salvar dieta troca a vigente e cria histórico sem estado parcial |
| Escopo | consultas não atravessam `accountId` ou `patientId` |
| Migrations | schema inicial e pelo menos uma evolução restauram os dados |
| Volume | catálogo, centenas de pacientes e milhares de itens mantêm resposta aceitável |
| Abas | comportamento de duas abas é conhecido e documentado |
| Exportação | `.nutridiet` exporta e restaura o estado relacional completo |
| Draft | falha ou remoção do draft não remove dados canônicos |

O critério não é somente a query funcionar. A prova precisa confirmar ciclo de
vida, falhas, recuperação e separação de armazenamento.

## 6. Alternativas e motivo para não escolhê-las agora

### Supabase como primeira implementação

Seria adequado para um produto cloud-first, mas contradiz a V1 local-first ao
tornar a persistência canônica dependente da rede e antecipar autenticação,
RLS, sincronização e conflitos.

### Somente IndexedDB

É adequado para drafts e pequenos estados locais, mas não deve ser o modelo
canônico de uma Conta com relações, transações, histórico e integridade
referencial.

### SQLite/WASM como primeira escolha

Pode atender ao armazenamento local, mas cria uma diferença de dialeto em
relação ao PostgreSQL futuro. Só deve substituir PGlite se a prova técnica
demonstrar uma limitação concreta do PostgreSQL em WASM.

## 7. Guardrails de implementação futura

- componentes e hooks não importam Drizzle, PGlite ou APIs de banco;
- repositórios não expõem registros de tabela como modelo de domínio;
- transações são abertas na camada de aplicação/infraestrutura;
- IDs e `accountId` são gerados/validados fora da interface;
- nenhum autosave de dieta escreve no banco canônico;
- o outbox só recebe mutações confirmadas e continua fora da V1;
- falhas de inicialização, migration ou persistência são erros tipados;
- não haverá fallback silencioso para `localStorage`.

## 8. Próximo passo após esta decisão

O próximo passo não é criar telas. É executar uma prova técnica isolada do
motor recomendado e registrar o resultado em uma decisão complementar. Se a
prova falhar em requisito essencial, a arquitetura de repositórios permanece
válida e apenas o adaptador de infraestrutura será substituído.
