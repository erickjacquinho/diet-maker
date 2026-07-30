# Quickstart Validation: Duplos Botões no Card de Dieta

## Passos para Validação Manual

1. Navegar para o prontuário de um paciente (ex: `/pacientes/pat-1`).
2. Localizar o card de prescrição dietética na linha do tempo do histórico de consultas.
3. Verificar a presença dos 2 botões na área inferior do card:
   - Botão "Ver Dieta" (ou "Visualizar Dieta") com ícone de olho à esquerda.
   - Ícone de edição (lápis) no lado direito.
4. Clicar em "Ver Dieta":
   - Confirmar que a modal de leitura abre em modo somente leitura com as refeições/macros.
   - Fechar a modal.
5. Clicar no ícone de edição (lápis):
   - Confirmar que a página navega para `/pacientes/[id]/dieta/[dietaId]`.
