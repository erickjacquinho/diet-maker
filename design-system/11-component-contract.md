# 11 — Contrato de componente

## 1. Arquitetura normativa

Todo componente é definido por três níveis, nesta ordem:

1. fundamentos globais dos documentos 03–08;
2. uma categoria visual principal em [`components/categories/`](./components/categories/);
3. um perfil individual em [`components/profiles/`](./components/profiles/).

O nível inferior não redefine o superior. Traits podem adicionar capacidade compatível, sem alterar tokens, geometria, tipografia, foco ou semântica-base. Divergências exigem exceção formal.

Contratos operacionais:

- [contrato de categoria](./components/category-contract.md);
- [contrato de perfil individual](./components/component-profile-contract.md);
- [contrato de auditoria](./components/audit-contract.md);
- [schema do registro](./components/registry.schema.json).

## 2. Classificação em dois eixos

| Eixo | Campo | Responsabilidade |
| --- | --- | --- |
| Atomic Design | `currentLayer`, `targetLayer` | Localização, dependências e composição arquitetural |
| Categoria visual | `primaryCategory`, `traits` | Aparência, estados, interação e comportamento compartilhado |

A camada Atomic não justifica estilo. A categoria visual não autoriza dependência arquitetural.

## 3. Entrada obrigatória no registro

Antes de uma família pública ser adotada, [`registry.json`](./components/registry.json) deve registrar:

- ID e nome estáveis;
- natureza genérica, genérica do produto ou domínio;
- lifecycle;
- camada atual e camada-alvo;
- uma categoria principal;
- traits compatíveis;
- fontes reais e papel de cada fonte;
- todos os exports públicos;
- perfil individual;
- consumidores conhecidos;
- primitive base;
- estado documental;
- exceções.

Existência de arquivo não significa conformidade. `specStatus: homologated` certifica apenas documentação completa; conformidade do código exige migração e testes próprios.

## 4. API pública

Uma API deve:

- usar nomes do problema, não da implementação;
- manter o menor número de propriedades suficiente;
- preferir tipos discriminados para contratos diferentes;
- preferir `children` ou slots para conteúdo estrutural;
- expor callbacks como fatos ocorridos;
- documentar valores padrão relevantes;
- restringir variantes ao conjunto autorizado pela categoria e pelo perfil.

São proibidos:

- booleanos contraditórios;
- props de cor, tamanho, radius, spacing, shadow ou font livres;
- repasse indiscriminado de API interna;
- variantes antecipadas sem consumidor;
- valores que contornem tokens;
- classes locais que alterem o contrato visual.

## 5. Compound components e reexports

Uma família compound possui uma entrada e um perfil quando suas parts dependem do mesmo contrato. O registro enumera cada export como `component`, `compound-part`, `recipe`, `hook` ou `type`.

Reexports devem declarar `role: reexport`. Eles não criam uma segunda implementação nem uma segunda ficha para regras compartilhadas, mas continuam cobertos no inventário público.

## 6. Estados

A categoria define a matriz compartilhada. O perfil registra somente estados particulares.

Categorias interativas avaliam obrigatoriamente:

- default;
- hover;
- pressed;
- focus-visible;
- selected;
- disabled;
- loading;
- error;
- empty;
- read-only.

Estado não aplicável recebe `N/A` com justificativa semântica. Omissão silenciosa é inválida.

## 7. Acessibilidade

Todo contrato interativo deve:

- usar elemento nativo adequado quando possível;
- definir nome, role e value acessíveis;
- permitir operação completa por teclado;
- preservar ordem e retorno de foco;
- tornar foco visível conforme token oficial;
- comunicar erro, loading, seleção e mudança relevante;
- não depender somente de cor, posição ou movimento;
- respeitar reduced motion;
- preservar o comportamento acessível de Radix/Shadcn.

WCAG 2.2 AA e os presets desktop compact/standard prevalecem. Não existe requisito mobile de touch target neste escopo.

## 8. Adaptação desktop

O contrato não descreve mobile ou tablet. Quando houver variação a partir de `1024px`, o perfil pode registrar:

- largura mínima funcional;
- wrapping permitido;
- truncation;
- overflow;
- reorganização dentro do grid desktop;
- comportamento sob zoom;
- regiões fixas ou fluidas.

Essas particularidades não podem criar novos tokens locais.

## 9. Testes

Testes verificam comportamento público proporcional ao risco.

| Risco | Cobertura esperada |
| --- | --- |
| Estrutural | Composição e slots públicos |
| Controle | Eventos, teclado, foco e disabled |
| Formulário | Entrada, validação, erro e associação acessível |
| Assíncrono | Loading, sucesso, empty e error aplicáveis |
| Domínio | Semântica nutricional e transformações relevantes |
| Compound | Parts e ownership de estado/foco |
| Regressão | Cenário que reproduz o defeito |

Snapshots extensos não substituem afirmações comportamentais.

## 10. Promoção documental

Um componente pode atingir `specStatus: homologated` quando:

- [ ] aparece no registro com todas as fontes e exports;
- [ ] possui exatamente uma categoria principal estável;
- [ ] traits são conhecidos e compatíveis;
- [ ] perfil cumpre o contrato e não duplica categoria;
- [ ] estados particulares estão completos;
- [ ] exceções possuem decisão e revisão;
- [ ] camada atual e alvo refletem a realidade;
- [ ] consumidores estão identificados;
- [ ] auditoria estrita retorna zero finding bloqueante;
- [ ] dois revisores conseguem reproduzir a receita sem decisão adicional.

Homologação documental não altera automaticamente o lifecycle da implementação.
