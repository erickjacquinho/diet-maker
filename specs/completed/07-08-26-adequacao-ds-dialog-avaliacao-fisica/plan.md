# Implementation Plan - Adequação do Dialog de Avaliação Física ao Design System e Composition Patterns

Refatoração técnica do dialog de avaliação física (`EditAssessmentModal.tsx`) para eliminar elementos hardcoded, resolver violações das regras do Design System e alinhar a arquitetura de componentes aos princípios do `/vercel-composition-patterns`.

## User Review Required

> [!IMPORTANT]
> A refatoração preserva integralmente a API pública de `EditAssessmentModalProps` (`open`, `patient`, `assessment`, `mode`, `onOpenChange`, `onSave`) para garantir compatibilidade retroativa com as páginas `pacientes/[id]/page.tsx` e `pacientes/[id]/consulta/[date]/page.tsx`.

> [!NOTE]
> Componentes de entrada de medidas serão encapsulados em sub-componentes especializados reutilizáveis (`AssessmentFieldGroup` / `AssessmentMeasurementField`), garantindo eliminação de duplicação de tags HTML soltas.

---

## Proposed Changes

### Component: `src/components/molecules`

#### [MODIFY] [EditAssessmentModal.tsx](file:///c:/Programmer/diet-maker/src/components/molecules/EditAssessmentModal.tsx)

1. **Remoção de Estilos Hardcoded e Arbitrários**:
   - Substituir `max-h-[85vh]` por regras de layout responsivo padronizadas de modal no Design System.
   - Eliminar a opacidade arbitrária `bg-surface-subtle/30` em favor do token de superfície limpo `bg-surface-subtle` ou invólucro `<Surface variant="subtle">`.
   - Substituir alturas arbitrariamente aplicadas em `Input` (`h-9`, `mt-1`) por propriedades/tokens padronizados.
   - Substituir a caixa de erro ad-hoc `bg-error-soft border border-error-border rounded-control p-2` por estilos/componentes semânticos do DS.

2. **Aplicação do `/vercel-composition-patterns`**:
   - **`architecture-compound-components` & `state-decouple-implementation`**: Desacoplar a lógica de estado do formulário (`draft`, atualizações numéricas, validação e cálculo reativo de composição corporal) da renderização de apresentação.
   - **`patterns-explicit-variants` / `architecture-avoid-boolean-props`**: Encapsular a resolução de rótulos e títulos baseados em modo em sub-elementos declarativos limpos em vez de ternários soltos no meio de JSX monolítico.
   - **`patterns-children-over-render-props`**: Decompor os blocos repetidos das abas (`Trunk & Composition` e `Limbs`) em sub-componentes composáveis (`TrunkAssessmentSection`, `LimbAssessmentSection`).

3. **Padronização de Tipografia e Rótulos**:
   - Substituir combinações manuais de Tailwind + `textStyle` (`className="text-text-muted textStyle('caption')"` ou `<label htmlFor="...">`) por componentes declarativos e acessíveis de formulário do Design System.

---

## Verification Plan

### Automated Tests

- Executar a suíte de testes existente no projeto para garantir que nenhuma regressão em pacientes ou lojas foi introduzida:
  ```powershell
  npm run test
  ```

- Validar tipos e sintaxe com o compilador do TypeScript:
  ```powershell
  npx tsc --noEmit
  ```

### Manual Verification

- Abrir o dialog de Avaliação Física no perfil do paciente em modo "Criação" e verificar layout, tokens visuais, cálculo reativo de BF/massa magra/gorda e salvamento.
- Abrir o dialog em modo "Edição" na página de consulta e validar a retenção de dados e consistência das abas "Tronco" e "Membros".
