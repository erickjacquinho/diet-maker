# Audit Contract: verify-design-system-legacy

**Branch**: `02-08-26-eliminacao-debitos-design-system` | **Date**: 2026-08-02

Contrato da interface exposta pelo auditor de legado do design system. Obrigatório para a instrumentação LEG011–LEG017 (Estado de implementação).

## Módulo `scripts/design-system-legacy-rules.mjs`

```ts
export const legacyRules: ReadonlyArray<{
  code: string;        // 'LEG001'..'LEG017'
  rule: string;        // slug kebab-case
  pattern: RegExp;     // com flag 'g'; sem \b após ']'; âncora de início de token
  message: string;     // nominativo + canônico sugerido
}>
```

- Lista ordenada por `code`; IDs de **17 regras** após a instrumentação.
- Toda regra tem fixture de aceitação e de rejeição em `tests/fixtures/design-system-legacy/`.

## Módulo `scripts/verify-design-system-legacy.mjs`

```ts
export async function verifyLegacy(
  rootDir: string,
  options?: {
    paths?: string[];   // default ['src', 'tailwind.config.js', 'components.json']
    mode?: 'inventory' | 'strict';
    json?: boolean;
  },
): Promise<{
  mode: string;
  findings: Array<{
    code: string; rule: string; path: string; line: number;
    message: string; severity: 'error';
  }>;
  counts: { files: number; findings: number };
}>
```

### Semântica de exceções (PATH_EXEMPTIONS)

- Prefixos relativos, normalizados com `/`: `src/components/ui/` e `src/design-system/`.
- Um `path` que inicia com um prefixo isento **não gera findings** (todas as regras).
- Exceções por arquivo existentes (`tokens.css` → LEG001/005/007; `text-styles.ts` → LEG002/004) **são removidas** — subsumidas pelo prefixo `src/design-system/`.
- `tests/fixtures/**` nunca é isento.
- CLI `--strict --json` reproduz exatamente o mesmo resultado que a chamada `verifyLegacy(process.cwd(), { mode: 'strict', json: true })`.

### CLI

| Flag | Efeito |
|------|--------|
| `--strict` | Modo `strict` (exit code 1 se houver findings) |
| `--json` | Emite `JSON.stringify(result, null, 2)` em stdout |
| `--paths a,b,c` | Substitui os paths default |

Exit codes: `0` = sem findings; `1` = findings; `2` = falha de configuração/escopo.

## Teste `tests/design-system/legacy-audit.test.ts`

| Teste | Contrato |
|-------|----------|
| zero findings | `verifyLegacy(process.cwd(), { mode: 'strict' })` → `findings == []` |
| cobertura de regras | varredura de `tests/fixtures/design-system-legacy` produz exatamente o conjunto `{LEG001..LEG017}` |
| isenção de ui | `verifyLegacy(process.cwd(), { paths: ['src/components/ui'] })` → `findings == []` |
| isenção de design-system | `verifyLegacy(process.cwd(), { paths: ['src/design-system'] })` → `findings == []` |

## Registro documental

- `design-system/components/registry.json`: registrar a exceção `src/components/ui/**` (justificativa: primitivos shadcn preservados) e atualizar o `baseline` para zero findings após a migração.
- `design-system/13-implementation-and-compliance.md`: descrever as 17 regras e o estado verificado, somente com evidência (constituição V).
