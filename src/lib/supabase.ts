import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Thiếu biến môi trường VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY. ' +
      'Copy .env.example thành .env rồi điền giá trị từ Supabase Dashboard > Project Settings > API.',
  );
}

/**
 * Client dùng chung cho toàn app. Có generic <Database> nên mọi truy vấn
 * `.from('products')` đều được TypeScript kiểm tra tên bảng và tên cột.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'shop-admin-auth',
  },
});

/**
 * Ném lỗi nếu Supabase trả về error, ngược lại trả data đã bỏ null.
 * Dùng để React Query bắt được lỗi và chuyển query sang trạng thái `error`.
 */
export function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  if (result.data === null) throw new Error('Không tìm thấy dữ liệu.');
  return result.data;
}
