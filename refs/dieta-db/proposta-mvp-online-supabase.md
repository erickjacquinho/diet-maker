# Proposta futura — MVP online com Supabase e dados por conta

- **Registrada em:** 2026-10-13
- **Status:** Direção acordada com o usuário; implementação adiada até estabilizar o núcleo do MVP.
- **Escopo deste registro:** Preservar a ideia e o momento de retomada. Não autoriza implementação, alteração de banco remoto ou publicação.

## Objetivo acordado

Tornar o PostgreSQL do Supabase a fonte principal de todos os dados confirmados,
com consultas e gravações online. Uma conta autenticada possui seu ambiente:
perfil profissional, pacientes, avaliações, acompanhamentos, dietas e histórico,
biblioteca, agenda, favoritos e preferências.

Não haverá vários saves por conta, catálogo de saves, seleção de arquivos ou
portabilidade `.nutridiet` como funcionalidades do produto. Após o login, o
usuário entra diretamente nos dados vinculados à sua conta.

## Arquitetura mínima pretendida

```text
Navegador → backend Next.js existente → PostgreSQL do Supabase
                      ↓
                 Supabase Auth
```

- Uma conta da aplicação por usuário autenticado, sem equipes nesta etapa.
- Um banco compartilhado entre contas, com isolamento por conta; não criar um banco por usuário.
- O servidor valida sessão e propriedade e resolve a conta autorizada; parâmetros do navegador não concedem acesso.
- Reutilizar domínio, contratos de repositório, schema compatível com PostgreSQL, Drizzle, `pg` e autenticação existentes.
- Repositórios clínicos e operações confirmadas passam para o servidor. O navegador não recebe credenciais Postgres ou administrativas.
- Rascunhos de dieta podem continuar no IndexedDB existente, separados dos dados confirmados. Isso não mantém um segundo banco clínico nem confirmação offline.
- “Salvo” significa transação confirmada no servidor; sem rede não há confirmação clínica.
- TACO pode continuar distribuída com a aplicação; dados próprios da conta ficam no banco remoto.

Saem da arquitetura de destino: PGlite como persistência clínica, checkpoints de
arquivo, handles, autorização e chaves por save, sincronização entre bases local
e remota. Storage, Realtime, filas e um segundo backend não são necessários para
esse escopo inicial. Backup operacional do banco continua necessário, mesmo sem
exportação/importação para o usuário.

O esquema técnico detalhado (comunicação, isolamento, RLS, criptografia de dados
sensíveis, chaves e importação do `.nutridiet`) está na
[Decisão 15](./15-esquema-transferencia-backend-supabase.md).

## Momento de retomada

Primeiro estabilizar as entidades, relações e os fluxos principais de pacientes,
avaliações, dietas, biblioteca e salvamento. Depois migrar e validar a operação
online **antes do lançamento do MVP**, sem esperar concluir todo o acabamento
visual e sem deixar a transição para a última tarefa de lançamento.

O motivo é reduzir retrabalho enquanto o núcleo muda bastante. Evoluções futuras
do schema usam migrations versionadas e preservação dos dados; adicionar campos
ou relações não exige, por si só, recriar o banco.

Até a retomada, preservar as fronteiras de domínio/repositórios e evitar ampliar
funcionalidades de saves locais destinadas à retirada. Este registro não altera
os contratos locais em vigor, incluindo [o save principal](../../docs/adr/ADR-009-nutridiet-principal.md)
e [a soberania clínica local](./12-autenticacao-online-e-soberania-local.md).
Esses contratos precisam ser atualizados quando a transição for especificada.

## Trabalho e validação ao retomar

1. Reavaliar o código e especificar a mudança pelo fluxo SDD; executar o plano aprovado com `/speckit-implement`.
2. Adaptar persistência, APIs, sessão e telas para carregar a conta diretamente, preservando as regras clínicas.
3. Incluir favoritos e lembretes, hoje também persistidos fora do banco relacional. Definir o tratamento dos dados locais existentes; não presumir autorização para descartá-los.
4. Aplicar isolamento por conta, permissões restritas e RLS, inclusive nos registros filhos; manter relações e uma dieta vigente por paciente.
5. Confirmar operações completas em transações, verificar versões concorrentes e tratar repetição e resultado incerto após timeout sem duplicação ou sobrescrita silenciosa.
6. Validar paginação, índices, latência, falhas de rede, isolamento entre contas, concorrência e restauração do backup antes do lançamento.

A avaliação inicial foi de esforço médio a alto, com reaproveitamento de domínio,
schema e interface. Não há prazo estimado, capacidade de usuários comprovada ou
prova técnica online nesta proposta. A dificuldade principal é a mudança de
sessão, persistência e recuperação diante da rede, não apenas configurar Supabase.

Ao perguntar sobre “MVP online”, “migrar para Supabase”, “fim dos saves locais”
ou “dados vinculados à conta”, retomar este documento e conferir o estado atual
do projeto antes de propor execução.
