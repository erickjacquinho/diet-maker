# 10 — Limites arquiteturais

## 1. Modelo de camadas

O projeto usa uma adaptação de Atomic Design:

```text
src/components/ui
        ↓
src/components/atoms
        ↓
src/components/molecules
        ↓
src/components/organisms
        ↓
src/components/templates
        ↓
src/app
```

Uma camada pode depender de qualquer camada inferior, não apenas da imediatamente anterior. Dependências ascendentes são proibidas.

## 2. Critério de classificação

Classifique pela **responsabilidade pública**, não por quantidade de linhas, elementos ou arquivos.

| Camada | Responsabilidade | Pode conhecer o domínio? | Não deve |
| --- | --- | --- | --- |
| `ui` | Primitivo técnico e genérico | Não | conter regra NutriDiet, buscar dados ou conhecer rotas |
| atom | Menor unidade pública do sistema | Não | importar molecule, organism, template ou app |
| molecule | Executar uma tarefa simples e delimitada | Sim | controlar uma seção completa ou fluxo de página |
| organism | Coordenar uma seção completa | Sim | representar uma página inteira ou acoplar-se a uma rota |
| template | Definir estrutura e regiões de página | Apenas por slots e contratos | buscar dados reais, usar router ou embutir registros reais |
| app | Instanciar a experiência em uma rota | Sim | transformar detalhes reutilizáveis em duplicação local |

## 3. Camada `ui`

`src/components/ui` contém os primitivos Shadcn UI/Radix adotados localmente.

Regras:

- manter API genérica;
- aceitar customização estrutural prevista pelo primitivo;
- não importar código de domínio;
- não acessar API, store, banco, router ou contexto de feature;
- preservar semântica, teclado e foco fornecidos pelo primitivo;
- evitar alterações que dificultem atualização ou comparação com a origem.

O código Shadcn é local e tecnicamente editável. A preservação é uma política deste projeto para controlar acoplamento, não uma limitação da biblioteca.

## 4. Atoms

Atoms oferecem a menor API pública reutilizável do projeto, normalmente consolidando defaults e contratos comuns sobre um primitivo.

Um atom:

- deve ser genérico;
- pode envolver um primitivo `ui`;
- pode normalizar propriedades recorrentes;
- não deve existir apenas para trocar o nome do primitivo;
- não conhece paciente, dieta, refeição, alimento, receita, TACO ou macro.

## 5. Molecules

Molecules combinam unidades menores para executar uma tarefa simples.

Uma molecule:

- pode ser genérica ou de domínio;
- possui uma responsabilidade nomeável;
- recebe dados e callbacks;
- pode manter estado estritamente local à interação;
- não coordena uma seção completa da página.

Exemplos atuais de domínio: `MacroMetricCard`, `MealItemRow` e `TacoSearchInput`.

## 6. Organisms

Organisms coordenam uma seção funcional completa.

Um organism pode:

- compor atoms, molecules e outros organisms;
- manter estado de apresentação da seção;
- coordenar múltiplas interações relacionadas;
- receber modelos de apresentação e callbacks.

Um organism não deve buscar dados ou conhecer detalhes da rota por padrão. Exceções precisam justificar por que mover a integração para a página ou para um hook não é suficiente.

## 7. Templates

Templates definem esqueleto, regiões e composição de página.

Um template:

- recebe conteúdo e ações por propriedades ou slots;
- não contém dados reais hardcoded;
- não acessa diretamente banco, API ou Server Action;
- não decide navegação específica da rota;
- deve continuar demonstrável com dados de exemplo.

## 8. Pages

As páginas em `src/app` são a camada de integração.

Elas podem:

- ler parâmetros e estado da URL;
- buscar e transformar dados;
- chamar ações e serviços;
- conectar estado de servidor, cliente e navegação;
- instanciar templates e componentes de domínio.

JSX local é permitido para estruturas simples e exclusivas. Uma página deve extrair responsabilidades que se tornem estáveis, repetidas, complexas ou testáveis isoladamente.

## 9. Genérico versus domínio

Use estes testes em conjunto:

| Pergunta | Se “sim” | Se “não” |
| --- | --- | --- |
| Faz sentido fora de um produto de nutrição? | Provavelmente genérico | Provavelmente domínio |
| Sua API usa termos clínicos ou nutricionais? | Domínio | Pode ser genérico |
| Aplica regra de paciente, dieta, alimento ou macro? | Domínio | Pode ser genérico |
| Apenas organiza interação universal? | Genérico | Avaliar domínio |

Não generalize nomes para esconder regras específicas. Um componente chamado `MetricCard` que contém lógica de macronutriente continua sendo domínio e deve receber um nome honesto.

## 10. Quando usar Shadcn UI ou Radix

Use um primitivo existente para interações convencionais e sensíveis à acessibilidade, como:

- dialog;
- popover;
- select;
- tabs;
- tooltip;
- dropdown menu;
- scroll area.

Crie um atom quando o projeto precisar de um contrato genérico recorrente sobre o primitivo.

Crie molecule ou organism quando houver tarefa, composição ou linguagem de domínio.

Não reimplemente manualmente:

- navegação por teclado;
- aprisionamento e restauração de foco;
- relacionamento ARIA;
- fechamento por Escape;
- posicionamento e colisão de overlays;
- estados de seleção oferecidos pelo primitivo.

## 11. Regras de dependência

- `ui` não importa nenhuma camada superior.
- atoms importam apenas `ui`, utilitários e dependências genéricas.
- molecules importam `ui`, atoms, utilitários e tipos permitidos.
- organisms importam camadas inferiores e hooks próprios da seção.
- templates importam camadas inferiores, mas não infraestrutura de dados.
- app pode importar todas as camadas.
- imports entre componentes da mesma camada são permitidos quando não criam ciclo.
- ciclos de dependência são proibidos.
- um componente de Design System não deve importar uma página.
