---
name: code-reviewer-expert
description: Code review audit framework, hierarchy of concerns, TypeScript type safety, error resilience, and review output formatting.
license: MIT
---

# Code Reviewer Expert

Systematic code review methodology focused on correctness, maintainability, performance, and type safety.

## Review Hierarchy of Concerns

When reviewing code or pull requests, evaluate issues in order of severity:

1. **Correctness & Logic Bugs**: Does the code fulfill its contract? Are edge cases (null, empty array, concurrent mutations) handled?
2. **Security & Data Safety**: Are inputs validated/sanitized? Are authorization checks (RLS/JWT) present? Are API secrets exposed?
3. **Type Safety & Contracts**: Are TypeScript types strict (`any` avoided)? Are API interfaces preserved without breaking changes?
4. **Performance & Resource Management**: Are N+1 queries present? Unbounded memory allocations? Missing React keys or missing dependencies in hooks?
5. **Maintainability & Readability**: Is logic self-explanatory? Are abstractions over-engineered or missing?

---

## Code Review Rubric & Audit Items

### 1. TypeScript & Type Hygiene
- ❌ **Reject**: `any` types, type assertions (`as unknown as Target`), suppressed compiler errors (`@ts-ignore`).
- ✅ **Require**: Explicit return types on exported functions, strict `Zod` schemas for external data, discriminated unions for state models.

```typescript
// BAD: Type swallowing
function parsePayload(data: any) {
  return (data as any).user.name;
}

// GOOD: Type-safe runtime parsing
import { z } from 'zod';

const UserPayloadSchema = z.object({
  user: z.object({
    name: z.string(),
  }),
});

function parsePayload(data: unknown) {
  return UserPayloadSchema.parse(data).user.name;
}
```

### 2. Error Handling & Resilience
- ❌ **Reject**: Silent `try/catch` blocks that swallow exceptions or return fallback empty objects without logging.
- ❌ **Reject**: Catching errors and throwing uninformative strings (`throw "Error"`).
- ✅ **Require**: Domain-specific Error classes, structured logging, and user-facing actionable error messages.

### 3. Frontend / React Hygiene
- ❌ **Reject**: Mutating state directly (`state.items.push(item)`).
- ❌ **Reject**: Missing `key` props or using array index `key={index}` on re-orderable lists.
- ❌ **Reject**: Derived state stored in `useState` instead of calculated during render or `useMemo`.

---

## Actionable Review Output Format

Structure code review feedback cleanly:

```markdown
### 🔴 Critical Blockers (Must Fix Before Merge)
- **File**: `src/api/users.ts:L45`
- **Issue**: Unhandled null pointer exception when `session.user` is undefined.
- **Fix**: Add null check or wrap in optional chaining: `session?.user?.id`.

### 🟡 Performance & Architecture Improvements
- **File**: `src/components/UserList.tsx:L88`
- **Issue**: N+1 query inside map loop fetching user profiles sequentially.
- **Fix**: Batch fetch user profiles with `in` query or TanStack Query `useQueries`.

### 🟢 Nitpicks & Clean Code Suggestions
- **File**: `src/utils/format.ts:L12`
- **Issue**: Function `calc` has ambiguous naming. Rename to `calculateTaxAmount`.
```
