# Decisão 10 — Motor Local, Drizzle e Estratégia de Migrations

- **Status:** Prova técnica autorizada; validação pendente
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

A prova técnica isolada está autorizada para avaliar essa recomendação. Isso
não autoriza substituir a persistência da aplicação, instalar dependências no
projeto principal ou criar sua base clínica antes de registrar o resultado e
seguir o processo de implementação aprovado. Esta adequação é documental.

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
6. Arquivo com versão diferente só é importado quando existe conversão
   explicitamente implementada e validada; caso contrário, é rejeitado.
7. A migração nunca deve apagar dados clínicos sem uma política explícita de
   preservação ou transformação.
8. `drizzle-kit push` fica restrito a experimentos locais; o banco canônico usa
   migrations versionadas.

As migrations desta decisão são evoluções futuras do schema canônico. Elas não
se aplicam aos dados atuais em `localStorage`, pois esses registros são de teste
e serão descartados, sem conversão para o novo banco.

### 4.1 Compatibilidade sem infraestrutura antecipada

`schemaVersion` identifica o modelo dos dados e `formatVersion` identifica o
formato lógico do `.nutridiet`. O arquivo contém JSON da aplicação, não uma
cópia dos arquivos físicos do PGlite.

A V1 aceita o formato/schema que implementa e rejeita versões não suportadas
sem alterar a base. Não é necessário construir agora conversores de todas as
versões futuras ou antigas. Uma evolução real do schema deve trazer sua
migration e, quando necessário, seu conversor de backup.

A versão de PGlite fica fixada nas dependências. Atualizar o motor exige
verificar a compatibilidade da base e validar o caminho de atualização antes
de distribuir a mudança. Não haverá agora gerenciamento de várias versões do
motor, troca automática de bases ou recuperação por gerações.
[Referência sobre upgrades do PGlite](https://pglite.dev/docs/upgrade).

### 4.2 Persistência e uma única aba ativa

- Configurar armazenamento persistente explicitamente. O modo em memória
  serve somente a testes; a aplicação não pode anunciar sucesso antes da
  confirmação de persistência do adaptador.
- Não usar `relaxedDurability` para antecipar a confirmação de gravações.
- Manter **uma única aba ativa por origem/perfil de navegador**. Uma trava
  exclusiva de abertura, validada na PoC, impede a segunda aba de abrir o
  banco e orienta usar ou fechar a primeira.
- A segunda aba não consulta nem edita a base. Não implementar eleição de
  líder, leitura compartilhada, transferência automática ou sincronização
  entre abas. Depois de fechar a primeira, o usuário pode reabrir a segunda.
- Na aba ativa, impedir envios simultâneos do mesmo formulário e suspender
  edições durante restauração ou migration.

A trava pertence à infraestrutura, não aos componentes de domínio. Seu
objetivo é impedir duas instâncias do motor sobre a mesma base, sem oferecer
uso simultâneo como funcionalidade. Se não for possível obter a exclusividade,
não abrir uma segunda instância.

Referências: [filesystems do PGlite](https://pglite.dev/docs/filesystems) e
[API e durabilidade](https://pglite.dev/docs/api).

## 5. Prova de conceito enxuta

A PoC responde se PGlite + Drizzle atende à persistência necessária. Usar dados
sintéticos representativos, uma interface técnica mínima e o navegador desktop
utilizado no projeto, registrando versões e modo de execução.

| Verificação | Evidência necessária |
| --- | --- |
| Persistência | Gravar, fechar e reabrir a base mantendo os dados; falha de armazenamento produz erro explícito |
| Transação | Cabeçalho e filhos confirmam juntos; erro intermediário desfaz toda a gravação |
| Escopo e vigência | Relações respeitam Conta/Paciente e não permitem duas dietas vigentes para o mesmo paciente |
| Migration | Aplicar uma evolução simples do schema sem perder os registros da fixture |
| Draft separado | Gravar/remover um draft não altera a dieta confirmada |
| Aba única | Segunda aba bloqueada antes de abrir o banco; fechamento da primeira permite nova abertura |
| Portabilidade lógica | Exportar e importar uma amostra em JSON preservando IDs, relações e valores nutricionais |
| Rede | As operações locais da amostra funcionam sem rede depois de carregar seus recursos |

A exportação da amostra valida a capacidade do adaptador; não antecipa o
exportador completo da Conta nem sua interface. Os testes do fluxo clínico e do
backup completo pertencem aos SDDs correspondentes, conforme a Decisão 14.

Registrar os tempos observados de abertura, consulta e gravação e investigar
travamentos que inviabilizem o uso. A meta de busca abaixo de 100 ms está nos
[requisitos consolidados](./index.md#requisitos-consolidados) e deve ser
verificada na integração da busca. Não criar nesta PoC uma
certificação de vários navegadores, uma carga obrigatória de 100 mil itens ou
novos limites de memória/latência sem necessidade medida.

A disponibilidade offline das telas existentes será verificada na integração,
conforme a Decisão 09. Não é necessário construir instalação de PWA,
sincronização em segundo plano ou uma plataforma de atualização para aprovar
o motor.

O relatório registra o que foi executado, resultados e limitações. Falha em
persistência, atomicidade, isolamento ou exclusividade impede aprovar o motor;
uma consulta isolada funcionando não basta. A bateria de testes é proporcional
ao fluxo entregue, sem prometer resistência a toda falha física do dispositivo.

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
