import { useCallback } from 'react';

import type { Enums } from '@/types';

import { useAuthStore } from '../store';

export type UserRole = Enums<'user_role'>;

/**
 * Bảng quyền của client.
 *
 * Đây chỉ là lớp chặn cho giao diện (ẩn nút, chặn route). Quyền thật nằm ở
 * Row Level Security trong `supabase/migrations` — mọi mục `*.delete` dưới đây
 * đều khớp với policy `..._delete_admin` chỉ cho admin xoá.
 */
export const PERMISSIONS = {
  'dashboard.view': ['admin', 'staff'],
  'products.view': ['admin', 'staff'],
  'products.create': ['admin', 'staff'],
  'products.update': ['admin', 'staff'],
  'products.delete': ['admin'],
  'orders.view': ['admin', 'staff'],
  'orders.update': ['admin', 'staff'],
  'orders.delete': ['admin'],
  'customers.view': ['admin', 'staff'],
  'customers.create': ['admin', 'staff'],
  'customers.update': ['admin', 'staff'],
  'customers.delete': ['admin'],
  'settings.manage': ['admin'],
} as const satisfies Record<string, readonly UserRole[]>;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: UserRole | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly UserRole[]).includes(role);
}

/**
 * Kiểm tra quyền của người đang đăng nhập.
 *
 *   const { can } = usePermission();
 *   {can('products.delete') && <DeleteButton />}
 */
export function usePermission() {
  const role = useAuthStore((state) => state.profile?.role ?? null);
  const isProfileLoaded = useAuthStore((state) => state.profile !== null);

  const can = useCallback((permission: Permission) => hasPermission(role, permission), [role]);

  return { role, can, isAdmin: role === 'admin', isProfileLoaded };
}
