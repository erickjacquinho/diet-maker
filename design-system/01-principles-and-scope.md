# 01 — Princípios e escopo

## 1. Premissa

O Design System é um **sistema de decisões compartilhadas**, não apenas uma coleção de componentes ou estilos.

Seu valor está em tornar criação, uso, manutenção e substituição previsíveis. Um componente só pertence ao sistema quando possui responsabilidade estável, contrato explícito e possibilidade real de manutenção.

## 2. Princípios obrigatórios

### 2.1 Resolver uma responsabilidade real

Todo componente DEVE resolver um problema identificável de interface.

Não se cria um componente apenas para:

- reduzir algumas linhas de JSX;
- renomear um primitivo sem acrescentar contrato;
- antecipar um reuso ainda hipotético;
- ocultar diferenças de produto que deveriam permanecer explícitas.

Complexidade, risco de acessibilidade ou necessidade de consistência podem justificar um componente mesmo antes do segundo uso.

### 2.2 Preferir a menor abstração suficiente

A ordem normal de decisão é:

1. usar o componente existente;
2. configurar uma API já existente;
3. adicionar uma variante compatível;
4. compor componentes existentes;
5. criar um componente novo.

Essa ordem não é uma meta de reutilização máxima. É um mecanismo para evitar APIs duplicadas e abstrações prematuras.

### 2.3 Composição antes de proliferação

Diferenças estruturais devem ser expressas por composição, slots e filhos. Variantes devem representar um conjunto pequeno e fechado de alternativas semânticas.

Um componente NÃO DEVE acumular propriedades booleanas independentes que produzam combinações inválidas ou difíceis de testar.

### 2.4 Contratos explícitos

O consumidor deve conseguir entender o componente sem conhecer sua implementação interna.

Responsabilidade, conteúdo, estados, eventos, acessibilidade e limites de uso fazem parte do contrato. Classes CSS e detalhes internos não fazem.

### 2.5 Acessibilidade como comportamento

Acessibilidade não é uma etapa posterior de acabamento. Semântica, nome acessível, teclado, foco e anúncio de estado pertencem à definição funcional do componente.

O projeto adota WCAG 2.2 nível AA como referência mínima aplicável. Nem todo critério se aplica a todo componente; toda exceção aplicável precisa ser justificada.

### 2.6 Separar mecanismo de domínio

Primitivos e átomos devem descrever mecanismos genéricos. Vocabulário e regras de paciente, dieta, refeição, alimento, TACO e macronutriente devem aparecer nas camadas de domínio.

O teste rápido é:

> Este componente ainda faria sentido, com o mesmo nome e API, em um produto sem nutrição?

Se sim, ele tende a ser genérico. Se não, tende a pertencer ao domínio.

### 2.7 Evoluir sem surpresa

Mudanças compatíveis devem preservar consumidores existentes. Mudanças incompatíveis exigem migração explícita, período de depreciação quando viável e registro do substituto.

### 2.8 Documentar fatos separadamente de planos

- Código existente é **implementado**.
- Ideia aprovada sem código é **proposta**.
- Código em avaliação é **experimental**.
- API adotada e protegida contra mudanças incompatíveis é **estável**.

Um componente planejado nunca pode ser apresentado como disponível.

## 3. O que pertence a este pacote

Este pacote cobre:

- direção visual;
- arquitetura de tokens;
- cores e contraste;
- tipografia;
- spacing, geometria e layout desktop;
- iconografia, movimento, elevação e camadas;
- hierarquia de contraste;
- taxonomia e dependências;
- critérios de criação e reutilização;
- contratos públicos;
- especificações de componentes;
- estados comportamentais;
- acessibilidade;
- implementação e conformidade;
- documentação e testes;
- inventário;
- aprovação, versão, depreciação e remoção.

## 4. Plataforma e responsividade

O NutriDiet é um produto **exclusivamente web para desktop**.

Não fazem parte do escopo:

- versão mobile;
- versão tablet;
- aplicativo nativo;
- navegação ou composição específica para telas estreitas;
- estratégia mobile-first;
- paridade de experiência entre desktop e dispositivos móveis.

Responsividade existe apenas como robustez dentro do ambiente desktop:

- o conteúdo deve se adaptar a variações razoáveis de largura da janela;
- componentes não devem quebrar por pequenas reduções de espaço;
- tabelas e regiões densas podem usar overflow deliberado;
- layouts podem reorganizar colunas quando isso preservar a tarefa no desktop;
- não serão criadas escalas tipográficas específicas para mobile ou tablet;
- não serão criados componentes alternativos apenas para outros dispositivos.

A faixa oficial começa em `1024px`, conforme a especificação de layout. Abaixo disso não existe garantia.

Essa restrição reduz escopo, mas não remove requisitos de acessibilidade, zoom do navegador, teclado, foco ou legibilidade.

## 5. O que permanece fora deste pacote

Este pacote não define:

- requisitos de negócio;
- modelo de dados;
- conteúdo clínico;
- fluxo específico não documentado pelo produto;
- identidade de marketing fora do aplicativo;
- versão mobile, tablet ou nativa;
- implementação já concluída por mera existência da especificação.

Esses assuntos pertencem à documentação de produto, domínio, arquitetura e implementação.

## 6. Escala adequada ao projeto

O NutriDiet é atualmente um projeto pequeno. Sua governança deve continuar leve:

- documentação em Markdown versionada com o código;
- revisão no mesmo fluxo da alteração;
- registro central único;
- decisão arquitetural separada apenas quando houver impacto transversal;
- Storybook opcional, não requisito imediato.

Ferramentas adicionais só devem ser adotadas quando reduzirem custo real de descoberta, validação ou colaboração.
