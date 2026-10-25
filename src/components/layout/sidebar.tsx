import { StoreIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { usePermission } from '@/features/auth/hooks';
import { cn } from '@/lib/utils';

import { NAV_ITEMS } from './nav-config';

export type SidebarProps = {
  /** Gọi khi người dùng chọn một mục, để đóng sidebar trên mobile. */
  onNavigate?: () => void;
  className?: string;
};

/**
 * Danh sách điều hướng chính. Mục nào người dùng không có quyền xem thì ẩn,
 * nhưng route vẫn được `RoleGuard` chặn lại — ẩn UI không phải là bảo mật.
 */
export function Sidebar({ onNavigate, className }: SidebarProps) {
  const { can } = usePermission();
  const items = NAV_ITEMS.filter((item) => can(item.permission));

  return (
    <div className={cn('flex h-full flex-col bg-sidebar text-sidebar-foreground', className)}>
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex size-7 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <StoreIcon className="size-4" aria-hidden />
        </div>
        <span className="font-semibold tracking-tight">ShopAdmin</span>
      </div>

      <nav aria-label="Điều hướng chính" className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70',
              )
            }
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>

      <p className="border-t px-4 py-3 text-xs text-muted-foreground">ShopAdmin v0.1.0</p>
    </div>
  );
}
