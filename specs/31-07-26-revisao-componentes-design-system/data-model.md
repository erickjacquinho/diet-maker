# Data Model & Component Audit Schema

## Entity: ComponentReviewRecord

```ts
interface ComponentReviewRecord {
  componentPath: string;
  category: 'atom' | 'molecule' | 'organism' | 'screen';
  hasTable: boolean;
  hasButtons: boolean;
  hasTypography: boolean;
  legacyTokensFound: string[];
  status: 'pending' | 'reviewing' | 'compliant';
}
```

## Diretrizes de Formatação de Tabelas

```tsx
// Padrão Único de Tabela do Design System
<div className="overflow-x-auto rounded-surface border border-border-subtle bg-surface">
  <table className="w-full text-left border-collapse">
    <thead className="bg-surface-subtle border-b border-border-subtle">
      <tr>
        <th className="px-4 py-3 text-style-legal text-text-muted font-semibold">Coluna 1</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-border-subtle">
      <tr className="hover:bg-surface-hover transition-colors duration-standard">
        <td className="px-4 py-3 text-style-body text-text-primary">Dado 1</td>
      </tr>
    </tbody>
  </table>
</div>
```
