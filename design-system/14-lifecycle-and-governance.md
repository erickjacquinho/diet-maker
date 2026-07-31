# 14 — Ciclo de vida e governança

## 1. Estados do ciclo de vida

| Estado | Significado | Pode ser usado? | Compatibilidade |
| --- | --- | --- | --- |
| Proposto | Decisão aceita, ainda sem implementação | Não | Não aplicável |
| Experimental | Implementado para validação; API pode mudar | Sim, conscientemente | Não garantida |
| Estável | Contrato adotado e documentado | Sim | Obrigatória |
| Depreciado | Ainda funciona, mas possui substituto | Apenas em código existente | Preservada durante migração |
| Removido | Não está mais disponível | Não | Encerrada |

`Implementado` pode aparecer no inventário inicial quando o código existe, mas sua maturidade ainda não foi formalmente avaliada. Ele não equivale automaticamente a estável.

`Migração necessária` é uma marca de auditoria, não estágio de maturidade. Indica que a implementação existe, mas diverge do contrato-alvo.

## 2. Fluxo de mudança

```text
necessidade
    ↓
decisão: usar | variar | compor | criar
    ↓
contrato e classificação
    ↓
proposto
    ↓
experimental
    ↓
estável
    ↓
depreciado
    ↓
removido
```

Nem toda alteração precisa percorrer todas as fases:

- correções compatíveis em componentes estáveis permanecem estáveis;
- uma composição local descartada não entra no registro;
- um componente experimental pode ser removido sem depreciação longa, desde que seus consumidores sejam migrados na mesma alteração.

## 3. Proposta

Uma proposta de componente novo ou mudança pública deve incluir:

- problema e consumidor real;
- análise de alternativa existente;
- decisão entre variante, composição e componente;
- classificação arquitetural;
- rascunho do contrato;
- impacto em consumidores;
- risco de acessibilidade;
- estratégia de teste.

Para uma mudança pequena, essas informações podem estar na descrição da alteração. Crie um ADR somente quando a decisão:

- afeta várias famílias de componentes;
- altera limites arquiteturais;
- introduz dependência estrutural;
- possui alternativas relevantes e consequência duradoura.

## 4. Revisão

A revisão deve verificar, nesta ordem:

1. problema e escopo;
2. duplicação e alternativas;
3. camada e dependências;
4. API e composição;
5. comportamento e acessibilidade;
6. testes;
7. documentação, registro e migração.

Critérios visuais pertencem à especificação visual correspondente e não substituem esta revisão.

O mantenedor responsável pela alteração aprova a promoção. O projeto não precisa criar um comitê enquanto uma revisão normal de código for suficiente.

## 5. Versionamento

O Design System deve registrar impacto usando a lógica de Semantic Versioning, mesmo sendo interno ao aplicativo.

### Patch

- correção de defeito sem alterar contrato;
- melhoria interna;
- teste ou documentação;
- ajuste acessível compatível;
- correção visual compatível.

### Minor

- novo componente;
- nova variante compatível;
- novo slot ou propriedade opcional;
- promoção de experimental para estável;
- depreciação com API antiga ainda funcionando.

### Major

- remoção de componente ou propriedade estável;
- renome incompatível;
- mudança de semântica ou comportamento público;
- mudança obrigatória de estrutura;
- alteração de valor padrão que muda substancialmente o uso.

Enquanto não houver releases próprios do Design System, o impacto deve ser registrado na alteração e no histórico Git. Não é necessário criar um pacote ou processo de release separado.

## 6. Compatibilidade

Mudanças em componente estável DEVEM ser compatíveis por padrão.

Se a incompatibilidade for necessária:

1. documentar motivo e consumidores afetados;
2. oferecer substituto;
3. fornecer instrução de migração;
4. marcar API antiga como depreciada;
5. migrar consumidores;
6. remover somente depois de não haver consumidores.

Uma mudança de TypeScript que continua compilando ainda pode ser incompatível se alterar semântica, foco, teclado, eventos ou valores padrão.

## 7. Depreciação

Toda depreciação deve registrar:

- componente ou API depreciada;
- substituto;
- motivo;
- exemplo antes/depois quando necessário;
- consumidores conhecidos;
- condição de remoção;
- data ou versão de início.

Use `@deprecated` em exportações públicas quando a linguagem permitir.

Não mantenha duas APIs indefinidamente. Depois que a busca no repositório confirmar zero consumidores e a migração estiver concluída, a remoção pode ser feita em mudança própria ou no próximo marco incompatível.

## 8. Atualizações obrigatórias por tipo de alteração

| Alteração | Contrato | Registro | Testes | Migração |
| --- | --- | --- | --- | --- |
| Correção interna | Se comportamento documentado mudar | Não | Sim | Não |
| Nova variante | Sim | Atualizar entrada | Sim | Não |
| Novo componente | Sim | Adicionar | Sim | Não |
| Promoção de estágio | Revisar | Atualizar | Confirmar | Não |
| Depreciação | Sim | Atualizar | Preservar | Sim |
| Remoção | Remover/arquivar | Atualizar | Atualizar | Concluída |

## 9. Auditoria periódica

Realize auditoria quando houver uma entrega relevante ou crescimento perceptível do catálogo, não por calendário arbitrário.

Verifique:

- componentes sem consumidor;
- duplicações;
- experimentais antigos;
- depreciados ainda usados;
- documentação que declara componentes inexistentes;
- páginas grandes contendo responsabilidades reutilizáveis;
- violações de dependência;
- lacunas de acessibilidade e testes.
