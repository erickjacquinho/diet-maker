# Quickstart & Validation Guide: Padronização do Componente DataTable com Seleção e Checkbox Canônico

**Feature**: specs/26-08-26-padronizar-data-table-selecao-checkbox
**Date**: 2026-08-26

## 1. Validação do Átomo Checkbox

### Teste Unitário (	ests/components/atoms/Checkbox.test.tsx):
Executar:
`ash
npm test -- tests/components/atoms/Checkbox.test.tsx
`
**Cenários verificados:**
1. Renderiza com checked={false} com ria-checked=false.
2. Renderiza com checked={true} com ria-checked=true e ícone Check.
3. Renderiza com checked=indeterminate com ria-checked=mixed e indicador traço.
4. Responde ao clique disparando onCheckedChange.
5. Responde ao teclado (Espaço/Enter) quando focado.
6. Fica inerte quando disabled={true}.

---

## 2. Validação do DataTable com Seleção (Single e Multi)

### Teste Unitário (	ests/components/molecules/data-table.test.tsx):
Executar:
`ash
npm test -- tests/components/molecules/data-table.test.tsx
`
**Cenários verificados:**
1. **Multi-Select**:
   - Clicar no checkbox de uma linha adiciona seu ID ao conjunto.
   - Clicar no checkbox mestre seleciona todos os IDs visíveis.
   - Seleção parcial exibe o checkbox mestre com ria-checked=mixed.
   - Clicar no checkbox mestre em estado parcial ou total desmarca todos.
2. **Single-Select**:
   - Clicar em um item seleciona apenas esse item e desmarca o anterior.
   - O cabeçalho não exibe checkbox mestre.
3. **Select on Row Click**:
   - Clicar na linha aciona a seleção sem disparar duplamente ao clicar diretamente no checkbox.
4. **Sticky Header**:
   - Aplica classes sticky e altura máxima sem quebrar a largura das colunas.

---

## 3. Validação de Não-Regressão e Telas de Alimentos

Executar suíte completa:
`ash
npm test -- tests/components/molecules/food-search-modal.test.tsx tests/components/molecules/substitute-food-modal.test.tsx tests/components/organisms/foods/food-table-section.test.tsx
`
Verificar que a busca na TACO, seleção de alimentos para a refeição e substituição de alimentos continuam 100% funcionais com o novo DataTable.
