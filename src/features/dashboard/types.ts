import type { Enums, Tables } from '@/types';

export type DashboardStats = {
  /** Số đơn tạo trong hôm nay. */
  ordersToday: number;
  pendingOrders: number;
  activeProducts: number;
  /** Sản phẩm đang bán có tồn < `LOW_STOCK_THRESHOLD`. */
  lowStockProducts: number;
  /** Khách hàng mới trong 30 ngày gần nhất. */
  newCustomers: number;
  revenueToday: number;
  revenueMonth: number;
};

export type RecentOrder = Pick<Tables<'orders'>, 'id' | 'code' | 'total' | 'created_at'> & {
  status: Enums<'order_status'>;
  customer: Pick<Tables<'customers'>, 'full_name'> | null;
};

export type LowStockProduct = Pick<Tables<'products'>, 'id' | 'name' | 'sku' | 'stock'>;

/** Khoảng thời gian của biểu đồ doanh thu. `12m` gộp theo tháng, còn lại theo ngày. */
export type RevenueRange = '7d' | '30d' | '12m';

export type RevenuePoint = {
  /** `yyyy-MM-dd` khi gộp theo ngày, `yyyy-MM` khi gộp theo tháng. */
  key: string;
  revenue: number;
  orders: number;
};

export type RevenueSeries = {
  bucket: 'day' | 'month';
  points: RevenuePoint[];
};
