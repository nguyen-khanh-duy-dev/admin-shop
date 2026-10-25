import { StoreIcon } from 'lucide-react';
import { Navigate } from 'react-router-dom';

import { LoginForm } from '../components';
import { useAuthStore } from '../store';

/** Trang đăng nhập. Người đã đăng nhập vào đây sẽ bị đẩy về dashboard. */
export default function LoginPage() {
  const status = useAuthStore((state) => state.status);

  if (status === 'authenticated') return <Navigate to="/" replace />;

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <StoreIcon className="size-5" aria-hidden />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Đăng nhập ShopAdmin</h1>
          <p className="text-sm text-muted-foreground">
            Dùng tài khoản nhân viên để vào bảng điều khiển.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
