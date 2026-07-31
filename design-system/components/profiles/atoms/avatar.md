# Avatar

## Identity

| Field | Value |
| --- | --- |
| Component ID | `atom-avatar` |
| Nature | `product-generic` |
| Lifecycle | `implemented` |
| Current layer | `atom` |
| Target layer | `atom` |
| Sources | `src/components/atoms/Avatar.tsx` |
| Public exports | `AvatarProps` (type), `Avatar` (component) |

## Purpose

Apresentar identidade por imagem ou fallback textual determinístico.

## Category inheritance

Herda integralmente [data-display](../../categories/data-display.md). Traits autorizados: `identity`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `Avatar` e exports visuais registrados: `Avatar`. Sem primitive base; compõe somente dependências permitidas pela layer.

## Allowed variants

Tamanhos 32, 36 e 44; source image ou fallback.

## Particular states

Falha de imagem ativa fallback com iniciais; não anuncia erro visual.

## Composition

Sem primitive base; compõe somente dependências permitidas pela layer. Compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Valores usam locale pt-BR, unidade explícita e alinhamento definido pela categoria.

## Exceptions

Nenhuma exceção aprovada.

## Consumers

A lista canônica de rotas e componentes consumidores é o campo `consumers` de `design-system/components/registry.json`; mudanças devem atualizar registro e perfil no mesmo change set.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- categoria e traits são herdados sem redefinição local;
- anatomia e variantes acima são suficientes para reproduzir a família;
- estados particulares são observáveis e não contradizem a categoria;
- nenhuma decisão visual fica a cargo do consumidor.

## Implementation status

Implementado em `atom`; perfil homologado documentalmente. Homologação não declara a estilização atual conforme.

