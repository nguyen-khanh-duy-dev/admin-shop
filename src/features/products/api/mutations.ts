import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabase';
import type { TablesInsert, TablesUpdate } from '@/types';

import type { Product } from '../types';
import { productKeys } from './queries';

export type CreateProductInput = TablesInsert<'products'>;
export type UpdateProductInput = { id: number; patch: TablesUpdate<'products'> };

/** Mã lỗi Postgres cho vi phạm UNIQUE; ở bảng products chỉ có cột `sku`. */
const UNIQUE_VIOLATION = '23505';

function toFriendlyError(error: { code?: string; message: string }): Error {
  if (error.code === UNIQUE_VIOLATION) {
    return new Error('SKU này đã tồn tại, vui lòng dùng mã khác.');
  }
  return new Error(error.message);
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const { data, error } = await supabase.from('products').insert(input).select().single();

  if (error) throw toFriendlyError(error);
  return data;
}

export async function updateProduct({ id, patch }: UpdateProductInput): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw toFriendlyError(error);
  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) throw toFriendlyError(error);
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: async (product) => {
      toast.success(`Đã thêm sản phẩm "${product.name}".`);
      await queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: async (product) => {
      toast.success(`Đã lưu thay đổi cho "${product.name}".`);
      // Ghi thẳng dữ liệu vừa trả về vào cache chi tiết để form không nhấp nháy.
      queryClient.setQueryData(productKeys.detail(product.id), product);
      await queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

/**
 * Xoá sản phẩm. Chỉ admin thực hiện được — policy `products_delete_admin`
 * trong database sẽ từ chối nếu staff gọi tới.
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: async (_data, id) => {
      toast.success('Đã xoá sản phẩm.');
      queryClient.removeQueries({ queryKey: productKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
