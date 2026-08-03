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

