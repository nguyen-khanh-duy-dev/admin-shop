import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import type { Tables } from '@/types';

export type Profile = Tables<'profiles'>;

/** `loading` là trạng thái lúc app vừa mở và chưa biết người dùng có đang đăng nhập hay không. */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type AuthState = {
  session: Session | null;
  user: User | null;
  /** Hồ sơ trong bảng `profiles`, chứa `role`. Null khi chưa tải xong. */
  profile: Profile | null;
  status: AuthStatus;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  reset: () => void;
};

/**
 * Phiên đăng nhập hiện tại.
 *
 * Chỉ giữ trạng thái, không gọi API: việc đồng bộ với Supabase do
 * `useAuthListener` đảm nhiệm. Không dùng `persist` vì supabase-js đã tự lưu
 * session vào localStorage — lưu thêm một bản nữa sẽ sinh ra hai nguồn sự thật.
 */
export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  status: 'loading',
  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      status: session ? 'authenticated' : 'unauthenticated',
      // Đổi người dùng thì hồ sơ cũ không còn đúng.
      ...(session ? {} : { profile: null }),
    }),
  setProfile: (profile) => set({ profile }),
  reset: () => set({ session: null, user: null, profile: null, status: 'unauthenticated' }),
}));
