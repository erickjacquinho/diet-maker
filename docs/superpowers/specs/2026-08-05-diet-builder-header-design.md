# Reorganização do cabeçalho da criação de dieta

**Data:** 2026-08-05  
**Status:** Aprovado para planejamento  
**Escopo:** Cabeçalho e distribuição de ações da tela `/pacientes/[id]/dieta/[dietaId]`

## Contexto

O `DietBuilderTemplate` concentra navegação, título, identificação do paciente, cinco ações e o seletor de modo em uma composição vertical sem uma hierarquia clara. O botão de retorno tem tratamento diferente do padrão da tela de paciente, enquanto o `DietModeSwitcher` aparece como uma segunda caixa de destaque antes do contexto do paciente e das metas.

A tela de paciente já possui uma composição adequada para este fluxo: container desktop centralizado, navegação compacta com botão de retorno icon-only, overline de contexto e título. Essa estrutura será reutilizada como referência visual e de posicionamento.

## Objetivo

Reduzir a carga cognitiva do topo da tela e tornar a ordem de leitura previsível:

1. Onde estou e como volto.
2. Qual tarefa estou executando.
3. Qual é o modo da dieta.
4. Para qual paciente e com quais metas estou trabalhando.
5. Quais ações pertencem a cada região do fluxo.

## Abordagem aprovada

Usar a estrutura de navegação da tela de paciente e distribuir as ações por contexto. O cabeçalho terá apenas uma ação primária: `Salvar Prescrição`.

Abordagens rejeitadas:

- manter todos os comandos lado a lado no cabeçalho;
- criar uma barra fixa persistente de ações;
- criar uma nova linguagem visual ou novos primitivos para este fluxo.

## Composição visual e ordem DOM

O template continua sendo responsável somente pelo esqueleto da página. A ordem será:

```text
main
└── page container (workflow)
    ├── page navigation/header
    │   ├── botão Voltar ao Prontuário
    │   └── overline "Pacientes / Dieta" + h1 "Elaboração de Plano Alimentar"
    │       └── ação primária "Salvar Prescrição"
    ├── seleção do modelo da dieta
    ├── contexto do paciente e metas/macros
    │   └── ação contextual "Escalar"
    └── seção de refeições
        ├── título "Refeições"
        ├── ação "Nova Refeição"
        └── lista ou estado vazio
```

### Navegação e título

- Reutilizar o padrão estrutural de `src/app/pacientes/[id]/page.tsx`.
- O retorno será um link com `ArrowLeft`, nome acessível e o mesmo tratamento visual do botão de retorno do perfil.
- O texto de contexto será um overline curto, sem repetir o nome do paciente.
- O título será o `h1` da página; o título atual não será mantido como `h2`.
- O nome do paciente continua no `MacroTrackerHeader`, evitando duplicação no topo.
- `Salvar Prescrição` fica alinhado à direita no mesmo nível do cabeçalho, como única CTA primária.

### Seletor de modo

`DietModeSwitcher` será mantido como componente existente e receberá apenas a redução de sua composição visual:

- uma única superfície compacta, sem sombra forte;
- uma linha principal com o rótulo do conjunto à esquerda e a seleção segmentada à direita;
- descrição auxiliar curta somente quando necessária;
- opções de ciclo de carboidratos aparecem progressivamente apenas quando esse modo está ativo;
- contagem de variações, abas dos dias e cópia entre variações continuam disponíveis no painel expandido;
- seleção continua sendo única, com estado programático, foco visível e navegação por teclado.

Essa redução preserva o contrato do componente e não altera o modelo de dados ou os callbacks existentes.

### Contexto, metas e ações

`MacroTrackerHeader` continuará sendo reutilizado para paciente, peso, objetivo e métricas. O botão `Ajustar Metas` permanece dentro do `PatientBadgeHeader`, pois é uma ação diretamente relacionada às metas.

`Escalar` sai do cabeçalho global e será renderizado junto da região de metas/macros, em posição secundária e alinhada ao final da região. O callback atual será preservado.

### Refeições

- Criar uma linha de seção com o título `Refeições` e `Nova Refeição` como ação secundária contextual.
- A ação não será duplicada no cabeçalho global.
- O estado vazio continuará explicando a tarefa, mas não criará uma segunda ação concorrente; a ação principal da seção será suficiente.
- A grade existente de refeições permanece sem mudança de comportamento.

### Ações secundárias

`WhatsApp` e `PDF` serão agrupados em um menu `Mais ações`, usando o `DropdownMenu` já existente em `src/components/ui/dropdown-menu.tsx`. O menu terá:

- trigger com nome acessível `Mais ações`;
- itens textuais com ícones `MessageCircle` e `FileText`;
- foco, teclado e fechamento delegados ao primitivo Radix existente;
- os callbacks `onWhatsAppShare` e `onExportPDF` preservados.

## Limites de implementação

- Não criar novos primitivos em `src/components/ui`.
- Não alterar o modelo de dieta, persistência ou regras de cálculo.
- Não criar variante mobile/tablet; o produto permanece desktop a partir de 1024px.
- Não duplicar o paciente em dois cabeçalhos.
- Não mover ações para modais novos.
- Não introduzir valores visuais arbitrários; usar tokens, text styles e recipes existentes.
- Não transformar `DietModeSwitcher` em um componente novo; ajustar a composição do componente registrado atual.

## Acessibilidade e interação

- Ordem DOM seguirá a ordem visual e a ordem de leitura da tarefa.
- O retorno terá nome acessível explícito e preservará a pilha de navegação.
- Haverá uma única CTA primária na região de página.
- Todos os controles interativos manterão foco visível e alvo de controle conforme os primitives existentes.
- O menu `Mais ações` será acionável por mouse e teclado, sem depender de hover.
- A troca de modo manterá o estado selecionado anunciado e as opções de ciclo serão reveladas progressivamente.
- A hierarquia de headings será `h1` da página, seguida dos títulos de seção sem saltos.
- A reorganização não deverá causar sobreposição, perda de conteúdo ou quebra dentro da faixa desktop suportada.

## Critérios de aceite

- O topo não exibe mais `Nova Refeição`, `Escalar`, `WhatsApp` e `PDF` juntos de `Salvar Prescrição`.
- O botão de retorno corresponde ao padrão visual/estrutural da tela do paciente.
- Existe apenas uma CTA primária no cabeçalho: `Salvar Prescrição`.
- O seletor de modo aparece antes do contexto de metas, com layout compacto e expansão progressiva para ciclo de carboidratos.
- `Nova Refeição` aparece na seção de refeições.
- `Escalar` aparece na região de metas/macros.
- `WhatsApp` e `PDF` continuam acessíveis pelo menu `Mais ações` e executam os mesmos callbacks.
- O nome do paciente é exibido uma única vez no contexto principal da dieta.
- O comportamento existente de salvar, alternar modo, escalar, compartilhar, exportar e adicionar refeição permanece preservado.
- Testes de tipo, suíte relevante e verificação visual da rota passam.

## Validação planejada

- Testes de composição do template para a ordem dos landmarks, títulos e ações.
- Teste de interação para `Salvar Prescrição`, `Mais ações`, `WhatsApp`, `PDF`, `Nova Refeição` e `Escalar`.
- Teste de acessibilidade para nome do retorno, foco do menu, hierarquia de headings e seleção de modo.
- Verificação visual em 1024px, 1280px e 1440px, incluindo o estado simples, ciclo de carboidratos e estado vazio de refeições.
- Execução de `npm run type-check` e dos testes relevantes da rota/componentes.
