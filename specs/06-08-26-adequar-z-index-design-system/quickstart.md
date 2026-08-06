# Quickstart: Verificação da Hierarquia de Camadas

**Feature**: [Adequação da Hierarquia de Camadas](spec.md)

Este roteiro deve ser executado depois que as tarefas forem implementadas pelo /speckit-implement.

## 1. Confirmar o inventário textual

A partir da raiz do repositório:

    rg -n -o "z-[A-Za-z0-9_!\\[\\]-]+" src tests --glob "*.tsx" --glob "*.ts" --glob "*.css"

A saída deve conter apenas tokens canônicos ou ocorrências explicitamente cobertas pelo contrato. O mapa central em tailwind.config.js é a única definição numérica autorizada.

## 2. Executar o auditor de camadas

Executar o comando definido nas tarefas de implementação para o validador de z-index. O resultado deve ser determinístico e, em caso de falha, informar arquivo, linha, ocorrência, regra e token esperado.

Casos negativos mínimos:

- introduzir z-10 em um componente de runtime;
- introduzir z-[999] em um teste;
- usar z-popover em DropdownMenuContent;
- usar z-overlay em SheetContent;
- usar z-modal em PopoverContent sem contexto modal.

## 3. Validar contratos de interação

Executar os testes focados de overlay e os testes já existentes de acessibilidade:

    npm test -- --run
    npm run type-check
    npm run lint

Os testes devem cobrir:

- DialogOverlay abaixo de DialogContent;
- SheetOverlay abaixo de SheetContent;
- DropdownMenu e Select em contexto padrão;
- Select e calendário dentro de Dialog;
- Popover padrão e Popover contextual modal;
- Tooltip acima dos demais overlays;
- fechamento, foco e teclado preservados.

## 4. Verificar conformidade do repositório

    npm run verify:design-system
    npm run audit:atomic-design
    npm run verify:links

A tarefa só pode ser considerada concluída quando o auditor de camadas e os verificadores existentes não apresentarem findings de camada ou de contrato documental.

