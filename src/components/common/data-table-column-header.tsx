import { type Column } from '@tanstack/react-table';
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type DataTableColumnHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
};

/** Tiêu đề cột bấm được để đổi chiều sắp xếp. Dùng trong `ColumnDef.header`. */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <span className={className}>{title}</span>;
  }

  const sorted = column.getIsSorted();
  const Icon = sorted === 'asc' ? ArrowUpIcon : sorted === 'desc' ? ArrowDownIcon : ArrowUpDownIcon;

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn('-ml-2 h-8 data-[state=open]:bg-accent', className)}
      onClick={() => column.toggleSorting(sorted === 'asc')}
      aria-label={`Sắp xếp theo ${title}`}
    >
      {title}
      <Icon className={cn('size-3.5', !sorted && 'opacity-50')} aria-hidden />
    </Button>
  );
}
