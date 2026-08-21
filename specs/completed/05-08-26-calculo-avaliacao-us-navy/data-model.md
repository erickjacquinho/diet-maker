# Data Model: Avaliação física com cálculo US Navy

## BodyAssessment

`BodyAssessment` representa uma avaliação física datada persistida por paciente.

| Campo | Tipo | Regra |
|---|---|---|
| `id` | `string` | Identificador do registro. |
| `date` | `string` | Data da avaliação. |
| `weightKg` | `number` | Peso informado pelo nutricionista. |
| `bodyFatPercent` | `number` | BF calculado e persistido. |
| `fatMassKg` | `number` opcional | Massa gorda calculada. |
| `muscleMassKg` | `number` | Campo legado usado para persistir massa magra calculada. |
| `waistCm` | `number` | Cintura em cm. |
| `neckCm` | `number` opcional | Pescoço em cm. |
| `scapulaCm` | `number` opcional | Escápula em cm. |
| `bustCm` | `number` opcional | Busto em cm. |
| `leftArmCm`, `rightArmCm` | `number` opcional | Braços em cm. |
| `abdomenCm` | `number` opcional | Barriga/abdômen em cm; entra no ramo masculino. |
| `hipCm` | `number` opcional | Quadril em cm; entra no ramo feminino. |
| `leftProximalThighCm`, `rightProximalThighCm` | `number` opcional | Coxas proximais em cm. |
| `leftDistalThighCm`, `rightDistalThighCm` | `number` opcional | Coxas distais em cm. |
| `leftCalfCm`, `rightCalfCm` | `number` opcional | Panturrilhas em cm. |

Novos campos são opcionais na interface para leitura de JSON legado. O modal usa um rascunho completo e converte entradas vazias em `NaN` até a validação.

## BodyCompositionResult

```ts
interface BodyCompositionResult {
  bodyFatPercent: number | null;
  fatMassKg: number | null;
  leanMassKg: number | null;
  isValid: boolean;
  error?: string;
}
```

Quando `isValid` é `false`, os três valores numéricos são `null` e `error` contém uma mensagem estável para o diálogo.
