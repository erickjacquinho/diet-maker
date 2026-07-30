# Phase 0 Research: Mapeamento de Tokens e Variantes CVA para Componentes Shadcn

## Decision 1: Mapeamento de Variantes de Cores para `Button` e `Badge`
- **Decision**: Mapear as variantes CVA padrão do shadcn (`default`, `secondary`, `destructive`, `outline`, `ghost`, `link`) diretamente para os tokens semânticos `warm-*`.
- **Rationale**: Mantém compatibilidade total com chamadas existentes `<Button variant="secondary" />` enquanto altera o visual subjacente para a paleta NutriDiet.
- **Alternatives Considered**: Criar novos nomes de variantes (ex: `warm-default`). Rejeitado para não quebrar componentes consumidores existentes.

## Decision 2: Raio de Borda Estrito por Categoria de Componente
- **Decision**:
  - `rounded-2xl` (16px): `Card`, `Dialog`, `Sheet`.
  - `rounded-xl` (12px): `Button`, `Input`, `Select`, `DropdownMenu`, `Popover`, `Tooltip`, `TabsList`.
  - `rounded-full` (9999px): `Badge`.
- **Rationale**: Alinha-se exatamente com a regra inviolável #3 do NutriDiet Design System (`MASTER.md` e `TOKENS_MASTER.md`).

## Decision 3: Eliminação Absoluta de Sombras (Swiss Flat Rule)
- **Decision**: Substituir todas as instâncias de `shadow`, `shadow-sm`, `shadow-md`, `shadow-lg` por `shadow-none` e garantir separação visual através de contornos sólidos `border border-warm-border` e fundos diferenciados (`bg-warm-card`, `bg-warm-inner`).
- **Rationale**: Cumpre a regra inviolável #1 da filosofia *Swiss Warm Minimalist Flat Design*.
