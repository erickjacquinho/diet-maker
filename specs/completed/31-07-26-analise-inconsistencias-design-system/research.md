# Research Findings: Análise de Inconsistências no Design System

## Decision 1: Ferramenta de Auditoria Estática e Dinâmica
- **Decision**: Combinar o script estático `node scripts/verify-design-system-legacy.mjs` com testes unitários e de rotas do Vitest (`npx vitest run`).
- **Rationale**: Permite detectar tanto violações de nomenclatura de classes em arquivos JSX quanto quebras contratuais na renderização do React DOM.
- **Alternatives Considered**: Ferramentas externas de linting CSS (descartado por não validar a integração de componentes React).

## Decision 2: Padronização de Botões e Tipografia de Rótulos
- **Decision**: Exigir que todo botão utilize a recipe `recipes.button` ou componentes reutilizáveis (`Button`, `CreateButton`, `SecondaryActionButton`, `IconButton`, `EditIconButton`, `DeleteIconButton`) herdando peso `font-semibold` (`600`).
- **Rationale**: Eliminar disparidades visuais onde botões apresentavam `font-black` ou `text-xs font-bold` hardcoded.
- **Alternatives Considered**: Permitir variações locais de peso tipográfico (rejeitado por violar a diretriz do Design System).

## Decision 3: Single Source of Truth Documental
- **Decision**: Manter `design-system-guidelines/` como o único diretório de contrato e documentação do Design System.
- **Rationale**: Prevenir divergência de esquemas JSON e manuais de estilo entre a raiz e subsistemas.
- **Alternatives Considered**: Duplicar esquemas em `design-system/components/` (rejeitado por causar falha de manutenção).
