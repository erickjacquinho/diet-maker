# Research: Migração integral para o Design System canônico

## Decision 1 — CSS variables como runtime visual e TypeScript como contrato

**Decision**: `src/design-system/tokens.css` será a fonte runtime dos valores reference, semantic e component. `types.ts` define os nomes tipados e `index.ts` exporta os mapas/contratos sem duplicar valores; `index.ts` será a única entrada pública.

**Rationale**: CSS variables chegam ao CSS e aos aliases Shadcn sem duplicação; os tipos TypeScript impedem nomes de tokens e styles fora do vocabulário canônico.

**Alternatives considered**:

- Manter valores em `tokens.ts` e copiá-los para CSS: rejeitado por permitir divergência.
- Manter apenas classes Tailwind: rejeitado porque perde a camada semântica e dificulta auditoria.

## Decision 2 — Recipes com `class-variance-authority`

**Decision**: Variantes e estados serão definidos em `recipes.ts` com CVA, usando somente aliases semânticos/componentes e utilitário `cn` existente.

**Rationale**: A dependência já existe, permite unions fechadas e mantém componentes Shadcn genéricos enquanto wrappers adicionam contexto de categoria.

**Alternatives considered**:

- Strings `className` repetidas por página: rejeitado por reintroduzir decisões locais.
- Criar uma biblioteca de estilos nova: rejeitado por aumentar dependências sem necessidade.

## Decision 3 — Migração bottom-up com gates bloqueantes

**Decision**: Migrar fundação → `ui` → atoms → molecules → organisms/templates → rotas → página de catálogo → remoção e hardening. Nenhuma etapa seguinte começa com finding bloqueante.

**Rationale**: Componentes superiores herdam a receita inferior; a ordem reduz retrabalho e torna cada checkpoint reversível.

**Alternatives considered**:

- Migrar rota por rota sem fundação: rejeitado porque preservaria estilos legados e criaria duas linguagens.
- Reescrever tudo em um único change set: rejeitado por risco e rollback difícil.

## Decision 4 — Auditoria negativa independente do catálogo

**Decision**: Criar `scripts/verify-design-system-legacy.mjs` para bloquear padrões antigos em `src`, Tailwind, CSS, configuração e testes executáveis. O auditor de catálogo continua verificando o registry documental.

**Rationale**: O catálogo pode passar enquanto o código ainda usa classes antigas; são gates complementares.

**Alternatives considered**:

- Apenas revisão visual humana: rejeitado por não garantir zero legado.
- Apenas grep informal: rejeitado por não ter findings nominais, fixtures e saída determinística.

## Decision 5 — Validação em camadas

**Decision**: Cada checkpoint executará static legacy audit, type-check/lint/testes aplicáveis, auditoria Atomic/Shadcn, links e validação visual/acessível das superfícies cobertas. O checkpoint final acrescenta build, todas as rotas e auditoria de zero ocorrências.

**Rationale**: Nenhum teste isolado prova simultaneamente ausência de legado, acessibilidade, comportamento e aparência.

**Alternatives considered**:

- Somente snapshots: rejeitado por serem frágeis e incapazes de detectar aliases antigos.
- Somente testes unitários: rejeitado porque não exercitam composição, rota e visual.

## Decision 6 — Histórico preservado fora do runtime

**Decision**: `refs/UI/`, `refs/UI/design-system-prd/` e `demo_dashboard.html` permanecem versionados como históricos, sem importação nem participação em gates de runtime.

**Rationale**: Preserva rastreabilidade sem permitir que fontes substituídas concorram com `design-system/`.

## Decision 7 — Rollback por checkpoint

**Decision**: Cada etapa termina em commit isolado e só atualiza registry/status após passar seus gates. Falha exige reverter o último checkpoint da etapa, não apagar dados ou resetar o repositório inteiro.

**Rationale**: A migração afeta muitas superfícies; checkpoints pequenos reduzem custo de recuperação.
