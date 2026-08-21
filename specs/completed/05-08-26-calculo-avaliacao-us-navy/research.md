# Research: Avaliação física com cálculo US Navy

## Decision 1: Função de domínio única para a composição corporal

**Decision**: Implementar `calculateBodyComposition` em `src/lib/bodyFat.ts` como função pura, com constantes exportáveis somente quando necessário para teste e conversão interna de centímetros para polegadas.

**Rationale**: A mesma equação poderá ser usada no diálogo, na consulta e em futuros seletores/exportadores sem duplicar fórmula ou misturar regra clínica com renderização.

**Alternatives considered**:

- Calcular diretamente no componente: rejeitado porque espalha uma regra clínica hardcoded e dificulta reutilização/teste.
- Salvar somente BF informado pelo usuário: rejeitado porque impede os resultados automáticos solicitados.

## Decision 2: Fórmula logarítmica US Navy em polegadas

**Decision**: Converter todas as medidas de cm para polegadas antes de aplicar as equações de Hodgdon-Beckett:

```text
male = 86.010 × log10(abdomenIn - neckIn)
       - 70.041 × log10(heightIn) + 36.76

female = 163.205 × log10(waistIn + hipIn - neckIn)
         - 97.684 × log10(heightIn) - 78.387
```

**Rationale**: As constantes publicadas são definidas para polegadas. A documentação oficial da U.S. Navy usa, para homens, a diferença entre abdômen e pescoço, e para mulheres a soma da cintura natural e quadril menos pescoço.

**Reference**: [U.S. Navy Body Composition Assessment Guide 4, March 2021](https://www.netc.navy.mil/Portals/46/NSTC/NROTC/docs/Guide%204-Body%20Composition%20Assessment%20%28BCA%29%28MAR%202021%29.pdf)

## Decision 3: Compatibilidade de dados legados

**Decision**: Tornar novos campos opcionais no tipo persistido, mas exigir o conjunto completo no formulário novo e no salvamento da edição.

**Rationale**: JSON já salvo não deve deixar de carregar. Ao mesmo tempo, uma edição ou criação não deve persistir uma avaliação nova sem composição calculável.

## Decision 4: Modal especializado compartilhado

**Decision**: Extrair o formulário para `src/components/molecules/EditAssessmentModal.tsx` e consumi-lo no perfil do paciente e na página de consulta.

**Rationale**: O mesmo fluxo visual e a mesma validação devem ser usados em todos os pontos que editam avaliação; `src/components/ui` permanece genérico.
