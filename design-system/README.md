# NutriDiet Design System — Guia canônico

> **Status documental:** completo e normativo.
> **Status de implementação:** migração pendente; o código atual ainda não está homologado.

## 1. Objetivo

Este diretório define a linguagem visual, tokens, componentes, estados, implementação e governança do NutriDiet.

Ele existe para responder, de forma curta e verificável:

- devemos reutilizar, compor, criar uma variante ou criar um componente?
- qual atmosfera visual, hierarquia, tipografia e sistema de cores orientam a interface?
- quais valores e combinações são permitidos?
- em qual camada arquitetural o componente pertence?
- o componente é genérico ou pertence ao domínio nutricional?
- quando usar Shadcn UI ou Radix?
- qual contrato mínimo um componente precisa oferecer?
- como uma proposta se torna estável, é depreciada e finalmente removida?
- quais componentes existem hoje e quais são apenas propostas?

Este diretório é uma especificação normativa completa. Valores ou casos não previstos não podem ser inventados localmente; precisam passar pelo processo de evolução.

O produto-alvo é exclusivamente web para desktop a partir de `1024px`. Mobile e tablet estão fora do escopo.

## 2. Escopo dos documentos

| Documento | Pergunta principal |
| --- | --- |
| [01 — Princípios e escopo](./01-principles-and-scope.md) | Quais princípios orientam todas as decisões? |
| [02 — Linguagem visual](./02-visual-language.md) | Qual sensação e hierarquia a interface deve transmitir? |
| [03 — Arquitetura de tokens](./03-token-architecture.md) | Como valores se tornam tokens consumíveis? |
| [04 — Sistema de cores](./04-color-system.md) | Quais cores existem e qual função cada uma cumpre? |
| [05 — Sistema tipográfico](./05-typography-system.md) | Qual style deve ser usado em cada texto? |
| [06 — Geometria e layout desktop](./06-geometry-and-desktop-layout.md) | Como spacing, dimensões, radius, bordas e grids funcionam? |
| [07 — Ícones, movimento e camadas](./07-icons-motion-and-layers.md) | Como ícones, transições, sombras e z-index funcionam? |
| [08 — Estados e acessibilidade](./08-states-and-accessibility.md) | Como componentes se comportam em todos os estados? |
| [09 — Modelo de decisão](./09-component-decision-model.md) | Reutilizar, variar, compor ou criar? |
| [10 — Limites arquiteturais](./10-architecture-boundaries.md) | Onde o componente deve viver e do que pode depender? |
| [11 — Contrato de componente](./11-component-contract.md) | O que precisa estar definido antes da adoção? |
| [12 — Especificações de componentes](./12-component-specifications.md) | Qual é o contrato-alvo do catálogo? |
| [13 — Implementação e conformidade](./13-implementation-and-compliance.md) | Como aplicar, migrar e verificar as regras? |
| [14 — Ciclo de vida e governança](./14-lifecycle-and-governance.md) | Como propor, revisar, versionar, depreciar e remover? |
| [15 — Registro de componentes](./15-component-registry.md) | O que existe no projeto neste momento? |

Leitura mínima para implementação: 02 a 08, 10 a 13. Para criar ou alterar API pública, incluir 09, 11, 14 e 15.

Para componentes, a leitura normativa continua em [09-component-decision-model](./09-component-decision-model.md) → [11-component-contract](./11-component-contract.md) → [12-component-specifications](./12-component-specifications.md) → [components/README](./components/README.md). O registry JSON, os onze documentos de categoria e os 43 perfis são as fontes executáveis; documentos históricos removidos não são fontes concorrentes.

## 3. Decisões fixadas

```text
Plataforma: web desktop, mínimo 1024px
Tema: claro e levemente quente
Canvas: #F5F3EE
Primary: #2746B3
Fonte: Plus Jakarta Sans
Spacing base: 4px
Radius: 4px / 6px / 8px
Borda: 1px
Ícones: Lucide
Mobile/tablet: fora do escopo
Dark mode: fora do escopo
```

## 4. Relação com as outras fontes

Cada conjunto documental possui uma responsabilidade diferente:

| Fonte | Responsabilidade |
| --- | --- |
| `design-system/` | Fonte canônica da linguagem visual, componentes e governança |
| `refs/UI/design-system-governance/` | Registro de origem usado na consolidação desta versão |
| `.agents/rules/` | Restrições operacionais obrigatórias para alterações no código |
| `src/components/` | Estado efetivamente implementado |
| `refs/UI/design-system-prd/` | Pesquisa e requisitos que originaram o sistema |

Este diretório é a **fonte canônica do design system** roteada por `AGENTS.md`. Em decisões de interface, suas regras prevalecem sobre referências históricas em `refs/`. O código continua sendo a evidência do que já foi implementado; divergências devem ser tratadas como trabalho de migração, nunca como permissão para inventar uma terceira regra.

Quando documentação e código divergirem:

1. não declarar como implementado o que não existe em `src`;
2. registrar a divergência;
3. decidir se o código deve mudar ou se a documentação ficou obsoleta;
4. atualizar o registro junto com a correção escolhida.

## 5. Vocabulário normativo

- **DEVE / NÃO DEVE**: requisito obrigatório.
- **RECOMENDA-SE**: padrão esperado; exceções precisam de justificativa.
- **PODE**: decisão opcional e contextual.

Uma preferência escrita como recomendação não pode ser tratada como proibição absoluta.

## 6. Resultado esperado

Uma decisão está suficientemente documentada quando outra pessoa consegue identificar:

- por que o componente existe;
- por que não é apenas uma variante ou composição;
- em qual camada ele pertence;
- qual é sua API pública e seu comportamento;
- quais estados e requisitos de acessibilidade se aplicam;
- quem o utiliza;
- qual é seu estágio de ciclo de vida;
- como migrar caso ele seja substituído.

O sistema deve reduzir decisões repetidas, não criar documentação por obrigação. Registros sem efeito sobre implementação, consumo ou manutenção devem ser evitados.

## 7. Referências metodológicas

- [Atomic Design — Brad Frost](https://atomicdesign.bradfrost.com/chapter-2/)
- [Shadcn UI — documentação](https://ui.shadcn.com/docs)
- [Radix Primitives — acessibilidade](https://www.radix-ui.com/primitives/docs/overview/accessibility)
- [WCAG 2.2 — W3C](https://www.w3.org/TR/WCAG22/)
- [Semantic Versioning](https://semver.org/)
- [Storybook — documentação e testes](https://storybook.js.org/docs)
