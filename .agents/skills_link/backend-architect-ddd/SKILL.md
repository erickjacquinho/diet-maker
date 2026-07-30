---
name: backend-architect-ddd
description: Hexagonal architecture, Domain-Driven Design (DDD), circuit breaker retry with jitter, idempotent consumers, and Redis caching.
license: MIT
---

# Backend Architect & Domain-Driven Design (DDD)

Architectural standards for building scalable, decoupled, and fault-tolerant backend systems.

## Architectural Layers (Hexagonal / Clean Architecture)

Maintain strict dependency isolation between domain business logic and external infrastructure:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Domain Layer (Pure Business Entities & Rules)            │
│    - Zero dependencies on frameworks, databases, or HTTP    │
└──────────────────────────────▲──────────────────────────────┘
                               │ Depends on interfaces only
┌──────────────────────────────┴──────────────────────────────┐
│ 2. Application Layer (Use Cases & Workflows)                │
│    - Orchestrates domain objects to execute business goals  │
└──────────────────────────────▲──────────────────────────────┘
                               │ Implements ports / interfaces
┌──────────────────────────────┴──────────────────────────────┐
│ 3. Infrastructure & Primary Adapters                        │
│    - PostgreSQL/Supabase, Redis, BullMQ, HTTP Controllers   │
└─────────────────────────────────────────────────────────────┘
```

---

## Domain-Driven Design (DDD) Core Concepts

1. **Bounded Context**: Define explicit domain boundaries (e.g., *Billing Context* vs *Order Management Context*). Do not share database entities across contexts.
2. **Aggregates & Entities**: An Aggregate is a cluster of domain objects treated as a single unit for data changes, led by an Aggregate Root.
3. **Domain Events**: Publish domain events (`OrderPlaced`, `InvoiceGenerated`) to decouple async side-effects.

---

## Resilience & Distributed Reliability Patterns

### 1. Circuit Breaker & Retry with Exponential Backoff

Always wrap external service calls (third-party APIs, payment gateways) in retry policies with jitter.

```typescript
import pRetry from 'p-retry';

export async function callExternalGatewayWithRetry<T>(fn: () => Promise<T>): Promise<T> {
  return pRetry(fn, {
    retries: 3,
    factor: 2,
    minTimeout: 200,
    maxTimeout: 2000,
    randomize: true, // Add jitter to prevent thundering herd
    onFailedAttempt: (error) => {
      console.warn(`Attempt ${error.attemptNumber} failed. Retrying...`);
    },
  });
}
```

### 2. Idempotent Consumer & Outbox Pattern

When processing asynchronous events from queues (BullMQ / RabbitMQ / Inngest):

```typescript
// Ensure background event processing is idempotent
export async function processPaymentWebhook(eventId: string, payload: WebhookPayload) {
  // 1. Check if event was already processed
  const processed = await redis.sismember('processed_webhooks', eventId);
  if (processed) {
    return; // Ignore duplicate delivery
  }

  // 2. Process transaction inside database unit of work
  await db.$transaction(async (tx) => {
    await tx.orders.update(/* ... */);
    await redis.sadd('processed_webhooks', eventId);
  });
}
```

---

## Caching Architecture Rules

1. **Cache-Aside Pattern (Redis)**: Query cache first. On cache miss, query DB and populate cache with TTL.
2. **Cache Invalidation**: Prefer explicit event-driven invalidation over passive TTL expiration for critical business data.
