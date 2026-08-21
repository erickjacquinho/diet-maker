# Research & Architectural Decisions: Padronização Integral

## Decision 1: Adoção do Átomo `FieldTrigger` em `DatePickerField`
- **Decisão**: Substituir o `<Input readOnly>` envelopado em `<div>` no `DatePickerField` pelo componente átomo `<FieldTrigger ref={...} size="standard" state={error ? 'error' : 'default'} ...>`.
- **Racional**: O átomo `FieldTrigger` já encapsula a receita CVA `recipes.input({ size, state })`, gera um elemento semântico `<button type="button">`, herda a altura padrão de 36px (`h-control-standard`), raio `rounded-control` e tipografia `text-style-field-value`, satisfazendo 100% dos testes de acessibilidade e WCAG 2.2 AA.
- **Alternativas rejeitadas**: Manter `<Input>` customizado com `role="button"` foi rejeitado por violar a hierarquia do Atomic Design e introduzir duplicidade desnecessária.

## Decision 2: Padronização Canônica de Cores Nutricionais
- **Decisão**: Alinhar todas as props e receitas de macros aos tokens canônicos:
  - **Calorias / Kcal**: `text-primary` / `--sys-color-action-primary` (`#2746b3`)
  - **Proteínas**: `text-macro-protein` / `--sys-color-macro-protein` (`#b8325a`)
  - **Carboidratos**: `text-macro-carbohydrate` / `--sys-color-macro-carbohydrate` (`#a55b00`)
  - **Gorduras**: `text-macro-fat` / `--sys-color-macro-fat` (`#0f766e`)
- **Racional**: Elimina o conflito onde `blue` apontava para proteína (rosa) e `emerald` (verde de sucesso) era usado para proteínas na interface.
- **Alternativas rejeitadas**: Manter nomes legados de cores (`emerald`, `rose`, `amber`) nos hooks foi rejeitado por mascarar o significado semântico do domínio nutricional.

## Decision 3: Estrutura Interna de Estilização em `MetricBox`
- **Decisão**: No `MetricBox`, aplicar as classes de tom (`toneClasses[tone]`) e tamanho (`valueClasses[size]`) diretamente no `<span>` que renderiza `{value}`, mantendo no container apenas classes de layout e alinhamento.
- **Racional**: Garante que testes unitários e seletores de teste consigam verificar classes diretamente no elemento de valor sem depender de herança de CSS cascading em JSDOM.

## Decision 4: Tratamento de Paciente Inexistente no Construtor de Dietas
- **Decisão**: Em `useDietBuilderPage.ts`, remover a geração do mock `Paciente Sem Nome` (com valores 30y, 170cm, 70kg, 2000kcal) quando `patientId` não é encontrado, retornando `null` para que a tela renderize o card de erro/redirecionamento já existente na arquitetura de páginas.
- **Racional**: Impede a contaminação do estado da aplicação com dados fictícios hardcoded.

## Decision 5: Limpeza em Cascata de Dietas no `localStorage`
- **Decisão**: Adicionar `removeStorageItem('nutridiet_diets_' + id)` dentro de `deletePatientFromStorage` em `src/lib/patientsStore.ts`.
- **Racional**: Garante consistência transacional e integridade referencial no armazenamento local sem deixar resíduos de dietas de pacientes excluídos.
