# Quickstart: Avaliação física com cálculo US Navy

1. Inicie a aplicação e abra `/pacientes`.
2. Abra o perfil de um paciente com gênero Masculino ou Feminino, altura e nome cadastrados.
3. Clique em `Nova Avaliação Física`.
4. Preencha peso, todas as circunferências em cm e confirme que BF, massa gorda e massa magra aparecem como campos somente leitura.
5. Para um paciente Masculino, confirme que alterar Barriga ou Pescoço recalcula o BF.
6. Para uma paciente Feminino, confirme que alterar Cintura, Quadril ou Pescoço recalcula o BF.
7. Salve e reabra o histórico; confirme que as medidas e resultados permanecem.
8. Abra uma avaliação antiga sem os novos campos; confirme que ela continua visível e que o diálogo pede as medidas antes de permitir um novo salvamento.

## Automated validation

```powershell
npm test -- --run tests/lib/bodyFat.test.ts tests/components/molecules/edit-assessment-modal.test.tsx
npm run lint
npm run build
```
