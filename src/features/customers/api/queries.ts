import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Paginated } from '@/types';

import type { Customer, CustomerListFilters } from '../types';

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: CustomerListFilters) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: number) => [...customerKeys.details(), id] as const,
  cities: ['customers', 'cities'] as const,
};

function sanitizeSearchTerm(term: string) {
  return term.replace(/[,()%_\\]/g, ' ').trim();
}

export async function fetchCustomers(filters: CustomerListFilters): Promise<Paginated<Customer>> {
  const { q, city, page, pageSize, sortBy, sortDir } = filters;
  const from = (page - 1) * pageSize;

  let query = supabase.from('customers').select('*', { count: 'exact' });

  const keyword = sanitizeSearchTerm(q);
  if (keyword) {
    query = query.or(
      `full_name.ilike.%${keyword}%,email.ilike.%${keyword}%,phone.ilike.%${keyword}%`,
    );
  }
  if (city !== 'all') query = query.eq('city', city);

  const { data, error, count } = await query
    .order(sortBy, { ascending: sortDir === 'asc' })
    .range(from, from + pageSize - 1);

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

/** Trả về `null` khi không có khách hàng với id này, để trang hiện "không tìm thấy". */
export async function fetchCustomer(id: number): Promise<Customer | null> {
  const { data, error } = await supabase.from('customers').select('*').eq('id', id).maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Danh sách tỉnh/thành đang có khách hàng, dùng cho dropdown lọc.
 *
 * Supabase chưa hỗ trợ `select distinct`, nên lấy cột rồi lọc trùng ở client.
 * Chấp nhận được vì số tỉnh/thành hữu hạn; nếu dữ liệu lớn hơn thì nên tạo view.
 */
export async function fetchCustomerCities(): Promise<string[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('city')
    .not('city', 'is', null)
    .order('city');

  if (error) throw new Error(error.message);

  const cities = data.map((row) => row.city).filter((city): city is string => city !== null);
  return [...new Set(cities)];
}

export function useCustomersQuery(filters: CustomerListFilters) {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: () => fetchCustomers(filters),
    placeholderData: (previous) => previous,
  });
}

export function useCustomerQuery(id: number | null) {
  return useQuery({
    queryKey: customerKeys.detail(id ?? 0),
    queryFn: () => fetchCustomer(id ?? 0),
    enabled: id !== null,
  });
}

export function useCustomerCitiesQuery() {
  return useQuery({
    queryKey: customerKeys.cities,
    queryFn: fetchCustomerCities,
    staleTime: 10 * 60_000,
  });
}
