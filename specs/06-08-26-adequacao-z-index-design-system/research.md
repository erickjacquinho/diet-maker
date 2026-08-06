# Research: Adequação da hierarquia z-index ao Design System

## Decision 1: Usar a escala semântica vigente como fonte única

- **Decision**: Manter os onze tokens definidos em `design-system/07-icons-motion-and-layers.md` e tratar `z-dropdown` como a camada de dropdown/select, `z-popover` como a camada de popover ancorado, `z-overlay` como backdrop e `z-modal` como conteúdo de dialog/sheet.
- **Rationale**: A norma global proíbe valores locais e já define semântica, valor e uso. Resolver a divergência no fundamento/perfis evita que o consumidor escolha entre números equivalentes.
- **Alternatives considered**: Manter `z-popover` para select/menu porque já aparece no código; rejeitado porque contradiz a tabela global e torna o nome do token menos previsível. Criar novos tokens para contexto modal; rejeitado porque `z-modal` já expressa a elevação necessária.

## Decision 2: Representar overlay dentro de modal por contexto semântico fechado

- **Decision**: Usar uma API fechada de contexto (`default`/`modal`) nos primitives que precisam atravessar a camada modal. O default permanece a camada de overlay comum; `modal` resolve para `z-modal` sem expor valor numérico.
- **Rationale**: Conteúdo portalled de um Select/Popover dentro de Dialog precisa superar o conteúdo modal, mas o consumidor não deve escrever `!z-modal` ou outro utility. A variação representa contexto de empilhamento, não uma nova aparência.
- **Alternatives considered**: Classe local no consumidor; rejeitada pela proibição de decisões visuais locais. Contexto global implícito via DOM; rejeitado porque Radix portal não garante uma relação simples de ancestrais e torna a regra frágil. Novo token `z-modal-content`; rejeitado por duplicar o papel de `z-modal`.

## Decision 3: Corrigir Sheet e DatePicker no ponto de contrato

- **Decision**: `SheetOverlay` permanece em `z-overlay`; `SheetContent` usa `z-modal`. `DatePickerField` passa contexto ao primitive de Popover em vez de aplicar `z-modal` diretamente.
- **Rationale**: Backdrop e painel modal têm papéis diferentes; compartilhar a camada depende da ordem do DOM. O DatePicker é uma molecule de `fields` que compõe `overlays` e não deve redefinir a hierarquia no consumidor.
- **Alternatives considered**: Preservar `z-overlay` no Sheet content; rejeitado porque pode deixar o painel na mesma camada do backdrop. Manter `className="z-modal"` no DatePicker; rejeitado pelo contrato de composição e pela necessidade de reutilização em outros contextos.

## Decision 4: Substituir o overlay manual da busca de ingredientes

- **Decision**: Recompor os resultados da busca de ingredientes usando o primitive/composto de overlay aprovado, com contexto modal quando hospedado em `CreateRecipeModal`, mantendo os Buttons e os estados de resultado do domínio.
- **Rationale**: A `div` posicionada atual usa `z-dropdown`, mas não herda automaticamente portal, dismissal, foco ou colisão do contrato de `overlays`. A responsabilidade de domínio continua na molecule; a infraestrutura de camada fica no primitive.
- **Alternatives considered**: Apenas trocar `z-dropdown` por `z-modal` na `div`; rejeitado porque corrige o número sem corrigir a interação acessível. Criar uma nova categoria visual; rejeitado porque `overlays` já cobre o caso.

## Decision 5: Validar com gate estático determinístico e testes comportamentais

- **Decision**: Adicionar um auditor específico de z-index e testes de contrato/integração focados, mantendo os gates atuais como validação complementar.
- **Rationale**: O catálogo atual valida documentação e rastreabilidade, enquanto a auditoria legacy não detecta `z-10` nem incompatibilidade semântica. Um gate nominal reproduzível impede regressão; testes comportamentais cobrem foco e layering real.
- **Alternatives considered**: Confiar apenas em `rg`; rejeitado porque não entende contexto, `layer` semântico ou tokens incompatíveis. Confiar apenas em revisão visual; rejeitado porque não é determinístico nem protege novas alterações.

## Decision 6: Preservar o estado parcial já presente no worktree

- **Decision**: Considerar `SelectContent layer="modal"` e os 10 consumidores existentes como baseline parcial; documentar e testar a API antes de ampliá-la para Popover.
- **Rationale**: A alteração já está presente e possui teste focado. Reverter ou duplicar a solução aumentaria risco e perderia a intenção do trabalho corrente.
- **Alternatives considered**: Reverter para classes locais; rejeitado porque reintroduz a divergência que a feature deve eliminar. Tratar a alteração como concluída; rejeitado porque o perfil e o gate ainda não cobrem o contrato completo.
