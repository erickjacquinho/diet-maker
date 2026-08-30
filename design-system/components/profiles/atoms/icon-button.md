# IconButton

## Identity

| Field | Value |
| --- | --- |
| Component ID | `atom-icon-button` |
| Nature | `product-generic` |
| Lifecycle | `implemented` |
| Current layer | `atom` |
| Target layer | `atom` |
| Sources | `src/components/atoms/IconButton.tsx` |
| Public exports | `IconButton` (component), `EditIconButton` (compound-part), `DeleteIconButton` (compound-part), `IconButtonProps` (type), `ExplicitIconButtonProps` (type) |

## Purpose

Executar ação compacta sem label visual, sempre com nome acessível.

## Category inheritance

Herda integralmente [actions](../../categories/actions.md). Traits autorizados: `icon-only`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `IconButton` e exports visuais registrados: `IconButton`, `EditIconButton`, `DeleteIconButton`. Base declarada: `atom-button`.

### DeleteIconButton (Padrão Oficial de Exclusão)

O `DeleteIconButton` é o componente oficial e canônico para qualquer ação de remoção ou exclusão via botão de ícone na aplicação (itens de refeição, receitas, prescrições, variações de ciclos, cabeçalhos de entidade).

- **Variante canônica:** `destructive-outline`
- **Estado Normal:**
  - Borda: `border-error-border` (`#E6B8B2` - sutil, semântica de erro)
  - Fundo: `bg-surface`
  - Ícone: `text-error` (`#B42318` - vermelho semântico)
- **Estado Hover:**
  - Borda: `hover:border-error` (`#B42318`)
  - Fundo: `hover:bg-error` (`#B42318` - preenchimento vermelho)
  - Ícone: `hover:text-white` (ícone branco)
- **Estado Active / Pressed:**
  - `active:bg-error active:text-white`
- **Acessibilidade:**
  - Título padrão: `"Excluir"`
  - Accessible name obrigatório (`aria-label` herdado de `title` ou prop explícita)

## Allowed variants

Somente compact/standard e prioridades aprovadas (`quiet`, `secondary`, `destructive`, `destructive-outline`); `icon-only` é obrigatório.

## Particular states

- Normal: `destructive-outline` renderiza com borda sutil `border-error-border` e glifo `text-error`.
- Hover/Active: transição suave para fundo `bg-error`, borda `border-error` e glifo `text-white`.
- Disabled: `disabled:border-border-subtle disabled:bg-disabled-soft disabled:text-disabled` herdado de `atom-button`.

## Composition

Base declarada: `atom-button`. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Label específico deve ser verbo curto; icon-only fornece accessible name equivalente (`Excluir`, `Remover <item>`, `Editar`).

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de rotas e componentes consumidores é o campo `consumers` de `design-system/components/registry.json`; mudanças devem atualizar registro e perfil no mesmo change set.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- `DeleteIconButton` aplica `variant="destructive-outline"` com borda `border-error-border` no normal e `hover:bg-error hover:text-white` no hover;
- categoria e traits são herdados sem redefinição local;
- anatomia e variantes acima são suficientes para reproduzir a família;
- estados particulares são observáveis e não contradizem a categoria;
- nenhuma decisão visual fica a cargo do consumidor.

## Implementation status

Implementado em `atom`; perfil homologado documentalmente como padrão canônico e oficial de botões de exclusão por ícone.

