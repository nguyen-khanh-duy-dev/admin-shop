import { useQuery } from '@tanstack/react-query';
import { startOfDay, subDays } from 'date-fns';

import { supabase } from '@/lib/supabase';

import type { DashboardStats, LowStockProduct, RecentOrder } from '../types';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  recentOrders: () => [...dashboardKeys.all, 'recent-orders'] as const,
  lowStock: (threshold: number) => [...dashboardKeys.all, 'low-stock', threshold] as const,
};

/** Lấy số đếm từ một truy vấn `head: true`, ném lỗi nếu Supabase trả về error. */
function unwrapCount({
  count,
  error,
}: {
  count: number | null;
  error: { message: string } | null;
}): number {
  if (error) throw new Error(error.message);
  return count ?? 0;
}

/**
 * Các số liệu tổng quan.
 *
 * Doanh thu được tính ở client từ danh sách đơn hoàn thành trong 30 ngày:
 * PostgREST không cho gọi `sum()` nếu không tạo view hoặc RPC, và 30 ngày đơn
 * hàng của một shop vẫn là lượng dữ liệu nhỏ. Khi dữ liệu lớn hơn, nên thay
 * bằng một view `daily_revenue` trong database.
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const todayStart = startOfDay(new Date()).toISOString();
  const monthStart = startOfDay(subDays(new Date(), 30)).toISOString();

  const [ordersToday, pendingOrders, activeProducts, newCustomers, completedOrders] =
    await Promise.all([
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart)
        .then(unwrapCount),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .then(unwrapCount),
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .then(unwrapCount),
      supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart)
        .then(unwrapCount),
      supabase
        .from('orders')
        .select('total, created_at')
        .eq('status', 'completed')
        .gte('created_at', monthStart)
        .then(({ data, error }) => {
          if (error) throw new Error(error.message);
          return data;
        }),
    ]);

  const revenueToday = completedOrders
    .filter((order) => order.created_at >= todayStart)
    .reduce((sum, order) => sum + order.total, 0);

  const revenueMonth = completedOrders.reduce((sum, order) => sum + order.total, 0);

  return { ordersToday, pendingOrders, activeProducts, newCustomers, revenueToday, revenueMonth };
}

export async function fetchRecentOrders(limit = 5): Promise<RecentOrder[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('id, code, status, total, created_at, customer:customers(full_name)')
    .order('created_at', { ascending: false })
    .limit(limit)
    .returns<RecentOrder[]>();

  if (error) throw new Error(error.message);
  return data;
}

/** Sản phẩm sắp hết hàng, sắp xếp tồn ít nhất lên đầu. */
export async function fetchLowStockProducts(threshold = 10, limit = 5): Promise<LowStockProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, sku, stock')
    .neq('status', 'archived')
    .lte('stock', threshold)
    .order('stock', { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data;
}

export function useDashboardStatsQuery() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: fetchDashboardStats,
    staleTime: 60_000,
  });
}

export function useRecentOrdersQuery() {
  return useQuery({
    queryKey: dashboardKeys.recentOrders(),
    queryFn: () => fetchRecentOrders(),
    staleTime: 60_000,
  });
}

export function useLowStockQuery(threshold = 10) {
  return useQuery({
    queryKey: dashboardKeys.lowStock(threshold),
    queryFn: () => fetchLowStockProducts(threshold),
    staleTime: 60_000,
  });
}
