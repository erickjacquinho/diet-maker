# Quickstart de validação

Este guia valida o fluxo depois da implementação. Ele não define o código da solução.

## Pré-requisitos

Na raiz do projeto:

```powershell
npm install
```

## Validação automatizada

Executar os testes do domínio e das superfícies alteradas:

```powershell
npm run test -- tests/lib/readyMealsStore.test.ts tests/lib/recipesStore.test.ts tests/components/molecules/food-search-modal.test.tsx tests/hooks/useDietMealActions.test.ts
npm run type-check
```

Os testes devem cobrir, no mínimo, a persistência da composição completa, a conversão de receita, o cálculo proporcional e o acréscimo sem apagar a refeição ativa.

## Validação manual do fluxo principal

1. Criar uma refeição com pelo menos dois alimentos em gramas e uma opção completa.
2. Salvar o card como refeição pronta e verificar que a biblioteca conserva alimentos, gramaturas e opção.
3. Abrir o modal de seleção em outra refeição, mudar para o grupo de refeições prontas, pesquisar o item salvo e abrir a prévia.
4. Confirmar a aplicação e verificar que todos os itens foram acrescentados ao card sem remover os itens que já existiam.
5. Salvar outra composição como receita, abrir a receita e confirmar que os ingredientes em gramas podem ser editados antes da aplicação.
6. Criar uma opção com macro de referência, gerar a sugestão proporcional, alterar uma gramatura e verificar o recálculo dos totais.
7. Cancelar uma edição em andamento e verificar que nenhuma alteração parcial foi salva.

## Casos de vazio e erro

- Sem refeições prontas, a área correspondente apresenta estado vazio e o fluxo de alimentos continua disponível.
- Nome ausente, composição vazia, gramatura inválida ou macro de referência zerado impedem a confirmação com mensagem associada ao campo.
- Um registro legado sem composição completa é identificado como incompleto e não é inserido silenciosamente.
- A navegação por teclado mantém foco visível no modal, na prévia, nos editores e nas mensagens de validação.

## Escopo não validado nesta feature

Não validar autosave, exportação/PDF/WhatsApp, medidas caseiras ou a futura escala visual; esses fluxos permanecem para etapas posteriores.
