# Contrato de navegação e apresentação

## Rotas após remanejamento

| Origem/estado | Destino/resultado |
| --- | --- |
| Login e cadastro completos | `/dashboard` |
| `/home` ou `/saves` | Redirect para dashboard; preservar parâmetros presentes |
| Dashboard + conta pronta, sem arquivo | Shell + funções de saves; Configurações acessível |
| Dashboard + arquivo ativo | Mesmo dashboard, sem saída automática para Pacientes |
| Módulo clínico sem arquivo autorizado | Gate atual com recuperação pelo dashboard |
| Conta anônima / cadastro incompleto | Login / conclusão de cadastro atuais |
| Sessão locked com runtime | Preservação/bloqueio atuais antes de nova operação |

`/api/saves` e `/api/saves/[id]/authorize` preservam seus contratos. Retirar a página não remove as APIs.

## Modal imediato

- Usar o callback existente `onOpenAccount` de SidebarNav/SidebarUserProfile; adapter fornece abertura padrão e respeita callback explícito do consumidor.
- O callback aceita opcionalmente o botão de origem (`trigger?: HTMLButtonElement`) para retorno de foco; callbacks sem argumentos continuam válidos. O adapter conserva essa referência até fechar o Dialog.
- Título único Configurações; nenhum formulário, descrição fictícia, aba, footer ou comando de save. Close nomeado existente.
- Sem rota de configurações, wrapper público, store ou persistência nova.
- Fechar dropdown ao abrir Dialog; Escape, Fechar e backdrop seguem primitivo; devolver foco ao controle do perfil.
- Na entrega imediata, rotas, seis módulos, catálogo, login e backups permanecem atuais.

## Barra após remanejamento

Início `/dashboard`, Pacientes `/pacientes`, Agenda `/agenda`, Dietas prontas `/presets`, Refeições `/refeicoes`, Receitas `/receitas`, Alimentos `/alimentos`, nessa ordem. Preservar seleção por rota/prefixo e expanded/collapsed.

Menu de perfil de produção: Configurações e Sair. Backup no dashboard; preservar contratos genéricos ainda usados por outros consumidores.

## Invariantes

Dashboard renderizável não autoriza operações clínicas. ProfileSession conserva proprietário, grant, cifra e chaves atuais. Sem runtime/arquivo autorizado, backup fica indisponível com explicação. Restaurar conserva validação integral e confirmação de substituição e de dados pendentes; erro/cancelamento preserva dados.
