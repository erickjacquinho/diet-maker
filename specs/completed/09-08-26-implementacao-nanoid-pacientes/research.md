# Technical Research: NanoID Patient Identifiers & Medical Record Code

## Decision 1: NanoID Library & Identifier Length

- **Decision**: Adopt NanoID with 8 alphanumeric characters (base62 dictionary: `A-Za-z0-9`).
- **Rationale**: 8 base62 characters yield $62^8 \approx 2.18 \times 10^{14}$ possible unique combinations, which is more than sufficient to eliminate collision risk in a local/online diet software context while maintaining extremely short, clean URLs (`/pacientes/k8Xm2P9q`).
- **Alternatives Considered**:
  - Raw UUID v4 (`550e8400-e29b-41d4-a716-446655440000`): Too long, visually ugly in URLs.
  - Sequential Numeric IDs (`/pacientes/1`): Predictable, vulnerable to enumeration attacks, leaks total patient count.
  - Name Slugs (`/pacientes/joao-silva`): Leaks PII in server logs, breaks when patient changes name.

## Decision 2: Medical Record Code Format

- **Decision**: `P-XXXX` (e.g., `P-0001`, `P-0042`) assigned automatically during patient registration.
- **Rationale**: Provides clear human-readable clinical reference in UI components while keeping URLs opaque and secure.
- **Alternatives Considered**:
  - Pure numbers (`42`): Easily confused with age, weight, or dates in tables.
  - Complex alphanumerics (`CLI-2026-X9`): Unnecessarily verbose for clinical UI badges.

## Decision 3: Backward Compatibility for Legacy IDs

- **Decision**: Support transparent lookup of legacy IDs (format `pat-[timestamp]-[suffix]`) by mapping them to their corresponding NanoID record and performing client-side route replacement (`router.replace('/pacientes/[nanoid]')`).
- **Rationale**: Guarantees zero broken links for existing users or bookmarks.
