import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Paginated } from '@/types';

import type { OrderDetail, OrderListFilters, OrderWithCustomer } from '../types';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrderListFilters) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: number) => [...orderKeys.details(), id] as const,
};

const ORDER_SELECT = '*, customer:customers(id, full_name, phone)';

function sanitizeSearchTerm(term: string) {
  return term.replace(/[,()%_\\]/g, ' ').trim();
}

export async function fetchOrders(
  filters: OrderListFilters,
): Promise<Paginated<OrderWithCustomer>> {
  const { q, status, page, pageSize, sortBy, sortDir } = filters;
  const from = (page - 1) * pageSize;

  let query = supabase.from('orders').select(ORDER_SELECT, { count: 'exact' });

  const keyword = sanitizeSearchTerm(q);
  if (keyword) query = query.ilike('code', `%${keyword}%`);
  if (status !== 'all') query = query.eq('status', status);

  const { data, error, count } = await query
    .order(sortBy, { ascending: sortDir === 'asc' })
    .range(from, from + pageSize - 1)
    .returns<OrderWithCustomer[]>();

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

export async function fetchOrder(id: number): Promise<OrderDetail> {
  const { data, error } = await supabase
    .from('orders')
    .select(`${ORDER_SELECT}, items:order_items(*)`)
    .eq('id', id)
    .single<OrderDetail>();

  if (error) throw new Error(error.message);
  return data;
}

export function useOrdersQuery(filters: OrderListFilters) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => fetchOrders(filters),
    placeholderData: (previous) => previous,
  });
}

export function useOrderQuery(id: number | null) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? 0),
    queryFn: () => fetchOrder(id ?? 0),
    enabled: id !== null,
  });
}
