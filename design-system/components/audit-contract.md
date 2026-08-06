# Contract: Component Catalog Audit

## Command behavior

O auditor recebe a raiz do projeto e modo `inventory` ou `strict`. Ele não modifica arquivos. A saída humana e a saída estruturada devem conter os mesmos findings na mesma ordem.

## Exit semantics

| Exit | Meaning |
| --- | --- |
| `0` | Nenhum error no modo solicitado |
| `1` | Um ou mais findings `error` |
| `2` | Configuração ou schema ilegível impediu a auditoria |

## Finding codes

| Code | Severity | Condition |
| --- | --- | --- |
| `SRC001` | error | Fonte atual descoberta sem entrada |
| `SRC002` | error | Entrada implementada aponta para fonte inexistente |
| `SRC003` | error | Fonte compartilhada sem papel reexport/compound declarado |
| `EXP001` | error | Export visual público sem cobertura |
| `EXP002` | error | Export registrado não existe na fonte atual |
| `REG001` | error | Registro viola schema |
| `REG002` | error | ID, path ou relação duplicada |
| `CAT001` | error | Categoria principal ausente, desconhecida ou removida |
| `CAT002` | error | Documento de categoria ausente ou incompleto |
| `CAT003` | error | Categoria redefine fundamento global |
| `TRT001` | error | Trait desconhecido ou incompatível |
| `TRT002` | error | Trait sobrescreve regra da categoria principal |
| `PRF001` | error | Perfil obrigatório ausente |
| `PRF002` | error | Perfil sem seção obrigatória ou referência inconsistente |
| `PRF003` | error | Perfil duplica contrato normativo da categoria |
| `STA001` | error | Estado aplicável ausente ou N/A sem justificativa |
| `TOK001` | error | Token referenciado não existe |
| `TOK002` | error | Valor visual local proibido |
| `GOV001` | error | Exceção incompleta, expirada ou sem referência |
| `GOV002` | error | Transição de lifecycle sem decisão válida |
| `DOC001` | error | Decisão textual aberta ou placeholder |
| `DOC002` | error | Link normativo local quebrado |
| `SYNC001` | error | Fonte normativa ativa contradiz fundamentos vigentes |
| `PROP001` | error | Proposta declarada implementada ou incluída na baseline atual |

## Determinism

Findings são ordenados por severity (`error` antes de `warning`), code, entity ID e path. Mensagens não incluem timestamp, caminho absoluto dependente da máquina ou ordem de filesystem.

## Modes

- `inventory`: exige registro válido, cobertura de fontes/exports e relações coerentes; permite `specStatus: inventoried`.
- `strict`: inclui todas as regras de categoria, perfil, estados, tokens, governança, sincronização e exige `specStatus: homologated` para entradas atuais.

As quatro propostas podem permanecer `specified`; nunca são exigidas como fonte atual.

## Success summary

O modo estrito válido informa, no mínimo:

```text
39 current source files covered
0 uncovered public visual exports
11 categories homologated
4 proposed components specified
0 blocking findings
```

## Primitive-family contract checks

For the primitive-alignment initiative, `registry.json.primitiveFamilies` is the executable contract for the 16 families. A catalog audit or contract test MUST report an actionable finding when:

- a family ID is duplicated or its source is missing;
- the root or a listed public part is not exported by the family source;
- a part has no role, state list or root-context declaration;
- a consumer path is stale, omitted or uses a deprecated atom alias;
- a family imports a higher Atomic layer or domain module.

`breadcrumb.tsx` remains catalogued in `components` as a navigation source, but is intentionally outside the 16-family initiative inventory. The `atomWrappers` registry section records the added value and migration decision for each atom wrapper; `importPolicy` defines the canonical `ui` versus `atoms` choice.
