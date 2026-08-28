# PRD — NutriDiet Dieta DB: Persistência Relacional Local e Arquivo Mestre

Este arquivo existe como ponte de compatibilidade para referências canônicas de produto e arquitetura.

A especificação técnica e de produto do banco de dados local, gestão de receitas/refeições e arquivo mestre do nutricionista está formalizada e dividida por responsabilidades no [**Índice Canônico (index.md)**](./index.md).

## Navegação Rápida

- 📑 [Índice Geral e Decisões Fixadas](./index.md)
- 🏛️ [01. Visão Geral e Arquitetura do Banco Local](./01-visao-e-arquitetura-geral.md)
- 🗄️ [02. Modelo de Dados e Schemas Relacionais](./02-modelo-de-dados-e-schemas.md)
- 🍳 [03. Receitas, Refeições Prontas e Imutabilidade Clínica](./03-receitas-refeicoes-e-imutabilidade-clinica.md)
- 💾 [04. Persistência Dual: Buffer de Rascunho e Commit ACID](./04-persistencia-local-rascunho-e-commit.md)
- 📦 [05. Arquivo Mestre de Perfil (.nutridiet)](./05-arquivo-mestre-perfil-nutridiet.md)
- ☁️ [06. Lastro Online, Fila Outbox e Migração Supabase](./06-lastro-online-outbox-e-supabase.md)
- 🔒 [07. Segurança, Privacidade LGPD e Validação](./07-seguranca-privacidade-lgpd-e-observabilidade.md)
- 🧪 [08. Testes, Desempenho e Homologação](./08-testes-performance-e-homologacao.md)
- 🗺️ [09. Roadmap de Implementação e Governança](./09-roadmap-de-migracao-e-governanca.md)

## Regra de Governança

Não adicione novos requisitos soltos neste arquivo. Toda evolução deve ser registrada no documento temático correspondente e refletida no [index.md](./index.md).
