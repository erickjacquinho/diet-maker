# Data Model: Auditoria de z-index

Esta feature não cria persistência de produto. O modelo abaixo descreve registros documentais e estados de validação usados durante a migração.

## ZIndexToken

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | enum | yes | `z-base`, `z-raised`, `z-sticky`, `z-navigation`, `z-dropdown`, `z-popover`, `z-overlay`, `z-modal`, `z-toast` ou `z-tooltip` |
| `value` | integer | yes | Valor oficial definido pelo fundamento 07 |
| `purpose` | enum | yes | Papel semântico da camada |
| `allowedContexts` | enum[] | yes | Contextos `default`, `modal` ou `global` aplicáveis |
| `allowedCategories` | enum[] | yes | Categorias visuais compatíveis |

Validation: `value` must match `design-system/07-icons-motion-and-layers.md`; no token may be added in runtime code without a governance decision.

## OverlayContext

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | enum | yes | `default` or `modal` |
| `hostFamily` | enum | yes | `dropdown`, `select`, `popover`, `dialog`, `sheet` or `tooltip` |
| `effectiveToken` | ZIndexToken | yes | Token resolved by the primitive |
| `consumerOverride` | boolean | yes | Must be `false`; context is selected through the closed API |

Rules: `default` resolves to the family token; `modal` is allowed only for content portalled from a modal flow and resolves to `z-modal`. Numeric values are not valid contexts.

## ZIndexUsageRecord

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | yes | Stable slug derived from source and line |
| `path` | string | yes | Project-relative source path |
| `line` | integer | yes | Source line of the explicit or semantic usage |
| `kind` | enum | yes | `explicit-utility`, `semantic-prop`, `generated-token` |
| `atomicLayer` | enum | yes | `ui`, `atom`, `molecule`, `organism`, `template` or `app` |
| `primaryCategory` | enum | yes | Visual category from the registry |
| `currentToken` | string/null | yes | Token or utility found in the current code |
| `expectedToken` | ZIndexToken | yes | Canonical target token |
| `context` | OverlayContext/null | yes | Modal/normal context when applicable |
| `decision` | enum | yes | `preserve`, `replace`, `recompose`, `document` or `exception` |
| `status` | enum | yes | `discovered`, `classified`, `migrated`, `validated` |

Uniqueness: one source occurrence produces one record. A primitive branch may reference two allowed tokens, but the record must describe the branch condition rather than duplicate the source line.

## ExceptionRecord

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | yes | Stable exception identifier |
| `rule` | string | yes | Rule being temporarily violated |
| `scope` | string | yes | Exact component/state/source boundary |
| `owner` | string | yes | Responsible maintainer/team |
| `replacement` | string | yes | Planned canonical replacement |
| `reviewAt` | date | yes | Future review date |

An exception is not allowed for a static numeric z-index when the official token can express the same role.

## State transitions

```text
discovered → classified → migrated → validated
                         ↘ exception → reviewed → migrated|removed
```

- `discovered`: source and line are known but context is not resolved.
- `classified`: Atomic layer, visual category, current/expected token and decision are explicit.
- `migrated`: code/documentation changes are applied by the implementation flow.
- `validated`: gates and behavior matrix pass with no blocking finding.
- `exception`: temporary path only when no immediate canonical representation exists.
