import { type ColumnDef } from '@tanstack/react-table';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/test-utils';

import { DataTable } from './data-table';

type Row = { id: number; name: string };

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: 'name', header: 'Tên', cell: ({ row }) => row.original.name },
];

const rows: Row[] = [
  { id: 1, name: 'Áo thun' },
  { id: 2, name: 'Quần jeans' },
];

describe('DataTable', () => {
  it('hiển thị dữ liệu được truyền vào', () => {
    renderWithProviders(<DataTable columns={columns} data={rows} />);

    expect(screen.getByText('Áo thun')).toBeInTheDocument();
    expect(screen.getByText('Quần jeans')).toBeInTheDocument();
  });

  it('hiển thị trạng thái trống khi không có dòng nào', () => {
    renderWithProviders(<DataTable columns={columns} data={[]} />);

    expect(screen.getByText('Chưa có dữ liệu')).toBeInTheDocument();
  });

  it('không hiện trạng thái trống khi đang tải', () => {
    renderWithProviders(<DataTable columns={columns} data={[]} isLoading />);

    expect(screen.queryByText('Chưa có dữ liệu')).not.toBeInTheDocument();
  });

  it('hiển thị lỗi kèm nút thử lại', async () => {
    const onRetry = vi.fn();
    renderWithProviders(
      <DataTable
        columns={columns}
        data={[]}
        isError
        error={new Error('Mất kết nối')}
        onRetry={onRetry}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Mất kết nối');

    await userEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('phân trang: khoá nút Trước ở trang đầu và gọi onPageChange khi bấm Sau', async () => {
    const onPageChange = vi.fn();
    renderWithProviders(
      <DataTable
        columns={columns}
        data={rows}
        pagination={{ page: 1, pageSize: 2, total: 5, pageCount: 3, onPageChange }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Trang trước' })).toBeDisabled();
    expect(screen.getByText(/Hiển thị 1–2 trong 5 bản ghi/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Trang sau' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('khoá nút Sau ở trang cuối', () => {
    renderWithProviders(
      <DataTable
        columns={columns}
        data={rows}
        pagination={{ page: 3, pageSize: 2, total: 5, pageCount: 3, onPageChange: vi.fn() }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Trang sau' })).toBeDisabled();
  });
});
