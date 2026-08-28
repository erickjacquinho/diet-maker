# NutriDiet Dieta DB — Índice Canônico e Arquitetura de Dados

**Status:** Aprovado  
**Versão:** 1.0  
**Data:** 2026-08-28  

Este índice é a porta de entrada e a fonte canônica de navegação da especificação da arquitetura de dados e persistência do **NutriDiet Local Pro** (Dieta DB). Os documentos numerados dividem a arquitetura por responsabilidade técnica e domínio.

---

## Decisões Fixadas

1. **Motor Relacional Local com Drizzle ORM**: Persistência estruturada em modelo relacional SQL com integridade referencial estrita (`ON DELETE CASCADE`) e índices B-Tree.
2. **Repository Pattern (DAL)**: A UI e os Hooks comunicam-se exclusivamente com contratos de repositório tipados (`IPatientRepository`, `IDietRepository`, `IRecipeRepository`, `IReadyMealRepository`, `ICustomFoodRepository`, `INutritionistProfileRepository`).
3. **Persistência Dual (Draft Buffer + Commit Transacional)**:
   - *Draft State*: Buffer de rascunho contínuo em memória/storage para proteger digitações ativas contra fechamento acidental da aba.
   - *Commit ACID*: Gravação atômica no banco relacional confirmada pelo botão "Salvar" ou atalho `Ctrl+S`.
4. **Outbox Pattern (`sync_outbox`)**: Toda transação confirmada localmente gera uma mutação na fila de outbox, viabilizando replicação em lote para banco online (Supabase/PostgreSQL) com zero retrabalho.
5. **Identificadores UUID v7 / Nanoids**: Chaves primárias com ordenação temporal e garantia de colisão nula na fusão com banco na nuvem.
6. **Imutabilidade Clínica em Receitas e Refeições**:
   - Tabela mestre para Receitas e Refeições Prontas.
   - *Snapshot Imutável* gravado na dieta do paciente na data da consulta, preservando o histórico clínico mesmo se a receita mestre for alterada no futuro.
7. **Arquivo Mestre de Perfil (.nutridiet)**:
   - Pacote consolidado contendo perfil profissional, pacientes, consultas, dietas, alimentos customizados, refeições e receitas.
   - Manifesto com metadados, versão do schema (`schemaVersion`), checksum SHA-256 e suporte a auto-migração de esquemas.
8. **Fluxo Sob Demanda (Sem Backups Intrusivos)**: Exportação e importação disparadas exclusivamente por ação direta do usuário.

---

## Catálogo de Documentos e Ordem de Leitura

| Ordem | Documento | Responsabilidade |
| :---: | :--- | :--- |
| **01** | [01-visao-e-arquitetura-geral.md](./01-visao-e-arquitetura-geral.md) | Visão executiva, escopo, camadas da arquitetura e métricas |
| **02** | [02-modelo-de-dados-e-schemas.md](./02-modelo-de-dados-e-schemas.md) | Modelagem relacional completa, entidades, Drizzle Schema e tipos TS |
| **03** | [03-receitas-refeicoes-e-imutabilidade-clinica.md](./03-receitas-refeicoes-e-imutabilidade-clinica.md) | Receitas, refeições prontas, cálculo por porção e snapshot na consulta |
| **04** | [04-persistencia-local-rascunho-e-commit.md](./04-persistencia-local-rascunho-e-commit.md) | Ciclo de gravação: Draft Buffer, Commit ACID e integridade local |
| **05** | [05-arquivo-mestre-perfil-nutridiet.md](./05-arquivo-mestre-perfil-nutridiet.md) | Estrutura do `.nutridiet`, manifesto, importação/exportação e migrações |
| **06** | [06-lastro-online-outbox-e-supabase.md](./06-lastro-online-outbox-e-supabase.md) | Arquitetura de outbox, estratégia de IDs e transição para Supabase |
| **07** | [07-seguranca-privacidade-lgpd-e-observabilidade.md](./07-seguranca-privacidade-lgpd-e-observabilidade.md) | Privacidade médica (LGPD), integridade de dados e validações Zod |
| **08** | [08-testes-performance-e-homologacao.md](./08-testes-performance-e-homologacao.md) | Estratégia de testes de banco, carga de alta escala e critérios de aceite |
| **09** | [09-roadmap-de-migracao-e-governanca.md](./09-roadmap-de-migracao-e-governanca.md) | Fases de entrega, riscos, evolução e governança |

---

## Rotas de Leitura Recomendadas

### 🎯 Rota de Produto & Domínio
1. [01-visao-e-arquitetura-geral.md](./01-visao-e-arquitetura-geral.md)
2. [03-receitas-refeicoes-e-imutabilidade-clinica.md](./03-receitas-refeicoes-e-imutabilidade-clinica.md)
3. [05-arquivo-mestre-perfil-nutridiet.md](./05-arquivo-mestre-perfil-nutridiet.md)
4. [09-roadmap-de-migracao-e-governanca.md](./09-roadmap-de-migracao-e-governanca.md)

### 🏛️ Rota de Arquitetura & Engenharia
Leia na sequência: **01 ➔ 02 ➔ 03 ➔ 04 ➔ 05 ➔ 06 ➔ 07 ➔ 08 ➔ 09**.

### 🛠️ Rota de Implementação Técnica

| Fase | Objetivo | Documentos | Gate de Validação |
| :---: | :--- | :--- | :--- |
| **Fase 1** | Modelagem Relacional & Repositórios DAL | `01`, `02`, `04` | Repositórios passam em 100% dos testes unitários |
| **Fase 2** | Receitas, Refeições & Snapshots Imutáveis | `03`, `04`, `08` | Snapshot de consulta preserva dados em mutações mestres |
| **Fase 3** | Arquivo Mestre `.nutridiet` & Migrações | `05`, `07`, `08` | Import/Export com validação de checksum e integridade |
| **Fase 4** | Fila de Outbox & Lastro Supabase | `06`, `08`, `09` | Fila de mutações grava eventos idempotentes com UUID v7 |
