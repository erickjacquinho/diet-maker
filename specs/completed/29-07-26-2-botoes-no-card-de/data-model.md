# Data Model & State: Duplos Botões no Card de Dieta

## Component Props / State

### ReadOnlyDietModalProps
- `isOpen: boolean` - Controla visibilidade da modal.
- `onClose: () => void` - Callback ao fechar a modal.
- `diet: Diet | null` - Dados da dieta contendo id, name, targetKcal, proteinG, carbsG, fatsG, meals (opcional).
- `patientName?: string` - Nome do paciente para exibir no cabeçalho da modal.
