# Research: Unificação de Superfícies e Composição Atomic

**Date**: 2026-08-05
**Feature**: [spec.md](./spec.md)

## Decision 1 — Usar `Surface` como wrapper atômico sobre `Card`

**Decision**: O produto terá um componente genérico `Surface` em `src/components/atoms/Surface.tsx`, composto sobre o primitivo `Card` de `src/components/ui/card.tsx`.

**Rationale**:

- `Card` já existe como primitivo Shadcn e deve continuar genérico, conforme a regra de preservação do projeto.
- `MetricBox`, `MacroMetricCard` e outros consumidores precisam de uma fronteira de composição do produto sem colocar regras nutricionais em `src/components/ui`.
- O wrapper permite centralizar variantes e densidade sem fazer o consumidor conhecer as classes da superfície.
- O modelo mantém o eixo Atomic separado da categoria visual: `Surface` é um atom genérico; os consumidores continuam molecules/organisms conforme sua responsabilidade.

**Alternatives considered**:

- **Usar `Card` diretamente em todos os consumidores**: rejeitado como solução única porque espalha overrides de superfície e acopla cada componente de produto à anatomia do primitivo Shadcn.
- **Criar um segundo `Box` independente com `<div>`**: rejeitado porque duplicaria o papel visual de `Card` e criaria duas fontes de verdade.
- **Manter `div bg-surface-subtle` por consumidor**: rejeitado porque não cria contrato, não protege acessibilidade e perpetua divergência visual.

## Decision 2 — Usar composição explícita, não modos booleanos

**Decision**: `Surface` recebe variantes nomeadas e `children`; consumidores especializados mantêm APIs de conteúdo específicas.

**Rationale**:

- A skill `vercel-composition-patterns` recomenda children sobre render props e variantes explícitas sobre proliferação de booleanos.
- `Surface` é stateless e não precisa de provider, context ou compound API.
- A anatomia de `MetricBox` e `MacroMetricCard` é diferente; uma base visual não deve assumir header, footer, métricas ou ações.

**Alternatives considered**:

- **Adicionar `isRaised`, `isTinted`, `isInline`, `hasBorder`**: rejeitado por criar combinações implícitas e estados impossíveis.
- **Criar um componente monolítico com slots condicionais para cada card**: rejeitado porque mistura estrutura genérica com domínio e aumenta a API.
- **Usar render props para header/body/footer**: rejeitado para este caso porque a composição é estrutural e pode ser expressa com children.

## Decision 3 — Manter a superfície visual no design system

**Decision**: As variantes canônicas `default`/`subtle`, densidades `compact`/`standard`/`highlight`, política `shadow-none` e estados da superfície serão definidos na receita canônica em `src/design-system/recipes.ts`, com perfil e registro em `design-system/components/`. `tinted` e `inline` permanecem decisões de consumidores: o primeiro é tratamento semântico fora do atom e o segundo não é superfície.

**Rationale**:

- O design system é a fonte única de tokens, geometria, estados e categorias.
- A base visual precisa ser reproduzível por todos os consumidores e auditável sem buscar classes em cada arquivo.
- O perfil de `Surface` deve conter apenas particularidades; regras compartilhadas ficam na categoria `surfaces`.

**Alternatives considered**:

- **Definir classes somente em `Surface.tsx`**: rejeitado porque a receita visual deixaria de ser a fonte canônica do sistema.
- **Criar variantes separadas dentro de cada molecule**: rejeitado por duplicação e falta de rastreabilidade.

## Decision 4 — Migrar primeiro consumidores de maior valor e auditar o restante

**Decision**: A ordem será `MetricBox` → `MacroMetricCard` → cards/rows de domínio → organisms → templates/páginas, com classificação explícita de superfícies restantes.

**Rationale**:

- `MetricBox` é o consumidor que atualmente duplica a base diretamente.
- `MacroMetricCard` já usa `Card`, servindo como caso de composição controlada.
- Organisms e templates dependem dos consumidores menores; migrá-los depois reduz risco de divergência.
- Nem toda `div` com um token de fundo é uma superfície: algumas são apenas layout ou tratamento interno de dados.

**Alternatives considered**:

- **Migrar todas as ocorrências de `bg-surface-subtle` automaticamente**: rejeitado porque alteraria inputs, badges, estados internos e regiões que não são containers.
- **Alterar somente `MetricBox`**: rejeitado porque manteria múltiplas bases concorrentes nos cards e organisms.

## Decision 5 — Validação por contrato, Atomic e regressão visual

**Decision**: A validação combinará testes unitários de `Surface`, testes dos consumidores, auditorias Atomic/design-system, type-check, lint e comparação visual das rotas principais.

**Rationale**: A mudança é transversal: testes unitários cobrem API e estados; auditorias cobrem dependências e catálogo; comparação visual protege densidade e hierarquia.

**Open unknowns resolved**: Não há armazenamento, API, autenticação ou integração externa. Não há necessidade de provider ou modelagem persistente.

## Inventory result

The source audit confirms that the named migration is limited to reusable roots and section shells. Inputs, badges, buttons, dialogs, menus, table regions, inline macro treatments and empty-state anatomy remain consumer-specific or out of scope. The only deliberate visual exceptions are the `MetricBox` inline mode, the `MetricBoxGroup` no-padding grid shell, the `RecipeCard` inner data-display summary, and the template empty-state treatment; each is recorded in `data-model.md` and must be protected by regression coverage.
