# ADR-008: Backend Relacional Local, Armazenamento de Receitas/Refeições e Arquivo Mestre (.nutridiet)

- **Status**: Aceito
- **Data**: 2026-08-28

## Contexto
O software NutriDiet necessita de uma infraestrutura robusta para persistir o ecossistema completo de trabalho do nutricionista: receitas culinárias com múltiplos ingredientes, refeições prontas reutilizáveis, alimentos customizados, histórico de consultas, avaliações físicas e dietas com ciclo de carboidratos.

Essa persistência deve operar com alta performance para centenas de pacientes e milhares de refeições/itens, carregar e salvar a base completa por meio de um **Arquivo Mestre de Perfil (.nutridiet)**, funcionar 100% offline no navegador e deixar o lastro técnico 100% preparado para virar um backend online (PostgreSQL/Supabase) no futuro sem retrabalho.

## Decisão

Adotar a seguinte arquitetura de dados e persistência:

### 1. Motor de Dados Relacional e Camada de Acesso a Dados (DAL)
- **Repository Pattern (DAL)**: A UI e os Hooks consomem interfaces de repositórios tipadas (`IPatientRepository`, `IDietRepository`, `IRecipeRepository`, `IReadyMealRepository`, `ICustomFoodRepository`, `INutritionistProfileRepository`).
- **Drizzle ORM com Schema Relacional (PostgreSQL-Compatible)**: Toda a modelagem de entidades, tabelas, tipos e chaves estrangeiras (`ON DELETE CASCADE`) é expressa com Drizzle ORM.
- **Identificadores Únicos**: Todas as entidades utilizam **UUID v7** (Time-Ordered) ou Nanoids para garantir integridade e fusão de dados com colisão matematicamente zero ao sincronizar com banco em nuvem.

### 2. Ciclo de Gravação: Buffer de Rascunho + Commit Transacional + Fila Outbox
- **Buffer de Rascunho Contínuo (Draft State)**: Durante a digitação/edição na tela de atendimento, os dados ficam em buffer local para proteger contra fechamento acidental da aba do navegador.
- **Commit Transacional Explícito (ACID)**: Ao acionar "Salvar" (ou `Ctrl+S`), os dados consolidados são gravados em uma transação atômica no banco relacional local.
- **Fila de Sincronização (Outbox Pattern)**: Cada transação confirmada grava uma mutação na tabela `sync_outbox`. Quando o backend online (Supabase) for conectado no futuro, um worker de segundo plano replicará os dados pendentes em lote, sem retrabalho e sem tráfego de rascunhos inacabados.

### 3. Modelagem de Receitas, Refeições e Imutabilidade Clínica
- **Tabela Mestre de Receitas (`recipes` e `recipe_ingredients`)**: Armazena as receitas criadas pelo nutricionista (rendimento/porções, modo de preparo, tempo e ingredientes com gramas/macros).
- **Tabela Mestre de Refeições Prontas (`ready_meals`)**: Armazena templates de blocos de refeição reutilizáveis.
- **Snapshot Imutável na Dieta**: Ao adicionar uma receita ou refeição pronta à dieta de um paciente, o sistema grava um *snapshot* imutável dos macros e ingredientes calculados para a porção prescrita. Edições ou exclusões futuras na receita mestre **não alteram retroativamente** as dietas já entregues aos pacientes no histórico clínico.

### 4. Arquivo Mestre de Perfil do Nutricionista (.nutridiet)
- Formato padronizado contendo:
  1. **Manifesto**: Identificação do nutricionista, CRN, configurações da clínica, versão do schema (`schemaVersion`) e checksum SHA-256.
  2. **Payload Relacional Normalizado**: Estado integral de pacientes, consultas, dietas, refeições, receitas e alimentos customizados.
  3. **Auto-Migração de Schema**: O Drizzle executa migrações automáticas caso um arquivo de versão anterior seja aberto em uma versão mais recente do aplicativo.
- **Sem rotinas intrusivas de backup no momento**: Sem modais ou pop-ups recorrentes forçando exportações; a exportação e importação do arquivo `.nutridiet` ocorrem sob demanda direta do usuário.

## Consequências
- **Desempenho Extremo**: Consultas, buscas e somas de macros executadas via índices B-Tree no motor de dados em sub-milissegundos.
- **Integridade Absoluta**: Zero risco de dados órfãos ou corrupção de arquivo por falhas parciais de gravação.
- **Histórico Clínico Protegido**: Prescrições passadas permanecem congeladas e idênticas ao momento da consulta.
- **Transição Transparente para a Nuvem**: O mesmo schema Drizzle e contratos de repositório serão apontados para PostgreSQL/Supabase no servidor sem necessidade de refatorar a camada de componentes de interface.
