import * as React from "react";

/**
 * Creates a strongly typed React Context and hook for Compound Components.
 * Throws a clear developer-friendly error if the component is used outside its Provider.
 */
export function createCompositionContext<TContextValue>(
  componentName: string,
  providerName?: string
) {
  const CompositionContext = React.createContext<TContextValue | undefined>(undefined);

  function useCompositionContext(): TContextValue {
    const context = React.useContext(CompositionContext);
    if (context === undefined) {
      throw new Error(
        `<${componentName}> compound subcomponent must be rendered within a <${
          providerName || `${componentName}.Provider`
        }>.`
      );
    }
    return context;
  }

  return [CompositionContext.Provider, useCompositionContext, CompositionContext] as const;
}
