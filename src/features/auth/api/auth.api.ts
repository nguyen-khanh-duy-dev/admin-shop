import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

import type { Profile } from '../store';

export type LoginInput = { email: string; password: string };

/** Đăng nhập bằng email + mật khẩu. Ném Error nếu sai thông tin. */
export async function login({ email, password }: LoginInput): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Supabase trả thông điệp tiếng Anh; dịch trường hợp hay gặp nhất.
    if (error.message === 'Invalid login credentials') {
      throw new Error('Email hoặc mật khẩu không đúng.');
    }
    throw new Error(error.message);
  }

  return data.session;
}

/** Đăng xuất và xoá session khỏi localStorage. */
export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

/** Session hiện tại, hoặc null nếu chưa đăng nhập. */
export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
}

/** Hồ sơ (kèm `role`) của một người dùng. */
export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single<Profile>();

  if (error) throw new Error(error.message);
  return data;
}

/** Gửi email đặt lại mật khẩu. */
export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/dat-lai-mat-khau`,
  });
  if (error) throw new Error(error.message);
}
