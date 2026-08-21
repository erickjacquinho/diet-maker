# Showcase Component & Token Registry Contract

## Interface Contract: `ShowcaseRegistry`

### Input Contract: Token Catalog Metadata
```typescript
export interface TokenMetadata {
  id: string;
  name: string;
  layer: 'reference' | 'system' | 'component';
  type: 'color' | 'typography' | 'spacing' | 'shadow' | 'radius';
  cssVariable: string;
  sampleValue: string;
  contrastRatio?: string;
  wcagPass?: boolean;
}
```

### Input Contract: Component Showcase Spec
```typescript
export interface ComponentShowcaseSpec {
  id: string;
  name: string;
  category: 'atoms' | 'molecules' | 'organisms';
  lifecycle: 'stable' | 'proposed' | 'migration-required';
  description: string;
  defaultProps: Record<string, any>;
  controls: {
    name: string;
    type: 'select' | 'boolean' | 'text';
    options?: string[];
  }[];
  render: (props: Record<string, any>) => React.ReactNode;
}
```

### Output Contract: Showcase Page State
```typescript
export interface ShowcaseState {
  searchQuery: string;
  selectedCategory: string;
  viewMode: 'client-showcase' | 'dev-spec';
  theme: 'dark' | 'light';
}
```
