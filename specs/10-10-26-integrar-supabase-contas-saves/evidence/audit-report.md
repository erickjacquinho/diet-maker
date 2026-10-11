# 📊 Relatório de Auditoria de Conformidade ao Atomic Design

**Data**: 11/10/2026, 02:12:18

## Resumo Executivo

- **Arquivos Analisados**: 166
- **Arquivos Conformes**: 164 (98.8%)
- **Arquivos com Violações**: 2
- **Total de Violações**: 5

## Violações Encontradas

| Arquivo | Linha | Tipo | Elemento | Sugestão | Trecho |
| --- | --- | --- | --- | --- | --- |
| `src/app/agenda/page.tsx` | 147 | `RESTRICTED_HTML_TAG` | `input` | <Input> (from Design System @/components/ui) | `<input` |
| `src/app/agenda/page.tsx` | 647 | `INLINE_STYLE` | `style` | Use Tailwind CSS classes or Design System spacing/color tokens | `style={{ gridTemplateRows: `repeat(${weeks.length}, 1fr)` }}` |
| `src/app/agenda/page.tsx` | 708 | `RESTRICTED_HTML_TAG` | `button` | <Button> (from Design System @/components/ui) | `<button` |
| `src/app/agenda/page.tsx` | 923 | `INLINE_STYLE` | `style` | Use Tailwind CSS classes or Design System spacing/color tokens | `<DialogContent className="flex max-h-dialog flex-col" style={{ height: 'var(--cmp-dialog-max-height)' }}>` |
| `src/components/organisms/CreateReadyMealsFromDietModal.tsx` | 151 | `RESTRICTED_HTML_TAG` | `input` | <Input> (from Design System @/components/ui) | `<input` |
