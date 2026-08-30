# Decisão 09 — Topologia da V1 Local-First e Conta Local

- **Status:** Aprovado pelo usuário para especificação; implementação pendente
- **Data:** 2026-08-29
- **Escopo:** Topologia inicial de persistência e identidade da Conta

## 1. Decisão aprovada

A V1 será **local-first** e funcionará com uma Conta por banco/perfil local.
Não haverá dependência de rede para criar, consultar ou salvar os dados
canônicos do consultório durante a primeira fase.

```text
Interface
    ↓
Casos de uso
    ├── Repositórios tipados → banco relacional local
    └── DietDraftStore      → IndexedDB do navegador
```

O banco relacional local é a fonte canônica dos dados salvos da Conta e dos
Pacientes. O `DietDraftStore` é uma exceção deliberada: armazena somente
rascunhos de dieta ainda não confirmados.

## 2. Identidade da Conta na V1

Na V1:

- existe uma Conta ativa por banco/perfil local;
- o `accountId` é estável e acompanha todos os dados persistidos;
- o perfil do nutricionista descrito no ADR-008 representa a Conta local;
- alimentos customizados, receitas e refeições prontas pertencem à Conta;
- pacientes, consultas, avaliações e dietas confirmadas pertencem à Conta +
  Paciente;
- não existe troca de Conta no mesmo banco local nesta fase.

Essa simplificação não remove o conceito de Conta do modelo. Ela apenas evita
implementar autenticação, associação de membros e seleção de organizações
antes de existir uma necessidade validada.

## 3. Estados de persistência

### 3.1 Dados da Conta e do Paciente

Alimentos customizados, receitas, refeições prontas, pacientes, avaliações e
dietas confirmadas são salvos explicitamente no banco relacional local por
meio dos repositórios e casos de uso correspondentes.

O fechamento de uma tela depois de uma alteração não confirmada não deve criar
uma versão canônica automaticamente, salvo quando o caso de uso daquela
entidade tiver sido explicitamente acionado.

### 3.2 Dietas em criação

Uma dieta **Em Criação**:

- existe somente no `DietDraftStore` local;
- pode ser recuperada no mesmo perfil/dispositivo;
- não aparece no histórico do paciente;
- não altera a atividade persistida;
- não cria `DietPlan`, snapshot ou dieta vigente;
- é removida após sucesso do salvamento ou descarte confirmado.

O draft pode carregar `accountId` e `patientId` para validar o contexto, mas
isso não o transforma em entidade persistida.

## 4. O que fica fora da V1

Não fazem parte desta topologia inicial:

- autenticação online;
- múltiplos usuários na mesma Conta;
- compartilhamento de receitas entre Contas;
- sincronização automática entre dispositivos;
- edição concorrente;
- resolução de conflitos online;
- Supabase/PostgreSQL como requisito para operar o aplicativo.

Essas capacidades poderão ser adicionadas por um adaptador online sem alterar
as regras de propriedade ou os casos de uso do domínio.

## 5. Preparação para a evolução online

Mesmo sendo local-first, a V1 deve:

1. gerar IDs globais, preferencialmente UUID v7;
2. guardar `accountId` em todas as entidades persistidas;
3. manter versões e `updatedAt` para detecção de conflitos futura;
4. concentrar queries nos repositórios;
5. executar salvamentos compostos em transações;
6. não usar chaves de `localStorage` como modelo canônico;
7. manter o schema compatível com PostgreSQL;
8. deixar outbox e sincronização para uma decisão posterior.

## 6. Próxima decisão técnica

A próxima decisão é avaliar o motor do banco relacional local. A recomendação e
os critérios estão registrados na
[Decisão 10 — Motor local, Drizzle e estratégia de migrations](./10-motor-local-drizzle-e-migrations.md).

PGlite é o candidato preferencial porque mantém PostgreSQL no navegador e se
integra ao Drizzle, mas a escolha só será congelada após uma prova técnica de:

- persistência e reabertura do banco;
- migrations versionadas;
- transações de dieta e catálogo;
- volume de pacientes, receitas e itens;
- comportamento em duas abas;
- exportação e importação do arquivo `.nutridiet`.

Essa prova técnica não faz parte desta decisão e não deve antecipar a criação
de telas.
