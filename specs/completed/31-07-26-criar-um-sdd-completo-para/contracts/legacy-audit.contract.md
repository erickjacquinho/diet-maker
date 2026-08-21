# Legacy Audit Contract

## Interface

```text
node scripts/verify-design-system-legacy.mjs [--strict] [--json] [--paths <scope>]
```

Saída JSON:

```json
{
  "mode": "strict",
  "findings": [
    { "code": "LEG001", "rule": "warm-token", "path": "src/app/page.tsx", "line": 10, "message": "..." }
  ],
  "counts": { "files": 0, "findings": 0 }
}
```

## Required rules

`LEG001` tokens/paleta antiga; `LEG002` text style arbitrário; `LEG003` radius proibido; `LEG004` peso/font legado; `LEG005` shadow/transition proibida; `LEG006` breakpoint fora do escopo; `LEG007` hex/valor visual local; `LEG008` alias/configuração antiga; `LEG009` importação direta proibida; `LEG010` fonte antiga.

Hex e valores brutos são permitidos somente nas declarações primitivas nomeadas de `src/design-system/tokens.css`, quando correspondem ao contrato canônico. O mesmo valor em componente, rota, recipe ou configuração é `LEG007`; tokens semantic/component devem referenciar a variável primitive, não repetir o literal.

O modo estrito retorna exit code `1` para qualquer finding `error`, `0` quando o escopo está limpo e `2` quando a configuração do auditor é inválida. Fixtures controladas MUST exercitar cada regra.
