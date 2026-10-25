import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';

import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuthListener } from '@/features/auth/hooks';
import { queryClient } from '@/lib/query-client';

import { ErrorBoundary } from './error-boundary';

/**
 * Đồng bộ phiên Supabase vào store.
 *
 * Phải là component riêng vì `useAuthListener` dùng React Query, nên bắt buộc
 * nằm **bên trong** `QueryClientProvider`.
 */
function AuthBootstrap({ children }: { children: React.ReactNode }) {
  useAuthListener();
  return children;
}

/** Mọi context dùng chung của app. Thứ tự lồng nhau là có chủ ý, xem ghi chú ở trên. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={300}>
            <AuthBootstrap>{children}</AuthBootstrap>
            <Toaster position="top-right" richColors closeButton />
          </TooltipProvider>
        </ThemeProvider>
        {import.meta.env.DEV ? <ReactQueryDevtools buttonPosition="bottom-left" /> : null}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
