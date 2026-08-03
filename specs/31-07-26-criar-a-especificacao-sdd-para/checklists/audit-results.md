# Component catalog audit results

Execution date: 2026-07-31  
Command: `npm test -- tests/design-system/component-catalog.test.mjs`  
Result: PASS — 1 file, 28 tests, 24 finding codes exercised with isolated mutation and clean-workspace restoration.

## Controlled failure matrix

| Group | Codes | Failure injection | Restoration |
| --- | --- | --- | --- |
| source/export | `SRC001`, `SRC002`, `SRC003`, `EXP001`, `EXP002` | unregistered source, missing source, unsafe shared source, uncovered export, stale export | fresh valid fixture returns zero findings |
| registry/category/trait | `REG001`, `REG002`, `CAT001`, `CAT002`, `CAT003`, `TRT001`, `TRT002` | invalid root/field/enum/path/relation, duplicate ID/export/relation, unknown category, incomplete category, local foundation, unknown trait, forbidden override | fresh valid fixture returns zero findings |
| profile/state/token | `PRF001`, `PRF002`, `PRF003`, `STA001`, `TOK001`, `TOK002` | missing profile, divergent inheritance, duplicated contract, missing states, arbitrary token in category/profile, local value | fresh valid fixture returns zero findings |
| governance/docs/sync/proposal | `GOV001`, `GOV002`, `DOC001`, `DOC002`, `SYNC001`, `PROP001` | absent exception ref, incomplete decision, placeholder, broken/missing foundation link, explicit conflict, implemented proposal, deprecated proposal | fresh valid fixture returns zero findings |

## Convergence regression fixtures

`governance/invalid-schema-missing-lifecycle.json`, `invalid-token-arbitrary.md`, `invalid-missing-foundation.md`, `invalid-incomplete-decision.md` e `invalid-deprecated-proposal.json` são consumidos pelos testes de regressão da fase de convergência.

## CLI contract

| Scenario | Expected | Observed |
| --- | --- | --- |
| valid strict catalog | exit 0 | PASS |
| blocking catalog finding | exit 1 | PASS |
| unreadable/invalid registry configuration | exit 2 | PASS |
| JSON and human output | same ordered findings | PASS |

## Canonical strict gate

Command: `npm run verify:design-system`  
Elapsed wall time: under 5 seconds
Result: PASS

```text
39 current source files covered
0 uncovered public visual exports
11 categories homologated
4 proposed components specified
0 blocking findings
```

The result homologates the documentation catalog only. It does not claim that current UI source code already matches the visual system.
