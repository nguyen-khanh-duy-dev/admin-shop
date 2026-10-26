import type { Enums, Tables } from '@/types';

export type Order = Tables<'orders'>;
export type OrderItem = Tables<'order_items'>;
export type OrderStatus = Enums<'order_status'>;
export type Customer = Tables<'customers'>;

/** Đơn hàng kèm khách hàng đã join, dùng cho bảng danh sách. */
export type OrderWithCustomer = Order & {
  customer: Pick<Customer, 'id' | 'full_name' | 'phone'> | null;
};

/** Đơn hàng kèm khách hàng và các dòng hàng, dùng cho trang chi tiết. */
export type OrderDetail = OrderWithCustomer & {
  items: OrderItem[];
};

export const ORDER_SORT_FIELDS = ['code', 'total', 'created_at'] as const;
export type OrderSortField = (typeof ORDER_SORT_FIELDS)[number];

export type OrderListFilters = {
  /** Từ khoá tìm theo mã đơn. */
  q: string;
  status: OrderStatus | 'all';
  page: number;
  pageSize: number;
  sortBy: OrderSortField;
  sortDir: 'asc' | 'desc';
};

/** Bộ lọc cho bảng lịch sử đơn của một khách hàng. */
export type CustomerOrderFilters = Pick<
  OrderListFilters,
  'page' | 'pageSize' | 'sortBy' | 'sortDir'
>;

/** Số liệu mua hàng của một khách hàng. */
export type CustomerOrderStats = {
  /** Tổng tiền các đơn đã hoàn thành — cùng cách tính doanh thu với dashboard. */
  totalSpent: number;
  /** Tổng số đơn, mọi trạng thái. */
  orderCount: number;
  /** Ngày đặt đơn gần nhất chưa bị huỷ, null nếu chưa có. */
  lastOrderAt: string | null;
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ xử lý',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã huỷ',
};

/**
 * Luồng trạng thái cho phép.
 *
 * Đơn đã hoàn thành hoặc đã huỷ là trạng thái cuối, không chuyển tiếp được —
 * nhờ vậy UI không cho nhân viên "hồi sinh" một đơn đã chốt.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ['shipping', 'cancelled'],
  shipping: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export function isOrderSortField(value: string): value is OrderSortField {
  return (ORDER_SORT_FIELDS as readonly string[]).includes(value);
}

export function isOrderStatus(value: string): value is OrderStatus {
  return value in ORDER_STATUS_LABELS;
}
