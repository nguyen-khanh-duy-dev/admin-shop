import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { FullPageSpinner } from '@/features/auth/components';

import { Header } from './header';
import { Sidebar } from './sidebar';

/**
 * Khung màn hình của toàn bộ khu vực đã đăng nhập: sidebar cố định bên trái từ
 * breakpoint `md`, header dính trên cùng, nội dung trang render qua `<Outlet />`.
 */
export function AppLayout() {
  return (
    <div className="min-h-svh bg-background md:grid md:grid-cols-[16rem_1fr]">
      <aside className="hidden border-r md:block">
        <div className="sticky top-0 h-svh">
          <Sidebar />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6">
          <Suspense fallback={<FullPageSpinner label="Đang tải trang…" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
