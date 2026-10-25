import { useMemo } from 'react';
import { type ColumnDef, type SortingState } from '@tanstack/react-table';
import { ShoppingCartIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { DataTable, type DataTablePagination } from '@/components/common/data-table';
import { DataTableColumnHeader } from '@/components/common/data-table-column-header';
import { EmptyState } from '@/components/common/empty-state';
import { formatCurrency, formatDateTime } from '@/lib/utils';

import { isOrderSortField, type OrderSortField, type OrderWithCustomer } from '../types';
import { OrderStatusBadge } from './order-status-badge';

export type OrderTableProps = {
  orders: OrderWithCustomer[];
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry?: () => void;
  pagination: DataTablePagination;
  sortBy: OrderSortField;
  sortDir: 'asc' | 'desc';
  onSortChange: (sortBy: OrderSortField, sortDir: 'asc' | 'desc') => void;
  isFiltered: boolean;
};

/** Bảng danh sách đơn hàng; bấm vào dòng để mở chi tiết. */
export function OrderTable({
  orders,
  isLoading,
  isError,
  error,
  onRetry,
  pagination,
  sortBy,
  sortDir,
  onSortChange,
  isFiltered,
}: OrderTableProps) {
  const navigate = useNavigate();
  const sorting: SortingState = [{ id: sortBy, desc: sortDir === 'desc' }];

  const columns = useMemo<ColumnDef<OrderWithCustomer, unknown>[]>(
    () => [
      {
        accessorKey: 'code',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Mã đơn" />,
        cell: ({ row }) => <span className="font-mono font-medium">{row.original.code}</span>,
      },
      {
        id: 'customer',
        enableSorting: false,
        header: 'Khách hàng',
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate">{row.original.customer?.full_name ?? '—'}</p>
            {row.original.customer?.phone ? (
              <p className="text-xs text-muted-foreground">{row.original.customer.phone}</p>
            ) : null}
          </div>
        ),
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
      empty={
        <EmptyState
          icon={ShoppingCartIcon}
          title={isFiltered ? 'Không có đơn nào khớp' : 'Chưa có đơn hàng'}
          description={
            isFiltered
              ? 'Thử đổi từ khoá hoặc bỏ bớt điều kiện lọc.'
              : 'Đơn hàng từ cửa hàng sẽ xuất hiện ở đây.'
          }
        />
      }
    />
  );
}
