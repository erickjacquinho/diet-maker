# DietBuilderTemplate

## Identity

| Field | Value |
| --- | --- |
| Component ID | `template-diet-builder-template` |
| Nature | `domain` |
| Lifecycle | `implemented` |
| Current layer | `template` |
| Target layer | `template` |
| Sources | `src/components/templates/DietBuilderTemplate.tsx` |
| Public exports | `DietBuilderTemplateProps` (type), `DietBuilderTemplate` (component) |

## Purpose

Organizar as regiões do workflow de montagem da dieta.

## Category inheritance

Herda integralmente [structure](../../categories/structure.md). Traits autorizados: `nutrition-context`. Fundamentos globais e categoria prevalecem sobre este perfil.

## Specific anatomy

Slots de context/header, macro tracker, controles de modo, lista de refeições e região contextual.

## Allowed variants

Container workflow, com regiões opcionais somente quando o estado do produto as omite.

## Particular states

Nenhum estado adicional; todos os estados aplicáveis e seus N/A justificados são herdados da categoria.

## Composition

Base declarada: `atom-surface` para a região de contexto. Compõe `Surface`, organismos, molecules e primitives UI permitidos; compound parts pertencem a esta família e não recebem perfil independente. Dependências ascendentes e controles interativos aninhados são proibidos.

## Content rules

Slots são nomeados pela responsabilidade; títulos e landmarks preservam ordem de leitura.

## Exceptions

`dashed-empty-state`: o estado vazio de refeições mantém uma anatomia dashed própria, registrada como exceção de empty-state e não como nova variante de `Surface`.
ExceptionRecord: dashed-empty-state reviewAt: 2026-09-30 owner: design-system-maintainers

## Consumers

A lista canônica de rotas e componentes consumidores é o campo `consumers` de `design-system/components/registry.json`; mudanças devem atualizar registro e perfil no mesmo change set.

## Acceptance criteria

- identidade, source e exports coincidem com o registro;
- categoria e traits são herdados sem redefinição local;
- anatomia e variantes acima são suficientes para reproduzir a família;
- estados particulares são observáveis e não contradizem a categoria;
- nenhuma decisão visual fica a cargo do consumidor.

## Implementation status

Implementado em `template`; perfil homologado documentalmente. Homologação não declara a estilização atual conforme.

