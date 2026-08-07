# Migration Plan — Roadmap de Migração e Conformidade

> **Status:** Roadmap de migração, critérios de aceitação e registro de débitos legados.

## 1. Critérios de Aceitação para Homologação (DoD)

Um componente ou tela atinge conformidade total com o Design System quando:

1. **Zero Valores Arbitrários:** Não possui utilitários Tailwind arbitrários (`text-[Npx]`, `w-[Npx]`, Hex literais).
2. **Acessibilidade Verificada:** Passa em testes de teclado, anel de foco e contraste WCAG 2.2 AA.
3. **Registro Executável Sincronizado:** Está listado com perfil válido e categorizado em `design-system/components/registry.json`.
4. **Verificação Limpa:** Os scripts `npm run verify:design-system` e `npm run verify:links` executam com 0 achados de erro.

## 2. Ordem de Migração Prioritária

1. **Fase 1 — Fundação & Tokens:** Substituir tokens legados e cores hardcoded em `src/design-system/`.
2. **Fase 2 — Átomos Primitivos (`src/components/ui/` e `src/components/atoms/`):** Garantir contratos limpos e preservação dos primitivos Shadcn.
3. **Fase 3 — Moléculas & Organismos:** Alinhar cards de métricas, tabelas de alimentos e cabeçalhos de rotina.
4. **Fase 4 — Páginas & Rotas:** Homologar views de pacientes, dietas, prescrição e receitas.

## 3. Comandos de Validação Contínua

- `npm run verify:design-system` : Executa validação estrita do registro, categorias e perfis.
- `npm run verify:design-system-legacy` : Verifica débitos legados pendentes de migração.
- `npm run verify:links` : Audita todos os links locais de documentação em Markdown.
