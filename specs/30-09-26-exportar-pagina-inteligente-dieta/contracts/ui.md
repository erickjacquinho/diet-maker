# Contrato de UI

## Editor e modal

Ação existente Link vira `Exportar como página externa`, somente para dieta simples. Preservar PDF/WhatsApp. Abrir modal não publica. Organismo PublishDietModal compõe Dialog, DialogHeader/Title/Description/Footer e Button, recebendo identidade, status, link/erro e callbacks tipados; categoria overlays. Estado não fica no átomo.

Modal intermediário obrigatório: título, paciente/dieta, descrição e informação de que quem tem o link acessa. Sem seletor de expiração, senha ou outras configurações futuras. Ações Cancelar e Publicar página/Atualizar página; durante preparo bloquear duplicação e anunciar busy. Sucesso mostra link com Copiar link e Abrir página como ações explícitas; copiar Clipboard com falha legível. Cancelar/Escape devolvem foco ao trigger; durante publicação já iniciada não prometer cancelamento remoto, indicar processo e não duplicar request.

## Página do paciente

Template categoria structure com trait nutrition-context, props snapshot/revision/token e seleção local; renderização sem fetch/banco dentro do template. Nome, autoria real disponível, data dd/MM/aaaa; títulos/horários de refeições; Tabs principal+alternativas junto ao título. Apenas uma tabela de opção montada/visível; opção única não mostra TabsList. DataTable com seleção multi/selectOnRowClick, nome e quantidade; checkbox da família existente, sem réplica. Seleção preservada por IDs após mudar abas e recarregar.

Resumo DataTable com Refeição e Macros. MacroSummary colorido com bolinhas, labels/unidades P/C/G/kcal, total das opções principais. Marca ou alternativa nunca muda total prescrito. Mostrar ausência explícita sem zero inventado. Não expor controles do nutricionista na página.

Estados vazios/loading/erro via famílias existentes e textStyle. Foco/semântica são os contratos das categorias. Template/modal entram no registry como experimental, com categoria consultada antes do perfil e fontes/consumidores corretos; só homologar após QA. Não ampliar API base, duplicar estilos ou burlar auditorias.
