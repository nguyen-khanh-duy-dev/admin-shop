import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { customerFixtures } from '@/test/fixtures';
import { server } from '@/test/msw/server';
import { renderWithProviders, signInAs } from '@/test/test-utils';
import type { Tables } from '@/types';

import CustomerDetailPage from './customer-detail-page';

/** Phải khớp với `test.env` trong vite.config.ts. */
const REST = 'http://localhost:54321/rest/v1';

const orders: Tables<'orders'>[] = [
  {
    id: 11,
    code: 'DH000011',
    customer_id: 1,
    status: 'cancelled',
    total: 900000,
    note: null,
    created_at: '2026-10-20T03:00:00Z',
    updated_at: '2026-10-20T03:00:00Z',
  },
  {
    id: 10,
    code: 'DH000010',
    customer_id: 1,
    status: 'completed',
    total: 250000,
    note: null,
    created_at: '2026-10-10T03:00:00Z',
    updated_at: '2026-10-10T03:00:00Z',
  },
  {
    id: 9,
    code: 'DH000009',
    customer_id: 1,
    status: 'completed',
    total: 150000,
    note: null,
    created_at: '2026-10-01T03:00:00Z',
    updated_at: '2026-10-01T03:00:00Z',
  },
];

function mockApi() {
  server.use(
    http.get(`${REST}/customers`, ({ request }) => {
      const id = new URL(request.url).searchParams.get('id');
      return HttpResponse.json(customerFixtures.filter((c) => `eq.${String(c.id)}` === id));
    }),
    http.get(`${REST}/orders`, () =>
      HttpResponse.json(orders, { headers: { 'Content-Range': `0-2/${String(orders.length)}` } }),
    ),
  );
}

function renderPage(route: string) {
  signInAs();
  return renderWithProviders(
    <Routes>
      <Route path="/khach-hang/:id" element={<CustomerDetailPage />} />
    </Routes>,
    { route },
  );
}

describe('CustomerDetailPage', () => {
  it('hiện thông tin, số liệu và lịch sử đơn của khách', async () => {
    mockApi();
    renderPage('/khach-hang/1');

    expect(await screen.findByRole('heading', { name: 'Nguyễn Văn A' })).toBeInTheDocument();
    expect(screen.getByText('a@example.com')).toBeInTheDocument();
    expect(screen.getByText('Số 1 Lê Lợi, Hà Nội')).toBeInTheDocument();

    // Chỉ cộng đơn hoàn thành; ngày mua gần nhất bỏ qua đơn đã huỷ.
    expect(await screen.findByText(/400\.000/)).toBeInTheDocument();
    expect(screen.getByText('10/10/2026')).toBeInTheDocument();

    expect(await screen.findByText('DH000011')).toBeInTheDocument();
    expect(screen.getByText('DH000009')).toBeInTheDocument();
  });

  it('hiện "Không tìm thấy khách hàng" khi id không tồn tại', async () => {
    mockApi();
    renderPage('/khach-hang/999');

    expect(await screen.findByText('Không tìm thấy khách hàng')).toBeInTheDocument();
  });

  it('hiện "Không tìm thấy khách hàng" khi id không phải số', () => {
    renderPage('/khach-hang/abc');

    expect(screen.getByText('Không tìm thấy khách hàng')).toBeInTheDocument();
  });
});
