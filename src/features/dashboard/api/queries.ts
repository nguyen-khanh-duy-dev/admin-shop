import { useQuery } from '@tanstack/react-query';
import { format, parseISO, startOfDay, startOfMonth, subDays, subMonths } from 'date-fns';

import { LOW_STOCK_THRESHOLD } from '@/features/products/types';
import { supabase } from '@/lib/supabase';

import type {
  DashboardStats,
  LowStockProduct,
  RecentOrder,
  RevenuePoint,
  RevenueRange,
  RevenueSeries,
} from '../types';

/** Múi giờ dùng để chia ngày doanh thu, khớp với RPC `daily_revenue`. */
const SHOP_TIME_ZONE = 'Asia/Ho_Chi_Minh';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  revenue: (range: RevenueRange) => [...dashboardKeys.all, 'revenue', range] as const,
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

  const [
    ordersToday,
    pendingOrders,
    activeProducts,
    lowStockProducts,
    newCustomers,
    completedOrders,
  ] = await Promise.all([
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
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .lt('stock', LOW_STOCK_THRESHOLD)
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

  return {
    ordersToday,
    pendingOrders,
    activeProducts,
    lowStockProducts,
    newCustomers,
    revenueToday,
    revenueMonth,
  };
}

/** Ngày hôm nay theo giờ của shop, bất kể máy người dùng đặt múi giờ nào. */
function shopToday(): Date {
  // Locale en-CA định dạng ngày thành `yyyy-MM-dd`.
  const iso = new Intl.DateTimeFormat('en-CA', { timeZone: SHOP_TIME_ZONE }).format(new Date());
  return parseISO(iso);
}

function revenueDateRange(range: RevenueRange) {
  const today = shopToday();
  const from =
    range === '7d'
      ? subDays(today, 6)
      : range === '30d'
        ? subDays(today, 29)
        : startOfMonth(subMonths(today, 11));

  return { from: format(from, 'yyyy-MM-dd'), to: format(today, 'yyyy-MM-dd') };
}

/**
 * Doanh thu đơn hoàn thành theo ngày, qua RPC `daily_revenue`.
 *
 * RPC đã trả đủ mọi ngày trong khoảng (ngày trống = 0) nên biểu đồ không bị
 * đứt. Chế độ 12 tháng vẫn lấy theo ngày (~365 dòng, dưới giới hạn 400 ngày
 * của RPC) rồi gộp theo tháng ở client.
 */
export async function fetchRevenueSeries(range: RevenueRange): Promise<RevenueSeries> {
  const { from, to } = revenueDateRange(range);
  const { data, error } = await supabase.rpc('daily_revenue', { p_from: from, p_to: to });

  if (error) throw new Error(error.message);

  // `numeric` và `bigint` có thể về dạng chuỗi tuỳ cấu hình PostgREST, nên ép kiểu lại.
  const days: RevenuePoint[] = data.map((row) => ({
    key: row.day,
    revenue: Number(row.revenue),
    orders: Number(row.orders),
  }));

  if (range !== '12m') return { bucket: 'day', points: days };

  const months = new Map<string, RevenuePoint>();
  for (const day of days) {
    const key = day.key.slice(0, 7);
    const month = months.get(key) ?? { key, revenue: 0, orders: 0 };
    month.revenue += day.revenue;
    month.orders += day.orders;
    months.set(key, month);
  }

  return { bucket: 'month', points: [...months.values()] };
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
export async function fetchLowStockProducts(
  threshold = LOW_STOCK_THRESHOLD,
  limit = 5,
): Promise<LowStockProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, sku, stock')
    .eq('status', 'active')
    .lt('stock', threshold)
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

export function useLowStockQuery(threshold = LOW_STOCK_THRESHOLD) {
  return useQuery({
    queryKey: dashboardKeys.lowStock(threshold),
    queryFn: () => fetchLowStockProducts(threshold),
    staleTime: 60_000,
  });
}

/** Giữ dữ liệu khoảng cũ trên biểu đồ trong lúc tải khoảng mới, tránh nháy skeleton. */
export function useRevenueSeriesQuery(range: RevenueRange) {
  return useQuery({
    queryKey: dashboardKeys.revenue(range),
    queryFn: () => fetchRevenueSeries(range),
    staleTime: 60_000,
    placeholderData: (previous) => previous,
  });
}
