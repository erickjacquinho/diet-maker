# Category Decisions

Este registro documenta criação, mudança de limites e lifecycle das categorias visuais. O registro JSON é o índice executável; este arquivo preserva o raciocínio e a aprovação.

## Initial decisions

| Decision | Category | Status | Boundary established |
| --- | --- | --- | --- |
| `CAT-2026-07-31-actions` | `actions` | accepted/stable | Comandos imediatos; rotas e escolhas ficam fora. |
| `CAT-2026-07-31-fields` | `fields` | accepted/stable | Entrada textual, numérica e search com FormField; seleção fica fora. |
| `CAT-2026-07-31-selection` | `selection` | accepted/stable | Escolha persistente; comandos e navegação ficam fora. |
| `CAT-2026-07-31-navigation` | `navigation` | accepted/stable | Destinos e localização; shell e comandos ficam fora. |
| `CAT-2026-07-31-surfaces` | `surfaces` | accepted/stable | Agrupamento local flat; estrutura de página fica fora. |
| `CAT-2026-07-31-data-display` | `data-display` | accepted/stable | Dados genéricos e identidade; domínio nutricional especializado fica fora. |
| `CAT-2026-07-31-feedback` | `feedback` | accepted/stable | Status, resultado e severidade; espera fica fora. |
| `CAT-2026-07-31-overlays` | `overlays` | accepted/stable | Conteúdo temporário em portal; superfícies persistentes ficam fora. |
| `CAT-2026-07-31-loading` | `loading` | accepted/stable | Espera/progresso; resultado e empty ficam fora. |
| `CAT-2026-07-31-nutrition-domain` | `nutrition-domain` | accepted/stable | Semântica de macros, calorias, alimentos, refeições e receitas. |
| `CAT-2026-07-31-structure` | `structure` | accepted/stable | Shell, containers, grids e regiões desktop; estilo interno fica fora. |

## Shared rationale

- As onze categorias são ortogonais à camada Atomic: categoria governa aparência/comportamento; camada governa composição e dependência.
- Cada componente possui exatamente uma categoria principal e pode receber apenas traits compatíveis.
- `nutrition-domain` existe porque cor, unidade, precisão e comparação são semântica de produto compartilhada, não uma variante genérica.
- `structure` não estiliza filhos e `surfaces` não decide layout de página.
- Categorias foram estabilizadas juntas após preencher o contrato de 18 seções e mapear ao menos um consumidor atual em cada uma.

## Decision record template

Copie este bloco para qualquer proposta futura; não crie categoria diretamente no registro.

### CAT-YYYY-MM-DD-slug

- Status: `proposed | accepted | rejected | superseded`
- Category/lifecycle affected:
- Problem not covered by an existing category or trait:
- Existing categories evaluated:
- Consumer examples (minimum three independent families for a new category):
- Shared anatomy/state/token difference:
- Why a trait or profile exception is insufficient:
- Migration and deprecation impact:
- Reviewers and decision date:
- Supersedes/superseded by:

## Change rules

1. Uma proposta começa `proposed`; não recebe consumidores implementados.
2. Uma categoria nova exige diferença compartilhada de anatomia, estados e tokens, além de três famílias independentes previstas.
3. Mudança de limite exige atualizar documento, registro, perfis afetados, testes e esta decisão no mesmo change set.
4. `deprecated` bloqueia novos consumidores e lista substituta; `removed` não pode ser referenciada.
5. Exceção temporária pertence ao perfil, tem responsável e prazo, e não cria precedente de categoria.
