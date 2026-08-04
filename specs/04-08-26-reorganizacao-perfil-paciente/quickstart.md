# Quickstart de validação: reorganização do perfil do paciente

## Pré-requisitos

- Node.js e dependências do projeto instalados.
- Repositório em `C:\Programmer\diet-maker`.
- Dados locais de demonstração ou um paciente com cadastro, avaliação e dieta no armazenamento local.

## Validação estática

Na raiz do projeto:

```powershell
npm run type-check
npm run lint
npm test -- --run
```

Resultado esperado: nenhum erro de tipos, lint ou testes.

## Cenário A — paciente com dados atuais e dieta vigente

1. Abrir o perfil de um paciente que possua dados pessoais, pelo menos uma avaliação corporal e uma dieta marcada como ativa.
2. Confirmar visualmente a ordem: identidade/dados pessoais, indicadores atuais, consulta/acompanhamento, resumo do plano vigente e histórico.
3. Confirmar que não existe um quadro independente de metas manuais no topo.
4. Confirmar que o resumo do plano identifica nome ou referência, data, status e totais compactos, com uma ação para abrir detalhes.
5. Abrir os detalhes e confirmar que refeições e macros completos continuam no fluxo da dieta/histórico.

## Cenário B — paciente sem dieta vigente

1. Abrir o perfil de um paciente que possua metas manuais, mas não possua dieta ativa.
2. Confirmar que as metas manuais não aparecem como plano atual.
3. Confirmar que o estado vazio explica a ausência e oferece a ação de criar uma dieta.
4. Confirmar que nenhum valor de kcal, proteína, carboidrato ou gordura é inventado no estado vazio.

## Cenário C — dados temporais e vazios

1. Abrir um paciente com avaliações em datas diferentes.
2. Confirmar que os indicadores atuais usam a avaliação mais recente e que as anteriores permanecem históricas.
3. Remover ou deixar indefinido o próximo acompanhamento e confirmar o estado vazio acionável.
4. Verificar teclado e foco visível nas ações do plano, histórico e acompanhamento.

## Evidências esperadas

- Captura desktop em largura mínima de 1024px mostrando a hierarquia completa.
- Resultado dos comandos estáticos e dos testes.
- Registro visual dos cenários com dieta ativa e sem dieta ativa.

## Contratos externos

Não se aplica: a mudança é uma composição interna da aplicação e não cria endpoints, integrações ou contratos públicos.
