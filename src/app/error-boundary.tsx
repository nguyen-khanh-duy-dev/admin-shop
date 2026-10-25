import { Component, type ErrorInfo, type ReactNode } from 'react';

import { ErrorState } from '@/components/common/error-state';

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Bắt lỗi render của cả cây component.
 *
 * React không có hook tương đương nên đây là một trong ít chỗ còn phải dùng
 * class component. Lỗi gọi API do React Query lo; cái này bắt lỗi khi render.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    // Thay bằng Sentry hoặc dịch vụ log tương tự khi lên production.
    console.error('Lỗi render:', error, info.componentStack);
  }

  override render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-svh items-center justify-center p-6">
          <ErrorState
            title="Ứng dụng gặp sự cố"
            error={this.state.error}
            onRetry={() => window.location.reload()}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
