# Data Model: Component Category Catalog

## Overview

O modelo representa documentação normativa versionada. Não contém dados de pacientes ou estado de aplicação. A identidade de cada entidade é estável e usada por links, auditoria e governança.

## Category

Representa a fonte normativa compartilhada de uma família visual.

| Field | Type | Rules |
| --- | --- | --- |
| `id` | kebab-case string | Único e imutável após estado `stable` |
| `name` | string | Nome humano canônico |
| `purpose` | string | Uma responsabilidade visual principal |
| `lifecycle` | enum | `proposed`, `experimental`, `stable`, `deprecated`, `removed` |
| `document` | path | Arquivo Markdown único sob `components/categories/` |
| `allowedTraits` | Trait ID[] | Sem duplicatas; traits não podem sobrescrever regras |
| `relatedCategories` | Category ID[] | Relações de composição, nunca herança múltipla |
| `consumers` | ComponentEntry ID[] | Pelo menos um para promoção a `stable` |
| `decisionRef` | CategoryDecision ID | Obrigatório em criação ou mudança de lifecycle |

### Category lifecycle

```text
proposed → experimental → stable → deprecated → removed
              ↓             ↑
           proposed ← revisão rejeitada
```

- `proposed`: problema e escopo definidos, ainda sem contrato homologado.
- `experimental`: contrato completo em avaliação com consumidores controlados.
- `stable`: contrato completo, auditado e liberado para componentes atuais e futuros.
- `deprecated`: permanece legível, não aceita novos consumidores e aponta substituto.
- `removed`: não pode ser referenciado por entrada ativa.

Saltos de estado exigem decisão explícita. Retorno de `experimental` para `proposed` registra motivo e revisão.

## Trait

Representa capacidade visual secundária reutilizável.

| Field | Type | Rules |
| --- | --- | --- |
| `id` | kebab-case string | Único |
| `purpose` | string | Capacidade adicional limitada |
| `adds` | string[] | Partes ou estados adicionados |
| `forbiddenOverrides` | string[] | Propriedades que o trait não pode substituir |
| `compatibleCategories` | Category ID[] | Lista fechada |

Traits não possuem lifecycle independente nesta versão; sua criação ou alteração integra a decisão da categoria que os admite.

## ComponentEntry

Representa uma família pública atual ou proposta.

| Field | Type | Rules |
| --- | --- | --- |
| `id` | kebab-case string | Único e estável |
| `name` | string | Nome público da família |
| `nature` | enum | `ui-generic`, `product-generic`, `domain` |
| `lifecycle` | enum | `proposed`, `experimental`, `implemented`, `migration-required`, `stable`, `deprecated`, `removed` |
| `currentLayer` | enum/null | `ui`, `atom`, `molecule`, `organism`, `template`; null somente sem implementação |
| `targetLayer` | enum | Camada Atomic desejada |
| `primaryCategory` | Category ID | Exatamente uma categoria ativa |
| `traits` | Trait ID[] | Opcionais, conhecidos e compatíveis |
| `sourceFiles` | SourceFile[] | Pelo menos uma para estado implementado; vazio para as quatro propostas |
| `publicExports` | PublicExport[] | Pelo menos um símbolo planejado ou atual |
| `profile` | path | Perfil individual único |
| `consumers` | path[] | Rotas ou componentes consumidores conhecidos |
| `primitiveBase` | ComponentEntry ID/null | Base genérica, sem dependência ascendente |
| `specStatus` | enum | `inventoried`, `specified`, `homologated` |
| `exceptions` | ExceptionRecord ID[] | Vazio por padrão |

### Component documentation state

```text
inventoried → specified → homologated
                 ↓
             inventoried (quando categoria/perfil deixa de cumprir contrato)
```

O estado documental é independente de `lifecycle`: um arquivo pode estar `implemented` e apenas `inventoried`; uma proposta pode estar `specified` sem existir em `src`.

## SourceFile

| Field | Type | Rules |
| --- | --- | --- |
| `path` | project-relative path | Deve existir para entrada implementada |
| `role` | enum | `implementation`, `reexport`, `compound-family` |
| `discoveredLayer` | enum | Derivada do diretório real |

Uma fonte deve pertencer a pelo menos uma entrada. Compartilhamento é permitido somente para reexport ou compound family declarado.

## PublicExport

| Field | Type | Rules |
| --- | --- | --- |
| `name` | identifier string | Único dentro da entrada |
| `kind` | enum | `component`, `compound-part`, `recipe`, `hook`, `type` |
| `source` | SourceFile path | Deve estar entre `sourceFiles` para entrada implementada |
| `documentedBy` | enum | `category`, `profile`, `non-visual` |

Hooks e types podem ser `non-visual`, mas continuam inventariados para impedir APIs públicas invisíveis.

## ComponentProfile

Representa a aplicação enxuta de uma categoria.

| Field | Type | Rules |
| --- | --- | --- |
| `componentId` | ComponentEntry ID | Relação um-para-um |
| `categoryRef` | Category ID | Igual a `primaryCategory` |
| `specificAnatomy` | part[] | Somente diferenças ou composição concreta |
| `allowedVariants` | variant[] | Subconjunto ou especialização prevista pela categoria |
| `particularStates` | state[] | Somente estados adicionais ou restrições |
| `composition` | rule[] | Componentes permitidos e proibidos |
| `acceptanceCriteria` | criterion[] | Objetivos e rastreáveis |
| `exceptionRefs` | ExceptionRecord ID[] | Toda divergência precisa estar referenciada |

O perfil não pode conter escala de tokens, tabela completa compartilhada de estados nem regra global de categoria.

## ExceptionRecord

| Field | Type | Rules |
| --- | --- | --- |
| `id` | string | Único |
| `componentId` | ComponentEntry ID | Consumidor da exceção |
| `categoryId` | Category ID | Contrato divergente |
| `rule` | string | Regra exata afetada |
| `reason` | string | Necessidade não atendida por composição/variante |
| `scope` | string | Partes e estados limitados |
| `impact` | string | Acessibilidade, consistência e manutenção |
| `approvedBy` | string | Mantenedor responsável |
| `approvedAt` | date | Obrigatória |
| `reviewAt` | date | Obrigatória e posterior à aprovação |
| `generalizationDecision` | enum | `retain-local`, `promote-to-category`, `remove` |

## CategoryDecision

| Field | Type | Rules |
| --- | --- | --- |
| `id` | string | Data mais identificador estável |
| `action` | enum | `create`, `change`, `split`, `merge`, `deprecate`, `remove` |
| `categoryIds` | Category ID[] | Uma ou mais conforme ação |
| `problem` | string | Recorrência comprovada |
| `consumers` | ComponentEntry ID[] | Afetados atuais e previstos |
| `alternatives` | string[] | Inclui composição e variante |
| `compatibility` | string | Impacto e migração documental |
| `decision` | string | Resultado aprovado |
| `approvedBy` | string | Mantenedor responsável |
| `date` | date | Obrigatória |

## AuditFinding

| Field | Type | Rules |
| --- | --- | --- |
| `code` | stable enum | Classe definida no contrato de auditoria |
| `severity` | enum | `error`, `warning` |
| `entityType` | enum | `source`, `export`, `category`, `trait`, `component`, `profile`, `exception`, `document` |
| `entityId` | string | Identidade nominal |
| `path` | path/null | Documento ou fonte afetada |
| `message` | string | Explica violação e correção esperada |

Findings são ordenados por `severity`, `code`, `entityId` e `path`. Modo estrito falha com qualquer `error`; warnings não podem representar requisito obrigatório ausente.

## Relationships

```text
Global Foundation 1 ──* Category
Category 1 ──* ComponentEntry
Category * ──* Trait (compatibility only)
ComponentEntry 1 ──1 ComponentProfile
ComponentEntry 1 ──* SourceFile
ComponentEntry 1 ──* PublicExport
ComponentEntry 1 ──* ExceptionRecord
Category 1 ──* CategoryDecision
AuditFinding * ──1 auditable entity
```

## Global Validation Rules

1. IDs, paths e exports são únicos no escopo definido.
2. Todo arquivo TSX de componente descoberto está coberto por entrada.
3. Todo export visual público está coberto por categoria ou perfil.
4. Toda entrada ativa referencia categoria não removida.
5. Traits são conhecidos, compatíveis e não sobrescrevem categoria.
6. Entradas propostas sem implementação não possuem `sourceFiles` e não entram na contagem atual.
7. Entradas implementadas possuem fonte existente e `currentLayer` real.
8. `targetLayer` pode diferir de `currentLayer` somente com lifecycle ou nota de migração correspondente.
9. Perfis não repetem contratos compartilhados nem usam decisão visual aberta.
10. Exceções e decisões obedecem todos os campos e datas.

