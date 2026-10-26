import { useMemo } from 'react';
import { type ColumnDef, type SortingState } from '@tanstack/react-table';
import { ShoppingCartIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { DataTable, type DataTablePagination } from '@/components/common/data-table';
import { DataTableColumnHeader } from '@/components/common/data-table-column-header';
import { EmptyState } from '@/components/common/empty-state';
import { OrderStatusBadge } from '@/features/orders/components';
import { isOrderSortField, type Order, type OrderSortField } from '@/features/orders/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export type CustomerOrderTableProps = {
  orders: Order[];
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry?: () => void;
  pagination: DataTablePagination;
  sortBy: OrderSortField;
  sortDir: 'asc' | 'desc';
  onSortChange: (sortBy: OrderSortField, sortDir: 'asc' | 'desc') => void;
};

/** Lịch sử đơn hàng của một khách; bấm vào dòng để mở chi tiết đơn. */
export function CustomerOrderTable({
  orders,
  isLoading,
  isError,
  error,
  onRetry,
  pagination,
  sortBy,
  sortDir,
  onSortChange,
}: CustomerOrderTableProps) {
  const navigate = useNavigate();
  const sorting: SortingState = [{ id: sortBy, desc: sortDir === 'desc' }];

  const columns = useMemo<ColumnDef<Order, unknown>[]>(
    () => [
      {
        accessorKey: 'code',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Mã đơn" />,
        cell: ({ row }) => <span className="font-mono font-medium">{row.original.code}</span>,
      },
      {
        accessorKey: 'total',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tổng tiền" />,
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">{formatCurrency(row.original.total)}</span>
        ),
      },
      {
        accessorKey: 'status',
        enableSorting: false,
        header: 'Trạng thái',
        cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'created_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày đặt" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDateTime(row.original.created_at)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={orders}
      isLoading={isLoading}
      isError={isError}
      error={error}
      {...(onRetry ? { onRetry } : {})}
      pagination={pagination}
      sorting={sorting}
      onSortingChange={(updater) => {
        const next = typeof updater === 'function' ? updater(sorting) : updater;
        const first = next[0];
        if (!first || !isOrderSortField(first.id)) return;
        onSortChange(first.id, first.desc ? 'desc' : 'asc');
      }}
      getRowId={(order) => String(order.id)}
      onRowClick={(order) => void navigate(`/don-hang/${String(order.id)}`)}
      skeletonRows={5}
      empty={
        <EmptyState
          icon={ShoppingCartIcon}
          title="Chưa có đơn hàng"
          description="Khách hàng này chưa đặt đơn nào."
        />
      }
    />
  );
}
