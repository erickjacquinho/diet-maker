# ADR-003: Modelo de Metas Manuais de Macronutrientes e Faixas de Tolerância Visual

- **Status**: Aceito
- **Data**: 2026-07-29

## Contexto
Diferentes linhas de nutrição clínica exigem precisão no atingimento das metas energéticas e proteicas. O nutricionista precisa de um feedback imediato se a combinação de alimentos colocada nas refeições cobriu ou excedeu o prescrito.

## Decisão
1. **Definição Manual Primária**: O nutricionista informa diretamente a meta alvo em Kcal, Proteínas (g ou g/kg), Carboidratos (g ou g/kg) e Gorduras (g ou g/kg).
2. **Faixa de Tolerância Visual (±5%)**:
   - **Verde (Na Meta)**: Quando o consumo calculado da dieta está entre 95% e 105% da meta estipulada.
   - **Amarelo (Alerta Próximo)**: Quando está entre 85%-94% (abaixo) ou 106%-115% (acima).
   - **Vermelho (Desvio Crítico)**: Quando está abaixo de 85% ou acima de 115%.
3. **Métrica Dupla (Grama Absoluta + g/kg)**: Atualização instantânea do g/kg com base no peso atual cadastrado do paciente.

## Consequências
- Decisão clínica mantida integralmente nas mãos do nutricionista.
- Clareza visual durante o ajuste das gramaturas dos alimentos.
