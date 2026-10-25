import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabase';

import { ORDER_STATUS_LABELS, type Order, type OrderStatus } from '../types';
import { orderKeys } from './queries';

export type UpdateOrderInput = {
  id: number;
  patch: { status?: OrderStatus; note?: string | null };
};

export async function updateOrder({ id, patch }: UpdateOrderInput): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteOrder(id: number): Promise<void> {
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrder,
    onSuccess: async (order) => {
      toast.success(`Đơn ${order.code}: ${ORDER_STATUS_LABELS[order.status]}.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(order.id) }),
        queryClient.invalidateQueries({ queryKey: orderKeys.lists() }),
      ]);
    },
  });
}

/** Xoá đơn hàng — chỉ admin, theo policy `orders_delete_admin`. */
export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: async (_data, id) => {
      toast.success('Đã xoá đơn hàng.');
      queryClient.removeQueries({ queryKey: orderKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}
