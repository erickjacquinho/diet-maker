# Guia de validação após implementação

Este SDD ainda não implementa nem publica. Executar por `/speckit-implement` após validação humana.

## Preparação

Usar workspace e perfil de teste; save fictício, dieta simples com opção única e duas alternativas, energia de snapshot distinta de 4-4-9 e dados ausentes/zero. Provisionar banco Neon de teste ligado ao Vercel Preview, aplicar migração remota e variáveis descritas em contracts/publication.md. Não usar save ou paciente real na homologação. Se ambiente remoto não estiver disponível, registrar gate pendente em validation-report.md sem alegar prova online.

## Comandos na raiz

```powershell
npm run type-check
npx vitest run tests/application/diet-publication.test.ts tests/application/account-publication-key.test.ts tests/components/diet-published-ui.test.tsx tests/routes/diet-publication-routes.test.ts
npm run audit:atomic-design
npm run audit:z-index
npm run verify:design-system
npm run verify:table
npx playwright test tests/browser/diet-publication.spec.ts --config=playwright.config.ts
```

Testes planejados, ainda inexistentes; ajustar paths somente se implementação registrar equivalentes no tasks/relatório. Falhas baseline de auditoria devem ser separadas das introduzidas, sem suprimir findings tocados.

## Cenários observáveis

1. Editor `/pacientes/<fixture>/dieta/nova`: menu → modal; cancelar não chama publicação; confirmar usa draft atual sem commit clínico. Abrir link somente depois do sucesso por ação explícita.
2. Reabrir/importar save preserva chave; exportar mesma dieta retoma o mesmo link. Chave ausente/inválida ou diferente não altera a publicação existente; credencial não aparece no snapshot/URL/logs.
3. Browser limpo no Preview acessa link sem perfil/save/onboarding/PGlite/sidebar. Data dd/MM/aaaa; tabelas/abas/macros correspondem a fixture e PDF existente conserva seu comportamento.
4. Checks por checkbox, nome, quantidade, Enter/Espaço; uma alternância; trocar abas e reload mantém estado; outra opção tem IDs separados. localStorage inválido/bloqueado usa aviso e sessão.
5. Republicar após editar requer nova confirmação; link igual, revisão nova e checks vazios após recarga. Falha e retry do mesmo operationId preservam revisão; concorrência stale recebe 409.
6. Sem rede a publicação informa falha, mas editor/PDF/WhatsApp continuam. Snapshot malformado, body grande, tentativa de escrita pelo token e acesso cruzado são rejeitados.
7. Visual e a11y em 1024/1440, foco do modal e copy/open. Registrar screenshots locais e Preview com dados fictícios.

## Evidência final

`validation-report.md`: comandos/resultados, diferenças baseline, componentes e categorias consultados, cenários/riscos restantes e estado implementado/localmente validado/Preview validado. Publicar em produção somente após instrução explícita posterior; esta entrega é SDD para revisão humana.
