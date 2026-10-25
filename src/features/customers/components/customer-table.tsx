import { useMemo, useState } from 'react';
import { type ColumnDef, type SortingState } from '@tanstack/react-table';
import { MoreHorizontalIcon, PencilIcon, Trash2Icon, UsersIcon } from 'lucide-react';

import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { DataTable, type DataTablePagination } from '@/components/common/data-table';
import { DataTableColumnHeader } from '@/components/common/data-table-column-header';
import { EmptyState } from '@/components/common/empty-state';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePermission } from '@/features/auth/hooks';
import { formatDate } from '@/lib/utils';

import { useDeleteCustomer } from '../api';
import { isCustomerSortField, type Customer, type CustomerSortField } from '../types';

export type CustomerTableProps = {
  customers: Customer[];
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry?: () => void;
  pagination: DataTablePagination;
  sortBy: CustomerSortField;
  sortDir: 'asc' | 'desc';
  onSortChange: (sortBy: CustomerSortField, sortDir: 'asc' | 'desc') => void;
  onEdit: (customer: Customer) => void;
  onCreate: () => void;
  isFiltered: boolean;
};

export function CustomerTable({
  customers,
  isLoading,
  isError,
  error,
  onRetry,
  pagination,
  sortBy,
  sortDir,
  onSortChange,
  onEdit,
  onCreate,
  isFiltered,
}: CustomerTableProps) {
  const { can } = usePermission();
  const deleteCustomer = useDeleteCustomer();
  const [pendingDelete, setPendingDelete] = useState<Customer | null>(null);

  const sorting: SortingState = [{ id: sortBy, desc: sortDir === 'desc' }];

  const columns = useMemo<ColumnDef<Customer, unknown>[]>(
    () => [
      {
        accessorKey: 'full_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Khách hàng" />,
        cell: ({ row }) => <span className="font-medium">{row.original.full_name}</span>,
      },
      {
        id: 'contact',
        enableSorting: false,
        header: 'Liên hệ',
        cell: ({ row }) => (
          <div className="min-w-0 text-sm">
            <p className="truncate">{row.original.email ?? '—'}</p>
            {row.original.phone ? (
              <p className="text-muted-foreground">{row.original.phone}</p>
            ) : null}
          </div>
        ),
      },
      {
        id: 'city',
        enableSorting: false,
        header: 'Tỉnh/Thành',
        cell: ({ row }) => row.original.city ?? '—',
      },
      {
        accessorKey: 'created_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày tạo" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.created_at)}
          </span>
        ),
      },
      {
        id: 'actions',
        enableSorting: false,
        header: () => <span className="sr-only">Hành động</span>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Hành động cho ${row.original.full_name}`}
                >
                  <MoreHorizontalIcon className="size-4" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(row.original)}>
                  <PencilIcon className="size-4" aria-hidden />
                  Chỉnh sửa
                </DropdownMenuItem>
                {can('customers.delete') ? (
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setPendingDelete(row.original)}
                  >
                    <Trash2Icon className="size-4" aria-hidden />
                    Xoá
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [can, onEdit],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        isError={isError}
        error={error}
        {...(onRetry ? { onRetry } : {})}
        pagination={pagination}
        sorting={sorting}
        onSortingChange={(updater) => {
          const next = typeof updater === 'function' ? updater(sorting) : updater;
          const first = next[0];
          if (!first || !isCustomerSortField(first.id)) return;
          onSortChange(first.id, first.desc ? 'desc' : 'asc');
        }}
        getRowId={(customer) => String(customer.id)}
        empty={
          <EmptyState
            icon={UsersIcon}
            title={isFiltered ? 'Không có khách hàng nào khớp' : 'Chưa có khách hàng'}
            description={
              isFiltered
                ? 'Thử đổi từ khoá hoặc bỏ bớt điều kiện lọc.'
                : 'Thêm khách hàng để bắt đầu ghi nhận đơn hàng.'
            }
            {...(isFiltered ? {} : { action: { label: 'Thêm khách hàng', onClick: onCreate } })}
          />
        }
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Xoá khách hàng này?"
        description={
          pendingDelete
            ? `"${pendingDelete.full_name}" sẽ bị xoá. Khách đã có đơn hàng thì không xoá được.`
            : undefined
        }
        confirmLabel="Xoá"
        variant="destructive"
        isPending={deleteCustomer.isPending}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteCustomer.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
      />
    </>
  );
}
