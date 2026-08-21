# Surface

## Identity

| Field | Value |
| --- | --- |
| Component ID | `atom-surface` |
| Nature | `product-generic` |
| Lifecycle | `implemented` |
| Current layer | `atom` |
| Target layer | `atom` |
| Sources | `src/components/atoms/Surface.tsx` |
| Public exports | `SurfaceProps` (type), `Surface` (component) |

## Purpose

Fornecer a base visual reutilizável para superfícies locais do produto sem assumir conteúdo, copy, domínio ou comportamento de interação.

## Category inheritance

Herda integralmente [surfaces](../../categories/surfaces.md). Traits autorizados: nenhum. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Root `Surface` compõe o primitivo `ui-card` e renderiza os filhos fornecidos pelo consumidor. Não possui header, footer, title, estado de negócio ou ação própria.

## Allowed variants

- `variant`: `default` ou `subtle`.
- `density`: `compact`, `standard` ou `highlight`.
- Elevação em fluxo: `shadow-none`; superfícies flutuantes pertencem a overlays próprios.
- `inline` não é variante de `Surface`; consumidores sem caixa própria permanecem layout-only ou usam exceção documentada.

## Particular states

Estados aplicáveis são herdados da categoria `surfaces`; a base não cria copy de loading, error, empty ou domínio.

## Composition

Base declarada: `ui-card`. A API usa `children` e atributos HTML válidos. Dependências ascendentes, tons nutricionais, render props estáticos e modos booleanos são proibidos.

## Content rules

O consumidor fornece conteúdo e semântica real. `Surface` não inventa título, descrição, footer, ação ou margem externa.

## Exceptions

Nenhuma exceção aprovada no atom. Exceções de consumidores são registradas nos perfis das respectivas camadas.

## Consumers

A lista canônica de rotas e componentes consumidores é o campo `consumers` de `design-system/components/registry.json`; mudanças devem atualizar registro e perfil no mesmo change set.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- categoria e tokens são herdados sem redefinição local;
- variantes e densidades são reproduzíveis por receita canônica;
- atributos, semântica e foco dos consumidores permanecem preservados;
- a base não importa moléculas, organismos, templates, rotas ou domínio.

## Implementation status

Implementado em `atom`; perfil atualizado durante a migração de superfícies e sujeito à homologação pelos testes e auditorias do SDD.
