import type { Enums, Tables } from '@/types';

export type DashboardStats = {
  /** Số đơn tạo trong hôm nay. */
  ordersToday: number;
  pendingOrders: number;
  activeProducts: number;
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
