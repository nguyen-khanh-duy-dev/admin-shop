import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Paginated } from '@/types';

import {
  LOW_STOCK_THRESHOLD,
  type Category,
  type Product,
  type ProductListFilters,
  type ProductWithCategory,
} from '../types';

/**
 * Khoá cache theo tầng: huỷ hiệu lực `productKeys.lists()` là làm mới mọi
 * danh sách bất kể bộ lọc, mà không chạm tới cache chi tiết.
 */
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductListFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
  categories: ['categories'] as const,
};

const PRODUCT_SELECT = '*, category:categories(id, name)';

/**
 * PostgREST dùng dấu phẩy và ngoặc làm cú pháp trong `or(...)`, nên từ khoá
 * người dùng gõ phải bỏ các ký tự đó, kèm `%` và `_` của LIKE.
 */
function sanitizeSearchTerm(term: string) {
  return term.replace(/[,()%_\\]/g, ' ').trim();
}

export async function fetchProducts(
  filters: ProductListFilters,
): Promise<Paginated<ProductWithCategory>> {
  const { q, status, stock, categoryId, page, pageSize, sortBy, sortDir } = filters;
  const from = (page - 1) * pageSize;

  let query = supabase.from('products').select(PRODUCT_SELECT, { count: 'exact' });

  const keyword = sanitizeSearchTerm(q);
  if (keyword) query = query.or(`name.ilike.%${keyword}%,sku.ilike.%${keyword}%`);
  if (status !== 'all') query = query.eq('status', status);
  if (stock === 'low') query = query.lt('stock', LOW_STOCK_THRESHOLD);
  if (categoryId !== 'all') query = query.eq('category_id', categoryId);

  const { data, error, count } = await query
    .order(sortBy, { ascending: sortDir === 'asc' })
    .range(from, from + pageSize - 1)
    .returns<ProductWithCategory[]>();

  if (error) throw new Error(error.message);

  const total = count ?? 0;

  return {
    rows: data,
    total,
    page,
    pageSize,
    pageCount: Math.max(Math.ceil(total / pageSize), 1),
  };
}

export async function fetchProduct(id: number): Promise<Product> {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();

  if (error) throw new Error(error.message);
  return data;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name');

  if (error) throw new Error(error.message);
  return data;
}

/** Danh sách sản phẩm theo bộ lọc, giữ dữ liệu trang cũ khi đổi trang. */
export function useProductsQuery(filters: ProductListFilters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => fetchProducts(filters),
    placeholderData: (previous) => previous,
  });
}

/** Chi tiết một sản phẩm. Truyền `id = null` khi đang ở form thêm mới. */
export function useProductQuery(id: number | null) {
  return useQuery({
    queryKey: productKeys.detail(id ?? 0),
    queryFn: () => fetchProduct(id ?? 0),
    enabled: id !== null,
  });
}

/** Danh mục thay đổi rất ít nên cache lâu hơn mặc định. */
export function useCategoriesQuery() {
  return useQuery({
    queryKey: productKeys.categories,
    queryFn: fetchCategories,
    staleTime: 10 * 60_000,
  });
}
