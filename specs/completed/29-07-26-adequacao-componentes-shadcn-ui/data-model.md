# Data Model & UI Component Mappings

## Visão Geral das Estruturas de Componentes UI

Este documento especifica o contrato de propriedades e o mapeamento dos componentes legados e telas para a biblioteca unificada Shadcn UI em `@/components/ui/`.

---

## 1. Mapeamento de Modais Customizados → Shadcn Dialog / Sheet

### Padrão Antigo (Custom Overlay)
```tsx
// ❌ Desejado Eliminar em 100% dos arquivos
{isOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <h2>Título</h2>
      {/* Conteúdo */}
      <button onClick={() => setIsOpen(false)}>Fechar</button>
    </div>
  </div>
)}
```

### Padrão Novo (Shadcn Dialog)
```tsx
// ✅ Padrão Requerido
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
      <DialogDescription>Descrição opcional do modal</DialogDescription>
    </DialogHeader>
    {/* Conteúdo com ScrollArea se extenso */}
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
      <Button onClick={handleSave}>Salvar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## 2. Mapeamento de Tabela HTML → Shadcn Table

### Padrão Antigo (HTML Table)
```tsx
// ❌ Em src/app/alimentos/page.tsx
<table className="w-full">
  <thead>
    <tr><th>Nome</th><th>Calorias</th></tr>
  </thead>
  <tbody>
    <tr><td>Arroz</td><td>130</td></tr>
  </tbody>
</table>
```

### Padrão Novo (Shadcn Table)
```tsx
// ✅ Padrão Requerido
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead>Calorias</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Arroz</TableCell>
      <TableCell>130</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## 3. Mapeamento de Form Elements (Select & Input)

| Propriedade Nativa | Mapeamento Shadcn `Select` | Mapeamento Shadcn `Input` |
| :--- | :--- | :--- |
| `value` | `<Select value={val} onValueChange={setVal}>` | `<Input value={val} onChange={e => setVal(e.target.value)} />` |
| `options` (`<option>`) | `<SelectItem value="opt1">Opção 1</SelectItem>` | N/A |
| `placeholder` | `<SelectValue placeholder="Selecione..." />` | `placeholder="Digite..."` |
| `disabled` | `disabled={isDisabled}` em `SelectTrigger` | `disabled={isDisabled}` |
