import type { ReactNode } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';

export function DataTableStateRow({
  columns,
  children,
  role,
}: {
  columns: number;
  children: ReactNode;
  role?: 'alert' | 'status';
}) {
  return (
    <TableRow>
      <TableCell colSpan={columns} className="h-table-row text-center text-text-secondary">
        <span role={role}>{children}</span>
      </TableCell>
    </TableRow>
  );
}
