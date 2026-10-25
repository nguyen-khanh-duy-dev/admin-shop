import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getErrorMessage } from './utils';

/**
 * Tạo QueryClient mới. Mỗi test nên gọi hàm này để có cache riêng,
 * app thật dùng instance `queryClient` export bên dưới.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: (failureCount, error) => {
          // Lỗi nghiệp vụ (4xx, RLS từ chối) thì thử lại cũng vô ích.
          if (getErrorMessage(error).toLowerCase().includes('jwt')) return false;
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
    // Toast tập trung: query lỗi khi đã có dữ liệu cũ trên màn hình, và mọi mutation lỗi.
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.state.data !== undefined) toast.error(getErrorMessage(error));
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        toast.error(getErrorMessage(error));
      },
    }),
  });
}

export const queryClient = createQueryClient();
