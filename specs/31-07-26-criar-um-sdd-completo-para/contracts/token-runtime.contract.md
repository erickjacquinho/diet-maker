# Token Runtime Contract

## Public entrypoint

`src/design-system/index.ts` MUST export:

- `tokenNames`: nomes válidos por camada;
- `textStyle(styleId)`: recebe somente `TextStyleId` e retorna a recipe de texto;
- `recipes`: recipes de componentes sem valores visuais livres;
- tipos `TokenId`, `TextStyleId`, `RecipeVariant`, `RecipeState` e `MacroKind`.

## Rules

1. Valores runtime vivem em `tokens.css`; TypeScript não duplica hex, radius ou escala.
2. Todo alias Tailwind/Shadcn aponta para uma variável semantic/component válida.
3. `textStyle()` rejeita IDs fora do catálogo.
4. Recipes não aceitam `color`, `fontSize`, `fontWeight`, `radius`, `shadow` ou `className` arbitrários para alterar aparência.
5. Valores dinâmicos são aceitos apenas para dados/medição documentados.

## Contract examples

```ts
textStyle('page-title')
recipes.button({ variant: 'primary', size: 'standard', state: 'default' })
```

```ts
// inválido: não existe no contrato
textStyle('text-2xl')
recipes.button({ color: '#ff0000' })
```
