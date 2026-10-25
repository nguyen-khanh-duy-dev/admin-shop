import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabase';
import type { TablesInsert, TablesUpdate } from '@/types';

import type { Customer } from '../types';
import { customerKeys } from './queries';

export type CreateCustomerInput = TablesInsert<'customers'>;
export type UpdateCustomerInput = { id: number; patch: TablesUpdate<'customers'> };

const UNIQUE_VIOLATION = '23505';
/** FK bị chặn bởi `on delete restrict` khi khách đã có đơn hàng. */
const FOREIGN_KEY_VIOLATION = '23503';

function toFriendlyError(error: { code?: string; message: string }): Error {
  if (error.code === UNIQUE_VIOLATION) {
    return new Error('Email này đã thuộc về một khách hàng khác.');
  }
  if (error.code === FOREIGN_KEY_VIOLATION) {
    return new Error('Không xoá được: khách hàng này đang có đơn hàng.');
  }
  return new Error(error.message);
}

export async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
  const { data, error } = await supabase.from('customers').insert(input).select().single();

  if (error) throw toFriendlyError(error);
  return data;
}

export async function updateCustomer({ id, patch }: UpdateCustomerInput): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw toFriendlyError(error);
  return data;
}

export async function deleteCustomer(id: number): Promise<void> {
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw toFriendlyError(error);
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: async (customer) => {
      toast.success(`Đã thêm khách hàng "${customer.full_name}".`);
      await queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCustomer,
    onSuccess: async (customer) => {
      toast.success(`Đã lưu thay đổi cho "${customer.full_name}".`);
      queryClient.setQueryData(customerKeys.detail(customer.id), customer);
      await queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

/** Xoá khách hàng — chỉ admin, theo policy `customers_delete_admin`. */
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: async (_data, id) => {
      toast.success('Đã xoá khách hàng.');
      queryClient.removeQueries({ queryKey: customerKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}
