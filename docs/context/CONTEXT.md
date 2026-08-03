# CONTEXT.md - Glossário e Conceitos de Domínio (NutriDiet)

Este documento registra os termos do domínio de nutrição clínica e arquitetura do software definidos durante as sessões de entrevista e grilling.

> 📌 **Links de Referência**:
> - 📄 **PRD**: [PRD.md](file:///c:/Programmer/diet-maker/docs/prd/PRD.md)
> - 🏛️ **ADRs**: [docs/adr/](file:///c:/Programmer/diet-maker/docs/adr/)
> - 🤖 **Mapa para Agentes**: [AGENTS.md](file:///c:/Programmer/diet-maker/AGENTS.md)

---

## Conceitos de Domínio Nutricional

### 1. VET (Valor Energético Total) / Meta Calórica
- **Definição**: Quantidade total de calorias (kcal) planejada para o dia do paciente.
- **Decisão**: A meta de VET e de macronutrientes é informada **manualmente** pelo nutricionista para cada paciente, baseada em seu julgamento clínico e protocolo individual.
- *Ver*: [ADR-003: Metas Manuais e Tolerância Visual](file:///c:/Programmer/diet-maker/docs/adr/ADR-003-macro-targets-and-tolerance-ranges.md).

### 2. Macronutrientes (P / C / G)
- **Proteínas (P)**: 4 kcal por grama. Meta manual e métrica de g/kg.
- **Carboidratos (C)**: 4 kcal por grama. Meta manual e métrica de g/kg.
- **Gorduras/Lipídios (G)**: 9 kcal por grama. Meta manual e métrica de g/kg.
- **Fibras**: Métrica quantitativa de acompanhamento diário (g).

### 3. Métricas de Adequação (g/kg e Deltas)
- **g/kg**: Quantidade de gramas de um macronutriente por quilograma de peso corporal do paciente (ex: 2.0 g/kg de proteína).
- **Delta Remanescente/Excedente**: Diferença calculada em tempo real entre a meta estabelecida pelo nutricionista e o total somado dos alimentos na dieta.

### 4. Tabela TACO (Tabela Brasileira de Composição de Alimentos)
- **Definição**: Base oficial de composição nutricional dos alimentos no Brasil (valores padrão por 100g de parte comestível).
- **Custom Alimentos**: Alimentos ou suplementos criados pelo nutricionista armazenados localmente.

### 5. Escala Proporcional de Porções
- **Definição**: Operação matemática em lote que multiplica a gramatura de todos os alimentos de uma refeição ou dieta inteira por um fator percentual (ex: `+15%` ou `x 1.15`), permitindo ajuste rápido de caloria/volume sem re-digitar item por item.
