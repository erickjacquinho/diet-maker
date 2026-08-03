import registry from "../../../design-system/components/registry.json";
import { recipes, textStyle, textStyleContracts, textStyleIds, tokenNames, type RecipeState } from "@/design-system";

const layers = [
  { id: "reference", title: "Reference", values: tokenNames.reference },
  { id: "system", title: "System", values: tokenNames.system },
  { id: "component", title: "Component", values: tokenNames.component },
] as const;

const recipeExamples = [
  { name: "Button primary", className: recipes.button({ variant: "primary", size: "standard", state: "default" }) },
  { name: "Button loading", className: recipes.button({ variant: "secondary", size: "compact", state: "loading" }) },
  { name: "Input error", className: recipes.input({ size: "standard", state: "error" }) },
  { name: "Badge protein", className: recipes.badge({ tone: "protein" }) },
  { name: "Card standard", className: recipes.card({ density: "standard" }) },
] as const;

const canonicalStates: readonly RecipeState[] = ["default", "hover", "pressed", "focus-visible", "selected", "disabled", "loading", "error", "empty", "read-only"];

interface RegistryComponent {
  id: string;
  lifecycle: string;
}

interface RegistryCategory {
  id: string;
  name: string;
  lifecycle: string;
  consumers: string[];
  allowedTraits: string[];
}

const lifecycleCounts = (registry.components as RegistryComponent[]).reduce<Record<string, number>>((counts, component) => {
  counts[component.lifecycle] = (counts[component.lifecycle] ?? 0) + 1;
  return counts;
}, {});

export default function DesignSystemPage() {
  return (
    <main className="mx-auto flex w-full max-w-container-page flex-col gap-8 p-8">
      <header className="flex flex-col gap-3 border-b border-border-divider pb-6">
        <span className={textStyle("overline")}>NutriDiet runtime</span>
        <h1 className={textStyle("page-title")}>Design System canônico</h1>
        <p className={textStyle("page-subtitle")}>
          Vocabulário executável derivado exclusivamente dos fundamentos normativos. Estados do catálogo abaixo refletem o registry e não promovem propostas.
        </p>
      </header>

      <section className="flex flex-col gap-4" aria-labelledby="token-layers-title">
        <h2 id="token-layers-title" className={textStyle("section-title")}>Camadas de tokens</h2>
        <div className="grid grid-cols-3 gap-4">
          {layers.map((layer) => (
            <article key={layer.id} className={recipes.card({ density: "standard" })}>
              <h3 className={textStyle("card-title")}>{layer.title}</h3>
              <ul className="mt-3 flex flex-col gap-2">
                {layer.values.map((token) => <li key={token} className={textStyle("data-id")}>{token}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="text-styles-title">
        <h2 id="text-styles-title" className={textStyle("section-title")}>Text styles</h2>
        <div className="grid grid-cols-3 gap-3">
          {textStyleIds.map((styleId) => (
            <article key={styleId} className={recipes.card({ density: "compact" })}>
              <p className={textStyle(styleId)}>{styleId}</p>
              <span className={textStyle("metadata")}>{textStyleContracts[styleId].allowedElements.slice(0, 3).join(", ")}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="states-title">
        <h2 id="states-title" className={textStyle("section-title")}>Estados canônicos</h2>
        <ul className="grid grid-cols-5 gap-2" aria-label="Estados de interação">
          {canonicalStates.map((state) => <li key={state} className={recipes.badge({ tone: state === "error" ? "error" : state === "loading" ? "info" : "default" })}>{state}</li>)}
        </ul>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="categories-title">
        <h2 id="categories-title" className={textStyle("section-title")}>Categorias canônicas</h2>
        <div className="grid grid-cols-3 gap-3">
          {(registry.categories as RegistryCategory[]).map((category) => (
            <article key={category.id} className={recipes.card({ density: "compact" })} data-lifecycle={category.lifecycle}>
              <h3 className={textStyle("card-title")}>{category.name}</h3>
              <p className={textStyle("metadata")}>{category.id} · {category.lifecycle}</p>
              <p className={textStyle("body-secondary")}>{category.consumers.length} consumidores · {category.allowedTraits.length} traits</p>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="recipes-title">
        <h2 id="recipes-title" className={textStyle("section-title")}>Recipes e estados</h2>
        <div className="grid grid-cols-2 gap-4">
          {recipeExamples.map((example) => (
            <article key={example.name} className={recipes.card({ density: "standard" })}>
              <h3 className={textStyle("card-title")}>{example.name}</h3>
              <p className={`${textStyle("data-id")} mt-3 break-words`}>{example.className}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="catalog-title">
        <h2 id="catalog-title" className={textStyle("section-title")}>Estado documental do catálogo</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(lifecycleCounts).sort(([left], [right]) => left.localeCompare(right)).map(([lifecycle, count]) => (
            <span key={lifecycle} className={recipes.badge({ tone: lifecycle === "proposed" ? "warning" : "info" })}>
              {lifecycle}: {count}
            </span>
          ))}
        </div>
        <p className={textStyle("body-secondary")}>
          Componentes `migration-required` permanecem explicitamente pendentes até seus gates de camada. Propostas continuam somente `proposed`.
        </p>
      </section>
    </main>
  );
}
