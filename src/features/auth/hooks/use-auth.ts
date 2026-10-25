import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

import { getProfile, login as loginRequest, logout as logoutRequest } from '../api';
import { useAuthStore } from '../store';

export const authKeys = {
  all: ['auth'] as const,
  profile: (userId: string) => ['auth', 'profile', userId] as const,
};

/**
 * Nối Supabase Auth vào store. Gọi **một lần** ở `providers.tsx`.
 *
 * `onAuthStateChange` bắn ngay sự kiện đầu tiên với session đã lưu trong
 * localStorage, nên không cần gọi `getSession()` riêng — chỉ cần một nguồn.
 */
export function useAuthListener() {
  const setSession = useAuthStore((state) => state.setSession);
  const setProfile = useAuthStore((state) => state.setProfile);
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      // Đăng xuất: dọn toàn bộ cache để dữ liệu của người cũ không lọt sang người mới.
      if (event === 'SIGNED_OUT') queryClient.clear();
    });

    return () => data.subscription.unsubscribe();
  }, [setSession, queryClient]);

  const profileQuery = useQuery({
    queryKey: authKeys.profile(userId ?? ''),
    queryFn: () => getProfile(userId ?? ''),
    enabled: Boolean(userId),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (profileQuery.data) setProfile(profileQuery.data);
  }, [profileQuery.data, setProfile]);
}

/** Thông tin phiên đăng nhập và hai hành động login/logout. */
export function useAuth() {
  const session = useAuthStore((state) => state.session);
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const status = useAuthStore((state) => state.status);
  const reset = useAuthStore((state) => state.reset);

  const loginMutation = useMutation({ mutationFn: loginRequest });

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSuccess: reset,
  });

  return {
    session,
    user,
    profile,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}
