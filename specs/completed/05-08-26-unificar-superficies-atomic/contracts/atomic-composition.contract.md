# Atomic Composition Contract

## Dependency direction

```text
ui/Card → atoms/Surface → molecules → organisms → templates → app
```

The arrow describes allowed composition direction. A lower layer may consume a lower-level primitive, but `Surface` and `ui/Card` must never import a higher layer or domain feature.

## Consumer rules

- `MetricBox` owns metric anatomy, not surface tokens.
- `MacroMetricCard` owns macro display, badge and progress, not card geometry.
- `RecipeCard` owns recipe content and actions, not the generic surface contract.
- `MealItemRow` owns row content and controls, not a new box primitive.
- Organisms own grouping, grid, section and orchestration; they may compose `Surface` and molecules.
- Templates own page skeletons; they must not define a new visual surface variant inline.
- Pages may consume the stable component contract but must not recreate the shared box.

## Shadcn preservation

`src/components/ui/card.tsx` remains generic and free of nutrition/domain dependencies. Product-specific behavior belongs in `Surface` or descendants in the appropriate Atomic layer.

## Validation contract

The implementation is acceptable only if:

1. no migrated consumer contains duplicated surface geometry classes without a documented exception;
2. `Surface` has unit coverage for variants, passthrough and accessibility;
3. direct consumers preserve existing public props and user-facing states;
4. Atomic and component-catalog audits pass;
5. no route or persistent data behavior changes as a side effect.
