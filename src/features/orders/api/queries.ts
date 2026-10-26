import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Paginated } from '@/types';

import type {
  CustomerOrderFilters,
  CustomerOrderStats,
  Order,
  OrderDetail,
  OrderListFilters,
  OrderWithCustomer,
} from '../types';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrderListFilters) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: number) => [...orderKeys.details(), id] as const,
  /**
   * Đơn của một khách hàng. Đặt dưới `lists()` để mọi mutation đang invalidate
   * danh sách đơn cũng làm mới luôn lịch sử và số liệu ở trang chi tiết khách.
   */
  byCustomer: (customerId: number) => [...orderKeys.lists(), 'customer', customerId] as const,
  customerList: (customerId: number, filters: CustomerOrderFilters) =>
    [...orderKeys.byCustomer(customerId), filters] as const,
  customerStats: (customerId: number) => [...orderKeys.byCustomer(customerId), 'stats'] as const,
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

export async function fetchCustomerOrders(
  customerId: number,
  filters: CustomerOrderFilters,
): Promise<Paginated<Order>> {
  const { page, pageSize, sortBy, sortDir } = filters;
  const from = (page - 1) * pageSize;

  const { data, error, count } = await supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .eq('customer_id', customerId)
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

/**
 * Tổng hợp ở client từ 3 cột nhẹ của mọi đơn của khách. Một khách hiếm khi có
 * quá vài trăm đơn nên chấp nhận được; nếu lớn hơn thì nên chuyển thành RPC.
 */
export async function fetchCustomerOrderStats(customerId: number): Promise<CustomerOrderStats> {
  const { data, error } = await supabase
    .from('orders')
    .select('total, status, created_at')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const totalSpent = data
    .filter((order) => order.status === 'completed')
    .reduce((sum, order) => sum + order.total, 0);
  const lastOrder = data.find((order) => order.status !== 'cancelled');

  return { totalSpent, orderCount: data.length, lastOrderAt: lastOrder?.created_at ?? null };
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

export function useCustomerOrdersQuery(customerId: number, filters: CustomerOrderFilters) {
  return useQuery({
    queryKey: orderKeys.customerList(customerId, filters),
    queryFn: () => fetchCustomerOrders(customerId, filters),
    placeholderData: (previous) => previous,
  });
}

export function useCustomerOrderStatsQuery(customerId: number) {
  return useQuery({
    queryKey: orderKeys.customerStats(customerId),
    queryFn: () => fetchCustomerOrderStats(customerId),
  });
}
