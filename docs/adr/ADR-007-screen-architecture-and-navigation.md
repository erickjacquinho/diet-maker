# ADR-007: Arquitetura de Telas, Navegação e Hierarquia de Conteúdo

- **Status**: Aceito
- **Data**: 2026-07-29

## Contexto
O NutriDiet Local Pro exige uma estrutura de telas altamente eficiente para uso em consultório, eliminando a lentidão e a complexidade de sistemas tradicionais. Durante o processo de `/grill`, foram estabelecidos os requisitos de visualização direta de históricos de macronutrientes/valores corporais, reutilização global de presets e refeições, consulta interativa da tabela TACO com alimentos customizados e favoritação, além de uma regra estrita contra aninhamento profundo de telas ("telas dentro de telas").

## Decisão
Adotar o **Mapa de Arquitetura de Telas e Navegação Rasa (Flat UX)** com as seguintes especificações:

### 1. Mapa de Telas e Rotas Principais
1. **`/pacientes` (Lista de Pacientes)**:
   - Cards clicáveis de pacientes com foto/iniciais, nome, peso atual e busca por texto instantânea.
2. **`/pacientes/[id]` (Perfil e Histórico do Paciente)**:
   - **Layout em Painel Duplo em Colunas**:
     - *Coluna Esquerda*: Perfil cadastral fixo, peso atual, metas vigentes e atalhos rápidos (`+ Nova Dieta`, `+ Avaliação Física`, `Exportar`).
     - *Coluna Direita*: Timeline histórica em dois blocos transparentes ordenados por data decrescente:
       - **Histórico Dietético**: Cards com data e chips de macronutrientes (`Kcal | Proteínas | Carboidratos | Gorduras`) **visíveis diretamente no card sem necessidade de expandir/abrir**.
       - **Histórico Corporal**: Cards com data, `Peso (kg)`, `% Gordura`, `Massa Magra` **visíveis diretamente na capa do card**.
3. **`/pacientes/[id]/dieta/[dietaId]` (Construtor de Dieta)**:
   - Ocupa 100% da área de trabalho do workspace principal, mantendo a Sidebar/Navegação global visível.
   - Inclui autocompletar TACO (<100ms), cálculo de metas g/kg em tempo real (tolerância ±5%), escala de porções (`+%`), exportador PDF/WhatsApp e salvamento `.diet`.
4. **`/presets` (Biblioteca de Presets de Dietas)**:
   - Tela dedicada no menu principal com biblioteca centralizada de protocolos inteiros (ex: *Low Carb 1800kcal*, *Bulking 3000kcal*) prontos para cópia/duplicação para qualquer paciente.
5. **`/refeicoes-prontas` (Biblioteca de Refeições Prontas)**:
   - Tela dedicada no menu principal com biblioteca global de blocos de refeição (ex: *Café Pós-Treino 450kcal*) para inserção com 1 clique nas dietas dos pacientes.
6. **`/alimentos` (Planilha de Alimentos / Tabela TACO)**:
   - Tabela de alta performance com consulta de ~600+ itens da base TACO.
   - Botão `+ Novo Alimento` para criação de alimentos/suplementos comerciais (marcados como `[Custom]`).
   - Sistema de Favoritos com estrela (`⭐`).
   - Navegação por Abas: `[ Todos Alimentos ]` | `[ Favoritos ⭐ ]` | `[ Customizados ]`.

### 2. Regras de UX e Navegação
- **Hierarquia Rasa (Zero Aninhamento Profundo)**:
  - Estritamente 2 níveis de navegação (`Level 1: Sidebar` ➔ `Level 2: Workspace da Tela`).
  - Sem modais aninhados ou sequências infinitas de botões "Voltar". Qualquer seção principal é acessível a 1 clique pela Sidebar.
- **Sidebar Recolhível para Ícones (*Collapsible Icon Rail*)**:
  - A barra lateral de navegação suporta alternância entre o modo **Expandido** (Ícones + Rótulos) e modo **Recolhido** (Barra fina de apenas ícones com tooltips).
  - O modo recolhido maximiza o espaço horizontal para o Construtor de Dieta e para a Planilha de Alimentos.

## Consequências
- Acesso instantâneo e previsível a qualquer funcionalidade do sistema.
- Maximização da área útil de trabalho em notebooks e telas de consultório.
- Acompanhamento clínico ágil ao visualizar históricos de peso e macronutrientes lado a lado na tela do paciente.
