# Data Model: NanoID Patient Identifiers & Medical Record Code

## Entities & Attributes

### Patient Entity (`Patient`)

| Field | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | NanoID (8 chars, primary key & route identifier) | `"k8Xm2P9q"` |
| `code` | `string` | Yes | Sequential medical record code for UI display | `"P-0042"` |
| `legacyId` | `string` | Optional | Original ID format for backward compatibility lookup | `"pat-17182938123-x9f2"` |
| `name` | `string` | Yes | Patient full name | `"João Silva"` |
| `initials` | `string` | Yes | Two-letter initials | `"JS"` |
| `email` | `string` | Optional | Contact email | `"joao@email.com"` |
| `phone` | `string` | Optional | WhatsApp / phone | `"(11) 98765-4321"` |
| `createdAt` | `string` | Yes | ISO date string | `"2026-08-09T00:00:00Z"` |

## Validation Rules

1. **`id` Validation**: Must match regex `/^[A-Za-z0-9_-]{8,12}$/`.
2. **`code` Validation**: Must match regex `/^P-\d{4,}$/`.
3. **Uniqueness**: `id` and `code` must be unique across all patient records.

## Related State / Collections

- `StoredDietRecord`: References `patientId: string` matching patient NanoID.
- `BodyAssessment`: References `patientId: string` matching patient NanoID.
- `ConsultationRecord`: References `patientId: string` matching patient NanoID.
