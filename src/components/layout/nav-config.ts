import {
  LayoutDashboardIcon,
  PackageIcon,
  ShoppingCartIcon,
  UsersIcon,
  type LucideIcon,
} from 'lucide-react';

import type { Permission } from '@/features/auth/hooks';

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Quyền tối thiểu để thấy mục này trên sidebar. */
  permission: Permission;
};

/** Nguồn duy nhất cho sidebar và breadcrumb: thêm trang mới thì khai báo ở đây. */
export const NAV_ITEMS: readonly NavItem[] = [
  { to: '/', label: 'Tổng quan', icon: LayoutDashboardIcon, permission: 'dashboard.view' },
  { to: '/san-pham', label: 'Sản phẩm', icon: PackageIcon, permission: 'products.view' },
  { to: '/don-hang', label: 'Đơn hàng', icon: ShoppingCartIcon, permission: 'orders.view' },
  { to: '/khach-hang', label: 'Khách hàng', icon: UsersIcon, permission: 'customers.view' },
];

/** Nhãn hiển thị cho từng đoạn đường dẫn, dùng cho breadcrumb. */
export const SEGMENT_LABELS: Record<string, string> = {
  'san-pham': 'Sản phẩm',
  'don-hang': 'Đơn hàng',
  'khach-hang': 'Khách hàng',
  moi: 'Thêm mới',
  sua: 'Chỉnh sửa',
};
