# Regra: Preservação de Componentes Base do Shadcn UI & Criação de Componentes Filhos

## 📌 Visão Geral
Esta regra estabelece o padrão arquitetural para o uso do **Shadcn UI** no projeto **NutriDiet Local Pro**. O objetivo é garantir **manutenibilidade**, **escalabilidade** e **estrita fidelidade à identidade visual** do sistema.

---

## 🛡️ Diretrizes de Arquitetura

### 1. Preservação dos Componentes Base (`src/components/ui/`)
- Os componentes nativos/primitivos gerados pelo Shadcn UI (localizados na camada base `src/components/ui/` ou nos átomos primitivos) **devem ser preservados em seu estado limpo e agnóstico**.
- **Regra**: NÃO adicione regras de negócio, dados de API, acoplamentos com o domínio de nutrição/dietas ou estilizações ad-hoc que fujam da biblioteca base diretamente nesses arquivos.
- Eles servem como blocos de construção fundamentais e reutilizáveis por todo o sistema.

### 2. Criação de Componentes Filhos (Manutenção & Escala)
- Sempre que houver necessidade de adaptar um componente base para uma funcionalidade específica, crie **componentes filhos** (camadas de moléculas, organismos ou wrappers) que envolvem e compõem os primitivos do Shadcn UI.
- **Vantagens**:
  - **Manutenção**: Alterações de regras de negócio afetam apenas o componente filho correspondente.
  - **Escala**: Atualizações do Shadcn UI ou substituições primitivas não quebram lógicas de tela.
  - **Reuso**: Permite variações de uso no sistema sem duplicar código primitivo.

### 3. Fidelidade Total à Identidade do Projeto
- Todos os componentes filhos, variações e composições de UI **MUST** utilizar rigorosamente os tokens e padrões do [Design System NutriDiet](file:///c:/Programmer/diet-maker/design-system/README.md).
- Evite criar estilos isolados fora da escala de tokens (cores, espaçamentos, tipografia, bordas e sombras da aplicação).

---

## 🔗 Referências
- Documentação do Design System: `c:/Programmer/diet-maker/design-system/README.md`
- Diretrizes Globais de Agentes: `c:/Programmer/diet-maker/agents.md`
