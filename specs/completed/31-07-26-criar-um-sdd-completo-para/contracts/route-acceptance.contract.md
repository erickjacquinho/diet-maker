# Route Acceptance Contract

Cada rota do inventário recebe um `RouteAcceptanceRecord` com:

- estados críticos exercitados;
- componentes/recipes consumidos;
- zero findings de legado no arquivo e no DOM renderizado;
- teclado, foco, ARIA e contraste aprovados;
- ausência de erro de runtime/console;
- revisão visual aprovada contra a categoria/perfil e fundamentos canônicos;
- confirmação de que o comportamento de domínio não mudou.

Uma rota permanece `blocked` quando qualquer item não possui evidência. A página `/design-system` segue o mesmo contrato e não pode apresentar componentes `proposed` como implementados.
