import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useAuthStore } from '@/features/auth/store';
import type { Tables } from '@/types';

import { profileFixture } from './fixtures';

/**
 * QueryClient riêng cho mỗi test: không retry (lỗi phải nổi lên ngay) và không
 * dùng chung cache giữa các test.
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

export type RenderWithProvidersOptions = Omit<RenderOptions, 'wrapper'> & {
  /** Đường dẫn ban đầu của router, ví dụ `/san-pham?page=2`. */
  route?: string;
  queryClient?: QueryClient;
};

export function renderWithProviders(
  ui: React.ReactElement,
  {
    route = '/',
    queryClient = createTestQueryClient(),
    ...options
  }: RenderWithProvidersOptions = {},
): RenderResult & { queryClient: QueryClient } {
  const result = render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    ),
    ...options,
  });

  return { ...result, queryClient };
}

/** Đặt phiên đăng nhập giả để test các component phụ thuộc quyền. */
export function signInAs(profile: Tables<'profiles'> = profileFixture) {
  useAuthStore.setState({
    status: 'authenticated',
    profile,
    user: null,
    session: null,
  });
}

/** Dọn store về trạng thái chưa đăng nhập. */
export function signOut() {
  useAuthStore.setState({
    status: 'unauthenticated',
    profile: null,
    user: null,
    session: null,
  });
}
