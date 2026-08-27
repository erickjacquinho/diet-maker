---
name: proj-table-adequation-v2
description: Audit and adapt project tables against the current DataTable, design-system catalog, tokens, accessibility rules, and composed child components without duplicating volatile contracts in the skill.
---

# Table Adequation v2

This skill is runtime-driven. It must not assume that the table API, token names, component variants, or child-component catalog in this file are current.

## Workflow

1. Resolve the target component and the current canonical table contract:

   ```bash
   npm run resolve:table -- --target <path> --json
   ```

2. Run the executable conformance audit:

   ```bash
   npm run verify:table -- --target <path> --strict
   ```

3. Read the category, profile, registry entries, global rules, and source files reported by the resolver. The resolver is authoritative for the current API; the Design System is authoritative for intent and semantics.

4. Adapt the table using the current canonical molecule and atom. Discover composed children from imports and JSX rather than relying on a fixed list of child components.

5. Re-run the resolver, targeted component tests, type-check, and the project Design System audits. A result is complete only when the target has no table errors and any remaining warnings are explicitly explained.

## Source-of-truth policy

- Do not copy props, classes, heights, z-index values, or token lists into this skill.
- Resolve the live TypeScript API from the canonical implementation and its exported types.
- Resolve visual intent from `design-system/components/registry.json`, the referenced category, profile, and global rule files.
- Resolve actual token availability from the project token and Tailwind configuration.
- Treat disagreement between implementation, registry, profile, or category as `CONTRACT_DRIFT`; report it instead of guessing.
- Treat a missing child catalog entry as `needs-review`, unless the child is external or a framework primitive.

## Scope and exceptions

The normal outcome is a semantic `DataTable` with typed columns, stable row IDs, explicit states, accessible selection/sorting, and canonical tokens. Raw table markup is allowed only for the registered canonical primitive or an explicit Design System exception. The audit must record the exception path and reason.

## Completion contract

The audit report must include the target, resolved canonical sources, detected table props, column inventory, child dependencies, findings with file/line evidence, test discovery, and the exact commands run. `--strict` exits non-zero for errors or contract drift; warnings remain visible for human review.

