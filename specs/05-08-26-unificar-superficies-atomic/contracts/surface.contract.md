# Surface Contract

## Purpose

`Surface` é o wrapper atômico genérico para superfícies visuais do produto. Ele centraliza o contrato de container e deixa conteúdo, domínio e ações para os consumidores.

## Layer and dependencies

- Layer: `atom`
- Category: `surfaces`
- Nature: `product-generic`
- May depend on: `src/components/ui/card.tsx`, `src/design-system/recipes.ts`, `src/lib/utils.ts`
- Must not depend on: molecules, organisms, templates, app routes, stores or nutrition-domain types

## Composition API

```tsx
<Surface variant="subtle" density="standard">
  {children}
</Surface>
```

The contract uses `children` for structure and the canonical `default`/`subtle` variants for visual intent. Density is `compact`, `standard`, or `highlight`; in-flow surfaces use the category's `shadow-none` elevation policy. It must not expose a growing set of boolean mode flags, domain tones, or render props for static regions.

## Required behavior

- forwards valid HTML attributes and class composition;
- preserves visible focus and accessible semantics supplied by the consumer;
- renders no domain copy and owns no business state;
- exposes only canonical tokens and explicit `default`/`subtle` variants;
- does not model `inline` as a surface variant; consumers that have no own box remain layout-only or use a documented exception;
- does not expose nutrition tones or a floating elevation mode;
- remains stateless and synchronous.

## Non-goals

- no nutrition tone map;
- no automatic header/footer/title;
- no click behavior by default;
- no persistence, fetching or context provider;
- no direct modification of the Shadcn primitive contract beyond composition.
