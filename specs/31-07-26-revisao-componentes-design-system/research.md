# Research Findings: Revisão Completa dos Componentes

## Decision 1: Padronização de Tabelas de Dados
- **Decision**: Criar e aplicar uma receita/estrutura padronizada para todas as tabelas em HTML/JSX (`table`, `thead`, `tbody`, `tr`, `th`, `td`).
- **Structure**:
  - `table`: `w-full text-left border-collapse`
  - `thead`: `bg-surface-subtle border-b border-border-subtle`
  - `th`: `px-4 py-3 text-style-legal text-text-muted font-semibold uppercase tracking-wider`
  - `tr`: `border-b border-border-subtle hover:bg-surface-hover transition-colors duration-standard`
  - `td`: `px-4 py-3 text-style-body text-text-primary`

## Decision 2: Eliminação de Overrides de Fonte em Botões
- **Decision**: Remediar ocorrências residuais de `font-bold` em botões e substituí-las pela recipe canônica ou componentes atômicos com `font-semibold`.
- **Rationale**: Manter consistência com a diretriz `LEG004` e `05-typography-system.md`.

## Decision 3: Estratégia de Execução em Loop
- **Decision**: Iterar camada por camada (Atômica → Molécula → Organismo → Tela) rodando o script de auditoria estática ao final de cada camada.
- **Rationale**: Garante regressão zero e localização imediata de desvios.
