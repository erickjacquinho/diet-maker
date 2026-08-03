# Data Model & Audit Schema

## Entity: AuditFinding

Representa uma inconsistência identificada durante a análise do código das telas.

```ts
interface AuditFinding {
  ruleId: 'LEG001' | 'LEG002' | 'LEG003' | 'LEG004' | 'LEG005' | 'LEG006';
  filePath: string;
  lineNumber: number;
  foundValue: string;
  suggestedToken: string;
  severity: 'error' | 'warning';
}
```

### Regras de Auditoria:

- **LEG001**: Paleta Antiga (`warm-*`, `emerald-*`, `teal-*` não semânticos). Substituir por tokens canônicos (`surface`, `text-primary`, `success`, etc.).
- **LEG002**: Text Style Não Nomeado (`text-[11px]`, `text-[9px]`). Substituir por `text-style-legal` ou `text-style-chart-micro`.
- **LEG003**: Border Radius Não Autorizado (`rounded-2xl`, `rounded-xl`). Substituir por `rounded-surface` ou `rounded-control`.
- **LEG004**: Peso Tipográfico Incompatível (`font-black`, `font-bold` em botões). Substituir por `font-semibold` (`button-label`).
- **LEG005**: Animação / Elevação Não Autorizada (`shadow-lg`). Utilizar elevações autorizadas pela recipe.
- **LEG006**: Breackpoints Móbiles Desnecessários (`md:`, `sm:` em layout desktop-first).
