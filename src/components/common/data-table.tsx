import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type SortingState,
} from '@tanstack/react-table';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn, formatNumber } from '@/lib/utils';

export type DataTablePagination = {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  /** Thay cho EmptyState mặc định khi danh sách trống. */
  empty?: React.ReactNode;
  /** Phân trang phía server. Bỏ trống nếu không cần phân trang. */
  pagination?: DataTablePagination;
  /** Sắp xếp phía server. Truyền cùng nhau hoặc không truyền cả hai. */
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  getRowId?: (row: TData) => string;
  onRowClick?: (row: TData) => void;
  /** Số dòng skeleton khi đang tải lần đầu. */
  skeletonRows?: number;
};

/**
 * Bảng dữ liệu dùng chung cho mọi trang danh sách.
 *
 * Tự xử lý 4 trạng thái: đang tải, lỗi, trống, có dữ liệu. Phân trang và sắp
 * xếp đều ở phía server (`manualPagination`/`manualSorting`) nên bảng chỉ hiển
 * thị đúng những gì API trả về, không tự cắt trang.
 */
export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  isError = false,
  error,
  onRetry,
  empty,
  pagination,
  sorting,
  onSortingChange,
  getRowId,
  onRowClick,
  skeletonRows = 8,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: pagination?.pageCount ?? -1,
    state: sorting ? { sorting } : {},
    ...(onSortingChange ? { onSortingChange } : {}),
    ...(getRowId ? { getRowId: (row: TData) => getRowId(row) } : {}),
  });

  if (isError) {
    return (
      <div className="rounded-lg border">
        <ErrorState error={error} {...(onRetry ? { onRetry } : {})} />
      </div>
    );
  }

  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;
  const showEmpty = !isLoading && rows.length === 0;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            {headerGroups.map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: header.getSize() || undefined }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                  <TableRow key={`skeleton-${String(rowIndex)}`}>
                    {columns.map((_column, columnIndex) => (
                      <TableCell key={`skeleton-cell-${String(columnIndex)}`}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    className={cn(onRowClick && 'cursor-pointer')}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>

        {showEmpty
          ? (empty ?? (
              <EmptyState
                title="Chưa có dữ liệu"
                description="Thử bỏ bớt điều kiện lọc hoặc thêm mới một bản ghi."
              />
            ))
          : null}
      </div>

      {pagination ? <DataTablePaginationBar {...pagination} isLoading={isLoading} /> : null}
    </div>
  );
}

function DataTablePaginationBar({
  page,
  pageSize,
  total,
  pageCount,
  onPageChange,
  isLoading,
}: DataTablePagination & { isLoading: boolean }) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const canPrevious = page > 1 && !isLoading;
  const canNext = page < pageCount && !isLoading;

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Hiển thị {formatNumber(from)}–{formatNumber(to)} trong {formatNumber(total)} bản ghi
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrevious}
          aria-label="Trang trước"
        >
          <ChevronLeftIcon className="size-4" aria-hidden />
          Trước
        </Button>
        <span className="text-sm tabular-nums">
          {page} / {Math.max(pageCount, 1)}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext}
          aria-label="Trang sau"
        >
          Sau
          <ChevronRightIcon className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
