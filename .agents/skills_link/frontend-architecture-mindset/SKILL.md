---
name: frontend-architecture-mindset
description: Frontend architecture mindset, 3D state scoping (URL vs Server vs Client), render tree optimization, and SSR hydration safety.
license: MIT
---

# Frontend Architecture Mindset & Blueprinting

High-level architectural discipline for structuring modern React and web application frontends.

## The 3 Dimensions of State Scoping

Before creating a component or writing a single line of state code, classify every piece of data into its explicit layer:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. URL State (Router / SearchParams)                        │
│    - Filters, active tabs, search queries, pagination       │
│    - Single source of truth for shareable / bookmarkable UI │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 2. Server State (TanStack Query / SWR / Server Components)  │
│    - API responses, database records, async data            │
│    - Owned by backend; cached and invalidated on client     │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 3. Client State (Zustand / React Context / useState)        │
│    - Ephemeral UI state: modal open/close, drag state,      │
│      unsubmitted form values                                │
│    - Pure local interactivity                               │
└─────────────────────────────────────────────────────────────┘
```

### Golden Rules of State Ownership
1. **Never Sync Server State to Local State**: Do not copy query results into `useState` unless creating an editable local draft.
2. **Prefer URL State for Navigation**: If changing a filter should survive a page refresh, put it in `URLSearchParams`.

---

## Component Blueprinting & Atomic Decomposition

Break down UI into 4 explicit component tiers:

1. **Atoms (Primitives)**: Pure visual components with zero state or business logic (`Button`, `Input`, `Badge`, `Avatar`).
2. **Molecules (Composite Controls)**: Combinations of atoms with local interactive state (`SearchInputWithClear`, `DropdownMenu`).
3. **Organisms (Domain Features)**: Feature-rich components connected to server data or state stores (`UserHeaderProfile`, `BillingInvoiceTable`).
4. **Pages / Templates (Layouts)**: Route-level orchestrators responsible for data fetching, layout composition, and page meta (`DashboardPage`).

---

## Render Tree Optimization & Hydration Rules

### 1. Push State Down
Prevent full page re-renders by pushing state down to the narrowest sub-tree that requires it.

```tsx
// BAD: Typing in Search input re-renders heavy Table and Sidebar
export function Dashboard() {
  const [query, setQuery] = useState('');
  return (
    <div>
      <SearchInput value={query} onChange={setQuery} />
      <HeavyTable filter={query} />
      <HeavySidebar />
    </div>
  );
}

// GOOD: Isolate input state or pass query via URL / Narrow hook
```

### 2. Hydration Mismatch Safety
When rendering dynamic browser-only values (dates, window dimensions, localStorage):

```tsx
import { useState, useEffect } from 'react';

export function ClientOnlyTimestamp({ date }: { date: Date }) {
  const [formatted, setFormatted] = useState<string | null>(null);

  useEffect(() => {
    // Executes only on client, avoiding SSR hydration mismatch
    setFormatted(date.toLocaleDateString());
  }, [date]);

  if (!formatted) return <span className="animate-pulse bg-gray-200 h-4 w-16 rounded inline-block" />;

  return <span>{formatted}</span>;
}
```

---

## Frontend Architecture Checklist

- [ ] Is URL state used for bookmarkable filters and tabs?
- [ ] Is server data managed via query cache (not local `useState`)?
- [ ] Is state pushed down to the lowest possible component node?
- [ ] Are atoms/primitives decoupled from domain business logic?
- [ ] Are SSR hydration mismatches guarded with `useEffect` or client guards?
