# Research: Merge Seletivo de Componentes Similares

**Feature**: [spec.md](./spec.md)
**Data**: 2026-08-07

## Decision 1: Compartilhar unidades internas, não fundir domínios públicos

**Decision**: Usar composição em consumidores existentes e criar uma unidade compartilhada somente quando houver pelo menos dois consumidores reais e uma responsabilidade observavelmente comum.

**Rationale**: `MealItemRow` e `RecipeIngredientRow`, por exemplo, compartilham apresentação de macros e edição de quantidade, mas não compartilham todas as ações. O mesmo vale para os modais de paciente e de busca. Manter os shells públicos separados preserva contratos, tipos e ciclo de vida sem duplicar o fragmento comum.

**Alternatives considered**:

- Fundir cada par em um componente com muitas props: rejeitado por misturar domínios e incentivar boolean flags.
- Manter toda duplicação: rejeitado porque mantém correções e estados duplicados.
- Mover regras para `src/components/ui`: rejeitado porque viola a preservação dos primitivos e os limites Atomic Design.

## Decision 2: Remover o alias de Input apenas após migração verificável

**Decision**: Tratar `src/components/ui/input.tsx` como entrada canônica; verificar referências, atualizar consumidores válidos e só então remover o alias deprecated em `src/components/atoms/Input.tsx`, registrando a transição no catálogo.

**Rationale**: O alias não acrescenta comportamento suficiente para justificar uma segunda entrada pública, mas a remoção é uma mudança de lifecycle e deve seguir a ordem de migração do design system.

**Alternatives considered**:

- Manter os dois exports indefinidamente: rejeitado porque perpetua ambiguidade e contraria a política de alias deprecated.
- Alterar o primitivo `ui/input`: rejeitado porque o primitivo deve permanecer limpo e genérico.

## Decision 3: Compor a seção de macros existente

**Decision**: Usar `AutoKcalSection` como fronteira de composição para `AdjustDietGoalsModal`. Se a diferença de contrato exigir mais flexibilidade, extrair uma unidade interna de campos controlados, sem expor props de domínio desnecessárias.

**Rationale**: Os dois fluxos já expressam os mesmos três macros e cálculo energético. Reusar a fronteira existente reduz duplicação e concentra a regra de cálculo, enquanto o modal continua responsável por abrir, salvar e cancelar.

**Alternatives considered**:

- Criar um novo componente público de formulário de metas imediatamente: rejeitado até provar que a composição existente é insuficiente.
- Duplicar os campos no modal: rejeitado por manter divergência de validação e cálculo.

## Decision 4: Separar o estado de busca do shell de modal

**Decision**: Compartilhar a apresentação/estado de resultados TACO e continuar reutilizando `TacoSearchInput`, mas preservar `FoodSearchModal` e `CreateRecipeModal` como consumidores públicos distintos.

**Rationale**: A busca, a lista vazia, o erro e a seleção são comuns; o resultado da seleção e o submit do formulário são específicos a cada fluxo.

**Alternatives considered**:

- Criar um modal de busca universal: rejeitado por acoplar seleção de alimento, edição de receita e ações de fechamento.
- Duplicar lista e estados: rejeitado por aumentar inconsistência visual e de acessibilidade.

## Decision 5: Badge permanece uma decisão de governança, não uma remoção automática

**Decision**: Comparar o wrapper de `atoms/Badge` com o primitivo `ui/badge`, seus consumidores, perfil e registro; escolher migração para a entrada canônica ou manutenção justificada do wrapper. Não remover export sem evidência de contrato preservado.

**Rationale**: A semelhança visual não prova redundância arquitetural. A camada, os consumidores e o valor agregado do wrapper precisam estar refletidos no catálogo.

## Decision 6: Validação por candidato e reversão localizada

**Decision**: Implementar em pequenos lotes independentes, validando testes, auditorias e fluxos manuais após cada candidato. Se um candidato regredir, revertê-lo sem invalidar os demais.

**Rationale**: O risco é de regressão comportamental e documental, não de migração de dados. A unidade de reversão deve coincidir com a unidade de decisão.

## Referências locais consultadas

- `design-system/README.md`, `design-system/governance.md`, `design-system/migration-plan.md`
- `design-system/components/registry.json` e `design-system/components/audit-contract.md`
- `.agents/rules/atomic-design.md`, `.agents/rules/component-decision.md`, `.agents/rules/shadcn-preservation.md`
- `src/components/atoms/Input.tsx`, `src/components/ui/input.tsx`, e os componentes candidatos listados na especificação
- `package.json` para comandos e versões vigentes de runtime/testes
