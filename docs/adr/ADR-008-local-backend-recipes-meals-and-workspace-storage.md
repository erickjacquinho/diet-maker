# ADR-008: Backend Relacional Local, Armazenamento de Receitas/Refeições e Arquivo Mestre (.nutridiet)

- **Status**: Conteúdo vigente consolidado em `refs/dieta-db/`
- **Data original**: 2026-08-28
- **Consolidação**: 2026-08-30

Este endereço permanece para preservar referências existentes. A arquitetura,
os contratos e suas justificativas são mantidos no
[guia central de dieta-db](../../refs/dieta-db/index.md).

- [Escopos, repositórios, transações e integridade](../../refs/dieta-db/05-arquitetura-backend-e-escopos-de-dados.md)
- [Catálogo de alimentos](../../refs/dieta-db/06-catalogo-de-alimentos-e-customizados.md)
- [Receitas e refeições prontas](../../refs/dieta-db/07-receitas-e-refeicoes-prontas.md)
- [Snapshots e versionamento](../../refs/dieta-db/08-snapshots-versionamento-e-integridade-clinica.md)
- [Motor local e migrations](../../refs/dieta-db/10-motor-local-drizzle-e-migrations.md)
- [Arquivo mestre e restauração](../../refs/dieta-db/11-recuperacao-e-portabilidade-local.md)
- [Divisão em SDDs, limites e justificativas](../../refs/dieta-db/14-consolidacao-e-portao-de-execucao.md)

Não manter outra versão dos contratos neste ADR. A consolidação não altera
o escopo aprovado nem antecipa infraestrutura futura.
