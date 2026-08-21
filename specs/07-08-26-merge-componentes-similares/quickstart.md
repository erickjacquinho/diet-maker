# Quickstart: Validação do Merge Seletivo

## Pré-requisitos

- Node.js e dependências instaladas com o lockfile vigente.
- Repositório em `C:\Programmer\diet-maker`.
- Mudanças de cada candidato isoladas para facilitar reversão e comparação.

## Validação automatizada

Executar após cada candidato e novamente no conjunto final:

```powershell
npm run type-check
npm run lint
npm test
npm run audit:atomic-design
npm run verify:design-system
npm run verify:links
```

**Resultado esperado**:

- TypeScript, lint e testes terminam sem novas falhas.
- Auditoria Atomic Design não registra violações novas.
- Verificação estrita do design system não registra findings bloqueantes.
- Links locais permanecem válidos.

## Cenários manuais de aceitação

1. **Metas**: abrir o fluxo de metas, editar proteína, carboidrato e gordura, observar o total energético, testar valores inválidos e modo somente leitura, salvar e cancelar.
2. **Refeição**: alterar quantidade e macros de uma refeição, testar remoção e reordenação; confirmar que ações específicas da linha continuam disponíveis.
3. **Receita**: alterar quantidade de ingrediente, testar remoção e confirmar que a apresentação de macros permanece consistente com a refeição.
4. **Paciente**: criar e editar paciente, testar validação, objetivo, alteração não salva, confirmação de descarte e cancelamento.
5. **Busca TACO**: pesquisar em modal de alimento e em criação de receita; cobrir carregamento, lista vazia, erro, seleção e fechamento.
6. **Input/Badge**: confirmar que consumidores usam a entrada canônica de input e que a decisão de Badge preserva variantes, estados, acessibilidade e consumidores registrados.

## Evidência por candidato

Para cada candidato, anexar ao PR ou registro da feature:

- lista de arquivos alterados e decisão aplicada;
- testes específicos e resultado dos comandos acima;
- resultado da revisão manual dos cenários afetados;
- atualização do registry/perfil ou justificativa de manutenção separada;
- confirmação de que a unidade pode ser revertida isoladamente.

## Critério de conclusão

Considerar o merge pronto somente quando os cenários acima estiverem aprovados, os sete critérios de sucesso da especificação puderem ser demonstrados e não houver finding bloqueante no catálogo ou nas regras arquiteturais.
