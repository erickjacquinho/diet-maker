# Tarefas

- [x] Migration `20261030160000_imports.sql` (`app.import_runs`)
- [x] `defineEndpoint` com `rawBody` e `apiRequest` com corpo bruto
- [x] Leitor v1/v2 (`nutridiet-reader.ts`) e importador (`nutridiet-importer.ts`)
- [x] Rota `POST /api/v1/imports/nutridiet` e cliente `importsApi`
- [x] Testes (`tests/server/nutridiet-import.test.ts`, `define-endpoint.test.ts`)
- [ ] Validar com um `.nutridiet` real exportado pelo app e no Supabase local (Docker)
- [ ] UI de importação e limpeza opcional do armazenamento local (F5)
- [ ] Tabela/estratégia para `objectiveOptions` e perfil (`account`)
