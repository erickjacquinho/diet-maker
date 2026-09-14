---
name: minimize
description: Simplifica um escopo existente até a solução mínima, direta e completa, removendo overengineering e complexidade desnecessária sem alterar requisitos, contratos ou resultado. Use quando o usuário invocar /minimize ou pedir para enxugar, simplificar ou reduzir a complexidade de um escopo.
---

# Minimize

Reduza a complexidade da solução, nunca o resultado exigido.

## Passos obrigatórios

1. Leia integralmente todas as regras da pasta `.agents/rules` antes de analisar ou alterar o escopo. Aplique-as cumulativamente, respeitando a precedência definida pelo projeto. Se alguma regra apontar para um caminho externo ou obsoleto, interprete-a somente nos caminhos equivalentes deste repositório.

2. Respeitando todas as regras lidas, limpe o escopo em questão até o mínimo viável e completo:
   - delimite o escopo solicitado e registre os requisitos, contratos, invariantes e resultados que devem permanecer;
   - inspecione apenas os arquivos e integrações necessários para compreender esse escopo;
   - procure ativamente o caminho mais direto e simples para alcançar a mesma meta;
   - identifique e remova overengineering, abstrações especulativas, camadas, indireções, estados, configurações, duplicações, dependências e pontos de integração sem necessidade concreta;
   - prefira reutilizar mecanismos existentes e consolidados do projeto quando eles resolverem integralmente a necessidade;
   - não desloque a complexidade para outro arquivo, módulo, etapa manual ou trabalho futuro;
   - faça somente as alterações necessárias e valide que o comportamento observável e o resultado exigido continuam equivalentes.

3. Depois de concluir e validar a limpeza, apresente um resumo muito breve do que foi feito.

## Invariantes

- Mantenha o escopo funcional original. Não remova, enfraqueça nem reinterprete requisitos para tornar a implementação menor.
- Preserve compatibilidade, segurança, contratos e comportamentos necessários.
- Não transforme a limpeza em refatoração ampla ou melhoria oportunista fora do escopo.
- Não aceite uma solução parcial, paliativa ou frágil como simplificação.
- Quando duas alternativas completas forem válidas, escolha a de menor complexidade total de implementação e manutenção.
