import registryJson from "../../../design-system/components/registry.json";
import { DesignSystemShowcase } from "./components/DesignSystemShowcase";

export default function DesignSystemPage() {
  const componentRegistry = registryJson.components.map((component) => ({
    id: component.id,
    name: component.name,
    primaryCategory: component.primaryCategory,
    currentLayer: component.currentLayer,
    targetLayer: component.targetLayer,
    lifecycle: component.lifecycle,
    specStatus: component.specStatus,
  }));

  return <DesignSystemShowcase componentRegistry={componentRegistry} categoryCount={registryJson.categories.length} />;
}
