# Contrato de fixtures

`tests/fixtures/component-adequation.ts` contém somente literais sintéticos,
imutáveis por convenção e sem dependência de stores, IndexedDB, PGlite,
localStorage ou perfil do usuário. `synthetic-*` identifica dados de teste e
nunca pode ser convertido em identificador clínico.

Os casos cobrem valores nutricionais disponíveis, zero real e ausência (`null`),
nomes longos, listas de busca, snapshot histórico, expansão e estados
`empty/loading/error/disabled/readonly`. Cada teste deve importar a fixture e
observar a interface pública; não deve mutar o objeto nem instalar mocks em
globais compartilhados. Contextos de navegador usam perfil temporário e são
descartados ao fim da execução.
