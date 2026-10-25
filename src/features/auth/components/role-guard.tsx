import { ShieldAlertIcon } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { EmptyState } from '@/components/common/empty-state';

import { usePermission, type Permission } from '../hooks';
import { FullPageSpinner } from './protected-route';

export type RoleGuardProps = {
  /** Quyền bắt buộc phải có để xem nội dung bên trong. */
  permission: Permission;
  /** Nội dung cần bảo vệ. Bỏ trống khi dùng làm route cha (sẽ render `<Outlet />`). */
  children?: React.ReactNode;
  /** Thay cho thông báo "không có quyền" mặc định. */
  fallback?: React.ReactNode;
};

/**
 * Chỉ render nội dung khi người dùng có quyền tương ứng.
 *
 * Dùng bọc một khối UI:      <RoleGuard permission="products.delete">…</RoleGuard>
 * Hoặc làm route cha:        <Route element={<RoleGuard permission="settings.manage" />}>
 */
export function RoleGuard({ permission, children, fallback }: RoleGuardProps) {
  const { can, isProfileLoaded } = usePermission();

  // Chưa tải xong `profiles.role` thì chưa thể kết luận là thiếu quyền.
  if (!isProfileLoaded) return <FullPageSpinner label="Đang tải quyền truy cập…" />;

  if (!can(permission)) {
    return (
      fallback ?? (
        <EmptyState
          icon={ShieldAlertIcon}
          title="Bạn không có quyền truy cập"
          description="Khu vực này chỉ dành cho quản trị viên. Liên hệ admin nếu bạn cần quyền này."
        />
      )
    );
  }

  return children ?? <Outlet />;
}
