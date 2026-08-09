# Technical Research & Architecture Decisions: Adequação Shadcn

## Decision 1: Refatoração de `atoms/Avatar.tsx`
- **Decisão**: Encapsular `@/components/ui/avatar` (`Avatar`, `AvatarImage`, `AvatarFallback`) dentro de `Avatar.tsx`.
- **Racional**: Mantém a API `initials`, `size`, `variant` para compatibilidade com o resto do sistema, porém renderiza internamente o componente Radix/Shadcn garantindo acessibilidade nativa e fallback automático.
- **Alternativas Consideradas**: Substituir os locais de chamada diretamente por `@/components/ui/avatar`. Rejeitado para evitar alterar dezenas de arquivos de páginas de uma só vez.

## Decision 2: Refatoração de `atoms/ProgressBar.tsx`
- **Decisão**: Substituir as `div`s nativas internas pelo componente `@/components/ui/progress`.
- **Racional**: A primitiva Shadcn já trata `role="progressbar"`, transições CSS via Radix UI `Indicator` e acessibilidade via leitor de tela.

## Decision 3: Refatoração de `organisms/PatientConsultationHistoryTable.tsx`
- **Decisão**: Migrar a tabela HTML nativa (`<table>`, `<tr>`, `<td>`) para a primitiva Shadcn `@/components/ui/table` (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, `TableHead`).
- **Racional**: O componente Shadcn Table padroniza os espaçamentos, linhas de divisão, estados de hover e tipografia conforme o design system global. A expansão de linha (accordion) continuará funcionando via renderização condicional de `TableRow` + `TableCell` com `colSpan={5}`.

## Decision 4: Padronização de Estados Vazios
- **Decisão**: Utilizar o componente `Empty` ou padrão semântico Shadcn com ícone `Utensils`/`Clock` e tipografia `text-muted-foreground` padronizada em `MealCardContainer`, `DietBuilderTemplate` e `ReadOnlyDietModal`.
- **Racional**: Elimina o uso pontual e inconsistente de caixas `div` com `border-dashed` manuais.
