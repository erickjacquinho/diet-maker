# Foundation visual baseline

Validação executada em viewport desktop `1280×900` na rota `/pacientes` após o checkpoint de foundation.

| Verificação | Resultado |
| --- | --- |
| HTTP/render | PASS; DOM carregado e sem erro de console |
| Canvas | `rgb(245, 243, 238)` (`canvas`) |
| Texto base | `rgb(28, 33, 31)` (`text-primary`) |
| Fonte | `Plus Jakarta Sans`, com fallbacks de sistema |
| Foco por teclado | PASS; ring azul visível no botão `Recolher Menu` |
| Contraste | PASS; combinações oficiais `text-primary/canvas` e `primary/canvas` documentadas acima de 4.5:1 |
| Escopo | Desktop, sem dark mode e sem adaptação mobile/tablet |

Evidências: `.artifacts/design-system/stage-1-foundation.png` e `.artifacts/design-system/stage-1-foundation-visual.json`.
