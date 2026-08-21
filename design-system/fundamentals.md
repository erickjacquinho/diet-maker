# Fundamentals — Princípios e Linguagem Visual

> **Status:** Documento normativo de fundamentos visuais e diretrizes do NutriDiet.

## 1. Direção Visual e Filosofia

A interface do NutriDiet transmite **clareza clínica com calor humano**. Ela une a precisão exigida por nutricionistas ao conforto de uma aplicação moderna:

- Base clara e levemente quente (off-white `#FCFAF7`).
- Superfícies silenciosas em branco puro (`#FFFFFF`).
- Tipografia escura de alto contraste (`Plus Jakarta Sans`).
- Escassez cromática: cor concentrada primariamente em ações, seleção e prioridades.
- Alta densidade de dados planejada sem causar fadiga visual.

## 2. Princípios Fundamentais

### 2.1 Responsabilidade Real
Todo componente deve resolver um problema identificável de interface. Não se cria componentes apenas para renomear primitivos ou economizar linhas pontuais de JSX.

### 2.2 Menor Abstração Suficiente
A ordem de decisão é sempre: **Usar -> Configurar -> Variar -> Compor -> Criar**.

### 2.3 Protagonismo Visual
Em cada área visual deve existir um único elemento de maior destaque (um CTA principal, um valor chave de métrica, uma aba ativa). Se tudo possui alto contraste, nada tem prioridade.

### 2.4 Hierarquia antes de Decoração
Espaço, tipografia, agrupamento e contraste resolvem a hierarquia visual. Sombras pesadas, degradês extravagantes e decorações excessivas são proibidos.

## 3. Escopo de Plataforma

- **Exclusivamente Web Desktop** a partir de `1024px`.
- Mobile, tablet e apps nativos estão **fora de escopo**.
- Responsividade refere-se à robustez e adaptabilidade do layout dentro de navegadores desktop (1024px a 1920px+).

## 4. Referências Relacionadas

- Regras de Cores: [.agents/rules/color-semantics.md](file:///c:/Programmer/diet-maker/.agents/rules/color-semantics.md)
- Regras de Tipografia: [.agents/rules/typography.md](file:///c:/Programmer/diet-maker/.agents/rules/typography.md)
- Regras de Geometria: [.agents/rules/geometry-layout.md](file:///c:/Programmer/diet-maker/.agents/rules/geometry-layout.md)
