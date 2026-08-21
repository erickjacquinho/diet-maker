# Perfil do paciente — composição de dados pessoais

## Objetivo

Reorganizar a rota de perfil do paciente para priorizar os dados pessoais atuais, manter o agendamento como informação operacional discreta e conduzir a leitura para metas nutricionais e histórico de consultas.

## Direção aprovada

Usar uma composição desktop em uma coluna, com quatro regiões sequenciais:

1. cabeçalho curto com retorno, título da página e nome do paciente;
2. card de identidade e dados pessoais atuais, com as ações do paciente no mesmo contexto;
3. faixa sutil para próximo acompanhamento;
4. card de metas nutricionais e card de histórico de consultas.

## Restrições

- Reutilizar somente componentes já existentes.
- Não criar componente, token, dependência ou novo modelo de dados.
- Preservar ações, modais, persistência local e rotas atuais.
- Consumir tokens e estilos do Design System NutriDiet.
- Manter a página desktop e a tabela expansível existentes.

## Critérios de aceite

- O nome do paciente aparece uma vez no cabeçalho principal e a identidade completa fica no primeiro card.
- Idade, gênero, altura, peso atual, objetivo e última consulta ficam agrupados como dados pessoais atuais.
- `Nova Dieta` é a única ação primária visual da primeira região.
- O próximo acompanhamento aparece depois dos dados pessoais, em superfície sutil e com a mesma edição funcional atual.
- Metas de kcal e macronutrientes ficam em uma seção própria, sem competir com identidade.
- Histórico permanece acessível por tabela e expansão, após o resumo atual.
