import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/test/msw/server';

import type { ProductListFilters } from '../types';
import { fetchProducts } from './queries';

const baseFilters: ProductListFilters = {
  q: '',
  status: 'all',
  categoryId: 'all',
  page: 1,
  pageSize: 20,
  sortBy: 'created_at',
  sortDir: 'desc',
};

describe('fetchProducts', () => {
  it('trả về danh sách kèm thông tin phân trang', async () => {
    const result = await fetchProducts(baseFilters);

    expect(result.rows).toHaveLength(3);
    expect(result.total).toBe(3);
    expect(result.page).toBe(1);
    expect(result.pageCount).toBe(1);
  });

  it('join được tên danh mục', async () => {
    const result = await fetchProducts(baseFilters);

    expect(result.rows[0]?.category?.name).toBe('Áo');
    expect(result.rows[2]?.category).toBeNull();
  });

  it('lọc theo từ khoá trên tên và SKU', async () => {
    const result = await fetchProducts({ ...baseFilters, q: 'jeans' });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.sku).toBe('QUAN-JEAN-002');
  });

  it('lọc theo trạng thái', async () => {
    const result = await fetchProducts({ ...baseFilters, status: 'draft' });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.status).toBe('draft');
  });

  it('lọc theo danh mục', async () => {
    const result = await fetchProducts({ ...baseFilters, categoryId: 2 });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.category_id).toBe(2);
  });

  it('tính pageCount từ tổng số dòng và pageSize', async () => {
    const result = await fetchProducts({ ...baseFilters, pageSize: 2 });

    expect(result.rows).toHaveLength(2);
    expect(result.total).toBe(3);
    expect(result.pageCount).toBe(2);
  });

  it('pageCount tối thiểu là 1 khi không có dòng nào', async () => {
    server.use(
      http.get('http://localhost:54321/rest/v1/products', () =>
        HttpResponse.json([], { headers: { 'Content-Range': '0-0/0' } }),
      ),
    );

    const result = await fetchProducts(baseFilters);

    expect(result.rows).toHaveLength(0);
    expect(result.pageCount).toBe(1);
  });

  it('ném Error khi Supabase trả về lỗi', async () => {
    server.use(
      http.get('http://localhost:54321/rest/v1/products', () =>
        HttpResponse.json({ message: 'permission denied for table products' }, { status: 403 }),
      ),
    );

    await expect(fetchProducts(baseFilters)).rejects.toThrow(/permission denied/);
  });
});
