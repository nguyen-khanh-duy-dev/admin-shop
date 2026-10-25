import { useMemo, useState } from 'react';
import { type ColumnDef, type SortingState } from '@tanstack/react-table';
import { MoreHorizontalIcon, PackageIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
import { cn, formatCurrency, formatDate, formatNumber } from '@/lib/utils';

import { useDeleteProduct } from '../api';
import { isProductSortField, type ProductSortField, type ProductWithCategory } from '../types';
import { ProductStatusBadge } from './product-status-badge';

export type ProductTableProps = {
  products: ProductWithCategory[];
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry?: () => void;
  pagination: DataTablePagination;
  sortBy: ProductSortField;
  sortDir: 'asc' | 'desc';
  onSortChange: (sortBy: ProductSortField, sortDir: 'asc' | 'desc') => void;
  /** True khi người dùng đang lọc: lời nhắc khi trống sẽ khác đi. */
  isFiltered: boolean;
};

/** Bảng danh sách sản phẩm: sắp xếp và phân trang đều ở phía server. */
export function ProductTable({
  products,
  isLoading,
  isError,
  error,
  onRetry,
  pagination,
  sortBy,
  sortDir,
  onSortChange,
  isFiltered,
}: ProductTableProps) {
  const navigate = useNavigate();
  const { can } = usePermission();
  const deleteProduct = useDeleteProduct();
  const [pendingDelete, setPendingDelete] = useState<ProductWithCategory | null>(null);

  const sorting: SortingState = [{ id: sortBy, desc: sortDir === 'desc' }];

  const columns = useMemo<ColumnDef<ProductWithCategory, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Sản phẩm" />,
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="font-mono text-xs text-muted-foreground">{row.original.sku}</p>
          </div>
        ),
      },
      {
        id: 'category',
        enableSorting: false,
        header: 'Danh mục',
        cell: ({ row }) => row.original.category?.name ?? '—',
      },
      {
        accessorKey: 'price',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Giá" />,
        cell: ({ row }) => (
          <span className="tabular-nums">{formatCurrency(row.original.price)}</span>
        ),
      },
      {
        accessorKey: 'stock',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tồn" />,
        cell: ({ row }) => (
          <span
            className={cn(
              'tabular-nums',
              row.original.stock === 0 && 'font-medium text-destructive',
            )}
          >
            {formatNumber(row.original.stock)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        enableSorting: false,
        header: 'Trạng thái',
        cell: ({ row }) => <ProductStatusBadge status={row.original.status} />,
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
                  aria-label={`Hành động cho ${row.original.name}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <MoreHorizontalIcon className="size-4" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => void navigate(`/san-pham/${String(row.original.id)}/sua`)}
                >
                  <PencilIcon className="size-4" aria-hidden />
                  Chỉnh sửa
                </DropdownMenuItem>
                {can('products.delete') ? (
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
    [can, navigate],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        isError={isError}
        error={error}
        {...(onRetry ? { onRetry } : {})}
        pagination={pagination}
        sorting={sorting}
        onSortingChange={(updater) => {
          const next = typeof updater === 'function' ? updater(sorting) : updater;
          const first = next[0];
          if (!first || !isProductSortField(first.id)) return;
          onSortChange(first.id, first.desc ? 'desc' : 'asc');
        }}
        getRowId={(product) => String(product.id)}
        onRowClick={(product) => void navigate(`/san-pham/${String(product.id)}/sua`)}
        empty={
          <EmptyState
            icon={PackageIcon}
            title={isFiltered ? 'Không có sản phẩm nào khớp' : 'Chưa có sản phẩm'}
            description={
              isFiltered
                ? 'Thử đổi từ khoá hoặc bỏ bớt điều kiện lọc.'
                : 'Thêm sản phẩm đầu tiên để bắt đầu bán hàng.'
            }
            {...(isFiltered
              ? {}
              : {
                  action: { label: 'Thêm sản phẩm', onClick: () => void navigate('/san-pham/moi') },
                })}
          />
        }
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Xoá sản phẩm này?"
        description={
          pendingDelete
            ? `"${pendingDelete.name}" sẽ bị xoá khỏi danh sách. Hành động này không hoàn tác được.`
            : undefined
        }
        confirmLabel="Xoá"
        variant="destructive"
        isPending={deleteProduct.isPending}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteProduct.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
      />
    </>
  );
}
