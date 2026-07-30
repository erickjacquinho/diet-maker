---
name: nextjs-fullstack-master
description: Next.js App Router architecture, React Server Components (RSC) vs Client boundary, typed Server Actions, Route Handlers, and cache revalidation.
license: MIT
---

# Next.js Fullstack Master

Definitive reference and architectural patterns for Next.js App Router (14+) with TypeScript.

## Core Architectural Boundary: RSC vs Client Components

```
┌─────────────────────────────────────────────────────────────┐
│ React Server Components (Default)                           │
│ - Direct database / backend API access                      │
│ - Zero client JavaScript bundle impact                      │
│ - Secure execution (environment secrets stay on server)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Passes serializable props
┌──────────────────────────────▼──────────────────────────────┐
│ Client Components ('use client')                            │
│ - Interactive UI (onClick, onChange, useEffect, useState)   │
│ - Browser APIs (localStorage, geolocation, canvas)          │
│ - Framer Motion animations & visual hooks                   │
└─────────────────────────────────────────────────────────────┘
```

### Boundary Rules
1. **Server First**: Keep components as Server Components by default. Only add `'use client'` at the perimeter leaf nodes that require interactivity.
2. **Pass Server Components as Children**: Pass RSCs as `children` into Client Component providers to avoid demoting server sub-trees to client components.

```tsx
// Client Provider Wrapper
'use client';
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <div className="theme-wrapper">{children}</div>;
}
```

---

## Server Actions & Type Safety

Use Server Actions for mutations with strict `Zod` validation and type-safe action states.

```typescript
// app/actions/user-actions.ts
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

export type ActionState = {
  success: boolean;
  errors?: Record<string, string[]>;
};

export async function updateProfile(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const validated = UpdateProfileSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  // Perform database update
  await db.user.update({ where: { id: userId }, data: validated.data });

  // Revalidate layout cache
  revalidatePath('/dashboard/profile');
  return { success: true };
}
```

---

## Route Handlers (`app/api/.../route.ts`)

Use Route Handlers for public webhooks or REST endpoints consumed outside React.

```typescript
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validate request
    return NextResponse.json({ ok: true, data: body });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Bad Request' }, { status: 400 });
  }
}
```

---

## Caching Strategy & Revalidation

- **Static Cache (SSG)**: Data cached indefinitely until manually invalidated.
- **On-Demand Revalidation**:
  ```typescript
  // Invalidate specific URL path
  revalidatePath('/blog/[slug]', 'page');
  
  // Invalidate tagged cache entries
  fetch('https://api.example.com/products', { next: { tags: ['products'] } });
  revalidateTag('products');
  ```
