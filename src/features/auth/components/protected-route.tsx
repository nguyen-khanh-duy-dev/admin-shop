import { Loader2Icon } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthStore } from '../store';

/**
 * Chặn các route cần đăng nhập.
 *
 * Dùng làm route cha trong `router.tsx`; route con render qua `<Outlet />`.
 * Khi chưa đăng nhập sẽ chuyển sang `/dang-nhap` và nhớ đường dẫn đang muốn
 * vào, để sau khi đăng nhập quay lại đúng chỗ đó.
 */
export function ProtectedRoute() {
  const status = useAuthStore((state) => state.status);
  const location = useLocation();

  if (status === 'loading') {
    return <FullPageSpinner label="Đang kiểm tra phiên đăng nhập…" />;
  }

  if (status === 'unauthenticated') {
    return (
      <Navigate to="/dang-nhap" replace state={{ from: location.pathname + location.search }} />
    );
  }

  return <Outlet />;
}

export function FullPageSpinner({ label }: { label?: string }) {
  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center gap-3"
      role="status"
      aria-live="polite"
    >
      <Loader2Icon className="size-6 animate-spin text-muted-foreground" aria-hidden />
      {label ? <p className="text-sm text-muted-foreground">{label}</p> : null}
    </div>
  );
}
