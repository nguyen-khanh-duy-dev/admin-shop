import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/test-utils';

import { PRODUCT_FORM_DEFAULTS } from '../schemas';
import { ProductForm } from './product-form';

describe('ProductForm', () => {
  it('chặn submit và hiện lỗi khi form còn trống', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(
      <ProductForm
        defaultValues={PRODUCT_FORM_DEFAULTS}
        onSubmit={onSubmit}
        isPending={false}
        submitLabel="Thêm sản phẩm"
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Thêm sản phẩm' }));

    expect(await screen.findByText(/Tên sản phẩm tối thiểu 2 ký tự/)).toBeInTheDocument();
    expect(screen.getByText(/SKU tối thiểu 3 ký tự/)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('gọi onSubmit với dữ liệu đã hợp lệ', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(
      <ProductForm
        defaultValues={{ ...PRODUCT_FORM_DEFAULTS, name: 'Áo thun', sku: 'AO-001', price: 199000 }}
        onSubmit={onSubmit}
        isPending={false}
        submitLabel="Thêm sản phẩm"
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Thêm sản phẩm' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce();
    });
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      name: 'Áo thun',
      sku: 'AO-001',
      price: 199000,
      status: 'draft',
    });
  });

  it('tự chuyển SKU sang chữ in hoa khi người dùng gõ', async () => {
    renderWithProviders(
      <ProductForm
        defaultValues={PRODUCT_FORM_DEFAULTS}
        onSubmit={vi.fn()}
        isPending={false}
        submitLabel="Thêm sản phẩm"
      />,
    );

    const skuInput = screen.getByLabelText('SKU');
    await userEvent.type(skuInput, 'ao-thun-001');

    expect(skuInput).toHaveValue('AO-THUN-001');
  });

  it('khoá nút lưu khi đang gửi', () => {
    renderWithProviders(
      <ProductForm
        defaultValues={PRODUCT_FORM_DEFAULTS}
        onSubmit={vi.fn()}
        isPending
        submitLabel="Lưu thay đổi"
      />,
    );

    expect(screen.getByRole('button', { name: /Lưu thay đổi/ })).toBeDisabled();
  });
});
