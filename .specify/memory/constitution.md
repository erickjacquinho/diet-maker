# NutriDiet Local Pro Constitution

## Core Principles

### I. Atomic Design Architecture [NON-NEGOTIABLE]

Toda interface MUST respeitar a hierarquia `ui → atoms → molecules → organisms → templates → app` definida pelo projeto. Atomic Design determina responsabilidade, dependências e localização; categoria visual determina aparência, estados e comportamento. Nenhuma camada pode importar uma camada superior, e primitives em `src/components/ui` MUST permanecer genéricos e livres de domínio.

### II. Canonical Design System [NON-NEGOTIABLE]

`design-system/README.md` e seus documentos normativos são a única fonte vigente para tokens, plataforma, linguagem visual, tipografia, geometria, cores, movimento, acessibilidade, categorias e contratos de componentes. Categorias MUST consumir fundamentos globais; perfis individuais MUST consumir categorias. Valores ou regras não previstos MUST seguir o processo de governança, nunca ser inventados localmente.

Artefatos em `refs/`, protótipos HTML e ADRs substituídos são históricos e MUST NOT concorrer com o design system canônico.

### III. Desktop Scope and Accessibility [NON-NEGOTIABLE]

O produto é exclusivamente web desktop a partir de `1024px`; mobile, tablet, mobile-first e dark mode estão fora do escopo atual. Toda interface MUST cumprir WCAG 2.2 AA, semântica HTML aplicável, nome/role/value acessíveis, operação por teclado e foco visível. Dimensões de controles, contraste, focus ring, ícones e movimento MUST seguir os valores canônicos, inclusive os presets desktop compact e standard.

### IV. Test-First Quality and Isolation

Contratos verificáveis e cenários de falha MUST preceder validadores e mudanças de implementação. Testes novos deste fluxo MUST residir sob `tests/`, ser determinísticos e não mutar ambiente global ou dados externos. Validadores MUST produzir findings nominais, acionáveis e reproduzíveis.

### V. Spec-Driven Execution

Planos aprovados MUST ser executados por `/speckit-implement`. Documentação MUST distinguir estado proposto, documentado, implementado, conforme, migration-required, deprecated e removed. Nenhuma entrega documental pode declarar conformidade do código sem evidência e validação correspondentes.

## Governance

Esta constituição prevalece sobre preferências individuais de implementação e referencia o design system canônico para decisões visuais. Emendas exigem documentação explícita, validação humana, atualização coordenada de `agents.md` quando o roteamento for afetado e incremento de versão.

**Version**: 1.1.0 | **Ratified**: 2026-07-29 | **Last Amended**: 2026-07-31
